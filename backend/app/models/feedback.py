from app import db
from datetime import datetime
from enum import Enum
import uuid

class FeedbackType(Enum):
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    GENERAL_FEEDBACK = "general_feedback"
    SUPPORT_REQUEST = "support_request"
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"

class FeedbackStatus(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class FeedbackPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Feedback content
    feedback_type = db.Column(db.Enum(FeedbackType), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Enum(FeedbackPriority), default=FeedbackPriority.MEDIUM)
    
    # Status and resolution
    status = db.Column(db.Enum(FeedbackStatus), default=FeedbackStatus.OPEN)
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'))
    resolved_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    resolution_notes = db.Column(db.Text)
    
    # Additional information
    user_agent = db.Column(db.String(500))
    page_url = db.Column(db.String(500))
    browser_info = db.Column(db.JSON)
    system_info = db.Column(db.JSON)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    # Relationships
    assigned_admin = db.relationship('User', foreign_keys=[assigned_to])
    resolver = db.relationship('User', foreign_keys=[resolved_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'feedback_type': self.feedback_type.value if self.feedback_type else None,
            'subject': self.subject,
            'message': self.message,
            'priority': self.priority.value if self.priority else None,
            'status': self.status.value if self.status else None,
            'assigned_to': self.assigned_to,
            'resolved_by': self.resolved_by,
            'resolution_notes': self.resolution_notes,
            'user_agent': self.user_agent,
            'page_url': self.page_url,
            'browser_info': self.browser_info,
            'system_info': self.system_info,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'user': self.user.to_dict() if self.user else None,
            'assigned_admin': self.assigned_admin.to_dict() if self.assigned_admin else None,
            'resolver': self.resolver.to_dict() if self.resolver else None
        }
    
    def assign_to(self, admin_id):
        self.assigned_to = admin_id
        self.status = FeedbackStatus.IN_PROGRESS
        db.session.commit()
    
    def resolve(self, admin_id, resolution_notes=None):
        self.resolved_by = admin_id
        self.resolved_at = datetime.utcnow()
        self.status = FeedbackStatus.RESOLVED
        if resolution_notes:
            self.resolution_notes = resolution_notes
        db.session.commit() 