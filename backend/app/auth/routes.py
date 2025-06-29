from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, bcrypt, mail
from app.models.user import User, UserProfile, UserRole
from app.utils.validators import validate_email, validate_password
from app.utils.email import send_verification_email, send_password_reset_email
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Validate role
        try:
            role = UserRole(data['role'])
        except ValueError:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create user
        user = User(
            email=data['email'],
            role=role
        )
        user.set_password(data['password'])
        
        # Create user profile
        profile = UserProfile(
            user_id=user.id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            country=data.get('country'),
            state=data.get('state'),
            city=data.get('city')
        )
        
        # Add company info for employers
        if role == UserRole.EMPLOYER:
            profile.company_name = data.get('company_name')
            profile.company_website = data.get('company_website')
            profile.industry = data.get('industry')
        
        db.session.add(user)
        db.session.add(profile)
        db.session.commit()
        
        # Send verification email
        try:
            send_verification_email(user)
        except Exception as e:
            # Log error but don't fail registration
            print(f"Failed to send verification email: {e}")
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'profile': profile.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'profile': user.profile.to_dict() if user.profile else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verify user email"""
    try:
        # In a real implementation, you would decode the token
        # For now, we'll use a simple approach
        user = User.query.filter_by(email_verification_token=token).first()
        
        if not user:
            return jsonify({'error': 'Invalid verification token'}), 400
        
        user.is_verified = True
        user.email_verified_at = datetime.utcnow()
        user.email_verification_token = None
        db.session.commit()
        
        return jsonify({'message': 'Email verified successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        
        # Send reset email
        try:
            send_password_reset_email(user, reset_token)
        except Exception as e:
            return jsonify({'error': 'Failed to send reset email'}), 500
        
        return jsonify({'message': 'Password reset email sent'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    try:
        data = request.get_json()
        
        if not all(data.get(field) for field in ['token', 'password']):
            return jsonify({'error': 'Token and password are required'}), 400
        
        user = User.query.filter_by(password_reset_token=data['token']).first()
        
        if not user:
            return jsonify({'error': 'Invalid reset token'}), 400
        
        if user.password_reset_expires < datetime.utcnow():
            return jsonify({'error': 'Reset token has expired'}), 400
        
        # Validate new password
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Update password
        user.set_password(data['password'])
        user.password_reset_token = None
        user.password_reset_expires = None
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for authenticated user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not all(data.get(field) for field in ['current_password', 'new_password']):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        if not validate_password(data['new_password']):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should discard tokens)"""
    try:
        # In a real implementation, you might want to blacklist the token
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict(),
            'profile': user.profile.to_dict() if user.profile else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 