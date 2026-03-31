from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
import hashlib, os, secrets
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

def generate_token(user_id):
    return create_access_token(identity=str(user_id), expires_delta=False)

# ─── Register ────────────────────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    profile_pic = data.get('profilePic')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    existing = User.query.filter(
        (User.email == email) | (User.phone == phone)
    ).first() if phone else User.query.filter_by(email=email).first()

    if existing:
        return jsonify({'message': 'User already exists with this email or phone'}), 400

    hashed = generate_password_hash(password)
    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        password=hashed,
        profile_pic=profile_pic,
        role='USER'
    )
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Registration failed (Database Error)',
            'error': str(e)
        }), 500

    return jsonify({
        '_id': user.id,
        'fullName': user.full_name,
        'email': user.email,
        'profilePic': user.profile_pic,
        'role': user.role,
        'token': generate_token(user.id)
    }), 201

# ─── Login ────────────────────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    return jsonify({
        '_id': user.id,
        'fullName': user.full_name,
        'email': user.email,
        'profilePic': user.profile_pic,
        'role': user.role,
        'token': generate_token(user.id)
    }), 200

# ─── Get Profile ──────────────────────────────────────────────────────────────
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

# ─── Update Profile ───────────────────────────────────────────────────────────
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if data.get('fullName'):
        user.full_name = data['fullName']
    if data.get('email'):
        user.email = data['email']
    if data.get('phone'):
        user.phone = data['phone']
    if data.get('address') is not None:
        user.address = data['address']
    if 'profilePic' in data:
        user.profile_pic = data['profilePic']
    if data.get('password'):
        user.password = generate_password_hash(data['password'])

    db.session.commit()

    return jsonify({
        '_id': user.id,
        'fullName': user.full_name,
        'email': user.email,
        'phone': user.phone,
        'address': user.address,
        'profilePic': user.profile_pic,
        'role': user.role,
        'token': generate_token(user.id)
    }), 200

# ─── Forgot Password ──────────────────────────────────────────────────────────
@auth_bp.route('/forgotpassword', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    reset_token = secrets.token_hex(20)
    hashed_token = hashlib.sha256(reset_token.encode()).hexdigest()
    expire = datetime.utcnow() + timedelta(minutes=10)

    user.reset_password_token = hashed_token
    user.reset_password_expire = expire
    db.session.commit()

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/reset-password/{reset_token}"

    return jsonify({
        'success': True,
        'data': 'Password reset link generated.',
        'resetUrl': reset_url  # Always return for development
    }), 200

# ─── Reset Password ───────────────────────────────────────────────────────────
@auth_bp.route('/resetpassword/<resettoken>', methods=['PUT'])
def reset_password(resettoken):
    hashed_token = hashlib.sha256(resettoken.encode()).hexdigest()
    user = User.query.filter(
        User.reset_password_token == hashed_token,
        User.reset_password_expire > datetime.utcnow()
    ).first()

    if not user:
        return jsonify({'message': 'Invalid or expired reset token'}), 400

    data = request.get_json()
    user.password = generate_password_hash(data.get('password'))
    user.reset_password_token = None
    user.reset_password_expire = None
    db.session.commit()

    return jsonify({
        'success': True,
        'data': 'Password updated successfully',
        'token': generate_token(user.id)
    }), 200

# ─── Get All Users (Admin) ────────────────────────────────────────────────────
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403

    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

# ─── Delete User (Admin) ──────────────────────────────────────────────────────
@auth_bp.route('/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def delete_user(uid):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403

    user = User.query.get(uid)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User removed'}), 200

# ─── Update User Role (Admin) ─────────────────────────────────────────────────
@auth_bp.route('/users/<int:uid>', methods=['PUT'])
@jwt_required()
def update_user_role(uid):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403

    data = request.get_json()
    user = User.query.get(uid)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.role = data.get('role', user.role)
    db.session.commit()
    return jsonify(user.to_dict()), 200

# ─── Firebase Login (stub - returns error gracefully) ─────────────────────────
@auth_bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    """
    Firebase login - this endpoint handles Google/Phone Firebase tokens.
    For local dev with SQLite, we create/find user by email from Firebase token claims.
    """
    data = request.get_json()
    email = data.get('email')
    full_name = data.get('fullName') or data.get('name') or 'User'
    profile_pic = data.get('profilePic') or data.get('photoURL')
    firebase_uid = data.get('firebaseUid') or data.get('uid')

    if not email and not firebase_uid:
        return jsonify({'message': 'Firebase credentials required'}), 400

    # Find or create user
    user = None
    if firebase_uid:
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
    if not user and email:
        user = User.query.filter_by(email=email).first()
    
    try:
        if not user:
            user = User(
                full_name=full_name,
                email=email,
                firebase_uid=firebase_uid,
                password=generate_password_hash(secrets.token_hex(16)),
                profile_pic=profile_pic,
                role='USER'
            )
            db.session.add(user)
            db.session.commit()
        else:
            if firebase_uid and not user.firebase_uid:
                user.firebase_uid = firebase_uid
                db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Firebase login failed (Database Error)',
            'error': str(e)
        }), 500

    return jsonify({
        '_id': user.id,
        'fullName': user.full_name,
        'email': user.email,
        'profilePic': user.profile_pic,
        'role': user.role,
        'token': generate_token(user.id)
    }), 200
