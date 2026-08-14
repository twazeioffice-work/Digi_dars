from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from fastapi import HTTPException, status

from app.models.auth import Center, User
from app.models.enums import UserRole
from app.models.academic import Halqa, HalqaEnrollment, TarbiyyahLog, HifzLog, KitabLog
from app.models.performance import NazimDuty, StudentProgressCard, StaffProgressCard, InstitutionPerformance
from app.schemas.performance import NazimDutyCreate

def get_first_day_of_month(d: date) -> date:
    return date(d.year, d.month, 1)

def get_last_day_of_month(d: date) -> date:
    if d.month == 12:
        next_month = date(d.year + 1, 1, 1)
    else:
        next_month = date(d.year, d.month + 1, 1)
    return next_month - timedelta(days=1)

# ---------------------------------------------------------
# 1. STUDENT PROGRESS CARDS ENGINE
# ---------------------------------------------------------
def calculate_monthly_student_cards(db: Session, month_date: date) -> int:
    first_day = get_first_day_of_month(month_date)
    last_day = get_last_day_of_month(month_date)

    students = db.query(User).filter(User.role == UserRole.STUDENT.value, User.is_active == True).all()
    updated_count = 0
    first_center = db.query(Center).first()

    for student in students:
        center_id = student.center_id or (first_center.id if first_center else None)
        if not center_id:
            continue

        # Fetch Tarbiyyah logs for month
        t_logs = db.query(TarbiyyahLog).filter(
            TarbiyyahLog.student_id == student.id,
            TarbiyyahLog.log_date >= first_day,
            TarbiyyahLog.log_date <= last_day
        ).all()

        # Fetch Hifz / Kitab logs for month
        h_logs = db.query(HifzLog).filter(
            HifzLog.student_id == student.id,
            HifzLog.log_date >= first_day,
            HifzLog.log_date <= last_day
        ).all()

        # 1. Namaz Score
        namaz_score = 0.0
        if t_logs:
            total_prayers = 0
            prayed_count = 0
            for log in t_logs:
                for p in [log.fajr, log.zuhr, log.asr, log.maghrib, log.isha]:
                    if p:
                        total_prayers += 1
                        if p in ["PRESENT_IN_JAMAAT", "PRAYED_ALONE", "Jamaat", "Alone"]:
                            prayed_count += 1
            if total_prayers > 0:
                namaz_score = round((prayed_count / total_prayers) * 100.0, 2)

        # 2. Hygiene / Adab Score
        hygiene_score = 0.0
        if t_logs:
            adab_scores = [l.adab_score for l in t_logs if l.adab_score is not None]
            if adab_scores:
                avg_adab = sum(adab_scores) / len(adab_scores)
                # Map 1-5 scale to 20-100%
                hygiene_score = round((avg_adab / 5.0) * 100.0, 2)

        # 3. Study Score
        study_score = 0.0
        if h_logs:
            grade_map = {"EXCELLENT": 100.0, "GOOD": 80.0, "NEEDS_WORK": 50.0, "FAIL": 20.0}
            grades = [grade_map.get(l.sabaq_grade, 80.0) for l in h_logs if l.sabaq_grade]
            if grades:
                study_score = round(sum(grades) / len(grades), 2)

        # 4. Chores / Discipline Score
        chores_score = 0.0
        if not t_logs and not h_logs:
            namaz_score = 0.0
            hygiene_score = 0.0
            study_score = 0.0
            chores_score = 0.0
            overall_score = 0.0
        else:
            namaz_score = 100.0
            hygiene_score = 100.0
            study_score = 100.0
            chores_score = 100.0

            if t_logs:
                total_prayers = len(t_logs) * 5
                attended_prayers = sum(
                    1 for log in t_logs for p in [log.fajr, log.zuhr, log.asr, log.maghrib, log.isha]
                    if p in [JamaatStatus.PRESENT_IN_JAMAAT.value, JamaatStatus.PRAYED_ALONE.value]
                )
                namaz_score = round((attended_prayers / total_prayers) * 100.0, 2) if total_prayers > 0 else 0.0

                adab_avg = sum(log.adab_score for log in t_logs if log.adab_score is not None) / len(t_logs) if t_logs else 0.0
                hygiene_score = round((adab_avg / 5.0) * 100.0, 2)

            if h_logs:
                mastery_weights = {
                    MasteryLevel.EXCELLENT.value: 100.0,
                    MasteryLevel.GOOD.value: 80.0,
                    MasteryLevel.NEEDS_WORK.value: 50.0,
                    MasteryLevel.FAIL.value: 0.0
                }
                study_score = round(sum(mastery_weights.get(log.sabaq_grade, 70.0) for log in h_logs) / len(h_logs), 2)

            overall_score = round(
                (0.35 * namaz_score) +
                (0.25 * hygiene_score) +
                (0.25 * study_score) +
                (0.15 * chores_score),
                2
            )

        card = db.query(StudentProgressCard).filter(
            StudentProgressCard.student_id == student.id,
            StudentProgressCard.log_month == first_day
        ).first()

        if not card:
            card = StudentProgressCard(
                student_id=student.id,
                center_id=center_id,
                log_month=first_day,
                namaz_score=namaz_score,
                hygiene_score=hygiene_score,
                study_score=study_score,
                chores_score=chores_score,
                overall_score=overall_score
            )
            db.add(card)
        else:
            card.namaz_score = namaz_score
            card.hygiene_score = hygiene_score
            card.study_score = study_score
            card.chores_score = chores_score
            card.overall_score = overall_score

        updated_count += 1

    db.commit()
    return updated_count

