from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database import db
from models.models import LostAndFound
from models.user import User

lost_found_bp = Blueprint('lost_found', __name__)

@lost_found_bp.route('', methods=['GET'])
def get_lost_found():
    items = LostAndFound.query.order_by(LostAndFound.created_at.desc()).all()
    return jsonify([i.to_dict() for i in items]), 200

@lost_found_bp.route('', methods=['POST'])
@jwt_required()
def create_lost_found():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    item = LostAndFound(
        user_id=user_id,
        type=data.get('type'),
        title=data.get('title'),
        description=data.get('description'),
        location=data.get('location'),
        contact=data.get('contact'),
        image_url=data.get('imageUrl'),
        status='OPEN'
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@lost_found_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_lost_found(item_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    item = LostAndFound.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    if item.user_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    data = request.get_json()
    if 'status' in data: item.status = data['status']
    if 'title' in data: item.title = data['title']
    if 'description' in data: item.description = data['description']
    if 'location' in data: item.location = data['location']
    if 'contact' in data: item.contact = data['contact']
    db.session.commit()
    return jsonify(item.to_dict()), 200

@lost_found_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_lost_found(item_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    item = LostAndFound.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    if item.user_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removed'}), 200
