from flask import Blueprint, request, jsonify, g
from app.db import get_db
from app.middleware.auth import require_auth
from bson import ObjectId
from datetime import datetime, timezone
import re

sessions_bp = Blueprint('sessions', __name__)

def extract_fixed_code(explanation):
    """Pull code from the ## The fix section"""
    match = re.search(r'## The fix.*?```\w*\n(.*?)```', explanation, re.DOTALL)
    return match.group(1).strip() if match else ''

def infer_bug_type(explanation):
    """Simple keyword-based bug type detection"""
    lower = explanation.lower()
    if 'syntaxerror' in lower or 'syntax' in lower: return 'SyntaxError'
    if 'nameerror' in lower or 'undefined' in lower: return 'NameError'
    if 'typeerror' in lower or 'type' in lower: return 'TypeError'
    if 'indexerror' in lower or 'index' in lower: return 'IndexError'
    if 'logic' in lower or 'infinite loop' in lower: return 'LogicError'
    return 'GeneralError'

@sessions_bp.route('/api/sessions', methods=['POST'])
@require_auth
def create_session():
    data = request.get_json()
    db = get_db()
    session = {
        'user_id': g.user_id,
        'language': data.get('language', 'python'),
        'original_code': data.get('code', ''),
        'error_message': data.get('error_message', ''),
        'ai_explanation': data.get('explanation', ''),
        'fixed_code': extract_fixed_code(data.get('explanation', '')),
        'bug_type': infer_bug_type(data.get('explanation', '')),
        'difficulty': data.get('difficulty', 'Beginner'),
        'quiz': [],
        'quiz_score': None,
        'quiz_completed': False,
        'created_at': datetime.now(timezone.utc),
    }

    result = db.sessions.insert_one(session)
    return jsonify({'session_id': str(result.inserted_id)}), 201


@sessions_bp.route('/api/sessions/<session_id>/quiz', methods=['PATCH'])
@require_auth
def update_quiz(session_id):
    data = request.get_json()
    db = get_db()

    db.sessions.update_one(
        {'_id': ObjectId(session_id), 'user_id': g.user_id},
        {'$set': {
            'quiz': data.get('questions', []),
            'quiz_score': data.get('score'),
            'quiz_completed': True,
        }}
    )
    return jsonify({'updated': True})


@sessions_bp.route('/api/sessions', methods=['GET'])
@require_auth
def get_sessions():
    db = get_db()
    sessions = list(db.sessions.find(
        {'user_id': g.user_id},
        sort=[('created_at', -1)],
        limit=50
    ))
    for s in sessions:
        s['_id'] = str(s['_id'])
        if isinstance(s.get('created_at'), datetime):
            s['created_at'] = s['created_at'].isoformat()
    return jsonify({'sessions': sessions})