# ---------------------------------------------------------
# 2. USTHAD PROGRESS CARDS ENGINE
# ---------------------------------------------------------
def calculate_monthly_usthad_cards(db: Session, month_date: date) -> int:
    first_day = get_first_day_of_month(month_date)
    ustads = db.query(User).filter(User.role == UserRole.USTAD.value, User.is_active == True).all()
    updated_count = 0
    first_center = db.query(Center).first()

    for ustad in ustads:
        center_id = ustad.center_id or (first_center.id if first_center else None)
        if not center_id:
            continue

        # Get all halqas taught by this Ustad
        halqa_ids = [h.id for h in db.query(Halqa.id).filter(Halqa.ustad_id == ustad.id, Halqa.is_active == True).all()]
        
        # Get all enrolled students
        student_ids = []
        if halqa_ids:
            enrollments = db.query(HalqaEnrollment.student_id).filter(
                HalqaEnrollment.halqa_id.in_(halqa_ids),
                HalqaEnrollment.status == "ACTIVE"
            ).all()
            student_ids = [e[0] for e in enrollments]

        total_students = len(student_ids)
        underperforming_count = 0

        if total_students > 0:
            underperforming = db.query(StudentProgressCard).filter(
                StudentProgressCard.student_id.in_(student_ids),
                StudentProgressCard.log_month == first_day,
                StudentProgressCard.overall_score < 70.0
            ).count()
            underperforming_count = underperforming

        if total_students == 0:
            performance_score = 0.0
            penalty = 0.0
            final_rating = 0.0
        else:
            batch_failure_rate = (underperforming_count / total_students)
            if batch_failure_rate <= 0.30:
                penalty = 0.0
            else:
                penalty = (batch_failure_rate - 0.30) * 100.0 * 1.5
            performance_score = 100.0
            final_rating = round(max(0.0, 100.0 - penalty), 2)

        card = db.query(StaffProgressCard).filter(
            StaffProgressCard.user_id == ustad.id,
            StaffProgressCard.log_month == first_day,
            StaffProgressCard.role == "USTAD"
        ).first()

        if not card:
            card = StaffProgressCard(
                user_id=ustad.id,
                center_id=center_id,
                role="USTAD",
                log_month=first_day,
                performance_score=performance_score,
                penalty_points=round(penalty, 2),
                final_rating=final_rating
            )
            db.add(card)
        else:
            card.performance_score = performance_score
            card.penalty_points = round(penalty, 2)
            card.final_rating = final_rating

        updated_count += 1

    db.commit()
    return updated_count

# ---------------------------------------------------------
# 3. NAZIM PROGRESS CARDS ENGINE
# ---------------------------------------------------------
def calculate_monthly_nazim_cards(db: Session, month_date: date) -> int:
    first_day = get_first_day_of_month(month_date)
    last_day = get_last_day_of_month(month_date)

    nazims = db.query(User).filter(User.role == UserRole.NAZIM.value, User.is_active == True).all()
    updated_count = 0
    first_center = db.query(Center).first()

    for nazim in nazims:
        center_id = nazim.center_id or (first_center.id if first_center else None)
        if not center_id:
            continue

        duties = db.query(NazimDuty).filter(
            NazimDuty.center_id == center_id,
            NazimDuty.due_date >= first_day,
            NazimDuty.due_date <= last_day
        ).all()

        total_duties = len(duties)
        on_time_completed = sum(1 for d in duties if d.is_completed and d.completed_at and d.completed_at <= d.due_date)

        if total_duties > 0:
            rating = round((on_time_completed / total_duties) * 100.0, 2)
            penalty = round(100.0 - rating, 2)
        else:
            rating = 0.0
            penalty = 0.0

        card = db.query(StaffProgressCard).filter(
            StaffProgressCard.user_id == nazim.id,
            StaffProgressCard.log_month == first_day,
            StaffProgressCard.role == "NAZIM"
        ).first()

        if not card:
            card = StaffProgressCard(
                user_id=nazim.id,
                center_id=center_id,
                role="NAZIM",
                log_month=first_day,
                performance_score=rating,
                penalty_points=penalty,
                final_rating=rating
            )
            db.add(card)
        else:
            card.performance_score = rating
            card.penalty_points = penalty
            card.final_rating = rating

        updated_count += 1

    db.commit()
    return updated_count

