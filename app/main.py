from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from app.config import settings
from app.database import engine, Base
from app.core.logging import setup_structured_logging

# Initialize logging BEFORE anything else
setup_structured_logging()

from app.core.middleware import TenantContextMiddleware
from app.api.router import api_router
from app.api.v1.auth_tenant import router as auth_router
from app.api.v1.finance_ledger import router as finance_router
from app.api.v1.academic_dars import router as academic_router
from app.api.v1.communications import router as comms_router, plural_router as comms_plural_router
from app.api.v1.rag_ai import router as ai_router

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dars SaaS CRM API",
    description="Multi-Tenant API for Masjid-based Dars Management",
    version="1.0.0",
)

# Configure CORS (Crucial for the Next.js Frontend)
origins = [
    "http://localhost:3000",  # Next.js local development
    "http://localhost:8000",
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

# Initialize Prometheus instrumentation and expose the /metrics endpoint
Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=[".*admin.*", "/metrics"],
    env_var_name="ENABLE_METRICS",
    inprogress_name="inprogress",
    inprogress_labels=True,
).instrument(app).expose(app)

# Mount API Routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(finance_router)
app.include_router(academic_router)
app.include_router(comms_router)
app.include_router(comms_plural_router)
app.include_router(ai_router)

# Root Health Check Endpoint
@app.get("/", tags=["Health"])
async def root_health_check():
    return {
        "status": "online",
        "service": "Dars SaaS CRM Engine",
        "environment": "development"
    }
