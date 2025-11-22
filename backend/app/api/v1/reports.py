from typing import List
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report import DailySummary, ProductSalesReport, SalesByDateReport
from app.services.report_service import ReportService
from app.core.dependencies import require_permission
from app.models.user import User

router = APIRouter()


@router.get("/daily", response_model=DailySummary)
def get_daily_summary(
    report_date: date = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("reports:read"))
):
    """Get daily sales summary"""
    service = ReportService(db)
    return service.get_daily_summary(user.tenant_id, report_date or date.today())


@router.get("/by-product", response_model=List[ProductSalesReport])
def get_sales_by_product(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("reports:read"))
):
    """Get sales breakdown by product"""
    service = ReportService(db)
    return service.get_sales_by_product(user.tenant_id, start_date, end_date)


@router.get("/range", response_model=SalesByDateReport)
def get_date_range_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("reports:read"))
):
    """Get comprehensive report for date range"""
    service = ReportService(db)
    return service.get_date_range_report(user.tenant_id, start_date, end_date)
