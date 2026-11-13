import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, default="acme-growth-labs")
    tier = Column(String, nullable=False, default="Pro Enterprise")
    owner_id = Column(String, nullable=False, default="user_owner_default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    brands = relationship("Brand", back_populates="workspace", cascade="all, delete-orphan")

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False, default="Team Member")
    email = Column(String, nullable=False, default="member@example.com")
    role = Column(String, nullable=False, default="viewer")  # 'owner', 'admin', 'editor', 'viewer'
    status = Column(String, nullable=False, default="Active")  # 'Active', 'Invited'
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="members")
