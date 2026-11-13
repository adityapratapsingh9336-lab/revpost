import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Brand(Base):
    __tablename__ = "brands"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, default="brand")
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    default_language = Column(String, nullable=False, default="en")
    brand_profile = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="brands")
    knowledge_entries = relationship("BrandKnowledge", back_populates="brand", cascade="all, delete-orphan")
    references = relationship("ReferenceAsset", back_populates="brand", cascade="all, delete-orphan")
    dna_profiles = relationship("VisualDNAProfile", back_populates="brand", cascade="all, delete-orphan")
    creatives = relationship("Creative", back_populates="brand", cascade="all, delete-orphan")

class BrandKnowledge(Base):
    __tablename__ = "brand_knowledge"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)  # 'overview', 'products', 'audience', 'voice', 'restrictions', 'assets'
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=False, default=dict)
    is_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", back_populates="knowledge_entries")

