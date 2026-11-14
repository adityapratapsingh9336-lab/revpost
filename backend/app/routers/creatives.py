from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.creative import Creative
from app.models.brand import Brand
from app.schemas.common import ApiResponse
from app.schemas.creative import CreativeUpdate
from app.services.renderer import ControlledBlueprintRenderer
from app.services.blueprint_engine import BlueprintEngine
from app.auth import require_role

router = APIRouter(prefix="/api/v1/creatives", tags=["Creative Library & Canvas"])

def _seed_initial_creatives(db: Session, brand_id: str) -> List[Creative]:
    bp1 = BlueprintEngine.generate_carousel_blueprint(
        brand_id=brand_id,
        brand_name="PulseFit Athletics",
        title="The 4-Step Pre-Run Mobility Routine",
        topic_brief="4 kinetic movements that unlock stride frequency without fatigue.",
        slides_count=5,
        platform="Instagram"
    ).dict()
    bp1["slides"] = [
        {"id": 1, "slide_number": 1, "badge": "TECHNIQUE 01", "headline": "4 KINETIC DRILLS TO UNLOCK STRIDE DEPTH", "subhead": "Fix your hip hinge before your first mile.", "type": "hook"},
        {"id": 2, "slide_number": 2, "badge": "MOBILITY", "headline": "01. 90/90 HIP EXTENSION", "subhead": "30 seconds each side. Activates glute medius without loading patella.", "type": "content"},
        {"id": 3, "slide_number": 3, "badge": "ALIGNMENT", "headline": "02. ANKLE DORSIFLEXION WALL DRIVE", "subhead": "Restores ankle range so your knees don't cave on footstrike.", "type": "content"},
        {"id": 4, "slide_number": 4, "badge": "AEROBIC", "headline": "03. THORACIC ROTATION PRAYER", "subhead": "Opens your ribcage for unrestricted oxygen intake during tempo pace.", "type": "content"},
        {"id": 5, "slide_number": 5, "badge": "CTA", "headline": "READY TO RUN WITH ZERO COMPROMISE?", "subhead": "Gear up with the AeroCore Series. Built for athletes who demand precision.", "type": "cta"},
    ]

    c1 = Creative(
        id="crt_1",
        workspace_id="ws_default",
        brand_id=brand_id,
        title="The 4-Step Pre-Run Mobility Routine",
        platform="Instagram",
        format="1080x1350 (Portrait Carousel)",
        content_type="carousel",
        slides_count=5,
        status="Scheduled",
        caption="Most runners skip thoracic rotation before hitting pace. Here are 4 kinetic movements that unlock stride frequency without fatigue.\n\n#RunningMechanics #PulseFit #EnduranceAthlete",
        hashtags=["#RunningMechanics", "#PulseFit", "#EnduranceAthlete"],
        design_archetype="Step-by-Step Educational",
        blueprint_json=bp1
    )

    c2 = Creative(
        id="crt_2",
        workspace_id="ws_default",
        brand_id=brand_id,
        title="Fabric Breakdown: Micro-Perforated Nylon vs Spandex",
        platform="LinkedIn",
        format="1200x1200 (Square Carousel)",
        content_type="carousel",
        slides_count=4,
        status="Draft",
        caption="Material science in activewear has shifted. Traditional spandex traps 3x more heat than micro-perforated warp knits.",
        hashtags=["#TextileScience", "#PulseFit", "#Activewear"],
        design_archetype="Scientific Product Teardown",
        blueprint_json={
            "version": "1.0",
            "width": 1200,
            "height": 1200,
            "slides": [
                {"id": 1, "slide_number": 1, "badge": "TEXTILE SCIENCE", "headline": "THE DEATH OF SYNTHETIC HEAT TRAPPING", "subhead": "How warp-knit nylon redefined athletic durability.", "type": "hook"},
                {"id": 2, "slide_number": 2, "badge": "PROBLEM", "headline": "THE PROBLEM WITH STANDARD SPANDEX", "subhead": "Polyurethane fibers degrade after 40 wash cycles and hold moisture.", "type": "content"},
                {"id": 3, "slide_number": 3, "badge": "SOLUTION", "headline": "THE AEROCORE WARP WEAVE", "subhead": "Interlocking 40D nylon yarns allow constant cross-airflow under tension.", "type": "content"},
                {"id": 4, "slide_number": 4, "badge": "TAKEAWAY", "headline": "EXPLORE THE LAB WHITE PAPER", "subhead": "Read the full thermodynamic report on pulsefitathletics.com", "type": "cta"},
            ]
        }
    )

    c3 = Creative(
        id="crt_3",
        workspace_id="ws_default",
        brand_id=brand_id,
        title="Quote: Discipline Over Mood",
        platform="Instagram",
        format="1080x1080 (Square Post)",
        content_type="static",
        slides_count=1,
        status="Published",
        caption="Motivation comes and goes. Consistency is purely a system.\n\n#PulseFit #Discipline #Endurance",
        hashtags=["#PulseFit", "#Discipline"],
        design_archetype="High-Impact Typography",
        blueprint_json={
            "version": "1.0",
            "width": 1080,
            "height": 1080,
            "slides": [
                {"id": 1, "slide_number": 1, "badge": "MINDSET", "headline": "DISCIPLINE IS DOING WHAT YOU HATE LIKE YOU LOVE IT.", "subhead": "— Training Camp Notes, Week 08", "type": "static"}
            ]
        }
    )

    db.add_all([c1, c2, c3])
    db.commit()
    return [c1, c2, c3]

