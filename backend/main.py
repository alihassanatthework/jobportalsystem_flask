import sys
print("Python executable:", sys.executable)
from flask import Flask
from flask_cors import CORS
import os
from datetime import timedelta
from dotenv import load_dotenv
from app import db, bcrypt, migrate, jwt, mail, socketio

# Load environment variables
load_dotenv()

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///job_portal.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    
    # Mail configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    # Redis configuration for Celery
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"], supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Import models to register them with SQLAlchemy
    from app.models import User, UserProfile, Job, JobCategory, Application, Message, Conversation, Notification, Wishlist, Feedback, UserAnalytics, JobAnalytics
    
    # Import and register blueprints
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    from app.jobs.routes import jobs_bp
    from app.applications.routes import applications_bp
    from app.messages.routes import messages_bp
    from app.admin.routes import admin_bp
    from app.analytics.routes import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Root route
    @app.route('/')
    def index():
        return {
            'message': 'HandmadeCareers API is running!',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'users': '/api/users',
                'jobs': '/api/jobs',
                'applications': '/api/applications',
                'messages': '/api/messages',
                'admin': '/api/admin',
                'analytics': '/api/analytics'
            },
            'frontend': 'http://localhost:5173'
        }
    
    # API info route
    @app.route('/api')
    def api_info():
        return {
            'message': 'HandmadeCareers API Endpoints',
            'version': '1.0.0',
            'endpoints': {
                'auth': {
                    'register': '/api/auth/register',
                    'login': '/api/auth/login',
                    'logout': '/api/auth/logout',
                    'refresh': '/api/auth/refresh'
                },
                'users': {
                    'profile': '/api/users/profile',
                    'update_profile': '/api/users/profile'
                },
                'jobs': {
                    'list': '/api/jobs',
                    'create': '/api/jobs',
                    'details': '/api/jobs/<id>'
                },
                'applications': {
                    'create': '/api/applications',
                    'details': '/api/applications/<id>'
                }
            },
            'frontend': 'http://localhost:5173'
        }
    
    # Test route
    @app.route('/api/test')
    def test_api():
        return {
            'message': 'API is working!',
            'status': 'success'
        }
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'message': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'message': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'message': 'Token is missing'}, 401
    
    return app

# Create app instance at module level for Flask CLI
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 