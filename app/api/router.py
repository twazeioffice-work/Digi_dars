from fastapi import APIRouter
from app.api.v1.auth_tenant import router as auth_tenant_router
from app.api.v1.finance_ledger import router as finance_ledger_router
from app.api.v1.academic_dars import router as academic_dars_router
from app.api.v1.communications import router as communications_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_tenant_router)
api_router.include_router(finance_ledger_router)
api_router.include_router(academic_dars_router)
api_router.include_router(communications_router)
