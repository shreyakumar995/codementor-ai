from flask import Blueprint, jsonify, request

from app.services.groq_service import get_quiz_questions

quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.post("/api/quiz")
def generate_quiz():
    try:
        data = request.get_json() or {}
        explanation = data.get("explanation", "")
        if not explanation or not str(explanation).strip():
            return jsonify({"error": "Field 'explanation' is required"}), 400

        language = data.get("language", "python")
        bug_type = data.get("bug_type", "")

        result = get_quiz_questions(bug_type, language, explanation)
        return jsonify({"questions": result})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
