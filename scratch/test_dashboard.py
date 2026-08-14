from app.database import SessionLocal
from app.services.academic_dars import get_nazim_dashboard_service

db = SessionLocal()
res = get_nazim_dashboard_service(db, None)
print("=== NAZIM DASHBOARD METRICS ===")
print("Center Name:", res["center_name"])
print("Total Students:", res["total_students"])
print("Zakat Eligible:", res["zakat_eligible_count"])
print("Active Halqas:", res["active_halqas"])
print("Overall Attendance:", res["overall_attendance"])
print("Attendance Trend:", res["attendance_trend"])
print("Halqas List:", res["halqas"])
