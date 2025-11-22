from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel
from datetime import datetime


# Category schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


# Product schemas
class ProductCreate(BaseModel):
    name: str
    category_id: Optional[int] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Decimal
    cost_price: Optional[Decimal] = None
    vat_rate: Decimal = Decimal("20.00")
    stock_quantity: int = 0
    min_stock_level: int = 0
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    vat_rate: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Decimal
    cost_price: Optional[Decimal] = None
    vat_rate: Decimal
    stock_quantity: int
    min_stock_level: int
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
