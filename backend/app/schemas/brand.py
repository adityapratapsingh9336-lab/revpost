from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class BrandBase(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    default_language: str = "en"
    brand_profile: Dict[str, Any] = Field(default_factory=dict)

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    brand_profile: Optional[Dict[str, Any]] = None

class BrandResponse(BrandBase):
    id: str
    workspace_id: str
    slug: str

    class Config:
        from_attributes = True

class BrandKnowledgeCreate(BaseModel):
    category: str
    title: Optional[str] = None
    content: str
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    is_verified: bool = False

