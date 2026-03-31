from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.shop import Shop
from models.order import Order, OrderItem
from models.models import Notification
from models.product import Product

order_bp = Blueprint('orders', __name__)

# ─── Create Order ─────────────────────────────────────────────────────────────
@order_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    order_items = data.get('orderItems', [])
    shop_id = data.get('shopId')
    total_amount = data.get('totalAmount')

    if not order_items:
        return jsonify({'message': 'No order items'}), 400

    order = Order(
        user_id=user_id,
        shop_id=int(shop_id),
        total_amount=float(total_amount),
        status='PENDING'
    )
    db.session.add(order)
    db.session.flush()  # Get order.id without commit

    for item in order_items:
        oi = OrderItem(
            order_id=order.id,
            product_id=item['productId'],
            quantity=item['quantity'],
            price=float(item['price'])
        )
        db.session.add(oi)

    # Notify shop owner
    shop = Shop.query.get(int(shop_id))
    if shop:
        notif = Notification(
            user_id=shop.owner_id,
            type='ORDER_PLACED',
            message=f'New order #{order.id} received for {shop.name}'
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify(order.to_dict()), 201

# ─── Get My Orders ────────────────────────────────────────────────────────────
@order_bp.route('/myorders', methods=['GET'])
@jwt_required()
def get_my_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

# ─── Get Shop Orders ──────────────────────────────────────────────────────────
@order_bp.route('/shop/<int:shop_id>', methods=['GET'])
@jwt_required()
def get_shop_orders(shop_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    shop = Shop.query.get(shop_id)

    if not shop:
        return jsonify({'message': 'Shop not found'}), 404
    if shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    orders = Order.query.filter_by(shop_id=shop_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

# ─── Get Order By ID ──────────────────────────────────────────────────────────
@order_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_by_id(order_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    order = Order.query.get(order_id)

    if not order:
        return jsonify({'message': 'Order not found'}), 404
    if user.role != 'ADMIN' and order.user_id != user_id:
        return jsonify({'message': 'Not authorized'}), 401

    return jsonify(order.to_dict()), 200

# ─── Update Order Status ──────────────────────────────────────────────────────
@order_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    order = Order.query.get(order_id)

    if not order:
        return jsonify({'message': 'Order not found'}), 404
    if order.shop.owner_id != user_id and user.role != 'ADMIN':
        return jsonify({'message': 'Not authorized'}), 401

    data = request.get_json()
    order.status = data.get('status', order.status)

    notif = Notification(
        user_id=order.user_id,
        type='ORDER_STATUS_CHANGED',
        message=f'Your order #{order.id} status has been updated to {order.status}'
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify(order.to_dict()), 200
