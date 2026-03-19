from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text  # Required for raw SQL restaurant insertion
from typing import List

from app.db.session import get_db
from app.models.pos_models import User
from app.schemas.pos_schemas import UserCreate, UserLogin, Token, UserBase
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Authentication"])

# --- 1. PUBLIC: RESTAURANT ONBOARDING ---
@router.post("/restaurant-signup", response_model=Token)
async def restaurant_signup(
    user_in: UserCreate, 
    restaurant_name: str, 
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new Restaurant and its primary Admin user in one transaction.
    This is the entry point for a new business owner.
    """
    # Check if email exists
    existing_user = await db.execute(select(User).where(User.email == user_in.email))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # Create Restaurant Entry
        res_query = text("INSERT INTO restaurants (name, email) VALUES (:name, :email)")
        await db.execute(res_query, {"name": restaurant_name, "email": user_in.email})
        
        # Get the new ID
        id_query = text("SELECT LAST_INSERT_ID()")
        res_id_result = await db.execute(id_query)
        new_restaurant_id = res_id_result.scalar()

        # Create Admin User
        hashed_pw = get_password_hash(user_in.password)
        new_admin = User(
            username=user_in.username,
            email=user_in.email,
            password=hashed_pw,
            role="admin",  # Force first user as admin
            restaurant_id=new_restaurant_id
        )
        
        db.add(new_admin)
        await db.commit()
        await db.refresh(new_admin)

        # Generate Access Token
        access_token = create_access_token(subject=new_admin.email)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": new_admin
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


# --- 2. PUBLIC: LOGIN ---
@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    
    print("LOGIN ATTEMPT:", user_in.email)
    """
    Standard login for all roles (Admin, Manager, Cashier).
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    print("DB QUERY EMAIL:", user_in.email)

    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# --- 3. PROTECTED: ADMIN ONLY STAFF CREATION ---
@router.post("/create-user", response_model=UserBase)
async def admin_create_user(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows an Admin to create Managers or Cashiers for their own restaurant.
    """
    # RBAC Security Check
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Forbidden: Only admins can create staff accounts"
        )

    # Check if email is taken
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_in.password)
    
    # Enforce multi-tenancy: New user must share the Admin's restaurant_id
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password=hashed_pw,
        role=user_in.role,
        restaurant_id=current_user.restaurant_id 
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user