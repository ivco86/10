from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel
from datetime import datetime


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    discount_amount: Decimal = Decimal("0")


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    discount_amount: Decimal = Decimal("0")
    payment_method: str  # cash, card
    cash_received: Optional[Decimal] = None
    notes: Optional[str] = None


class SaleItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    total: Decimal

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    sale_number: str
    subtotal: Decimal
    discount_amount: Decimal
    vat_amount: Decimal
    total: Decimal
    payment_method: Optional[str]
    cash_received: Optional[Decimal]
    change_given: Optional[Decimal]
    status: str
    created_at: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    items: List[SaleResponse]
    total: int
