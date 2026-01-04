import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserGraduate, FaFilter, FaTimes ,FaFileCsv  } from "react-icons/fa";

export default function StudentsManagement() {
  const navigate = useNavigate();
const collegeId = localStorage.getItem("college_id");
  const [studentStats, setStudentStats] = useState({
    total_students: null,
    total_sessions: null,
    total_queries: null,
  });
  const [showFilters, setShowFilters] = useState(false);
const darkSelectStyle = {
  background: "rgba(255,255,255,0.08)",
  color: "#e5e7eb",
  border: "1px solid rgba(255,255,255,0.2)",
};

const [departments, setDepartments] = useState([]);
const [settings, setSettings] = useState(null);

const [departmentId, setDepartmentId] = useState("");
const [year, setYear] = useState("");
const [semester, setSemester] = useState("");
const [studentOptions, setStudentOptions] = useState([]);
const [students, setStudents] = useState([]);
const [selectedStudentId, setSelectedStudentId] = useState("");
const [appliedFilters, setAppliedFilters] = useState(null);
const [loadingStudents, setLoadingStudents] = useState(false);
const [studentProfile, setStudentProfile] = useState(null);
const [selectedInitial, setSelectedInitial] = useState("");
const availableInitials = React.useMemo(() => {
  const set = new Set();
  students.forEach(s => {
    if (s.name) {
      set.add(s.name.charAt(0).toUpperCase());
    }
  });
  return Array.from(set).sort();
}, [students]);
const filteredStudents = React.useMemo(() => {
  if (!selectedInitial) return students;
  return students.filter(s =>
    s.name?.toUpperCase().startsWith(selectedInitial)
  );
}, [students, selectedInitial]);

  useEffect(() => {
    async function fetchStudentStats() {
      try {
        const res = await fetch("http://localhost:5000/admin/student-stats", {
          headers: {
            "College-Id": localStorage.getItem("college_id"),
          },
        });

        const data = await res.json();
        if (res.ok) {
          setStudentStats(data);
        }
      } catch (err) {
        console.error("Student stats fetch error:", err);
      }
    }

    fetchStudentStats();
  }, []);

const fetchFilterMeta = async () => {
  // prevent refetch if already loaded
  if (departments.length > 0 && settings) return;

  try {
    const [depRes, settingsRes] = await Promise.all([
      fetch(`http://localhost:5000/departments/academic/${collegeId}`, {
        headers: { "College-Id": collegeId }
      }),
      fetch(`http://localhost:5000/college/settings/${collegeId}`)
    ]);

    const depData = await depRes.json();
    const settingsData = await settingsRes.json();

    setDepartments(depData);
    setSettings(settingsData);
  } catch (err) {
    console.error("Filter meta fetch failed:", err);
  }
};


const handleApplyFilters = async () => {
  if (!departmentId) return;

  setLoadingStudents(true);
  setStudentProfile(null);
  setSelectedInitial("");

  const params = new URLSearchParams({
    department_id: departmentId,
    ...(year && { year }),
    ...(semester && { semester }),
    ...(selectedStudentId && { student_id: selectedStudentId })
  });

  try {
    const res = await fetch(
      `http://localhost:5000/admin/students/filter?${params.toString()}`,
      { headers: { "College-Id": collegeId } }
    );

    const data = await res.json();

    if (res.ok) {
      if (selectedStudentId) {
        // 👤 single student → profile
        setStudentProfile(data[0]);
        setStudents([]);
      } else {
        // 📋 multiple students → table
        setStudents(data);
        setStudentProfile(null);
      }

      const applied = {
  departmentId,
  year,
  semester,
  selectedStudentId
};

setAppliedFilters(applied);
localStorage.setItem("student_applied_filters", JSON.stringify(applied));

    }
  } finally {
    setLoadingStudents(false);
  }
};





useEffect(() => {
  const saved = localStorage.getItem("student_applied_filters");
  if (!saved) return;

  const f = JSON.parse(saved);

  setDepartmentId(f.departmentId || "");
  setYear(f.year || "");
  setSemester(f.semester || "");
  setSelectedStudentId(f.selectedStudentId || "");

  setShowFilters(true);

  // 🔥 IMPORTANT: fetch meta when restoring filters
  fetchFilterMeta().then(() => {
    setAppliedFilters(f); // triggers table/profile fetch AFTER meta
  });
}, []);






useEffect(() => {
  if (!showFilters || !departmentId) {
    setStudentOptions([]);
    return;
  }

  const fetchStudentNames = async () => {
    const params = new URLSearchParams({
      department_id: departmentId,
      ...(year && { year }),
      ...(semester && { semester }),
    });

    const res = await fetch(
      `http://localhost:5000/admin/students/filter?${params.toString()}`,
      { headers: { "College-Id": collegeId } }
    );

    const data = await res.json();

    // only id + name for dropdown
    setStudentOptions(
      data.map(s => ({ id: s.id, name: s.name }))
    );
  };

  fetchStudentNames();
}, [departmentId, year, semester, showFilters]);

useEffect(() => {
  if (!appliedFilters) return;

  const refetch = async () => {
    setLoadingStudents(true);
    setStudentProfile(null);

    const params = new URLSearchParams({
      department_id: appliedFilters.departmentId,
      ...(appliedFilters.year && { year: appliedFilters.year }),
      ...(appliedFilters.semester && { semester: appliedFilters.semester }),
      ...(appliedFilters.selectedStudentId && {
        student_id: appliedFilters.selectedStudentId
      })
    });

    try {
      const res = await fetch(
        `http://localhost:5000/admin/students/filter?${params.toString()}`,
        { headers: { "College-Id": collegeId } }
      );

      const data = await res.json();

      if (appliedFilters.selectedStudentId) {
        setStudentProfile(data[0]);
        setStudents([]);
      } else {
        setStudents(data);
        setStudentProfile(null);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  refetch();
}, [appliedFilters, collegeId]);

const exportStudentsToCSV = () => {
  if (!students.length) return;

  const headers = [
    "Name",
    "Email",
    "Year",
    "Semester",
    "Chat Sessions",
    "Queries"
  ];

  const rows = students.map(s => [
    s.name,
    s.email,
    s.year ?? "",
    s.semester ?? "",
    s.sessions ?? 0,
    s.queries ?? 0
  ]);

  const csvContent = [
    headers.join(","),              // header row
    ...rows.map(r => r.join(","))   // data rows
  ].join("\n");

   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // ✅ clean file name
  let fileName = "students_data.csv";


  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
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
function ProfileField({ label, value, highlight }) {
  return (
    <div className="col-md-4">
      <small className="opacity-75">{label}</small>
      <div className={highlight ? "fw-bold fs-5" : "fw-semibold"}>
        {value ?? "—"}
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
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => {navigate("/admin");
  setDepartmentId("");
  setYear("");
  setSemester("");
  setStudents([]);
  setAppliedFilters(null);
  localStorage.removeItem("student_applied_filters");
}}
          >
            <FaArrowLeft /> Back
          </button>

          <div>
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FaUserGraduate />
              Student Management
            </h5>
            <small className="opacity-75">
              Manage students across the campus
            </small>
          </div>
        </div>
      </div>

      {/* ===== STUDENTS ANALYTICS ===== */}
      <div className="container mt-4">
        <div
          className="d-flex flex-wrap justify-content-between align-items-center px-3 px-md-4 py-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
          }}
        >
          <div className="text-center flex-fill">
            <div className="fw-bold fs-4">
              {studentStats?.total_students ?? "—"}
            </div>
            <small className="opacity-75">Total Students</small>
          </div>

          <div className="vr opacity-25"></div>

          <div className="text-center flex-fill">
            <div className="fw-bold fs-4">
              {studentStats?.total_sessions ?? "—"}
            </div>
            <small className="opacity-75">Chat Sessions</small>
          </div>

          <div className="vr opacity-25"></div>

          <div className="text-center flex-fill">
            <div className="fw-bold fs-4">
              {studentStats?.total_queries ?? "—"}
            </div>
            <small className="opacity-75">Queries Asked</small>
          </div>
        </div>
      </div>
{/* ===== FILTER BAR ===== */}
<div className="container mt-4">
  <div
    className="d-flex align-items-center gap-3 px-3 px-md-4 py-2"
    style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
      minHeight: "56px",
    }}
  >
    {/* FILTER ICON */}
    <FaFilter
      size={18}
      style={{ cursor: "pointer" }}
      title="Filter students"
      onClick={() => {
  setShowFilters(prev => {
    const next = !prev;
    if (next) fetchFilterMeta(); // 🔥 fetch ONLY when opening
    return next;
  });
}}

    />

    {/* CONTENT INSIDE SAME BAR */}
    {!showFilters ? (
  <span className="opacity-75 small">
    Filter students by department, year & semester
  </span>
) : (
  <div className="d-flex gap-2 flex-wrap w-100 align-items-center">

    {/* DEPARTMENT */}
    <select
      className="form-select form-select-sm"
      style={{ maxWidth: "250px", ...darkSelectStyle }}
      value={departmentId}
      onChange={e => setDepartmentId(e.target.value)}
    >
      <option value="" style={{ color: "#0f172a" }}>Department</option>
      {departments.map(d => (
        <option key={d.id} value={d.id} style={{ color: "#0f172a" }}>
          {d.name}
        </option>
      ))}
    </select>

    {/* YEAR */}
    <select
      className="form-select form-select-sm"
      style={{ maxWidth: "80px" , ...darkSelectStyle}}
      value={year}
      onChange={e => setYear(e.target.value)}
    >
      <option value="" style={{ color: "#0f172a" }}>Year</option>
      {Array.from({ length: settings?.total_years || 0 }, (_, i) => (
        <option key={i + 1} value={i + 1} style={{ color: "#0f172a" }}>
          {i + 1}
        </option>
      ))}
    </select>

    {/* SEMESTER */}
    <select
      className="form-select form-select-sm"
      style={{ maxWidth: "105px", ...darkSelectStyle }}
      value={semester}
      onChange={e => setSemester(e.target.value)}
    >
      <option value="" style={{ color: "#0f172a" }}>Semester</option>
      {Array.from({ length: settings?.total_semesters || 0 }, (_, i) => (
        <option key={i + 1} value={i + 1} style={{ color: "#0f172a" }}>
          {i + 1}
        </option>
      ))}
    </select>

    {/* STUDENT (shows ONLY after filters applied) */}
    
      <select
  disabled={!departmentId}
  className="form-select form-select-sm"
  style={{ maxWidth: "240px", ...darkSelectStyle }}
  value={selectedStudentId}
  onChange={e => setSelectedStudentId(e.target.value)}
>
        <option value="" style={{ color: "#0f172a" }}>Select Student</option>
        {studentOptions.map(s => (
  <option key={s.id} value={s.id} style={{ color: "#0f172a" }}>
    {s.name}
  </option>
))}

      </select>
    
  </div>
)}
<button
  className="btn btn-sm btn-outline-light"
  disabled={!departmentId}
  onClick={handleApplyFilters}
>
  Apply
</button>

{(departmentId || year || semester) && (
  <button
    className="btn btn-sm btn-outline-light"
    onClick={() => {
 setDepartmentId("");
  setYear("");
  setSemester("");
  setSelectedStudentId("");
  setSelectedInitial("");
  setStudents([]);
  setStudentOptions([]);
  setStudentProfile(null);
  setAppliedFilters(null);
  setShowFilters(false);

  localStorage.removeItem("student_applied_filters");
}}


  >
    Clear
  </button>
)}

  </div>
</div>
{studentProfile && (
  <div className="container mt-4">
    <div
      className="p-4"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "14px",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* ===== CARD HEADER ===== */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h6 className="fw-bold mb-0">Student Profile</h6>

        <FaTimes
          size={14}
          className="profile-close-icon"
          title="Remove student filter"
          onClick={() => {
            setSelectedStudentId("");
            setStudentProfile(null);
            // ❌ no auto fetch
          }}
        />
      </div>

      {/* ===== PROFILE GRID ===== */}
      <div className="row g-4">
        <ProfileField label="Name" value={studentProfile.name} />
        <ProfileField label="Email" value={studentProfile.email} />
        <ProfileField label="Year" value={studentProfile.year} />
        <ProfileField label="Semester" value={studentProfile.semester} />
        <ProfileField
          label="Chat Sessions"
          value={studentProfile.sessions}
          highlight
        />
        <ProfileField
          label="Queries Asked"
          value={studentProfile.queries}
          highlight
        />
      </div>
    </div>
  </div>
)}




<div className="container mt-4">
  
{students.length > 0 && !studentProfile && (
  <div className="container mt-4">
    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">

      {/* 🔤 NAME INITIAL FILTERS (LEFT) */}
      <div className="d-flex flex-wrap gap-2">
        {availableInitials.map(letter => (
          <span
            key={letter}
            onClick={() =>
              setSelectedInitial(prev =>
                prev === letter ? "" : letter
              )
            }
            className="px-2 py-1 rounded small fw-semibold"
            style={{
              cursor: "pointer",
              background:
                selectedInitial === letter
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#e5e7eb",
              userSelect: "none",
            }}
            title={`Filter names starting with ${letter}`}
          >
            {letter}
          </span>
        ))}

        {/* Clear initial */}
        {selectedInitial && (
          <span
            onClick={() => setSelectedInitial("")}
            className="px-2 py-1 rounded small opacity-75"
            style={{
              cursor: "pointer",
              border: "1px dashed rgba(255,255,255,0.3)",
            }}
            title="Clear name filter"
          >
            Clear
          </span>
        )}
      </div>

      {/* 📄 CSV EXPORT ICON (RIGHT) */}
      <FaFileCsv
        size={25}
        title="Export CSV"
        className="opacity-75"
        style={{ cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={e => (e.currentTarget.style.opacity = 0.75)}
        onClick={exportStudentsToCSV}
      />

    </div>
  </div>
)}



  {loadingStudents ? (
    <div className="text-center opacity-75">Loading students…</div>
  ) : studentProfile ? (
    null
  ) : students.length > 0 ? (
    <div className="admin-table-wrapper table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th className="text-center">Name</th>
            <th className="text-center">Email</th>
            <th className="text-center">Year</th>
            <th className="text-center">Semester</th>
            <th className="text-center">Chat Sessions</th>
            <th className="text-center">Queries</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(s => (
            <tr key={s.id}>
              <td className="text-center">{s.name}</td>
              <td className="text-center">{s.email}</td>
              <td className="text-center">{s.year ?? "—"}</td>
              <td className="text-center">{s.semester ?? "—"}</td>
              <td className="text-center">{s.sessions}</td>
              <td className="text-center">{s.queries}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : appliedFilters ? (
    <div className="text-center opacity-75">
      No students found for selected filters
    </div>
  ) : null}
</div>


      
    </div>
  );
}
