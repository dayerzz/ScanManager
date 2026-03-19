import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.models.refresh_token import RefreshToken

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(db, user_id: str):
    expire = datetime.now(timezone.utc) + timedelta(days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")))

    token_str = str(uuid.uuid4())

    refresh_token = RefreshToken(
        user_id=user_id,
        token=token_str,
        expires_at=expire
    )

    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)

    return token_str