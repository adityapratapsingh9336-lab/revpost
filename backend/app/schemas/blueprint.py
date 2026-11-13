from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SlideElement(BaseModel):
    id: str
    type: str  # 'badge', 'headline', 'subhead', 'shape', 'footer', 'image'
    content: Optional[str] = None
    styles: Dict[str, Any] = Field(default_factory=dict)
    position: Optional[Dict[str, float]] = None  # x, y, width, height

class SlideBlueprint(BaseModel):
    id: int
    slide_number: int
    badge: str = "POINT"
    headline: str
    subhead: str
    type: str = "content"  # 'hook', 'content', 'cta'
    elements: List[SlideElement] = Field(default_factory=list)

class DesignBlueprint(BaseModel):
    version: str = "1.0"
    title: str
    platform: str
    aspect_ratio: str = "4:5"
    width: int = 1080
    height: int = 1350
    archetype: str
    slides: List[SlideBlueprint]
    brand_id: str
    safe_margin_px: int = 80

