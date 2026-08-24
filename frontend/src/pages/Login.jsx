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
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = res.data?.access_token || res.data?.token;

      if (!token) {
        throw new Error("No access token received from backend server.");
      }

      const userRes = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = userRes.data;

      if (!user) {
        throw new Error("Could not retrieve user information.");
      }

      login(token, user);

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

      {/* ================= TOP BAR ================= */}

      <TopBar>
        <TopBarInner>
          <div>
            📞 Emergency Line: <strong>+1 (800) 555-CARE</strong>
          </div>

          <div>
            📍 Main Hospital & Virtual Consultations
          </div>
        </TopBarInner>
      </TopBar>

      {/* ================= HEADER ================= */}

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
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, "about")}
            >
              About
            </a>

            <a
              href="#departments"
              onClick={(e) =>
                handleSmoothScroll(e, "departments")
              }
            >
              Departments
            </a>

            <a
              href="#doctors"
              onClick={(e) => handleSmoothScroll(e, "doctors")}
            >
              Doctors
            </a>

            <Link to="/signup" className="nav-btn-secondary">
              Sign Up
            </Link>
          </NavGroup>

        </HeaderInner>
      </Header>

      {/* ================= HERO ================= */}

      <HeroSection>
        <HeroInner>

          <HeroContent>

            <Badge>Trusted Healthcare</Badge>

            <h1>
              Your Health.
              <br />
              <span>Our Priority.</span>
            </h1>

            <p>
              Access quality healthcare, connect with experienced
              specialists, and manage your appointments securely
              from one simple platform.
            </p>

            <HeroButtons>
              <PrimaryButton href="#login">
                Sign In
              </PrimaryButton>

              <SecondaryButton href="/signup">
                Create Account
              </SecondaryButton>
            </HeroButtons>

            <TrustRow>

              <TrustItem>
                <TrustIcon>✓</TrustIcon>
                <div>
                  <strong>Qualified Doctors</strong>
                  <span>Experienced specialists</span>
                </div>
              </TrustItem>

              <TrustItem>
                <TrustIcon>✓</TrustIcon>
                <div>
                  <strong>Easy Appointments</strong>
                  <span>Book anytime</span>
                </div>
              </TrustItem>

            </TrustRow>

          </HeroContent>

          <HeroImageWrapper>

            <HeroImage
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=85"
              alt="Healthcare professional"
            />

            <FloatingCard>
              <FloatingIcon>🩺</FloatingIcon>

              <div>
                <strong>Complete Healthcare</strong>
                <span>All your care in one place</span>
              </div>
            </FloatingCard>

          </HeroImageWrapper>

        </HeroInner>
      </HeroSection>

      {/* ================= ABOUT ================= */}

      <AboutSection id="about">

        <AboutInner>

          <AboutImageWrapper>

            <AboutImage
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=85"
              alt="Modern hospital"
            />

          </AboutImageWrapper>

          <AboutContent>

            <Badge>About CarePortal</Badge>

            <h2>
              Modern Healthcare,
              <br />
              Built Around You
            </h2>

            <p>
              CarePortal is designed to make healthcare simpler,
              more accessible, and more connected. Patients can
              discover specialists, book appointments, submit
              symptoms before their visit, and manage their
              healthcare information from one secure platform.
            </p>

            <p>
              Our platform brings patients and medical professionals
              together while providing tools that help make every
              appointment more efficient.
            </p>

            <AboutStats>

              <Stat>
                <strong>24/7</strong>
                <span>Access</span>
              </Stat>

              <Stat>
                <strong>10+</strong>
                <span>Specialties</span>
              </Stat>

              <Stat>
                <strong>100%</strong>
                <span>Secure</span>
              </Stat>

            </AboutStats>

          </AboutContent>

        </AboutInner>

      </AboutSection>

      {/* ================= DEPARTMENTS ================= */}

      <DepartmentsSection id="departments">

        <SectionHeader>

          <Badge>Our Departments</Badge>

          <h2>Specialized Care For Every Need</h2>

          <p>
            Connect with specialists across a range of
            medical departments.
          </p>

        </SectionHeader>

        <DepartmentGrid>

          <DepartmentCard>
            <DepartmentIcon>❤️</DepartmentIcon>
            <h3>Cardiology</h3>
            <p>
              Comprehensive heart and cardiovascular care.
            </p>
          </DepartmentCard>

          <DepartmentCard>
            <DepartmentIcon>🧠</DepartmentIcon>
            <h3>Neurology</h3>
            <p>
              Diagnosis and treatment of neurological conditions.
            </p>
          </DepartmentCard>

          <DepartmentCard>
            <DepartmentIcon>🦴</DepartmentIcon>
            <h3>Orthopedics</h3>
            <p>
              Bone, joint, muscle and mobility care.
            </p>
          </DepartmentCard>

          <DepartmentCard>
            <DepartmentIcon>👶</DepartmentIcon>
            <h3>Pediatrics</h3>
            <p>
              Specialized healthcare for children.
            </p>
          </DepartmentCard>

          <DepartmentCard>
            <DepartmentIcon>🩺</DepartmentIcon>
            <h3>General Medicine</h3>
            <p>
              Primary care and routine medical consultations.
            </p>
          </DepartmentCard>

          <DepartmentCard>
            <DepartmentIcon>👁️</DepartmentIcon>
            <h3>Ophthalmology</h3>
            <p>
              Complete eye care and vision services.
            </p>
          </DepartmentCard>

        </DepartmentGrid>

      </DepartmentsSection>

      {/* ================= DOCTORS ================= */}

      <DoctorsSection id="doctors">

        <SectionHeader>

          <Badge>Medical Professionals</Badge>

          <h2>Experienced Specialists</h2>

          <p>
            Our platform connects you with qualified healthcare
            professionals across multiple specialties.
          </p>

        </SectionHeader>

        <DoctorGrid>

          <DoctorCard>
            <DoctorImage
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80"
              alt="Doctor"
            />

            <DoctorInfo>
              <h3>Specialist Doctors</h3>
              <span>Multiple Departments</span>
              <p>
                Connect with experienced specialists
                based on your healthcare needs.
              </p>
            </DoctorInfo>
          </DoctorCard>

          <DoctorCard>
            <DoctorImage
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80"
              alt="Medical professional"
            />

            <DoctorInfo>
              <h3>Experienced Care</h3>
              <span>Patient Focused</span>
              <p>
                Receive personalized care from
                qualified healthcare professionals.
              </p>
            </DoctorInfo>
          </DoctorCard>

          <DoctorCard>
            <DoctorImage
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80"
              alt="Healthcare professional"
            />

            <DoctorInfo>
              <h3>Specialized Treatment</h3>
              <span>Expert Consultation</span>
              <p>
                Find the right specialist for
                your medical requirements.
              </p>
            </DoctorInfo>
          </DoctorCard>

        </DoctorGrid>

      </DoctorsSection>

      {/* ================= FACILITIES ================= */}

      <FacilitiesSection>

        <SectionHeader>

          <Badge>Why Choose Us</Badge>

          <h2>Healthcare Designed Around Patients</h2>

        </SectionHeader>

        <FacilityGrid>

          <FacilityCard>
            <FacilityIcon>📅</FacilityIcon>
            <h3>Simple Booking</h3>
            <p>
              Find available appointments and reserve
              your preferred time slot easily.
            </p>
          </FacilityCard>

          <FacilityCard>
            <FacilityIcon>🤖</FacilityIcon>
            <h3>AI-Assisted Care</h3>
            <p>
              Submit symptoms before your visit and
              receive useful pre-visit insights.
            </p>
          </FacilityCard>

          <FacilityCard>
            <FacilityIcon>🔒</FacilityIcon>
            <h3>Secure Information</h3>
            <p>
              Your healthcare information is managed
              through a secure digital platform.
            </p>
          </FacilityCard>

          <FacilityCard>
            <FacilityIcon>📱</FacilityIcon>
            <h3>Access Anywhere</h3>
            <p>
              Manage appointments and healthcare
              information from anywhere.
            </p>
          </FacilityCard>

        </FacilityGrid>

      </FacilitiesSection>

      {/* ================= LOGIN ================= */}

      <LoginSection id="login">

        <LoginInner>

          <LoginIntro>

            <Badge>Patient Portal</Badge>

            <h2>
              Ready to Take Care
              <br />
              of Your Health?
            </h2>

            <p>
              Sign in to manage your appointments, view your
              healthcare information, and connect with your doctors.
            </p>

            <LoginBenefits>

              <span>✓ Manage appointments</span>
              <span>✓ View upcoming consultations</span>
              <span>✓ Access healthcare information</span>
              <span>✓ Connect with specialists</span>

            </LoginBenefits>

          </LoginIntro>

          <AuthCard>

            <CardHeader>

              <SmallIcon>🩺</SmallIcon>

              <div>
                <h3>Welcome Back</h3>
                <p>
                  Sign in to access your healthcare portal
                </p>
              </div>

            </CardHeader>

            {errorMessage && (
              <ErrorBanner>
                {errorMessage}
              </ErrorBanner>
            )}

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

              <SubmitBtn
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Signing In..."
                  : "Sign In to Account"}
              </SubmitBtn>

            </form>

            <SwitchLink>
              Don't have an account?{" "}
              <Link to="/signup">
                Create an Account
              </Link>
            </SwitchLink>

          </AuthCard>

        </LoginInner>

      </LoginSection>

      {/* ================= FINAL CTA ================= */}

      <CTASection>

        <h2>Start Your Healthcare Journey Today</h2>

        <p>
          Create your account and get access to simple,
          connected healthcare management.
        </p>

        <CTAButtons>

          <Link to="/signup">
            Create Account
          </Link>

          <a href="#login">
            Sign In
          </a>

        </CTAButtons>

      </CTASection>

      {/* ================= FOOTER ================= */}

      <Footer>

        <FooterInner>

          <FooterBrand>
            <LogoIcon>🩺</LogoIcon>

            <div>
              <strong>CarePortal</strong>
              <span>Medical Systems</span>
            </div>
          </FooterBrand>

          <FooterText>
            © 2026 CarePortal. Healthcare made simpler.
          </FooterText>

        </FooterInner>

      </Footer>

    </PageWrapper>
  );
}

