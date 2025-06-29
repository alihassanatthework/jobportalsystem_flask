from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.utils.email import send_application_notification, send_interview_invitation
from datetime import datetime

applications_bp = Blueprint('applications', __name__)

@applications_bp.route('/', methods=['GET'])
@jwt_required()
def get_applications():
    """Get applications for current user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        # Build query based on user role
        if user.role == UserRole.JOB_SEEKER:
            query = Application.query.filter_by(applicant_id=current_user_id)
        elif user.role == UserRole.EMPLOYER:
            query = Application.query.join(Job).filter(Job.employer_id == current_user_id)
        else:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Filter by status
        if status:
            try:
                status_enum = ApplicationStatus(status)
                query = query.filter(Application.status == status_enum)
            except ValueError:
                pass
        
        # Order by application date
        query = query.order_by(Application.applied_at.desc())
        
        # Pagination
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        applications = [app.to_dict() for app in pagination.items]
        
        return jsonify({
            'applications': applications,
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

@applications_bp.route('/<application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """Get a specific application"""
    try:
        current_user_id = get_jwt_identity()
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Check if user has access to this application
        user = User.query.get(current_user_id)
        if user.role == UserRole.JOB_SEEKER:
            if application.applicant_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
        elif user.role == UserRole.EMPLOYER:
            if application.job.employer_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({'application': application.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@applications_bp.route('/', methods=['POST'])
@jwt_required()
def create_application():
    """Apply for a job"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.JOB_SEEKER:
            return jsonify({'error': 'Only job seekers can apply for jobs'}), 403
        
        data = request.get_json()
        
        if not data.get('job_id'):
            return jsonify({'error': 'Job ID is required'}), 400
        
        job = Job.query.get(data['job_id'])
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if not job.is_application_open():
            return jsonify({'error': 'Applications are not open for this job'}), 400
        
        # Check if user already applied
        existing_application = Application.query.filter_by(
            job_id=data['job_id'],
            applicant_id=current_user_id
        ).first()
        
        if existing_application:
            return jsonify({'error': 'You have already applied for this job'}), 409
        
        # Create application
        application = Application(
            job_id=data['job_id'],
            applicant_id=current_user_id,
            cover_letter=data.get('cover_letter'),
            resume_url=data.get('resume_url'),
            portfolio_url=data.get('portfolio_url'),
            expected_salary=data.get('expected_salary'),
            salary_currency=data.get('salary_currency', 'USD'),
            salary_period=data.get('salary_period', 'yearly')
        )
        
        db.session.add(application)
        
        # Increment job application count
        job.increment_applications()
        
        db.session.commit()
        
        # Send notification email to employer
        try:
            send_application_notification(user, job.title, job.employer.profile.company_name if job.employer.profile else 'Company')
        except Exception as e:
            print(f"Failed to send application notification: {e}")
        
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@applications_bp.route('/<application_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(application_id):
    """Update application status (employers only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.EMPLOYER:
            return jsonify({'error': 'Only employers can update application status'}), 403
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        if application.job.employer_id != current_user_id:
            return jsonify({'error': 'You can only update applications for your job postings'}), 403
        
        data = request.get_json()
        
        if not data.get('status'):
            return jsonify({'error': 'Status is required'}), 400
        
        try:
            new_status = ApplicationStatus(data['status'])
        except ValueError:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Update status
        application.update_status(new_status, current_user_id)
        
        # Add notes if provided
        if data.get('employer_notes'):
            application.employer_notes = data['employer_notes']
        
        # Schedule interview if status is interview_scheduled
        if new_status == ApplicationStatus.INTERVIEW_SCHEDULED:
            if data.get('interview_date'):
                application.interview_date = datetime.fromisoformat(data['interview_date'])
            if data.get('interview_location'):
                application.interview_location = data['interview_location']
            if data.get('interview_type'):
                application.interview_type = data['interview_type']
            if data.get('interview_notes'):
                application.interview_notes = data['interview_notes']
            
            # Send interview invitation email
            try:
                send_interview_invitation(
                    application.applicant,
                    application.job.title,
                    application.job.employer.profile.company_name if application.job.employer.profile else 'Company',
                    application.interview_date,
                    application.interview_location
                )
            except Exception as e:
                print(f"Failed to send interview invitation: {e}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Application status updated successfully',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@applications_bp.route('/<application_id>/withdraw', methods=['POST'])
@jwt_required()
def withdraw_application(application_id):
    """Withdraw application (job seekers only)"""
    try:
        current_user_id = get_jwt_identity()
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        if application.applicant_id != current_user_id:
            return jsonify({'error': 'You can only withdraw your own applications'}), 403
        
        if application.status in [ApplicationStatus.HIRED, ApplicationStatus.REJECTED]:
            return jsonify({'error': 'Cannot withdraw application in current status'}), 400
        
        application.update_status(ApplicationStatus.WITHDRAWN, current_user_id)
        
        return jsonify({'message': 'Application withdrawn successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@applications_bp.route('/<application_id>/notes', methods=['PUT'])
@jwt_required()
def update_application_notes(application_id):
    """Update application notes"""
    try:
        current_user_id = get_jwt_identity()
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        data = request.get_json()
        
        # Check if user has access to this application
        user = User.query.get(current_user_id)
        if user.role == UserRole.JOB_SEEKER:
            if application.applicant_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
            if data.get('applicant_notes'):
                application.applicant_notes = data['applicant_notes']
        elif user.role == UserRole.EMPLOYER:
            if application.job.employer_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
            if data.get('employer_notes'):
                application.employer_notes = data['employer_notes']
        else:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.commit()
        
        return jsonify({
            'message': 'Notes updated successfully',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 