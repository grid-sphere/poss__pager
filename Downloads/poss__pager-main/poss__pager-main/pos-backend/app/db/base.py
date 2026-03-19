from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so SQLAlchemy registers them
from app.models.pos_models import *