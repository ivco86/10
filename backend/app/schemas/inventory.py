from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class StockAdjustment(BaseModel):
    product_id: int
    quantity: int  # Positive = add, Negative = remove
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    type: str
    reference_id: Optional[int]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    stock_quantity: int
    min_stock_level: int

    class Config:
        from_attributes = True


class InventoryItem(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    barcode: Optional[str]
    stock_quantity: int
    min_stock_level: int
    price: Decimal
    is_low_stock: bool

    class Config:
        from_attributes = True
