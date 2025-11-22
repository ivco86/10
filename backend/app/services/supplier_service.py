from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.models.supplier import Supplier
from app.models.product import Product
from app.schemas.supplier import SupplierCreate, SupplierUpdate


class SupplierService:
    def __init__(self, db: Session):
        self.db = db

    def get_suppliers(self, tenant_id: int) -> List[Supplier]:
        """Get all suppliers for a tenant"""
        suppliers = self.db.query(Supplier).filter(
            Supplier.tenant_id == tenant_id
        ).order_by(Supplier.name).all()
        
        # Add products_count for each supplier (if needed in the future)
        for supplier in suppliers:
            # This could be optimized with a subquery if needed
            pass
        
        return suppliers

    def get_supplier(self, tenant_id: int, supplier_id: int) -> Optional[Supplier]:
        """Get a single supplier by ID"""
        return self.db.query(Supplier).filter(
            Supplier.id == supplier_id, Supplier.tenant_id == tenant_id
        ).first()

    def search_suppliers(self, tenant_id: int, query: str, limit: int = 20) -> List[Supplier]:
        """Search suppliers by name, email, or phone"""
        return self.db.query(Supplier).filter(
            Supplier.tenant_id == tenant_id,
            or_(
                Supplier.name.ilike(f'%{query}%'),
                Supplier.email.ilike(f'%{query}%'),
                Supplier.phone.ilike(f'%{query}%')
            )
        ).limit(limit).all()

    def create_supplier(self, tenant_id: int, data: SupplierCreate) -> Supplier:
        """Create a new supplier"""
        supplier = Supplier(tenant_id=tenant_id, **data.model_dump())
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def update_supplier(self, tenant_id: int, supplier_id: int, data: SupplierUpdate) -> Optional[Supplier]:
        """Update an existing supplier"""
        supplier = self.get_supplier(tenant_id, supplier_id)
        if not supplier:
            return None
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(supplier, key, value)
        
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def delete_supplier(self, tenant_id: int, supplier_id: int) -> bool:
        """Delete a supplier (hard delete)"""
        supplier = self.get_supplier(tenant_id, supplier_id)
        if not supplier:
            return False
        
        self.db.delete(supplier)
        self.db.commit()
        return True