# ---------------------------------------------------------
# 4. GLOBAL INSTITUTION RANKING ENGINE
# ---------------------------------------------------------
def calculate_institution_rankings(db: Session, month_date: date) -> int:
    first_day = get_first_day_of_month(month_date)
    centers = db.query(Center).all()

    for center in centers:
        # Avg Student Score for Center
        avg_student = db.query(func.avg(StudentProgressCard.overall_score)).filter(
            StudentProgressCard.center_id == center.id,
            StudentProgressCard.log_month == first_day
        ).scalar()
        avg_student_val = float(avg_student) if avg_student is not None else 0.0

        # Avg Usthad Score for Center
        avg_usthad = db.query(func.avg(StaffProgressCard.final_rating)).filter(
            StaffProgressCard.center_id == center.id,
            StaffProgressCard.role == "USTAD",
            StaffProgressCard.log_month == first_day
        ).scalar()
        avg_usthad_val = float(avg_usthad) if avg_usthad is not None else 0.0

        # Nazim Duty Score for Center
        avg_nazim = db.query(func.avg(StaffProgressCard.final_rating)).filter(
            StaffProgressCard.center_id == center.id,
            StaffProgressCard.role == "NAZIM",
            StaffProgressCard.log_month == first_day
        ).scalar()
        avg_nazim_val = float(avg_nazim) if avg_nazim is not None else 0.0

        # Weighted Institution Score: 40% Student + 35% Usthad + 25% Nazim
        total_score = round(
            (0.40 * avg_student_val) +
            (0.35 * avg_usthad_val) +
            (0.25 * avg_nazim_val),
            2
        )

        perf = db.query(InstitutionPerformance).filter(
            InstitutionPerformance.center_id == center.id,
            InstitutionPerformance.log_month == first_day
        ).first()

        if not perf:
            perf = InstitutionPerformance(
                center_id=center.id,
                log_month=first_day,
                avg_student_score=round(avg_student_val, 2),
                avg_usthad_score=round(avg_usthad_val, 2),
                nazim_duty_score=round(avg_nazim_val, 2),
                total_institution_score=total_score,
                global_rank=1
            )
            db.add(perf)
        else:
            perf.avg_student_score = round(avg_student_val, 2)
            perf.avg_usthad_score = round(avg_usthad_val, 2)
            perf.nazim_duty_score = round(avg_nazim_val, 2)
            perf.total_institution_score = total_score

    db.commit()

    # Calculate global ranks via Window ranking order
    rankings = db.query(InstitutionPerformance).filter(
        InstitutionPerformance.log_month == first_day
    ).order_by(InstitutionPerformance.total_institution_score.desc()).all()

    for index, item in enumerate(rankings, start=1):
        item.global_rank = index

    db.commit()
    return len(centers)

def run_full_monthly_performance_aggregation(db: Session, target_date: Optional[date] = None) -> dict:
    today = target_date or date.today()
    month_first = get_first_day_of_month(today)

    s_count = calculate_monthly_student_cards(db, month_first)
    u_count = calculate_monthly_usthad_cards(db, month_first)
    n_count = calculate_monthly_nazim_cards(db, month_first)
    c_count = calculate_institution_rankings(db, month_first)

    return {
        "status": "success",
        "month": month_first.isoformat(),
        "students_processed": s_count,
        "usthads_processed": u_count,
        "nazims_processed": n_count,
        "centers_ranked": c_count
    }

# ---------------------------------------------------------
# 5. NAZIM DUTY CRUD HELPERS
# ---------------------------------------------------------
def create_nazim_duty(db: Session, payload: NazimDutyCreate, center_id: str) -> NazimDuty:
    c_id = payload.center_id or center_id
    duty = NazimDuty(
        center_id=c_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        is_completed=False
    )
    db.add(duty)
    db.commit()
    db.refresh(duty)
    return duty

def complete_nazim_duty(db: Session, duty_id: str) -> NazimDuty:
    duty = db.query(NazimDuty).filter(NazimDuty.id == duty_id).first()
    if not duty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Duty with id '{duty_id}' not found"
        )
    duty.is_completed = True
    duty.completed_at = date.today()
    db.commit()
    db.refresh(duty)
    return duty

def get_nazim_duties(db: Session, center_id: str) -> List[NazimDuty]:
    return db.query(NazimDuty).filter(NazimDuty.center_id == center_id).order_by(NazimDuty.due_date.asc()).all()

