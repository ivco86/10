from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.tenant import Tenant
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import RegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_business(self, data: RegisterRequest) -> Tuple[Tenant, User]:
        # Create tenant
        tenant = Tenant(name=data.business_name)
        self.db.add(tenant)
        self.db.flush()

        # Create owner user
        user = User(
            tenant_id=tenant.id,
            email=data.email,
            password_hash=get_password_hash(data.password),
            full_name=data.full_name,
            role="owner"
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(tenant)
        self.db.refresh(user)

        return tenant, user

    def authenticate(self, email: str, password: str) -> Optional[User]:
        user = self.db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    def create_user(self, tenant_id: int, email: str, password: str, full_name: str, role: str) -> User:
        user = User(
            tenant_id=tenant_id,
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role=role
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    @staticmethod
    def generate_token(user: User) -> str:
        return create_access_token({"sub": str(user.id), "tenant_id": user.tenant_id})
