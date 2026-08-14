import requests

BASE_URL = "http://localhost:8001/api/v1/auth/login"

accounts = [
    {"role": "SUPER_ADMIN", "email": "admin@darscrm.com", "password": "SuperSecurePassword123!"},
    {"role": "NAZIM", "email": "a@yahoo.com", "password": "NazimPassword123!"},
    {"role": "USTAD", "email": "d@yahoo.com", "password": "UstadPassword123!"},
    {"role": "STUDENT", "email": "a@gmail.com", "password": "StudentPassword123!"},
]

print("=== TESTING LOGINS ===")
for acc in accounts:
    res = requests.post(BASE_URL, json={"email": acc["email"], "password": acc["password"]})
    if res.status_code == 200:
        data = res.json()
        print(f"SUCCESS [{acc['role']}]: {acc['email']} -> Token acquired ({data.get('user', {}).get('role')})")
    else:
        print(f"FAILED [{acc['role']}]: {acc['email']} -> Status {res.status_code}: {res.text}")
