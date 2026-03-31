"""
WSGI application entry point for Gunicorn
This file is used by Gunicorn to start the Flask application in production.
"""
import os
import sys
import logging

# Add the api directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Set production environment
os.environ.setdefault('FLASK_ENV', 'production')

# Setup logging before importing the app
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Import the Flask app
from index import app, socketio, initialize_database

logger.info("WSGI application initialized")

# Initialize database on startup
try:
    initialize_database()
    logger.info("Database initialization completed")
except Exception as e:
    logger.error(f"Initial database setup failed: {e}")
    logger.info("Database will be initialized on first request")

# Export for Gunicorn
application = socketio.WSGIApp(app)

if __name__ == "__main__":
    logger.warning("Running WSGI directly - use gunicorn instead in production")
    socketio.run(app, debug=False, host='0.0.0.0', port=5000)
