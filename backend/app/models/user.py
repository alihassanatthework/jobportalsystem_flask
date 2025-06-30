from app import db, bcrypt
from datetime import datetime
from enum import Enum
import uuid

class UserRole(Enum):
    JOB_SEEKER = "job_seeker"
    EMPLOYER = "employer"
    ADMIN = "admin"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.JOB_SEEKER)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    email_verified_at = db.Column(db.DateTime)
    email_verification_token = db.Column(db.String(255))
    password_reset_token = db.Column(db.String(255))
    password_reset_expires = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    jobs_posted = db.relationship('Job', foreign_keys='Job.employer_id', backref='employer', lazy='dynamic')
    applications = db.relationship('Application', foreign_keys='Application.applicant_id', backref='applicant', lazy='dynamic')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', back_populates='sender', lazy='dynamic')
    received_messages = db.relationship('Message', foreign_keys='Message.recipient_id', back_populates='recipient', lazy='dynamic')
    notifications = db.relationship('Notification', foreign_keys='Notification.user_id', back_populates='user', lazy='dynamic')
    wishlist_items = db.relationship('Wishlist', foreign_keys='Wishlist.user_id', back_populates='user', lazy='dynamic')
    feedback_submitted = db.relationship('Feedback', foreign_keys='Feedback.user_id', lazy='dynamic')
    related_notifications = db.relationship('Notification', foreign_keys='Notification.related_user_id', back_populates='related_user', lazy='dynamic')
    status_updates = db.relationship('Application', foreign_keys='Application.status_updated_by', back_populates='status_updater', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role.value,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Basic Information
    username = db.Column(db.String(50), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    profile_picture = db.Column(db.String(255))
    resume_url = db.Column(db.String(255))
    
    # Location
    country = db.Column(db.String(100))
    state = db.Column(db.String(100))
    city = db.Column(db.String(100))
    address = db.Column(db.Text)
    
    # Professional Information (for job seekers)
    headline = db.Column(db.String(200))
    summary = db.Column(db.Text)
    experience_years = db.Column(db.Integer)
    current_salary = db.Column(db.Numeric(10, 2))
    expected_salary = db.Column(db.Numeric(10, 2))
    skills = db.Column(db.JSON)  # List of skills
    education = db.Column(db.JSON)  # List of education records
    work_experience = db.Column(db.JSON)  # List of work experience
    certifications = db.Column(db.JSON)  # List of certifications
    languages = db.Column(db.JSON)  # List of languages and proficiency
    
    # Company Information (for employers)
    company_name = db.Column(db.String(200))
    company_website = db.Column(db.String(255))
    company_description = db.Column(db.Text)
    company_size = db.Column(db.String(50))
    industry = db.Column(db.String(100))
    founded_year = db.Column(db.Integer)
    company_logo = db.Column(db.String(255))
    
    # Preferences
    job_preferences = db.Column(db.JSON)  # Job preferences for seekers
    notification_preferences = db.Column(db.JSON)  # Notification settings
    
    # Social Links
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    portfolio_url = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'profile_picture': self.profile_picture,
            'resume_url': self.resume_url,
            'country': self.country,
            'state': self.state,
            'city': self.city,
            'address': self.address,
            'headline': self.headline,
            'summary': self.summary,
            'experience_years': self.experience_years,
            'current_salary': float(self.current_salary) if self.current_salary else None,
            'expected_salary': float(self.expected_salary) if self.expected_salary else None,
            'skills': self.skills,
            'education': self.education,
            'work_experience': self.work_experience,
            'certifications': self.certifications,
            'languages': self.languages,
            'company_name': self.company_name,
            'company_website': self.company_website,
            'company_description': self.company_description,
            'company_size': self.company_size,
            'industry': self.industry,
            'founded_year': self.founded_year,
            'company_logo': self.company_logo,
            'job_preferences': self.job_preferences,
            'notification_preferences': self.notification_preferences,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'portfolio_url': self.portfolio_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 