import requests
import json

# Test registration endpoint
def test_registration():
    url = "http://localhost:5000/api/auth/register"
    
    test_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "job_seeker"
    }
    
    try:
        response = requests.post(url, json=test_data, headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
        else:
            print("❌ Registration failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure the backend is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_registration() 