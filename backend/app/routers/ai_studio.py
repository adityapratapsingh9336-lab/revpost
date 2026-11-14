import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.creative import Creative
from app.schemas.common import ApiResponse
from app.schemas.creative import CreativeGenerateRequest
from app.services.ai_gateway import AIGateway
from app.services.blueprint_engine import BlueprintEngine
from app.services.image_generator import ImageGeneratorService
from app.services.storage_service import StorageService
from app.services.renderer import ControlledBlueprintRenderer

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/v1/ai", tags=["AI Studio"])

@router.post("/generate", response_model=ApiResponse[dict])
def generate_creative(payload: CreativeGenerateRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == payload.brand_id).first()
    brand_name = brand.name if brand else "My Brand"
    prof = brand.brand_profile or {} if brand else {}
    workspace_id = brand.workspace_id if brand else "ws_default"

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

    # =========================================================================
    # Phase 3A: AI Content Generation (Structured JSON with visual prompt)
    # =========================================================================
    logger.info("[AI Studio] Step 1: Synthesizing structured copy & visual prompt for topic: '%s'", payload.topic_brief[:60])
    copy_result = AIGateway.generate_copy_and_hooks(
        topic_brief=payload.topic_brief,
        brand_name=brand_name,
        brand_voice=payload.tone,
        platform=payload.platform,
        objective=payload.objective,
        slides_count=target_slides,
        knowledge_context=knowledge_context,
        archetype=target_archetype
    )

    visual_prompt = copy_result.get("visual_prompt") or payload.topic_brief

    # =========================================================================
    # Phase 3B: Genuine AI Image Generation (Flux.1 / SDXL Diffusion)
    # =========================================================================
    logger.info("[AI Studio] Step 2: Invoking AI Image Model with prompt: '%s'", visual_prompt[:80])
    
    # Parse requested canvas dimensions
    canvas_w, canvas_h = 1080, 1350
    if "1080x1080" in payload.format or "1200x1200" in payload.format:
        canvas_w, canvas_h = 1080, 1080
    elif "1920x1080" in payload.format:
        canvas_w, canvas_h = 1920, 1080

    try:
        raw_image_bytes, img_meta = ImageGeneratorService.generate_image(
            visual_prompt=visual_prompt,
            width=canvas_w,
            height=canvas_h,
            archetype=target_archetype,
            brand_palette=custom_palette
        )
    except Exception as img_err:
        logger.error("[AI Studio] AI Image Generation failed: %s", img_err)
        # Phase 4: Never silently substitute a default image or fake success
        raise HTTPException(
            status_code=502,
            detail=f"AI Image Generation failed: {img_err}. Please verify API connectivity and retry."
        )

    # Save raw generated background image to storage
    generation_id = img_meta["generation_id"]
    raw_storage_result = StorageService.save_image(
        image_bytes=raw_image_bytes,
        filename=f"{generation_id}_raw.jpg",
        content_type="image/jpeg",
        workspace_id=workspace_id,
        folder="raw_ai_generations"
    )

    # =========================================================================
    # Phase 3C: Design Composition
    # Controlled rendering engine composes headline, badge, branding on AI image
    # =========================================================================
    logger.info("[AI Studio] Step 3: Compositing design layout on authentic AI image foundation")
    blueprint = BlueprintEngine.generate_carousel_blueprint(
        brand_id=payload.brand_id,
        brand_name=brand_name,
        title=copy_result["title"],
        topic_brief=payload.topic_brief,
        slides_count=target_slides,
        platform=payload.platform,
        archetype=target_archetype
    )

    primary_hex = custom_palette[0] if custom_palette and len(custom_palette) >= 1 else "#0F172A"
    accent_hex = custom_palette[2] if custom_palette and len(custom_palette) >= 3 else "#3B82F6"

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
                for el in blueprint.slides[idx].elements:
                    if el.type == "badge":
                        el.content = badge_val
                    elif el.type == "headline":
                        el.content = hl_val
                    elif el.type == "subhead":
                        el.content = sub_val

    # Render primary composite slide (Slide 01) using Pillow
    first_slide_obj = blueprint.slides[0] if blueprint.slides else None
    if first_slide_obj:
        first_slide_dict = first_slide_obj.model_dump() if hasattr(first_slide_obj, "model_dump") else first_slide_obj.dict()
    else:
        first_slide_dict = {
            "badge": "HOOK",
            "headline": copy_result.get("headline", copy_result["title"]),
            "subhead": copy_result.get("supporting_text", "")
        }

    composite_png_bytes = ControlledBlueprintRenderer.render_slide_to_png_bytes(
        slide=first_slide_dict,
        slide_index=0,
        total_slides=len(blueprint.slides),
        brand_name=brand_name,
        width=canvas_w,
        height=canvas_h,
        bg_hex=primary_hex,
        accent_hex=accent_hex,
        bg_image_bytes=raw_image_bytes
    )

    # =========================================================================
    # Phase 3D: Image Storage (Supabase Storage + Local Static CDN)
    # =========================================================================
    composite_storage_result = StorageService.save_image(
        image_bytes=composite_png_bytes,
        filename=f"{generation_id}_slide_01.png",
        content_type="image/png",
        workspace_id=workspace_id,
        folder="creatives"
    )

    # Attach generated image URLs to blueprint for frontend rendering
    bp_dict = blueprint.dict()
    bp_dict["image_url"] = composite_storage_result["url"]
    bp_dict["raw_image_url"] = raw_storage_result["url"]
    bp_dict["generation_id"] = generation_id

    # =========================================================================
    # Phase 5: Generation Tracking & Database Persistence
    # =========================================================================
    new_creative = Creative(
        workspace_id=workspace_id,
        brand_id=payload.brand_id,
        title=copy_result["title"],
        platform=payload.platform,
        format=payload.format,
        content_type=payload.content_type,
        slides_count=len(blueprint.slides),
        status="Draft",
        caption=copy_result["caption"],
        hashtags=copy_result["hashtags"],
        design_archetype=blueprint.archetype,
        blueprint_json=bp_dict,
        image_url=composite_storage_result["url"],
        raw_image_url=raw_storage_result["url"],
        visual_prompt=img_meta["prompt"],
        generation_id=generation_id,
        ai_provider=img_meta["provider"],
        ai_model=img_meta["model"],
        generation_status="completed",
        generation_latency_ms=img_meta["latency_ms"]
    )
    db.add(new_creative)
    db.commit()
    db.refresh(new_creative)

    logger.info(
        "[AI Studio] Creative %s created with AI Image %s (generation_id=%s)",
        new_creative.id, composite_storage_result["url"], generation_id
    )

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
            "image_url": composite_storage_result["url"],
            "raw_image_url": raw_storage_result["url"],
            "visual_prompt": img_meta["prompt"],
            "visual_concept": copy_result.get("visual_concept"),
            "generation_id": generation_id,
            "generation_metadata": {
                "generation_id": generation_id,
                "provider": img_meta["provider"],
                "model": img_meta["model"],
                "seed": img_meta.get("seed"),
                "latency_ms": img_meta["latency_ms"],
                "status": "completed",
                "tokens_used": copy_result.get("tokens_used", 0)
            },
            "metrics": {
                "tokens_used": copy_result.get("tokens_used", 0),
                "copy_latency_ms": copy_result.get("latency_ms", 0),
                "image_latency_ms": img_meta["latency_ms"],
                "provider": f"{copy_result.get('provider')} + {img_meta['provider']} ({img_meta['model']})"
            }
        }
    )
