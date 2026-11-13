import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class ReferenceAsset(Base):
    __tablename__ = "reference_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=True)
    storage_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    mime_type = Column(String, nullable=False, default="image/png")
    file_size_bytes = Column(Integer, nullable=False, default=0)
    source_url = Column(String, nullable=True)
    permission_notes = Column(Text, nullable=True)
    processing_status = Column(String, nullable=False, default="queued")  # queued, running, succeeded, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", back_populates="references")
    analysis = relationship("ReferenceAnalysis", back_populates="reference", uselist=False, cascade="all, delete-orphan")

class ReferenceAnalysis(Base):
    __tablename__ = "reference_analysis"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, nullable=False)
    brand_id = Column(String, nullable=False)
    reference_asset_id = Column(String, ForeignKey("reference_assets.id", ondelete="CASCADE"), nullable=False)
    palette = Column(JSON, nullable=False, default=list)  # list of hex strings
    typography_hints = Column(JSON, nullable=False, default=dict)
    layout_patterns = Column(JSON, nullable=False, default=list)
    ocr_text = Column(Text, nullable=True)
    archetype = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    reference = relationship("ReferenceAsset", back_populates="analysis")

