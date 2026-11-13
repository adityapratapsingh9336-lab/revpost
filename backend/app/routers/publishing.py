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
    items = db.query(PublishingQueueItem).order_by(PublishingQueueItem.scheduled_time.asc()).all()
    if not items:
        seeds = [
            PublishingQueueItem(
                id="pub_1",
                workspace_id="ws_default",
                creative_id="crt_1",
                post_title="4-Step Pre-Run Mobility Routine",
                format_label="Carousel (5 slides)",
                platform="Instagram",
                target_account="@pulsefit.athletics",
                scheduled_time=datetime(2026, 11, 10, 15, 0),
                status="Queued",
                approval_status="Approved by Lead",
                idempotency_key=f"idem_{uuid.uuid4().hex[:12]}"
            ),
            PublishingQueueItem(
                id="pub_2",
                workspace_id="ws_default",
                creative_id="crt_2",
                post_title="AeroCore Fabric Deep Dive",
                format_label="Carousel (4 slides)",
                platform="LinkedIn",
                target_account="PulseFit Performance Tech",
                scheduled_time=datetime(2026, 11, 14, 10, 30),
                status="Draft / On Hold",
                approval_status="Needs Content Signoff",
                idempotency_key=f"idem_{uuid.uuid4().hex[:12]}"
            ),
            PublishingQueueItem(
                id="pub_3",
                workspace_id="ws_default",
                creative_id="crt_3",
                post_title="Quote: Discipline Over Mood",
                format_label="Static Post",
                platform="Instagram",
                target_account="@pulsefit.athletics",
                scheduled_time=datetime(2026, 11, 7, 12, 0),
                status="Published",
                approval_status="Completed",
                idempotency_key=f"idem_{uuid.uuid4().hex[:12]}"
            )
        ]
        db.add_all(seeds)
        db.commit()
        items = db.query(PublishingQueueItem).order_by(PublishingQueueItem.scheduled_time.asc()).all()
    return items

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
