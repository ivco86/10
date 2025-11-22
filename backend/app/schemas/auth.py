from typing import Optional
from pydantic import BaseModel, EmailStr


# Tenant schemas
class TenantCreate(BaseModel):
    name: str
    subdomain: Optional[str] = None
    vat_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    currency: str = "GBP"


class TenantResponse(BaseModel):
    id: int
    name: str
    subdomain: Optional[str]
    currency: str
    is_active: bool

    class Config:
        from_attributes = True


# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "cashier"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    tenant_id: int

    class Config:
        from_attributes = True


# Auth schemas
class RegisterRequest(BaseModel):
    business_name: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    tenant: TenantResponse
