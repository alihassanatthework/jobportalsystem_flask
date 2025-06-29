from app import db
from datetime import datetime
from enum import Enum
import uuid

class JobType(Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"
    TEMPORARY = "temporary"

class ExperienceLevel(Enum):
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    EXECUTIVE = "executive"

class JobCategory(db.Model):
    __tablename__ = 'job_categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    color = db.Column(db.String(7))  # Hex color code
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    jobs = db.relationship('Job', backref='category', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('job_categories.id'), nullable=False)
    
    # Basic Job Information
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    responsibilities = db.Column(db.Text)
    benefits = db.Column(db.Text)
    
    # Job Details
    job_type = db.Column(db.Enum(JobType), nullable=False)
    experience_level = db.Column(db.Enum(ExperienceLevel), nullable=False)
    min_experience = db.Column(db.Integer)  # Years of experience
    max_experience = db.Column(db.Integer)
    
    # Salary Information
    min_salary = db.Column(db.Numeric(10, 2))
    max_salary = db.Column(db.Numeric(10, 2))
    salary_currency = db.Column(db.String(3), default='USD')
    salary_period = db.Column(db.String(20), default='yearly')  # yearly, monthly, hourly
    
    # Location
    country = db.Column(db.String(100))
    state = db.Column(db.String(100))
    city = db.Column(db.String(100))
    is_remote = db.Column(db.Boolean, default=False)
    remote_type = db.Column(db.String(20))  # remote, hybrid, on-site
    
    # Application Details
    application_deadline = db.Column(db.DateTime)
    max_applications = db.Column(db.Integer)
    current_applications = db.Column(db.Integer, default=0)
    
    # Job Status
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_urgent = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='open')  # open, closed, draft, expired
    
    # SEO and Visibility
    slug = db.Column(db.String(255), unique=True)
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.Text)
    tags = db.Column(db.JSON)  # List of tags
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)
    
    # Relationships
    applications = db.relationship('Application', backref='job', lazy='dynamic')
    wishlist_items = db.relationship('Wishlist', backref='job', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employer_id': self.employer_id,
            'category_id': self.category_id,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'responsibilities': self.responsibilities,
            'benefits': self.benefits,
            'job_type': self.job_type.value if self.job_type else None,
            'experience_level': self.experience_level.value if self.experience_level else None,
            'min_experience': self.min_experience,
            'max_experience': self.max_experience,
            'min_salary': float(self.min_salary) if self.min_salary else None,
            'max_salary': float(self.max_salary) if self.max_salary else None,
            'salary_currency': self.salary_currency,
            'salary_period': self.salary_period,
            'country': self.country,
            'state': self.state,
            'city': self.city,
            'is_remote': self.is_remote,
            'remote_type': self.remote_type,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'max_applications': self.max_applications,
            'current_applications': self.current_applications,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_urgent': self.is_urgent,
            'status': self.status,
            'slug': self.slug,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'employer': self.employer.to_dict() if self.employer else None,
            'category': self.category.to_dict() if self.category else None
        }
    
    def increment_applications(self):
        self.current_applications += 1
        db.session.commit()
    
    def is_application_open(self):
        if not self.is_active or self.status != 'open':
            return False
        if self.application_deadline and datetime.utcnow() > self.application_deadline:
            return False
        if self.max_applications and self.current_applications >= self.max_applications:
            return False
        return True 