/* =========================================================
   PAGE
========================================================= */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
`;

/* =========================================================
   TOP BAR
========================================================= */

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

  strong {
    color: #ffffff;
  }

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 4px;
  }
`;

/* =========================================================
   HEADER
========================================================= */

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

  strong {
    font-size: 1.25rem;
    color: #0f172a;
    line-height: 1;
  }

  span {
    font-size: 0.75rem;
    color: #0284c7;
    text-transform: uppercase;
    margin-top: 2px;
    font-weight: 600;
  }
`;

const NavGroup = styled.nav`
  display: flex;
  align-items: center;
  gap: 22px;

  a {
    color: #475569;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;

    &:hover {
      color: #0284c7;
    }
  }

  .nav-btn-secondary {
    padding: 9px 18px;
    background: #0284c7;
    border-radius: 8px;
    color: #ffffff !important;
    font-weight: 600;

    &:hover {
      background: #0369a1;
    }
  }

  @media (max-width: 850px) {
    gap: 10px;

    a:not(.nav-btn-secondary) {
      display: none;
    }
  }
`;

/* =========================================================
   HERO
========================================================= */

const HeroSection = styled.section`
  padding: 65px 0 75px;

  background:
    linear-gradient(
      135deg,
      #f0f9ff 0%,
      #e0f2fe 50%,
      #f8fafc 100%
    );

  border-bottom: 1px solid #e2e8f0;
