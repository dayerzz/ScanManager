import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.schemas.scan import ScanResponse
from app.models.scan import Scan
from app.models.user import User

router = APIRouter(prefix="/scans", tags=["scans"])

BASE_STORAGE_PATH = "storage"


@router.post("/upload")
def upload_scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # создаём папку пользователя
    user_folder = os.path.join(BASE_STORAGE_PATH, f"user_{current_user.id}")
    os.makedirs(user_folder, exist_ok=True)

    # генерируем уникальное имя файла
    file_extension = os.path.splitext(file.filename)[1]
    stored_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(user_folder, stored_filename)

    # сохраняем файл
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    file_size = len(content)

    # создаём запись в БД
    new_scan = Scan(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=file_size
    )

    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return {
        "id": str(new_scan.id),
        "filename": new_scan.original_filename,
        "size": new_scan.file_size
    }


@router.get("/", response_model=List[ScanResponse])
def get_user_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .all()
    )

    return scans


@router.get("/{scan_id}/download")
def download_scan(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id, Scan.user_id == current_user.id)
        .first()
    )

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return FileResponse(
        path=scan.file_path,
        filename=scan.original_filename,
        media_type="application/octet-stream"
    )