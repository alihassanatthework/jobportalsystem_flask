#!/usr/bin/env python3
"""
Test script for file viewing functionality
"""
import requests
import json
import os

def test_file_viewing():
    """Test the file viewing endpoints"""
    
    base_url = "http://localhost:5000"
    
    print("=== File Viewing Test ===")
    print(f"Backend URL: {base_url}")
    
    # Test with a sample file if available
    sample_files = [
        "resume_567a58e2-b387-4e97-9136-86579b717222_20250701_124315.pdf",
        "resume_567a58e2-b387-4e97-9136-86579b717222_20250701_124327.pdf",
        "resume_567a58e2-b387-4e97-9136-86579b717222_20250701_124334.pdf"
    ]
    
    print("\n=== Available Endpoints ===")
    print("1. Authenticated file viewing:")
    print("   GET /api/users/uploads/<filename>")
    print("   - Requires JWT token")
    print("   - Users can only access their own files")
    
    print("\n2. Public file viewing:")
    print("   GET /api/users/public/uploads/<filename>")
    print("   - No authentication required")
    print("   - Basic security checks")
    
    print("\n3. File download:")
    print("   GET /api/users/uploads/<filename>?download=true")
    print("   - Requires JWT token")
    print("   - Forces file download")
    
    print("\n=== Sample Files Found ===")
    for filename in sample_files:
        file_path = f"backend/uploads/{filename}"
        if os.path.exists(file_path):
            print(f"✅ {filename}")
        else:
            print(f"❌ {filename} (not found)")
    
    print("\n=== How to Test ===")
    print("1. Start the backend server: cd backend && python main.py")
    print("2. Start the frontend: npm run dev")
    print("3. Login as a job seeker")
    print("4. Go to Profile page")
    print("5. Upload a CV/resume file")
    print("6. Click 'View' to see the file in browser")
    print("7. Click 'Download' to download the file")
    
    print("\n=== Expected Features ===")
    print("✅ File viewing in browser (PDF, DOC, DOCX)")
    print("✅ File downloading")
    print("✅ Security checks (users can only access their files)")
    print("✅ Proper content types")
    print("✅ Error handling for missing files")
    print("✅ Public viewing option")

if __name__ == "__main__":
    test_file_viewing() 