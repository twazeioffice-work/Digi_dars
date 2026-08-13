from datetime import date, timedelta
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.academic import HifzLog, TarbiyyahLog

def fetch_weekly_remarks_for_all_students(db: Session) -> dict[str, dict]:
    """
    Fetches the past 7 days of logs and groups the text by student_id.
    Returns: { student_id: { "center_id": X, "text": "..." } }
    """
    seven_days_ago = date.today() - timedelta(days=7)
    grouped_data = defaultdict(lambda: {"center_id": None, "text": ""})

    # 1. Fetch Tarbiyyah Remarks
    tarbiyyah_logs = db.query(TarbiyyahLog).filter(
        TarbiyyahLog.log_date >= seven_days_ago,
        TarbiyyahLog.behavior_remarks.isnot(None)
    ).all()
    
    for log in tarbiyyah_logs:
        student_id_str = str(log.student_id)
        grouped_data[student_id_str]["center_id"] = str(log.center_id)
        grouped_data[student_id_str]["text"] += f"[{log.log_date}] Tarbiyyah: {log.behavior_remarks}\n"

    # 2. Fetch Hifz Remarks
    hifz_logs = db.query(HifzLog).filter(
        HifzLog.log_date >= seven_days_ago,
        HifzLog.remarks.isnot(None)
    ).all()

    for log in hifz_logs:
        student_id_str = str(log.student_id)
        grouped_data[student_id_str]["center_id"] = str(log.center_id)
        grouped_data[student_id_str]["text"] += f"[{log.log_date}] Hifz: {log.remarks}\n"

    return dict(grouped_data)
