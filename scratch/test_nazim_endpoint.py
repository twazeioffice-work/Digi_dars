from app.database import SessionLocal
from app.models.auth import User
from app.models.complaint import Complaint
from app.api.v1.complaints import get_nazim_assigned_complaints
from app.core.context import current_user_id, current_tenant_id, current_user_role

db = SessionLocal()
nazims = db.query(User).filter(User.role == "NAZIM").all()
for nazim in nazims:
    print("\n--- Testing as Nazim:", nazim.email, "ID:", nazim.id, "CenterID:", nazim.center_id)
    current_user_id.set(nazim.id)
    current_tenant_id.set(nazim.center_id)
    current_user_role.set("NAZIM")

    result = get_nazim_assigned_complaints(db=db)
    print("Result count:", len(result))
    for r in result:
        print("  Complaint ID:", r.id, "| Status:", r.status, "| Category:", r.category)
