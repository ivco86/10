from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, UserCreate
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new business (tenant) with owner account"""
    service = AuthService(db)

    # Check if email exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    tenant, user = service.register_business(data)
    token = service.generate_token(user)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        tenant=tenant
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    service = AuthService(db)
    user = service.authenticate(data.email, data.password)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = service.generate_token(user)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        tenant=user.tenant
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Get current user info"""
    return user


@router.post("/users", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users:write"))
):
    """Create a new user (owner/manager only)"""
    service = AuthService(db)

    # Check email uniqueness within tenant
    existing = db.query(User).filter(
        User.tenant_id == current_user.tenant_id,
        User.email == data.email
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user = service.create_user(
        tenant_id=current_user.tenant_id,
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=data.role
    )
    return user
