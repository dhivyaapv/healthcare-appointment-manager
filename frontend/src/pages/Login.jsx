import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Safely extract token
      const token = res.data?.access_token || res.data?.token;

      if (!token) {
        throw new Error("No access token received from backend server.");
      }

      // Infer fallback user role if backend returns flat payload
      const fallbackRole = res.data?.role || "patient";
      const user = res.data?.user || { email: email.trim(), role: fallbackRole };

      // Commit to Context & LocalStorage
      login(token, user);

      // Route explicitly matching App.jsx Route Paths
      const userRole = user?.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setErrorMessage(detail);
      } else if (Array.isArray(detail)) {
        const field = detail[0]?.loc?.slice(-1)[0] || "field";
        setErrorMessage(`Missing or invalid field: '${field}'`);
      } else {
        setErrorMessage(err.message || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
              <span>Appointment System</span>
            </BrandText>
          </Brand>
          <NavGroup>
            <a href="#specialties" onClick={(e) => handleSmoothScroll(e, "specialties")}>
              Specialties
            </a>
            <Link to="/signup" className="nav-btn-secondary">Register Patient</Link>
          </NavGroup>
        </HeaderInner>
      </Header>

      <HeroSection>
        <HeroInner>
          <HeroContent>
            <Badge>Healthcare Portal</Badge>
            <h1>Manage Appointments & AI Pre-Visit Summaries</h1>
            <p>
              Connect with specialists, submit symptom forms in advance, and access 
              automated AI pre-visit insights and post-visit summaries.
            </p>

            <HighlightsGrid id="specialties">
              <HighlightItem><span>✔</span> AI Symptom Analysis</HighlightItem>
              <HighlightItem><span>✔</span> Real-Time Slot Holding</HighlightItem>
              <HighlightItem><span>✔</span> Google Calendar Sync</HighlightItem>
              <HighlightItem><span>✔</span> Automated Reminders</HighlightItem>
            </HighlightsGrid>
          </HeroContent>

          <AuthCard>
            <CardHeader>
              <h3>CarePortal Login</h3>
              <p>Sign in as Patient, Doctor, or Admin</p>
            </CardHeader>

            {errorMessage && <ErrorBanner>{errorMessage}</ErrorBanner>}

            <form onSubmit={handleLogin}>
              <FormGroup>
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FormGroup>

              <FormGroup>
                <label>PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FormGroup>

              <SubmitBtn type="submit" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In to Account"}
              </SubmitBtn>
            </form>

            <SwitchLink>
              Need a patient account? <Link to="/signup">Register Here</Link>
            </SwitchLink>
          </AuthCard>
        </HeroInner>
      </HeroSection>
    </PageWrapper>
  );
}

/* ================= STYLES ================= */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const TopBar = styled.div`
  background: #0f172a;
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
  strong { color: #ffffff; }
`;

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
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
  strong { font-size: 1.25rem; color: #0f172a; line-height: 1; }
  span { font-size: 0.75rem; color: #0284c7; text-transform: uppercase; margin-top: 2px; font-weight: 600; }
`;

const NavGroup = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;

  a {
    color: #475569;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    &:hover { color: #0284c7; }
  }

  .nav-btn-secondary {
    padding: 8px 18px;
    background: #0284c7;
    border-radius: 8px;
    color: #ffffff !important;
    font-weight: 600;
    &:hover { background: #0369a1; }
  }
`;

const HeroSection = styled.section`
  padding: 60px 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 1px solid #e2e8f0;
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
  h1 { font-size: 2.75rem; font-weight: 800; line-height: 1.2; color: #0f172a; margin: 16px 0; }
  p { font-size: 1.1rem; color: #475569; line-height: 1.6; margin-bottom: 32px; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: #bae6fd;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
`;

const HighlightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  scroll-margin-top: 100px;
`;

const HighlightItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;

  span { color: #0284c7; font-weight: bold; }
`;

const AuthCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
  h3 { font-size: 1.4rem; color: #0f172a; margin: 0 0 6px 0; font-weight: 700; }
  p { color: #64748b; font-size: 0.85rem; margin: 0; }
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; }
  input {
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    color: #0f172a;
    font-size: 0.95rem;
    &:focus { outline: none; border-color: #0284c7; background: #fff; }
    &:disabled { background: #f1f5f9; cursor: not-allowed; }
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: #0369a1; }
  &:disabled { background: #94a3b8; cursor: not-allowed; }
`;

const SwitchLink = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 0.85rem;
  color: #64748b;
  a { color: #0284c7; text-decoration: none; font-weight: 600; }
`;