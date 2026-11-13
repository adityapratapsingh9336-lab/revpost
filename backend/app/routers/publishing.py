import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.social import PublishingQueueItem
from app.models.creative import Creative
from app.schemas.common import ApiResponse
from app.auth import require_role

router = APIRouter(prefix="/api/v1/publishing", tags=["Publishing Queue"])

publishing_paused = False

def ensure_seeded_queue(db: Session) -> List[PublishingQueueItem]:
    return db.query(PublishingQueueItem).order_by(PublishingQueueItem.scheduled_time.asc()).all()

def _serialize_queue_item(q: PublishingQueueItem) -> dict:
    return {
        "id": q.id,
        "creative_id": q.creative_id,
        "postTitle": q.post_title,
        "format": q.format_label,
        "platform": q.platform,
        "targetAccount": q.target_account,
        "scheduledTime": q.scheduled_time.strftime("%b %d, %Y · %H:%M UTC"),
        "date": q.scheduled_time.strftime("%Y-%m-%d"),
        "time": q.scheduled_time.strftime("%H:%M"),
        "status": q.status,
        "approvalStatus": q.approval_status,
        "retryCount": q.retry_count,
        "lastError": q.last_error,
    }

@router.get("/queue", response_model=ApiResponse[dict])
def get_publishing_queue(db: Session = Depends(get_db)):
    items = ensure_seeded_queue(db)
    return ApiResponse(
        data={
            "is_paused": publishing_paused,
            "items": [_serialize_queue_item(i) for i in items]
        }
    )

@router.post("/toggle-pause", response_model=ApiResponse[dict])
def toggle_pause(_auth=Depends(require_role(["owner", "admin", "editor"]))):
    global publishing_paused
    publishing_paused = not publishing_paused
    return ApiResponse(
        data={
            "is_paused": publishing_paused,
            "message": "Publishing paused" if publishing_paused else "Publishing resumed"
        }
    )

@router.post("/{item_id}/publish-now", response_model=ApiResponse[dict])
def publish_now(item_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    if publishing_paused:
        raise HTTPException(status_code=409, detail="Publishing engine is currently paused. Resume queue before publishing.")

    item = db.query(PublishingQueueItem).filter(PublishingQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Publishing job not found")

    item.status = "Published"
    item.approval_status = "Published Manually"
    item.last_error = None

    creative = db.query(Creative).filter(Creative.id == item.creative_id).first()
    if creative:
        creative.status = "Published"
        creative.published_at = datetime.utcnow()

    db.commit()
    db.refresh(item)
    return ApiResponse(data=_serialize_queue_item(item))

@router.post("/{item_id}/retry", response_model=ApiResponse[dict])
def retry_publish(item_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    item = db.query(PublishingQueueItem).filter(PublishingQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Publishing job not found")
    item.status = "Queued"
    item.last_error = None
    db.commit()
    db.refresh(item)
    return ApiResponse(data=_serialize_queue_item(item))
