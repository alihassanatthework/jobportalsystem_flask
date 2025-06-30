from app import db
from datetime import datetime
from enum import Enum
import uuid

class NotificationType(Enum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_STATUS_CHANGED = "application_status_changed"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    NEW_MESSAGE = "new_message"
    JOB_RECOMMENDATION = "job_recommendation"
    CANDIDATE_RECOMMENDATION = "candidate_recommendation"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    PROFILE_VIEWED = "profile_viewed"
    JOB_EXPIRING = "job_expiring"
    APPLICATION_DEADLINE = "application_deadline"

class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Notification content
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.Enum(NotificationType), nullable=False)
    priority = db.Column(db.Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Related entities
    related_job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'))
    related_application_id = db.Column(db.String(36), db.ForeignKey('applications.id'))
    related_message_id = db.Column(db.String(36), db.ForeignKey('messages.id'))
    related_user_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    # Notification status
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # Action data
    action_url = db.Column(db.String(255))
    action_text = db.Column(db.String(100))
    notification_metadata = db.Column(db.JSON)  # Additional data for the notification
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    related_job = db.relationship('Job', foreign_keys=[related_job_id])
    related_application = db.relationship('Application', foreign_keys=[related_application_id])
    related_message = db.relationship('Message', foreign_keys=[related_message_id])
    related_user = db.relationship('User', foreign_keys=[related_user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type.value if self.notification_type else None,
            'priority': self.priority.value if self.priority else None,
            'related_job_id': self.related_job_id,
            'related_application_id': self.related_application_id,
            'related_message_id': self.related_message_id,
            'related_user_id': self.related_user_id,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'is_deleted': self.is_deleted,
            'action_url': self.action_url,
            'action_text': self.action_text,
            'notification_metadata': self.notification_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None,
            'related_job': self.related_job.to_dict() if self.related_job else None,
            'related_application': self.related_application.to_dict() if self.related_application else None,
            'related_message': self.related_message.to_dict() if self.related_message else None,
            'related_user': self.related_user.to_dict() if self.related_user else None
        }
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            db.session.commit()
    
    def mark_as_deleted(self):
        self.is_deleted = True
        db.session.commit() 