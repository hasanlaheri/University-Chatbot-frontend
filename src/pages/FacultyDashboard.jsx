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
  FaSyncAlt  
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import PasswordEye from "../components/PasswordEye";


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
      className="min-vh-100 bg-light d-flex flex-column align-items-center py-4 px-2"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {/* TOP BAR */}
      <div className="d-flex justify-content-between align-items-center w-100 px-3 mb-4 position-relative">
        <div className="dropdown">
          <button
            className="btn btn-link text-decoration-none p-0"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <FaUserCircle size={40} className="text-primary" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li>
              <button
                className="dropdown-item d-flex align-items-center"
                onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}/profile`)}
              >
                <FaUser className="me-2 text-primary" /> Profile
              </button>
            </li>
            <li>
  <button
    className="dropdown-item d-flex align-items-center"
    onClick={() => {
      setShowChangePassword(true);
      setPasswordError("");
    }}
  >
    🔒 Change Password
  </button>
</li>

            <li>
              <button
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <FaSignOutAlt className="me-2" />{" "}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </div>

        <h4 className="fw-bold text-primary mb-0">Faculty Dashboard</h4>
      </div>

      {/* CARDS */}
      <div className="d-flex flex-wrap justify-content-center gap-3 w-100 px-3">
  


        {/* create new */}
        <div
          className="card shadow-sm text-center border-0"
          style={{
            width: "280px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #007bff, #0056b3)",
            color: "white",
          }}
        >
          <div className="card-body">
            <FaPlusCircle size={35} className="mb-2" />
            <h5 className="fw-semibold">Create New Upload</h5>
            <p className="small text-white-50">
              Add new study material or notice
            </p>
            <button
              className="btn btn-light btn-sm fw-semibold mt-2"
              onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}/upload-new`)}
            >
              Upload Now
            </button>
          </div>
        </div>

        {/* total */}
        <div
          className="card shadow-sm text-center border-0"
          style={{ width: "280px", borderRadius: "12px", background: "white" }}
        >
          <div className="card-body">
            <FaChartBar size={35} className="text-primary mb-2" />
            <h5 className="fw-semibold text-dark">Total Uploads</h5>
            <p className="small text-muted mb-0">
             <div className="display-6 fw-bold text-dark">
  {stats.total}
</div>


            </p>
          </div>
        </div>
      {Object.entries(stats.categories || {}).map(([cat, count]) => (
  <div
    key={cat}
    className="card shadow-sm text-center border-0"
    style={{ width: "280px", borderRadius: "12px", background: "white" }}
  >
    <div className="card-body">
      <FaFileAlt size={35} className="text-primary mb-2" />
      <h5 className="fw-semibold text-dark">{cat}</h5>
      <p className="small text-muted mb-0">
       <div className="display-6 fw-bold text-dark">
  {count}
</div>

      </p>
    </div>
  </div>
))}
    
      </div>

      {/* list */}
      <div className="w-100 px-3 mt-4">
     <div className="d-flex justify-content-between align-items-center w-100 px-3 mt-4 mb-2">
  <h5 className="fw-bold text-dark mb-0">Your Uploads</h5>

  <div className="d-flex align-items-center gap-2">
   <input
  type="text"
  className="form-control form-control-sm"
  style={{ width: "180px" }}
  placeholder="Search file..."
  value={draftSearch}
  onChange={e => setDraftSearch(e.target.value)}
/>


   <button
  className="btn btn-outline-secondary btn-sm position-relative d-flex align-items-center justify-content-center"
  title="Filter uploads"
  onClick={() => setShowFilter(true)}
  style={{ width: "36px", height: "36px" }}
>
  <FaFilter />

  {appliedFilters && (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
      style={{ fontSize: "10px" }}
    >
      •
    </span>
  )}
</button>

  </div>
</div>




