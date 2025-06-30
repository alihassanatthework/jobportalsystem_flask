#!/usr/bin/env python3
"""
Database Reset Script for HandmadeCareers
This script will reset the database and test all relationships
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

def reset_database():
    """Reset the database and test relationships"""
    try:
        from main import app, db
        
        with app.app_context():
            print("🗑️  Dropping all tables...")
            db.drop_all()
            
            print("🏗️  Creating all tables...")
            db.create_all()
            
            print("✅ Database reset successful!")
            print("📊 Testing model imports...")
            
            # Test importing all models
            from app.models import (
                User, UserProfile, Job, JobCategory, Application, 
                Message, Conversation, Notification, Wishlist, 
                Feedback, UserAnalytics, JobAnalytics
            )
            
            print("✅ All models imported successfully!")
            
            # Test creating a simple user
            print("🧪 Testing user creation...")
            from app.models.user import UserRole
            from app import bcrypt
            
            user = User(
                email="test@example.com",
                role=UserRole.JOB_SEEKER
            )
            user.set_password("testpassword123")
            
            db.session.add(user)
            db.session.commit()
            
            print(f"✅ User created successfully with ID: {user.id}")
            
            # Test creating user profile
            print("🧪 Testing profile creation...")
            profile = UserProfile(
                user_id=user.id,
                username="testuser"
            )
            
            db.session.add(profile)
            db.session.commit()
            
            print(f"✅ Profile created successfully!")
            
            # Test relationships
            print("🧪 Testing relationships...")
            print(f"User profile: {user.profile.username}")
            print(f"Profile user: {profile.user.email}")
            
            print("🎉 All tests passed! Database is ready.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting database reset...")
    success = reset_database()
    
    if success:
        print("✅ Database reset completed successfully!")
    else:
        print("❌ Database reset failed!")
        sys.exit(1) 