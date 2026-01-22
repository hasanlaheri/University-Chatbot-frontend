import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaPlusCircle,
  FaChartBar,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaEye,
  FaTrashAlt,
  FaTimes ,
  FaCheck,
  FaFilter,
  FaSyncAlt,
  FaLock ,
  FaFolderOpen,
  FaEyeSlash 
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import PasswordEye from "../components/PasswordEye";
import "../styles/faculty.css";

function FacultyDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [uploads, setUploads] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
 const [showFilter, setShowFilter] = useState(false);
const [stats, setStats] = useState({
  total: 0,
  categories: {}
});
const [updatingVisibilityIds, setUpdatingVisibilityIds] = useState(new Set());


// college settings
const [settings, setSettings] = useState(null);
// Draft (UI) filters
const [draftYear, setDraftYear] = useState("");
const [draftSem, setDraftSem] = useState("");
const [draftCategory, setDraftCategory] = useState("");
const [draftSubject, setDraftSubject] = useState("");
const [facultySubjects, setFacultySubjects] = useState([]);
const [draftSearch, setDraftSearch] = useState("");
const [confirmDeleteId, setConfirmDeleteId] = useState(null);
const [deletingIds, setDeletingIds] = useState(new Set());
const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const resetPasswordForm = () => {
  setPasswordForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  setPasswordError("");
};

// Applied filters (API depends on these)
const [appliedFilters, setAppliedFilters] = useState(null);

useEffect(() => {
  if (!appliedFilters) return;

  const delay = setTimeout(() => {
    setAppliedFilters(prev => ({
      ...prev,
      search: draftSearch
    }));
  }, 400); // debounce

  return () => clearTimeout(delay);
}, [draftSearch]);

