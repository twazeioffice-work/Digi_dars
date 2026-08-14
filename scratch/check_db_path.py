import sys
import os
sys.path.insert(0, "/app")

import sqlite3
from app.core.config import settings

db_url = str(settings.SQLALCHEMY_DATABASE_URI)
print("Configured DB URL:", db_url)

if db_url.startswith("sqlite:////"):
    db_file = db_url.replace("sqlite:////", "/")
elif db_url.startswith("sqlite:///"):
    db_file = db_url.replace("sqlite:///", "")
else:
    db_file = "digidars.db"

print("Absolute DB File path:", os.path.abspath(db_file), "Exists?", os.path.exists(db_file))

conn = sqlite3.connect(db_file)
cursor = conn.cursor()
tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print("Tables in DB:", tables)

if "transactions" in tables:
    cols = [row[1] for row in cursor.execute("PRAGMA table_info(transactions);").fetchall()]
    print("Existing transactions columns:", cols)
    
    for col in ["donor_name", "donor_phone", "recipient_name", "recipient_phone"]:
        if col not in cols:
            print(f"Adding column '{col}' to transactions table...")
            cursor.execute(f"ALTER TABLE transactions ADD COLUMN {col} VARCHAR;")
            conn.commit()
            print(f"Column '{col}' added successfully.")
    
    cols_after = [row[1] for row in cursor.execute("PRAGMA table_info(transactions);").fetchall()]
    print("Updated transactions columns:", cols_after)

conn.close()
