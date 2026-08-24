from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/signup",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED
)
def signup(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether the email is already registered
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )

    # Hash the password before storing it
    hashed_password = auth.get_password_hash(user_data.password)

    # Create the main user account
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role
    )

    db.add(new_user)

    # Flush so new_user.id is available before creating Doctor
    db.flush()

    # If the account is a doctor, create the linked Doctor profile
    if user_data.role == models.UserRole.DOCTOR:

        if not user_data.specialty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specialty is required for doctor accounts."
            )

        new_doctor = models.Doctor(
            user_id=new_user.id,
            specialty=user_data.specialty,
            bio=f"Experienced {user_data.specialty} specialist.",
            slot_duration_minutes=30,
            working_start_time=datetime.strptime(
                "09:00", "%H:%M"
            ).time(),
            working_end_time=datetime.strptime(
                "17:00", "%H:%M"
            ).time()
        )

        db.add(new_doctor)

    # Save everything
    db.commit()

    # Refresh the user object
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=schemas.Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user or not auth.verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=schemas.UserOut
)
def get_me(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user