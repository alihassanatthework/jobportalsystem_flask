#!/usr/bin/env python3
"""
Reset Database to SQLite
This will create a fresh SQLite database and test all relationships
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, 'backend')

def reset_database():
    """Reset database to SQLite and test"""
    try:
        print("🔧 Setting up SQLite database...")
        
        # Set environment variable to force SQLite
        os.environ['DATABASE_URL'] = 'sqlite:///job_portal.db'
        
        print("📦 Importing modules...")
        from backend.main import app
        
        print("🏗️  Using existing app...")
        
        with app.app_context():
            from backend.app import db
            
            print("🗑️  Dropping all tables...")
            db.drop_all()
            
            print("🏗️  Creating all tables...")
            db.create_all()
            
            print("✅ Database created successfully!")
            
            # Test importing all models
            print("📦 Testing model imports...")
            from backend.app.models import (
                User, UserProfile, Job, JobCategory, Application, 
                Message, Conversation, Notification, Wishlist, 
                Feedback, UserAnalytics, JobAnalytics
            )
            print("✅ All models imported successfully!")
            
            # Test creating a user
            print("👤 Testing user creation...")
            from backend.app.models.user import UserRole
            from backend.app import bcrypt
            
            user = User(
                email="test@example.com",
                role=UserRole.JOB_SEEKER
            )
            user.set_password("testpassword123")
            
            db.session.add(user)
            db.session.commit()
            
            print(f"✅ User created: {user.id}")
            
            # Test creating profile
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
            
            print("🎉 All tests passed! SQLite database is working.")
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting SQLite database reset...")
    success = reset_database()
    
    if success:
        print("✅ Database reset completed successfully!")
        print("📁 SQLite database file: job_portal.db")
    else:
        print("❌ Database reset failed!")
        sys.exit(1) 