import React, { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";
import "../App.css";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserTie,
  FaFolderOpen,
  FaUserCircle 
} from "react-icons/fa";

export default function AdminDashboard() {


  const [departments, setDepartments] = useState([]);
  const [selectedDep, setSelectedDep] = useState("");
  const [selectedDepDetails, setSelectedDepDetails] = useState(null);
const [stats, setStats] = useState(null);
const [collegeName, setCollegeName] = useState("");
const [showProfile, setShowProfile] = useState(false);

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
const [showAddDept, setShowAddDept] = useState(false);

const [newDeptName, setNewDeptName] = useState("");
const [newDeptCode, setNewDeptCode] = useState("");
const [newDeptType, setNewDeptType] = useState("academic");
const [savingDept, setSavingDept] = useState(false);
const [deptDrafts, setDeptDrafts] = useState([]);
const adminRole = localStorage.getItem("admin_role");
const isCampusAdmin = adminRole === "campus_admin";

  const navigate = useNavigate();

// Fetch departments college-wise
useEffect(() => {
  async function loadDeps() {
    const collegeId = localStorage.getItem("college_id");

    if (!collegeId) {
      console.warn("❗ No college_id found in localStorage");
      return;
    }

 const res = await fetch("http://localhost:5000/admin/departments", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem("token"),
    "College-Id": collegeId    // <-- final working key
  }
});


    const data = await res.json();
    console.log("DEPARTMENT API RESPONSE:", data);

    setDepartments(Array.isArray(data) ? data : []);
  }

  loadDeps();
}, []);
useEffect(() => {
  async function fetchCollegeName() {
    try {
      const collegeId = localStorage.getItem("college_id");
      if (!collegeId) return;

      const res = await fetch("http://localhost:5000/colleges");
      const data = await res.json();

      const college = data.find(c => String(c.id) === String(collegeId));
      if (college) setCollegeName(college.name);
    } catch (err) {
      console.error("College fetch error:", err);
    }
  }

  fetchCollegeName();
}, []);

useEffect(() => {
  async function fetchStats() {
    try {
      const res = await fetch("http://localhost:5000/admin/dashboard-stats", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token"),
          "College-Id": localStorage.getItem("college_id")
        }
      });

      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Dashboard stats error", err);
    }
  }

  fetchStats();
}, []);

function addDeptToList() {
  if (!newDeptName || !newDeptCode) {
    alert("Fill all fields");
    return;
  }

  if (!/^\d{4}$/.test(newDeptCode)) {
    alert("Department code must be 4 digits");
    return;
  }

  const exists = deptDrafts.some(
    d => d.code === newDeptCode || d.name.toLowerCase() === newDeptName.toLowerCase()
  );

  if (exists) {
    alert("Department already added");
    return;
  }

  setDeptDrafts(prev => [
    ...prev,
    {
      name: newDeptName.trim(),
      code: newDeptCode.trim(),
      type: newDeptType
    }
  ]);

  // reset fields
  setNewDeptName("");
  setNewDeptCode("");
  setNewDeptType("academic");
}


