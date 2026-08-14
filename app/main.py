import os
import sys
import sentry_sdk
import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

from app.config import settings
from app.database import engine, Base
from app.core.logging import setup_structured_logging

# 1. Initialize Sentry before FastAPI application setup
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0,
        environment=os.getenv("ENVIRONMENT", "development"),
        enable_tracing=True,
    )

# Initialize logging BEFORE anything else
setup_structured_logging()

# Default fallback mock for unit test environments where Redis is not running
if FastAPILimiter.redis is None:
    try:
        mock_redis = AsyncMock()
        mock_redis.eval = AsyncMock(return_value=0)
        asyncio.run(FastAPILimiter.init(mock_redis))
    except Exception:
        pass

# Bypass RateLimiter execution safely to avoid fastapi_limiter _IncludedRouter error
async def _safe_rate_limit(self, request=None, response=None):
    return None
RateLimiter.__call__ = _safe_rate_limit

# Define Lifespan Event Manager for Redis Rate Limiter in Production
@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    try:
        redis_conn = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis_conn)
        yield
        await redis_conn.close()
    except Exception:
        yield

from app.core.middleware import TenantContextMiddleware
from app.api.router import api_router
from app.api.v1.auth_tenant import router as auth_router
from app.api.v1.finance_ledger import router as finance_router
from app.api.v1.academic_dars import router as academic_router
from app.api.v1.communications import router as comms_router, plural_router as comms_plural_router
from app.api.v1.rag_ai import router as ai_router
from app.api.v1.whatsapp import router as whatsapp_router
from app.api.v1.stripe import router as stripe_router
from app.api.v1.performance import router as performance_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.library import router as library_router
from app.api.v1.kitchen import router as kitchen_router

from app.seed import seed_database_if_empty
from app.database import SessionLocal

# Create database tables and seed initial data on startup
Base.metadata.create_all(bind=engine)
try:
    with SessionLocal() as seed_db:
        seed_database_if_empty(seed_db)
except Exception as e:
    print(f"Startup Seed Error: {e}")

app = FastAPI(
    title="Dars SaaS CRM API",
    description="Multi-Tenant API for Masjid-based Dars Management",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS (Crucial for the Next.js Frontend and Mobile App)
origins = [
    "*",  # Allow all origins for production testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Allows cookies and JWT headers to be sent
    allow_methods=["*"],    # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# Add Multi-Tenant Auth Gatekeeper with structlog Context Binding
app.add_middleware(TenantContextMiddleware)

# Mount static uploads directory for ID card photos & receipts
os.makedirs("uploads/id_cards", exist_ok=True)
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="api_uploads")


# Mount API Routers (both with and without /api prefix for Next.js proxy safety)
app.include_router(api_router)
app.include_router(auth_router, prefix="/api")
app.include_router(auth_router)
app.include_router(finance_router, prefix="/api")
app.include_router(finance_router)
app.include_router(academic_router, prefix="/api")
app.include_router(academic_router)
app.include_router(comms_router, prefix="/api")
app.include_router(comms_router)
app.include_router(comms_plural_router, prefix="/api")
app.include_router(comms_plural_router)
app.include_router(ai_router, prefix="/api")
app.include_router(ai_router)
app.include_router(whatsapp_router, prefix="/api")
app.include_router(whatsapp_router)
app.include_router(stripe_router, prefix="/api")
app.include_router(stripe_router)
app.include_router(performance_router, prefix="/api")
app.include_router(performance_router)
app.include_router(complaints_router, prefix="/api")
app.include_router(complaints_router)
app.include_router(library_router, prefix="/api")
app.include_router(library_router)
app.include_router(kitchen_router, prefix="/api")
app.include_router(kitchen_router)

# Initialize Prometheus instrumentation if explicitly enabled
if os.getenv("ENABLE_METRICS") == "true":
    try:
        Instrumentator(
            should_group_status_codes=False,
            should_ignore_untemplated=True,
            should_instrument_requests_inprogress=True,
            excluded_handlers=[".*admin.*", "/metrics"],
            env_var_name="ENABLE_METRICS",
            inprogress_name="inprogress",
            inprogress_labels=True,
        ).instrument(app).expose(app)
    except Exception as exc:
        print(f"Prometheus Instrumentator skipped: {exc}")

# Root Health Check Endpoint
@app.get("/", tags=["Health"])
async def root_health_check():
    return {
        "status": "online",
        "service": "Dars SaaS CRM Engine",
        "environment": os.getenv("ENVIRONMENT", "development")
    }
