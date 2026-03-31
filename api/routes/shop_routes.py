from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database import db
from models.user import User
from models.shop import Shop
from datetime import datetime
import math

shop_bp = Blueprint('shops', __name__)

def get_optional_user():
    """Try to get user from JWT, return None if not authenticated."""
    try:
        verify_jwt_in_request(optional=True)
        from flask_jwt_extended import get_jwt_identity
        uid = get_jwt_identity()
        if uid:
            return User.query.get(int(uid))
    except Exception:
        pass
    return None

def is_shop_open(open_time, close_time):
    if not open_time or not close_time:
        return None
    now = datetime.now()
    current_minutes = now.hour * 60 + now.minute
    oh, om = map(int, open_time.split(':'))
    ch, cm = map(int, close_time.split(':'))
    return oh * 60 + om <= current_minutes <= ch * 60 + cm

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

# ─── Register Shop ────────────────────────────────────────────────────────────
@shop_bp.route('', methods=['POST'])
@jwt_required()
def register_shop():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    existing = Shop.query.filter_by(owner_id=user_id).first()
    if existing:
        return jsonify({'message': 'You already own a shop'}), 400

    shop = Shop(
        name=data.get('name'),
        description=data.get('description'),
        address=data.get('address'),
        latitude=float(data['latitude']) if data.get('latitude') else None,
        longitude=float(data['longitude']) if data.get('longitude') else None,
        category=data.get('category'),
        opening_hours=data.get('openingHours'),
        open_time=data.get('openTime'),
        close_time=data.get('closeTime'),
        logo_url=data.get('logoUrl'),
        banner_url=data.get('bannerUrl'),
        owner_id=user_id,
        is_approved=False,
        is_active=True
    )
    db.session.add(shop)
    db.session.commit()

    return jsonify({**shop.to_dict(), 'shop': shop.to_dict(), 'user': user.to_dict()}), 201

# ─── Get All Shops ────────────────────────────────────────────────────────────
@shop_bp.route('', methods=['GET'])
def get_shops():
    current_user = get_optional_user()
    keyword = request.args.get('keyword', '')
    category = request.args.get('category', '')

    query = Shop.query.filter_by(is_approved=True, is_active=True)

    if current_user:
        query = query.filter(Shop.owner_id != current_user.id)

    if category and category != 'All':
        query = query.filter_by(category=category)

    if keyword:
        like = f'%{keyword}%'
        query = query.filter(
            db.or_(
                Shop.name.ilike(like),
                Shop.description.ilike(like),
                Shop.address.ilike(like),
                Shop.category.ilike(like)
            )
        )

    shops = query.order_by(Shop.name).all()
    return jsonify([{**s.to_dict(), 'isOpen': is_shop_open(s.open_time, s.close_time)} for s in shops]), 200

# ─── Nearby Shops ─────────────────────────────────────────────────────────────
@shop_bp.route('/nearby', methods=['GET'])
def get_nearby_shops():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    radius = float(request.args.get('radius', 5))
    category = request.args.get('category', '')

    if not lat or not lng:
        return jsonify({'message': 'Latitude and Longitude are required'}), 400

    lat, lng = float(lat), float(lng)
    query = Shop.query.filter_by(is_active=True, is_approved=True)
    if category and category != 'All':
        query = query.filter_by(category=category)

    shops = query.all()
    result = []
    for s in shops:
        if s.latitude and s.longitude:
            dist = round(calculate_distance(lat, lng, s.latitude, s.longitude), 2)
            if dist <= radius:
                d = s.to_dict()
                d['distance'] = dist
                d['isOpen'] = is_shop_open(s.open_time, s.close_time)
                result.append(d)

    result.sort(key=lambda x: x['distance'])
    return jsonify(result), 200

# ─── Admin All Shops ──────────────────────────────────────────────────────────
@shop_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_shops_admin():
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403

    shops = Shop.query.order_by(Shop.created_at.desc()).all()
    return jsonify([s.to_dict() for s in shops]), 200

