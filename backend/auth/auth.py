# backend/auth/auth.py
from flask import jsonify, request, abort
from functools import wraps
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, create_access_token, get_jwt, JWTManager
import sqlite3
import os

bcrypt = Bcrypt()
jwt = JWTManager()
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'videos.db')

def init_jwt(app):
    jwt.init_app(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM revoked_tokens WHERE jti = ?", (jti,))
        result = cursor.fetchone()
        conn.close()
        return result is not None

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "The token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({"msg": "Missing authorization header"}), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "The token is not fresh"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "The token has been revoked"}), 401

def create_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def add_token_to_blacklist(jti):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO revoked_tokens (jti) VALUES (?)', (jti,))
    conn.commit()
    conn.close()

def verify_user(username, password):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
    row = cursor.fetchone()
    conn.close()
    if row and bcrypt.check_password_hash(row[0], password):
        return username
    return None

def check_passkey(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        passkey = request.headers.get('Passkey')
        if passkey == 'your_secret_passkey':
            return f(*args, **kwargs)
        else:
            abort(401)
    return wrapper
