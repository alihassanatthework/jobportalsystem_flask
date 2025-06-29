from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.job import Job, JobCategory, JobType, ExperienceLevel
from app.utils.validators import validate_salary_range, sanitize_input
from datetime import datetime
from sqlalchemy import or_, and_, desc, asc

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    """Get all jobs with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Filtering parameters
        search = request.args.get('search', '')
        category_id = request.args.get('category_id')
        job_type = request.args.get('job_type')
        experience_level = request.args.get('experience_level')
        location = request.args.get('location')
        min_salary = request.args.get('min_salary', type=float)
        max_salary = request.args.get('max_salary', type=float)
        is_remote = request.args.get('is_remote', type=bool)
        is_featured = request.args.get('is_featured', type=bool)
        
        # Build query
        query = Job.query.filter(Job.is_active == True, Job.status == 'open')
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Job.title.ilike(f'%{search}%'),
                    Job.description.ilike(f'%{search}%'),
                    Job.requirements.ilike(f'%{search}%')
                )
            )
        
        if category_id:
            query = query.filter(Job.category_id == category_id)
        
        if job_type:
            try:
                job_type_enum = JobType(job_type)
                query = query.filter(Job.job_type == job_type_enum)
            except ValueError:
                pass
        
        if experience_level:
            try:
                exp_level_enum = ExperienceLevel(experience_level)
                query = query.filter(Job.experience_level == exp_level_enum)
            except ValueError:
                pass
        
        if location:
            query = query.filter(
                or_(
                    Job.city.ilike(f'%{location}%'),
                    Job.state.ilike(f'%{location}%'),
                    Job.country.ilike(f'%{location}%')
                )
            )
        
        if min_salary is not None:
            query = query.filter(Job.max_salary >= min_salary)
        
        if max_salary is not None:
            query = query.filter(Job.min_salary <= max_salary)
        
        if is_remote is not None:
            query = query.filter(Job.is_remote == is_remote)
        
        if is_featured is not None:
            query = query.filter(Job.is_featured == is_featured)
        
        # Sort by featured jobs first, then by creation date
        query = query.order_by(desc(Job.is_featured), desc(Job.created_at))
        
        # Pagination
        pagination = query.paginate(
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

@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get a specific job by ID"""
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify({'job': job.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/', methods=['POST'])
@jwt_required()
def create_job():
    """Create a new job posting"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.EMPLOYER:
            return jsonify({'error': 'Only employers can create job postings'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'category_id', 'job_type', 'experience_level']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate job type
        try:
            job_type = JobType(data['job_type'])
        except ValueError:
            return jsonify({'error': 'Invalid job type'}), 400
        
        # Validate experience level
        try:
            experience_level = ExperienceLevel(data['experience_level'])
        except ValueError:
            return jsonify({'error': 'Invalid experience level'}), 400
        
        # Validate salary range
        if data.get('min_salary') and data.get('max_salary'):
            if not validate_salary_range(data['min_salary'], data['max_salary']):
                return jsonify({'error': 'Invalid salary range'}), 400
        
        # Create job
        job = Job(
            employer_id=current_user_id,
            category_id=data['category_id'],
            title=sanitize_input(data['title']),
            description=sanitize_input(data['description']),
            requirements=sanitize_input(data.get('requirements', '')),
            responsibilities=sanitize_input(data.get('responsibilities', '')),
            benefits=sanitize_input(data.get('benefits', '')),
            job_type=job_type,
            experience_level=experience_level,
            min_experience=data.get('min_experience'),
            max_experience=data.get('max_experience'),
            min_salary=data.get('min_salary'),
            max_salary=data.get('max_salary'),
            salary_currency=data.get('salary_currency', 'USD'),
            salary_period=data.get('salary_period', 'yearly'),
            country=data.get('country'),
            state=data.get('state'),
            city=data.get('city'),
            is_remote=data.get('is_remote', False),
            remote_type=data.get('remote_type'),
            application_deadline=datetime.fromisoformat(data['application_deadline']) if data.get('application_deadline') else None,
            max_applications=data.get('max_applications'),
            is_featured=data.get('is_featured', False),
            is_urgent=data.get('is_urgent', False),
            tags=data.get('tags', []),
            published_at=datetime.utcnow()
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    """Update a job posting"""
    try:
        current_user_id = get_jwt_identity()
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if job.employer_id != current_user_id:
            return jsonify({'error': 'You can only update your own job postings'}), 403
        
        data = request.get_json()
        
        # Update fields
        if data.get('title'):
            job.title = sanitize_input(data['title'])
        if data.get('description'):
            job.description = sanitize_input(data['description'])
        if data.get('requirements'):
            job.requirements = sanitize_input(data['requirements'])
        if data.get('responsibilities'):
            job.responsibilities = sanitize_input(data['responsibilities'])
        if data.get('benefits'):
            job.benefits = sanitize_input(data['benefits'])
        if data.get('category_id'):
            job.category_id = data['category_id']
        if data.get('job_type'):
            try:
                job.job_type = JobType(data['job_type'])
            except ValueError:
                return jsonify({'error': 'Invalid job type'}), 400
        if data.get('experience_level'):
            try:
                job.experience_level = ExperienceLevel(data['experience_level'])
            except ValueError:
                return jsonify({'error': 'Invalid experience level'}), 400
        
        # Update salary information
        if data.get('min_salary') is not None:
            job.min_salary = data['min_salary']
        if data.get('max_salary') is not None:
            job.max_salary = data['max_salary']
        if data.get('salary_currency'):
            job.salary_currency = data['salary_currency']
        if data.get('salary_period'):
            job.salary_period = data['salary_period']
        
        # Update location
        if data.get('country'):
            job.country = data['country']
        if data.get('state'):
            job.state = data['state']
        if data.get('city'):
            job.city = data['city']
        if data.get('is_remote') is not None:
            job.is_remote = data['is_remote']
        if data.get('remote_type'):
            job.remote_type = data['remote_type']
        
        # Update other fields
        if data.get('application_deadline'):
            job.application_deadline = datetime.fromisoformat(data['application_deadline'])
        if data.get('max_applications') is not None:
            job.max_applications = data['max_applications']
        if data.get('is_featured') is not None:
            job.is_featured = data['is_featured']
        if data.get('is_urgent') is not None:
            job.is_urgent = data['is_urgent']
        if data.get('tags'):
            job.tags = data['tags']
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'job': job.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    """Delete a job posting"""
    try:
        current_user_id = get_jwt_identity()
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if job.employer_id != current_user_id:
            return jsonify({'error': 'You can only delete your own job postings'}), 403
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all job categories"""
    try:
        categories = JobCategory.query.filter_by(is_active=True).all()
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/types', methods=['GET'])
def get_job_types():
    """Get all job types"""
    try:
        job_types = [job_type.value for job_type in JobType]
        return jsonify({'job_types': job_types}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/experience-levels', methods=['GET'])
def get_experience_levels():
    """Get all experience levels"""
    try:
        experience_levels = [level.value for level in ExperienceLevel]
        return jsonify({'experience_levels': experience_levels}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 