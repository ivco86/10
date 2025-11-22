from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, EmailStr
from datetime import datetime


class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    tax_number: Optional[str] = None
    registration_number: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    payment_terms: Optional[str] = None
    min_order_amount: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    is_active: bool = True


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    tax_number: Optional[str] = None
    registration_number: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    payment_terms: Optional[str] = None
    min_order_amount: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    tax_number: Optional[str] = None
    registration_number: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    payment_terms: Optional[str] = None
    min_order_amount: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

