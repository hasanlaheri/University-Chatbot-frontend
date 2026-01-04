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
      className="min-vh-100 d-flex flex-column align-items-center"
      style={{
        background: "linear-gradient(135deg, #16222A, #3A6073)",
        color: "white",
        paddingTop: "100px",
      }}
    >
      <div className="position-absolute top-0 w-100 d-flex justify-content-between align-items-center p-3 px-4">
        <h4 className="fw-bold">🏛️ University Portal</h4>
        <button className="btn btn-outline-light" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>

      <div
  className={`card shadow-lg border-0 text-dark p-4 mt-4 position-relative 
    ${unauthorized ? "shake-error" : ""}`}

        
        style={{
          width: "95%",
          maxWidth: "420px",
          borderRadius: "12px",
          background: "white",
        }}
      >
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
            <h5 className="fw-bold text-success">Registration Successful!</h5>
          </div>
        )}
        {unauthorized && (
  <div className="unauthorized-popup">
    ❌ Unauthorized Email — Only approved faculty can register!
    <br />
    Redirecting…
  </div>
)}


        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary text-capitalize">
            {role} Registration
          </h3>
          <p className="text-muted mb-0">
            Create your {role} account to access the portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
                   {/* ---------------- College Selection (Dynamic) ---------------- */}
<div className="mb-3">
  <label className="form-label fw-semibold">Select College</label>
  <select
    name="college_id"
    className={`form-select ${errors.college_id ? "is-invalid" : ""}`}
    onChange={handleChange}
  >
    <option value="">
      {loadingColleges ? "Loading Colleges..." : "Select College"}
    </option>

    {colleges.map(col => (
      <option key={col.id} value={col.id}>{col.name}</option>
    ))}
  </select>
{role === "user" && formData.college_id && (
  <small className="text-muted">
    Email should ideally end with <b>{colleges.find(c => c.id == formData.college_id)?.domain || "college domain"}</b>
    <br/>Other domains → Registered as <span style={{color:'orange'}}>Guest</span>
  </small>
)}

  {errors.college_id && <div className="invalid-feedback">{errors.college_id}</div>}
</div>
{["username", "email", "contact", "password"].map((field) => (
  <div className="mb-3" key={field}>
    <label className="form-label fw-semibold text-capitalize">
      {field === "contact"
        ? "Contact Number"
        : field.charAt(0).toUpperCase() + field.slice(1)}
    </label>
{field === "password" ? (
  <div style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      className={`form-control ${errors[field] ? "is-invalid" : ""}`}
      name={field}
      placeholder="Enter password"
      onChange={handleChange}
    />
    <PasswordEye
      visible={showPassword}
      onToggle={() => setShowPassword(v => !v)}
    />
  </div>
) : (
  <input
    type={field === "email" ? "email" : field === "contact" ? "tel" : "text"}
    className={`form-control ${errors[field] ? "is-invalid" : ""}`}
    name={field}
    placeholder={`Enter ${field}`}
    onChange={handleChange}
  />
)}

    {/* ⬇ ADD THIS RIGHT HERE UNDER INPUT */}
    {field === "email" && role === "user" && emailStatus && (
      <div
        className="mt-1"
        style={{
          fontSize: "13px",
          color: emailStatus === "student" ? "green" : "orange",
          fontWeight: "600"
        }}
      >
        {emailStatus === "student"
          ? "✔ Verified College Email — Full Access"
          : "⚠ External Email — Will be registered as Guest"}
      </div>
    )}

    {errors[field] && (
      <div className="invalid-feedback">{errors[field]}</div>
    )}
  </div>
))}


 


          {/* Faculty */}
   {role === "faculty" && (
  <div className="mb-3">
    <label className="form-label fw-semibold">Department</label>

    <select
      className={`form-select ${errors.department ? "is-invalid" : ""}`}
      name="department"
      onChange={handleChange}
      disabled={!allDepartments.length}
    >
      <option value="">
        {allDepartments.length ? "Select Department" : "Select college first"}
      </option>

      {allDepartments.map(dep => (
        <option key={dep.id} value={dep.id}>
          {dep.name}
        </option>
      ))}
    </select>

    {errors.department && (
      <div className="invalid-feedback">{errors.department}</div>
    )}
  </div>
)}



          {/* User */}
          {role === "user" && (
  <>
    <div className="mb-3">
      <label className="form-label fw-semibold">Branch</label>

      <select
        className={`form-select ${errors.branch ? "is-invalid" : ""}`}
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        disabled={!academicDepartments.length}
      >
        <option value="">
          {academicDepartments.length
            ? "Select Branch"
            : "Select college first"}
        </option>

        {/* Special case */}
        <option value="N/A">N/A</option>

        {/* 🔥 Academic branches from DB */}
        {academicDepartments.map(dep => (
          <option key={dep.id} value={dep.name}>
            {dep.name}
          </option>
        ))}
      </select>

      {errors.branch && (
        <div className="invalid-feedback">{errors.branch}</div>
      )}
    </div>
  



{/* ---------------- Year & Semester (Auto N/A when branch=N/A) ---------------- */}
{["year", "semester"].map((field) => {
  const noCollegeSelected = !formData.college_id;

  return (
    <div
      key={field}
      className={`mb-3 transition-opacity ${
        formData.branch === "N/A" || noCollegeSelected
          ? "opacity-50"
          : "opacity-100"
      }`}
      style={{
        pointerEvents:
          formData.branch === "N/A" || noCollegeSelected ? "none" : "auto",
        transition: "0.3s",
      }}
    >
      <label className="form-label fw-semibold text-capitalize">
        {field}
      </label>

      <select
        className={`form-select ${errors[field] ? "is-invalid" : ""}`}
        name={field}
        value={
          formData.branch === "N/A" || noCollegeSelected
            ? "N/A"
            : formData[field]
        }
        onChange={handleChange}
        disabled={formData.branch === "N/A" || noCollegeSelected}
      >
        {/* If college not selected → show Select College First */}
        {noCollegeSelected && <option>Select college first</option>}

        {/* N/A logic stays same */}
        {formData.branch === "N/A" ? (
          <option value="N/A">N/A</option>
        ) : field === "year" ? (
          settings ? (
            <>
              <option value="">Select {field}</option>
              {Array.from({ length: settings.total_years }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Year
                </option>
              ))}
            </>
          ) : (
            <option>Loading...</option>
          )
        ) : (
          settings ? (
            <>
              <option value="">Select {field}</option>
              {Array.from({ length: settings.total_semesters }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Semester
                </option>
              ))}
            </>
          ) : (
            <option>Loading...</option>
          )
        )}
      </select>

      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
    </div>
  );
})}




            </>
          )}

          {/* General error */}
          {errors.general && (
            <div className="alert alert-danger py-2">{errors.general}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            disabled={success}
          >
            {success ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      <footer className="mt-5 text-white-50 small text-center px-2">
        © 2025 University Chatbot Portal. All Rights Reserved.
      </footer>
    </div>
  );
}

export default RegisterPage;
