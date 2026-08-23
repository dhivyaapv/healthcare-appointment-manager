import os
import sqlalchemy # pyright: ignore[reportMissingImports]
from sqlalchemy.ext.declarative import declarative_base # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import sessionmaker # pyright: ignore[reportMissingImports]
import dotenv # pyright: ignore[reportMissingImports]

# Load variables from a .env file if you have one
dotenv.load_dotenv()

# Replace with your actual Postgres username, password, and database name
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/healthcare_db")

engine = sqlalchemy.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get a database session for your API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
