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
        "origins": ["*"],  # Simplified for Vercel, adjust as needed
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Register Blueprints
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

@app.route('/api')
def index_api():
    return {'message': 'CloudShop Flask API is running...'}

@app.route('/')
def root():
    return {'message': 'Flask API is active.'}

# For Vercel Serverless: Create tables upon first request or import
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, debug=True, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
