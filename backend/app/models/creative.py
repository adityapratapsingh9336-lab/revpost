import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Creative(Base):
    __tablename__ = "creatives"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    platform = Column(String, nullable=False, default="Instagram")
    format = Column(String, nullable=False, default="1080x1350 (Portrait Carousel)")
    content_type = Column(String, nullable=False, default="carousel")  # 'carousel' or 'static'
    slides_count = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="draft")  # draft, in_review, scheduled, published
    caption = Column(Text, nullable=True)
    hashtags = Column(JSON, nullable=False, default=list)
    design_archetype = Column(String, nullable=True)
    blueprint_json = Column(JSON, nullable=False, default=dict)
    scheduled_for = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", back_populates="creatives")

