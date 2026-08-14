import sqlite3

conn = sqlite3.connect("/app/digi_dars.db")
tables = [t[0] for t in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("TABLES IN DB:", tables)

if "centers" in tables:
    centers = conn.execute("SELECT id, name, code, status FROM centers").fetchall()
    print("CENTERS COUNT:", len(centers))
    for c in centers:
        print(c)

if "users" in tables:
    users = conn.execute("SELECT id, full_name, email, role, center_id FROM users").fetchall()
    print("USERS COUNT:", len(users))
    for u in users:
        print(u)
