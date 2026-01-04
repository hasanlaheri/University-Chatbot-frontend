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
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #004e92, #000428)",
        color: "white",
      }}
    >
      {/* Header */}
      <div className="position-absolute top-0 w-100 d-flex justify-content-between align-items-center p-3 px-4">
        <h4 className="fw-bold">🏛️ University Portal</h4>
        <div>
          <button
            className="btn btn-outline-light me-2"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
          {role !== "admin" && (
            <button
              className="btn btn-warning fw-semibold"
              onClick={() => navigate(`/register/${role}`)}
            >
              Register
            </button>
          )}
        </div>
      </div>

      {/* Login Card */}
      <div
        className="card shadow-lg border-0 text-dark p-4 position-relative"
        style={{
          width: "400px",
          borderRadius: "15px",
          background: "white",
        }}
      >
        {/* Spinner Animation */}
        {success && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-75 rounded"
            style={{ zIndex: 10 }}
          >
            <div
              className="spinner-border text-success mb-3"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            ></div>
            <h5 className="fw-bold text-success">Login Successful!</h5>
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">{roleDisplay} Login</h3>
          <p className="text-muted">
            Access your {roleDisplay.toLowerCase()} dashboard
          </p>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
  <label className="form-label fw-semibold">Password</label>

  <div style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      className="form-control"
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <PasswordEye
      visible={showPassword}
      onToggle={() => setShowPassword(v => !v)}
    />
  </div>
</div>


          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold mt-2"
            disabled={success}
          >
            {success ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Forgot password?{" "}
            <a href="#" className="text-decoration-none">
              Reset here
            </a>
          </small>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 text-white-50 small">
        © 2025 University Chatbot Portal. All Rights Reserved.
      </footer>
    </div>
  );
}

export default LoginPage;
