import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    default_role = Column(String, nullable=False, default="owner")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, nullable=False, default="ws_default")
    actor_user_id = Column(String, nullable=False, default="user_admin")
    actor_email = Column(String, nullable=False, default="aditya@example.com")
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkspaceRoutingConfig(Base):
    __tablename__ = "workspace_routing_configs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, unique=True, nullable=False, default="ws_default")
    vision_provider = Column(String, nullable=False, default="anthropic")
    copy_provider = Column(String, nullable=False, default="openai")
    fallback_provider = Column(String, nullable=False, default="gemini")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

