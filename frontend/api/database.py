from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from datetime import datetime

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")

def init_db():
    """Create all tables and seed admin user if needed."""
    db.create_all()
    seed_admin()

def seed_admin():
    """Create default admin user if not exists."""
    from models.user import User
    from werkzeug.security import generate_password_hash
    
    admin = User.query.filter_by(email='admin@cloudshop.com').first()
    if not admin:
        admin = User(
            full_name='Admin',
            email='admin@cloudshop.com',
            password=generate_password_hash('Admin@123'),
            role='ADMIN'
        )
        db.session.add(admin)
        db.session.commit()
        print('[OK] Default admin created: admin@cloudshop.com / Admin@123')
