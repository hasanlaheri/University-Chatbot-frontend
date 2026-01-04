import React, { useState, useEffect } from "react";
import { FaLink, FaUpload, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function CampusInfo() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("url"); // url | file
  const [visibility, setVisibility] = useState("public"); // public | private
  const [audience, setAudience] = useState("both"); // students | faculty | both
const [campusName, setCampusName] = useState("");
const [campusCode, setCampusCode] = useState("");
const [stats, setStats] = useState(null);
const [departments, setDepartments] = useState([]);
const [depStats, setDepStats] = useState({});
const [collegeSettings, setCollegeSettings] = useState(null);
const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadType, setUploadType] = useState("url"); // url | file
const [uploadVisibility, setUploadVisibility] = useState("public");
const [uploadUrl, setUploadUrl] = useState("");
const [uploadFile, setUploadFile] = useState(null);
const [category, setCategory] = useState("");



useEffect(() => {
  async function fetchCampusDetails() {
    try {
      const collegeId = localStorage.getItem("college_id");
      if (!collegeId) return;

      const res = await fetch("http://localhost:5000/colleges");
      const data = await res.json();

      const campus = data.find(
        c => String(c.id) === String(collegeId)
      );

      if (campus) {
        setCampusName(campus.name);
        setCampusCode(campus.code);
      }
    } catch (err) {
      console.error("Campus fetch error:", err);
    }
  }

  fetchCampusDetails();
}, []);
useEffect(() => {
  async function fetchCampusStats() {
    const res = await fetch("http://localhost:5000/admin/dashboard-stats", {
      headers: {
        "Authorization": localStorage.getItem("token"),
        "College-Id": localStorage.getItem("college_id"),
      },
    });

    const data = await res.json();
    if (res.ok) setStats(data);
  }

  fetchCampusStats();
}, []);

