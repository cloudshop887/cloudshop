import os
import logging
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from datetime import datetime

logger = logging.getLogger(__name__)

# Create SQLAlchemy instance with improved pooling for production
db = SQLAlchemy()

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*")

def init_db():
    """Create all tables and seed admin user if needed."""
    db.create_all()
    seed_admin()

def seed_admin():
    """Create default admin user if not exists."""
    try:
        from models.user import User
        from werkzeug.security import generate_password_hash
        
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@cloudshop.com').first()
        if admin:
            logger.info(f'✅ Admin user already exists: admin@cloudshop.com (ID: {admin.id})')
            return admin
        
        # Create new admin
        hashed_password = generate_password_hash('Admin@123')
        admin = User(
            full_name='Admin',
            email='admin@cloudshop.com',
            password=hashed_password,
            role='ADMIN'
        )
        db.session.add(admin)
        db.session.flush()  # Get the ID before commit
        
        db.session.commit()
        logger.info(f'✅ Default admin created: admin@cloudshop.com / Admin@123 (ID: {admin.id})')
        return admin
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to seed admin user: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        # Don't raise - continue anyway as this is not critical
        return None

