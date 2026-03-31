from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.models import Offer
from models.shop import Shop
from models.user import User
from datetime import datetime

offer_bp = Blueprint('offers', __name__)

@offer_bp.route('', methods=['GET'])
def get_offers():
    offers = Offer.query.filter_by(is_active=True).order_by(Offer.created_at.desc()).all()
    return jsonify([o.to_dict() for o in offers]), 200

@offer_bp.route('', methods=['POST'])
@jwt_required()
def create_offer():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    shop = Shop.query.filter_by(owner_id=user_id).first()
    if not shop:
        return jsonify({'message': 'No shop found'}), 404
    expiry = None
    if data.get('expiryDate'):
        try:
            expiry = datetime.fromisoformat(data['expiryDate'])
        except Exception:
            pass
    offer = Offer(
        shop_id=shop.id,
        title=data.get('title'),
        description=data.get('description'),
        discount=data.get('discount'),
        code=data.get('code'),
        expiry_date=expiry,
        image_url=data.get('imageUrl')
    )
    db.session.add(offer)
    db.session.commit()
    return jsonify(offer.to_dict()), 201

@offer_bp.route('/<int:offer_id>', methods=['PUT'])
@jwt_required()
def update_offer(offer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'message': 'Offer not found'}), 404
    if offer.shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    data = request.get_json()
    for field in ['title', 'description', 'discount', 'code']:
        if field in data: setattr(offer, field, data[field])
    if 'imageUrl' in data: offer.image_url = data['imageUrl']
    if 'isActive' in data: offer.is_active = bool(data['isActive'])
    db.session.commit()
    return jsonify(offer.to_dict()), 200

@offer_bp.route('/<int:offer_id>', methods=['DELETE'])
@jwt_required()
def delete_offer(offer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'message': 'Offer not found'}), 404
    if offer.shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401
    db.session.delete(offer)
    db.session.commit()
    return jsonify({'message': 'Offer removed'}), 200
