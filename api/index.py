from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
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

# Setup logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
db_url = os.getenv('DATABASE_URL', 'sqlite:///cloudshop.db')
is_production = os.getenv('FLASK_ENV') == 'production'

if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

# Ensure SSL for Neon/Postgres if not sqlite
if 'sqlite' not in db_url and 'sslmode' not in db_url:
    separator = '&' if '?' in db_url else '?'
    db_url += f"{separator}sslmode=require"

logger.info(f"Starting Flask app in {'PRODUCTION' if is_production else 'DEVELOPMENT'} mode")
logger.info(f"Database: {db_url.split('@')[-1] if '@' in db_url else db_url[:50]}")

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'cloudshop-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token doesn't expire (30d equivalent)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = not is_production
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Initialize SocketIO with production settings
socketio.init_app(
    app,
    cors_allowed_origins="*",
    async_mode='threading' if not is_production else 'gevent_uwsgi',
    engineio_logger=not is_production,
    socketio_logger=not is_production
)

# CORS - allow frontend and any vercel previews
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Wildcard for development/vercel ease
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Register Blueprints - single registration for /api prefix
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(shop_bp, url_prefix='/api/shops')
app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(order_bp, url_prefix='/api/orders')
app.register_blueprint(notification_bp, url_prefix='/api/notifications')
app.register_blueprint(lost_found_bp, url_prefix='/api/lost-found')
app.register_blueprint(job_bp, url_prefix='/api/jobs')
app.register_blueprint(offer_bp, url_prefix='/api/offers')
app.register_blueprint(alert_bp, url_prefix='/api/alerts')
app.register_blueprint(reservation_bp, url_prefix='/api/reservations')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(distance_bp, url_prefix='/api/distance')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503

@app.route('/api/debug-ping')
def debug_ping():
    """Debug endpoint to check configuration"""
    safe_db_url = app.config['SQLALCHEMY_DATABASE_URI']
    if '@' in safe_db_url:
        safe_db_url = safe_db_url.split('@')[-1]
    return jsonify({
        'status': 'OK',
        'database': safe_db_url,
        'environment': os.getenv('FLASK_ENV', 'development'),
        'initialized': _db_initialized
    }), 200

@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler"""
    import traceback
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    logger.error(f"ERROR: {error_msg}\n{stack_trace}")
    return jsonify({
        "message": "Internal Server Error",
        "error": error_msg,
        "trace": stack_trace if os.getenv('DEBUG_TRACE') == 'true' else None
    }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({"message": "Route not found"}), 404

# Lazy Init DB - only when requested to avoid cold-boot timeout
_db_initialized = False
_db_init_errors = []

def initialize_database():
    """Initialize the database with proper error handling"""
    global _db_initialized, _db_init_errors
    try:
        with app.app_context():
            logger.info("Attempting database initialization...")
            db.create_all()
            logger.info("Database tables created successfully")
            
            # Seed admin user
            seed_admin()
            logger.info("Admin user seeding completed")
            
            _db_initialized = True
            _db_init_errors = []
            return True
    except Exception as e:
        error_msg = f"Database initialization failed: {str(e)}"
        logger.error(error_msg)
        import traceback
        logger.error(traceback.format_exc())
        _db_init_errors.append(error_msg)
        db.session.rollback()
        return False

@app.before_request
def setup_db():
    """Initialize database on first request"""
    global _db_initialized
    if not _db_initialized:
        initialize_database()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    logger.info(f"Starting server on port {port} (debug={debug_mode})")
    
    # Initialize DB on startup
    initialize_database()
    
    # Use socketio.run for development, but gunicorn will handle production
    socketio.run(
        app,
        debug=debug_mode,
        host='0.0.0.0',
        port=port,
        allow_unsafe_werkzeug=True,
        log_output=True
    )

