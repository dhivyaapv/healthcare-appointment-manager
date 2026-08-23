import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <div style={{ padding: "20px" }}>
      <h2>System Administrative Panel</h2>
      <p>Secure global parameters auditing workspace module baseline active.</p>
      <button onClick={logout}>Logout System</button>
    </div>
  );
}
