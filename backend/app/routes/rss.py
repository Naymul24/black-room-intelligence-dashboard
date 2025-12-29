from flask import Blueprint, request, jsonify
from app.utils.auth_middleware import jwt_required
from app.services.supabase_client import get_supabase

rss_bp = Blueprint("rss", __name__, url_prefix="/api/rss-feeds")


@rss_bp.route("", methods=["GET"])
@jwt_required
def get_feeds():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    resp = (
        supabase
        .table("user_rss_feeds")
        .select("feed_url")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )

    feeds = [row["feed_url"] for row in (resp.data or [])]
    return jsonify({"success": True, "feeds": feeds}), 200


@rss_bp.route("", methods=["POST"])
@jwt_required
def add_feed():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    data = request.get_json(silent=True) or {}
    feed_url = (data.get("url") or "").strip()

    if not feed_url:
        return jsonify({"success": False, "message": "Invalid RSS URL"}), 400

    supabase.table("user_rss_feeds").insert({
        "user_id": user_id,
        "feed_url": feed_url
    }).execute()

    return jsonify({"success": True}), 200


@rss_bp.route("", methods=["DELETE"])
@jwt_required
def remove_feed():
    supabase = get_supabase()
    user_id = request.user.get("sub")

    data = request.get_json(silent=True) or {}
    feed_url = (data.get("url") or "").strip()

    if not feed_url:
        return jsonify({"success": False, "message": "Invalid RSS URL"}), 400

    supabase.table("user_rss_feeds") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("feed_url", feed_url) \
        .execute()

    return jsonify({"success": True}), 200
