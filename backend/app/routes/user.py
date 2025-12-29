from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import jwt_required

user_bp = Blueprint("user", __name__, url_prefix="/api")


@user_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    user = request.user

    return jsonify({
        "success": True,
        "user": {
            "id": user["sub"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200
