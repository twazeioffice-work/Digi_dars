import sqlite3

conn = sqlite3.connect("/app/digi_dars.db")
cursor = conn.cursor()
users = cursor.execute("SELECT id, email, full_name, role, phone, center_id FROM users;").fetchall()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | Role: {u[3]} | Phone: {u[4]} | Center: {u[5]}")

conn.close()
