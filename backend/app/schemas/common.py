import uuid
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class MetaInfo(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: MetaInfo = Field(default_factory=MetaInfo)

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ApiErrorResponse(BaseModel):
    error: ErrorDetail

