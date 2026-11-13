from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.models.visual_dna import VisualDNAProfile
from app.models.reference import ReferenceAnalysis
from app.schemas.common import ApiResponse
from app.auth import require_role

router = APIRouter(prefix="/api/v1/visual-dna", tags=["Visual DNA"])

def seed_default_dna(db: Session, brand_id: str) -> VisualDNAProfile:
    dna = VisualDNAProfile(
        workspace_id="ws_default",
        brand_id=brand_id,
        version="v1.4",
        is_active=True,
        archetype="High-Contrast Technical Minimalist",
        confidence_score=94.0,
        palette=[
            {"hex": "#0F172A", "name": "Deep Graphite Charcoal", "role": "Dominant Background / High-Priority Text"},
            {"hex": "#F8FAFC", "name": "Matte Ghost White", "role": "Canvas Surface / Clean Contrast"},
            {"hex": "#3B82F6", "name": "Cobalt Performance Blue", "role": "Accent Highlights & Tactical CTAs"},
            {"hex": "#64748B", "name": "Slate Gray", "role": "Secondary Hierarchy & Subtle Gridlines"},
            {"hex": "#E2E8F0", "name": "Soft Matte Divider", "role": "Container Borders & Slide Framing"}
        ],
        typography={
            "headingFontCategory": "Geometric Sans Serif (Inter Display / Space Grotesk)",
            "bodyFontCategory": "Clean Sans Serif (Inter)",
            "headingWeight": "700 (Bold)",
            "bodyWeight": "400 (Regular)",
            "headlineTransform": "Title Case or Upper Bold Hook"
        },
        layout_rules={
            "gridType": "12-column asymmetric or 2x2 split quadrant",
            "slideMargins": "80px safe margins (on 1080x1080 / 1080x1350 canvas)",
            "ctaStyle": "Matte pill or crisp rectangular button"
        },
        composition_mood=[
            "Generous negative space (minimum 40% breathing room)",
            "Strict monochrome hierarchy with 1 singular accent color pop",
            "Matte finish — no high-gloss or unnecessary gradient flare",
            "Data-driven badges (e.g. '[01/05]')"
        ],
        notes="Initial synthesis from curated brand benchmarks."
    )
    db.add(dna)
    db.commit()
    db.refresh(dna)
    return dna

def _serialize_dna(dna: VisualDNAProfile, history: List[VisualDNAProfile]) -> dict:
    return {
        "id": dna.id,
        "brandId": dna.brand_id,
        "version": dna.version,
        "archetype": dna.archetype,
        "confidenceScore": dna.confidence_score,
        "palette": dna.palette,
        "typography": dna.typography,
        "layoutRules": dna.layout_rules,
        "compositionMood": dna.composition_mood,
        "updatedAt": dna.updated_at.isoformat(),
        "versionHistory": [
            {
                "id": h.id,
                "version": h.version,
                "date": h.created_at.strftime("%Y-%m-%d"),
                "notes": h.notes or f"DNA synthesis ({h.archetype})",
                "isActive": h.is_active
            }
            for h in history
        ]
    }

@router.get("/brand/{brand_id}", response_model=ApiResponse[dict])
def get_visual_dna(brand_id: str, db: Session = Depends(get_db)):
    all_versions = db.query(VisualDNAProfile).filter(
        VisualDNAProfile.brand_id == brand_id
    ).order_by(VisualDNAProfile.created_at.desc()).all()

    if not all_versions:
        dna = seed_default_dna(db, brand_id)
        all_versions = [dna]

    active = next((v for v in all_versions if v.is_active), all_versions[0])
    return ApiResponse(data=_serialize_dna(active, all_versions))

@router.post("/brand/{brand_id}/rebuild", response_model=ApiResponse[dict])
def rebuild_visual_dna(brand_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    existing_versions = db.query(VisualDNAProfile).filter(
        VisualDNAProfile.brand_id == brand_id
    ).order_by(VisualDNAProfile.created_at.desc()).all()

    if not existing_versions:
        dna = seed_default_dna(db, brand_id)
        return ApiResponse(data=_serialize_dna(dna, [dna]))

    latest = existing_versions[0]
    for v in existing_versions:
        v.is_active = False

    # Aggregate dominant colors across analyzed references for this brand
    analyses = db.query(ReferenceAnalysis).filter(ReferenceAnalysis.brand_id == brand_id).all()
    aggregated_hexes: List[str] = []
    for an in analyses:
        for hex_val in (an.palette or []):
            if hex_val not in aggregated_hexes:
                aggregated_hexes.append(hex_val)

    new_palette = list(latest.palette or [])
    if aggregated_hexes:
        roles = [
            "Dominant Background / High-Priority Text",
            "Canvas Surface / Clean Contrast",
            "Accent Highlights & Tactical CTAs",
            "Secondary Hierarchy & Subtle Gridlines",
            "Soft Matte Divider"
        ]
        new_palette = [
            {
                "hex": hx,
                "name": f"Extracted Token {idx + 1}",
                "role": roles[idx] if idx < len(roles) else "Supporting Accent"
            }
            for idx, hx in enumerate(aggregated_hexes[:5])
        ]

    ver_num = float(latest.version.replace("v", "")) + 0.1
    new_dna = VisualDNAProfile(
        workspace_id=latest.workspace_id,
        brand_id=brand_id,
        version=f"v{ver_num:.1f}",
        is_active=True,
        archetype=analyses[-1].archetype if analyses and analyses[-1].archetype else latest.archetype,
        confidence_score=min(98.5, round(latest.confidence_score + 1.0, 1)),
        palette=new_palette,
        typography=latest.typography,
        layout_rules=latest.layout_rules,
        composition_mood=latest.composition_mood,
        notes=f"Re-synthesized from {len(analyses)} processed reference(s)."
    )
    db.add(new_dna)
    db.commit()
    db.refresh(new_dna)

    all_versions = db.query(VisualDNAProfile).filter(
        VisualDNAProfile.brand_id == brand_id
    ).order_by(VisualDNAProfile.created_at.desc()).all()

    return ApiResponse(data=_serialize_dna(new_dna, all_versions))

@router.patch("/{profile_id}", response_model=ApiResponse[dict])
def update_visual_dna(profile_id: str, payload: Dict[str, Any], db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    dna = db.query(VisualDNAProfile).filter(VisualDNAProfile.id == profile_id).first()
    if not dna:
        raise HTTPException(status_code=404, detail="Visual DNA profile not found")

    if "archetype" in payload:
        dna.archetype = payload["archetype"]
    if "palette" in payload:
        dna.palette = payload["palette"]
    if "typography" in payload:
        dna.typography = payload["typography"]
    if "layoutRules" in payload:
        dna.layout_rules = payload["layoutRules"]
    if "compositionMood" in payload:
        dna.composition_mood = payload["compositionMood"]

    db.commit()
    db.refresh(dna)
    all_versions = db.query(VisualDNAProfile).filter(
        VisualDNAProfile.brand_id == dna.brand_id
    ).order_by(VisualDNAProfile.created_at.desc()).all()
    return ApiResponse(data=_serialize_dna(dna, all_versions))
