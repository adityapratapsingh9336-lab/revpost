import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, ensure_sqlite_columns
import app.models  # Ensure all models are registered with Base

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safely ensure all database tables are created on startup
    try:
        Base.metadata.create_all(bind=engine)
        ensure_sqlite_columns()
        logger.info("Database connection and tables verified successfully.")
    except Exception as exc:
        logger.warning("Database startup check encountered an issue (will retry upon request): %s", exc)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for XYZ — AI-Powered Social Media Management SaaS",
    version="1.0.0",
    lifespan=lifespan,
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

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server exception on %s: %s", request.url.path, exc)
    origin = request.headers.get("origin")
    headers = {
        "Access-Control-Allow-Origin": origin if origin else "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
    }
    return JSONResponse(
        status_code=500,
        headers=headers,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "path": str(request.url.path)
            }
        }
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

# Mount static uploads and storage asset endpoints
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

os.makedirs(settings.STORAGE_LOCAL_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_LOCAL_DIR, "generated"), exist_ok=True)

app.mount(
    "/storage_uploads",
    StaticFiles(directory=settings.STORAGE_LOCAL_DIR),
    name="storage_uploads"
)

@app.get("/api/v1/storage/images/{filename}")
async def get_storage_image(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(settings.STORAGE_LOCAL_DIR, "generated", safe_name)
    if not os.path.exists(path):
        path = os.path.join(settings.STORAGE_LOCAL_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image asset not found")
    media_type = "image/png" if safe_name.lower().endswith(".png") else "image/jpeg"
    return FileResponse(
        path,
        media_type=media_type,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=86400"
        }
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

