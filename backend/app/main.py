from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine, Base
from app.models import user
from app.auth.routes import router as auth_router

app = FastAPI(title="ScanManager API")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "бекенд работает"}


@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"db": "успех"}