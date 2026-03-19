from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.pos_models import Ingredient, User
from app.schemas.pos_schemas import IngredientCreate, IngredientResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/ingredients", tags=["Ingredients"])


# -------------------------------------------------------
# CREATE INGREDIENT
# -------------------------------------------------------
@router.post("/", response_model=IngredientResponse)
async def create_ingredient(
    ingredient: IngredientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or manager can manage inventory"
        )

    # Prevent duplicate ingredient names within same restaurant
    existing = await db.execute(
        select(Ingredient).where(
            Ingredient.name == ingredient.name,
            Ingredient.restaurant_id == current_user.restaurant_id
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingredient already exists"
        )
    
    new_ingredient = Ingredient(
        name=ingredient.name,
        unit=ingredient.unit,
        current_stock=ingredient.current_stock or 0,
        min_stock=ingredient.min_stock or 0,
        restaurant_id=current_user.restaurant_id
    )

    db.add(new_ingredient)
    await db.commit()
    await db.refresh(new_ingredient)

    return new_ingredient


# -------------------------------------------------------
# GET ALL INGREDIENTS
# -------------------------------------------------------
@router.get("/", response_model=List[IngredientResponse])
async def get_ingredients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Ingredient).where(
            Ingredient.restaurant_id == current_user.restaurant_id
        )
    )
    return result.scalars().all()


# -------------------------------------------------------
# UPDATE INGREDIENT
# -------------------------------------------------------
@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: int,
    ingredient_data: IngredientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Ingredient).where(
            Ingredient.id == ingredient_id,
            Ingredient.restaurant_id == current_user.restaurant_id
        )
    )
    ingredient = result.scalars().first()

    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    ingredient.name = ingredient_data.name
    ingredient.unit = ingredient_data.unit
    ingredient.min_stock = ingredient_data.min_stock

    await db.commit()
    await db.refresh(ingredient)

    return ingredient


# -------------------------------------------------------
# RESTOCK INGREDIENT
# -------------------------------------------------------
@router.post("/{ingredient_id}/restock", response_model=IngredientResponse)
async def restock_ingredient(
    ingredient_id: int,
    amount: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Restock amount must be positive")

    result = await db.execute(
        select(Ingredient).where(
            Ingredient.id == ingredient_id,
            Ingredient.restaurant_id == current_user.restaurant_id
        )
    )
    ingredient = result.scalars().first()

    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    ingredient.current_stock += amount

    await db.commit()
    await db.refresh(ingredient)

    return ingredient