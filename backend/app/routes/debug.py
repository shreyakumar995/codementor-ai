from flask import Blueprint, jsonify, request

from app.services.groq_service import get_code_explanation

debug_bp = Blueprint("debug", __name__)


@debug_bp.post("/api/debug")
def debug_code():
    try:
        data = request.get_json() or {}
        code = data.get("code", "")
        if not code or not str(code).strip():
            return jsonify({"error": "Field 'code' is required"}), 400

        language = data.get("language", "python")
        error_message = data.get("error_message", "")

        result = get_code_explanation(code, language, error_message)
        return jsonify({"explanation": result})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
