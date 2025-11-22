from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.sale import SaleCreate


class SaleService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_sale_number(self, tenant_id: int) -> str:
        today = datetime.utcnow().strftime("%Y%m%d")
        count = self.db.query(Sale).filter(
            Sale.tenant_id == tenant_id,
            func.date(Sale.created_at) == func.date(datetime.utcnow())
        ).count()
        return f"INV-{today}-{count + 1:04d}"

    def create_sale(self, tenant_id: int, user_id: int, data: SaleCreate) -> Sale:
        subtotal = Decimal("0")
        vat_total = Decimal("0")
        sale_items = []

        # Process items
        for item_data in data.items:
            product = self.db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.tenant_id == tenant_id
            ).first()
            if not product:
                raise ValueError(f"Product {item_data.product_id} not found")

            item_subtotal = product.price * item_data.quantity - item_data.discount_amount
            item_vat = item_subtotal * product.vat_rate / Decimal("100")
            item_total = item_subtotal + item_vat

            subtotal += item_subtotal
            vat_total += item_vat

            sale_items.append({
                "product": product,
                "data": item_data,
                "item_vat": item_vat,
                "item_total": item_total
            })

        # Calculate totals
        total = subtotal + vat_total - data.discount_amount
        change_given = None
        if data.payment_method == "cash" and data.cash_received:
            change_given = data.cash_received - total

        # Create sale
        sale = Sale(
            tenant_id=tenant_id,
            user_id=user_id,
            sale_number=self._generate_sale_number(tenant_id),
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            vat_amount=vat_total,
            total=total,
            payment_method=data.payment_method,
            cash_received=data.cash_received,
            change_given=change_given,
            notes=data.notes
        )
        self.db.add(sale)
        self.db.flush()

        # Create sale items and update stock
        for item in sale_items:
            product = item["product"]
            item_data = item["data"]

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                product_name=product.name,
                quantity=item_data.quantity,
                unit_price=product.price,
                discount_amount=item_data.discount_amount,
                vat_rate=product.vat_rate,
                vat_amount=item["item_vat"],
                total=item["item_total"]
            )
            self.db.add(sale_item)

            # Update stock
            product.stock_quantity -= item_data.quantity

            # Create stock movement
            movement = StockMovement(
                tenant_id=tenant_id,
                product_id=product.id,
                quantity=-item_data.quantity,
                type="sale",
                reference_id=sale.id,
                user_id=user_id
            )
            self.db.add(movement)

        self.db.commit()
        self.db.refresh(sale)
        return sale

    def get_sales(self, tenant_id: int, skip: int = 0, limit: int = 50) -> tuple[List[Sale], int]:
        query = self.db.query(Sale).filter(Sale.tenant_id == tenant_id).order_by(Sale.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_sale(self, tenant_id: int, sale_id: int) -> Optional[Sale]:
        return self.db.query(Sale).filter(Sale.id == sale_id, Sale.tenant_id == tenant_id).first()
