from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP, func, Text,Float,CheckConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'manager', 'cashier'), default='cashier')
    created_at = Column(TIMESTAMP, server_default=func.now())
    # Fixed: restaurant_id is necessary for Multi-tenancy logic
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    # ✅ FIX: Added restaurant_id so routers/products.py can filter by restaurant
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)
    # ✅ Add constraints for price and stock
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_not_negative'),
        CheckConstraint('stock >= 0', name='check_stock_not_negative'),
    )

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum('upi', 'cash', 'card'), nullable=False)
    payment_status = Column(Enum('pending', 'paid'), default='pending')
    status = Column(Enum('created', 'active', 'ready', 'completed'), default='created')
    created_at = Column(TIMESTAMP, server_default=func.now())
    token = Column(String(255)) 
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    order = relationship("Order", back_populates="items")

class StoreSetting(Base):
    __tablename__ = "store_settings"
    id = Column(Integer, primary_key=True, index=True)
    # ✅ FIX: Changed column names to match your actual SQL database (upi_id, payee_name)
    # Your error 'Unknown column store_settings.key_name' happened here
    upi_id = Column(String(100), nullable=True)
    payee_name = Column(String(100), nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    unit = Column(String(50), nullable=False)

    current_stock = Column(Integer, default=0)

    min_stock = Column(Integer, default=0)

    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)

    quantity_required = Column(Float, nullable=False)
    
    __table_args__ = (
        CheckConstraint('quantity_required > 0', name='check_quantity_positive'),
    )