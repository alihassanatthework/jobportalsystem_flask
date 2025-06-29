from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.models.analytics import UserAnalytics, JobAnalytics
from datetime import datetime, timedelta
from sqlalchemy import func, and_

analytics_bp = Blueprint('analytics', __name__)

def admin_required(f):
    """Decorator to check if user is admin"""
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@admin_required
def get_analytics_overview():
    """Get analytics overview for admin dashboard"""
    try:
        # Date range (last 30 days)
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        # User analytics
        new_users = User.query.filter(
            func.date(User.created_at) >= start_date,
            func.date(User.created_at) <= end_date
        ).count()
        
        active_users = User.query.filter(
            User.last_login >= start_date
        ).count()
        
        # Job analytics
        new_jobs = Job.query.filter(
            func.date(Job.created_at) >= start_date,
            func.date(Job.created_at) <= end_date
        ).count()
        
        total_applications = Application.query.filter(
            func.date(Application.applied_at) >= start_date,
            func.date(Application.applied_at) <= end_date
        ).count()
        
        # Application conversion rate
        total_job_views = JobAnalytics.query.filter(
            func.date(JobAnalytics.date) >= start_date,
            func.date(JobAnalytics.date) <= end_date
        ).with_entities(func.sum(JobAnalytics.views)).scalar() or 0
        
        conversion_rate = (total_applications / total_job_views * 100) if total_job_views > 0 else 0
        
        # Top performing jobs
        top_jobs = db.session.query(
            Job.title,
            Job.id,
            func.count(Application.id).label('applications')
        ).join(Application).filter(
            func.date(Application.applied_at) >= start_date,
            func.date(Application.applied_at) <= end_date
        ).group_by(Job.id, Job.title).order_by(
            func.count(Application.id).desc()
        ).limit(5).all()
        
        # User growth over time
        user_growth = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            func.date(User.created_at) >= start_date,
            func.date(User.created_at) <= end_date
        ).group_by(func.date(User.created_at)).order_by(
            func.date(User.created_at)
        ).all()
        
        return jsonify({
            'overview': {
                'new_users': new_users,
                'active_users': active_users,
                'new_jobs': new_jobs,
                'total_applications': total_applications,
                'conversion_rate': round(conversion_rate, 2)
            },
            'top_jobs': [
                {
                    'title': job.title,
                    'id': job.id,
                    'applications': job.applications
                }
                for job in top_jobs
            ],
            'user_growth': [
                {
                    'date': str(growth.date),
                    'count': growth.count
                }
                for growth in user_growth
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/jobs/<job_id>', methods=['GET'])
@jwt_required()
def get_job_analytics(job_id):
    """Get analytics for a specific job"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if user has access to this job's analytics
        if user.role == UserRole.EMPLOYER and job.employer_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Date range (last 30 days)
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        # Get job analytics
        analytics = JobAnalytics.query.filter(
            JobAnalytics.job_id == job_id,
            JobAnalytics.date >= start_date,
            JobAnalytics.date <= end_date
        ).order_by(JobAnalytics.date).all()
        
        # Calculate totals
        total_views = sum(a.views for a in analytics)
        total_applications = sum(a.applications for a in analytics)
        total_saves = sum(a.saves for a in analytics)
        
        # Application status breakdown
        application_statuses = db.session.query(
            Application.status,
            func.count(Application.id).label('count')
        ).filter(Application.job_id == job_id).group_by(
            Application.status
        ).all()
        
        # Daily analytics
        daily_analytics = [
            {
                'date': str(analytic.date),
                'views': analytic.views,
                'applications': analytic.applications,
                'saves': analytic.saves,
                'shares': analytic.shares
            }
            for analytic in analytics
        ]
        
        return jsonify({
            'job': job.to_dict(),
            'summary': {
                'total_views': total_views,
                'total_applications': total_applications,
                'total_saves': total_saves,
                'conversion_rate': round((total_applications / total_views * 100), 2) if total_views > 0 else 0
            },
            'application_statuses': [
                {
                    'status': status.status.value,
                    'count': status.count
                }
                for status in application_statuses
            ],
            'daily_analytics': daily_analytics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/users/<user_id>', methods=['GET'])
@jwt_required()
def get_user_analytics(user_id):
    """Get analytics for a specific user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has access to this analytics
        if user.role != UserRole.ADMIN and current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Date range (last 30 days)
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        # Get user analytics
        analytics = UserAnalytics.query.filter(
            UserAnalytics.user_id == user_id,
            UserAnalytics.date >= start_date,
            UserAnalytics.date <= end_date
        ).order_by(UserAnalytics.date).all()
        
        # Calculate totals
        total_page_views = sum(a.page_views for a in analytics)
        total_sessions = sum(a.sessions for a in analytics)
        total_jobs_viewed = sum(a.jobs_viewed for a in analytics)
        total_jobs_applied = sum(a.jobs_applied for a in analytics)
        
        # Daily analytics
        daily_analytics = [
            {
                'date': str(analytic.date),
                'page_views': analytic.page_views,
                'sessions': analytic.sessions,
                'jobs_viewed': analytic.jobs_viewed,
                'jobs_applied': analytic.jobs_applied,
                'messages_sent': analytic.messages_sent,
                'messages_received': analytic.messages_received
            }
            for analytic in analytics
        ]
        
        # Recent activity
        recent_applications = Application.query.filter_by(
            applicant_id=user_id
        ).order_by(Application.applied_at.desc()).limit(5).all()
        
        return jsonify({
            'user': target_user.to_dict(),
            'summary': {
                'total_page_views': total_page_views,
                'total_sessions': total_sessions,
                'total_jobs_viewed': total_jobs_viewed,
                'total_jobs_applied': total_jobs_applied,
                'application_rate': round((total_jobs_applied / total_jobs_viewed * 100), 2) if total_jobs_viewed > 0 else 0
            },
            'daily_analytics': daily_analytics,
            'recent_applications': [app.to_dict() for app in recent_applications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/track', methods=['POST'])
@jwt_required()
def track_user_activity():
    """Track user activity for analytics"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        today = datetime.utcnow().date()
        
        # Get or create analytics record for today
        analytics = UserAnalytics.query.filter_by(
            user_id=current_user_id,
            date=today
        ).first()
        
        if not analytics:
            analytics = UserAnalytics(
                user_id=current_user_id,
                date=today
            )
            db.session.add(analytics)
        
        # Update analytics based on activity type
        activity_type = data.get('type')
        
        if activity_type == 'page_view':
            analytics.page_views += 1
        elif activity_type == 'session_start':
            analytics.sessions += 1
        elif activity_type == 'job_view':
            analytics.jobs_viewed += 1
        elif activity_type == 'job_apply':
            analytics.jobs_applied += 1
        elif activity_type == 'job_save':
            analytics.jobs_saved += 1
        elif activity_type == 'message_send':
            analytics.messages_sent += 1
        elif activity_type == 'message_receive':
            analytics.messages_received += 1
        
        # Update device info
        if data.get('device_type'):
            analytics.device_type = data['device_type']
        if data.get('browser'):
            analytics.browser = data['browser']
        if data.get('operating_system'):
            analytics.operating_system = data['operating_system']
        
        db.session.commit()
        
        return jsonify({'message': 'Activity tracked successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/jobs/<job_id>/track', methods=['POST'])
def track_job_activity(job_id):
    """Track job activity for analytics"""
    try:
        data = request.get_json()
        
        today = datetime.utcnow().date()
        
        # Get or create analytics record for today
        analytics = JobAnalytics.query.filter_by(
            job_id=job_id,
            date=today
        ).first()
        
        if not analytics:
            analytics = JobAnalytics(
                job_id=job_id,
                date=today
            )
            db.session.add(analytics)
        
        # Update analytics based on activity type
        activity_type = data.get('type')
        
        if activity_type == 'view':
            analytics.views += 1
        elif activity_type == 'unique_view':
            analytics.unique_views += 1
        elif activity_type == 'application':
            analytics.applications += 1
        elif activity_type == 'save':
            analytics.saves += 1
        elif activity_type == 'share':
            analytics.shares += 1
        elif activity_type == 'click':
            analytics.clicks += 1
        
        # Update conversion rates
        analytics.update_rates()
        
        db.session.commit()
        
        return jsonify({'message': 'Job activity tracked successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 