from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from sqlalchemy import text
import os
import logging
import sys

from database import db, socketio, seed_admin
from routes.auth_routes import auth_bp
from routes.shop_routes import shop_bp
from routes.product_routes import product_bp
from routes.order_routes import order_bp
from routes.notification_routes import notification_bp
from routes.lost_found_routes import lost_found_bp
from routes.job_routes import job_bp
from routes.offer_routes import offer_bp
from routes.alert_routes import alert_bp
from routes.reservation_routes import reservation_bp
from routes.admin_routes import admin_bp
from routes.distance_routes import distance_bp

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ──────────────────────────────────────────────
# DATABASE CONFIGURATION
# ──────────────────────────────────────────────
db_url = os.getenv('DATABASE_URL')

if not db_url:
    logger.error("ERROR: DATABASE_URL environment variable is required")
    raise ValueError("DATABASE_URL environment variable is required")

# Fix: convert postgres:// → postgresql:// (required by SQLAlchemy)
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

# Fix: ensure SSL for Neon
if 'sslmode' not in db_url:
    separator = '&' if '?' in db_url else '?'
    db_url += f"{separator}sslmode=require"

is_production = os.getenv('FLASK_ENV') == 'production'

logger.info(f"Starting Flask app in {'PRODUCTION' if is_production else 'DEVELOPMENT'} mode")
logger.info(f"Database: Neon PostgreSQL (SSL enabled)")

# ──────────────────────────────────────────────
# APP CONFIGURATION
# ──────────────────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    # Fix: connection pool settings for Neon (serverless postgres)
    'pool_pre_ping': True,       # Test connection before using from pool
    'pool_recycle': 300,         # Recycle connections every 5 min
    'pool_size': 5,
    'max_overflow': 2,
    'connect_args': {
        'sslmode': 'require',
        'connect_timeout': 10,
    }
}
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'cloudshop-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = not is_production
app.config['JSON_SORT_KEYS'] = False

# ──────────────────────────────────────────────
# EXTENSIONS
# ──────────────────────────────────────────────
db.init_app(app)
jwt = JWTManager(app)

# Fix: use 'threading' consistently for dev; gunicorn handles production
socketio.init_app(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    engineio_logger=not is_production,
    socketio_logger=not is_production,
    ping_timeout=60,
    ping_interval=25,
)

# Fix: remove supports_credentials when origins is wildcard (they conflict)
# Allow local dev, the stable frontend, and any Vercel preview deployment.
extra_origins = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]
allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mrklocal.vercel.app',
    'https://mrklocal.onrender.com',
    r'https://.*\.vercel\.app',
    os.getenv('FRONTEND_URL', ''),
    *extra_origins,
]
allowed_origins = [origin for origin in allowed_origins if origin]

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins if allowed_origins else "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# ──────────────────────────────────────────────
# BLUEPRINTS
# ──────────────────────────────────────────────
app.register_blueprint(auth_bp,         url_prefix='/api/auth')
app.register_blueprint(shop_bp,         url_prefix='/api/shops')
app.register_blueprint(product_bp,      url_prefix='/api/products')
app.register_blueprint(order_bp,        url_prefix='/api/orders')
app.register_blueprint(notification_bp, url_prefix='/api/notifications')
app.register_blueprint(lost_found_bp,   url_prefix='/api/lost-found')
app.register_blueprint(job_bp,          url_prefix='/api/jobs')
app.register_blueprint(offer_bp,        url_prefix='/api/offers')
app.register_blueprint(alert_bp,        url_prefix='/api/alerts')
app.register_blueprint(reservation_bp,  url_prefix='/api/reservations')
app.register_blueprint(admin_bp,        url_prefix='/api/admin')
app.register_blueprint(distance_bp,     url_prefix='/api/distance')

# ──────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────
@app.route('/ping')
def ping():
    return "pong", 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint — also tests DB connection"""
    try:
        # Fix: use text() wrapper required by SQLAlchemy 2.x
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503

@app.route('/api/debug-ping')
def debug_ping():
    """Debug endpoint — shows sanitized DB host and env"""
    safe_db_url = app.config['SQLALCHEMY_DATABASE_URI']
    if '@' in safe_db_url:
        safe_db_url = safe_db_url.split('@')[-1]
    return jsonify({
        'status': 'OK',
        'database_host': safe_db_url,
        'environment': os.getenv('FLASK_ENV', 'development'),
        'db_initialized': _db_initialized,
        'db_errors': _db_init_errors or None,
    }), 200

@app.route('/api/check-admin', methods=['GET'])
def check_admin():
    """Check if admin user exists and recreate if needed"""
    try:
        from models.user import User
        admin = User.query.filter_by(email='admin@cloudshop.com').first()
        
        if admin:
            return jsonify({
                'status': 'OK',
                'admin_exists': True,
                'admin_id': admin.id,
                'admin_email': admin.email,
                'admin_role': admin.role,
                'message': 'Admin user found!'
            }), 200
        else:
            # Try to recreate admin
            logger.info("Admin not found, attempting to recreate...")
            recreated_admin = seed_admin()
            if recreated_admin:
                return jsonify({
                    'status': 'CREATED',
                    'admin_exists': True,
                    'admin_id': recreated_admin.id,
                    'admin_email': recreated_admin.email,
                    'admin_role': recreated_admin.role,
                    'message': 'Admin user was recreated!',
                    'credentials': {
                        'email': 'admin@cloudshop.com',
                        'password': 'Admin@123'
                    }
                }), 200
            else:
                return jsonify({
                    'status': 'ERROR',
                    'admin_exists': False,
                    'message': 'Failed to create admin user'
                }), 500
    except Exception as e:
        logger.error(f"Error checking admin: {str(e)}")
        return jsonify({
            'status': 'ERROR',
            'message': str(e)
        }), 500

# ──────────────────────────────────────────────
# ERROR HANDLERS
# ──────────────────────────────────────────────
@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    logger.error(f"Unhandled exception: {error_msg}\n{stack_trace}")
    return jsonify({
        "message": "Internal Server Error",
        "error": error_msg,
        "trace": stack_trace if os.getenv('DEBUG_TRACE') == 'true' else None
    }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"message": "Route not found"}), 404

# ──────────────────────────────────────────────
# DATABASE INITIALIZATION
# ──────────────────────────────────────────────
_db_initialized = False
_db_init_errors = []

def initialize_database():
    """Initialize DB tables and seed admin. Safe to call multiple times."""
    global _db_initialized, _db_init_errors
    if _db_initialized:
        return True
    try:
        with app.app_context():
            logger.info("Initializing database...")
            db.create_all()
            logger.info("Tables created successfully")
            seed_admin()
            logger.info("Admin seeding done")
            _db_initialized = True
            _db_init_errors = []
            return True
    except Exception as e:
        error_msg = f"Database initialization failed: {str(e)}"
        logger.error(error_msg)
        import traceback
        logger.error(traceback.format_exc())
        _db_init_errors.append(error_msg)
        try:
            db.session.rollback()
        except Exception:
            pass
        return False

@app.before_request
def setup_db():
    """Lazy DB init — only runs once on first request."""
    global _db_initialized
    if not _db_initialized:
        initialize_database()

# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = not is_production

    logger.info(f"Starting server on port {port} (debug={debug_mode})")

    # Initialize DB before accepting requests
    initialize_database()

    socketio.run(
        app,
        debug=debug_mode,
        host='0.0.0.0',
        port=port,
        allow_unsafe_werkzeug=True,
        log_output=True
    )
