from pydantic import BaseModel, EmailStr
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field # Import Field
# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "cashier || manager || admin"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBase

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str
    price: float = Field(..., ge=0, description="Price cannot be negative")
    stock: int = Field(default=0, ge=0, description="Stock cannot be negative")
    category: str

# This is what the Router was looking for
class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- ORDER SCHEMAS ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    subtotal: Decimal

class OrderCreate(BaseModel):
    total_amount: Decimal
    payment_method: str  # upi, cash, card
    token:int
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    total_amount: Decimal
    payment_method: str
    payment_status: str
    status: str
    created_at: datetime
    token: Optional[str]

    class Config:
        from_attributes = True

# --- SETTINGS SCHEMAS ---
class SettingUpdate(BaseModel):
    key_name: str
    value: str

class IngredientCreate(BaseModel):
    name: str
    unit: str
    current_stock: int = Field(default=0, ge=0, description="Stock cannot be negative")
    min_stock: int = Field(default=0, ge=0, description="Minimum stock cannot be negative")

class IngredientResponse(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: int
    min_stock: int

    class Config:
        from_attributes = True

class RecipeCreate(BaseModel):
    product_id: int
    ingredient_id: int
    quantity_required: float = Field(..., gt=0, description="Quantity must be greater than zero")


class RecipeResponse(BaseModel):
    id: int
    product_id: int
    ingredient_id: int
    quantity_required: int

    class Config:
        from_attributes = True
        
# Add this to app/schemas/pos_schemas.py

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None # Optional: allows changing passwords