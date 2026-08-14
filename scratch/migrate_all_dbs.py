import sqlite3
import os

print("Current dir:", os.getcwd())
print("Listdir:", os.listdir("."))

for f in os.listdir("."):
    if f.endswith(".db"):
        print("Found DB file:", f)
        conn = sqlite3.connect(f)
        cursor = conn.cursor()
        tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
        print(f"Tables in {f}:", tables)
        if "transactions" in tables:
            cols = [r[1] for r in cursor.execute("PRAGMA table_info(transactions);").fetchall()]
            print(f"Transactions columns in {f}:", cols)
            for c in ["donor_name", "donor_phone", "recipient_name", "recipient_phone"]:
                if c not in cols:
                    print(f"Adding column '{c}' to {f}...")
                    cursor.execute(f"ALTER TABLE transactions ADD COLUMN {c} VARCHAR;")
            conn.commit()
            print("Successfully migrated columns in", f)
        conn.close()
