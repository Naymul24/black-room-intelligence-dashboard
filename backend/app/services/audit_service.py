from app.services.supabase_client import get_supabase


def log_login_attempt(email: str, success: bool, ip: str | None, user_agent: str | None):
    supabase = get_supabase()

    supabase.table("login_audit").insert({
        "email_attempted": email,
        "success": success,
        "ip_address": ip,
        "user_agent": user_agent
    }).execute()
