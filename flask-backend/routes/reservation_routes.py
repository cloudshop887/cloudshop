from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.models import Reservation, Notification
from models.product import Product
from models.shop import Shop
from models.user import User

reservation_bp = Blueprint('reservations', __name__)

def calculate_discount(original_price, quantity, shop):
    discount_pct = 0
    bulk_applied = False
    bulk_pct = 0

    if shop.is_reserve_pick_discount_enabled and shop.reserve_pick_discount_percentage:
        discount_pct = float(shop.reserve_pick_discount_percentage)
        if shop.bulk_discount_min_items and shop.bulk_discount_percentage and quantity >= shop.bulk_discount_min_items:
            bulk_applied = True
            bulk_pct = float(shop.bulk_discount_percentage)
            discount_pct += bulk_pct

    multiplier = (100 - discount_pct) / 100
    discounted = round(original_price * multiplier, 2)
    return discount_pct, discounted, bulk_applied, bulk_pct

# ─── Create Reservation ───────────────────────────────────────────────────────
@reservation_bp.route('', methods=['POST'])
@jwt_required()
def create_reservation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    product_id = data.get('productId')
    shop_id = data.get('shopId')
    quantity = int(data.get('quantity', 1))

    if not product_id or not shop_id:
        return jsonify({'message': 'Product ID and Shop ID are required'}), 400

    product = Product.query.get(int(product_id))
    shop = Shop.query.get(int(shop_id))

    if not product: return jsonify({'message': 'Product not found'}), 404
    if not shop: return jsonify({'message': 'Shop not found'}), 404
    if product.stock < quantity:
        return jsonify({'message': 'Insufficient stock for reservation'}), 400

    original_price = float(product.offer_price or product.price)
    discount_pct, discounted_price, bulk_applied, bulk_pct = calculate_discount(original_price, quantity, shop)

    res = Reservation(
        user_id=user_id,
        product_id=int(product_id),
        shop_id=int(shop_id),
        quantity=quantity,
        original_price=original_price,
        discount_percentage=discount_pct,
        discounted_price=discounted_price,
        bulk_discount_applied=bulk_applied,
        bulk_discount_percentage=bulk_pct,
        status='PENDING',
        notes=data.get('notes')
    )
    db.session.add(res)
    db.session.flush()

    notif = Notification(
        user_id=shop.owner_id,
        type='RESERVATION_PLACED',
        message=f'New reservation #{res.id} for {product.name} by a customer.'
    )
    db.session.add(notif)
    db.session.commit()

    result = res.to_dict()
    result['savingsAmount'] = round((original_price - discounted_price) * quantity, 2)
    return jsonify(result), 201

# ─── My Reservations ──────────────────────────────────────────────────────────
@reservation_bp.route('/my-reservations', methods=['GET'])
@jwt_required()
def get_my_reservations():
    user_id = int(get_jwt_identity())
    reservations = Reservation.query.filter_by(user_id=user_id).order_by(Reservation.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reservations]), 200

# ─── Shop Reservations ────────────────────────────────────────────────────────
@reservation_bp.route('/shop/<int:shop_id>', methods=['GET'])
@jwt_required()
def get_shop_reservations(shop_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    shop = Shop.query.get(shop_id)
    if not shop: return jsonify({'message': 'Shop not found'}), 404
    if shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    reservations = Reservation.query.filter_by(shop_id=shop_id).order_by(Reservation.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reservations]), 200

# ─── Update Reservation Status ────────────────────────────────────────────────
@reservation_bp.route('/<int:res_id>/status', methods=['PUT'])
@jwt_required()
def update_reservation_status(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    res = Reservation.query.get(res_id)
    if not res: return jsonify({'message': 'Reservation not found'}), 404

    shop = Shop.query.get(res.shop_id)
    if shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    data = request.get_json()
    status = data.get('status')
    if status not in ['CONFIRMED', 'CANCELLED', 'PICKED_UP']:
        return jsonify({'message': 'Invalid status'}), 400

    res.status = status
    notif = Notification(
        user_id=res.user_id,
        type='RESERVATION_STATUS_CHANGED',
        message=f'Your reservation #{res.id} for {res.product.name} is now {status}.'
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify(res.to_dict()), 200

# ─── Cancel Reservation ────────────────────────────────────────────────────────
@reservation_bp.route('/<int:res_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(res_id):
    user_id = int(get_jwt_identity())
    res = Reservation.query.get(res_id)
    if not res: return jsonify({'message': 'Reservation not found'}), 404
    if res.user_id != user_id: return jsonify({'message': 'Not authorized'}), 401
    if res.status == 'PICKED_UP':
        return jsonify({'message': 'Cannot cancel a picked-up reservation'}), 400
    res.status = 'CANCELLED'
    db.session.commit()
    return jsonify(res.to_dict()), 200

# ─── Preview Discount ─────────────────────────────────────────────────────────
@reservation_bp.route('/preview-discount', methods=['POST'])
@jwt_required()
def preview_discount():
    data = request.get_json()
    product = Product.query.get(int(data.get('productId')))
    shop = Shop.query.get(int(data.get('shopId')))
    quantity = int(data.get('quantity', 1))
    if not product or not shop:
        return jsonify({'message': 'Product or shop not found'}), 404

    original_price = float(product.offer_price or product.price)
    d_pct, d_price, bulk_applied, bulk_pct = calculate_discount(original_price, quantity, shop)

    return jsonify({
        'originalPrice': original_price,
        'discountPercentage': d_pct,
        'discountedPrice': d_price,
        'bulkDiscountApplied': bulk_applied,
        'bulkDiscountPercentage': bulk_pct,
        'totalOriginal': round(original_price * quantity, 2),
        'totalDiscounted': round(d_price * quantity, 2),
        'totalSavings': round((original_price - d_price) * quantity, 2),
        'isDiscountEnabled': shop.is_reserve_pick_discount_enabled or False
    }), 200
