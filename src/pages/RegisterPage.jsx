import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../App.css';
import PasswordEye from "../components/PasswordEye";
import {FaInfoCircle,FaShieldAlt, FaCheckCircle,FaExclamationTriangle} from "react-icons/fa";

function RegisterPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    college_id: "", 
    username: "",
    email: "",
    contact: "",
    password: "",
    department: "",
    branch: "",
    year: "",
    semester: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [colleges, setColleges] = useState([]);
const [loadingColleges, setLoadingColleges] = useState(true);
const [emailStatus, setEmailStatus] = useState(null); 
const [departments, setDepartments] = useState([]);
const [settings, setSettings] = useState(null);
const [allDepartments, setAllDepartments] = useState([]);        
const [academicDepartments, setAcademicDepartments] = useState([]); 
const [showPassword, setShowPassword] = useState(false);
// 🔐 Email verification states
const [emailVerified, setEmailVerified] = useState(false);
const [otpStage, setOtpStage] = useState(false);
const [verifyingEmail, setVerifyingEmail] = useState(false);
const [otp, setOtp] = useState("");
const [otpError, setOtpError] = useState("");
const [verifying, setVerifying] = useState(false);

const otpRefs = React.useRef([]);

const handleOtpChange = (value, index) => {
  if (isNaN(value)) return;
  const newOtp = otp.split("");
  newOtp[index] = value.substring(value.length - 1);
  const combinedOtp = newOtp.join("");
  setOtp(combinedOtp);

  // Move focus forward
  if (value && index < 5) {
    otpRefs.current[index + 1].focus();
  }
};

const handleKeyDown = (e, index) => {
  // Move focus back on backspace
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    otpRefs.current[index - 1].focus();
  }
};


  // ✅ Field-level validation on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "branch" && value === "N/A") {
    // 🔥 If Branch is N/A, clear Year and Semester immediately
    setFormData((prev) => ({
      ...prev,
      branch: value,
      year: "",
      semester: "",
    }));
  } else if (name === "year") {
    // 🔥 If Year changes, clear Semester to keep data valid
    setFormData((prev) => ({
      ...prev,
      year: value,
      semester: "",
    }));
  } else {
    // Normal update for other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

    let errorMsg = "";

    switch (name) {
      case "username":
        if (!value.trim()) errorMsg = "Username is required";
        break;
      case "email":
        setEmailVerified(false);
  setOtpStage(false);
  setVerifyingEmail(false);
  if (!/^\S+@\S+\.\S+$/.test(value)) {
    errorMsg = "Enter a valid email address";
    setEmailStatus(null);
  } else {
    // Domain check only for student registration
    if (role === "user" && formData.college_id) {
      const college = colleges.find(c => c.id == formData.college_id);
      if (college) {
        const domain = value.split("@")[1];
        setEmailStatus(domain === college.domain ? "student" : "guest");
      }
    }
  }
  break;
      case "contact":
        if (!/^[0-9]{10}$/.test(value)) errorMsg = "Enter a valid 10-digit contact number";
        break;
      case "password":
        if (value.length < 6) errorMsg = "Password must be at least 6 characters";
        break;
      case "department":
        if (role === "faculty" && !value) errorMsg = "Please select a department";
        break;
      case "branch":
        if (role === "user" && !value) errorMsg = "Please select a branch";
        break;
      case "year":
        if (role === "user" && formData.branch !== "Applicant" && !value)
          errorMsg = "Please select a year";
        break;
      case "semester":
        if (role === "user" && formData.branch !== "Applicant" && !value)
          errorMsg = "Please select a semester";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // ✅ Full validation on submit
  const validateForm = () => {
  const newErrors = {};
  if (!formData.college_id) newErrors.college_id = "Please select a college";


  if (!formData.username.trim()) newErrors.username = "Username is required";
  if (!/^\S+@\S+\.\S+$/.test(formData.email))
    newErrors.email = "Enter a valid email address";
  if (!/^[0-9]{10}$/.test(formData.contact))
    newErrors.contact = "Enter a valid 10-digit contact number";
  if (formData.password.length < 6)
    newErrors.password = "Password must be at least 6 characters";

  if (role === "faculty" && !formData.department)
    newErrors.department = "Please select a department";

  if (role === "user") {
    if (!formData.branch) newErrors.branch = "Please select a branch";

    // 🔥 If branch is NOT N/A → Validate normally
    if (formData.branch !== "N/A") {
      if (!formData.year) newErrors.year = "Please select a year";
      if (!formData.semester) newErrors.semester = "Please select a semester";
    }
  }

  return newErrors;
};

const handleVerifyEmail = async () => {
  if (!formData.email || errors.email || !formData.college_id) return;

  setVerifyingEmail(true);
  setErrors(prev => ({ ...prev, email: "" }));

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        role,
        college_id: formData.college_id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      // 🚫 Faculty not authorized
      if (res.status === 401 && role === "faculty") {
        setUnauthorized(true);
        setTimeout(() => navigate("/"), 2500);
        return;
      }

      // Other errors
      setErrors(prev => ({
        ...prev,
        email: data.error || "Failed to send OTP"
      }));
      return;
    }

    // ✅ OTP sent
    setOtpStage(true);
    setOtp("");
    setOtpError("");

  } catch (err) {
    setErrors(prev => ({
      ...prev,
      email: "Server error while sending OTP"
    }));
  } finally {
    setVerifyingEmail(false);
  }
};



