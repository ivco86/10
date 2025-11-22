from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel
from datetime import date


class DailySummary(BaseModel):
    date: date
    total_sales: int
    total_revenue: Decimal
    total_vat: Decimal
    cash_sales: Decimal
    card_sales: Decimal


class ProductSalesReport(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    revenue: Decimal


class SalesByDateReport(BaseModel):
    start_date: date
    end_date: date
    total_sales: int
    total_revenue: Decimal
    total_vat: Decimal
    daily_breakdown: List[DailySummary]
    top_products: List[ProductSalesReport]
