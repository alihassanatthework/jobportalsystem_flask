# Job Portal - Full Stack Application

A modern job portal built with React (TypeScript) frontend and Flask (Python) backend, featuring CV parsing, user authentication, job posting, and application management.

## 🚀 Features

### For Job Seekers
- **Profile Management**: Create and update professional profiles
- **CV Parsing**: Upload and automatically parse CV/resume files (PDF, DOC, DOCX, TXT)
- **Smart Profile Population**: Automatically fill profile fields from parsed CV data
- **Job Search**: Browse and search available job postings
- **Application Tracking**: Track application status and history
- **Wishlist**: Save interesting jobs for later
- **File Management**: Upload, view, download, and manage resume files

### For Employers
- **Company Profiles**: Create and manage company information
- **Job Posting**: Create, edit, and manage job listings
- **Application Management**: Review and manage job applications
- **Candidate Search**: Browse job seeker profiles
- **Dashboard**: Comprehensive overview of job postings and applications

### For Administrators
- **User Management**: Monitor and manage user accounts
- **System Analytics**: View platform usage statistics
- **Content Moderation**: Review and approve content

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Lucide React** for icons

### Backend
- **Flask** (Python) web framework
- **SQLAlchemy** ORM
- **Alembic** for database migrations
- **Flask-JWT-Extended** for authentication
- **PyPDF2** for PDF parsing
- **python-docx** for DOC/DOCX parsing
- **spaCy** for natural language processing

### Database
- **SQLite** (development)
- **PostgreSQL** (production ready)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd frontend
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Create and activate virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Install additional dependencies for CV parsing
```bash
pip install PyPDF2 python-docx
python -m spacy download en_core_web_sm
```

#### Set up environment variables
Create a `.env` file in the backend directory:
```env
FLASK_APP=main.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/job_portal.db
JWT_SECRET_KEY=your-jwt-secret-key-here
```

#### Initialize the database
```bash
python init_db.py
```

#### Run database migrations
```bash
alembic upgrade head
```

#### Start the backend server
```bash
python main.py
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to client directory
```bash
cd client
```

#### Install Node.js dependencies
```bash
npm install
```

#### Start the development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── backend/                 # Flask backend
│   ├── app/                # Application modules
│   │   ├── auth/           # Authentication routes
│   │   ├── jobs/           # Job management routes
│   │   ├── users/          # User profile routes
│   │   ├── applications/   # Application routes
│   │   ├── models/         # Database models
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   ├── uploads/            # File uploads
│   ├── main.py            # Flask application entry
│   └── requirements.txt   # Python dependencies
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── main.tsx        # Application entry
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── shared/                 # Shared TypeScript schemas
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
FLASK_APP=main.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/job_portal.db
JWT_SECRET_KEY=your-jwt-secret-key-here
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **user_profiles**: Extended user profile information
- **jobs**: Job postings and details
- **applications**: Job applications and status
- **messages**: User communication system

### Profile Types
- **Job Seeker Profiles**: Skills, experience, education, resume
- **Employer Profiles**: Company information, industry, size

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Registration**: Users can register as job seekers or employers
- **Login**: Secure login with JWT token generation
- **Protected Routes**: API endpoints require valid JWT tokens
- **Token Refresh**: Automatic token refresh mechanism

## 📄 CV Parsing Features

### Supported Formats
- **PDF**: Primary format with PyPDF2 extraction
- **DOC/DOCX**: Microsoft Word documents
- **TXT**: Plain text resumes

### Extracted Information
- **Personal Details**: Name, phone, email
- **Skills**: Technical and soft skills
- **Experience**: Work history and roles
- **Education**: Academic background
- **Languages**: Language proficiencies
- **Certifications**: Professional certifications

### Automatic Profile Population
- Parsed data automatically fills profile forms
- Users can review and edit extracted information
- Structured data storage for better search

## 🚀 Deployment

### Backend Deployment
1. Set up a production server (AWS, Heroku, DigitalOcean)
2. Install Python and dependencies
3. Set production environment variables
4. Use a production database (PostgreSQL recommended)
5. Set up a WSGI server (Gunicorn)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to a static hosting service (Vercel, Netlify, AWS S3)
3. Configure environment variables for production API URL

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd client
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### User Profile Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/parse-cv` - Parse CV file
- `POST /api/users/profile/upload-resume` - Upload resume

### Job Endpoints
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job posting
- `PUT /api/jobs/{id}` - Update job posting
- `DELETE /api/jobs/{id}` - Delete job posting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔄 Version History

- **v1.0.0** - Initial release with basic job portal functionality
- **v1.1.0** - Added CV parsing and automatic profile population
- **v1.2.0** - Enhanced file management and user experience

---

**Built with ❤️ using React, Flask, and modern web technologies**
