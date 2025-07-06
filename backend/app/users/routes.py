from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserProfile, UserRole
from app.utils.validators import validate_email, validate_phone, validate_url, sanitize_input
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from pyresparser import ResumeParser
import tempfile

users_bp = Blueprint('users', __name__)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uploads'))

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        profile_dict = user.profile.to_dict() if user.profile else None
        print('DEBUG: Returning profile:', profile_dict)
        return jsonify({
            'user': user.to_dict(),
            'profile': profile_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user profile
        if user.profile:
            profile = user.profile
        else:
            profile = UserProfile(user_id=user.id)
            db.session.add(profile)
        
        # Update basic information
        if data.get('first_name'):
            profile.first_name = sanitize_input(data['first_name'])
        if data.get('last_name'):
            profile.last_name = sanitize_input(data['last_name'])
        if data.get('phone'):
            if validate_phone(data['phone']):
                profile.phone = data['phone']
            else:
                return jsonify({'error': 'Invalid phone number'}), 400
        
        # Update location
        if data.get('country'):
            profile.country = sanitize_input(data['country'])
        if data.get('state'):
            profile.state = sanitize_input(data['state'])
        if data.get('city'):
            profile.city = sanitize_input(data['city'])
        if data.get('address'):
            profile.address = sanitize_input(data['address'])
        
        # Update professional information (for job seekers)
        if user.role == UserRole.JOB_SEEKER:
            if data.get('headline'):
                profile.headline = sanitize_input(data['headline'])
            if data.get('summary'):
                profile.summary = sanitize_input(data['summary'])
            if data.get('experience_years') is not None:
                profile.experience_years = data['experience_years']
            if data.get('current_salary') is not None:
                profile.current_salary = data['current_salary']
            if data.get('expected_salary') is not None:
                profile.expected_salary = data['expected_salary']
            if data.get('skills'):
                profile.skills = data['skills']
            if data.get('education'):
                profile.education = data['education']
            if data.get('work_experience'):
                profile.work_experience = data['work_experience']
            if data.get('certifications'):
                profile.certifications = data['certifications']
            if data.get('languages'):
                profile.languages = data['languages']
        
        # Update company information (for employers)
        if user.role == UserRole.EMPLOYER:
            if data.get('company_name'):
                profile.company_name = sanitize_input(data['company_name'])
            if data.get('company_website'):
                if validate_url(data['company_website']):
                    profile.company_website = data['company_website']
                else:
                    return jsonify({'error': 'Invalid website URL'}), 400
            if data.get('company_description'):
                profile.company_description = sanitize_input(data['company_description'])
            if data.get('company_size'):
                profile.company_size = sanitize_input(data['company_size'])
            if data.get('industry'):
                profile.industry = sanitize_input(data['industry'])
            if data.get('founded_year'):
                profile.founded_year = data['founded_year']
        
        # Update social links
        if data.get('linkedin_url'):
            if validate_url(data['linkedin_url']):
                profile.linkedin_url = data['linkedin_url']
            else:
                return jsonify({'error': 'Invalid LinkedIn URL'}), 400
        if data.get('github_url'):
            if validate_url(data['github_url']):
                profile.github_url = data['github_url']
            else:
                return jsonify({'error': 'Invalid GitHub URL'}), 400
        if data.get('portfolio_url'):
            if validate_url(data['portfolio_url']):
                profile.portfolio_url = data['portfolio_url']
            else:
                return jsonify({'error': 'Invalid portfolio URL'}), 400
        
        # Update preferences
        if data.get('job_preferences'):
            profile.job_preferences = data['job_preferences']
        if data.get('notification_preferences'):
            profile.notification_preferences = data['notification_preferences']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/upload-resume', methods=['POST'])
@jwt_required()
def upload_resume():
    print('DEBUG: request.files =', request.files)
    print('DEBUG: request.form =', request.form)
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != UserRole.JOB_SEEKER:
            return jsonify({'error': 'Only job seekers can upload resumes'}), 403
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        allowed_extensions = {'pdf', 'doc', 'docx'}
        if not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'}), 400
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        filename = f"resume_{user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        resume_url = f"/uploads/{filename}"
        if user.profile:
            user.profile.resume_url = resume_url
            db.session.commit()
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume_url': resume_url
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload profile picture"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'avatar' not in request.files:
            return jsonify({'error': 'No avatar file provided'}), 400
        
        file = request.files['avatar']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif'}
        if not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
            return jsonify({'error': 'Invalid file type. Only JPG, PNG, and GIF files are allowed'}), 400
        
        # In a real implementation, you would upload to cloud storage
        # For now, we'll just save the filename
        filename = f"avatar_{user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
        
        if user.profile:
            user.profile.profile_picture = filename
            db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'avatar_url': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # In a real implementation, you might want to anonymize data instead of deleting
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/parse-cv', methods=['POST'])
@jwt_required()
def parse_cv():
    """Parse uploaded CV and extract key information for job seekers"""
    temp_path = None
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != UserRole.JOB_SEEKER:
            return jsonify({'error': 'Only job seekers can parse CVs'}), 403

        if 'cv' not in request.files:
            return jsonify({'error': 'No CV file provided'}), 400
        file = request.files['cv']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        allowed_extensions = {'pdf', 'doc', 'docx', 'txt'}
        file_extension = file.filename.lower().split('.')[-1]
        if file_extension not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed'}), 400

        # Save file temporarily with proper extension
        import os
        temp_fd, temp_path = tempfile.mkstemp(suffix=f'.{file_extension}')
        os.close(temp_fd)
        
        # Save the uploaded file
        file.save(temp_path)
        
        # Verify file exists and has content
        if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
            return jsonify({'error': 'Failed to save uploaded file'}), 500

        print(f"DEBUG: Saved file to {temp_path}, size: {os.path.getsize(temp_path)} bytes")

        # Extract text content from file
        text_content = ""
        try:
            if file_extension == 'pdf':
                import PyPDF2
                with open(temp_path, 'rb') as pdf_file:
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    for page in pdf_reader.pages:
                        text_content += page.extract_text() + "\n"
            elif file_extension in ['doc', 'docx']:
                # For DOC/DOCX files, try to extract text using python-docx
                try:
                    from docx import Document
                    doc = Document(temp_path)
                    for paragraph in doc.paragraphs:
                        text_content += paragraph.text + "\n"
                except ImportError:
                    # If python-docx is not available, return error
                    return jsonify({'error': 'DOC/DOCX parsing requires python-docx library'}), 500
            else:  # txt file
                with open(temp_path, 'r', encoding='utf-8', errors='ignore') as txt_file:
                    text_content = txt_file.read()
            
            print(f"DEBUG: Extracted {len(text_content)} characters of text")
            
        except Exception as text_error:
            print(f"DEBUG: Text extraction error: {str(text_error)}")
            return jsonify({'error': f'Failed to extract text from file: {str(text_error)}'}), 500

        # Parse the extracted text using pattern matching
        data = _parse_cv_text(text_content)
        
        # Remove the temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        # Enhanced data extraction with better field mapping
        extracted = {
            'username': data.get('name', '').strip() if data.get('name') else '',
            'phone': data.get('phone', '') or '',
            'skills': ', '.join(data.get('skills', [])) if data.get('skills') else '',
            'summary': data.get('summary', '') or '',
            'experience_years': _extract_experience_years(data.get('experience', [])),
            'education_level': _extract_highest_education(data.get('education', [])),
            'work_experience': _format_work_experience(data.get('experience', [])),
            'education': _format_education(data.get('education', [])),
            'languages': _extract_languages(data.get('languages', [])),
            'certifications': _extract_certifications(data.get('certifications', [])),
            'headline': _extract_headline(data.get('experience', []), data.get('skills', [])),
        }
        
        # Clean up extracted data - remove empty values
        extracted = {k: v for k, v in extracted.items() if v and v != ''}
        
        print(f"DEBUG: Final extracted data: {list(extracted.keys())}")
        
        return jsonify({
            'message': 'CV parsed successfully',
            'extracted': extracted,
            'raw_data': data  # Include raw data for debugging
        }), 200
        
    except Exception as e:
        print(f"DEBUG: General error in parse_cv: {str(e)}")
        # Clean up temp file if it exists
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
        return jsonify({'error': f'Failed to process CV: {str(e)}'}), 500

def _parse_cv_text(text_content):
    """Parse CV text content using pattern matching"""
    import re
    
    # Convert to lowercase for case-insensitive matching
    text_lower = text_content.lower()
    lines = text_content.split('\n')
    
    data = {
        'name': '',
        'phone': '',
        'email': '',
        'skills': [],
        'summary': '',
        'experience': [],
        'education': [],
        'languages': [],
        'certifications': []
    }
    
    # Extract name (usually the first line or after "name:")
    for i, line in enumerate(lines[:5]):  # Check first 5 lines
        line_stripped = line.strip()
        if line_stripped and not any(keyword in line_stripped.lower() for keyword in ['phone', 'email', 'address', 'summary', 'experience', 'education']):
            # This might be the name
            data['name'] = line_stripped
            break
    
    # Extract phone number
    phone_patterns = [
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # (555) 123-4567 or 555-123-4567
        r'\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}',  # International format
    ]
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text_content)
        if phone_match:
            data['phone'] = phone_match.group()
            break
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text_content)
    if email_match:
        data['email'] = email_match.group()
    
    # Extract skills
    skills_section = _extract_section(text_content, ['skills', 'technical skills', 'competencies', 'technologies'])
    if skills_section:
        # Split by common delimiters and clean up
        skills = re.split(r'[,;•\n]', skills_section)
        data['skills'] = [skill.strip() for skill in skills if skill.strip() and len(skill.strip()) > 1]
    
    # Extract summary/objective
    summary_section = _extract_section(text_content, ['summary', 'objective', 'profile', 'about'])
    if summary_section:
        data['summary'] = summary_section[:500]  # Limit to 500 characters
    
    # Extract experience
    experience_section = _extract_section(text_content, ['experience', 'work experience', 'employment history', 'professional experience'])
    if experience_section:
        # Split into individual experiences
        experiences = re.split(r'\n(?=[A-Z][a-z]+\s+at\s+|\d{4}|[A-Z][a-z]+\s+\d{4})', experience_section)
        data['experience'] = [exp.strip() for exp in experiences if exp.strip()]
    
    # Extract education
    education_section = _extract_section(text_content, ['education', 'academic background', 'qualifications'])
    if education_section:
        # Split into individual education entries
        educations = re.split(r'\n(?=[A-Z][a-z]+\s+|\d{4}|University|College|School)', education_section)
        data['education'] = [edu.strip() for edu in educations if edu.strip()]
    
    # Extract languages
    languages_section = _extract_section(text_content, ['languages', 'language skills'])
    if languages_section:
        languages = re.split(r'[,;•\n]', languages_section)
        data['languages'] = [lang.strip() for lang in languages if lang.strip()]
    
    # Extract certifications
    certifications_section = _extract_section(text_content, ['certifications', 'certificates', 'accreditations'])
    if certifications_section:
        certifications = re.split(r'\n(?=[A-Z]|\d{4})', certifications_section)
        data['certifications'] = [cert.strip() for cert in certifications if cert.strip()]
    
    return data

