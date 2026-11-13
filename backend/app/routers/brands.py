from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.brand import Brand, BrandKnowledge
from app.models.workspace import Workspace
from app.schemas.common import ApiResponse
from app.schemas.brand import BrandCreate, BrandUpdate, BrandKnowledgeCreate
from app.auth import require_role

router = APIRouter(prefix="/api/v1/brands", tags=["Brands"])

def seed_default_brands(db: Session, workspace_id: str) -> List[Brand]:
    b1 = Brand(
        id="brand_1",
        workspace_id=workspace_id,
        name="PulseFit Athletics",
        slug="pulsefit",
        industry="Fitness & Activewear",
        tagline="Engineering Human Movement & Precision Performance",
        description="A modern, science-backed athletic wear brand focused on minimalist technical gear for high-output athletes and fitness enthusiasts.",
        brand_profile={
            "primaryColor": "#0F172A",
            "accentColor": "#3B82F6",
            "secondaryColor": "#F8FAFC",
            "fontCategory": "Modern Geometric Sans",
            "activeDNAVersion": "v1.4",
            "audience": {
                "demographics": "Ages 22–38, urban & suburban professionals, daily athletes",
                "painPoints": "Low-quality gym wear that wears out, overhyped fitness marketing, lack of breathable fabric"
            },
            "voice": {
                "tone": ["Empowering", "Direct", "Science-backed", "Unpretentious"],
                "approvedWords": ["Precision", "Kinetic", "Relentless", "Endurance", "Focus"],
                "prohibitedWords": ["Miracle", "Secret hack", "Skinny", "Cheap", "Guaranteed gains"]
            },
            "restrictions": [
                "Never make unverified medical recovery claims.",
                "Always attribute athlete imagery to verified PulseFit team athletes.",
                "Maintain at least 15% clear margin space around the primary wordmark."
            ],
            "products": [
                {"id": "prod_1", "name": "AeroCore Seamless Leggings", "category": "Apparel", "usp": "4-way targeted compression with moisture-wicking weave"},
                {"id": "prod_2", "name": "HydraVent Half-Zip", "category": "Outerwear", "usp": "Ultralight thermo-regulating technical fabric"},
                {"id": "prod_3", "name": "Apex Grip Lifting Strap", "category": "Accessories", "usp": "Silicone micro-embossed heavy duty support"}
            ]
        }
    )
    b2 = Brand(
        id="brand_2",
        workspace_id=workspace_id,
        name="Nordic Roast Co.",
        slug="nordic-roast",
        industry="Specialty Coffee & Lifestyle",
        tagline="Light-Roast Single Origins with Clean Traceability",
        description="Ethically sourced Scandinavian light roast coffee beans roasted in small batches with full origin transparency.",
        brand_profile={
            "primaryColor": "#262626",
            "accentColor": "#D97706",
            "secondaryColor": "#F5F5F4",
            "fontCategory": "Neo-Grotesque Clean Sans",
            "activeDNAVersion": "v1.1",
            "audience": {"demographics": "Specialty coffee enthusiasts, home brewers", "painPoints": "Over-roasted bitter supermarket beans"},
            "voice": {"tone": ["Warm", "Transparent", "Artisanal"], "approvedWords": ["Single-origin", "Traceable", "Floral", "Clean"], "prohibitedWords": ["Instant", "Cheap"]},
            "restrictions": ["Verify farm lot numbers before publication."],
            "products": [{"id": "prod_n1", "name": "Ethiopia Yirgacheffe Washed", "category": "Whole Bean", "usp": "Bright jasmine & bergamot notes"}]
        }
    )
    db.add_all([b1, b2])
    db.commit()
    db.refresh(b1)
    db.refresh(b2)
    return [b1, b2]