# ─── My Shop ──────────────────────────────────────────────────────────────────
@shop_bp.route('/my-shop', methods=['GET'])
@jwt_required()
def get_my_shop():
    user_id = int(get_jwt_identity())
    shop = Shop.query.filter_by(owner_id=user_id).first()
    if not shop:
        return jsonify({'message': 'Shop not found'}), 404
    return jsonify(shop.to_dict(include_products=True)), 200

# ─── Get Shop By ID ───────────────────────────────────────────────────────────
@shop_bp.route('/<int:shop_id>', methods=['GET'])
def get_shop_by_id(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'message': 'Shop not found'}), 404
    return jsonify(shop.to_dict(include_products=True)), 200

# ─── Update Shop ──────────────────────────────────────────────────────────────
@shop_bp.route('/<int:shop_id>', methods=['PUT'])
@jwt_required()
def update_shop(shop_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    shop = Shop.query.get(shop_id)

    if not shop:
        return jsonify({'message': 'Shop not found'}), 404
    if shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    data = request.get_json()
    fields = {
        'name': 'name', 'description': 'description', 'address': 'address',
        'category': 'category', 'openTime': 'open_time', 'closeTime': 'close_time',
        'bannerUrl': 'banner_url', 'logoUrl': 'logo_url',
        'isPickupEnabled': 'is_pickup_enabled', 'isDeliveryEnabled': 'is_delivery_enabled',
        'isReservePickDiscountEnabled': 'is_reserve_pick_discount_enabled',
        'openingHours': 'opening_hours',
    }
    for json_key, model_attr in fields.items():
        if json_key in data:
            setattr(shop, model_attr, data[json_key])

    if 'latitude' in data and data['latitude'] is not None:
        shop.latitude = float(data['latitude'])
    if 'longitude' in data and data['longitude'] is not None:
        shop.longitude = float(data['longitude'])
    if 'reservePickDiscountPercentage' in data:
        shop.reserve_pick_discount_percentage = float(data['reservePickDiscountPercentage']) if data['reservePickDiscountPercentage'] is not None else None
    if 'bulkDiscountMinItems' in data:
        shop.bulk_discount_min_items = int(data['bulkDiscountMinItems']) if data['bulkDiscountMinItems'] is not None else None
    if 'bulkDiscountPercentage' in data:
        shop.bulk_discount_percentage = float(data['bulkDiscountPercentage']) if data['bulkDiscountPercentage'] is not None else None

    db.session.commit()
    return jsonify(shop.to_dict()), 200

# ─── Approve Shop ─────────────────────────────────────────────────────────────
@shop_bp.route('/<int:shop_id>/approve', methods=['PUT'])
@jwt_required()
def approve_shop(shop_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 403

    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'message': 'Shop not found'}), 404

    shop.is_approved = True
    shop.is_active = True

    owner = User.query.get(shop.owner_id)
    if owner and owner.role == 'USER':
        owner.role = 'SHOP_OWNER'

    db.session.commit()
    return jsonify(shop.to_dict()), 200

# ─── Update Discount Settings ─────────────────────────────────────────────────
@shop_bp.route('/<int:shop_id>/discount-settings', methods=['PUT'])
@jwt_required()
def update_discount_settings(shop_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    shop = Shop.query.get(shop_id)

    if not shop:
        return jsonify({'message': 'Shop not found'}), 404
    if shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    data = request.get_json()
    if 'isReservePickDiscountEnabled' in data:
        shop.is_reserve_pick_discount_enabled = bool(data['isReservePickDiscountEnabled'])
    if 'reservePickDiscountPercentage' in data:
        shop.reserve_pick_discount_percentage = float(data['reservePickDiscountPercentage']) if data['reservePickDiscountPercentage'] is not None else None
    if 'bulkDiscountMinItems' in data:
        shop.bulk_discount_min_items = int(data['bulkDiscountMinItems']) if data['bulkDiscountMinItems'] is not None else None
    if 'bulkDiscountPercentage' in data:
        shop.bulk_discount_percentage = float(data['bulkDiscountPercentage']) if data['bulkDiscountPercentage'] is not None else None

    db.session.commit()
    return jsonify(shop.to_dict()), 200
