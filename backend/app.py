import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret")

    CORS(app, origins=["http://localhost:5173"])

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "CodeMentor AI backend is running"})

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
