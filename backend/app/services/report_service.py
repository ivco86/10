from typing import List
from decimal import Decimal
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.sale import Sale, SaleItem
from app.schemas.report import DailySummary, ProductSalesReport


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_daily_summary(self, tenant_id: int, report_date: date) -> DailySummary:
        start = datetime.combine(report_date, datetime.min.time())
        end = datetime.combine(report_date, datetime.max.time())

        sales = self.db.query(Sale).filter(
            Sale.tenant_id == tenant_id,
            Sale.status == "completed",
            Sale.created_at.between(start, end)
        ).all()

        total_revenue = sum(s.total for s in sales) or Decimal("0")
        total_vat = sum(s.vat_amount for s in sales) or Decimal("0")
        cash_sales = sum(s.total for s in sales if s.payment_method == "cash") or Decimal("0")
        card_sales = sum(s.total for s in sales if s.payment_method == "card") or Decimal("0")

        return DailySummary(
            date=report_date,
            total_sales=len(sales),
            total_revenue=total_revenue,
            total_vat=total_vat,
            cash_sales=cash_sales,
            card_sales=card_sales
        )

    def get_sales_by_product(self, tenant_id: int, start_date: date, end_date: date) -> List[ProductSalesReport]:
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())

        results = self.db.query(
            SaleItem.product_id,
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label("qty"),
            func.sum(SaleItem.total).label("revenue")
        ).join(Sale).filter(
            Sale.tenant_id == tenant_id,
            Sale.status == "completed",
            Sale.created_at.between(start, end)
        ).group_by(SaleItem.product_id, SaleItem.product_name).order_by(
            func.sum(SaleItem.total).desc()
        ).limit(20).all()

        return [
            ProductSalesReport(
                product_id=r.product_id or 0,
                product_name=r.product_name,
                quantity_sold=r.qty or 0,
                revenue=r.revenue or Decimal("0")
            )
            for r in results
        ]

    def get_date_range_report(self, tenant_id: int, start_date: date, end_date: date) -> dict:
        daily = []
        current = start_date
        while current <= end_date:
            daily.append(self.get_daily_summary(tenant_id, current))
            current += timedelta(days=1)

        top_products = self.get_sales_by_product(tenant_id, start_date, end_date)

        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_sales": sum(d.total_sales for d in daily),
            "total_revenue": sum(d.total_revenue for d in daily),
            "total_vat": sum(d.total_vat for d in daily),
            "daily_breakdown": daily,
            "top_products": top_products
        }
