from enum import Enum
from typing import List


class Role(str, Enum):
    OWNER = "owner"
    MANAGER = "manager"
    CASHIER = "cashier"


ROLE_PERMISSIONS = {
    Role.OWNER: ["*"],  # All permissions
    Role.MANAGER: [
        "products:read", "products:write",
        "sales:read", "sales:write",
        "inventory:read", "inventory:write",
        "reports:read",
        "users:read",
    ],
    Role.CASHIER: [
        "products:read",
        "sales:read", "sales:write",
        "inventory:read",
    ],
}


def has_permission(role: str, permission: str) -> bool:
    role_enum = Role(role)
    permissions = ROLE_PERMISSIONS.get(role_enum, [])
    return "*" in permissions or permission in permissions


def get_role_permissions(role: str) -> List[str]:
    role_enum = Role(role)
    return ROLE_PERMISSIONS.get(role_enum, [])