const handleVerifyOtp = async () => {
  if (!otp || otp.length !== 6) {
    setOtpError("Enter a valid 6-digit OTP");
    return;
  }
  setVerifying(true);

  setOtpError("");

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        otp
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.error || "Invalid OTP");
      return;
    }

    // ✅ OTP verified
    setEmailVerified(true);
    setOtpStage(false);
    setOtp("");
    setOtpError("");

  } catch (err) {
    setOtpError("Server error while verifying OTP");
  }finally {
    setVerifying(false); 
  }
};

const [timer, setTimer] = useState(300); // 300 seconds = 5 minutes
const [canResend, setCanResend] = useState(false);

useEffect(() => {
  let interval = null;
  if (otpStage && timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  } else if (timer === 0) {
    setCanResend(true);
    clearInterval(interval);
  }
  return () => clearInterval(interval);
}, [otpStage, timer]);

// Helper to format seconds into MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

// Reset timer logic (call this when "Resend" is clicked)
const handleResend = () => {
  setTimer(300);
  setCanResend(false);
  // Trigger your API resend logic here
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setTimeout(() => setErrors("") , 3000);
    return;
  }

  setErrors({});

  // 🔥 Automatically fix N/A handling for Students
  let payload = { ...formData };
  if (formData.branch === "N/A") {
    payload.year = "N/A";
    payload.semester = "N/A";
  }
  // ⬇ Add THIS block right below
  if (role === "user") {
    if (emailStatus === "guest") payload.role = "guest";
    else payload.role = "user";
  } else {
    payload.role = role;
  }

  try {
    const response = await fetch(`http://127.0.0.1:5000/register/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),   // 🔥 use payload instead of formData
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } else {

      // ❗ Unauthorized faculty case
      if (data.error?.includes("not authorized")) {
        setUnauthorized(true);
        setTimeout(() => navigate("/"), 2500);
        return;
      }

      // 🔥 Email already exists
if (data.error?.toLowerCase().includes("email")) {
  setErrors(prev => ({
    ...prev,
    email: "This email is already registered"
  }));
  return;
}

setErrors({ general: data.error || "Registration failed" });

    }

  } catch (error) {
    console.error(error);
    setErrors({ general: "Server error. Try again later." });
  }
};

useEffect(() => {
  fetch("http://127.0.0.1:5000/colleges")
    .then(res => res.json())
    .then(data => {
      setColleges(data);
      setLoadingColleges(false);
    })
    .catch(err => console.log("Failed to load colleges", err));
}, []);

useEffect(() => {
  if (!formData.college_id) {
    setAllDepartments([]);
    setAcademicDepartments([]);
    setSettings(null);
    return;
  }

  // 👨‍🏫 FACULTY → all departments
  if (role === "faculty") {
    fetch(`http://127.0.0.1:5000/departments/${formData.college_id}`)
      .then(res => res.json())
      .then(data => setAllDepartments(data))
      .catch(err => console.log("Failed to load departments", err));
  }

  // 🎓 STUDENT → academic only
  if (role === "user") {
    fetch(`http://127.0.0.1:5000/departments/academic/${formData.college_id}`)
      .then(res => res.json())
      .then(data => setAcademicDepartments(data))
      .catch(err => console.log("Failed to load academic departments", err));
  }

  // Common: year / semester settings
  fetch(`http://127.0.0.1:5000/college/settings/${formData.college_id}`)
    .then(res => res.json())
    .then(data => setSettings(data))
    .catch(err => console.log("Failed to load settings", err));

}, [formData.college_id, role]);




