from main_app import create_app
from app import db
from app.models.job import JobCategory
from app.models.user import User, UserRole, UserProfile
from app import bcrypt
import uuid

def init_db():
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Add default job categories if they don't exist
        default_categories = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Software Development',
                'description': 'Software engineering, programming, and development roles',
                'icon': 'code',
                'color': '#3B82F6'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Data Science',
                'description': 'Data analysis, machine learning, and AI roles',
                'icon': 'chart',
                'color': '#10B981'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Design',
                'description': 'UI/UX design, graphic design, and creative roles',
                'icon': 'palette',
                'color': '#F59E0B'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Marketing',
                'description': 'Digital marketing, content creation, and growth roles',
                'icon': 'megaphone',
                'color': '#EF4444'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Sales',
                'description': 'Sales, business development, and account management',
                'icon': 'trending-up',
                'color': '#8B5CF6'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Customer Support',
                'description': 'Customer service, support, and success roles',
                'icon': 'headphones',
                'color': '#06B6D4'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Product Management',
                'description': 'Product management, strategy, and planning roles',
                'icon': 'target',
                'color': '#84CC16'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Operations',
                'description': 'Operations, project management, and administration',
                'icon': 'settings',
                'color': '#6B7280'
            }
        ]
        
        for category_data in default_categories:
            existing = JobCategory.query.filter_by(name=category_data['name']).first()
            if not existing:
                category = JobCategory(**category_data)
                db.session.add(category)
                print(f"Added category: {category_data['name']}")
        
        # Add a default admin user if it doesn't exist
        admin_email = 'admin@jobportal.com'
        admin_user = User.query.filter_by(email=admin_email).first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                email=admin_email,
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.session.add(admin_user)
            print(f"Added admin user: {admin_email}")
        
        # Add a default employer user if it doesn't exist
        employer_email = 'employer@jobportal.com'
        employer_user = User.query.filter_by(email=employer_email).first()
        if not employer_user:
            employer_user = User(
                id=str(uuid.uuid4()),
                email=employer_email,
                password_hash=bcrypt.generate_password_hash('employer123').decode('utf-8'),
                role=UserRole.EMPLOYER,
                is_active=True
            )
            db.session.add(employer_user)
            print(f"Added employer user: {employer_email}")
        
        # Add a default job seeker user if it doesn't exist
        jobseeker_email = 'jobseeker@jobportal.com'
        jobseeker_user = User.query.filter_by(email=jobseeker_email).first()
        if not jobseeker_user:
            jobseeker_user = User(
                id=str(uuid.uuid4()),
                email=jobseeker_email,
                password_hash=bcrypt.generate_password_hash('jobseeker123').decode('utf-8'),
                role=UserRole.JOB_SEEKER,
                is_active=True
            )
            db.session.add(jobseeker_user)
            print(f"Added job seeker user: {jobseeker_email}")
        
        db.session.commit()
        print("Database initialization completed!")

if __name__ == '__main__':
    init_db() 