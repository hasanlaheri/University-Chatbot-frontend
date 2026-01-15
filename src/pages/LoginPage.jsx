import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import PasswordEye from "../components/PasswordEye";


function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
const [showPassword, setShowPassword] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess(false);

  try {
    // ================= ADMIN LOGIN (general_admin / campus_admin) =================
    if (role === "admin") {
      const res = await fetch("http://127.0.0.1:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid admin credentials");
        setTimeout(() => setError("") , 1400);
        return;
      }

      const admin = data.admin; // {id, email, role: "...", college_id, college_code}

      // Ensure email is present
      admin.email = admin.email || email;

      // Save admin data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(admin));    // <-- unified key
      localStorage.setItem("college_id", admin.college_id);
      localStorage.setItem("college_code", admin.college_code);
      localStorage.setItem("college_name", admin.college_name);
      localStorage.setItem("admin_role", admin.role); 

      login(admin);

      setSuccess(true);
      setTimeout(() => navigate("/admin"), 1200);
      return;
    }

    // ================= USER / FACULTY / GUEST LOGIN =================
    const res = await fetch(`http://127.0.0.1:5000/login/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Invalid credentials");
      setTimeout(() => setError("") , 1400);
      return;
    }

    let user = data.user;

    // ensure email exists
    user.email = user.email || email;

    // Save user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("email", user.email);

    // 🔥 IMPORTANT FIX (ADD THIS)
localStorage.setItem("college_id", user.college_id);
localStorage.setItem("college_code", user.college_code);
localStorage.setItem("college_name", user.college_name);

    login(user);

    const college = user.college_code?.toLowerCase();
    const roleRedirect = user.role.toLowerCase();

    setSuccess(true);

    setTimeout(() => {
  if (roleRedirect === "faculty") {
    navigate(`/${college}/${roleRedirect}`);
  } else if (roleRedirect === "user" || roleRedirect === "guest") {
    navigate(`/${college}/${roleRedirect}/chat`);
  }
}, 1200);


  } catch (err) {
    console.error("Login error:", err);
    setError("Server not reachable. Check Flask backend.");
  }
};




const roleDisplay = {
  admin: "Admin",
  faculty: "Faculty",
  user: "User",
  guest: "Guest"
}[role] || "User";


 return (
  <div
    className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3"
    style={{
      backgroundColor: "#f8fafc", // Very light slate background
      fontFamily: "'Inter', system-ui, sans-serif",
    }}
  >
    {/* Global Navigation Bar */}
    <div className="position-absolute top-0 w-100 d-flex justify-content-between align-items-center p-4 px-md-5">
      <div className="d-flex align-items-center gap-2">
        <div className="bg-primary rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
          <span className="text-white fw-bold">U</span>
        </div>
        <h5 className="fw-bold mb-0 text-slate-900 tracking-tight d-none d-sm-block">University Portal</h5>
      </div>
      <div className="d-flex gap-3 align-items-center">
        <button
          className="btn btn-link text-slate-500 text-decoration-none fw-semibold small p-0 me-3 transition-all hover-dark"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
        {role !== "admin" && (
          <button
            className="btn btn-outline-primary btn-sm fw-bold px-4 rounded-pill border-2"
            onClick={() => navigate(`/register/${role}`)}
          >
            Create Account
          </button>
        )}
      </div>
    </div>

    {/* Login Card Container */}
    <div
      className="card border-0 shadow-sm position-relative overflow-hidden"
      style={{
        width: "100%",
        maxWidth: "420px",
        borderRadius: "24px",
        background: "#ffffff",
        border: "1px solid #e2e8f0 !important"
      }}
    >
      {/* Subtle Brand Accent Line */}
      <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: '#0d6efd' }}></div>

      {/* Success Overlay */}
      {success && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white"
          style={{ zIndex: 10 }}
        >
          <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status"></div>
          <h4 className="fw-bold text-slate-900">Authenticated</h4>
          <p className="text-slate-500 small">Redirecting to your workspace...</p>
        </div>
      )}

      <div className="card-body p-4 p-md-5">
        <div className="mb-5 text-center">
          <h2 className="fw-bold text-slate-900 mb-2 tracking-tighter">Sign In</h2>
          <p className="text-slate-500 small fw-medium">
            Welcome back to the <span className="text-primary fw-bold">{roleDisplay}</span> gateway.
          </p>
        </div>

        {error && (
          <div className="alert-light-error mb-4">
            <span className="small">⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="label-light">Email Address</label>
            <input
              type="email"
              className="form-control input-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="label-light mb-0">Password</label>
              <a href="#" className="text-decoration-none x-small fw-bold text-primary">Forgot?</a>
            </div>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-light pe-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="position-absolute end-0 top-50 translate-middle-y pe-3 opacity-50">
                <PasswordEye
                  visible={showPassword}
                  onToggle={() => setShowPassword(v => !v)}
                />
              </div>
            </div>
          </div>

          <button
  type="submit"
  className="btn btn-primary w-100 py-2 fw-semibold rounded-2 mt-3 transition-all"
  style={{
    boxShadow: "0 3px 5px rgba(13, 110, 253, 0.18)",
    fontSize: "0.95rem"
  }}
  disabled={success}
>
  {success ? "Verifying..." : "Continue"}
</button>

        </form>
      </div>
    </div>

    {/* Professional Footer */}
    <footer className="mt-5 text-center text-slate-400 x-small px-4">
      <p className="mb-0">
        © 2026 University Portal. All rights reserved.
      </p>
    </footer>
  </div>
);}

export default LoginPage;
