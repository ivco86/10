from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse, SaleListResponse
from app.services.sale_service import SaleService
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User

router = APIRouter()


@router.post("", response_model=SaleResponse)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("sales:write"))
):
    """Process a new sale"""
    service = SaleService(db)
    try:
        return service.create_sale(user.tenant_id, user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=SaleListResponse)
def list_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("sales:read"))
):
    """List sales"""
    service = SaleService(db)
    items, total = service.get_sales(user.tenant_id, skip, limit)
    return SaleListResponse(items=items, total=total)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("sales:read"))
):
    """Get sale details"""
    service = SaleService(db)
    sale = service.get_sale(user.tenant_id, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
