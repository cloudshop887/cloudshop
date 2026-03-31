from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

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

app = Flask(__name__)

# Configuration
db_url = os.getenv('DATABASE_URL', 'sqlite:///cloudshop.db')
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

# Ensure SSL for Neon/Postgres if not sqlite
if 'sqlite' not in db_url and 'sslmode' not in db_url:
    separator = '&' if '?' in db_url else '?'
    db_url += f"{separator}sslmode=require"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'cloudshop-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token doesn't expire (30d equivalent)

# Duplicate socketio removed (line 6)
# Duplicate imports removed

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Initialize SocketIO
socketio.init_app(app)

# CORS - allow frontend and any vercel previews
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Wildcard for development/vercel ease
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Register Blueprints twice to handle both /api and root situations in serverless
for prefix in ['/api', '']:
    app.register_blueprint(auth_bp, url_prefix=f'{prefix}/auth')
    app.register_blueprint(shop_bp, url_prefix=f'{prefix}/shops')
    app.register_blueprint(product_bp, url_prefix=f'{prefix}/products')
    app.register_blueprint(order_bp, url_prefix=f'{prefix}/orders')
    app.register_blueprint(notification_bp, url_prefix=f'{prefix}/notifications')
    app.register_blueprint(lost_found_bp, url_prefix=f'{prefix}/lost-found')
    app.register_blueprint(job_bp, url_prefix=f'{prefix}/jobs')
    app.register_blueprint(offer_bp, url_prefix=f'{prefix}/offers')
    app.register_blueprint(alert_bp, url_prefix=f'{prefix}/alerts')
    app.register_blueprint(reservation_bp, url_prefix=f'{prefix}/reservations')
    app.register_blueprint(admin_bp, url_prefix=f'{prefix}/admin')
    app.register_blueprint(distance_bp, url_prefix=f'{prefix}/distance')

@app.route('/api/debug-ping')
def debug_ping():
    return {'status': 'OK', 'db_url': app.config['SQLALCHEMY_DATABASE_URI'].split('@')[-1]} # only show safe part

@app.errorhandler(Exception)
def handle_exception(e):
    # Pass through HTTP errors
    import traceback
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    print(f"ERROR: {error_msg}")
    print(stack_trace)
    return jsonify({
        "message": "Internal Server Error during registration/request",
        "error": error_msg,
        "trace": stack_trace if os.getenv('DEBUG_TRACE') == 'true' else None
    }), 500

# Lazy Init DB - only when requested to avoid cold-boot timeout
_db_initialized = False

@app.before_request
def setup_db():
    global _db_initialized
    if not _db_initialized:
        try:
            # We wrap this in try-catch because DB connection might be slow on first boot
            with app.app_context():
                db.create_all()
                # seed_admin already imported at top level
                seed_admin()
            _db_initialized = True
        except Exception as e:
            db.session.rollback()
            print(f"DATABASE INIT FAILED (Rolling back): {str(e)}")
            import traceback
            traceback.print_exc()
            # We don't set _db_initialized=True so we can try again on next req

# For Vercel: Export the flask app
# No changes needed, still using 'app'

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, debug=True, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
