from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, ensure_sqlite_columns
import app.models  # Ensure all models are registered with Base

# Automatically create all tables in local or configured database
Base.metadata.create_all(bind=engine)
ensure_sqlite_columns()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for XYZ — AI-Powered Social Media Management SaaS",
    version="1.0.0",
)

# CORS configuration (Local dev + Vercel deployments + custom ALLOWED_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers import (
    health,
    workspaces,
    brands,
    references,
    visual_dna,
    ai_studio,
    creatives,
    calendar,
    publishing,
    social_accounts,
    analytics,
    ai_control
)

app.include_router(health.router)
app.include_router(workspaces.router)
app.include_router(brands.router)
app.include_router(references.router)
app.include_router(visual_dna.router)
app.include_router(ai_studio.router)
app.include_router(creatives.router)
app.include_router(calendar.router)
app.include_router(publishing.router)
app.include_router(social_accounts.router)
app.include_router(analytics.router)
app.include_router(ai_control.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "path": str(request.url)
            }
        }
    )

