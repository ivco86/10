from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint

from app.database import Base


class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text)

    __table_args__ = (
        UniqueConstraint("tenant_id", "key", name="uq_tenant_settings_key"),
    )