`;

const HeroInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 55px;

  align-items: center;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  h1 {
    font-size: 3rem;
    line-height: 1.15;
    color: #0f172a;
    margin: 18px 0;
    font-weight: 800;
  }

  h1 span {
    color: #0284c7;
  }

  > p {
    max-width: 600px;

    font-size: 1.1rem;

    line-height: 1.7;

    color: #475569;

    margin-bottom: 28px;
  }
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

const HeroButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 35px;
`;

const PrimaryButton = styled.a`
  padding: 12px 24px;

  background: #0284c7;

  color: #ffffff;

  border-radius: 8px;

  text-decoration: none;

  font-weight: 600;

  &:hover {
    background: #0369a1;
  }
`;

const SecondaryButton = styled.a`
  padding: 12px 24px;

  background: #ffffff;

  color: #0284c7;

  border: 1px solid #bae6fd;

  border-radius: 8px;

  text-decoration: none;

  font-weight: 600;

  &:hover {
    background: #f0f9ff;
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;

  height: 430px;

  border-radius: 20px;

  overflow: hidden;

  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;
`;

const FloatingCard = styled.div`
  position: absolute;

  left: 20px;
  bottom: 20px;

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 13px 16px;

  background: rgba(255, 255, 255, 0.96);

  border-radius: 12px;

  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.15);

  div {
    display: flex;
    flex-direction: column;
  }

  strong {
    color: #0f172a;
    font-size: 0.85rem;
  }

  span {
    color: #64748b;
    font-size: 0.72rem;
  }
`;

