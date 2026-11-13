import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class VisualDNAProfile(Base):
    __tablename__ = "visual_dna_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    version = Column(String, nullable=False, default="v1.0")
    is_active = Column(Boolean, nullable=False, default=True)
    archetype = Column(String, nullable=False, default="High-Contrast Technical Minimalist")
    confidence_score = Column(Float, nullable=False, default=90.0)
    palette = Column(JSON, nullable=False, default=list)
    typography = Column(JSON, nullable=False, default=dict)
    layout_rules = Column(JSON, nullable=False, default=dict)
    composition_mood = Column(JSON, nullable=False, default=list)
    restrictions = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", back_populates="dna_profiles")

