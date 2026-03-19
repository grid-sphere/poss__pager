from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Config
    DB_HOST: str
    DB_PORT: int = 3306
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Security
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours to match standard Node JWTs

    # Server Config
    PORT: int = 3000
    
    # Hardware Config
    PREFERRED_PORT: str = "COM3"
    BAUD_RATE: int = 115200

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False
        extra = "ignore"

settings = Settings()