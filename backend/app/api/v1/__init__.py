from fastapi import APIRouter
from app.api.v1 import auth, products, sales, inventory, reports, settings, suppliers

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(products.router, prefix="/products", tags=["products"])
router.include_router(sales.router, prefix="/sales", tags=["sales"])
router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(settings.router, prefix="/settings", tags=["settings"])
router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