def _extract_section(text, keywords):
    """Extract a section from text based on keywords"""
    lines = text.split('\n')
    section_start = -1
    section_end = -1
    
    # Find section start
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if any(keyword in line_lower for keyword in keywords):
            section_start = i + 1
            break
    
    if section_start == -1:
        return None
    
    # Find section end (next major section)
    major_sections = ['experience', 'education', 'skills', 'languages', 'certifications', 'projects', 'achievements']
    for i in range(section_start, len(lines)):
        line_lower = lines[i].lower().strip()
        if any(section in line_lower for section in major_sections) and len(line_lower) < 50:
            section_end = i
            break
    
    if section_end == -1:
        section_end = len(lines)
    
    # Extract section content
    section_lines = lines[section_start:section_end]
    return '\n'.join(section_lines).strip()

def _extract_experience_years(experience_list):
    """Extract total years of experience from experience list"""
    if not experience_list:
        return ''
    
    try:
        # Simple heuristic: count number of experiences and estimate years
        # This is a basic implementation - could be enhanced with date parsing
        return str(len(experience_list))
    except:
        return ''

def _extract_highest_education(education_list):
    """Extract highest education level"""
    if not education_list:
        return ''
    
    education_levels = ['phd', 'doctorate', 'master', 'bachelor', 'associate', 'diploma', 'high school']
    
    for edu in education_list:
        edu_lower = str(edu).lower()
        for level in education_levels:
            if level in edu_lower:
                return level.title()
    
    return education_list[0] if education_list else ''

