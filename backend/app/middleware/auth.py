import json
import os
from functools import wraps
from urllib.request import urlopen

from flask import g, jsonify, request
from jose import jwt,jwk
from jose.exceptions import JWTError


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

_jwks = None


def _issuer():
    return f"https://{AUTH0_DOMAIN}/"


def get_jwks():
    global _jwks
    if _jwks is None:
        with urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json") as response:
            _jwks = json.load(response)
    return _jwks


def _get_rsa_key(token):
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        return None

    for key in get_jwks().get("keys", []):
        if key.get("kid") == unverified_header.get("kid"):
            return {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
    return None


def require_auth(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not AUTH0_DOMAIN or not AUTH0_AUDIENCE:
            return jsonify({"error": "Auth0 is not configured"}), 401

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid authorization header"}), 401

        token = parts[1]
        rsa_key = _get_rsa_key(token)
        if rsa_key is None:
            return jsonify({"error": "Unable to find appropriate key"}), 401

        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=AUTH0_AUDIENCE,
                issuer=_issuer(),
            )
        except JWTError as exc:
            return jsonify({"error": str(exc)}), 401

        g.current_user = payload
        g.user_id = payload["sub"]
        return view(*args, **kwargs)

    return wrapper
