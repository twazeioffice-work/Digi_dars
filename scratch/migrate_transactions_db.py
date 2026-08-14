import sqlite3
import os

db_paths = ["/app/digidars.db", "/app/app.db", "/app/test.db", "digidars.db", "app.db"]

for path in db_paths:
    if os.path.exists(path):
        print(f"=== DB Path: {path} ===")
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        
        # Check tables
        tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
        print("Tables:", tables)
        
        if "transactions" in tables:
            cols = [row[1] for row in cursor.execute("PRAGMA table_info(transactions);").fetchall()]
            print("Transactions columns:", cols)
            
            # Add missing columns safely
            missing = []
            for col in ["donor_name", "donor_phone", "recipient_name", "recipient_phone"]:
                if col not in cols:
                    missing.append(col)
                    print(f"Adding missing column: {col}")
                    cursor.execute(f"ALTER TABLE transactions ADD COLUMN {col} VARCHAR;")
            
            conn.commit()
            print("Successfully migrated columns!")
        
        conn.close()
