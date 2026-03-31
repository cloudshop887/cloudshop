from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from database import db, init_db
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

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'cloudshop-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token doesn't expire (30d equivalent)

from flask_socketio import SocketIO

from database import db, init_db, socketio

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

@app.route('/api')
def index_api():
    return {'message': 'CloudShop API is active'}

@app.route('/')
def root():
    return {'status': 'API Running'}

# Lazy Init DB - only when requested to avoid cold-boot timeout
_db_initialized = False

@app.before_request
def setup_db():
    global _db_initialized
    if not _db_initialized:
        with app.app_context():
            init_db()
        _db_initialized = True

# For Vercel: Export the flask app
# No changes needed, still using 'app'

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, debug=True, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
