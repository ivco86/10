import json
from typing import Optional
from sqlalchemy.orm import Session

from app.models.settings import TenantSettings
from app.models.tenant import Tenant
from app.schemas.settings import BusinessInfo, VatRates, ReceiptTemplate


class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def _get(self, tenant_id: int, key: str) -> Optional[str]:
        setting = self.db.query(TenantSettings).filter(
            TenantSettings.tenant_id == tenant_id,
            TenantSettings.key == key
        ).first()
        return setting.value if setting else None

    def _set(self, tenant_id: int, key: str, value: str):
        setting = self.db.query(TenantSettings).filter(
            TenantSettings.tenant_id == tenant_id,
            TenantSettings.key == key
        ).first()
        if setting:
            setting.value = value
        else:
            setting = TenantSettings(tenant_id=tenant_id, key=key, value=value)
            self.db.add(setting)
        self.db.commit()

    def get_business_info(self, tenant_id: int) -> BusinessInfo:
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        return BusinessInfo(
            name=tenant.name,
            address=tenant.address,
            phone=tenant.phone,
            email=tenant.email,
            vat_number=tenant.vat_number,
            currency=tenant.currency
        )

    def update_business_info(self, tenant_id: int, data: BusinessInfo) -> BusinessInfo:
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        tenant.name = data.name
        tenant.address = data.address
        tenant.phone = data.phone
        tenant.email = data.email
        tenant.vat_number = data.vat_number
        tenant.currency = data.currency
        self.db.commit()
        return data

    def get_vat_rates(self, tenant_id: int) -> VatRates:
        raw = self._get(tenant_id, "vat_rates")
        if raw:
            return VatRates(**json.loads(raw))
        return VatRates()

    def update_vat_rates(self, tenant_id: int, data: VatRates) -> VatRates:
        self._set(tenant_id, "vat_rates", data.model_dump_json())
        return data

    def get_receipt_template(self, tenant_id: int) -> ReceiptTemplate:
        raw = self._get(tenant_id, "receipt_template")
        if raw:
            return ReceiptTemplate(**json.loads(raw))
        return ReceiptTemplate()

    def update_receipt_template(self, tenant_id: int, data: ReceiptTemplate) -> ReceiptTemplate:
        self._set(tenant_id, "receipt_template", data.model_dump_json())
        return data
