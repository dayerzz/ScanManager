from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ScanResponse(BaseModel):
    id: UUID
    original_filename: str
    file_size: int
    created_at: datetime
    ocr_text: str | None

    class Config:
        from_attributes = True