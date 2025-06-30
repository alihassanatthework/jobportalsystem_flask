import requests
import json

# Test the backend API
def test_backend():
    base_url = "http://localhost:5000/api"
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/jobs/categories")
        print(f"Categories endpoint: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
        else:
            print(f"❌ Backend returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        return
    
    # Test 2: Test CORS preflight
    try:
        headers = {
            'Origin': 'http://127.0.0.1:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        response = requests.options(f"{base_url}/jobs", headers=headers)
        print(f"CORS preflight: {response.status_code}")
        print(f"CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
    
    # Test 3: Test authentication endpoint
    try:
        response = requests.get(f"{base_url}/auth/me")
        print(f"Auth endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Auth test failed: {e}")

if __name__ == "__main__":
    test_backend() 