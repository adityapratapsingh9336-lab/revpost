import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, nullable=False)
    job_type = Column(String, nullable=False)  # 'reference_analysis', 'blueprint_generation', 'render', 'publish'
    status = Column(String, nullable=False, default="queued")  # queued, running, succeeded, failed, cancelled
    payload = Column(JSON, nullable=False, default=dict)
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIProviderKey(Base):
    __tablename__ = "ai_provider_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)  # 'Anthropic', 'OpenAI', 'Gemini', 'DeepSeek'
    encrypted_key = Column(Text, nullable=False)
    masked_key = Column(String, nullable=False)
    is_active = Column(String, nullable=False, default="Connected")
    monthly_budget = Column(Integer, nullable=False, default=5000000)
    current_tokens_used = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

