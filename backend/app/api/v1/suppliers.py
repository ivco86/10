from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.services.supplier_service import SupplierService
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all suppliers for the tenant"""
    service = SupplierService(db)
    return service.get_suppliers(user.tenant_id)


@router.get("/search", response_model=List[SupplierResponse])
def search_suppliers(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Search suppliers by name, email, or phone"""
    service = SupplierService(db)
    return service.search_suppliers(user.tenant_id, q, limit)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a single supplier by ID"""
    service = SupplierService(db)
    supplier = service.get_supplier(user.tenant_id, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("suppliers:write"))
):
    """Create a new supplier"""
    try:
        service = SupplierService(db)
        return service.create_supplier(user.tenant_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating supplier: {str(e)}"
        )


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("suppliers:write"))
):
    """Update an existing supplier"""
    try:
        service = SupplierService(db)
        supplier = service.update_supplier(user.tenant_id, supplier_id, data)
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return supplier
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating supplier: {str(e)}"
        )


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("suppliers:write"))
):
    """Delete a supplier"""
    try:
        service = SupplierService(db)
        if not service.delete_supplier(user.tenant_id, supplier_id):
            raise HTTPException(status_code=404, detail="Supplier not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting supplier: {str(e)}"
        )


@router.get("/{supplier_id}/products")
def get_supplier_products(
    supplier_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get products for a supplier (placeholder for future implementation)"""
    service = SupplierService(db)
    supplier = service.get_supplier(user.tenant_id, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    # TODO: Implement supplier-products relationship when needed
    return []


@router.get("/{supplier_id}/orders")
def get_supplier_orders(
    supplier_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get orders for a supplier (placeholder for future implementation)"""
    service = SupplierService(db)
    supplier = service.get_supplier(user.tenant_id, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    # TODO: Implement supplier orders when needed
    return []

