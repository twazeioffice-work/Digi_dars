import sqlite3

conn = sqlite3.connect("/app/digi_dars.db")
cursor = conn.cursor()
cursor.execute("DELETE FROM transactions WHERE description LIKE 'Test%';")
conn.commit()
print("Cleaned up test transaction records. Remaining count:", cursor.execute("SELECT COUNT(*) FROM transactions;").fetchone()[0])
conn.close()