useEffect(() => {
  async function fetchDepartments() {
    try {
      const res = await fetch("http://localhost:5000/admin/departments", {
        headers: {
          "Authorization": localStorage.getItem("token"),
          "College-Id": localStorage.getItem("college_id"),
        },
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error("Departments fetch error:", err);
    }
  }

  fetchDepartments();
}, []);

useEffect(() => {
  async function fetchDepartmentStats() {
    if (!departments.length) return;

    const statsMap = {};

    for (const dep of departments) {
      try {
        const res = await fetch(
          `http://localhost:5000/admin/stats/${encodeURIComponent(dep.name)}`,
          {
            headers: {
              "Authorization": localStorage.getItem("token"),
              "College-Id": localStorage.getItem("college_id"),
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          statsMap[dep.name] = {
            students: data.students,
            faculty: data.faculty,
            uploads: data.uploads,
          };
        }
      } catch (err) {
        console.error("Stats fetch failed for", dep.name);
      }
    }

    setDepStats(statsMap);
  }

  fetchDepartmentStats();
}, [departments]);

useEffect(() => {
  async function fetchCollegeSettings() {
    try {
      const collegeId = localStorage.getItem("college_id");
      if (!collegeId) return;

      const res = await fetch(
        `http://localhost:5000/college/settings/${collegeId}`
      );

      const data = await res.json();
      if (res.ok) {
        setCollegeSettings(data);
      }
    } catch (err) {
      console.error("College settings fetch error:", err);
    }
  }

  fetchCollegeSettings();
}, []);
const role = localStorage.getItem("admin_role");

if (role !== "campus_admin") {
  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#e5e7eb",
      }}
    >
      <div
        className="admin-card text-center"
        style={{
          maxWidth: "420px",
          padding: "30px",
        }}
      >
        <h4 className="fw-bold mb-2">🚫 Not Authorized</h4>
        <p className="opacity-75 mb-4">
          This page can only be accessed by a Campus Admin.
        </p>

        <button
          className="btn btn-outline-light"
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#e5e7eb",
      }}
    >
  {/* ===== HEADER ===== */}
<div
   className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center px-3 px-md-4 py-3 gap-2"
  style={{
    backdropFilter: "blur(8px)",
    background: "rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  }}
>
  {/* LEFT */}
  <div className="d-flex align-items-center gap-3">
    <button
      className="btn btn-outline-light btn-sm"
      onClick={() => navigate("/admin")}
    >
      ← Back
    </button>

    <div>
      <h5 className="fw-bold mb-0">
        {campusName || "Loading Campus..."}
      </h5>
      <small className="opacity-75">
        Campus Code: {campusCode || "—"}
      </small>
    </div>
  </div>
    <button
    className="btn btn-info d-flex align-items-center gap-2"
    onClick={() => setShowUploadModal(true)}
  >
    <FaUpload />
    Upload 
  </button>
</div>


      {/* ===== CONTENT ===== */}
      <div className="container py-4">


{/* ===== CAMPUS OVERVIEW ===== */}
<div className="container mt-4">

  <div
    className="d-flex flex-wrap justify-content-between align-items-center px-3 px-md-4 py-3"
    style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
    }}
  >
    {/* TOTAL YEARS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">
        {collegeSettings?.total_years ?? "—"}
      </div>
      <small className="opacity-75">Years</small>
    </div>

    <div className="vr opacity-25"></div>

    {/* TOTAL SEMESTERS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">
        {collegeSettings?.total_semesters ?? "—"}
      </div>
      <small className="opacity-75">Semesters</small>
    </div>
    
    <div className="vr opacity-25"></div>

    {/* DEPARTMENTS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">{stats?.departments ?? "—"}</div>
      <small className="opacity-75">Departments</small>
    </div>

    <div className="vr opacity-25"></div>

    {/* TOTAL USERS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">{stats?.users ?? "—"}</div>
      <small className="opacity-75">Total Users</small>
    </div>

    <div className="vr opacity-25"></div>

    {/* STUDENTS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">{stats?.students ?? "—"}</div>
      <small className="opacity-75">Students</small>
    </div>

    <div className="vr opacity-25"></div>

    {/* FACULTY */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">{stats?.faculty ?? "—"}</div>
      <small className="opacity-75">Faculty</small>
    </div>

    <div className="vr opacity-25"></div>

    {/* GUESTS */}
    <div className="text-center flex-fill">
      <div className="fw-bold fs-4">{stats?.guests ?? "—"}</div>
      <small className="opacity-75">Guests</small>
    </div>
    
  </div>

</div>


{/* ===== DEPARTMENTS OVERVIEW ===== */}
<div className="mt-5">

  <div className="d-flex justify-content-between align-items-center mb-3">
    <div>
      <h5 className="fw-bold mb-0">Departments Overview</h5>
      <small className="opacity-75">
        Students and faculty distribution per department
      </small>
    </div>
  </div>

  <div className="admin-table-wrapper table-responsive">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Department</th>
          <th className="text-center">Students</th>
          <th className="text-center">Faculty</th>
          <th className="text-center">Uploads</th>
          <th className="text-center">Code</th>
          <th className="text-center">Type</th>
        </tr>
      </thead>

      <tbody>
        {departments.length > 0 ? (
          departments.map(dep => (
            <tr key={dep.id}>
              <td>
                <div className="fw-semibold">{dep.name}</div>
              </td>


              <td className="text-center">
                {depStats[dep.name]?.students ?? "—"}
              </td>

              <td className="text-center">
                {depStats[dep.name]?.faculty ?? "—"}
              </td>
               <td className="text-center">
          {depStats[dep.name]?.uploads ?? "—"}
        </td>
                       {/* Department Code */}
        <td className="text-center">
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(59,130,246,0.15)", // blue-500 tint
              color: "#93c5fd",                    // blue-300
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.5px",
            }}
          >
            {dep.code}
          </span>
        </td>
        <td className="text-center">
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(59,130,246,0.15)", // blue-500 tint
              color: "#93c5fd",                    // blue-300
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.5px",
            }}
          >
            {dep.type}
          </span>
        </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center py-4 text-muted">
              No departments found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

</div>



      </div>
      {showUploadModal && (
  <div
  className="admin-overlay"
  style={{ background: "rgba(15,23,42,0.6)" }}
  onClick={() => setShowUploadModal(false)}
>

    <div
      className="admin-card"
      onClick={(e) => e.stopPropagation()}
      style={{
  width: "100%",
  maxWidth: "900px",
  height: "85vh",
  background: "rgba(255,255,255,0.95)",
  color: "#0f172a",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
}}

    >
      {/* HEADER */}
     <div className="d-flex justify-content-between align-items-center mb-3 pb-2"
     style={{ borderBottom: "1px solid #e5e7eb" }}
>
  <h5
    className="fw-bold mb-0"
    style={{ color: "#0f172a" }}   // slate-900
  >
    Upload Campus Material
  </h5>

  <button
    className="btn btn-sm"
    onClick={() => setShowUploadModal(false)}
    style={{
      border: "1px solid #cbd5e1",
      color: "#334155",           // slate-700
      background: "#f8fafc",
      borderRadius: "6px",
      lineHeight: "1",
    }}
  >
    ✕
  </button>
</div>


      {/* TABS */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn ${
  uploadType === "url" ? "btn-primary" : "btn-outline-secondary"
}`}

          onClick={() => setUploadType("url")}
        >
          Upload URL
        </button>
        <button
          className={`btn ${
  uploadType === "file" ? "btn-primary" : "btn-outline-secondary"
}`}

          onClick={() => setUploadType("file")}
        >
          Upload File
        </button>
      </div>

      {/* BODY */}
      <div className="flex-grow-1 overflow-auto">

        {/* URL UPLOAD */}
        {uploadType === "url" && (
          <>
            <label className="fw-semibold mb-1" style={{ color: "#334155" }}>Paste URL</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="https://example.com"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
          </>
        )}

        {/* FILE UPLOAD */}
        {uploadType === "file" && (
          <>
            <label className="fw-semibold mb-1" style={{ color: "#334155" }}>Select File</label>
            <input
              type="file"
              className="form-control mb-3"
              onChange={(e) => setUploadFile(e.target.files[0])}
            />

            <label className="fw-semibold mb-1" style={{ color: "#334155" }}>Category</label>
            <select
              className="form-control mb-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option>Notice</option>
              <option>Circular</option>
              <option>Timetable</option>
              <option>Academic</option>
              <option>Other</option>
            </select>
          </>
        )}

        {/* VISIBILITY */}
        <label className="fw-semibold mb-1" style={{ color: "#334155" }}>Visibility</label>
        <select
          className="form-control mb-3"
          value={uploadVisibility}
          onChange={(e) => setUploadVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

      </div>

      {/* FOOTER */}
      <button className="btn btn-success w-100 mt-3">
        Upload
      </button>
    </div>
  </div>
)}

    </div>
  );
}
