from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.pos_models import StoreSetting
from app.schemas.pos_schemas import SettingUpdate
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Settings"])

@router.get("/")
async def get_settings(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(StoreSetting))
    settings_list = result.scalars().all()
    return {s.key_name: s.value for s in settings_list}

@router.post("/")
async def update_setting(
    payload: SettingUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(StoreSetting).where(StoreSetting.key_name == payload.key_name))
    setting = result.scalars().first()
    
    if setting:
        setting.value = payload.value
    else:
        setting = StoreSetting(key_name=payload.key_name, value=payload.value)
        db.add(setting)
    
    await db.commit()
    return {"message": "Setting updated successfully"}