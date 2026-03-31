from database import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    offer_price = db.Column(db.Float, nullable=True)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=False)
    subcategory = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    shop = db.relationship('Shop', back_populates='products')
    order_items = db.relationship('OrderItem', back_populates='product', lazy='dynamic')
    reservations = db.relationship('Reservation', back_populates='product', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'offerPrice': float(self.offer_price) if self.offer_price else None,
            'stock': self.stock,
            'imageUrl': self.image_url,
            'category': self.category,
            'subcategory': self.subcategory,
            'isActive': self.is_active,
            'views': self.views,
            'shopId': self.shop_id,
            'shopName': self.shop.name if self.shop else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
