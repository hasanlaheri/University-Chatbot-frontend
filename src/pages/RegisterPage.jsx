import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../App.css';
import PasswordEye from "../components/PasswordEye";


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
const [emailStatus, setEmailStatus] = useState(null); // "student" | "guest" | null
const [departments, setDepartments] = useState([]);
const [settings, setSettings] = useState(null);
const [allDepartments, setAllDepartments] = useState([]);        // faculty
const [academicDepartments, setAcademicDepartments] = useState([]); // students
const [showPassword, setShowPassword] = useState(false);



  // ✅ Field-level validation on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let errorMsg = "";

    switch (name) {
      case "username":
        if (!value.trim()) errorMsg = "Username is required";
        break;
      case "email":
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

        {/* 🔔 ROLE NOTE */}
        {role === "user" && (
          <div className="alert alert-info small mb-4">
            ℹ️ If your email matches the selected college domain, you will be
            registered as a <b>Student</b>. Otherwise, you will be registered as
            a <b>Guest</b>.
          </div>
        )}

        {role === "faculty" && (
          <div className="alert alert-warning small mb-4">
            ⚠️ Faculty registration is allowed only if your account is approved
            by the <b>Admin</b>.
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
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input
                type="email"
                name="email"
                className={`form-control-minimal ${
                  errors.email ? "is-invalid" : ""
                }`}
                placeholder="Email Address"
                onChange={handleChange}
              />

              {emailStatus && role === "user" && (
                <div
                  className="mt-1 small"
                  style={{
                    color:
                      emailStatus === "student" ? "#10B981" : "#F59E0B",
                    fontWeight: 500,
                  }}
                >
                  {emailStatus === "student"
                    ? "✔ College email verified — Student access"
                    : "⚠ Domain mismatch — Guest access"}
                </div>
              )}

              {errors.email && (
                <div className="field-error">{errors.email}</div>
              )}
            </div>

            <div className="col-md-6">
              <input
                type="tel"
                name="contact"
                className={`form-control-minimal ${
                  errors.contact ? "is-invalid" : ""
                }`}
                placeholder="Contact Number"
                onChange={handleChange}
              />
              {errors.contact && (
                <div className="field-error">{errors.contact}</div>
              )}
            </div>
          </div>

          {/* FACULTY / STUDENT FIELDS */}
          {role === "faculty" ? (
            <div className="mb-3">
              <select
                name="department"
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
                <select
                  name="year"
                  className={`form-select-minimal ${
                    errors.year ? "is-invalid" : ""
                  }`}
                  onChange={handleChange}
                  disabled={formData.branch === "N/A"}
                >
                  <option value="">Year</option>
                  {Array.from(
                    { length: settings?.total_years },
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Year
                      </option>
                    )
                  )}
                </select>

                <select
                  name="semester"
                  className={`form-select-minimal ${
                    errors.semester ? "is-invalid" : ""
                  }`}
                  onChange={handleChange}
                  disabled={formData.branch === "N/A"}
                >
                  <option value="">Semester</option>
                  {Array.from(
                    { length: settings?.total_semesters },
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Sem
                      </option>
                    )
                  )}
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
              className={`form-control-minimal ${
                errors.password ? "is-invalid" : ""
              }`}
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
            disabled={success}
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
