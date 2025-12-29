from flask import Blueprint, request, jsonify
from app.utils.auth_middleware import jwt_required
from app.services.supabase_client import get_supabase
from app.utils.security import verify_password, hash_password

account_bp = Blueprint("account", __name__, url_prefix="/api/account")


def password_policy_ok(pw: str) -> bool:
    if not pw or len(pw) < 8:
        return False
    has_number = any(ch.isdigit() for ch in pw)
    has_symbol = any(not ch.isalnum() for ch in pw)
    return has_number and has_symbol


@account_bp.route("/profile", methods=["GET"])
@jwt_required
def get_profile():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    resp = supabase.table("users").select("id, full_name, email").eq("id", user_id).limit(1).execute()
    if not resp.data:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({"success": True, "user": resp.data[0]}), 200


@account_bp.route("/name", methods=["POST"])
@jwt_required
def update_name():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    data = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()

    if len(full_name) < 2:
        return jsonify({"success": False, "message": "Please enter a valid name."}), 400

    supabase.table("users").update({"full_name": full_name}).eq("id", user_id).execute()
    return jsonify({"success": True, "message": "Name updated successfully."}), 200


@account_bp.route("/password", methods=["POST"])
@jwt_required
def update_password():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    data = request.get_json(silent=True) or {}
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""

    if not old_password or not new_password:
        return jsonify({"success": False, "message": "Please complete all fields."}), 400

    if not password_policy_ok(new_password):
        return jsonify({
            "success": False,
            "message": "Password must be 8+ chars and include a number + symbol."
        }), 400

    # Fetch current hash
    resp = supabase.table("users").select("password_hash").eq("id", user_id).limit(1).execute()
    if not resp.data:
        return jsonify({"success": False, "message": "User not found"}), 404

    current_hash = resp.data[0]["password_hash"]

    # Verify old password
    if not verify_password(old_password, current_hash):
        return jsonify({"success": False, "message": "Old password is incorrect."}), 401

    # Update to new hash
    new_hash = hash_password(new_password)
    supabase.table("users").update({"password_hash": new_hash}).eq("id", user_id).execute()

    return jsonify({"success": True, "message": "Password updated successfully."}), 200
