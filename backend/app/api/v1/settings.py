from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.settings import BusinessInfo, VatRates, ReceiptTemplate, AllSettings
from app.services.settings_service import SettingsService
from app.core.dependencies import require_permission
from app.models.user import User

router = APIRouter()


@router.get("", response_model=AllSettings)
def get_all_settings(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    """Get all settings"""
    service = SettingsService(db)
    return AllSettings(
        business=service.get_business_info(user.tenant_id),
        vat_rates=service.get_vat_rates(user.tenant_id),
        receipt=service.get_receipt_template(user.tenant_id)
    )


@router.get("/business", response_model=BusinessInfo)
def get_business_info(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.get_business_info(user.tenant_id)


@router.put("/business", response_model=BusinessInfo)
def update_business_info(
    data: BusinessInfo,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.update_business_info(user.tenant_id, data)


@router.get("/vat-rates", response_model=VatRates)
def get_vat_rates(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.get_vat_rates(user.tenant_id)


@router.put("/vat-rates", response_model=VatRates)
def update_vat_rates(
    data: VatRates,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.update_vat_rates(user.tenant_id, data)


@router.get("/receipt", response_model=ReceiptTemplate)
def get_receipt_template(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.get_receipt_template(user.tenant_id)


@router.put("/receipt", response_model=ReceiptTemplate)
def update_receipt_template(
    data: ReceiptTemplate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("*"))
):
    service = SettingsService(db)
    return service.update_receipt_template(user.tenant_id, data)
