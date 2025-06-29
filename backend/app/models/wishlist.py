from app import db
from datetime import datetime
from enum import Enum
import uuid

class WishlistType(Enum):
    SAVED_JOB = "saved_job"
    SAVED_CANDIDATE = "saved_candidate"

class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'))
    candidate_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    # Wishlist details
    wishlist_type = db.Column(db.Enum(WishlistType), nullable=False)
    notes = db.Column(db.Text)
    tags = db.Column(db.JSON)  # Custom tags for organization
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = db.relationship('User', foreign_keys=[candidate_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'candidate_id': self.candidate_id,
            'wishlist_type': self.wishlist_type.value if self.wishlist_type else None,
            'notes': self.notes,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'job': self.job.to_dict() if self.job else None,
            'candidate': self.candidate.to_dict() if self.candidate else None
        } 