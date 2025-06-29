from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.job import Job, JobCategory
from app.models.application import Application
from app.models.feedback import Feedback, FeedbackStatus
from app.models.notification import Notification
from datetime import datetime, timedelta
from sqlalchemy import func, or_
import functools

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard():
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        job_seekers = User.query.filter_by(role=UserRole.JOB_SEEKER).count()
        employers = User.query.filter_by(role=UserRole.EMPLOYER).count()
        new_users_today = User.query.filter(
            User.created_at >= datetime.utcnow().date()
        ).count()
        
        # Job statistics
        total_jobs = Job.query.count()
        active_jobs = Job.query.filter_by(is_active=True, status='open').count()
        featured_jobs = Job.query.filter_by(is_featured=True).count()
        new_jobs_today = Job.query.filter(
            Job.created_at >= datetime.utcnow().date()
        ).count()
        
        # Application statistics
        total_applications = Application.query.count()
        applications_today = Application.query.filter(
            Application.applied_at >= datetime.utcnow().date()
        ).count()
        
        # Feedback statistics
        open_feedback = Feedback.query.filter_by(status=FeedbackStatus.OPEN).count()
        urgent_feedback = Feedback.query.filter_by(priority='urgent').count()
        
        # Recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_jobs = Job.query.order_by(Job.created_at.desc()).limit(5).all()
        recent_applications = Application.query.order_by(Application.applied_at.desc()).limit(5).all()
        
        return jsonify({
            'statistics': {
                'users': {
                    'total': total_users,
                    'job_seekers': job_seekers,
                    'employers': employers,
                    'new_today': new_users_today
                },
                'jobs': {
                    'total': total_jobs,
                    'active': active_jobs,
                    'featured': featured_jobs,
                    'new_today': new_jobs_today
                },
                'applications': {
                    'total': total_applications,
                    'today': applications_today
                },
                'feedback': {
                    'open': open_feedback,
                    'urgent': urgent_feedback
                }
            },
            'recent_activity': {
                'users': [user.to_dict() for user in recent_users],
                'jobs': [job.to_dict() for job in recent_jobs],
                'applications': [app.to_dict() for app in recent_applications]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        is_active = request.args.get('is_active', type=bool)
        search = request.args.get('search', '')
        
        query = User.query
        
        # Apply filters
        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                pass
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        if search:
            query = query.join(User.profile).filter(
                or_(
                    User.email.ilike(f'%{search}%'),
                    UserProfile.first_name.ilike(f'%{search}%'),
                    UserProfile.last_name.ilike(f'%{search}%'),
                    UserProfile.company_name.ilike(f'%{search}%')
                )
            )
        
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users = []
        for user in pagination.items:
            user_data = user.to_dict()
            user_data['profile'] = user.profile.to_dict() if user.profile else None
            users.append(user_data)
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
@admin_required
def get_jobs():
    """Get all jobs with admin controls"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        is_featured = request.args.get('is_featured', type=bool)
        
        query = Job.query
        
        if status:
            query = query.filter(Job.status == status)
        
        if is_featured is not None:
            query = query.filter(Job.is_featured == is_featured)
        
        pagination = query.order_by(Job.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        jobs = [job.to_dict() for job in pagination.items]
        
        return jsonify({
            'jobs': jobs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/jobs/<job_id>/toggle-featured', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_job_featured(job_id):
    """Toggle job featured status"""
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job.is_featured = not job.is_featured
        db.session.commit()
        
        return jsonify({
            'message': f'Job {"featured" if job.is_featured else "unfeatured"} successfully',
            'job': job.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/feedback', methods=['GET'])
@jwt_required()
@admin_required
def get_feedback():
    """Get all feedback with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        priority = request.args.get('priority')
        feedback_type = request.args.get('feedback_type')
        
        query = Feedback.query
        
        if status:
            try:
                status_enum = FeedbackStatus(status)
                query = query.filter(Feedback.status == status_enum)
            except ValueError:
                pass
        
        if priority:
            query = query.filter(Feedback.priority == priority)
        
        if feedback_type:
            query = query.filter(Feedback.feedback_type == feedback_type)
        
        pagination = query.order_by(Feedback.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        feedback_list = [feedback.to_dict() for feedback in pagination.items]
        
        return jsonify({
            'feedback': feedback_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/feedback/<feedback_id>/assign', methods=['PUT'])
@jwt_required()
@admin_required
def assign_feedback(feedback_id):
    """Assign feedback to admin"""
    try:
        current_user_id = get_jwt_identity()
        feedback = Feedback.query.get(feedback_id)
        
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        feedback.assign_to(current_user_id)
        
        return jsonify({
            'message': 'Feedback assigned successfully',
            'feedback': feedback.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/feedback/<feedback_id>/resolve', methods=['PUT'])
@jwt_required()
@admin_required
def resolve_feedback(feedback_id):
    """Resolve feedback"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        feedback = Feedback.query.get(feedback_id)
        
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        feedback.resolve(current_user_id, data.get('resolution_notes'))
        
        return jsonify({
            'message': 'Feedback resolved successfully',
            'feedback': feedback.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    """Create a new job category"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Category name is required'}), 400
        
        category = JobCategory(
            name=data['name'],
            description=data.get('description'),
            icon=data.get('icon'),
            color=data.get('color')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<category_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(category_id):
    """Update job category"""
    try:
        category = JobCategory.query.get(category_id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        data = request.get_json()
        
        if data.get('name'):
            category.name = data['name']
        if data.get('description'):
            category.description = data['description']
        if data.get('icon'):
            category.icon = data['icon']
        if data.get('color'):
            category.color = data['color']
        if data.get('is_active') is not None:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 