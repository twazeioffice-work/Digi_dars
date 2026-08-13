"""
Unified Performance & Complaints Service Module
Integrates the complete hierarchical performance calculation engine, 30% Usthad batch penalty mechanics,
Nazim duty compliance, global institution ranking, Student Kiosk PIN authentication, and Super Admin complaint triage pipeline.
"""

from app.models.performance import (
    NazimDuty, StudentProgressCard, StaffProgressCard, InstitutionPerformance
)
from app.models.complaint import Complaint, ComplaintStatus
from app.schemas.performance import (
    NazimDutyCreate, NazimDutyResponse, StudentProgressCardResponse,
    StaffProgressCardResponse, InstitutionPerformanceResponse, LeaderboardResponse
)
from app.schemas.complaint import (
    KioskLoginRequest, ComplaintCreate, ComplaintRouteRequest,
    ComplaintResolveSuperAdmin, ComplaintResolveNazim, ComplaintResponse
)
from app.services.performance import (
    get_first_day_of_month, get_last_day_of_month,
    calculate_monthly_student_cards, calculate_monthly_usthad_cards,
    calculate_monthly_nazim_cards, calculate_institution_rankings,
    run_full_monthly_performance_aggregation, create_nazim_duty,
    complete_nazim_duty, get_nazim_duties, get_global_leaderboard
)

__all__ = [
    "NazimDuty", "StudentProgressCard", "StaffProgressCard", "InstitutionPerformance",
    "Complaint", "ComplaintStatus",
    "NazimDutyCreate", "NazimDutyResponse", "StudentProgressCardResponse",
    "StaffProgressCardResponse", "InstitutionPerformanceResponse", "LeaderboardResponse",
    "KioskLoginRequest", "ComplaintCreate", "ComplaintRouteRequest",
    "ComplaintResolveSuperAdmin", "ComplaintResolveNazim", "ComplaintResponse",
    "get_first_day_of_month", "get_last_day_of_month",
    "calculate_monthly_student_cards", "calculate_monthly_usthad_cards",
    "calculate_monthly_nazim_cards", "calculate_institution_rankings",
    "run_full_monthly_performance_aggregation", "create_nazim_duty",
    "complete_nazim_duty", "get_nazim_duties", "get_global_leaderboard"
]
