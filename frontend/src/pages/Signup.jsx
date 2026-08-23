import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import api from "../api";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [specialty, setSpecialty] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", {
        full_name: fullName,
        email,
        password,
        role,
        specialty: role === "doctor" ? specialty : null,
      });
      alert("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <PageWrapper>
      <TopBar>
        <TopBarInner>
          <div>📞 Emergency Line: <strong>+1 (800) 555-CARE</strong></div>
          <div>📍 Main Hospital & Virtual Consultations</div>
        </TopBarInner>
      </TopBar>

      <Header>
        <HeaderInner>
          <Brand>
            <LogoIcon>🩺</LogoIcon>
            <BrandText>
              <strong>CarePortal</strong>
              <span>Medical Systems</span>
            </BrandText>
          </Brand>
          <NavGroup>
            <Link to="/login" className="nav-btn-secondary">Sign In</Link>
          </NavGroup>
        </HeaderInner>
      </Header>

      <HeroSection>
        <HeroInner>
          <HeroContent>
            <Badge>New Registration</Badge>
            <h1>Join the Healthcare Network</h1>
            <p>
              Create an account to book specialist appointments, track digital prescriptions, 
              and manage your medical records online.
            </p>
          </HeroContent>

          <AuthCard>
            <CardHeader>
              <h3>Create Account</h3>
              <p>Register as a patient or medical specialist</p>
            </CardHeader>

            <form onSubmit={handleSignup}>
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Alex Rivera or Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Account Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="patient">Patient Account</option>
                  <option value="doctor">Medical Practitioner (Doctor)</option>
                </select>
              </FormGroup>

              {role === "doctor" && (
                <FormGroup>
                  <label>Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Pediatrics"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                  />
                </FormGroup>
              )}

              <SubmitBtn type="submit">Complete Registration</SubmitBtn>
            </form>

            <SwitchLink>
              Already have an account? <Link to="/login">Sign In</Link>
            </SwitchLink>
          </AuthCard>
        </HeroInner>
      </HeroSection>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #070a12;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const TopBar = styled.div`
  background: #0d121f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px 0;
  font-size: 0.8rem;
  color: #94a3b8;
`;

const TopBarInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
`;

const Header = styled.header`
  background: rgba(11, 15, 25, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 0;
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.span`
  font-size: 1.8rem;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  strong { font-size: 1.25rem; color: #ffffff; line-height: 1; }
  span { font-size: 0.75rem; color: #3b82f6; text-transform: uppercase; margin-top: 2px; }
`;

const NavGroup = styled.nav`
  .nav-btn-secondary {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: #ffffff;
    text-decoration: none;
    font-size: 0.9rem;
  }
`;

const HeroSection = styled.section`
  padding: 60px 0;
`;

const HeroInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 48px;
  align-items: center;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const HeroContent = styled.div`
  h1 { font-size: 2.75rem; font-weight: 700; line-height: 1.2; margin: 16px 0; }
  p { font-size: 1.1rem; color: #94a3b8; line-height: 1.6; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const AuthCard = styled.div`
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
  h3 { font-size: 1.4rem; margin: 0 0 6px 0; }
  p { color: #94a3b8; font-size: 0.85rem; margin: 0; }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
  input, select {
    padding: 12px 14px;
    background: #070a12;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.95rem;
    &:focus { outline: none; border-color: #3b82f6; }
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 8px;
  &:hover { background: #2563eb; }
`;

const SwitchLink = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 0.85rem;
  color: #94a3b8;
  a { color: #3b82f6; text-decoration: none; font-weight: 600; }
`;