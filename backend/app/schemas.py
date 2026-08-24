from pydantic import BaseModel, EmailStr
from datetime import datetime, time, date
from typing import Optional

from app.models import UserRole


# --- AUTH & USER SCHEMAS ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.PATIENT
    specialty: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# --- DOCTOR SCHEMAS ---

class DoctorCreate(BaseModel):
    user_id: int
    specialty: str
    bio: Optional[str] = None
    slot_duration_minutes: int = 30
    working_start_time: time
    working_end_time: time


class DoctorOut(BaseModel):
    id: int
    user_id: int
    specialty: str
    bio: Optional[str]
    slot_duration_minutes: int
    working_start_time: time
    working_end_time: time

    class Config:
        from_attributes = True


# --- DOCTOR LEAVE SCHEMAS ---

class DoctorLeaveCreate(BaseModel):
    doctor_id: int
    leave_date: date
    reason: Optional[str] = None


class DoctorLeaveOut(BaseModel):
    id: int
    doctor_id: int
    leave_date: date
    reason: Optional[str]

    class Config:
        from_attributes = True


# --- APPOINTMENT SCHEMAS ---

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_time: datetime
    notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_time: datetime
    status: str
    notes: Optional[str]
    google_event_id: Optional[str] = None

    class Config:
        from_attributes = True


# --- SYMPTOM & VISIT NOTES SCHEMAS ---

class SymptomSubmit(BaseModel):
    symptoms: str


class VisitNotesSubmit(BaseModel):
    doctor_notes: str
    prescription: Optional[str] = None