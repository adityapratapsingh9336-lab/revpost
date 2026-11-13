from fastapi import APIRouter
from app.schemas.common import ApiResponse
from datetime import datetime

router = APIRouter(tags=["Health"])

@router.get("/health")
def root_health():
    return {
        "status": "healthy",
        "service": "XYZ Social AI Backend",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/api/v1/health", response_model=ApiResponse[dict])
def api_v1_health():
    return ApiResponse(
        data={
            "status": "operational",
            "version": "1.0.0",
            "database": "connected",
            "ai_gateway": "ready"
        }
    )

