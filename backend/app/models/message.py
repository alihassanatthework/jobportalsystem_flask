from app import db
from datetime import datetime
import uuid

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant1_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    participant2_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'))
    
    # Conversation metadata
    subject = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    participant1 = db.relationship('User', foreign_keys=[participant1_id])
    participant2 = db.relationship('User', foreign_keys=[participant2_id])
    job = db.relationship('Job')
    messages = db.relationship('Message', backref='conversation', lazy='dynamic', order_by='Message.created_at')
    
    def to_dict(self):
        return {
            'id': self.id,
            'participant1_id': self.participant1_id,
            'participant2_id': self.participant2_id,
            'job_id': self.job_id,
            'subject': self.subject,
            'is_active': self.is_active,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'participant1': self.participant1.to_dict() if self.participant1 else None,
            'participant2': self.participant2.to_dict() if self.participant2 else None,
            'job': self.job.to_dict() if self.job else None
        }
    
    def get_other_participant(self, user_id):
        if self.participant1_id == user_id:
            return self.participant2
        return self.participant1
    
    def mark_as_read(self, user_id):
        if self.participant1_id == user_id:
            self.unread_count_p1 = 0
        else:
            self.unread_count_p2 = 0
        db.session.commit()

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Message content
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, file, image, system
    attachment_url = db.Column(db.String(255))
    attachment_name = db.Column(db.String(255))
    attachment_size = db.Column(db.Integer)
    
    # Message status
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], back_populates='received_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'content': self.content,
            'message_type': self.message_type,
            'attachment_url': self.attachment_url,
            'attachment_name': self.attachment_name,
            'attachment_size': self.attachment_size,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'sender': self.sender.to_dict() if self.sender else None,
            'recipient': self.recipient.to_dict() if self.recipient else None
        }
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            db.session.commit() 