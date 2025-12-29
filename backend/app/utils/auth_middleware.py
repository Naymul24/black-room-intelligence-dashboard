from functools import wraps
from flask import request, jsonify
from app.utils.jwt_utils import verify_token


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Authorization token missing"
            }), 401

        token = auth_header.replace("Bearer ", "").strip()
        payload = verify_token(token)

        if not payload:
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401

        # Attach user info to request context
        request.user = payload

        return fn(*args, **kwargs)

    return wrapper