def _format_work_experience(experience_list):
    """Format work experience for JSON storage"""
    if not experience_list:
        return []
    
    formatted = []
    for exp in experience_list:
        if isinstance(exp, str):
            formatted.append({
                'title': exp,
                'company': '',
                'duration': '',
                'description': exp
            })
        elif isinstance(exp, dict):
            formatted.append(exp)
    
    return formatted

def _format_education(education_list):
    """Format education for JSON storage"""
    if not education_list:
        return []
    
    formatted = []
    for edu in education_list:
        if isinstance(edu, str):
            formatted.append({
                'degree': edu,
                'institution': '',
                'year': '',
                'description': edu
            })
        elif isinstance(edu, dict):
            formatted.append(edu)
    
    return formatted

def _extract_languages(languages_list):
    """Extract languages and proficiency levels"""
    if not languages_list:
        return []
    
    formatted = []
    for lang in languages_list:
        if isinstance(lang, str):
            formatted.append({
                'language': lang,
                'proficiency': 'Fluent'
            })
        elif isinstance(lang, dict):
            formatted.append(lang)
    
    return formatted

def _extract_certifications(certifications_list):
    """Extract certifications"""
    if not certifications_list:
        return []
    
    formatted = []
    for cert in certifications_list:
        if isinstance(cert, str):
            formatted.append({
                'name': cert,
                'issuer': '',
                'year': '',
                'description': cert
            })
        elif isinstance(cert, dict):
            formatted.append(cert)
    
    return formatted

