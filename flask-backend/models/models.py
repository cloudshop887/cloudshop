from database import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    user = db.relationship('User', back_populates='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'message': self.message,
            'isRead': self.is_read,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class LostAndFound(db.Model):
    __tablename__ = 'lost_and_found'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # LOST or FOUND
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    contact = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='OPEN')  # OPEN or RESOLVED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = db.relationship('User', back_populates='lost_items')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'contact': self.contact,
            'imageUrl': self.image_url,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'user': {'fullName': self.user.full_name if self.user else None}
        }


class JobVacancy(db.Model):
    __tablename__ = 'job_vacancies'

    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String(100), nullable=True)
    job_type = db.Column(db.String(50), nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    shop = db.relationship('Shop', back_populates='job_vacancies')

    def to_dict(self):
        return {
            'id': self.id,
            'shopId': self.shop_id,
            'title': self.title,
            'description': self.description,
            'salary': self.salary,
            'jobType': self.job_type,
            'requirements': self.requirements,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'shop': {'name': self.shop.name if self.shop else None}
        }


class Offer(db.Model):
    __tablename__ = 'offers'

    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    discount = db.Column(db.String(100), nullable=True)
    code = db.Column(db.String(100), nullable=True)
    expiry_date = db.Column(db.DateTime, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    shop = db.relationship('Shop', back_populates='offers')

    def to_dict(self):
        return {
            'id': self.id,
            'shopId': self.shop_id,
            'title': self.title,
            'description': self.description,
            'discount': self.discount,
            'code': self.code,
            'expiryDate': self.expiry_date.isoformat() if self.expiry_date else None,
            'imageUrl': self.image_url,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'shop': {'name': self.shop.name if self.shop else None, 'id': self.shop_id}
        }


class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    anonymous = db.Column(db.Boolean, default=False)
    ip_address = db.Column(db.String(100), nullable=False, default='')
    verified = db.Column(db.Boolean, default=False)

    # Relations
    user = db.relationship('User', back_populates='alerts')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'imageUrl': self.image_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'userId': self.user_id,
            'anonymous': self.anonymous,
            'verified': self.verified
        }


class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='INFO')
    role = db.Column(db.String(50), default='ALL')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Reservation(db.Model):
    __tablename__ = 'reservations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    original_price = db.Column(db.Float, nullable=False)
    discount_percentage = db.Column(db.Float, default=0)
    discounted_price = db.Column(db.Float, nullable=False)
    bulk_discount_applied = db.Column(db.Boolean, default=False)
    bulk_discount_percentage = db.Column(db.Float, default=0)
    status = db.Column(db.String(50), default='PENDING')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = db.relationship('User', back_populates='reservations')
    product = db.relationship('Product', back_populates='reservations')
    shop = db.relationship('Shop', back_populates='reservations')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'shopId': self.shop_id,
            'quantity': self.quantity,
            'originalPrice': float(self.original_price) if self.original_price else 0,
            'discountPercentage': float(self.discount_percentage) if self.discount_percentage else 0,
            'discountedPrice': float(self.discounted_price) if self.discounted_price else 0,
            'bulkDiscountApplied': self.bulk_discount_applied,
            'bulkDiscountPercentage': float(self.bulk_discount_percentage) if self.bulk_discount_percentage else 0,
            'status': self.status,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'product': {
                'name': self.product.name if self.product else None,
                'imageUrl': self.product.image_url if self.product else None,
                'category': self.product.category if self.product else None,
                'price': float(self.product.price) if self.product else None,
            }
        }


class OTP(db.Model):
    __tablename__ = 'otps'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(50), nullable=False)
    otp_hash = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    attempts = db.Column(db.Integer, default=0)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
