from datetime import datetime, timedelta, timezone

from flask import Blueprint, g, jsonify

from app.db import get_db
from app.middleware.auth import require_auth

progress_bp = Blueprint("progress", __name__)


@progress_bp.get("/api/progress")
@require_auth
def get_progress():
    db = get_db()
    user_filter = {"user_id": g.user_id}

    total_sessions = db.sessions.count_documents(user_filter)

    avg_pipeline = [
        {"$match": {**user_filter, "quiz_completed": True}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$quiz_score"}}},
    ]
    avg_result = list(db.sessions.aggregate(avg_pipeline))
    avg_quiz_score = avg_result[0]["avg_score"] if avg_result else 0

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    daily_pipeline = [
        {"$match": {**user_filter, "created_at": {"$gte": seven_days_ago}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"},
                },
                "bugs": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "date": "$_id", "bugs": 1}},
    ]
    daily = list(db.sessions.aggregate(daily_pipeline))

    bug_types_pipeline = [
        {"$match": user_filter},
        {"$group": {"_id": "$bug_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
        {
            "$project": {
                "_id": 0,
                "type": {"$ifNull": ["$_id", "Unknown"]},
                "count": 1,
            }
        },
    ]
    bug_types = list(db.sessions.aggregate(bug_types_pipeline))

    return jsonify(
        {
            "total_sessions": total_sessions,
            "avg_quiz_score": round(avg_quiz_score, 1) if avg_quiz_score else 0,
            "daily": daily,
            "bug_types": bug_types,
        }
    )
