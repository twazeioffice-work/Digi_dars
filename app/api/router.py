from fastapi import APIRouter
from app.api.v1.auth_tenant import router as auth_tenant_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_tenant_router)
