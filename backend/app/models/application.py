from app import db
from datetime import datetime
from enum import Enum
import uuid

class ApplicationStatus(Enum):
    APPLIED = "applied"
    REVIEWING = "reviewing"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWED = "interviewed"
    OFFER_EXTENDED = "offer_extended"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'), nullable=False)
    applicant_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Application Details
    cover_letter = db.Column(db.Text)
    resume_url = db.Column(db.String(255))
    portfolio_url = db.Column(db.String(255))
    expected_salary = db.Column(db.Numeric(10, 2))
    salary_currency = db.Column(db.String(3), default='USD')
    salary_period = db.Column(db.String(20), default='yearly')
    
    # Application Status
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    status_updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    status_updated_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    # Interview Details
    interview_date = db.Column(db.DateTime)
    interview_location = db.Column(db.String(255))
    interview_type = db.Column(db.String(50))  # phone, video, in-person
    interview_notes = db.Column(db.Text)
    
    # Feedback and Notes
    employer_notes = db.Column(db.Text)
    applicant_notes = db.Column(db.Text)
    rating = db.Column(db.Integer)  # 1-5 rating from employer
    
    # Timestamps
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    status_updater = db.relationship('User', foreign_keys=[status_updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'applicant_id': self.applicant_id,
            'cover_letter': self.cover_letter,
            'resume_url': self.resume_url,
            'portfolio_url': self.portfolio_url,
            'expected_salary': float(self.expected_salary) if self.expected_salary else None,
            'salary_currency': self.salary_currency,
            'salary_period': self.salary_period,
            'status': self.status.value if self.status else None,
            'status_updated_at': self.status_updated_at.isoformat() if self.status_updated_at else None,
            'status_updated_by': self.status_updated_by,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None,
            'interview_location': self.interview_location,
            'interview_type': self.interview_type,
            'interview_notes': self.interview_notes,
            'employer_notes': self.employer_notes,
            'applicant_notes': self.applicant_notes,
            'rating': self.rating,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'job': self.job.to_dict() if self.job else None,
            'applicant': self.applicant.to_dict() if self.applicant else None,
            'status_updater': self.status_updater.to_dict() if self.status_updater else None
        }
    
    def update_status(self, new_status, updated_by_id=None):
        self.status = new_status
        self.status_updated_at = datetime.utcnow()
        self.status_updated_by = updated_by_id
        db.session.commit() 