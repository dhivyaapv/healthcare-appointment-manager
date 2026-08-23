from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, engine
from app import models
from app.routers import auth_routers  # 👈 Changed from auth_routes to auth_routers
from app.routers import auth_routers, appointments
from fastapi.middleware.cors import CORSMiddleware
# Build all tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Healthcare Appointment Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include the authentication endpoints into the app
app.include_router(auth_routers.router)  # 👈 Changed from auth_routes to auth_routers
app.include_router(appointments.router)
@app.get("/")
def home():
    return {"message": "Welcome to the Healthcare Appointment Manager API!"}

@app.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to PostgreSQL!"}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Database connection failed: {str(e)}"
        )
