from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import timedelta

from app.database import get_db
from app import models, schemas, auth
from app.email_utils import send_email
from app.google_calendar_utils import create_calendar_event, delete_calendar_event
from app.llm_utils import generate_pre_visit_summary, generate_post_visit_summary

router = APIRouter(
    prefix="/appointments",
    tags=["Doctors & Appointments"]
)

# 1. GET ALL DOCTORS FOR DROPDOWN
@router.get("/doctors-list")
def get_doctors_for_dropdown(db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Doctor.id.label("doctor_id"),
            models.User.full_name,
            models.Doctor.specialty,
            models.Doctor.working_start_time,
            models.Doctor.working_end_time,
            models.Doctor.slot_duration_minutes,
        )
        .join(models.User, models.Doctor.user_id == models.User.id)
        .all()
    )

    doctors_list = []
    for row in results:
        doctors_list.append({
            "id": row.doctor_id,
            "full_name": row.full_name,
            "specialty": row.specialty,
            "start_time": str(row.working_start_time) if row.working_start_time else "09:00:00",
            "end_time": str(row.working_end_time) if row.working_end_time else "17:00:00",
            "slot_duration": row.slot_duration_minutes or 30,
        })

    return doctors_list


# 2. GET ALL CONFIRMED/PENDING APPOINTMENTS (FOR SLOT AVAILABILITY CHECKING)
@router.get("/booked-slots")
def get_booked_slots(db: Session = Depends(get_db)):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.status != "cancelled"
    ).all()
    
    booked = []
    for appt in appointments:
        booked.append({
            "doctor_id": appt.doctor_id,
            "appointment_time": appt.appointment_time.isoformat()
        })
    return booked


# 3. BOOK AN APPOINTMENT
@router.post("", response_model=schemas.AppointmentOut, status_code=status.HTTP_201_CREATED)
@router.post("/book", response_model=schemas.AppointmentOut, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment_data: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment_data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    # Check for Double-Booking
    existing_booking = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == appointment_data.doctor_id,
        models.Appointment.appointment_time == appointment_data.appointment_time,
        models.Appointment.status != "cancelled"
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This slot has already been booked. Please choose another time slot."
        )

    # Validate 5 PM Cutoff
    if appointment_data.appointment_time.hour >= 17:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointments cannot be scheduled past 5:00 PM."
        )

    new_appointment = models.Appointment(
        patient_id=current_user.id,
        doctor_id=appointment_data.doctor_id,
        appointment_time=appointment_data.appointment_time,
        notes=getattr(appointment_data, "reason", None) or getattr(appointment_data, "notes", None),
        status="confirmed"
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    doctor_user = db.query(models.User).filter(models.User.id == doctor.user_id).first()

    # Google Calendar & Email Integrations
    try:
        slot_duration = doctor.slot_duration_minutes if doctor.slot_duration_minutes else 30
        end_time = new_appointment.appointment_time + timedelta(minutes=slot_duration)
        
        event_id = create_calendar_event(
            summary=f"Appointment: {current_user.full_name} with Dr. {doctor_user.full_name if doctor_user else 'Doctor'}",
            description=f"Specialty: {doctor.specialty}\nNotes: {new_appointment.notes or 'N/A'}",
            start_time=new_appointment.appointment_time,
            end_time=end_time,
            attendee_emails=[current_user.email, doctor_user.email] if doctor_user else [current_user.email]
        )
        if event_id:
            new_appointment.google_event_id = event_id
            db.commit()
    except Exception as e:
        print(f"Calendar Sync Note: {e}")

    db.refresh(new_appointment)
    return new_appointment


# 4. GET LOGGED IN USER APPOINTMENTS
@router.get("/my-appointments")
@router.get("", response_model=List[schemas.AppointmentOut])
def get_my_appointments(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == "doctor":
        doctor_profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        if not doctor_profile:
            return []
        return db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_profile.id).order_by(models.Appointment.appointment_time.desc()).all()
    else:
        return db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).order_by(models.Appointment.appointment_time.desc()).all()


# 5. SUBMIT SYMPTOMS (PATIENT)
@router.post("/{appointment_id}/symptoms")
def submit_symptoms(
    appointment_id: int, 
    data: schemas.SymptomSubmit, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    result = generate_pre_visit_summary(data.symptoms)

    appointment.symptoms = data.symptoms
    appointment.ai_pre_visit_summary = result["summary"]
    appointment.urgency_level = result["urgency_level"]

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Symptoms submitted successfully.",
        "urgency_level": appointment.urgency_level,
        "ai_pre_visit_summary": appointment.ai_pre_visit_summary
    }


# 6. SUBMIT VISIT NOTES (DOCTOR)
@router.post("/{appointment_id}/visit-notes")
def submit_visit_notes(
    appointment_id: int, 
    data: schemas.VisitNotesSubmit, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    doctor_profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if not doctor_profile or appointment.doctor_id != doctor_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    combined_notes = data.doctor_notes
    if data.prescription:
        combined_notes += f"\nPrescription: {data.prescription}"

    patient_summary = generate_post_visit_summary(combined_notes)

    appointment.doctor_notes = data.doctor_notes
    appointment.prescription = data.prescription
    appointment.ai_post_visit_summary = patient_summary
    appointment.status = "completed"

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Visit notes submitted successfully.",
        "ai_post_visit_summary": appointment.ai_post_visit_summary
    }