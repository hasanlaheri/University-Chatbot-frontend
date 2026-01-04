import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import LogoutButton from "../components/LogoutButton";
import {
  FaUniversity,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCog,
  FaFolderOpen
} from "react-icons/fa";



export default function DepartmentPage() {
  const navigate = useNavigate();
  const { depName } = useParams();
  const { state } = useLocation();
  const depCode = state?.depCode || "";
const [activeTab, setActiveTab] = useState(() => {
  return localStorage.getItem("dep_active_tab") || "users";
});


  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
const [filteredUsers, setFilteredUsers] = useState([]);
const [userSearch, setUserSearch] = useState("");
const [studentSearch, setStudentSearch] = useState("");
const [facultySearch, setFacultySearch] = useState("");

const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 6;
const indexOfLast = currentPage * usersPerPage;
const indexOfFirst = indexOfLast - usersPerPage;
const currentUsers = Array.isArray(filteredUsers)
  ? filteredUsers.slice(indexOfFirst, indexOfLast)
  : [];


const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

const students = users.filter(
  u => u.role === "user" || u.role === "student"
);


const faculty = users.filter(u => u.role === "faculty");

const studentsFiltered = students.filter(s =>
  s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
  s.email.toLowerCase().includes(studentSearch.toLowerCase())
);


const facultyFiltered = faculty.filter(f =>
  f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
  f.email.toLowerCase().includes(facultySearch.toLowerCase())
);

// Students Pagination
const [stuPage, setStuPage] = useState(1);
const studentsPerPage = 10;
const stuLast = stuPage * studentsPerPage;
const stuFirst = stuLast - studentsPerPage;

// Faculty Pagination
const [facPage, setFacPage] = useState(1);
const facultyPerPage = 10;
const facLast = facPage * facultyPerPage;
const facFirst = facLast - facultyPerPage;

// Paginated data
const currentStudents = studentsFiltered.slice(stuFirst, stuLast);
const currentFaculty = facultyFiltered.slice(facFirst, facLast);

const totalStuPages = Math.ceil(studentsFiltered.length / studentsPerPage);
const totalFacPages = Math.ceil(facultyFiltered.length / facultyPerPage);

const handleDeleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`http://localhost:5000/admin/user/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": localStorage.getItem("token"),
        "College-Id": localStorage.getItem("college_id") // 🔥 REQUIRED
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setUsers(prev => prev.filter(u => u.id !== id));
    } else alert(data.error || "Delete failed");
  } catch (err) {
    alert("Error deleting user");
  }
};


const [showCodePopup, setShowCodePopup] = useState(false);
const [currentCodeInput, setCurrentCodeInput] = useState("");
const [newCodeInput, setNewCodeInput] = useState("");
const [showAccessOptions, setShowAccessOptions] = useState(false);
const [showFacultyPopup, setShowFacultyPopup] = useState(false);
const [facultyEmails, setFacultyEmails] = useState("");
const [savingFaculty, setSavingFaculty] = useState(false);


  // Fetch stats for this department
useEffect(() => {
  const depNameClean = decodeURIComponent(depName);
  if (!depNameClean) return;

  fetch(`http://localhost:5000/admin/stats/${depNameClean}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token"),
      "College-Id": localStorage.getItem("college_id") // 🔥 REQUIRED
    }
  })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.log("Stats fetch error:", err));
}, [depName]);

useEffect(() => {
  localStorage.setItem("dep_active_tab", activeTab);
}, [activeTab]);


