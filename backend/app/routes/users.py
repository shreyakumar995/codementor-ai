from datetime import datetime, timezone

from bson import ObjectId
from flask import Blueprint, g, jsonify

from app.db import get_db
from app.middleware.auth import require_auth

users_bp = Blueprint("users", __name__)


def _serialize_user(doc):
    if not doc:
        return doc

    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized


@users_bp.get("/api/me")
@require_auth
def get_me():
    user = g.current_user
    now = datetime.now(timezone.utc)

    get_db().users.update_one(
        {"auth0_id": g.user_id},
        {
            "$set": {
                "email": user.get("email"),
                "name": user.get("name"),
                "avatar_url": user.get("picture"),
                "last_active": now,
            },
            "$setOnInsert": {
                "streak_count": 0,
                "preferred_language": "python",
                "created_at": now,
            },
        },
        upsert=True,
    )

    user_doc = get_db().users.find_one({"auth0_id": g.user_id})
    return jsonify(_serialize_user(user_doc))