def _serialize_brand(b: Brand) -> dict:
    prof = b.brand_profile or {}
    return {
        "id": b.id,
        "workspace_id": b.workspace_id,
        "name": b.name,
        "slug": b.slug,
        "industry": b.industry,
        "tagline": b.tagline,
        "description": b.description,
        "primaryColor": prof.get("primaryColor", "#0F172A"),
        "accentColor": prof.get("accentColor", "#3B82F6"),
        "secondaryColor": prof.get("secondaryColor", "#F8FAFC"),
        "fontCategory": prof.get("fontCategory", "Modern Geometric Sans"),
        "activeDNAVersion": prof.get("activeDNAVersion", "v1.0"),
        "brand_profile": prof,
        "audience": prof.get("audience", {}),
        "voice": prof.get("voice", {}),
        "restrictions": prof.get("restrictions", []),
        "products": prof.get("products", []),
        "created_at": b.created_at.isoformat()
    }

@router.get("", response_model=ApiResponse[List[dict]])
def get_brands(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Brand)
    if workspace_id:
        query = query.filter(Brand.workspace_id == workspace_id)
    brands = query.all()
    if not brands and not workspace_id:
        ws = db.query(Workspace).first()
        if not ws:
            ws = Workspace(name="Acme Growth Labs", slug="acme-growth-labs", tier="Pro Enterprise")
            db.add(ws)
            db.commit()
            db.refresh(ws)
        brands = seed_default_brands(db, ws.id)

    return ApiResponse(data=[_serialize_brand(b) for b in brands])

@router.post("", response_model=ApiResponse[dict])
def create_brand(payload: BrandCreate, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    ws = db.query(Workspace).first()
    if not ws:
        ws = Workspace(name="Acme Growth Labs")
        db.add(ws)
        db.commit()
        db.refresh(ws)

    brand = Brand(
        workspace_id=ws.id,
        name=payload.name,
        slug=payload.name.lower().replace(" ", "-"),
        industry=payload.industry or "General",
        tagline=payload.tagline or "",
        description=payload.description or "",
        website_url=payload.website_url,
        brand_profile=payload.brand_profile or {
            "primaryColor": "#0F172A",
            "accentColor": "#3B82F6",
            "secondaryColor": "#F8FAFC",
            "fontCategory": "Modern Geometric Sans",
            "activeDNAVersion": "v1.0",
        }
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)

    return ApiResponse(data=_serialize_brand(brand))

@router.get("/{brand_id}", response_model=ApiResponse[dict])
def get_brand_detail(brand_id: str, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return ApiResponse(data=_serialize_brand(brand))

@router.patch("/{brand_id}", response_model=ApiResponse[dict])
def update_brand(brand_id: str, payload: BrandUpdate, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if payload.name is not None:
        brand.name = payload.name
    if payload.tagline is not None:
        brand.tagline = payload.tagline
    if payload.description is not None:
        brand.description = payload.description
    if payload.industry is not None:
        brand.industry = payload.industry
    if payload.brand_profile is not None:
        merged = dict(brand.brand_profile or {})
        merged.update(payload.brand_profile)
        brand.brand_profile = merged

    db.commit()
    db.refresh(brand)
    return ApiResponse(data=_serialize_brand(brand))

@router.delete("/{brand_id}", response_model=ApiResponse[dict])
def delete_brand(brand_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
    return ApiResponse(data={"deleted_id": brand_id})

@router.get("/{brand_id}/knowledge", response_model=ApiResponse[List[dict]])
def get_brand_knowledge(brand_id: str, db: Session = Depends(get_db)):
    items = db.query(BrandKnowledge).filter(BrandKnowledge.brand_id == brand_id).all()
    return ApiResponse(
        data=[
            {
                "id": k.id,
                "category": k.category,
                "title": k.title,
                "content": k.content,
                "is_verified": k.is_verified,
                "created_at": k.created_at.isoformat()
            }
            for k in items
        ]
    )

@router.post("/{brand_id}/knowledge", response_model=ApiResponse[dict])
def create_brand_knowledge(brand_id: str, payload: BrandKnowledgeCreate, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    item = BrandKnowledge(
        workspace_id=brand.workspace_id,
        brand_id=brand_id,
        category=payload.category,
        title=payload.title,
        content=payload.content,
        metadata_json=payload.metadata_json,
        is_verified=payload.is_verified
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ApiResponse(data={"id": item.id, "category": item.category, "title": item.title})
