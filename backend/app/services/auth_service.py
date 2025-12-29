from app.services.audit_service import log_login_attempt

from datetime import datetime, timezone, timedelta
from app.services.supabase_client import get_supabase
from app.utils.security import verify_password

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def authenticate_user(email: str, password: str, ip: str | None, user_agent: str | None):
    supabase = get_supabase()

    response = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    user = response.data[0] if response.data else None

    # Default: failed attempt
    success = False
    user_id = user["id"] if user else None

    # User not found
    if not user:
        log_login_attempt(email, False, ip, user_agent)
        return False, "Incorrect email or password"

    # Account disabled
    if not user["is_active"]:
        log_login_attempt(email, False, ip, user_agent)
        return False, "Account is disabled"

    # Lockout check
    if user["locked_until"]:
        locked_until = datetime.fromisoformat(user["locked_until"])
        if locked_until > datetime.now(timezone.utc):
            log_login_attempt(email, False, ip, user_agent)
            return False, "Account temporarily locked. Try again later"

    # Password check
    if not verify_password(password, user["password_hash"]):
        failed = user["failed_login_attempts"] + 1
        update = {"failed_login_attempts": failed}

        if failed >= MAX_FAILED_ATTEMPTS:
            update["locked_until"] = (
                datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
            ).isoformat()

        supabase.table("users").update(update).eq("id", user["id"]).execute()
        log_login_attempt(email, False, ip, user_agent)
        return False, "Incorrect email or password"

    # Success
    supabase.table("users").update({
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", user["id"]).execute()

    log_login_attempt(email, True, ip, user_agent)

    return True, user
