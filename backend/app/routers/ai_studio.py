from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.creative import Creative
from app.schemas.common import ApiResponse
from app.schemas.creative import CreativeGenerateRequest
from app.services.ai_gateway import AIGateway
from app.services.blueprint_engine import BlueprintEngine

router = APIRouter(prefix="/api/v1/ai", tags=["AI Studio"])

@router.post("/generate", response_model=ApiResponse[dict])
def generate_creative(payload: CreativeGenerateRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == payload.brand_id).first()
    brand_name = brand.name if brand else "My Brand"
    prof = brand.brand_profile or {} if brand else {}

    knowledge_context = {
        "products": prof.get("products", []),
        "restrictions": prof.get("restrictions", []),
        "audience": prof.get("audience", {}),
        "voice": prof.get("voice", {})
    }

    # Check if a specific visual reference was chosen to guide style & palette
    target_archetype = payload.archetype or "High-Contrast Technical Minimalist"
    custom_palette = None
    if payload.reference_id:
        from app.models.reference import ReferenceAsset
        ref_asset = db.query(ReferenceAsset).filter(ReferenceAsset.id == payload.reference_id).first()
        if ref_asset and ref_asset.analysis:
            if ref_asset.analysis.archetype:
                target_archetype = ref_asset.analysis.archetype
            if ref_asset.analysis.palette:
                custom_palette = ref_asset.analysis.palette
            if ref_asset.analysis.ocr_text:
                knowledge_context["reference_benchmark_style"] = ref_asset.analysis.ocr_text

    target_slides = payload.slides_count if payload.content_type == "carousel" else 1

    # Step 1: Synthesize platform copy and hashtags via AI Gateway with brand knowledge
    copy_result = AIGateway.generate_copy_and_hooks(
        topic_brief=payload.topic_brief,
        brand_name=brand_name,
        brand_voice=payload.tone,
        platform=payload.platform,
        objective=payload.objective,
        slides_count=target_slides,
        knowledge_context=knowledge_context
    )

    # Step 2: Synthesize structured Design Blueprint JSON
    blueprint = BlueprintEngine.generate_carousel_blueprint(
        brand_id=payload.brand_id,
        brand_name=brand_name,
        title=copy_result["title"],
        topic_brief=payload.topic_brief,
        slides_count=target_slides,
        platform=payload.platform,
        archetype=target_archetype
    )

    if custom_palette and len(custom_palette) >= 3:
        blueprint.palette.primary = custom_palette[0]
        blueprint.palette.secondary = custom_palette[1]
        blueprint.palette.accent = custom_palette[2]

    # Apply live AI generated slide copy if available
    slides_override = copy_result.get("slides_override")
    if isinstance(slides_override, list):
        for idx, s_data in enumerate(slides_override):
            if idx < len(blueprint.slides) and isinstance(s_data, dict):
                badge_val = str(s_data.get("badge", blueprint.slides[idx].badge))[:24]
                hl_val = str(s_data.get("headline", blueprint.slides[idx].headline))[:120]
                sub_val = str(s_data.get("subhead", blueprint.slides[idx].subhead))[:240]
                blueprint.slides[idx].badge = badge_val
                blueprint.slides[idx].headline = hl_val
                blueprint.slides[idx].subhead = sub_val
                # Also update inner elements for PNG image rendering
                for el in blueprint.slides[idx].elements:
                    if el.type == "badge":
                        el.content = badge_val
                    elif el.type == "headline":
                        el.content = hl_val
                    elif el.type == "subhead":
                        el.content = sub_val

    # Step 3: Persist as draft creative record in the database
    new_creative = Creative(
        workspace_id=brand.workspace_id if brand else "ws_default",
        brand_id=payload.brand_id,
        title=copy_result["title"],
        platform=payload.platform,
        format=payload.format,
        content_type=payload.content_type,
        slides_count=len(blueprint.slides),
        status="draft",
        caption=copy_result["caption"],
        hashtags=copy_result["hashtags"],
        design_archetype=blueprint.archetype,
        blueprint_json=blueprint.dict()
    )
    db.add(new_creative)
    db.commit()
    db.refresh(new_creative)

    return ApiResponse(
        data={
            "id": new_creative.id,
            "title": new_creative.title,
            "platform": new_creative.platform,
            "format": new_creative.format,
            "content_type": new_creative.content_type,
            "slides_count": new_creative.slides_count,
            "caption": new_creative.caption,
            "hashtags": new_creative.hashtags,
            "blueprint": new_creative.blueprint_json,
            "metrics": {
                "tokens_used": copy_result["tokens_used"],
                "latency_ms": copy_result["latency_ms"],
                "provider": copy_result["provider"]
            }
        }
    )

