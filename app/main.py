from fastapi import FastAPI
from app.config import settings
from app.database import engine, Base
from app.core.middleware import TenantContextMiddleware
from app.api.router import api_router

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Digi Dars Multi-Tenant Islamic Education & Financial Platform API",
    version="1.0.0"
)

# Register Middleware
app.add_middleware(TenantContextMiddleware)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs"
    }
