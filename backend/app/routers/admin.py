from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/doctors", response_model=schemas.DoctorOut)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Doctor).filter(models.Doctor.user_id == doctor.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Doctor profile already exists for this user")

    user = db.query(models.User).filter(models.User.id == doctor.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != models.UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="User must have role 'doctor'")

    db_doctor = models.Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


@router.get("/doctors", response_model=list[schemas.DoctorOut])
def list_doctors(db: Session = Depends(get_db)):
    return db.query(models.Doctor).all()


@router.post("/doctors/{doctor_id}/leave", response_model=schemas.DoctorLeaveOut)
def mark_leave(doctor_id: int, leave: schemas.DoctorLeaveCreate, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db_leave = models.DoctorLeave(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave


@router.get("/doctors/{doctor_id}/leaves", response_model=list[schemas.DoctorLeaveOut])
def list_leaves(doctor_id: int, db: Session = Depends(get_db)):
    return db.query(models.DoctorLeave).filter(models.DoctorLeave.doctor_id == doctor_id).all()