from pyresparser import ResumeParser

# Use an existing resume file for testing
resume_path = 'backend/uploads/resume_567a58e2-b387-4e97-9136-86579b717222_20250701_124315.pdf'

try:
    data = ResumeParser(resume_path).get_extracted_data()
    print('Extracted data:', data)
except Exception as e:
    print('Error:', e) 