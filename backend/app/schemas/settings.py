from typing import Optional, Dict
from decimal import Decimal
from pydantic import BaseModel, EmailStr


class BusinessInfo(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    vat_number: Optional[str] = None
    currency: str = "GBP"


class VatRates(BaseModel):
    standard: Decimal = Decimal("20.00")
    reduced: Decimal = Decimal("5.00")
    zero: Decimal = Decimal("0.00")


class ReceiptTemplate(BaseModel):
    header: Optional[str] = None
    footer: Optional[str] = None
    show_vat_breakdown: bool = True


class AllSettings(BaseModel):
    business: BusinessInfo
    vat_rates: VatRates
    receipt: ReceiptTemplate