def get_global_leaderboard(db: Session, target_date: Optional[date] = None) -> dict:
    today = target_date or date.today()
    first_day = get_first_day_of_month(today)

    # Automatically aggregate if not generated yet
    records = db.query(InstitutionPerformance).filter(
        InstitutionPerformance.log_month == first_day
    ).order_by(InstitutionPerformance.global_rank.asc()).all()

    if not records:
        run_full_monthly_performance_aggregation(db, first_day)
        records = db.query(InstitutionPerformance).filter(
            InstitutionPerformance.log_month == first_day
        ).order_by(InstitutionPerformance.global_rank.asc()).all()

    items = []
    for r in records:
        center = db.query(Center).filter(Center.id == r.center_id).first()
        items.append({
            "center_id": r.center_id,
            "center_name": center.name if center else "Unknown Center",
            "center_code": center.code if center else "N/A",
            "global_rank": r.global_rank or 1,
            "total_institution_score": r.total_institution_score,
            "avg_student_score": r.avg_student_score,
            "avg_usthad_score": r.avg_usthad_score,
            "nazim_duty_score": r.nazim_duty_score,
            "log_month": r.log_month
        })

    return {
        "current_month": first_day,
        "leaderboard": items
    }

def get_usthad_rankings(db: Session, target_date: Optional[date] = None) -> List[dict]:
    today = target_date or date.today()
    first_day = get_first_day_of_month(today)
    
    # Auto-compile cards so newly registered Usthad accounts immediately get cards
    calculate_monthly_usthad_cards(db, first_day)
    
    cards = db.query(StaffProgressCard).filter(
        StaffProgressCard.log_month == first_day,
        StaffProgressCard.role == "USTAD"
    ).order_by(StaffProgressCard.final_rating.desc()).all()
    
    results = []
    for idx, card in enumerate(cards, start=1):
        user = db.query(User).filter(User.id == card.user_id).first()
        center = db.query(Center).filter(Center.id == card.center_id).first()
        results.append({
            "rank": idx,
            "user_id": card.user_id,
            "name": user.full_name if user else "Usthad",
            "email": user.email if user else "",
            "center_name": center.name if center else "Main Branch",
            "performance_score": card.performance_score,
            "penalty_points": card.penalty_points,
            "final_rating": card.final_rating,
            "log_month": card.log_month
        })
    return results

def get_nazim_rankings(db: Session, target_date: Optional[date] = None) -> List[dict]:
    today = target_date or date.today()
    first_day = get_first_day_of_month(today)
    
    # Auto-compile cards so newly registered Nazim accounts immediately get cards
    calculate_monthly_nazim_cards(db, first_day)
    
    cards = db.query(StaffProgressCard).filter(
        StaffProgressCard.log_month == first_day,
        StaffProgressCard.role == "NAZIM"
    ).order_by(StaffProgressCard.final_rating.desc()).all()
    
    results = []
    for idx, card in enumerate(cards, start=1):
        user = db.query(User).filter(User.id == card.user_id).first()
        center = db.query(Center).filter(Center.id == card.center_id).first()
        results.append({
            "rank": idx,
            "user_id": card.user_id,
            "name": user.full_name if user else "Nazim",
            "email": user.email if user else "",
            "center_name": center.name if center else "Main Branch",
            "duty_compliance_score": card.final_rating,
            "penalty_points": card.penalty_points,
            "final_rating": card.final_rating,
            "log_month": card.log_month
        })
    return results

def get_student_rankings(db: Session, target_date: Optional[date] = None) -> List[dict]:
    today = target_date or date.today()
    first_day = get_first_day_of_month(today)
    
    # Auto-compile cards so newly registered Student accounts immediately get cards
    calculate_monthly_student_cards(db, first_day)
    
    cards = db.query(StudentProgressCard).filter(
        StudentProgressCard.log_month == first_day
    ).order_by(StudentProgressCard.overall_score.desc()).all()
    
    results = []
    for idx, card in enumerate(cards, start=1):
        user = db.query(User).filter(User.id == card.student_id).first()
        center = db.query(Center).filter(Center.id == card.center_id).first()
        results.append({
            "rank": idx,
            "student_id": card.student_id,
            "name": user.full_name if user else f"Student #{card.student_id[:6]}",
            "card_id": getattr(user, "student_card_id", "STU-101") if user else "STU-101",
            "center_name": center.name if center else "Main Branch",
            "namaz_score": card.namaz_score,
            "hygiene_score": card.hygiene_score,
            "study_score": card.study_score,
            "chores_score": card.chores_score,
            "overall_score": card.overall_score,
            "log_month": card.log_month
        })
    return results
