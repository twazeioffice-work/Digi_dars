import random
import uuid
from locust import HttpUser, task, between, SequentialTaskSet

class UstadDailyWorkflow(SequentialTaskSet):
    """
    Defines the step-by-step sequential workflow for an Ustad user:
    1. Login to retrieve the JWT.
    2. Fetch student list.
    3. Loop through submitting Tarbiyyah attendance.
    """
    student_ids = []

    def on_start(self):
        """Executed immediately when a simulated Ustad user spawns."""
        # 1. Authenticate via login endpoint
        # Pick a random Ustad account from seeded test users
        ustad_id_num = random.randint(1, 50)
        login_payload = {
            "email": f"ustad_{ustad_id_num}@darscrm.com",
            "password": "SuperSecurePassword123!"
        }

        with self.client.post(
            "/api/v1/auth/login", 
            json=login_payload, 
            catch_response=True,
            name="/api/v1/auth/login"
        ) as response:
            if response.status_code == 200:
                token = response.json().get("access_token")
                # Attach JWT token to all subsequent HTTP requests in this session
                self.client.headers.update({"Authorization": f"Bearer {token}"})
                response.success()
            else:
                # Fallback login payload for single-user dev testing if seeded user not found
                dev_login_payload = {
                    "email": "ustad@darscrm.com",
                    "password": "SuperSecurePassword123!"
                }
                with self.client.post(
                    "/api/v1/auth/login",
                    json=dev_login_payload,
                    catch_response=True,
                    name="/api/v1/auth/login [dev fallback]"
                ) as dev_res:
                    if dev_res.status_code == 200:
                        token = dev_res.json().get("access_token")
                        self.client.headers.update({"Authorization": f"Bearer {token}"})
                        dev_res.success()
                    else:
                        response.failure(f"Login failed ({response.status_code}): {response.text}")
                        return

        # 2. Fetch Halqa student list to get valid student UUIDs
        with self.client.get(
            "/api/v1/academic/halqa/students", 
            catch_response=True,
            name="/api/v1/academic/halqa/students"
        ) as response:
            if response.status_code == 200:
                students = response.json()
                self.student_ids = [s["id"] for s in students] if isinstance(students, list) else []
                response.success()
            else:
                # Fallback to a mock UUID if roster fetch fails or is empty
                self.student_ids = [str(uuid.uuid4())]

    @task
    def submit_tarbiyyah_log(self):
        """Task: Submit daily Tarbiyyah & Prayer attendance for a student."""
        # Select a random student from the roster
        student_id = random.choice(self.student_ids) if self.student_ids else str(uuid.uuid4())

        tarbiyyah_payload = {
            "student_id": student_id,
            "fajr": random.choice(["PRESENT_IN_JAMAAT", "LATE", "PRAYED_ALONE"]),
            "zuhr": "PRESENT_IN_JAMAAT",
            "asr": "PRESENT_IN_JAMAAT",
            "maghrib": "PRESENT_IN_JAMAAT",
            "isha": "PRESENT_IN_JAMAAT",
            "adab_score": random.randint(3, 5),
            "behavior_remarks": "Automated Locust load test log entry."
        }

        with self.client.post(
            "/api/v1/academic/tarbiyyah",
            json=tarbiyyah_payload,
            catch_response=True,
            name="/api/v1/academic/tarbiyyah [POST]"
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Tarbiyyah submission failed ({response.status_code}): {response.text}")


class UstadUser(HttpUser):
    # Simulates realistic human behavior: wait 1 to 3 seconds between requests
    wait_time = between(1, 3)
    tasks = [UstadDailyWorkflow]
