from typing import List
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.inventory import StockAdjustment


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_inventory(self, tenant_id: int) -> List[dict]:
        products = self.db.query(Product).filter(
            Product.tenant_id == tenant_id,
            Product.is_active == True
        ).all()

        return [
            {
                **p.__dict__,
                "is_low_stock": p.stock_quantity <= p.min_stock_level
            }
            for p in products
        ]

    def get_low_stock(self, tenant_id: int) -> List[Product]:
        return self.db.query(Product).filter(
            Product.tenant_id == tenant_id,
            Product.is_active == True,
            Product.stock_quantity <= Product.min_stock_level
        ).all()

    def adjust_stock(self, tenant_id: int, user_id: int, data: StockAdjustment) -> Product:
        product = self.db.query(Product).filter(
            Product.id == data.product_id,
            Product.tenant_id == tenant_id
        ).first()

        if not product:
            raise ValueError("Product not found")

        product.stock_quantity += data.quantity

        movement = StockMovement(
            tenant_id=tenant_id,
            product_id=product.id,
            quantity=data.quantity,
            type="adjustment",
            notes=data.notes,
            user_id=user_id
        )
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(product)
        return product

    def get_stock_history(self, tenant_id: int, product_id: int) -> List[StockMovement]:
        return self.db.query(StockMovement).filter(
            StockMovement.tenant_id == tenant_id,
            StockMovement.product_id == product_id
        ).order_by(StockMovement.created_at.desc()).limit(100).all()