def _extract_headline(experience_list, skills_list):
    """Extract professional headline from experience and skills"""
    if experience_list:
        # Use the most recent job title
        if isinstance(experience_list[0], dict) and 'title' in experience_list[0]:
            return experience_list[0]['title']
        elif isinstance(experience_list[0], str):
            return experience_list[0]
    
    if skills_list:
        # Create headline from top skills
        top_skills = skills_list[:3] if len(skills_list) > 3 else skills_list
        return f"{', '.join(top_skills)} Professional"
    
    return "Professional"

@users_bp.route('/profile/delete-resume', methods=['DELETE'])
@jwt_required()
def delete_resume():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != UserRole.JOB_SEEKER:
            return jsonify({'error': 'Only job seekers can delete resumes'}), 403
        if not user.profile or not user.profile.resume_url:
            return jsonify({'error': 'No resume to delete'}), 400
        # Delete the file from disk
        import os
        file_path = os.path.abspath(f"backend{user.profile.resume_url}")
        if os.path.exists(file_path):
            os.remove(file_path)
        # Clear the resume_url field
        user.profile.resume_url = None
        db.session.commit()
        return jsonify({'message': 'Resume deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/uploads/<filename>')
@jwt_required()
def serve_uploaded_file(filename):
    """Serve uploaded files (resumes, CVs, etc.)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Security check: only allow users to access their own files
        if not filename.startswith(f"resume_{user.id}_"):
            return jsonify({'error': 'Access denied'}), 403
        
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Check if this is a download request
        download = request.args.get('download', 'false').lower() == 'true'
        
        # Determine content type based on file extension
        content_type = 'application/octet-stream'
        if filename.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif filename.lower().endswith('.doc'):
            content_type = 'application/msword'
        elif filename.lower().endswith('.docx'):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        return send_from_directory(
            UPLOAD_FOLDER, 
            filename, 
            as_attachment=download,
            mimetype=content_type
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/public/uploads/<filename>')
def serve_public_file(filename):
    """Serve uploaded files publicly (for viewing purposes)"""
    try:
        # Basic security: only allow resume files
        if not filename.startswith("resume_") or not any(filename.lower().endswith(ext) for ext in ['.pdf', '.doc', '.docx']):
            return jsonify({'error': 'Access denied'}), 403
        
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Determine content type based on file extension
        content_type = 'application/octet-stream'
        if filename.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif filename.lower().endswith('.doc'):
            content_type = 'application/msword'
        elif filename.lower().endswith('.docx'):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        return send_from_directory(
            UPLOAD_FOLDER, 
            filename, 
            as_attachment=False,
            mimetype=content_type
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 