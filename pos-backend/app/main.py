import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, orders, settings_router
from app.core.config import settings
from app.routers import staff
from app.routers import ingredients
from app.routers import recipes
from app.routers import dashboard
app = FastAPI(title="POS Backend - FastAPI")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.vercel.app"
]
# Same CORS policy as Express app.use(cors())
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix="/auth")
app.include_router(products.router, prefix="/products")
app.include_router(orders.router, prefix="/orders")
app.include_router(settings_router.router, prefix="/settings")
app.include_router(staff.router)
app.include_router(ingredients.router)
app.include_router(recipes.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    # Preserving exact health check response
    return {"message": "POS Backend Online"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)