return (
  <div
    className="min-vh-100 d-flex bg-white position-relative" // added position-relative
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    {/* --- NEW: LOADING SPIRAL OVERLAY --- */}
    {success && (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
        style={{ 
          zIndex: 9999, 
          background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(4px)" 
        }}
      >
        <div 
          className="spinner-border text-primary" 
          style={{ width: "4rem", height: "4rem", borderWidth: "0.25em" }} 
          role="status"
        >
        </div>
        <h4 className="mt-4 fw-bold text-dark">Creating your profile...</h4>
        <p className="text-muted">Setting up your academic workspace</p>
      </div>
    )}

    {/* --- NEW: UNAUTHORIZED FACULTY OVERLAY --- */}
    {unauthorized && (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
        style={{ 
          zIndex: 10000, 
          background: "rgba(255, 255, 255, 0.95)" 
        }}
      >
        <div className="text-center p-5 shadow-lg rounded-4 border border-danger bg-white" style={{ maxWidth: "400px" }}>
          <div className="display-1 text-danger mb-4">❌</div>
          <h3 className="fw-bold">Registration Failed</h3>
          <p className="text-muted">
            This email is not authorized for faculty registration. Please contact your administrator for approval.
          </p>
          <div className="spinner-grow spinner-grow-sm text-secondary me-2"></div>
          <small className="text-secondary">Redirecting to home...</small>
        </div>
      </div>
    )}
    {/* LEFT SIDE (DESKTOP ONLY) */}
    <div
      className="col-lg-5 d-none d-lg-flex align-items-center justify-content-center position-relative"
      style={{
        backgroundColor: "#F9FAFB",
        borderRight: "1px solid #F3F4F6",
      }}
    >
      <div className="p-5">
        <span className="h4 fw-bold">🏛️ UniPortal</span>
        <h1 className="display-5 fw-bold text-dark mt-4">
          Start your academic journey.
        </h1>
        <p className="text-secondary fs-5 mt-3">
          Access your course materials, connect with faculty, and manage your
          campus life in one place.
        </p>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="col-12 col-lg-7 d-flex flex-column align-items-center justify-content-center p-4">
      <div className="w-100" style={{ maxWidth: "480px" }}>
        {/* BACK */}
        <button
          className="btn btn-link text-decoration-none p-0 text-secondary mb-3"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </button>

        <h2 className="fw-bold mb-2">Create your profile</h2>
        <p className="text-muted mb-4">
          Fill in your details to customize your experience.
        </p>

       {/* 🔔 ROLE-BASED CONTEXT NOTES */}
{role === "user" && (
  <div className="role-context-card student-info mb-4">
    <div className="d-flex gap-3 align-items-center">
      <div className="icon-wrapper">
        <FaInfoCircle />
      </div>
      <div>
        <p className="mb-0 fw-semibold text-slate-800 small">Registration Logic</p>
        <p className="mb-0 text-slate-500 x-small">
          Students must use their <b>college domain email</b>. Non-college emails will be registered as <b>Guest</b> accounts.
        </p>
      </div>
    </div>
  </div>
)}

{role === "faculty" && (
  <div className="role-context-card faculty-warning mb-4">
    <div className="d-flex gap-3 align-items-center">
      <div className="icon-wrapper">
        <FaShieldAlt />
      </div>
      <div>
        <p className="mb-0 fw-semibold text-slate-900 small">Approval Required</p>
        <p className="mb-0 text-slate-600 x-small leading-tight">
          Faculty access is restricted. Your account will remain <b>pending</b> until verified by the <b>Department Admin</b>.
        </p>
      </div>
    </div>
  </div>
)}

        <form onSubmit={handleSubmit}>

           {/* COLLEGE */}
          <div className="mb-3">
            <select
              name="college_id"
              className={`form-select-minimal ${
                errors.college_id ? "is-invalid" : ""
              }`}
              onChange={handleChange}
            >
              <option value="">Select College</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            {errors.college_id && (
              <div className="field-error">{errors.college_id}</div>
            )}
          </div>

          {/* FULL NAME */}
          <div className="mb-3">
            <input
              type="text"
              name="username"
              className={`form-control-minimal ${
                errors.username ? "is-invalid" : ""
              }`}
              placeholder="Full Name"
              onChange={handleChange}
            />
            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>

          {/* EMAIL + CONTACT */}
          {/* EMAIL FIELD WITH INTEGRATED VERIFY BUTTON */}
<div className="mb-3">
  <div className="position-relative d-flex align-items-center">
    <input
  type="email"
  name="email"
  readOnly={emailVerified}
  className={`form-control-minimal w-100 ${errors.email ? "is-invalid" : ""}`}
  placeholder="Email Address"
  style={{ paddingRight: "80px" }}
  onChange={handleChange}
/>

   <button
  className="btn position-absolute end-0 me-2"
  type="button"
  disabled={
    emailVerified ||
    verifyingEmail ||
    !formData.email ||
    !!errors.email ||
    !formData.college_id
  }
  onClick={handleVerifyEmail}
  style={{
    fontSize: "0.75rem",
    fontWeight: "700",
    color: emailVerified ? "#16a34a" : "#2d6bf1",
    backgroundColor: emailVerified ? "#dcfce7" : "#eef2ff",
    borderRadius: "8px",
    padding: "4px 12px",
    border: "none",
    cursor: emailVerified ? "default" : "pointer"
  }}
>
  {verifyingEmail
    ? "Sending..."
    : emailVerified
    ? "Verified ✓"
    : "Verify"}
</button>

  </div>

  {/* Status Indicator */}
  {emailStatus && role === "user" && (
    <div 
      className={`d-flex align-items-center gap-2 mt-2 p-2 rounded-3 animate-slide-down ${
        emailStatus === "student" ? "status-student" : "status-guest"
      }`}
      style={{ fontSize: '0.75rem' }}
    >
      <div className="status-icon">
        {emailStatus === "student" ? <FaCheckCircle size={14} /> : <FaExclamationTriangle size={14} />}
      </div>
      <div className="flex-grow-1">
        <span className="fw-bold d-block">
          {emailStatus === "student" ? "Student Account" : "Guest Account"}
        </span>
      </div>
    </div>
  )}
  {errors.email && <div className="field-error">{errors.email}</div>}
</div>
{otpStage && !emailVerified && (
  <div className="mb-5"> 
  <div className="otp-card mt-5 p-4 animate-fade-in mx-auto" 
       style={{ 
         background: "#ffffff", 
         borderRadius: "20px",
         border: "1px solid #e2e8f0",
         boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.05)",
         maxWidth: "400px" // Limits the width so it doesn't stretch too far
       }}>
    
    <div className="text-center mb-4">
      <div className="d-inline-flex align-items-center justify-content-center mb-3" 
           style={{ width: "42px", height: "42px", backgroundColor: "#f1f5f9", borderRadius: "10px", color: "#64748b" }}>
        <FaShieldAlt size={18} />
      </div>
      <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "0.95rem" }}>Check your inbox</h6>
      <p className="text-muted" style={{ fontSize: "0.75rem" }}>We sent a 6-digit code to your email</p>
      <p className="text-muted" style={{ fontSize: "0.75rem" }}>Code expires in <span className="fw-bold text-primary">{formatTime(timer)}</span></p>
    </div>

    {/* DIGIT BOXES - Slightly Smaller */}
    <div className="d-flex justify-content-center gap-2 mb-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (otpRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleOtpChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="form-control text-center p-0"
          style={{
            width: "40px",
            height: "48px",
            fontSize: "1.2rem",
            fontWeight: "700",
            borderRadius: "10px",
            backgroundColor: "#fcfdfe",
            border: otpError ? "1px solid #fee2e2" : "1px solid #cbd5e1",
            transition: "all 0.2s ease"
          }}
        />
      ))}
    </div>

    {otpError && (
      <div className="text-danger text-center mb-3 animate-shake" style={{ fontSize: "0.75rem" }}>
        <FaExclamationTriangle className="me-1" /> {otpError}
      </div>
    )}

    <div className="d-grid gap-2">
      <button
  type="button"
  className="btn btn-dark py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
  disabled={verifying || timer === 0}
  style={{ 
    borderRadius: "10px", 
    backgroundColor: (verifying || timer === 0) ? "#64748b" : "#0f172a",
    fontSize: "0.85rem",
    letterSpacing: "0.3px",
    border: "none",
    transition: "all 0.3s ease"
  }}
  onClick={handleVerifyOtp}
