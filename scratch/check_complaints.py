from app.database import SessionLocal
from app.models.auth import User
from app.models.complaint import Complaint

db = SessionLocal()
print("=== USERS ===")
for u in db.query(User).all():
    print(f"ID={u.id} | Email={u.email} | Role={u.role} | CenterID={u.center_id} | Name={u.full_name}")

print("\n=== COMPLAINTS ===")
for c in db.query(Complaint).all():
    print(f"ID={c.id} | Cat={c.category} | Status={c.status} | CenterID={c.center_id} | AssignedNazim={c.assigned_to_nazim_id}")