useEffect(() => {
  async function loadStats() {
    try {
      const res = await fetch(
        "http://localhost:5000/faculty/uploads/stats",
        {
          headers: { Authorization: localStorage.getItem("token") }
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats load failed", err);
    }
  }

  loadStats();
}, []);

useEffect(() => {
  if (!draftYear || !draftSem) {
    setFacultySubjects([]);
    return;
  }

  fetch(
    `http://localhost:5000/faculty/uploads/subjects?year=${draftYear}&semester=${draftSem}`,
    {
      headers: { Authorization: localStorage.getItem("token") }
    }
  )
    .then(res => res.json())
    .then(data => {
      setFacultySubjects(data || []);
    })
    .catch(err => {
      console.error("Failed to load subjects", err);
      setFacultySubjects([]);
    });

}, [draftYear, draftSem]);

  
const location = useLocation();

useEffect(() => {
  if (location.state?.uploadResult === "success") {
    toast.success("Upload successful ✅");
  }

  if (location.state?.uploadResult === "partial") {
    toast.warning(
      "Uploaded partially ⚠️"
    );
  }
}, [location.state]);
useEffect(() => {
  const collegeId = localStorage.getItem("college_id");
  if (!collegeId) return;

  fetch(`http://localhost:5000/college/settings/${collegeId}`)
    .then(res => res.json())
    .then(data => setSettings(data))
    .catch(err => console.error("Settings load failed", err));
}, []);


useEffect(() => {
  // 🚫 Do nothing until filters are applied
  if (!appliedFilters) return;

  async function load() {
    try {
      const params = new URLSearchParams();

      if (appliedFilters.year) params.append("year", appliedFilters.year);
      if (appliedFilters.semester) params.append("semester", appliedFilters.semester);
      if (appliedFilters.category) params.append("category", appliedFilters.category);
      if (appliedFilters.search) params.append("search", appliedFilters.search);
      if (appliedFilters.subject) params.append("subject", appliedFilters.subject);

      const res = await fetch(
        `http://localhost:5000/faculty/uploads?${params.toString()}`,
        {
          headers: { Authorization: localStorage.getItem("token") }
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      const data = await res.json();
      setUploads(data);
    } catch (err) {
      console.error("Failed to load uploads", err);
    }
  }

  load();
}, [appliedFilters]);

const toggleVisibility = async (upload) => {
  const newVisibility =
    upload.visibility === "public" ? "private" : "public";

  // ➕ add this id to loading set
  setUpdatingVisibilityIds(prev => new Set(prev).add(upload.id));

  try {
    const res = await fetch(
      `http://localhost:5000/faculty/upload/${upload.id}/visibility`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ visibility: newVisibility }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    // ✅ update UI
    setUploads(prev =>
      prev.map(u =>
        u.id === upload.id ? { ...u, visibility: newVisibility } : u
      )
    );

    toast.success(`Set to ${newVisibility}`);
  } catch (err) {
    console.error(err);
    toast.error("Failed to update visibility");
  } finally {
    // ➖ remove this id from loading set
    setUpdatingVisibilityIds(prev => {
      const copy = new Set(prev);
      copy.delete(upload.id);
      return copy;
    });
  }
};



const handleChangePassword = async () => {
  setPasswordError("");

  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  // 🔐 Inline validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("All fields are required");
    return;
  }

  if (newPassword.length < 6) {
    setPasswordError("New password must be at least 6 characters");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("Confirm password does not match");
    return;
  }

  try {
    setChangingPassword(true);

    const res = await fetch(
      "http://localhost:5000/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.error || "Current password is incorrect");
      return;
    }

    // ✅ SUCCESS
    toast.success("Password changed successfully 🔐");

    setShowChangePassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  } catch (err) {
    console.error(err);
    setPasswordError("Server error. Try again later.");
  } finally {
    setChangingPassword(false);
  }
};


const [searchParams] = useSearchParams();

useEffect(() => {
  const year = searchParams.get("year");
  const semester = searchParams.get("semester");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  if (year || semester || category || search) {
    setAppliedFilters({
      year: year || "",
      semester: semester || "",
      category: category || "",
      search: search || ""
    });
  }
}, []);

const [showChangePassword, setShowChangePassword] = useState(false);

const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const [passwordError, setPasswordError] = useState("");
const [changingPassword, setChangingPassword] = useState(false);


const viewFile = async (id) => {
  const token = localStorage.getItem("token");

 const res = await fetch(`http://localhost:5000/faculty/file/${id}`, {
  headers: { Authorization: localStorage.getItem("token") }
});

if (res.status === 401) {
  alert("⚠ Your account has been deleted. Logging out...");
  localStorage.clear();
  setTimeout(() => navigate("/"), 800);
  return;
}


  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 1500);
  };
async function handleDelete(id) {
  // ➕ add id to deleting set
  setDeletingIds(prev => new Set(prev).add(id));

  try {
    const res = await fetch(
      `http://localhost:5000/faculty/upload/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") }
      }
    );

    if (res.status === 401) {
      alert("⚠ Your account has been deleted. Logging out...");
      localStorage.clear();
      navigate("/");
      return;
    }

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    // ✅ remove row from UI
    setUploads(prev => prev.filter(u => u.id !== id));

  } catch (err) {
    console.error(err);
    alert("Failed to delete file");
  } finally {
    // ➖ remove id from deleting set
    setDeletingIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });

    setConfirmDeleteId(null);
  }
}



  return (
  <div
    className="min-vh-100 d-flex flex-column align-items-center py-4 px-2"
    style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#f8fafc" }} // Matches Chat Snow Background
  >
    <ToastContainer position="top-right" autoClose={3000} />

    {/* TOP BAR */}
    <div className="max-width-container w-100 px-4 mb-4 d-flex justify-content-between align-items-center" style={{ maxWidth: "1200px" }}>
      <div className="d-flex align-items-center gap-3">
        <div className="dropdown">
          <button
            className="btn btn-link p-0 border-0 transition-all hover-scale"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
          >
            <FaUserCircle size={42} className="text-primary shadow-sm rounded-circle" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
            <li className="px-3 py-2 border-bottom">
                <small className="text-muted d-block">Signed in as</small>
                <span className="fw-bold text-dark">{user.email}</span>
            </li>
            <li>
              <button className="dropdown-item py-2 d-flex align-items-center mt-1" onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}/profile`)}>
                <FaUser className="me-2 text-primary" /> Profile
              </button>
            </li>
            <li>
              <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => { setShowChangePassword(true); setPasswordError(""); }}>
                <FaLock className="me-2 text-primary" /> Change Password
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={handleLogout} disabled={isLoggingOut}>
                <FaSignOutAlt className="me-2" /> {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </div>
        <div>
            <h4 className="fw-bold text-slate-900 mb-0">Faculty Dashboard</h4>
            <span className="badge bg-blue-soft text-primary fw-normal">Academic Management</span>
        </div>
      </div>
    </div>

    {/* STATS SECTION */}
    <div className="max-width-container w-100 px-4" style={{ maxWidth: "1200px" }}>
      <div className="row g-3 justify-content-start">
        {/* Create New Card - Special Action Color */}
        <div className="col-12 col-md-6 col-lg-3">
          <div 
            className="card h-100 shadow-sm border-0 action-card" 
            onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}/upload-new`)}
          >
            <div className="card-body d-flex flex-column align-items-center text-center justify-content-center p-4">
              <div className="icon-box-primary mb-3">
                <FaPlusCircle size={28} />
              </div>
              <h6 className="fw-bold text-white mb-1">Create New Upload</h6>
              <p className="text-white-50 x-small mb-0">Study material or notice</p>
            </div>
          </div>
        </div>

        {/* Total Uploads */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0 stat-card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <FaChartBar size={24} className="text-primary" />
                <span className="text-muted small fw-medium">All Time</span>
              </div>
              <h3 className="fw-bold text-slate-900 mb-0">{stats.total}</h3>
              <p className="text-muted small mb-0">Total Documents</p>
            </div>
          </div>
        </div>

        {/* Dynamic Categories */}
        {Object.entries(stats.categories || {}).map(([cat, count]) => (
          <div key={cat} className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 stat-card">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FaFileAlt size={24} className="text-slate-400" />
                  <span className="badge bg-light text-dark fw-normal border">{cat}</span>
                </div>
                <h3 className="fw-bold text-slate-900 mb-0">{count}</h3>
                <p className="text-muted small mb-0">Files Uploaded</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* MAIN CONTENT AREA */}
    <div className="max-width-container w-100 px-4 mt-5" style={{ maxWidth: "1200px" }}>
      <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
        
        {/* List Header/Toolbar */}
        <div className="p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold text-slate-900 mb-1">Your Uploaded Materials</h5>
            <p className="text-muted small mb-0">Manage and monitor student access to your files.</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm rounded-pill border px-2 bg-light">
              <span className="input-group-text bg-transparent border-0"><FaFilter className="text-muted" size={12} /></span>
              <input
                type="text"
                className="form-control bg-transparent border-0 shadow-none py-2"
                style={{ width: "200px" }}
                placeholder="Search by filename..."
                value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
              />
            </div>
            <button
              className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center position-relative ${appliedFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ width: "38px", height: "38px" }}
              onClick={() => setShowFilter(true)}
            >
              <FaFilter size={14} />
              {appliedFilters && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>}
            </button>
          </div>
        </div>

        {/* Data List */}
        <div className="p-0">
          {!appliedFilters ? (
            <div className="text-center py-5">
              <div className="mb-3 opacity-25"><FaFolderOpen size={60} /></div>
              <h6 className="text-dark fw-bold">Ready to view your data?</h6>
              <p className="text-muted small px-4">Please apply filters to load your uploaded materials.</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-5">
               <p className="text-muted small mb-0">No files found matching your criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <div className="list-group list-group-flush">
                {uploads.map(item => (
                  <div key={item.id} className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-start-0 border-end-0">
                    <div className="d-flex align-items-center gap-3">
                      <div className="file-icon-wrapper">
                        <FaFileAlt className="text-primary" size={20} />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-slate-900">{item.filename}</h6>
                        <div className="d-flex align-items-center gap-2 text-muted x-small">
                          <span className="fw-medium text-primary">{item.category}</span>
                          <span>•</span>
                          <span>{item.uploaded_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-4">
                      {/* Visibility Control */}
                      <div className="visibility-toggle">
                        {updatingVisibilityIds.has(item.id) ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : (
                          <div 
                            className={`badge rounded-pill cursor-pointer d-flex align-items-center gap-2 py-2 px-3 transition-all ${item.visibility === "public" ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}
                            onClick={() => toggleVisibility(item)}
                          >
                             {item.visibility === "public" ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                             <span style={{ fontSize: '11px', textTransform: 'capitalize' }}>{item.visibility}</span>
                             <FaSyncAlt size={10} className="opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div className="d-flex align-items-center gap-3">
                        <button className="btn-icon text-primary" onClick={() => viewFile(item.id)} title="View File">
                          <FaEye size={18} />
                        </button>
                        
                        {deletingIds.has(item.id) ? (
  // 🔥 ALWAYS show spinner if deleting
  <div className="spinner-border spinner-border-sm text-danger" />
) : confirmDeleteId === item.id ? (
  // 🟡 Confirmation UI
  <div className="d-flex align-items-center gap-2 animate-fade-in">
    <span className="text-muted small fw-semibold">
      Are you sure?
    </span>

    <FaCheck
      className="text-success cursor-pointer"
      title="Confirm delete"
      onClick={() => handleDelete(item.id)}
    />

    <FaTimes
      className="text-secondary cursor-pointer"
      title="Cancel"
      onClick={() => setConfirmDeleteId(null)}
    />
  </div>
) : (
  // 🔴 Default delete icon
  <button
    className="btn-icon text-danger"
    onClick={() => setConfirmDeleteId(item.id)}
  >
    <FaTrashAlt size={16} />
  </button>
)}


                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
{showFilter && (
  <>
    {/* Backdrop with Blur */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100 fadeIn"
      style={{ 
        background: "rgba(15, 23, 42, 0.4)", 
        backdropFilter: "blur(4px)",
        zIndex: 9998 
      }}
      onClick={() => setShowFilter(false)}
    />

    {/* Drawer */}
    <div
      className="position-fixed top-0 end-0 h-100 bg-white shadow-2xl d-flex flex-column slideInRight"
      style={{ width: "340px", zIndex: 9999, borderLeft: "1px solid #e2e8f0" }}
    >
      {/* Header */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
        <div>
          <h5 className="fw-bold text-slate-900 mb-0">Filters</h5>
          <span className="text-slate-500 x-small">Refine your search results</span>
        </div>
        <button 
          className="btn-close shadow-none" 
          onClick={() => setShowFilter(false)} 
        />
      </div>

      {/* Scrollable Body */}
      <div className="p-4 flex-grow-1 overflow-auto">
        
        {/* YEAR SECTION */}
        <div className="mb-4">
          <label className="fw-bold text-slate-700 small mb-2 d-block">Academic Year</label>
          <div className="d-flex flex-wrap gap-2">
            
            {settings && Array.from({ length: settings.total_years }, (_, i) => (
              <button 
                key={i + 1}
                className={`filter-pill ${draftYear == i + 1 ? 'active' : ''}`}
                onClick={() => {setDraftYear(i + 1); setDraftSem("");}}
              >
                {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} Year
              </button>
            ))}
          </div>
        </div>

       {/* SEMESTER SECTION (Pill Version) */}
<div className={`mb-4 ${!draftYear ?  'pointer-events-none' : ''}`}>
  <label className="fw-bold text-slate-700 small mb-2 d-block">Semester</label>
  <div className="d-flex gap-2">
    {draftYear ? (
      [draftYear * 2 - 1, draftYear * 2].map(sem => (
        <button
          key={sem}
          type="button"
          className={`filter-pill flex-fill ${draftSem == sem ? 'active' : ''}`}
          onClick={() => setDraftSem(draftSem == sem ? "" : sem)}
        >
          Sem {sem}
        </button>
      ))
    ) : (
      <span className="text-muted x-small">Please select a year first</span>
    )}
  </div>
</div>
<div className={`mb-4 ${(!draftYear || !draftSem) ? 'pointer-events-none' : ''}`}>
  <label className="fw-bold text-slate-700 small mb-2 d-block">Filter by Subject</label>
  <div className="d-flex flex-wrap gap-2">
    {facultySubjects.length > 0 ? (
      <>
       
        {facultySubjects.map((sub, idx) => (
          <button 
            key={idx}
            className={`filter-pill ${draftSubject === sub ? 'active' : ''}`}
            onClick={() => setDraftSubject(sub)}
          >
            {sub}
          </button>
        ))}
      </>
    ) : (
      <span className="text-muted x-small">Select a year and semester to unlock subjects.</span>
    )}
  </div>
  {facultySubjects.length == 0 && (
    <span className="text-primary x-small mt-1 d-block">No subjects found</span>
  )}
</div>

        {/* CATEGORY SECTION */}
        <div className="mb-4">
          <label className="fw-bold text-slate-700 small mb-2 d-block">Document Category</label>
          <div className="d-grid gap-2">
           {Object.keys(stats.categories || {}).map(cat => (
              <div 
                key={cat}
                className={`category-item p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer ${draftCategory === cat ? 'border-primary bg-primary-soft' : 'border-slate-100'}`}
                onClick={() => setDraftCategory(draftCategory === cat ? "" : cat)}
              >
                <span className={`small fw-medium ${draftCategory === cat ? 'text-primary' : 'text-slate-600'}`}>{cat}</span>
                {draftCategory === cat && <FaCheck size={12} className="text-primary" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-top bg-light">
        <div className="d-flex gap-3">
          <button
            className="btn btn-link text-slate-500 text-decoration-none fw-semibold w-50"
            onClick={() => {
              navigate("");
              setDraftYear("");
              setDraftSem("");
              setDraftCategory("");
              setAppliedFilters(null);
              setUploads([]);
              setShowFilter(false);
            }}
          >
            Reset All
          </button>
          <button
            className="btn btn-primary rounded-3 w-50 fw-bold shadow-sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (draftYear) params.set("year", draftYear);
              if (draftSem) params.set("semester", draftSem);
              if (draftCategory) params.set("category", draftCategory);
              if (draftSubject) params.set("subject", draftSubject);
              navigate(`?${params.toString()}`);
              setAppliedFilters({ year: draftYear, semester: draftSem, category: draftCategory, subject: draftSubject });
              setShowFilter(false);
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </>
)}



      {/* logout overlay */}
      {isLoggingOut && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{
            background: "linear-gradient(135deg, #16222A, #3A6073)",
            color: "white",
            zIndex: 9999,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <div
            className="spinner-border text-light mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          ></div>
          <h5 className="fw-bold">Logging you out...</h5>
        </div>
      )}
      {showChangePassword && (
  <>
    {/* BACKDROP */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 9998 }}
      onClick={() => setShowChangePassword(false)}
    />

    {/* MODAL */}
    <div
      className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow p-4"
      style={{ width: "360px", zIndex: 9999 }}
      onClick={e => e.stopPropagation()}
    >
<label className="form-label small">Current Password</label>
<div style={{ position: "relative" }}>
  <input
    type={showCurrent ? "text" : "password"}
    className="form-control"
    value={passwordForm.currentPassword}
    onChange={e =>
      setPasswordForm({
        ...passwordForm,
        currentPassword: e.target.value
      })
    }
  />

  <PasswordEye
    visible={showCurrent}
    onToggle={() => setShowCurrent(prev => !prev)}
  />
</div>


<label className="form-label small mt-2">New Password</label>
<div style={{ position: "relative" }}>
  <input
    type={showNew ? "text" : "password"}
    className="form-control"
    value={passwordForm.newPassword}
    onChange={e =>
      setPasswordForm({
        ...passwordForm,
        newPassword: e.target.value
      })
    }
  />

  <PasswordEye
    visible={showNew}
    onToggle={() => setShowNew(prev => !prev)}
  />
</div>


<label className="form-label small mt-2">Confirm New Password</label>
<div style={{ position: "relative" }}>
  <input
    type={showConfirm ? "text" : "password"}
    className="form-control"
    value={passwordForm.confirmPassword}
    onChange={e =>
      setPasswordForm({
        ...passwordForm,
        confirmPassword: e.target.value
      })
    }
  />

  <PasswordEye
    visible={showConfirm}
    onToggle={() => setShowConfirm(prev => !prev)}
  />
</div>



      {passwordError && (
        <div className="text-danger small mb-2">{passwordError}</div>
      )}

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-primary w-50"
          disabled={changingPassword}
          onClick={handleChangePassword}
        >
          {changingPassword ? "Updating..." : "Update"}
        </button>

        <button
  className="btn btn-secondary w-50"
  onClick={() => {
    setShowChangePassword(false);
    resetPasswordForm();
  }}
>
  Cancel
</button>

      </div>
    </div>
  </>
)}

    </div>
  );
}

export default FacultyDashboard;
