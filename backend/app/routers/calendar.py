import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.social import PublishingQueueItem
from app.models.creative import Creative
from app.schemas.common import ApiResponse
from app.routers.publishing import ensure_seeded_queue
from app.auth import require_role

router = APIRouter(prefix="/api/v1/calendar", tags=["Content Calendar"])

@router.get("/events", response_model=ApiResponse[List[dict]])
def get_calendar_events(month: str = "2026-11", db: Session = Depends(get_db)):
    items = ensure_seeded_queue(db)
    events = []
    for q in items:
        events.append({
            "id": q.id,
            "creative_id": q.creative_id,
            "title": q.post_title,
            "date": q.scheduled_time.strftime("%Y-%m-%d"),
            "time": q.scheduled_time.strftime("%H:%M"),
            "platform": q.platform,
            "status": "Scheduled" if q.status == "Queued" else q.status,
            "format": q.format_label,
        })
    return ApiResponse(data=events)

@router.post("/schedule", response_model=ApiResponse[dict])
def schedule_post(payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    creative_id = payload.get("creative_id", "crt_1")
    date_str = payload.get("date", "2026-11-20")
    time_str = payload.get("time", "16:00")
    target_account = payload.get("target_account", "@pulsefit.athletics")
    platform = payload.get("platform", "Instagram")

    try:
        scheduled_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format. Expected YYYY-MM-DD and HH:MM.")

    creative = db.query(Creative).filter(Creative.id == creative_id).first()
    title = payload.get("title") or (creative.title if creative else "Scheduled Post")
    fmt_label = f"Carousel ({creative.slides_count} slides)" if creative and creative.slides_count > 1 else "Static Post"

    if creative:
        creative.status = "Scheduled"
        creative.scheduled_for = scheduled_dt

    item = PublishingQueueItem(
        workspace_id="ws_default",
        creative_id=creative_id,
        post_title=title,
        format_label=fmt_label,
        platform=platform.split(" ")[0],
        target_account=target_account,
        scheduled_time=scheduled_dt,
        status="Queued",
        approval_status="Approved by User",
        idempotency_key=f"idem_{creative_id}_{date_str}_{time_str}_{uuid.uuid4().hex[:6]}"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return ApiResponse(
        data={
            "id": item.id,
            "creative_id": item.creative_id,
            "title": item.post_title,
            "date": date_str,
            "time": time_str,
            "platform": item.platform,
            "status": "Scheduled",
            "format": item.format_label,
        }
    )
