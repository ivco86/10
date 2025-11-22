from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.inventory import StockAdjustment, StockMovementResponse, LowStockProduct, InventoryItem
from app.schemas.product import ProductResponse
from app.services.inventory_service import InventoryService
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[InventoryItem])
def get_inventory(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("inventory:read"))
):
    """Get current stock levels"""
    service = InventoryService(db)
    return service.get_inventory(user.tenant_id)


@router.get("/low-stock", response_model=List[LowStockProduct])
def get_low_stock(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("inventory:read"))
):
    """Get products with low stock"""
    service = InventoryService(db)
    return service.get_low_stock(user.tenant_id)


@router.post("/adjust", response_model=ProductResponse)
def adjust_stock(
    data: StockAdjustment,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("inventory:write"))
):
    """Adjust stock quantity"""
    service = InventoryService(db)
    try:
        return service.adjust_stock(user.tenant_id, user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history/{product_id}", response_model=List[StockMovementResponse])
def get_stock_history(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("inventory:read"))
):
    """Get stock movement history for a product"""
    service = InventoryService(db)
    return service.get_stock_history(user.tenant_id, product_id)
