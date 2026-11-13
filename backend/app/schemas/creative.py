from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.blueprint import DesignBlueprint

class CreativeGenerateRequest(BaseModel):
    brand_id: str
    topic_brief: str
    platform: str = "Instagram"
    format: str = "1080x1350 (Portrait Carousel)"
    content_type: str = "carousel"  # 'carousel' or 'static'
    slides_count: int = 5
    objective: str = "Educational & Authority"
    tone: str = "Direct & Science-Backed"
    cta_type: str = "Save Post / Link in Bio"
    archetype: Optional[str] = "High-Contrast Technical Minimalist"
    reference_id: Optional[str] = None

class CreativeCreate(BaseModel):
    brand_id: str
    title: str
    platform: str
    format: str
    content_type: str
    slides_count: int
    caption: str
    hashtags: List[str] = Field(default_factory=list)
    design_archetype: str
    blueprint_json: Dict[str, Any]

class CreativeUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    status: Optional[str] = None
    blueprint_json: Optional[Dict[str, Any]] = None
    scheduled_for: Optional[datetime] = None

class CreativeResponse(BaseModel):
    id: str
    workspace_id: str
    brand_id: str
    title: str
    platform: str
    format: str
    content_type: str
    slides_count: int
    status: str
    caption: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)
    design_archetype: Optional[str] = None
    blueprint_json: Dict[str, Any] = Field(default_factory=dict)
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

