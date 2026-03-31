from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.shop import Shop
from models.models import Announcement

admin_bp = Blueprint('admin', __name__)

def require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'ADMIN':
        return None, jsonify({'message': 'Not authorized'}), 403
    return user, None, None

# ─── Get Dashboard Stats ──────────────────────────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    from models.order import Order
    user, err, code = require_admin()
    if err: return err, code

    return jsonify({
        'totalUsers': User.query.count(),
        'totalShops': Shop.query.count(),
        'approvedShops': Shop.query.filter_by(is_approved=True).count(),
        'pendingShops': Shop.query.filter_by(is_approved=False).count(),
        'totalOrders': Order.query.count(),
    }), 200

# ─── Get All Announcements ────────────────────────────────────────────────────
@admin_bp.route('/announcements', methods=['GET'])
def get_announcements():
    role = request.args.get('role', 'ALL')
    query = Announcement.query
    if role and role != 'ALL':
        query = query.filter(
            db.or_(Announcement.role == role, Announcement.role == 'ALL')
        )
    return jsonify([a.to_dict() for a in query.order_by(Announcement.created_at.desc()).all()]), 200

# ─── Create Announcement ──────────────────────────────────────────────────────
@admin_bp.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    user, err, code = require_admin()
    if err: return err, code
    data = request.get_json()
    ann = Announcement(
        title=data.get('title'),
        message=data.get('message'),
        type=data.get('type', 'INFO'),
        role=data.get('role', 'ALL')
    )
    db.session.add(ann)
    db.session.commit()
    return jsonify(ann.to_dict()), 201

# ─── Delete Announcement ──────────────────────────────────────────────────────
@admin_bp.route('/announcements/<int:ann_id>', methods=['DELETE'])
@jwt_required()
def delete_announcement(ann_id):
    user, err, code = require_admin()
    if err: return err, code
    ann = Announcement.query.get(ann_id)
    if not ann: return jsonify({'message': 'Announcement not found'}), 404
    db.session.delete(ann)
    db.session.commit()
    return jsonify({'message': 'Announcement removed'}), 200