const FloatingIcon = styled.div`
  width: 40px;
  height: 40px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #e0f2fe;

  border-radius: 10px;

  font-size: 1.2rem;
`;

const TrustRow = styled.div`
  display: flex;

  gap: 25px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const TrustItem = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  div {
    display: flex;
    flex-direction: column;
  }

  strong {
    font-size: 0.82rem;
    color: #1e293b;
  }

  span {
    font-size: 0.7rem;
    color: #64748b;
  }
`;

const TrustIcon = styled.div`
  width: 30px;
  height: 30px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #dcfce7;

  color: #16a34a;

  border-radius: 50%;

  font-weight: 700;
`;

/* =========================================================
   ABOUT
========================================================= */

const AboutSection = styled.section`
  padding: 80px 24px;

  background: #ffffff;
`;

const AboutInner = styled.div`
  max-width: 1100px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 60px;

  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const AboutImageWrapper = styled.div`
  height: 390px;

  border-radius: 18px;

  overflow: hidden;

  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
`;

const AboutImage = styled.img`
  width: 100%;
  height: 100%;

  object-fit: cover;
`;

const AboutContent = styled.div`
  h2 {
    font-size: 2.2rem;

    line-height: 1.2;

    color: #0f172a;

    margin: 16px 0;
  }

  p {
    color: #64748b;

    line-height: 1.7;

    font-size: 0.95rem;
  }
`;

const AboutStats = styled.div`
  display: flex;

  gap: 40px;

  margin-top: 30px;
`;

const Stat = styled.div`
  display: flex;

  flex-direction: column;

  strong {
    font-size: 1.5rem;
    color: #0284c7;
  }

  span {
    font-size: 0.75rem;
    color: #64748b;
  }
`;

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = styled.div`
  max-width: 700px;

  margin: 0 auto 45px;

  text-align: center;

  h2 {
    font-size: 2.1rem;

    color: #0f172a;

    margin: 14px 0 8px;
  }

  p {
    color: #64748b;

    line-height: 1.6;

    margin: 0;
  }
`;

/* =========================================================
   DEPARTMENTS
========================================================= */

const DepartmentsSection = styled.section`
  padding: 80px 24px;

  background: #f8fafc;
`;

const DepartmentGrid = styled.div`
  max-width: 1050px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 20px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const DepartmentCard = styled.div`
  padding: 28px 22px;

  background: #ffffff;

  border: 1px solid #e2e8f0;

  border-radius: 14px;

  transition: 0.2s ease;

  &:hover {
    transform: translateY(-4px);

    border-color: #bae6fd;

    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  }

  h3 {
    margin: 15px 0 7px;

    color: #0f172a;
  }

  p {
    margin: 0;

    color: #64748b;

    font-size: 0.82rem;

    line-height: 1.5;
  }
`;

const DepartmentIcon = styled.div`
  width: 50px;
  height: 50px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #e0f2fe;

  border-radius: 12px;

  font-size: 1.5rem;
`;

/* =========================================================
   DOCTORS
========================================================= */

const DoctorsSection = styled.section`
  padding: 80px 24px;

  background: #ffffff;
`;

const DoctorGrid = styled.div`
  max-width: 1050px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 25px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const DoctorCard = styled.div`
  background: #f8fafc;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  overflow: hidden;

  transition: 0.2s ease;

  &:hover {
    transform: translateY(-4px);

    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
  }
`;

const DoctorImage = styled.img`
  width: 100%;

  height: 230px;

  object-fit: cover;

  display: block;
`;

const DoctorInfo = styled.div`
  padding: 22px;

  h3 {
    margin: 0 0 5px;

    color: #0f172a;
  }

  span {
    color: #0284c7;

    font-size: 0.75rem;

    font-weight: 600;
  }

  p {
    color: #64748b;

    font-size: 0.82rem;

    line-height: 1.5;

    margin-bottom: 0;
  }
`;

/* =========================================================
   FACILITIES
========================================================= */

const FacilitiesSection = styled.section`
  padding: 80px 24px;

  background: #f0f9ff;
