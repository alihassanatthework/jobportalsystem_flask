#!/usr/bin/env python3
"""
Test SQLAlchemy Relationships
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

def test_relationships():
    """Test all SQLAlchemy relationships"""
    try:
        print("🔍 Testing SQLAlchemy relationships...")
        
        # Test importing the app
        from main import app, db
        
        with app.app_context():
            print("✅ App context created successfully")
            
            # Test importing all models
            print("📦 Testing model imports...")
            from app.models import (
                User, UserProfile, Job, JobCategory, Application, 
                Message, Conversation, Notification, Wishlist, 
                Feedback, UserAnalytics, JobAnalytics
            )
            print("✅ All models imported successfully")
            
            # Test creating tables
            print("🏗️  Testing table creation...")
            db.create_all()
            print("✅ Tables created successfully")
            
            # Test basic user creation
            print("👤 Testing user creation...")
            from app.models.user import UserRole
            from app import bcrypt
            
            user = User(
                email="test@example.com",
                role=UserRole.JOB_SEEKER
            )
            user.set_password("testpassword123")
            
            db.session.add(user)
            db.session.commit()
            print(f"✅ User created: {user.id}")
            
            # Test profile creation
            print("📝 Testing profile creation...")
            profile = UserProfile(
                user_id=user.id,
                username="testuser"
            )
            
            db.session.add(profile)
            db.session.commit()
            print(f"✅ Profile created: {profile.id}")
            
            # Test relationships
            print("🔗 Testing relationships...")
            print(f"User -> Profile: {user.profile.username}")
            print(f"Profile -> User: {profile.user.email}")
            
            print("🎉 All relationship tests passed!")
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_relationships()
    if not success:
        sys.exit(1) 