{!appliedFilters ? (
  <div className="text-center text-muted py-5">
    <FaFileAlt size={40} className="mb-2" />
    <p className="mb-1 fw-semibold">No data to display</p>
    <small>Apply filters to view uploaded materials</small>
  </div>
) : uploads.length === 0 ? (
  <p className="text-muted text-center">No uploads found.</p>
) : (
  <div className="list-group shadow-sm">
    {uploads.map(item => (
      <div
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center gap-2">
          <FaFileAlt className="text-primary" />
          <div>
            <h6 className="mb-0 fw-semibold">{item.filename}</h6>
            <small className="text-muted">
              {item.category} • Uploaded on {item.uploaded_at}
            </small>
          </div>
        </div>

<div className="d-flex align-items-center gap-3">
  {/* VISIBILITY TOGGLE */}

<div className="d-flex align-items-center gap-2">
  {updatingVisibilityIds.has(item.id) ? (
    <div
      className="spinner-border spinner-border-sm text-primary"
      role="status"
    />
  ) : (
    <span
      className={`small fw-semibold d-flex align-items-center gap-1 ${
        item.visibility === "public" ? "text-success" : "text-danger"
      }`}
      style={{ cursor: "pointer" }}
      title="Toggle visibility"
      onClick={() => toggleVisibility(item)}
    >
      {item.visibility === "public" ? "Public" : "Private"}
      <FaSyncAlt size={14} />
    </span>
  )}
</div>



  {/* VIEW */}
  <FaEye
    size={18}
    className="text-primary"
    style={{ cursor: "pointer" }}
    title="View file"
    onClick={() => viewFile(item.id)}
  />

{/* DELETE FLOW */}
{deletingIds.has(item.id) ? (
  <div
    className="spinner-border spinner-border-sm text-danger"
    role="status"
  />
) : confirmDeleteId === item.id ? (
  <div className="d-flex align-items-center gap-2">
    <span className="text-danger small fw-semibold">
      Are you sure?
    </span>

    <FaCheck
      size={16}
      className="text-success"
      style={{ cursor: "pointer" }}
      title="Confirm delete"
      onClick={() => handleDelete(item.id)}
    />

    <FaTimes
      size={16}
      className="text-secondary"
      style={{ cursor: "pointer" }}
      title="Cancel"
      onClick={() => setConfirmDeleteId(null)}
    />
  </div>
) : (
  <FaTrashAlt
    size={18}
    className="text-danger"
    style={{ cursor: "pointer" }}
    title="Delete file"
    onClick={() => setConfirmDeleteId(item.id)}
  />
)}

</div>


      </div>
    ))}
  </div>
)}

      </div>
{showFilter && (
  <>
    {/* backdrop */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.3)", zIndex: 9998 }}
      onClick={() => setShowFilter(false)}
    />

    {/* drawer */}
    <div
      className="position-fixed top-0 end-0 h-100 bg-white shadow-lg p-4"
      style={{ width: "300px", zIndex: 9999 }}
    >
      <h6 className="fw-bold mb-3">Filters</h6>

      {/* YEAR */}
      <label className="form-label">Year</label>
      <select
  className="form-select mb-3"
  value={draftYear}
  onChange={e => {
    setDraftYear(e.target.value);
    setDraftSem("");
  }}
>

        <option value="">All</option>
        {settings &&
          Array.from({ length: settings.total_years }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} Year
            </option>
          ))}
      </select>

      {/* SEM */}
      <label className="form-label">Semester</label>
      <select
  className="form-select mb-3"
  value={draftSem}
  disabled={!draftYear}
  onChange={e => setDraftSem(e.target.value)}
>

        <option value="">All</option>
        {settings &&
          Array.from({ length: settings.total_semesters }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Sem {i + 1}
            </option>
          ))}
      </select>

      {/* CATEGORY */}
      <label className="form-label">Category</label>
      <select
  className="form-select mb-4"
  value={draftCategory}
  onChange={e => setDraftCategory(e.target.value)}
>

        <option value="">All</option>
        <option value="Notes">Notes</option>
        <option value="Notice">Notice</option>
        <option value="Assignment">Assignment</option>
      </select>

      <div className="d-flex gap-2">
<button
  className="btn btn-secondary w-50"
onClick={() => {
  navigate("");          // 🔥 clears URL
  setAppliedFilters(null);
  setUploads([]);
  setShowFilter(false);
}}
>
  Clear
</button>



<button
  className="btn btn-primary w-50"
onClick={() => {
  const params = new URLSearchParams();

  if (draftYear) params.set("year", draftYear);
  if (draftSem) params.set("semester", draftSem);
  if (draftCategory) params.set("category", draftCategory);
  if (draftSearch) params.set("search", draftSearch);

  navigate(`?${params.toString()}`);

  setAppliedFilters({
    year: draftYear,
    semester: draftSem,
    category: draftCategory,
    search: draftSearch
  });

  setShowFilter(false);
}}

>
  Apply
</button>



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
