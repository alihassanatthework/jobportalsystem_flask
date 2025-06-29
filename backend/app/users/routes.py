from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserProfile, UserRole
from app.utils.validators import validate_email, validate_phone, validate_url, sanitize_input
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
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

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user profile
        if user.profile:
            profile = user.profile
        else:
            profile = UserProfile(user_id=user.id)
            db.session.add(profile)
        
        # Update basic information
        if data.get('first_name'):
            profile.first_name = sanitize_input(data['first_name'])
        if data.get('last_name'):
            profile.last_name = sanitize_input(data['last_name'])
        if data.get('phone'):
            if validate_phone(data['phone']):
                profile.phone = data['phone']
            else:
                return jsonify({'error': 'Invalid phone number'}), 400
        
        # Update location
        if data.get('country'):
            profile.country = sanitize_input(data['country'])
        if data.get('state'):
            profile.state = sanitize_input(data['state'])
        if data.get('city'):
            profile.city = sanitize_input(data['city'])
        if data.get('address'):
            profile.address = sanitize_input(data['address'])
        
        # Update professional information (for job seekers)
        if user.role == UserRole.JOB_SEEKER:
            if data.get('headline'):
                profile.headline = sanitize_input(data['headline'])
            if data.get('summary'):
                profile.summary = sanitize_input(data['summary'])
            if data.get('experience_years') is not None:
                profile.experience_years = data['experience_years']
            if data.get('current_salary') is not None:
                profile.current_salary = data['current_salary']
            if data.get('expected_salary') is not None:
                profile.expected_salary = data['expected_salary']
            if data.get('skills'):
                profile.skills = data['skills']
            if data.get('education'):
                profile.education = data['education']
            if data.get('work_experience'):
                profile.work_experience = data['work_experience']
            if data.get('certifications'):
                profile.certifications = data['certifications']
            if data.get('languages'):
                profile.languages = data['languages']
        
        # Update company information (for employers)
        if user.role == UserRole.EMPLOYER:
            if data.get('company_name'):
                profile.company_name = sanitize_input(data['company_name'])
            if data.get('company_website'):
                if validate_url(data['company_website']):
                    profile.company_website = data['company_website']
                else:
                    return jsonify({'error': 'Invalid website URL'}), 400
            if data.get('company_description'):
                profile.company_description = sanitize_input(data['company_description'])
            if data.get('company_size'):
                profile.company_size = sanitize_input(data['company_size'])
            if data.get('industry'):
                profile.industry = sanitize_input(data['industry'])
            if data.get('founded_year'):
                profile.founded_year = data['founded_year']
        
        # Update social links
        if data.get('linkedin_url'):
            if validate_url(data['linkedin_url']):
                profile.linkedin_url = data['linkedin_url']
            else:
                return jsonify({'error': 'Invalid LinkedIn URL'}), 400
        if data.get('github_url'):
            if validate_url(data['github_url']):
                profile.github_url = data['github_url']
            else:
                return jsonify({'error': 'Invalid GitHub URL'}), 400
        if data.get('portfolio_url'):
            if validate_url(data['portfolio_url']):
                profile.portfolio_url = data['portfolio_url']
            else:
                return jsonify({'error': 'Invalid portfolio URL'}), 400
        
        # Update preferences
        if data.get('job_preferences'):
            profile.job_preferences = data['job_preferences']
        if data.get('notification_preferences'):
            profile.notification_preferences = data['notification_preferences']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/upload-resume', methods=['POST'])
@jwt_required()
def upload_resume():
    """Upload resume for job seeker"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.JOB_SEEKER:
            return jsonify({'error': 'Only job seekers can upload resumes'}), 403
        
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'pdf', 'doc', 'docx'}
        if not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'}), 400
        
        # In a real implementation, you would upload to cloud storage
        # For now, we'll just save the filename
        filename = f"resume_{user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        if user.profile:
            user.profile.resume_url = filename
            db.session.commit()
        
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume_url': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload profile picture"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'avatar' not in request.files:
            return jsonify({'error': 'No avatar file provided'}), 400
        
        file = request.files['avatar']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif'}
        if not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
            return jsonify({'error': 'Invalid file type. Only JPG, PNG, and GIF files are allowed'}), 400
        
        # In a real implementation, you would upload to cloud storage
        # For now, we'll just save the filename
        filename = f"avatar_{user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
        
        if user.profile:
            user.profile.profile_picture = filename
            db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'avatar_url': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # In a real implementation, you might want to anonymize data instead of deleting
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 