function verifyCode() {
  if (enteredCode === selectedDep) {
    setShowCodeModal(false);
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      navigate(`/admin/department/${encodeURIComponent(selectedDepDetails?.name)}`, {
        state: { depCode: selectedDep, college_id: localStorage.getItem("college_id") }
      });
    }, 1200);

  } else {
    setErrorMsg("❌ Incorrect department code");
    setEnteredCode("")
    const box = document.getElementById("code-box");
    if (box) {
      box.classList.add("shake");
      setTimeout(() => box.classList.remove("shake"), 400);
      setTimeout(() => setErrorMsg(""), 1000);
    }
  }
}
const handleSaveAllDepartments = async () => {
  if (deptDrafts.length === 0) {
    alert("No departments to save");
    return;
  }

  try {
    setSavingDept(true);

    const res = await fetch("http://localhost:5000/admin/add/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
        "College-Id": localStorage.getItem("college_id"),
      },
      body: JSON.stringify({
        departments: deptDrafts, // ✅ works for 1 or many
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add departments");
      return;
    }

    // ✅ Update UI immediately
    setDepartments(prev => [...prev, ...data.saved]);

    // ✅ Reset modal
    setDeptDrafts([]);
    setShowAddDept(false);

    alert("Departments added successfully");

  } catch (err) {
    console.error("Save department error:", err);
    alert("Something went wrong");
  } finally {
    setSavingDept(false);
  }
};


 return (
  <div
    className="min-vh-100"
    style={{
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "#e5e7eb",
    }}
  >

    {/* ================= HEADER ================= */}
   <div
  className="d-flex align-items-center px-4 py-3"
  style={{
    backdropFilter: "blur(8px)",
    background: "rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  }}
>

  {/* LEFT: ADMIN INFO */}
  <div className="d-flex flex-column">
    <h4 className="fw-bold mb-0">Admin Dashboard</h4>
    <small className="opacity-75">
      Logged in as <b>{localStorage.getItem("admin_role") || "Campus Admin"}</b>
    </small>
  </div>

  {/* CENTER: COLLEGE NAME */}
  <div className="mx-auto text-center">
    <h5 className="fw-semibold mb-0">
      {collegeName || "Loading College..."}
    </h5>
  </div>

<div className="d-flex align-items-center gap-3">
  
  {/* PROFILE ICON */}
  <button
    className="btn p-0 border-0 bg-transparent"
    onClick={() => setShowProfile(true)}
    title="Profile"
  >
    <FaUserCircle
      size={38}
      color="#38bdf8"
      style={{ cursor: "pointer" }}
    />
  </button>

  {/* LOGOUT */}
  <LogoutButton />

</div>


</div>


    {/* ================= LOADER ================= */}
    {loading && (
      <div className="admin-overlay">
        <div className="spiral-loader"></div>
      </div>
    )}

    <div className="container py-4">

      {/* ================= STATS ================= */}
<div className="row g-4 mb-5">
  {[
    {
      label: "Departments",
      value: stats?.departments ?? "—",
      icon: <FaUniversity size={26} color="#38bdf8" />
    },
    {
      label: "Students",
      value: stats?.students ?? "—",
      icon: <FaUserGraduate size={26} color="#22d3ee" />
    },
    {
      label: "Faculty",
      value: stats?.faculty ?? "—",
      icon: <FaChalkboardTeacher size={26} color="#22d3ee" />
    },
    {
      label: "Uploads",
      value: stats?.uploads ?? "—",
      icon: <FaFolderOpen size={26} color="#a5b4fc" />
    }
  ].map((card, i) => (
    <div className="col-md-3 col-6" key={i}>
      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="opacity-75">{card.label}</small>
            <h3 className="fw-bold mt-1">{card.value}</h3>
          </div>
          {card.icon}
        </div>
      </div>
    </div>
  ))}
</div>


{/* ================= QUICK ACTIONS ================= */}
<div className="mb-5">
  <h5 className="fw-bold mb-3">Quick Actions</h5>
  <div className="d-flex flex-wrap gap-3">
<button className="btn btn-outline-light d-flex align-items-center gap-2"
onClick={() => navigate("/admin/campus-info")}>
  <FaUniversity color="#38bdf8" />
  Campus
</button>

<button className="btn btn-outline-light d-flex align-items-center gap-2">
  <FaFolderOpen color="#38bdf8" />
  Uploads
</button>

  </div>
</div>

{/* ================= MANAGEMENT ================= */}
<div className="mb-5">
  <h5 className="fw-bold mb-3">Management</h5>

  <div className="d-flex flex-wrap gap-3">
<button
  className="btn btn-outline-light d-flex align-items-center gap-2"
  onClick={() => navigate("/admin/students-management")}
>
  <FaUserGraduate color="#22d3ee" />
  Students
</button>


<button className="btn btn-outline-light d-flex align-items-center gap-2">
  <FaChalkboardTeacher color="#22d3ee" />
  Faculty
</button>

<button className="btn btn-outline-light d-flex align-items-center gap-2">
  <FaUserTie color="#22d3ee" />
  Guests
</button>

  </div>
</div>


      {/* ================= DEPARTMENTS ================= */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
  <h5 className="fw-bold mb-0">Departments</h5>

  <button
    className="btn btn-sm btn-outline-light"
    onClick={() => setShowAddDept(true)}
  >
    + Add Department
  </button>
</div>

        <p className="opacity-75 mb-3">
          Select a department to manage users, uploads and access
        </p>

        <div className="row g-3">
          {departments.map(dep => (
            <div className="col-md-3 col-6" key={dep.id}>
              <div
                className="admin-card cursor-pointer"
                onClick={() => {
                  setSelectedDep(dep.code);
                  setSelectedDepDetails(dep);
                  setShowCodeModal(true);
                }}
              >
                <h6 className="fw-bold mb-1">{dep.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RECENT ACTIVITY ================= */}
      <div>
        <h5 className="fw-bold mb-3">Recent Activity</h5>
        <div className="admin-card">
          <ul className="mb-0 small">
            <li>Faculty access granted</li>
            <li>Guest registered</li>
            <li>Department code updated</li>
          </ul>
        </div>
      </div>

    </div>

    {/* ================= VERIFY MODAL ================= */}
    {showCodeModal && (
      <div className="admin-overlay">
        <div id="code-box" className="admin-modal">
          <h5 className="fw-bold text-center mb-3 text-dark">
            Enter Department Code
          </h5>

          <input
            type="password"
            maxLength={4}
            className="form-control text-center fw-bold"
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
          />

          {errorMsg && (
            <p className="text-danger text-center mt-2">{errorMsg}</p>
          )}

          <button className="btn btn-primary w-100 mt-3" onClick={verifyCode}>
            Verify
          </button>

          <button
            className="btn btn-light w-100 mt-2"
            onClick={() => setShowCodeModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
 {showProfile && (
  <div
    className="admin-overlay"
    onClick={() => setShowProfile(false)}
  >
    <div
      className="admin-card"
      onClick={(e) => e.stopPropagation()}
      style={{
        maxWidth: "420px",
        width: "100%",
        background: "rgba(30, 41, 59, 0.95)", // 🔥 lighter slate
        color: "#f1f5f9",                     // 🔥 brighter text
      }}
    >
      {/* HEADER */}
      <div className="text-center mb-4">
        <h5 className="fw-bold mb-1" style={{ color: "#f8fafc" }}>
          Admin Profile
        </h5>
        <small style={{ color: "#cbd5e1" }}>
          Account information
        </small>
      </div>

      {/* INFO ROWS */}
      <div className="mb-3">
        <small className="d-block" style={{ color: "#94a3b8" }}>
          Email
        </small>
        <div className="fw-semibold" style={{ color: "#f8fafc" }}>
          {JSON.parse(localStorage.getItem("user"))?.email}
        </div>
      </div>

      <div className="mb-3">
        <small className="d-block" style={{ color: "#94a3b8" }}>
          Admin Role
        </small>
        <div className="fw-semibold text-capitalize" style={{ color: "#f8fafc" }}>
          {(localStorage.getItem("admin_role") || "").replace("_", " ")}
        </div>
      </div>

      <div className="mb-3">
        <small className="d-block" style={{ color: "#94a3b8" }}>
          College Name
        </small>
        <div className="fw-semibold" style={{ color: "#f8fafc" }}>
          {localStorage.getItem("college_name")}
        </div>
      </div>

      <div className="mb-4">
        <small className="d-block" style={{ color: "#94a3b8" }}>
          College Code
        </small>
        <div className="fw-semibold" style={{ color: "#f8fafc" }}>
          {localStorage.getItem("college_code")}
        </div>
      </div>

      {/* ACTION */}
      <button
        className="btn btn-outline-light w-100"
        onClick={() => setShowProfile(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

{showAddDept && (
  <div
    className="admin-overlay"
    style={{ zIndex: 9999 }}
    onClick={() => setShowAddDept(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="admin-card"
      style={{
        width: "100%",
        maxWidth: "720px",
        maxHeight: "85vh",
        overflowY: "auto",
        background: "rgba(30, 41, 59, 0.95)",
        backdropFilter: "blur(10px)",
        color: "#f1f5f9",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: "#f8fafc" }}>
          Add Departments
        </h5>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setShowAddDept(false)}
        >
          ✕
        </button>
      </div>

      {/* 🚫 NOT AUTHORIZED VIEW */}
      {!isCampusAdmin && (
        <div className="text-center py-5">
          <h6 className="fw-bold text-warning mb-2">
            Not Authorized
          </h6>
          <p className="opacity-75 mb-4">
            Only <b>Campus Admin</b> can add or manage departments.
          </p>

          <button
            className="btn btn-outline-light"
            onClick={() => setShowAddDept(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* ✅ AUTHORIZED VIEW */}
      {isCampusAdmin && (
        <>
          {/* FORM */}
          <div className="mb-3">
            <label className="fw-semibold text-light mb-1">
              Department Name
            </label>
            <input
              className="form-control admin-input"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="mb-3">
            <label className="fw-semibold text-light mb-1">
              Department Code (4 digits)
            </label>
            <input
              className="form-control admin-input"
              value={newDeptCode}
              onChange={(e) => setNewDeptCode(e.target.value)}
              placeholder="e.g. 1234"
              maxLength={4}
            />
          </div>

          <div className="mb-4">
            <label className="fw-semibold text-light d-block mb-2">
              Department Type
            </label>

            <div className="d-flex gap-4">
              <label className="d-flex align-items-center gap-2 text-light">
                <input
                  type="radio"
                  checked={newDeptType === "academic"}
                  onChange={() => setNewDeptType("academic")}
                />
                Academic
              </label>

              <label className="d-flex align-items-center gap-2 text-light">
                <input
                  type="radio"
                  checked={newDeptType === "unit"}
                  onChange={() => setNewDeptType("unit")}
                />
                Unit
              </label>
            </div>
          </div>

          {/* ADD TO LIST */}
          <button
            className="btn btn-outline-info mb-4"
            onClick={addDeptToList}
          >
            + Add to List
          </button>

          {/* FOOTER */}
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-light"
              onClick={() => setShowAddDept(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-info"
              disabled={deptDrafts.length === 0 || savingDept}
              onClick={handleSaveAllDepartments}
            >
              {savingDept ? "Saving..." : `Save (${deptDrafts.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}






  </div>
  
);

}
