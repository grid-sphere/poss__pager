from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select as sa_select
from typing import List
from datetime import datetime, time, date
from sqlalchemy import func
from app.db.session import get_db
from app.models.pos_models import (
    Order,
    OrderItem,
    Product,
    Ingredient,
    Recipe,
    User
)

from app.schemas.pos_schemas import OrderCreate, OrderResponse
from app.core.dependencies import get_current_user
from app.services.serial_service import serial_bus

router = APIRouter(tags=["Orders"])


# ---------------------------------------------------------
# GET ORDERS
# ---------------------------------------------------------
@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(
        select(Order)
        .where(Order.restaurant_id == current_user.restaurant_id)
        .order_by(Order.created_at.desc())
    )

    return result.scalars().all()


# ---------------------------------------------------------
# CREATE ORDER (PRODUCTION SAFE)
# ---------------------------------------------------------


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        # -------------------------------------------------
        # VALIDATE PRODUCTS IN BULK (avoid N+1)
        # -------------------------------------------------
        product_ids = [item.product_id for item in order_in.items]

        product_result = await db.execute(
            select(Product).where(
                Product.id.in_(product_ids),
                Product.restaurant_id == current_user.restaurant_id
            )
        )

        products = {p.id: p for p in product_result.scalars().all()}

        if len(products) != len(product_ids):
            raise HTTPException(
                status_code=404,
                detail="One or more products not found"
            )

        # -------------------------------------------------
        # CREATE ORDER
        # -------------------------------------------------
        new_order = Order(
            total_amount=order_in.total_amount,
            payment_method=order_in.payment_method,
            token=str(order_in.token),
            status="active",
            restaurant_id=current_user.restaurant_id
        )

        db.add(new_order)
        await db.flush()  # get order.id


        # -------------------------------------------------
        # PROCESS EACH ORDER ITEM
        # -------------------------------------------------
        for item in order_in.items:

            product = products[item.product_id]

            # -------------------------------
            # VALIDATE PRODUCT STOCK
            # -------------------------------
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for {product.name}"
                )

            product.stock -= item.quantity

            # -------------------------------
            # CREATE ORDER ITEM
            # -------------------------------
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                subtotal=item.subtotal
            )
            db.add(order_item)

            # -------------------------------
            # FETCH RECIPE
            # -------------------------------
            recipe_result = await db.execute(
                select(Recipe).where(
                    Recipe.product_id == item.product_id
                )
            )

            recipes = recipe_result.scalars().all()

            if not recipes:
                raise HTTPException(
                    status_code=400,
                    detail=f"No recipe defined for {product.name}"
                )

            # -------------------------------
            # BULK FETCH INGREDIENTS
            # -------------------------------
            ingredient_ids = [r.ingredient_id for r in recipes]

            ingredient_result = await db.execute(
                select(Ingredient).where(
                    Ingredient.id.in_(ingredient_ids),
                    Ingredient.restaurant_id == current_user.restaurant_id
                )
            )

            ingredients = {
                ing.id: ing for ing in ingredient_result.scalars().all()
            }

            # -------------------------------
            # DEDUCT INGREDIENT STOCK
            # -------------------------------
            for recipe in recipes:

                ingredient = ingredients.get(recipe.ingredient_id)

                if not ingredient:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Ingredient {recipe.ingredient_id} not found"
                    )

                required_qty = recipe.quantity_required * item.quantity

                if ingredient.current_stock < required_qty:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Not enough {ingredient.name} in stock"
                    )

                ingredient.current_stock -= required_qty


        # -------------------------------------------------
        # COMMIT EVERYTHING AT ONCE
        # -------------------------------------------------
        await db.commit()
        await db.refresh(new_order)


        # -------------------------------------------------
        # TRIGGER HARDWARE (non-blocking)
        # -------------------------------------------------
        background_tasks.add_task(
            serial_bus.send_token,
            str(order_in.token)
        )

        return new_order


    except Exception as e:

        await db.rollback()

        if isinstance(e, HTTPException):
            raise e

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.put("/{order_id}/complete")
async def complete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.restaurant_id == current_user.restaurant_id
        )
    )

    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "completed"

    await db.commit()

    return {"message": "Order marked as completed"}
@router.get("/history")
async def get_order_history(
    date: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # ✅ Ensure we parse the date string correctly
        query_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # ✅ Create a 24-hour window
        start_dt = datetime.combine(query_date, time.min)
        end_dt = datetime.combine(query_date, time.max)

        result = await db.execute(
            select(Order).where(
                Order.restaurant_id == current_user.restaurant_id,
                Order.created_at.between(start_dt, end_dt) # ✅ Use between
            ).order_by(Order.created_at.asc())
        )
        
        orders = result.scalars().all()
        return {"orders": orders}
    except Exception as e:
        print(f"Error fetching history: {e}")
        return {"orders": []}