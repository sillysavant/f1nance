from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil, os
from typing import List
from fastapi import status
from fastapi.responses import FileResponse

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.documents import UserDocument
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path(getattr(settings, "UPLOAD_DIR", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=dict)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    tags: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_types = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    user_folder = UPLOAD_DIR / f"user_{current_user.id}"
    os.makedirs(user_folder, exist_ok=True)
    file_path = user_folder / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = UserDocument(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=str(file_path),
        document_type=doc_type,
        tags=tags
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "id": document.id,
        "file_name": document.file_name,
        "document_type": document.document_type,
        "tags": document.tags,
        "uploaded_at": document.uploaded_at
    }

@router.get("/", response_model=List[dict])
def list_user_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = db.query(UserDocument).filter(UserDocument.user_id == current_user.id).all()
    return [
        {
            "id": doc.id,
            "file_name": doc.file_name,
            "document_type": doc.document_type,
            "tags": doc.tags,
            "uploaded_at": doc.uploaded_at
        }
        for doc in documents
    ]

@router.delete("/{document_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find document owned by the current user
    document = db.query(UserDocument).filter(
        UserDocument.id == document_id,
        UserDocument.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete the file from disk
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete from database
    db.delete(document)
    db.commit()

    return {"detail": "Document deleted successfully"}


# ------------------------------
# NEW: Download / view document
# ------------------------------
@router.get("/download/{doc_id}", response_class=FileResponse)
def download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch document metadata for the current user
    document = db.query(UserDocument).filter(
        UserDocument.id == doc_id,
        UserDocument.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")

    # Return the file as a response
    return FileResponse(
        path=file_path,
        filename=document.file_name,
        media_type="application/octet-stream"
    )
