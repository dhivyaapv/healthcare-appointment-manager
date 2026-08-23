import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PageWrapper>
      {/* Integrated Header */}
      <Header>
        <HeaderInner>
          <Brand to="/doctor-dashboard">
            <span>🩺</span>
            <div>
              <strong>CarePortal</strong>
              <small>Practitioner Console</small>
            </div>
          </Brand>
          <UserInfo>
            <span>Dr. <strong>{user?.full_name || user?.email}</strong></span>
            <LogoutBtn onClick={handleLogout}>Sign Out</LogoutBtn>
          </UserInfo>
        </HeaderInner>
      </Header>

      <MainContent>
        <Card>
          <CardTitle>🩺 Patient Appointments & Consultations</CardTitle>
          {appointments.length === 0 ? (
            <EmptyState>No scheduled patient consultations found.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Symptoms / Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td><strong>{apt.patient_name}</strong></td>
                    <td>{new Date(apt.date).toLocaleString()}</td>
                    <td>{apt.symptoms}</td>
                    <td>
                      <StatusBadge status={apt.status}>{apt.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </MainContent>
    </PageWrapper>
  );
}

/* ================= STYLES ================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #070a12;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.header`
  background: rgba(11, 15, 25, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 14px 0;
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  font-size: 1.5rem;

  div {
    display: flex;
    flex-direction: column;
    strong { font-size: 1.1rem; line-height: 1; }
    small { font-size: 0.7rem; color: #10b981; text-transform: uppercase; margin-top: 2px; }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: #94a3b8;
  strong { color: #f8fafc; }
`;

const LogoutBtn = styled.button`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: rgba(239, 68, 68, 0.2); }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Card = styled.div`
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 28px;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 24px;
`;

const EmptyState = styled.p` color: #64748b; text-align: center; margin: 40px 0; `;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
  }

  th {
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => (props.status === "confirmed" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)")};
  color: ${(props) => (props.status === "confirmed" ? "#10b981" : "#f59e0b")};
`;