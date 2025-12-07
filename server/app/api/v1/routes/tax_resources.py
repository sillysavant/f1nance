from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.schemas.tax_resource import (
    TaxResourceCreate,
    TaxResourceUpdate,
    TaxResourceOut
)
from app.models.tax_resource import TaxResource

router = APIRouter(prefix="/tax-resources", tags=["Tax Resources"])


# -------------------
# List all resources
# -------------------
@router.get("/", response_model=List[TaxResourceOut])
def list_resources(db: Session = Depends(get_db)):
    return db.query(TaxResource).order_by(TaxResource.created_at.desc()).all()


# -------------------
# Create a resource
# -------------------
@router.post("/", response_model=TaxResourceOut)
def create_resource(resource_in: TaxResourceCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):

    resource = TaxResource(
        title=resource_in.title,
        type=resource_in.type,
        access=resource_in.access,
        download_url=resource_in.download_url,
        user_id=None  # explicitly global
    )

    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


# -------------------
# Update a resource
# -------------------
@router.put("/{resource_id}/", response_model=TaxResourceOut)
def update_resource(resource_id: int, resource_in: TaxResourceUpdate, db: Session = Depends(get_db)):
    resource = db.query(TaxResource).filter(TaxResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    for field, value in resource_in.dict(exclude_unset=True).items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)
    return resource


# -------------------
# Delete a resource
# -------------------
@router.delete("/{resource_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(TaxResource).filter(TaxResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(resource)
    db.commit()
    return {"detail": "Resource deleted"}