>
  {verifying ? (
    <>
      <span 
        className="spinner-border spinner-border-sm" 
        role="status" 
        aria-hidden="true"
        style={{ width: "1rem", height: "1rem", borderWidth: "0.15em" }}
      ></span>
      <span>Checking...</span>
    </>
  ) : (
    "Verify Code"
  )}
</button>
      
      <div className="text-center">
        <button 
          type="button" 
          className="btn btn-link mt-2 text-muted text-decoration-none p-0 fw-medium"
          style={{ fontSize: "0.7rem" }}
        >
          Resend code 
        </button>
      </div>
    </div>
  </div>
  </div>
)}



{/* CONTACT FIELD */}
<div className="mb-4">
  <input
  type="tel"
  name="contact"
  disabled={!emailVerified}
  className={`form-control-minimal ${errors.contact ? "is-invalid" : ""}`}
  placeholder="Contact Number"
  onChange={handleChange}
/>

  {errors.contact && <div className="field-error">{errors.contact}</div>}
</div>
          {/* FACULTY / STUDENT FIELDS */}
          {role === "faculty" ? (
            <div className="mb-3">
              <select
                name="department"
                disabled={!emailVerified} 
                className={`form-select-minimal ${
                  errors.department ? "is-invalid" : ""
                }`}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {allDepartments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <div className="field-error">{errors.department}</div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3">
                <select
                  name="branch"
                  disabled={!emailVerified} 
                  className={`form-select-minimal ${
                    errors.branch ? "is-invalid" : ""
                  }`}
                  onChange={handleChange}
                >
                  <option value="">Select Branch</option>
                  <option value="N/A">N/A</option>
                  {academicDepartments.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <div className="field-error">{errors.branch}</div>
                )}
              </div>

             <div className="d-flex gap-3 mb-3">
  {/* YEAR SELECT */}
  <select
    name="year"
    value={formData.year} // 👈 Added this to ensure it clears visually
    className={`form-select-minimal ${errors.year ? "is-invalid" : ""}`}
    onChange={handleChange}
    disabled={formData.branch === "N/A" || !emailVerified}
  >
    <option value="">Year</option>
    {Array.from({ length: settings?.total_years || 0 }, (_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1} Year
      </option>
    ))}
  </select>

  {/* SEMESTER SELECT */}
  <select
    name="semester"
    value={formData.semester} // 👈 Keeps UI in sync with state
    className={`form-select-minimal ${errors.semester ? "is-invalid" : ""}`}
    onChange={handleChange}
    disabled={formData.branch === "N/A" || !emailVerified}
  >
    <option value="">Semester</option>
    {formData.year &&
      (() => {
        const endSem = parseInt(formData.year) * 2;
        const startSem = endSem - 1;

        return [startSem, endSem].map(
          (sem) =>
            sem <= (settings?.total_semesters) && (
              <option key={sem} value={sem}>
                {sem} Sem
              </option>
            )
        );
      })()}
  </select>
</div>

              {errors.year && (
                <div className="field-error">{errors.year}</div>
              )}
              {errors.semester && (
                <div className="field-error">{errors.semester}</div>
              )}
            </>
          )}

          {/* PASSWORD */}
          <div className="mb-4 position-relative">
            <input
  type={showPassword ? "text" : "password"}
  name="password"
  disabled={!emailVerified}
  className={`form-control-minimal ${errors.password ? "is-invalid" : ""}`}
  placeholder="Set Password"
  onChange={handleChange}
/>

            <div className="position-absolute end-0 top-50 translate-middle-y">
              <PasswordEye
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            </div>
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}



          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-2 mt-3 transition-all"
            style={{
              borderRadius: "12px",
              backgroundColor: "#2d6bf1",
              color: "white",
              fontSize: "1rem",
            }}
            disabled={!emailVerified || success}
          >
            {success ? "Setting up..." : "Join Now →"}
          </button>
        </form>
      </div>
    </div>
  </div>
);

}

export default RegisterPage;
