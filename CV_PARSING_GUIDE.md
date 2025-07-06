# CV Parsing Feature Guide

## Overview

The CV parsing feature allows job seekers to automatically extract information from their CV/resume files and populate their profile. This feature uses the `pyresparser` library to parse PDF, DOC, and DOCX files.

## Features

### ✅ What's Implemented

1. **File Upload Support**
   - PDF files (.pdf)
   - Microsoft Word documents (.doc, .docx)
   - File validation and error handling

2. **Data Extraction**
   - **Personal Information**: Name, email, phone number
   - **Professional Summary**: Headline, summary, objective
   - **Skills**: Technical and soft skills
   - **Work Experience**: Job titles, companies, durations, descriptions
   - **Education**: Degrees, institutions, years
   - **Languages**: Language proficiency levels
   - **Certifications**: Certificates, issuers, years

3. **User Experience**
   - Drag & drop file upload
   - Real-time parsing feedback
   - Form auto-population
   - Structured data display
   - Error handling with user-friendly messages

4. **Data Management**
   - Temporary file handling
   - Structured JSON storage
   - Profile integration
   - Data validation

## How to Use

### For Job Seekers

1. **Login** to your account as a job seeker
2. **Navigate** to your Profile page
3. **Click** the "Upload & Parse CV" button
4. **Select** your CV file (PDF, DOC, or DOCX)
5. **Wait** for parsing to complete
6. **Review** the extracted information
7. **Edit** any fields if needed
8. **Save** your profile

### For Developers

#### Backend API Endpoint

```http
POST /api/users/profile/parse-cv
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Form Data:
- cv: <file>
```

#### Response Format

```json
{
  "message": "CV parsed successfully",
  "extracted": {
    "username": "John Doe",
    "phone": "+1234567890",
    "skills": "JavaScript, React, Node.js",
    "summary": "Experienced software engineer...",
    "experience_years": "5",
    "education_level": "Bachelor",
    "work_experience": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "duration": "2020-2023",
        "description": "Led development team..."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science",
        "institution": "University of Technology",
        "year": "2018",
        "description": "Computer Science"
      }
    ],
    "languages": [
      {
        "language": "English",
        "proficiency": "Native"
      }
    ],
    "certifications": [
      {
        "name": "AWS Certified Developer",
        "issuer": "Amazon Web Services",
        "year": "2022",
        "description": "Cloud development certification"
      }
    ],
    "headline": "Senior Software Engineer"
  },
  "raw_data": { /* Raw pyresparser output */ }
}
```

## Technical Implementation

### Backend (Flask)

**File**: `backend/app/users/routes.py`

- **Route**: `/profile/parse-cv` (POST)
- **Library**: `pyresparser`
- **File Handling**: Temporary file storage with cleanup
- **Data Processing**: Custom extraction and formatting functions
- **Error Handling**: Comprehensive error catching and user feedback

### Frontend (React + TypeScript)

**File**: `client/src/pages/profile-page.tsx`

- **Upload Component**: File input with drag & drop support
- **Data Mapping**: Automatic form population
- **Visual Display**: Structured data presentation
- **State Management**: React state for parsed data
- **User Feedback**: Toast notifications for success/error

### Helper Functions

The backend includes several helper functions for data processing:

- `_extract_experience_years()`: Calculate total experience
- `_extract_highest_education()`: Determine education level
- `_format_work_experience()`: Structure work history
- `_format_education()`: Structure education data
- `_extract_languages()`: Process language skills
- `_extract_certifications()`: Process certifications
- `_extract_headline()`: Generate professional headline

## File Structure

```
frontend/
├── backend/
│   ├── app/
│   │   ├── users/
│   │   │   └── routes.py          # CV parsing endpoint
│   │   └── models/
│   │       └── user.py            # User profile model
│   └── uploads/                   # Resume storage
├── client/
│   └── src/
│       └── pages/
│           └── profile-page.tsx   # CV upload UI
└── test_cv_parsing.py            # Test script
```

## Testing

### Manual Testing

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Login as a job seeker and test the feature

### Automated Testing

Run the test script:
```bash
python test_cv_parsing.py
```

## Error Handling

### Common Issues

1. **File Format Not Supported**
   - Only PDF, DOC, DOCX files are accepted
   - Clear error message displayed

2. **Parsing Failed**
   - File might be corrupted or password-protected
   - Suggestion to try another file or manual entry

3. **Network Issues**
   - Connection timeout handling
   - Retry mechanism

4. **Authentication Required**
   - JWT token validation
   - Redirect to login if needed

## Future Enhancements

### Planned Features

1. **Enhanced Parsing**
   - Better date extraction
   - Company information parsing
   - Contact information validation

2. **User Experience**
   - Progress bar for large files
   - Preview of parsed data before saving
   - Batch processing for multiple files

3. **Data Quality**
   - Confidence scores for extracted data
   - Manual correction suggestions
   - Data validation rules

4. **Integration**
   - LinkedIn profile import
   - Resume builder integration
   - Export to different formats

## Dependencies

### Backend
- `pyresparser`: CV/resume parsing
- `flask`: Web framework
- `flask-jwt-extended`: Authentication
- `werkzeug`: File handling

### Frontend
- `react`: UI framework
- `@tanstack/react-query`: API state management
- `lucide-react`: Icons
- `@radix-ui/react-toast`: Notifications

## Security Considerations

1. **File Validation**: Only allowed file types accepted
2. **Temporary Storage**: Files deleted after parsing
3. **Authentication**: JWT token required
4. **Input Sanitization**: All extracted data sanitized
5. **Error Handling**: No sensitive data exposed in errors

## Performance

- **File Size Limit**: 10MB maximum
- **Processing Time**: Typically 2-5 seconds
- **Memory Usage**: Temporary file cleanup
- **Caching**: Parsed data stored in user profile

---

**Note**: This feature is designed for job seekers to quickly populate their profiles. Always review and edit the extracted information before saving to ensure accuracy. 