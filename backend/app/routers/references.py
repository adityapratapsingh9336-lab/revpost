import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config import settings
from app.database import get_db
from app.models.reference import ReferenceAsset, ReferenceAnalysis
from app.schemas.common import ApiResponse
from app.services.reference_analyzer import ReferenceAnalyzer
from app.auth import require_role

router = APIRouter(prefix="/api/v1/references", tags=["Reference Studio"])

def _serialize_reference(r: ReferenceAsset) -> dict:
    an = r.analysis
    return {
        "id": r.id,
        "title": r.title,
        "source": r.source_url or r.permission_notes or "Direct Upload",
        "uploadedAt": r.created_at.strftime("%Y-%m-%d"),
        "status": "Processed" if r.processing_status == "succeeded" else r.processing_status.capitalize(),
        "confidenceScore": an.confidence_score if an else 90.0,
        "tags": [an.archetype if an else "Editorial", r.mime_type.split("/")[-1].upper()],
        "ocrText": an.ocr_text if an else "",
        "extractedPalette": an.palette if an else ["#0F172A", "#F8FAFC", "#3B82F6"],
        "archetype": an.archetype if an else "High-Contrast Minimalist",
        "permissionNotes": r.permission_notes or "Workspace uploaded benchmark",
    }

@router.get("/brand/{brand_id}", response_model=ApiResponse[List[dict]])
def get_brand_references(brand_id: str, db: Session = Depends(get_db)):
    refs = db.query(ReferenceAsset).filter(ReferenceAsset.brand_id == brand_id).order_by(ReferenceAsset.created_at.desc()).all()
    return ApiResponse(data=[_serialize_reference(r) for r in refs])

@router.post("/simulate-upload", response_model=ApiResponse[dict])
def upload_simulated_reference(payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    brand_id = payload.get("brand_id", "brand_1")
    title = payload.get("title", "Uploaded Benchmark Creative")

    ref = ReferenceAsset(
        workspace_id="ws_default",
        brand_id=brand_id,
        title=title,
        storage_path="/uploads/simulated.png",
        mime_type="image/png",
        source_url="Simulated Ingestion",
        permission_notes="Workspace uploaded benchmark",
        processing_status="succeeded"
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)

    analysis = ReferenceAnalysis(
        workspace_id="ws_default",
        brand_id=brand_id,
        reference_asset_id=ref.id,
        palette=["#0F172A", "#F8FAFC", "#2563EB", "#94A3B8"],
        ocr_text="RECOVER 2X FASTER. The compression architecture proven in endurance trials.",
        archetype="Editorial Stat Callout",
        confidence_score=92.0
    )
    db.add(analysis)
    db.commit()
    db.refresh(ref)

    return ApiResponse(data=_serialize_reference(ref))

@router.post("/upload", response_model=ApiResponse[dict])
async def upload_reference_file(
    file: UploadFile = File(...),
    brand_id: str = Form("brand_1"),
    title: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    permission_notes: Optional[str] = Form("Uploaded by workspace member"),
    db: Session = Depends(get_db),
    _auth=Depends(require_role(["owner", "admin", "editor"]))
):
    allowed_mimes = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    if file.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail="Unsupported image format. Use PNG, JPEG, or WebP.")

    file_bytes = await file.read()
    if len(file_bytes) == 0 or len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be between 1 byte and 20 MB.")

    os.makedirs(settings.STORAGE_LOCAL_DIR, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{os.path.basename(file.filename or 'reference.png')}"
    dest_path = os.path.join(settings.STORAGE_LOCAL_DIR, safe_name)
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    try:
        metrics = ReferenceAnalyzer.analyze_image_bytes(file_bytes, file.filename or "reference.png")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted image file: {exc}")

    ref = ReferenceAsset(
        workspace_id="ws_default",
        brand_id=brand_id,
        title=title or os.path.splitext(file.filename or "Reference")[0],
        storage_path=dest_path,
        original_filename=file.filename,
        mime_type=file.content_type,
        file_size_bytes=metrics["file_size_bytes"],
        source_url=source_url or f"Local Upload ({metrics['width']}x{metrics['height']})",
        permission_notes=permission_notes,
        processing_status="succeeded"
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)

    analysis = ReferenceAnalysis(
        workspace_id="ws_default",
        brand_id=brand_id,
        reference_asset_id=ref.id,
        palette=metrics["extracted_palette"],
        ocr_text=metrics["ocr_text"],
        archetype=metrics["archetype"],
        confidence_score=metrics["confidence_score"]
    )
    db.add(analysis)
    db.commit()
    db.refresh(ref)

    data = _serialize_reference(ref)
    data["dimensions"] = f"{metrics['width']}x{metrics['height']}"
    data["extracted_palette"] = metrics["extracted_palette"]
    data["ocr_text"] = metrics["ocr_text"]
    data["confidence_score"] = metrics["confidence_score"]
    return ApiResponse(data=data)

@router.post("/{reference_id}/analyse", response_model=ApiResponse[dict])
def reanalyse_reference(reference_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    ref = db.query(ReferenceAsset).filter(ReferenceAsset.id == reference_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Reference asset not found")

    if ref.storage_path and os.path.exists(ref.storage_path):
        with open(ref.storage_path, "rb") as f:
            metrics = ReferenceAnalyzer.analyze_image_bytes(f.read(), ref.original_filename or "reference.png")
        if ref.analysis:
            ref.analysis.palette = metrics["extracted_palette"]
            ref.analysis.archetype = metrics["archetype"]
            ref.analysis.ocr_text = metrics["ocr_text"]
            ref.analysis.confidence_score = min(99.0, metrics["confidence_score"] + 1.5)
    elif ref.analysis:
        ref.analysis.confidence_score = min(99.0, round(ref.analysis.confidence_score + 1.2, 1))

    ref.processing_status = "succeeded"
    db.commit()
    db.refresh(ref)
    return ApiResponse(data=_serialize_reference(ref))

@router.delete("/{reference_id}", response_model=ApiResponse[dict])
def delete_reference(reference_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    ref = db.query(ReferenceAsset).filter(ReferenceAsset.id == reference_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Reference asset not found")
    if ref.storage_path and os.path.exists(ref.storage_path):
        try:
            os.remove(ref.storage_path)
        except OSError:
            pass
    db.delete(ref)
    db.commit()
    return ApiResponse(data={"deleted_id": reference_id})