useEffect(() => {
  const depNameClean = decodeURIComponent(depName);
  if (!depNameClean) return;

  fetch(`http://localhost:5000/admin/users/${depNameClean}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token"),
      "College-Id": localStorage.getItem("college_id") // 🔥 REQUIRED
    }
  })
    .then(res => res.json())
    .then(data => {
      const safe = Array.isArray(data) ? data : [];
      setUsers(safe);
      setFilteredUsers(safe);
    })
    .catch(err => console.log("Users fetch error:", err));
}, [depName]);



useEffect(() => {
  const q = userSearch.toLowerCase();
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.role?.toLowerCase().includes(q)
  );
  setFilteredUsers(filtered);
  setCurrentPage(1);
}, [userSearch, users]);


useEffect(() => {
  const dropdown = document.getElementById("settingsDropdown");

  if (!dropdown) return;

  const hideMenu = () => setShowAccessOptions(false);

  dropdown.addEventListener("hidden.bs.dropdown", hideMenu);

  return () => {
    dropdown.removeEventListener("hidden.bs.dropdown", hideMenu);
  };
}, []);

  return (
  <div
  className="d-flex flex-column"
  style={{
    height: "100vh",
    overflow: "hidden",   // prevent body scroll
    background: "linear-gradient(135deg, #16222A, #3A6073)",
    color: "white",
  }}
>

      {/* HEADER */}
   <div
  className="d-flex justify-content-between align-items-center p-3 px-md-5 text-white"
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(6px)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  }}
>


        <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
  <FaUniversity color="#38bdf8" />
  Department Panel — {decodeURIComponent(depName)}
</h4>


        <div className="d-flex align-items-center gap-3">

  <button
    className="btn btn-warning btn-sm fw-bold"
    onClick={() => navigate("/admin")}
  >
    ← Back
  </button>

{/* ⚙ Settings Menu */}
<div className="dropdown" id="settingsDropdown">
  <button
    className="btn btn-link text-white p-0"
    data-bs-toggle="dropdown"
    style={{ fontSize: "24px" }}
  >
    <FaCog />
  </button>

  <ul className="dropdown-menu dropdown-menu-end shadow">

    {/* Manage Access */}
    <li>
      <button
        className="dropdown-item"
        onClick={(e) => {
          e.stopPropagation(); // Prevent closing
          setShowAccessOptions(!showAccessOptions);
        }}
      >
        Manage Access
      </button>
    </li>

    {/* ▼ Faculty + Student (Appears under Manage Access) */}
    {showAccessOptions && (
      <>
        <li>
          <button className="dropdown-item ps-4"
          onClick={() => setShowFacultyPopup(true)}>
            Faculty
          </button>
        </li>

      </>
    )}

    <li>
      <button
        className="dropdown-item"
        onClick={() => setShowCodePopup(true)}
      >
        Change Code
      </button>
    </li>

    <li><hr className="dropdown-divider" /></li>

    <li>
      <button
        className="dropdown-item text-danger"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </li>

  </ul>
</div>

</div>

      </div>
<div
  style={{
    overflowY: "auto",
    flexGrow: 1,
    paddingBottom: "40px",
  }}
>
{/* ==== STATS ROW (CONDITIONAL CARDS) ==== */}
{stats && (
  <div className="container mt-4">
    <div className="row g-4">

      {/* TOTAL USERS */}
      <div className="col-md-3 col-6">
        <div className="admin-card p-3 shadow">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small style={{ color: "#cbd5e1" }}>Total Users</small>
              <h3 className="fw-bold mb-0" style={{ color: "#f8fafc" }}>
                {stats.total_users}
              </h3>
            </div>
            <FaUsers size={26} color="#22d3ee" />
          </div>
        </div>
      </div>

      {/* STUDENTS */}
      {!["Sports", "Scholarship", "Training and Placement", "Administration"].includes(
        decodeURIComponent(depName)
      ) && (
        <div className="col-md-3 col-6">
          <div className="admin-card p-3 shadow">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small style={{ color: "#cbd5e1" }}>Students</small>
                <h3 className="fw-bold mb-0" style={{ color: "#f8fafc" }}>
                  {stats.students}
                </h3>
              </div>
              <FaUserGraduate size={26} color="#22d3ee" />
            </div>
          </div>
        </div>
      )}

      {/* FACULTY */}
      <div className="col-md-3 col-6">
        <div className="admin-card p-3 shadow">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small style={{ color: "#cbd5e1" }}>Faculty</small>
              <h3 className="fw-bold mb-0" style={{ color: "#f8fafc" }}>
                {stats.faculty}
              </h3>
            </div>
            <FaChalkboardTeacher size={26} color="#22d3ee" />
          </div>
        </div>
      </div>

      {/* UPLOADS */}
      <div className="col-md-3 col-6">
        <div className="admin-card p-3 shadow">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small style={{ color: "#cbd5e1" }}>Uploads</small>
              <h3 className="fw-bold mb-0" style={{ color: "#f8fafc" }}>
                {stats.uploads}
              </h3>
            </div>
            <FaFolderOpen size={26} color="#a5b4fc" />
          </div>
        </div>
      </div>

    </div>
  </div>
)}
{/* ==== TABS ==== */}
<div className="container mt-5">
  <div className="d-flex gap-3 mb-4">

    <button
      className={`btn ${activeTab === "users" ? "btn-info" : "btn-outline-light"}`}
      onClick={() => setActiveTab("users")}
    >
      <FaUsers /> Users
    </button>

    {!["Sports", "Scholarship", "Training and Placement", "Administration"]
      .includes(decodeURIComponent(depName)) && (
      <button
        className={`btn ${activeTab === "students" ? "btn-info" : "btn-outline-light"}`}
        onClick={() => setActiveTab("students")}
      >
        <FaUserGraduate /> Students
      </button>
    )}

    <button
      className={`btn ${activeTab === "faculty" ? "btn-info" : "btn-outline-light"}`}
      onClick={() => setActiveTab("faculty")}
    >
      <FaChalkboardTeacher /> Faculty
    </button>

  </div>
</div>

{/* USERS SECTION */}
{activeTab === "users" && (
  <div className="mt-3 px-2 px-md-4">




  {/* SEARCH BAR */}
  <div className="d-flex mb-3">
  <input
  type="text"
  className="form-control admin-search"
  placeholder="🔍 Search users"
  value={userSearch}
  onChange={(e) => setUserSearch(e.target.value)}
/>

  </div>

  {/* TABLE */}
{/* TABLE */}
<div className="admin-table-wrapper table-responsive">

  <table className="admin-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Created</th>
        <th className="admin-action">Action</th>
      </tr>
    </thead>

    <tbody>
      {currentUsers.length > 0 ? (
        currentUsers.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <span className="admin-badge">
  {u.role === "user"
    ? "student"
    : u.role}
</span>
            </td>
            <td>{u.created_at?.slice(0, 19)}</td>
            <td className="admin-action">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteUser(u.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-center text-muted py-3">
            No users found
          </td>
        </tr>
      )}
    </tbody>
  </table>

</div>



  {/* PAGINATION */}
  {totalPages > 1 && (
    <div className="d-flex justify-content-center mt-4">
      <button
        className="btn btn-light btn-sm mx-2"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        ◀ Prev
      </button>

      <span className="px-3 py-1">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="btn btn-light btn-sm mx-2"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => p + 1)}
      >
        Next ▶
      </button>
    </div>
  )}

</div>
)}
{/* ================= STUDENTS SECTION ================= */}
{activeTab === "students" &&
 !["Sports", "Scholarship", "Training and Placement", "Administration"]
   .includes(decodeURIComponent(depName)) && (

  <div className="mt-3 px-2 px-md-4">

    {/* SEARCH */}
    <div className="d-flex mb-3">
      <input
        type="text"
        className="form-control admin-search"
        placeholder="🔍 Search students"
        value={studentSearch}
        onChange={(e) => {
          setStudentSearch(e.target.value);
          setStuPage(1);
        }}
      />
    </div>

    {/* TABLE */}
    <div className="admin-table-wrapper table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Year</th>
            <th>Semester</th>
          </tr>
        </thead>

        <tbody>
          {currentStudents.length > 0 ? (
            currentStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.contact}</td>
                <td>{s.year}</td>
                <td>{s.semester}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted py-3">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* PAGINATION */}
    {totalStuPages > 1 && (
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-light btn-sm mx-2"
          disabled={stuPage === 1}
          onClick={() => setStuPage(stuPage - 1)}
        >
          ◀ Prev
        </button>

        <span className="px-3 py-1">
          Page {stuPage} of {totalStuPages}
        </span>

        <button
          className="btn btn-light btn-sm mx-2"
          disabled={stuPage === totalStuPages}
          onClick={() => setStuPage(stuPage + 1)}
        >
          Next ▶
        </button>
      </div>
    )}

  </div>
)}
{/* ================= FACULTY SECTION ================= */}
{activeTab === "faculty" && (

  <div className="mt-3 px-2 px-md-4">

    {/* SEARCH */}
    <div className="d-flex mb-3">
      <input
        type="text"
        className="form-control admin-search"
        placeholder="🔍 Search faculty"
        value={facultySearch}
        onChange={(e) => {
          setFacultySearch(e.target.value);
          setFacPage(1);
        }}
      />
    </div>

    {/* TABLE */}
    <div className="admin-table-wrapper table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Department</th>
          </tr>
        </thead>

        <tbody>
          {currentFaculty.length > 0 ? (
            currentFaculty.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.contact}</td>
                <td>{f.department}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted py-3">
                No faculty found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* PAGINATION */}
    {totalFacPages > 1 && (
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-light btn-sm mx-2"
          disabled={facPage === 1}
          onClick={() => setFacPage(facPage - 1)}
        >
          ◀ Prev
        </button>

        <span className="px-3 py-1">
          Page {facPage} of {totalFacPages}
        </span>

        <button
          className="btn btn-light btn-sm mx-2"
          disabled={facPage === totalFacPages}
          onClick={() => setFacPage(facPage + 1)}
        >
          Next ▶
        </button>
      </div>
    )}

  </div>
)}


</div>
{showCodePopup && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}
  >
    <div
      className="p-4 rounded"
      style={{
        width: "350px",
        background: "white",
        color: "black",
        borderRadius: "10px",
      }}
    >
      <h5 className="fw-bold mb-3">Change Department Code</h5>

      <label className="fw-semibold">Current Code</label>
      <input
        type="text"
        className="form-control mb-2"
        value={currentCodeInput}
        onChange={(e) => setCurrentCodeInput(e.target.value)}
      />

      <label className="fw-semibold mt-2">New Code</label>
      <input
        type="text"
        className="form-control mb-3"
        value={newCodeInput}
        onChange={(e) => setNewCodeInput(e.target.value)}
      />

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setShowCodePopup(false)}
        >
          Cancel
        </button>

        {/* 🔥🔥 SAVE BUTTON WITH YOUR FETCH CALL HERE 🔥🔥 */}
<button
  className="btn btn-primary"
  onClick={async () => {
    const res = await fetch("http://localhost:5000/admin/change-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "College-Id": localStorage.getItem("college_id") // 🔥 REQUIRED
      },
      body: JSON.stringify({
        depCode,
        current_code: currentCodeInput,
        new_code: newCodeInput,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Department code updated successfully!");
      setShowCodePopup(false);
      window.location.reload();
    } else alert(data.error || "Error updating code");
  }}
>
  Save
</button>

      </div>
    </div>
  </div>
)}

{showFacultyPopup && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ background: "rgba(0,0,0,0.6)", zIndex: 99999 }}
  >
    <div
      className="p-4 rounded shadow"
      style={{
        width: "420px",
        background: "white",
        color: "black",
        borderRadius: "12px",
      }}
    >
      <h5 className="fw-bold mb-3">Grant Faculty Access</h5>

      <label className="fw-semibold">Faculty Emails</label>
      <textarea
        className="form-control mb-3"
        rows="4"
        placeholder="Enter emails separated by commas..."
        value={facultyEmails}
        onChange={(e) => setFacultyEmails(e.target.value)}
        style={{
          borderRadius: "8px",
          resize: "none",
          fontSize: "15px",
        }}
      />

      <small className="text-muted d-block mb-3">
        <b>Note:</b> Mention the email IDs of the faculty to grant them access.<br />
        Separate each email by a comma <b>,</b>
      </small>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-secondary"
          onClick={() => setShowFacultyPopup(false)}
        >
          Cancel
        </button>

        <button
  className="btn btn-success"
  disabled={savingFaculty}
  onClick={async () => {
    if (!facultyEmails.trim()) return;

    const emailList = facultyEmails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emailList.length === 0) return;

    setSavingFaculty(true); // show spinner

 await fetch("http://localhost:5000/admin/authorize/faculty", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "College-Id": localStorage.getItem("college_id"), // 🔥 REQUIRED
  },
  body: JSON.stringify({ emails: emailList }),
});


    // wait 1 second for spinner animation
    setTimeout(() => {
      setSavingFaculty(false);
      setShowFacultyPopup(false);
      setFacultyEmails("");
    }, 1000);
  }}
>
  {savingFaculty ? (
    <div className="spinner-border spinner-border-sm text-light"></div>
  ) : (
    "✔"
  )}
</button>

      </div>
    </div>
  </div>
)}

    </div>
  );
}
