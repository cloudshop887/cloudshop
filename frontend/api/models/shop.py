from database import db
from datetime import datetime

class Shop(db.Model):
    __tablename__ = 'shops'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    category = db.Column(db.String(100), nullable=False)
    logo_url = db.Column(db.Text, nullable=True)
    banner_url = db.Column(db.Text, nullable=True)
    opening_hours = db.Column(db.String(255), nullable=True)
    open_time = db.Column(db.String(10), nullable=True)
    close_time = db.Column(db.String(10), nullable=True)
    is_approved = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    is_pickup_enabled = db.Column(db.Boolean, default=True)
    is_delivery_enabled = db.Column(db.Boolean, default=True)
    is_reserve_pick_discount_enabled = db.Column(db.Boolean, default=False)
    reserve_pick_discount_percentage = db.Column(db.Float, nullable=True)
    bulk_discount_min_items = db.Column(db.Integer, nullable=True)
    bulk_discount_percentage = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    owner = db.relationship('User', back_populates='shop')
    products = db.relationship('Product', back_populates='shop', lazy='dynamic')
    orders = db.relationship('Order', back_populates='shop', lazy='dynamic')
    offers = db.relationship('Offer', back_populates='shop', lazy='dynamic')
    job_vacancies = db.relationship('JobVacancy', back_populates='shop', lazy='dynamic')
    reservations = db.relationship('Reservation', back_populates='shop', lazy='dynamic')

    def is_open(self):
        if not self.open_time or not self.close_time:
            return None
        from datetime import datetime as dt
        now = dt.now()
        current_minutes = now.hour * 60 + now.minute
        oh, om = map(int, self.open_time.split(':'))
        ch, cm = map(int, self.close_time.split(':'))
        open_minutes = oh * 60 + om
        close_minutes = ch * 60 + cm
        return open_minutes <= current_minutes <= close_minutes

    def to_dict(self, include_products=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'category': self.category,
            'logoUrl': self.logo_url,
            'bannerUrl': self.banner_url,
            'openingHours': self.opening_hours,
            'openTime': self.open_time,
            'closeTime': self.close_time,
            'isApproved': self.is_approved,
            'isActive': self.is_active,
            'ownerId': self.owner_id,
            'isPickupEnabled': self.is_pickup_enabled,
            'isDeliveryEnabled': self.is_delivery_enabled,
            'isReservePickDiscountEnabled': self.is_reserve_pick_discount_enabled,
            'reservePickDiscountPercentage': self.reserve_pick_discount_percentage,
            'bulkDiscountMinItems': self.bulk_discount_min_items,
            'bulkDiscountPercentage': self.bulk_discount_percentage,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'isOpen': self.is_open(),
            'owner': {'fullName': self.owner.full_name, 'email': self.owner.email} if self.owner else None
        }
        if include_products:
            data['products'] = [p.to_dict() for p in self.products]
        return data
