import os
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.logger import logger
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
    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a name")

    try:
        user_folder = os.path.join(BASE_STORAGE_PATH, f"user_{current_user.id}")
        os.makedirs(user_folder, exist_ok=True)

        file_extension = os.path.splitext(file.filename)[1]
        stored_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(user_folder, stored_filename)

        content = file.file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        file_size = len(content)

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

        from app.services.ocr_service import extract_text_from_image

        file_ext = file_extension.lower()

        if file_ext in [".png", ".jpg", ".jpeg"]:
            try:
                ocr_text = extract_text_from_image(file_path)

                new_scan.ocr_text = ocr_text
                db.commit()

                logger.info(
                    f"OCR_DONE | user={current_user.id} | scan={new_scan.id} | chars={len(ocr_text)}"
                )

            except Exception as e:
                logger.error(
                    f"OCR_ERROR | user={current_user.id} | scan={new_scan.id} | error={str(e)}"
                )

        logger.info(
            f"SCAN_UPLOAD | user={current_user.id} | scan={new_scan.id} | size={file_size}"
        )

        return {
            "id": str(new_scan.id),
            "filename": new_scan.original_filename,
            "size": new_scan.file_size
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"SCAN_UPLOAD_ERROR | user={current_user.id} | error={str(e)}"
        )
        raise HTTPException(status_code=500, detail="File upload failed")


@router.get("/", response_model=List[ScanResponse])
def get_user_scans(
    search: str = "",
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    min_size: int | None = None,
    max_size: int | None = None,
    sort: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    # поиск
    if search:
        query = query.filter(
            Scan.original_filename.ilike(f"%{search}%") |
            Scan.ocr_text.ilike(f"%{search}%")
        )

    # фильтр по дате
    if date_from:
        query = query.filter(Scan.created_at >= date_from)

    if date_to:
        query = query.filter(Scan.created_at <= date_to)

    # фильтр по размеру
    if min_size:
        query = query.filter(Scan.file_size >= min_size)

    if max_size:
        query = query.filter(Scan.file_size <= max_size)

    # сортировка
    if sort == "asc":
        query = query.order_by(Scan.created_at.asc())
    else:
        query = query.order_by(Scan.created_at.desc())

    return query.all()


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
        logger.warning(
            f"DOWNLOAD FAILED | user={current_user.id} | scan={scan_id} | not found"
        )
        raise HTTPException(status_code=404, detail="Scan not found")

    if not os.path.exists(scan.file_path):
        logger.error(
            f"DOWNLOAD ERROR | file missing on disk | scan={scan.id}"
        )
        raise HTTPException(status_code=500, detail="File missing on server")

    logger.info(
        f"DOWNLOAD | user={current_user.id} | scan={scan.id}"
    )

    return FileResponse(
        path=scan.file_path,
        filename=scan.original_filename,
        media_type="application/octet-stream"
    )


@router.delete("/{scan_id}")
def delete_scan(
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
        logger.warning(
            f"DELETE FAILED | user={current_user.id} | scan={scan_id} | not found"
        )
        raise HTTPException(status_code=404, detail="Scan not found")

    try:
        if os.path.exists(scan.file_path):
            os.remove(scan.file_path)

        db.delete(scan)
        db.commit()

        logger.info(
            f"DELETE | user={current_user.id} | scan={scan.id}"
        )

        return {"detail": "Scan deleted successfully"}

    except Exception as e:
        logger.error(
            f"DELETE ERROR | user={current_user.id} | scan={scan_id} | error={str(e)}"
        )
        raise HTTPException(status_code=500, detail="Failed to delete scan")
    

@router.patch("/{scan_id}")
def update_scan(
    scan_id: UUID,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if "original_filename" in data:
        scan.original_filename = data["original_filename"]

    db.commit()
    db.refresh(scan)

    return scan