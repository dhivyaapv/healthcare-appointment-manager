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
          <div>
            📞 Emergency Line: <strong>+1 (800) 555-CARE</strong>
          </div>
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
            <Link to="/login" className="nav-btn-secondary">
              Sign In
            </Link>
          </NavGroup>
        </HeaderInner>
      </Header>

      <HeroSection>
        <HeroInner>
          <HeroContent>
            <Badge>New Registration</Badge>

            <h1>Join the Healthcare Network</h1>

            <p>
              Create an account to book specialist appointments, track digital
              prescriptions, and manage your medical records online.
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
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="patient">Patient Account</option>
                  <option value="doctor">
                    Medical Practitioner (Doctor)
                  </option>
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

              <SubmitBtn type="submit">
                Complete Registration
              </SubmitBtn>
            </form>

            <SwitchLink>
              Already have an account?{" "}
              <Link to="/login">Sign In</Link>
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
  background-color: #f8fafc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const TopBar = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 0;
  font-size: 0.8rem;
  color: #64748b;
`;

const TopBarInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
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

  strong {
    font-size: 1.25rem;
    color: #1e293b;
    line-height: 1;
  }

  span {
    font-size: 0.75rem;
    color: #2563eb;
    text-transform: uppercase;
    margin-top: 2px;
  }
`;

const NavGroup = styled.nav`
  .nav-btn-secondary {
    padding: 8px 16px;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    color: #2563eb;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;

    &:hover {
      background: #dbeafe;
    }
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

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  h1 {
    font-size: 2.75rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 16px 0;
    color: #0f172a;
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
    line-height: 1.6;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const AuthCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
`;

const CardHeader = styled.div`
  margin-bottom: 20px;

  h3 {
    font-size: 1.4rem;
    margin: 0 0 6px 0;
    color: #0f172a;
  }

  p {
    color: #64748b;
    font-size: 0.85rem;
    margin: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
  }

  input,
  select {
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    color: #1e293b;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  select {
    cursor: pointer;
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

  &:hover {
    background: #2563eb;
  }
`;

const SwitchLink = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 0.85rem;
  color: #64748b;

  a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;