`;

const FacilityGrid = styled.div`
  max-width: 1000px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 18px;

  @media (max-width: 850px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const FacilityCard = styled.div`
  padding: 25px 20px;

  background: #ffffff;

  border: 1px solid #bae6fd;

  border-radius: 14px;

  h3 {
    font-size: 1rem;

    color: #0f172a;

    margin: 15px 0 7px;
  }

  p {
    color: #64748b;

    font-size: 0.78rem;

    line-height: 1.5;

    margin: 0;
  }
`;

const FacilityIcon = styled.div`
  font-size: 1.7rem;
`;

/* =========================================================
   LOGIN
========================================================= */

const LoginSection = styled.section`
  padding: 85px 24px;

  background:
    linear-gradient(
      135deg,
      #e0f2fe 0%,
      #f0f9ff 50%,
      #ffffff 100%
    );

  border-top: 1px solid #e2e8f0;
`;

const LoginInner = styled.div`
  max-width: 1050px;

  margin: 0 auto;

  display: grid;

  grid-template-columns: 1fr 420px;

  gap: 70px;

  align-items: center;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const LoginIntro = styled.div`
  h2 {
    font-size: 2.5rem;

    line-height: 1.2;

    color: #0f172a;

    margin: 16px 0;
  }

  > p {
    color: #64748b;

    line-height: 1.7;

    max-width: 520px;
  }
`;

const LoginBenefits = styled.div`
  display: flex;

  flex-direction: column;

  gap: 12px;

  margin-top: 25px;

  span {
    color: #334155;

    font-size: 0.9rem;

    font-weight: 500;
  }
`;

const AuthCard = styled.div`
  background: #ffffff;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  padding: 32px;

  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.1);
`;

const CardHeader = styled.div`
  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 24px;

  h3 {
    font-size: 1.4rem;

    color: #0f172a;

    margin: 0 0 6px;

    font-weight: 700;
  }

  p {
    color: #64748b;

    font-size: 0.85rem;

    margin: 0;
  }
`;

const SmallIcon = styled.div`
  width: 44px;
  height: 44px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #e0f2fe;

  border-radius: 12px;

  font-size: 1.3rem;
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

  label {
    font-size: 0.75rem;

    font-weight: 700;

    color: #475569;

    text-transform: uppercase;
  }

  input {
    padding: 12px 14px;

    background: #f8fafc;

    border: 1px solid #cbd5e1;

    border-radius: 8px;

    color: #0f172a;

    font-size: 0.95rem;

    &:focus {
      outline: none;

      border-color: #0284c7;

      background: #ffffff;
    }

    &:disabled {
      background: #f1f5f9;

      cursor: not-allowed;
    }
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

  &:hover:not(:disabled) {
    background: #0369a1;
  }

  &:disabled {
    background: #94a3b8;

    cursor: not-allowed;
  }
`;

const SwitchLink = styled.p`
  text-align: center;

  margin-top: 20px;

  font-size: 0.85rem;

  color: #64748b;

  a {
    color: #0284c7;

    text-decoration: none;

    font-weight: 600;
  }
`;

/* =========================================================
   CTA
========================================================= */

const CTASection = styled.section`
  padding: 75px 24px;

  text-align: center;

  background: #0f172a;

  color: #ffffff;

  h2 {
    font-size: 2rem;

    margin: 0 0 10px;
  }

  p {
    color: #94a3b8;

    margin: 0 auto 25px;

    max-width: 600px;

    line-height: 1.6;
  }
`;

const CTAButtons = styled.div`
  display: flex;

  justify-content: center;

  gap: 12px;

  a {
    padding: 11px 22px;

    border-radius: 8px;

    text-decoration: none;

    font-weight: 600;
  }

  a:first-child {
    background: #0284c7;

    color: #ffffff;
  }

  a:last-child {
    background: #ffffff;

    color: #0f172a;
  }

  @media (max-width: 500px) {
    flex-direction: column;

    align-items: center;
  }
`;

/* =========================================================
   FOOTER
========================================================= */

const Footer = styled.footer`
  background: #020617;

  padding: 25px 24px;
`;

const FooterInner = styled.div`
  max-width: 1100px;

  margin: 0 auto;

  display: flex;

  align-items: center;

  justify-content: space-between;

  @media (max-width: 650px) {
    flex-direction: column;

    gap: 15px;

    text-align: center;
  }
`;

const FooterBrand = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  div {
    display: flex;

    flex-direction: column;
  }

  strong {
    color: #ffffff;
  }

  span {
    color: #0284c7;

    font-size: 0.65rem;

    text-transform: uppercase;
  }
`;

const FooterText = styled.span`
  color: #64748b;

  font-size: 0.75rem;
`;