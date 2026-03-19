from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, datetime, time

from app.db.session import get_db
from app.models.pos_models import Order, OrderItem, Ingredient, Product, User
from app.core.dependencies import get_current_user


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# -----------------------------------------------------------
# RBAC CHECK
# -----------------------------------------------------------
def manager_or_admin(user: User):
    if user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or manager can access dashboard"
        )


# -----------------------------------------------------------
# DASHBOARD SUMMARY
# -----------------------------------------------------------
@router.get("/summary")
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns:
    - Today's revenue
    - Today's order count
    - Active orders
    """

    manager_or_admin(current_user)

    today_start = datetime.combine(date.today(), time.min)
    today_end = datetime.combine(date.today(), time.max)

    # Total revenue today
    revenue_query = await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.restaurant_id == current_user.restaurant_id,
            Order.created_at >= today_start,
            Order.created_at <= today_end
        )
    )

    # Total orders today
    orders_query = await db.execute(
        select(func.count(Order.id)).where(
            Order.restaurant_id == current_user.restaurant_id,
            Order.created_at >= today_start,
            Order.created_at <= today_end
        )
    )

    # Active orders
    active_query = await db.execute(
        select(func.count(Order.id)).where(
            Order.restaurant_id == current_user.restaurant_id,
            Order.status == "active" 
        )
    )

    revenue = revenue_query.scalar() or 0
    orders = orders_query.scalar() or 0
    active_orders = active_query.scalar() or 0

    return {
        "today_revenue": revenue,
        "today_orders": orders,
        "active_orders": active_orders
    }


# -----------------------------------------------------------
# LOW STOCK INGREDIENTS
# -----------------------------------------------------------
@router.get("/low-stock")
async def low_stock_ingredients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns ingredients where stock <= min_stock
    """

    manager_or_admin(current_user)

    result = await db.execute(
        select(Ingredient).where(
            Ingredient.restaurant_id == current_user.restaurant_id,
            Ingredient.current_stock <= Ingredient.min_stock
        )
    )

    ingredients = result.scalars().all()

    return ingredients


# -----------------------------------------------------------
# TOP SELLING PRODUCTS
# -----------------------------------------------------------
@router.get("/top-products")
async def top_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns top 5 selling products
    """

    manager_or_admin(current_user)

    result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(
            Order.restaurant_id == current_user.restaurant_id
        )
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    )

    rows = result.all()

    return [
        {
            "product_id": r.id,
            "name": r.name,
            "total_sold": int(r.total_sold)
        }
        for r in rows
    ]


# -----------------------------------------------------------
# ACTIVE ORDERS LIST (FOR MANAGER VIEW)
# -----------------------------------------------------------
@router.get("/active-orders")
async def active_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns currently active orders
    """

    manager_or_admin(current_user)

    result = await db.execute(
        select(Order).where(
            Order.restaurant_id == current_user.restaurant_id,
            Order.status != "completed"
        )
        .order_by(Order.created_at.desc())
    )

    orders = result.scalars().all()

    return orders