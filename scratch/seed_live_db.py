import sqlite3
import bcrypt

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

conn = sqlite3.connect("/app/digi_dars.db")
cursor = conn.cursor()

# Ensure Super Admin exists
admin = cursor.execute("SELECT email FROM users WHERE role='SUPER_ADMIN';").fetchone()
if not admin:
    print("Seeding Super Admin account...")
    admin_id = "00000000-0000-0000-0000-000000000001"
    cursor.execute("""
        INSERT INTO users (id, email, full_name, role, hashed_password, is_active, phone)
        VALUES (?, ?, ?, ?, ?, 1, '+12345678900')
    """, (admin_id, "admin@darscrm.com", "System Administrator", "SUPER_ADMIN", get_password_hash("SuperSecurePassword123!")))

# Reset/Ensure passwords for active test accounts so user can login easily:
# 1. Super Admin
cursor.execute("UPDATE users SET hashed_password=? WHERE role='SUPER_ADMIN';", (get_password_hash("SuperSecurePassword123!"),))

# 2. Nazim (a@yahoo.com)
cursor.execute("UPDATE users SET hashed_password=? WHERE email='a@yahoo.com';", (get_password_hash("NazimPassword123!"),))

# 3. Ustad (d@yahoo.com)
cursor.execute("UPDATE users SET hashed_password=? WHERE email='d@yahoo.com';", (get_password_hash("UstadPassword123!"),))

# 4. Student (a@gmail.com)
cursor.execute("UPDATE users SET hashed_password=?, student_card_id='STU-101', kiosk_pin='1234' WHERE email='a@gmail.com';", (get_password_hash("StudentPassword123!"),))

conn.commit()

# Print all users in DB
users = cursor.execute("SELECT email, role, full_name, phone, student_card_id, kiosk_pin FROM users;").fetchall()
print("=== LIVE USER CREDENTIALS ===")
for u in users:
    print(f"Role: {u[1]} | Email: {u[0]} | Name: {u[2]} | Card ID: {u[4]} | Kiosk PIN: {u[5]}")

conn.close()
