from flask import Blueprint, request, jsonify
from app.services.auth_service import authenticate_user
from app.utils.jwt_utils import generate_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Basic validation
    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    # Metadata for audit logging
    ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
    user_agent = request.headers.get("User-Agent")

    success, result = authenticate_user(
        email=email,
        password=password,
        ip=ip_address,
        user_agent=user_agent
    )

    # Authentication failed
    if not success:
        return jsonify({
            "success": False,
            "message": result
        }), 401

    # Authentication successful
    user = result
    token = generate_token(user)

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200
