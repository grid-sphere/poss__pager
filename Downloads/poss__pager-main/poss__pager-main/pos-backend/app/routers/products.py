from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models.pos_models import Product, User
from app.schemas.pos_schemas import ProductCreate, ProductResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # Everyone can view their own restaurant's products
    result = await db.execute(select(Product).where(Product.restaurant_id == current_user.restaurant_id))
    return result.scalars().all()

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_in: ProductCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC: Only admin and manager creates products
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admin or manager can add products")
    new_product = Product(
        **product_in.dict(), 
        restaurant_id=current_user.restaurant_id # Force current restaurant
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, 
    product_in: ProductCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC: Only admin and manager updates
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admin or manager can add products")
    # Ensure product belongs to this restaurant
    result = await db.execute(select(Product).where(
        Product.id == product_id, 
        Product.restaurant_id == current_user.restaurant_id
    ))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for var, value in product_in.dict().items():
        setattr(product, var, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC: Only admin deletes
    if current_user.role not in ["admin","manager"]:
        raise HTTPException(status_code=403, detail="Only admins can delete products")

    result = await db.execute(select(Product).where(
        Product.id == product_id, 
        Product.restaurant_id == current_user.restaurant_id
    ))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}