from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    # Categories
    def get_categories(self, tenant_id: int) -> List[Category]:
        return self.db.query(Category).filter(Category.tenant_id == tenant_id).all()

    def create_category(self, tenant_id: int, data: CategoryCreate) -> Category:
        category = Category(tenant_id=tenant_id, **data.model_dump())
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update_category(self, tenant_id: int, category_id: int, data: CategoryUpdate) -> Optional[Category]:
        category = self.db.query(Category).filter(
            Category.id == category_id, Category.tenant_id == tenant_id
        ).first()
        if not category:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(category, key, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete_category(self, tenant_id: int, category_id: int) -> bool:
        category = self.db.query(Category).filter(
            Category.id == category_id, Category.tenant_id == tenant_id
        ).first()
        if not category:
            return False
        self.db.delete(category)
        self.db.commit()
        return True

    # Products
    def get_products(self, tenant_id: int, skip: int = 0, limit: int = 50) -> tuple[List[Product], int]:
        query = self.db.query(Product).options(joinedload(Product.category)).filter(
            Product.tenant_id == tenant_id, Product.is_active == True
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_product(self, tenant_id: int, product_id: int) -> Optional[Product]:
        return self.db.query(Product).options(joinedload(Product.category)).filter(
            Product.id == product_id, Product.tenant_id == tenant_id
        ).first()

    def search_products(self, tenant_id: int, query: str, limit: int = 20) -> List[Product]:
        return self.db.query(Product).options(joinedload(Product.category)).filter(
            Product.tenant_id == tenant_id,
            Product.is_active == True,
            or_(
                Product.name.ilike(f'%{query}%'),
                Product.sku.ilike(f'%{query}%'),
                Product.barcode == query
            )
        ).limit(limit).all()

    def create_product(self, tenant_id: int, data: ProductCreate) -> Product:
        product = Product(tenant_id=tenant_id, **data.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        
        # Ensure category is loaded for response model if category_id is present
        if product.category_id:
            self.db.query(Product).options(joinedload(Product.category)).filter(Product.id == product.id).first()
            
        return product

    def update_product(self, tenant_id: int, product_id: int, data: ProductUpdate) -> Optional[Product]:
        product = self.get_product(tenant_id, product_id)
        if not product:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete_product(self, tenant_id: int, product_id: int) -> bool:
        product = self.get_product(tenant_id, product_id)
        if not product:
            return False
        product.is_active = False  # Soft delete
        self.db.commit()
        return True
