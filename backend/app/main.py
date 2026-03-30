from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine, Base
from app.models import user
from app.models import scan
from app.models import refresh_token
from app.scans.routes import router as scans_router
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.chat.routes import router as chat_router

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="ScanManager API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scans_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "бекенд работает"}


@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"db": "успех"}