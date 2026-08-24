import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const AVAILABLE_SLOTS = [
  "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM"
];

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Patient";

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const [apptRes, docRes] = await Promise.all([
        api.get("/appointments/my-appointments"),
        api.get("/appointments/doctors-list"),
      ]);

      if (Array.isArray(apptRes?.data)) {
        setAppointments(apptRes.data);
      } else {
        setAppointments([]);
      }

      if (Array.isArray(docRes?.data)) {
        setDoctors(docRes.data);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      if (err.response?.status === 401) {
        setErrorMsg("Your session has expired. Please sign in again.");
      } else {
        setErrorMsg(
          "Unable to sync dashboard data. Please verify your connection."
        );
      }

      setAppointments([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DEPARTMENTS ================= */

  const departments = [
    ...new Set(
      doctors
        .map((doctor) => doctor.specialty)
        .filter(Boolean)
    ),
  ].sort();

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.specialty === selectedDepartment
  );

  const selectedDoctorDetails = doctors.find(
    (doctor) => String(doctor.id) === String(selectedDoctor)
  );

  /* ================= BOOK APPOINTMENT ================= */

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);

    // Reset doctor whenever department changes
    setSelectedDoctor("");
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    setBookingMessage("");
    setIsSubmitting(true);

    try {
      const parsedDocId = parseInt(selectedDoctor, 10);

      if (isNaN(parsedDocId)) {
        throw new Error("Please select a valid doctor.");
      }

      // Convert selected date + time into backend DateTime format
      const timeMap = {
        "09:00 AM": "09:00:00",
        "09:30 AM": "09:30:00",
        "10:00 AM": "10:00:00",
        "10:30 AM": "10:30:00",
        "11:00 AM": "11:00:00",
        "11:30 AM": "11:30:00",
        "12:00 PM": "12:00:00",
        "12:30 PM": "12:30:00",
        "02:00 PM": "14:00:00",
        "02:30 PM": "14:30:00",
        "03:00 PM": "15:00:00",
        "03:30 PM": "15:30:00",
        "04:00 PM": "16:00:00",
        "04:30 PM": "16:30:00",
      };

      const formattedTime = timeMap[selectedTime];

      const payload = {
        doctor_id: parsedDocId,
        appointment_time: `${selectedDate}T${formattedTime}`,
        notes: symptoms.trim() || "None specified",
      };

      await api.post("/appointments/book", payload);

      setBookingMessage(
        `Appointment successfully scheduled with Dr. ${
          selectedDoctorDetails?.full_name || "your selected doctor"
        }!`
      );

      setSelectedDepartment("");
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setSymptoms("");

      fetchDashboardData();
    } catch (err) {
      console.error("Booking error response:", err.response?.data);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        const errorMessages = detail
          .map((d) => `${d.loc.join(".")}: ${d.msg}`)
          .join(" | ");

        setBookingMessage(`Validation Error: ${errorMessages}`);
      } else {
        setBookingMessage(
          detail || err.message || "Booking failed. Selected slot may be unavailable."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= CANCEL APPOINTMENT ================= */

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this consultation?")) {
      return;
    }

    try {
      await api.delete(`/appointments/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  /* ================= DATE FORMAT ================= */

  const formatIndianDate = (rawDate) => {
    if (!rawDate) return "Date Unspecified";

    const dateObj = new Date(rawDate);

    if (!isNaN(dateObj.getTime())) {
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();

      return `${day}-${month}-${year}`;
    }

    if (typeof rawDate === "string" && rawDate.includes("-")) {
      const parts = rawDate.split("T")[0].split("-");

      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return rawDate;
  };

  /* ================= DOCTOR DETAILS ================= */

  const resolveDoctorDetails = (appt) => {
    const rawDocId = appt.doctor_id || appt.doctor;

    const matchedDoctor = doctors.find(
      (d) => String(d.id) === String(rawDocId)
    );

    const docName = matchedDoctor
      ? matchedDoctor.full_name ||
        matchedDoctor.name ||
        matchedDoctor.email
      : appt.doctor_name ||
        appt.doctor?.full_name ||
        appt.doctor?.name ||
        `Specialist #${rawDocId || "1"}`;

    const specialty =
      matchedDoctor?.specialty ||
      appt.doctor_specialty ||
      appt.doctor?.specialty ||
      "General Medicine";

    return { docName, specialty };
  };

  return (
    <DashboardContainer>

      {/* ================= SIDEBAR ================= */}

      <Sidebar>
        <BrandLogo>
          <span className="icon">🩺</span>

          <div className="text">
            <strong>CarePortal</strong>
            <small>PATIENT SUITE</small>
          </div>
        </BrandLogo>

        <NavMenu>
          <NavItem
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>📊</span>
            Dashboard
          </NavItem>

          <NavItem
            className={activeTab === "appointments" ? "active" : ""}
            onClick={() => setActiveTab("appointments")}
          >
            <span>📅</span>
            My Appointments
          </NavItem>

          <NavItem
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            <span>📋</span>
            Medical History
          </NavItem>
        </NavMenu>

        <SidebarFooter>
          <UserProfileCard>
            <Avatar>
              {displayName.charAt(0).toUpperCase()}
            </Avatar>

            <UserInfo>
              <strong>{displayName}</strong>
              <small>
                {user?.email || "patient@careportal.com"}
              </small>
            </UserInfo>
          </UserProfileCard>

          <SignOutBtn onClick={logout}>
            Sign Out
          </SignOutBtn>
        </SidebarFooter>
      </Sidebar>

      {/* ================= MAIN CONTENT ================= */}

      <MainContent>

        <HeaderBanner>
          <div>
            <h1>Welcome back, {displayName}</h1>

            <p>
              Manage your appointments, consultations, and AI
              pre-visit intake assessments.
            </p>
          </div>
        </HeaderBanner>

        {errorMsg && (
          <AlertBanner className="error">
            {errorMsg}
          </AlertBanner>
        )}

        {/* ================= DASHBOARD ================= */}

        {activeTab === "dashboard" && (
          <>
            <MetricsRow>

              <MetricCard>
                <div className="info">
                  <span className="label">
                    TOTAL APPOINTMENTS
                  </span>

                  <span className="value">
                    {appointments.length}
                  </span>
                </div>

                <div className="icon-wrapper">
                  📅
                </div>
              </MetricCard>

              <MetricCard>
                <div className="info">
                  <span className="label">
                    AVAILABLE SPECIALISTS
                  </span>

                  <span className="value">
                    {doctors.length}
                  </span>
                </div>

                <div className="icon-wrapper">
                  👨‍⚕️
                </div>
              </MetricCard>

              <MetricCard>
                <div className="info">
                  <span className="label">
                    DEPARTMENTS
                  </span>

                  <span className="value">
                    {departments.length}
                  </span>
                </div>

                <div className="icon-wrapper">
                  🏥
                </div>
              </MetricCard>

            </MetricsRow>

            {/* ================= BOOKING ================= */}

            <CardSection>

              <SectionHeader>
                <h2>Book a Medical Consultation</h2>

                <p>
                  Choose a department, select your preferred doctor,
                  and book an available working slot.
                </p>
              </SectionHeader>

              {bookingMessage && (
                <AlertBanner
                  className={
                    bookingMessage.includes("successfully")
                      ? "success"
                      : "error"
                  }
                >
                  {bookingMessage}
                </AlertBanner>
              )}

              <Form onSubmit={handleBookAppointment}>

                <FormRow>

                  {/* DEPARTMENT */}

                  <FormGroup>
                    <label>
                      DEPARTMENT / SPECIALTY
                    </label>

                    <select
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      required
                    >
                      <option value="">
                        Select Department
                      </option>

                      {departments.map((department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  {/* DOCTOR */}

                  <FormGroup>
                    <label>
                      PHYSICIAN / SPECIALIST
                    </label>

                    <select
                      value={selectedDoctor}
                      onChange={(e) =>
                        setSelectedDoctor(e.target.value)
                      }
                      required
                      disabled={!selectedDepartment}
                    >
                      <option value="">
                        {selectedDepartment
                          ? "Select Doctor"
                          : "Select Department First"}
                      </option>

                      {filteredDoctors.map((doctor) => (
                        <option
                          key={doctor.id}
                          value={doctor.id}
                        >
                          Dr. {doctor.full_name}
                        </option>
                      ))}
                    </select>

                    {selectedDoctorDetails && (
                      <DoctorInfo>
                        👨‍⚕️ Dr.{" "}
                        {selectedDoctorDetails.full_name}
                        <span>
                          {selectedDoctorDetails.specialty}
                        </span>
                      </DoctorInfo>
                    )}
                  </FormGroup>

                  {/* DATE */}

                  <FormGroup>
                    <label>
                      PREFERRED DATE
                    </label>

                    <input
                      type="date"
                      min={todayDate}
                      value={selectedDate}
                      onChange={(e) =>
                        setSelectedDate(e.target.value)
                      }
                      required
                    />
                  </FormGroup>

                </FormRow>

                <FormRow className="second-row">

                  {/* TIME */}

                  <FormGroup>
                    <label>
                      TIME SLOT
                    </label>

                    <select
                      value={selectedTime}
                      onChange={(e) =>
                        setSelectedTime(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select Working Slot
                      </option>

                      {AVAILABLE_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                </FormRow>

                {/* SYMPTOMS */}

                <FormGroup style={{ marginTop: "20px" }}>
                  <label>
                    SYMPTOMS / REASON FOR VISIT
                  </label>

                  <textarea
                    rows="4"
                    value={symptoms}
                    onChange={(e) =>
                      setSymptoms(e.target.value)
                    }
                    placeholder="Describe your symptoms, medical history, or primary reason for the visit..."
                    required
                  />
                </FormGroup>

                <SubmitButton
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Processing Schedule..."
                    : "Confirm Appointment"}
                </SubmitButton>

              </Form>
            </CardSection>

            {/* ================= APPOINTMENTS ================= */}

            <CardSection style={{ marginTop: "32px" }}>
              <SectionHeader>
                <h2>Your Scheduled Visits</h2>
              </SectionHeader>

              {renderAppointmentsList()}
            </CardSection>
          </>
        )}

        {/* ================= APPOINTMENTS TAB ================= */}

        {activeTab === "appointments" && (
          <CardSection>

            <SectionHeader>
              <h2>My Scheduled Appointments</h2>

              <p>
                Comprehensive list of all upcoming and completed visits.
              </p>
            </SectionHeader>

            {renderAppointmentsList()}

          </CardSection>
        )}

        {/* ================= HISTORY TAB ================= */}

        {activeTab === "history" && (
          <CardSection>

            <SectionHeader>
              <h2>Medical History & Intake Records</h2>

              <p>
                Review past consultations and AI pre-visit
                diagnostic summaries.
              </p>
            </SectionHeader>

            {appointments.length === 0 ? (
              <EmptyState>
                No historical consultations found.
              </EmptyState>
            ) : (
              <VisitsGrid>
                {appointments.map((appt, idx) => {

                  const {
                    docName,
                    specialty
                  } = resolveDoctorDetails(appt);

                  const formattedDate =
                    formatIndianDate(
                      appt.date ||
                      appt.appointment_date ||
                      appt.appointment_time ||
                      appt.created_at
                    );

                  const apptTime =
                    appt.time ||
                    appt.appointment_time ||
                    appt.slot ||
                    "N/A";

                  return (
                    <VisitCard
                      key={appt.id || appt._id || idx}
                    >

                      <VisitCardHeader>

                        <div>
                          <h3>
                            Dr. {docName}
                          </h3>

                          <p className="specialty">
                            {specialty}
                          </p>
                        </div>

                        <StatusBadge
                          className={
                            appt.status?.toLowerCase() ||
                            "confirmed"
                          }
                        >
                          {appt.status || "COMPLETED"}
                        </StatusBadge>

                      </VisitCardHeader>

                      <VisitDetailsRow>
                        <span>
                          📅 {formattedDate}
                        </span>

                        <span>
                          ⏰ {apptTime}
                        </span>
                      </VisitDetailsRow>

                      <SymptomBox>
                        <strong>
                          🤖 AI Intake / Symptoms Summary:
                        </strong>

                        <p>
                          {appt.symptoms ||
                            appt.reason ||
                            "No clinical symptoms recorded."}
                        </p>
                      </SymptomBox>

                    </VisitCard>
                  );
                })}
              </VisitsGrid>
            )}

          </CardSection>
        )}

      </MainContent>
    </DashboardContainer>
  );

  /* ================= APPOINTMENT LIST ================= */

  function renderAppointmentsList() {

    if (loading) {
      return (
        <LoadingPlaceholder>
          Loading consultation records...
        </LoadingPlaceholder>
      );
    }

    if (appointments.length === 0) {
      return (
        <EmptyState>
          No active appointments scheduled.
        </EmptyState>
      );
    }

    return (
      <VisitsGrid>

        {appointments.map((appt, idx) => {

          const {
            docName,
            specialty
          } = resolveDoctorDetails(appt);

          const formattedDate =
            formatIndianDate(
              appt.date ||
              appt.appointment_date ||
              appt.appointment_time ||
              appt.created_at
            );

          const apptTime =
            appt.time ||
            appt.appointment_time ||
            appt.slot ||
            "Time Unspecified";

          const apptSymptoms =
            appt.symptoms ||
            appt.reason ||
            appt.notes ||
            "No description provided";

          return (
            <VisitCard
              key={appt.id || appt._id || idx}
            >

              <VisitCardHeader>

                <div>
                  <h3>
                    Dr. {docName}
                  </h3>

                  <p className="specialty">
                    {specialty}
                  </p>
                </div>

                <StatusBadge
                  className={
                    appt.status?.toLowerCase() ||
                    "confirmed"
                  }
                >
                  {appt.status || "CONFIRMED"}
                </StatusBadge>

              </VisitCardHeader>

              <VisitDetailsRow>

                <span>
                  📅 {formattedDate}
                </span>

                <span>
                  ⏰ {apptTime}
                </span>

              </VisitDetailsRow>

              <SymptomBox>

                <strong>
                  🤖 AI Pre-Visit Intake Record:
                </strong>

                <p>
                  {apptSymptoms}
                </p>

              </SymptomBox>

              <CardActions>

                <CancelButton
                  onClick={() =>
                    handleCancelAppointment(
                      appt.id || appt._id
                    )
                  }
                >
                  Cancel Appointment
                </CancelButton>

              </CardActions>

            </VisitCard>
          );
        })}

      </VisitsGrid>
    );
  }
}

/* =========================================================
   STYLES
========================================================= */

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
`;

const Sidebar = styled.aside`
  width: 270px;
  background-color: #0b1329;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;

  .icon {
    font-size: 2rem;
    background: rgba(2, 132, 199, 0.15);
    padding: 8px;
    border-radius: 12px;
  }

  .text {
    display: flex;
    flex-direction: column;

    strong {
      font-size: 1.2rem;
      color: #ffffff;
      letter-spacing: 0.3px;
    }

    small {
      font-size: 0.65rem;
      color: #38bdf8;
      letter-spacing: 1.2px;
      font-weight: 700;
      margin-top: 2px;
    }
  }
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    transform: translateX(2px);
  }

  &.active {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
  }
`;

const SidebarFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const UserProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #0284c7;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  strong {
    font-size: 0.85rem;
    color: #ffffff;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  small {
    font-size: 0.72rem;
    color: #64748b;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const SignOutBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 52px;
  max-width: 1280px;
  margin: 0 auto;
  overflow-y: auto;
`;

const HeaderBanner = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }

  p {
    color: #64748b;
    font-size: 0.98rem;
    margin: 0;
  }
`;

const AlertBanner = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 0.91rem;
  font-weight: 500;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &.error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  &.success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  }

  .info {
    display: flex;
    flex-direction: column;

    .label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
    }

    .value {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0284c7;
      margin-top: 6px;
    }
  }

  .icon-wrapper {
    font-size: 1.8rem;
    background: #f0f9ff;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e0f2fe;
  }
`;

const CardSection = styled.section`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;

  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
  }

  p {
    color: #64748b;
    font-size: 0.88rem;
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  &.second-row {
    grid-template-columns: 1fr;
    max-width: 32%;
    margin-top: 20px;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;

    &.second-row {
      max-width: 100%;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    letter-spacing: 0.6px;
  }

  select,
  input,
  textarea {
    padding: 12px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 0.92rem;
    color: #0f172a;
    background: #ffffff;
    font-family: inherit;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
    }

    &:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }
  }

  textarea {
    resize: vertical;
  }
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #0284c7;
  font-weight: 600;
  margin-top: 2px;

  span {
    color: #64748b;
    font-weight: 500;
  }
`;

const SubmitButton = styled.button`
  margin-top: 24px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
  }

  &:disabled {
    background: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const VisitsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VisitCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 22px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const VisitCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h3 {
    font-size: 1.15rem;
    margin: 0 0 3px 0;
    color: #0f172a;
    font-weight: 700;
  }

  .specialty {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    font-weight: 500;
  }
`;

const StatusBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;

  &.confirmed {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  &.completed {
    background: #f0f9ff;
    color: #0369a1;
    border: 1px solid #bae6fd;
  }

  &.pending {
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  &.cancelled {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
`;

const VisitDetailsRow = styled.div`
  display: flex;
  gap: 24px;
  margin: 16px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
`;

const SymptomBox = styled.div`
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 8px;
  border-left: 3.5px solid #0284c7;
  border: 1px solid #e2e8f0;
  border-left-width: 3.5px;

  strong {
    display: block;
    font-size: 0.75rem;
    color: #0284c7;
    margin-bottom: 4px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  p {
    margin: 0;
    font-size: 0.88rem;
    color: #334155;
    line-height: 1.4;
  }
`;

const CardActions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
    border-color: #ef4444;
  }
`;

const LoadingPlaceholder = styled.div`
  padding: 32px;
  text-align: center;
  color: #64748b;
  font-size: 0.92rem;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-size: 0.92rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
`;