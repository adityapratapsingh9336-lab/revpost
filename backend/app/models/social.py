import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from app.database import Base

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String, nullable=False)  # Instagram Business, LinkedIn Company, X (Twitter) v2, Facebook Page
    account_name = Column(String, nullable=False)
    account_id = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Connected")  # Connected, Requires Reauth, Disconnected
    health = Column(String, nullable=False, default="Optimal")
    token_expires_in = Column(String, nullable=True, default="60 days")
    followers = Column(String, nullable=True, default="0")
    avatar = Column(String, nullable=True, default="🌐")
    scopes = Column(JSON, nullable=False, default=list)
    encrypted_token = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PublishingQueueItem(Base):
    __tablename__ = "publishing_queue"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    creative_id = Column(String, ForeignKey("creatives.id", ondelete="CASCADE"), nullable=False)
    social_account_id = Column(String, nullable=True)
    post_title = Column(String, nullable=False, default="Scheduled Creative")
    format_label = Column(String, nullable=False, default="Carousel")
    platform = Column(String, nullable=False)
    target_account = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="Queued")  # Queued, Publishing, Published, Failed, Draft / On Hold
    approval_status = Column(String, nullable=False, default="Approved")
    idempotency_key = Column(String, unique=True, nullable=False)
    retry_count = Column(Integer, nullable=False, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
