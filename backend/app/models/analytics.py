from app import db
from datetime import datetime
import uuid

class UserAnalytics(db.Model):
    __tablename__ = 'user_analytics'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Page views and sessions
    page_views = db.Column(db.Integer, default=0)
    sessions = db.Column(db.Integer, default=0)
    session_duration = db.Column(db.Integer, default=0)  # in seconds
    
    # Job-related actions
    jobs_viewed = db.Column(db.Integer, default=0)
    jobs_applied = db.Column(db.Integer, default=0)
    jobs_saved = db.Column(db.Integer, default=0)
    jobs_shared = db.Column(db.Integer, default=0)
    
    # Profile actions
    profile_views = db.Column(db.Integer, default=0)
    profile_edits = db.Column(db.Integer, default=0)
    
    # Communication
    messages_sent = db.Column(db.Integer, default=0)
    messages_received = db.Column(db.Integer, default=0)
    
    # Search behavior
    searches_performed = db.Column(db.Integer, default=0)
    filters_used = db.Column(db.JSON)  # Track which filters were used
    
    # Device and browser info
    device_type = db.Column(db.String(50))
    browser = db.Column(db.String(50))
    operating_system = db.Column(db.String(50))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'page_views': self.page_views,
            'sessions': self.sessions,
            'session_duration': self.session_duration,
            'jobs_viewed': self.jobs_viewed,
            'jobs_applied': self.jobs_applied,
            'jobs_saved': self.jobs_saved,
            'jobs_shared': self.jobs_shared,
            'profile_views': self.profile_views,
            'profile_edits': self.profile_edits,
            'messages_sent': self.messages_sent,
            'messages_received': self.messages_received,
            'searches_performed': self.searches_performed,
            'filters_used': self.filters_used,
            'device_type': self.device_type,
            'browser': self.browser,
            'operating_system': self.operating_system,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class JobAnalytics(db.Model):
    __tablename__ = 'job_analytics'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Views and engagement
    views = db.Column(db.Integer, default=0)
    unique_views = db.Column(db.Integer, default=0)
    time_spent = db.Column(db.Integer, default=0)  # in seconds
    
    # Actions
    applications = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    
    # Source tracking
    traffic_sources = db.Column(db.JSON)  # Track where traffic comes from
    search_keywords = db.Column(db.JSON)  # Track search terms that led to this job
    
    # Conversion metrics
    view_to_application_rate = db.Column(db.Float, default=0.0)
    view_to_save_rate = db.Column(db.Float, default=0.0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    job = db.relationship('Job')
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'date': self.date.isoformat() if self.date else None,
            'views': self.views,
            'unique_views': self.unique_views,
            'time_spent': self.time_spent,
            'applications': self.applications,
            'saves': self.saves,
            'shares': self.shares,
            'clicks': self.clicks,
            'traffic_sources': self.traffic_sources,
            'search_keywords': self.search_keywords,
            'view_to_application_rate': self.view_to_application_rate,
            'view_to_save_rate': self.view_to_save_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def update_rates(self):
        if self.views > 0:
            self.view_to_application_rate = (self.applications / self.views) * 100
            self.view_to_save_rate = (self.saves / self.views) * 100
        db.session.commit() 