def _serialize_creative(c: Creative) -> dict:
    bp = c.blueprint_json or {}
    slides = bp.get("slides", [])
    img_url = getattr(c, "image_url", None) or bp.get("image_url")
    raw_img_url = getattr(c, "raw_image_url", None) or bp.get("raw_image_url")
    return {
        "id": c.id,
        "brand_id": c.brand_id,
        "title": c.title,
        "platform": c.platform,
        "format": c.format,
        "type": c.content_type,
        "content_type": c.content_type,
        "slidesCount": c.slides_count,
        "slides_count": c.slides_count,
        "status": c.status,
        "caption": c.caption,
        "hashtags": c.hashtags,
        "archetype": c.design_archetype,
        "design_archetype": c.design_archetype,
        "image_url": img_url,
        "imageUrl": img_url,
        "raw_image_url": raw_img_url,
        "visual_prompt": getattr(c, "visual_prompt", None),
        "generation_id": getattr(c, "generation_id", None),
        "ai_provider": getattr(c, "ai_provider", None),
        "ai_model": getattr(c, "ai_model", None),
        "generation_latency_ms": getattr(c, "generation_latency_ms", None),
        "slides": slides,
        "blueprint": bp,
        "created_at": c.created_at.isoformat()
    }

@router.get("", response_model=ApiResponse[List[dict]])
def get_creatives(brand_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Creative)
    if brand_id:
        query = query.filter(Creative.brand_id == brand_id)
    creatives = query.order_by(Creative.created_at.desc()).all()
    return ApiResponse(data=[_serialize_creative(c) for c in creatives])

@router.get("/{creative_id}", response_model=ApiResponse[dict])
def get_creative_detail(creative_id: str, db: Session = Depends(get_db)):
    creative = db.query(Creative).filter(Creative.id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")
    return ApiResponse(data=_serialize_creative(creative))

@router.patch("/{creative_id}", response_model=ApiResponse[dict])
def update_creative(creative_id: str, payload: CreativeUpdate, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    creative = db.query(Creative).filter(Creative.id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")

    if payload.title is not None:
        creative.title = payload.title
    if payload.caption is not None:
        creative.caption = payload.caption
    if payload.status is not None:
        creative.status = payload.status
    if payload.blueprint_json is not None:
        creative.blueprint_json = payload.blueprint_json
        if "slides" in payload.blueprint_json:
            creative.slides_count = len(payload.blueprint_json["slides"])
    if payload.scheduled_for is not None:
        creative.scheduled_for = payload.scheduled_for

    db.commit()
    db.refresh(creative)
    return ApiResponse(data=_serialize_creative(creative))

@router.post("/{creative_id}/duplicate", response_model=ApiResponse[dict])
def duplicate_creative(creative_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    src = db.query(Creative).filter(Creative.id == creative_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Creative not found")

    dup = Creative(
        workspace_id=src.workspace_id,
        brand_id=src.brand_id,
        title=f"{src.title} (Copy)",
        platform=src.platform,
        format=src.format,
        content_type=src.content_type,
        slides_count=src.slides_count,
        status="Draft",
        caption=src.caption,
        hashtags=src.hashtags,
        design_archetype=src.design_archetype,
        blueprint_json=src.blueprint_json,
    )
    db.add(dup)
    db.commit()
    db.refresh(dup)
    return ApiResponse(data=_serialize_creative(dup))

@router.delete("/{creative_id}", response_model=ApiResponse[dict])
def delete_creative(creative_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    creative = db.query(Creative).filter(Creative.id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")
    db.delete(creative)
    db.commit()
    return ApiResponse(data={"deleted_id": creative_id})

@router.post("/export")
def export_creative_package(payload: Dict[str, Any]):
    blueprint = payload.get("blueprint", {})
    brand_name = payload.get("brand_name", "PULSEFIT ATHLETICS")
    file_bytes, media_type, filename = ControlledBlueprintRenderer.export_blueprint_package(
        blueprint=blueprint,
        brand_name=brand_name
    )
    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/export-slide")
def export_single_slide(payload: Dict[str, Any]):
    slide = payload.get("slide", {})
    slide_index = int(payload.get("slide_index", 0))
    total_slides = int(payload.get("total_slides", 1))
    brand_name = payload.get("brand_name", "PULSEFIT ATHLETICS")
    width = int(payload.get("width", 1080))
    height = int(payload.get("height", 1350))

    png_bytes = ControlledBlueprintRenderer.render_slide_to_png_bytes(
        slide=slide,
        slide_index=slide_index,
        total_slides=total_slides,
        brand_name=brand_name,
        width=width,
        height=height
    )
    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="slide_{slide_index + 1:02d}.png"'}
    )
