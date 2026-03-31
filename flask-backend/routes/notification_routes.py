from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.models import Notification

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifs]), 200

@notification_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        return jsonify({'message': 'Notification not found'}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify(notif.to_dict()), 200

@notification_bp.route('/read/all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
