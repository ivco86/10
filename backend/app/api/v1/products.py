from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
)
from app.services.product_service import ProductService
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User

router = APIRouter()


# Categories
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ProductService(db)
    return service.get_categories(user.tenant_id)


@router.post("/categories", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    service = ProductService(db)
    return service.create_category(user.tenant_id, data)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    service = ProductService(db)
    category = service.update_category(user.tenant_id, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    service = ProductService(db)
    if not service.delete_category(user.tenant_id, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"ok": True}


# Products
@router.get("", response_model=ProductListResponse)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        service = ProductService(db)
        items, total = service.get_products(user.tenant_id, skip, limit)
        return ProductListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading products: {str(e)}"
        )


@router.get("/search", response_model=List[ProductResponse])
def search_products(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ProductService(db)
    return service.search_products(user.tenant_id, q)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ProductService(db)
    product = service.get_product(user.tenant_id, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    try:
        service = ProductService(db)
        return service.create_product(user.tenant_id, data)
    except Exception as e:
        # Log the error here if logging is configured
        print(f"Error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    try:
        service = ProductService(db)
        product = service.update_product(user.tenant_id, product_id, data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product: {str(e)}"
        )


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("products:write"))
):
    try:
        service = ProductService(db)
        if not service.delete_product(user.tenant_id, product_id):
            raise HTTPException(status_code=404, detail="Product not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting product: {str(e)}"
        )
