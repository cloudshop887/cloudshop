from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=True)
    phone = db.Column(db.String(50), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=True)
    address = db.Column(db.Text, nullable=True)
    profile_pic = db.Column(db.Text, nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=True)
    role = db.Column(db.String(50), default='USER', nullable=False)
    reset_password_token = db.Column(db.String(255), nullable=True)
    reset_password_expire = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    shop = db.relationship('Shop', back_populates='owner', uselist=False)
    orders = db.relationship('Order', back_populates='user', lazy='dynamic')
    notifications = db.relationship('Notification', back_populates='user', lazy='dynamic')
    reservations = db.relationship('Reservation', back_populates='user', lazy='dynamic')
    lost_items = db.relationship('LostAndFound', back_populates='user', lazy='dynamic')
    alerts = db.relationship('Alert', back_populates='user', lazy='dynamic')

    def to_dict(self):
        return {
            '_id': self.id,
            'id': self.id,
            'fullName': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'profilePic': self.profile_pic,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
