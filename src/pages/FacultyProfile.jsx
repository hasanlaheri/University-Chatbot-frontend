import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserEdit,
  FaCloudUploadAlt,
  FaFilePdf,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaUserCircle,
  FaChartBar

} from "react-icons/fa";
import "../styles/faculty.css";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FacultyProfile() {
  const [faculty, setFaculty] = useState({
    username: "",
    email: "",
    contact: "",
    department: "",
    subject: "",
    about: "",
    biodata: null,
      biodata_path: null,
  deleting_biodata: false,
  deleted_success: false,
  delete_error: false,
  saving_profile: false 
      
  });
  const [editFaculty, setEditFaculty] = useState(null);
const user = JSON.parse(localStorage.getItem("user"));
  const [editMode, setEditMode] = useState(false); // ✅ toggle view/edit
const [departments, setDepartments] = useState([]);

const [activeDate, setActiveDate] = useState(null);
const [stats, setStats] = useState({ total: 0, categories: {}, timeline: [] });

const generateColorFromString = (str) => {
  // A curated list of professional, dashboard-ready colors (Tailwind 600 & 700 shades)
  const palette = [
    { bg: '#2563eb', border: '#1d4ed8' }, // Blue
    { bg: '#7c3aed', border: '#6d28d9' }, // Violet
    { bg: '#059669', border: '#047857' }, // Emerald
    { bg: '#db2777', border: '#be185d' }, // Pink
    { bg: '#ea580c', border: '#c2410c' }, // Orange
    { bg: '#0891b2', border: '#0e7490' }, // Cyan
    { bg: '#4f46e5', border: '#4338ca' }, // Indigo
    { bg: '#0284c7', border: '#0369a1' }, // Sky
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to pick a consistent index from our professional palette
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};


// 1. Logic for the Chart (Calculate this inside the component body)
const categoriesFound = Object.keys(stats.categories || {});
// Prepare datasets for Stacked Bar Chart with unique colors
const timelineData = {
  labels: stats.timeline?.map(t => t.date) || [],
 datasets: Object.keys(stats.categories || {}).map(cat => {
  const color = generateColorFromString(cat);

  return {
    label: cat,
    data: stats.timeline.map(t => t.details?.[cat] || 0),
    backgroundColor: color.bg,
    hoverBackgroundColor: color.border,
    borderRadius: 4,
    barThickness: 18
  };
})

};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onHover: (event, chartElement) => {
    // Check if the mouse is actually over a bar
    if (chartElement && chartElement.length > 0) {
      const index = chartElement[0].index;
      const dataPoint = stats.timeline[index];
      // ONLY update state if it's a different date to prevent re-render loops
      if (activeDate?.date !== dataPoint.date) {
        setActiveDate(dataPoint);
      }
    } else {
      if (activeDate !== null) setActiveDate(null);
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
  }
};
useEffect(() => {
  const token = localStorage.getItem("token");
  const collegeId = localStorage.getItem("college_id");

  if (!token || !collegeId) return;

  fetch(`http://localhost:5000/departments/${collegeId}`, {
    method: "GET",
    headers: {
      Authorization: token,
      "College-Id": collegeId
    }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        setDepartments(data);
      }
    })
    .catch(err => console.error("Error loading departments", err));
}, []);

  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login/faculty");
    return;
  }

  // 1) get base faculty data
  fetch("http://127.0.0.1:5000/faculty/profile", {
    method: "GET",
    headers: {
      "Authorization": token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) {
        setFaculty((prev) => ({ ...prev, ...data }));
      }
    })
    .catch((err) => console.error("Error fetching faculty:", err));

  // 2) get facultyInfo extended data
  fetch("http://127.0.0.1:5000/faculty/profile/get", {
    method: "GET",
    headers: {
      "Authorization": token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) {
        setFaculty((prev) => ({
          ...prev,
          subject: data.subject || "",
          about: data.about || "",
          biodata_path: data.biodata_path || null
        }));
      }
    })
    .catch((err) => console.error("Error fetching facultyInfo:", err));

}, [navigate]);



  const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditFaculty(prev => ({ ...prev, [name]: value }));
};


const handleFileUpload = (e) => {
  setEditFaculty(prev => ({
    ...prev,
    biodata: e.target.files[0]
  }));
};


const handleSave = async () => {
  const token = localStorage.getItem("token");

  setFaculty(prev => ({ ...prev, saving_profile: true }));

  const formData = new FormData();
  formData.append("username", editFaculty.username);
  formData.append("contact", editFaculty.contact);
  formData.append("department", editFaculty.department);
  formData.append("subject", editFaculty.subject);
  formData.append("about", editFaculty.about);

  if (editFaculty.biodata) {
    formData.append("biodata", editFaculty.biodata);
  }

  const res = await fetch("http://127.0.0.1:5000/faculty/profile/save", {
    method: "POST",
    headers: { Authorization: token },
    body: formData
  });

  const data = await res.json();

  if (!data.error) {
    setFaculty(editFaculty);   // ✅ commit
    setEditFaculty(null);
    setEditMode(false);
  } else {
    alert("Error saving profile: " + data.error);
    setFaculty(prev => ({ ...prev, saving_profile: false }));
  }
};


const handleDeleteBiodata = async () => {
  const token = localStorage.getItem("token");

  // show temporary "deleting…" UI
  setFaculty((prev) => ({
    ...prev,
    deleting_biodata: true
  }));

  const res = await fetch("http://127.0.0.1:5000/faculty/profile/delete", {
    method: "DELETE",
    headers: { "Authorization": token }
  });

  const data = await res.json();

  // little delay so animation feels nice
  setTimeout(() => {
    if (!data.error) {
      setFaculty((prev) => ({
        ...prev,
        biodata: null,
        biodata_path: null,
        deleted_success: true,
        deleting_biodata: false
      }));
    } else {
      setFaculty((prev) => ({
        ...prev,
        deleting_biodata: false,
        delete_error: true
      }));
    }
  }, 600);
};

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/faculty/uploads/stats",
        {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        }
      );

      const data = await res.json();

      setStats({
        total: data.total || 0,
        categories: data.categories || {},
        timeline: data.timeline || []
      });

    } catch (err) {
      console.error("Timeline fetch error", err);
      setStats({ total: 0, categories: {}, timeline: [] });
    }
  };

  fetchStats();
}, []);


 return (
  <div
    className="min-vh-100 py-4 px-3 px-md-5"
    style={{ backgroundColor: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}
  >
    {/* COMPACT TOP NAV */}
    <div className="container-fluid max-width-xl mx-auto mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-link text-decoration-none text-slate-600 d-flex align-items-center gap-2 p-0"
          onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}`)}
        >
          <FaArrowLeft size={14} /> <span className="fw-medium">Back to Dashboard</span>
        </button>
        <div className="d-flex gap-2">
          {!editMode && (
            <button 
              className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              onClick={() => {
  setEditFaculty({ ...faculty }); // 👈 clone
  setEditMode(true);
}}
            >
              <FaUserEdit className="me-2" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="container-fluid max-width-xl mx-auto">
      <div className="row g-4">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="profile-cover-mini" style={{ height: "100px", background: "linear-gradient(45deg, #2563eb, #3b82f6)" }}></div>
            <div className="card-body text-center pt-0" style={{ marginTop: "-50px" }}>
              <div className="avatar-xl rounded-circle bg-white shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "100px", height: "100px", border: "4px solid white" }}>
                <FaUserCircle size={92} className="text-slate-200" />
              </div>
              <h4 className="fw-bold text-slate-900 mb-1">{faculty.username}</h4>
              <p className="text-primary fw-medium small mb-3">{faculty.department || "Academic Faculty"}</p>
              
              <div className="d-flex flex-column gap-2 text-start border-top pt-3">
                <div className="d-flex align-items-center gap-3 text-slate-600 mb-2">
                  <div className="icon-soft-bg"><FaEnvelope size={12} /></div>
                  <span className="small truncate">{faculty.email}</span>
                </div>
                <div className="d-flex align-items-center gap-3 text-slate-600">
                  <div className="icon-soft-bg"><FaPhone size={12} /></div>
                  <span className="small">{faculty.contact || "Add contact info"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS/DOCS CARD */}
          {!editMode && faculty.biodata_path && (
            <div className="card border-0 shadow-sm rounded-4 mt-4 p-3">
              <h6 className="fw-bold text-slate-900 mb-3 small text-uppercase ls-1">Documents</h6>
              <a 
                href={`http://127.0.0.1:5000/uploads/biodata/${faculty.biodata_path.split("/").pop()}`}
                target="_blank" rel="noreferrer"
                className="file-attachment-card d-flex align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center gap-2">
                  <FaFilePdf size={24} className="text-danger" />
                  <div className="lh-1">
                    <span className="text-muted x-small">Official Biodata</span>
                  </div>
                </div>
                <FaArrowLeft className="rotate-180 opacity-50" size={12} />
              </a>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="col-lg-8">
          {editMode ? (
            /* EDIT FORM COMPONENT */
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-2 bg-primary-soft rounded-3"><FaUserEdit className="text-primary" /></div>
                <h5 className="fw-bold text-slate-900 mb-0">Update Professional Profile</h5>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label-pro">Full Name</label>
                  <input name="username"className="form-input-clean" value={editFaculty.username || ""} onChange={handleEditChange}/>

                </div>
                {/* CONTACT NUMBER */}
<div className="col-md-6">
  <label className="form-label-pro">Contact Number</label>
  <input type="tel" className="form-input-clean" name="contact"value={editFaculty.contact || ""} onChange={handleEditChange}/>
</div>

                <div className="col-md-6">
                  <label className="form-label-pro">Department</label>
                  <select name="department" className="form-input-clean" value={editFaculty.department || ""} onChange={handleEditChange}>
                    <option value="">Select Department</option>
                    {departments.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label-pro">Specialization Area</label>
                  <input name="subject" className="form-input-clean" value={editFaculty.subject || ""} onChange={handleEditChange}/>
                </div>
                <div className="col-md-12">
                  <label className="form-label-pro">Personal Statement / Bio</label>
                  <textarea name="about" className="form-input-clean" rows="5" value={editFaculty.about || ""} onChange={handleEditChange}/>
                </div>
                {/* MODERN UPLOAD & FILE MANAGEMENT */}
<div className="col-md-12 mt-4">
  <div className="d-flex justify-content-between align-items-end mb-2">
    <p className="fw-bold text-slate-900 small mb-0">
      Professional Biodata / CV
    </p>

    {/* DELETE PREVIOUS FILE */}
    {faculty.biodata_path && !faculty.deleted_success && (
      <button
        type="button"
        className="btn btn-link text-danger text-decoration-none x-small fw-bold p-0"
        onClick={handleDeleteBiodata}
        disabled={faculty.deleting_biodata}
      >
        {faculty.deleting_biodata ? "DELETING..." : "REMOVE EXISTING FILE"}
      </button>
    )}
  </div>

  <div className="upload-zone-minimal position-relative">
    {editFaculty?.biodata ? (
      <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-3 border">
        <div className="d-flex align-items-center gap-2">
          <FaFilePdf className="text-primary" />
          <span
            className="text-slate-900 small fw-medium truncate"
            style={{ maxWidth: "200px" }}
          >
            {editFaculty.biodata.name}
          </span>
        </div>
        <button
          className="btn btn-sm btn-light rounded-circle"
         onClick={() =>
  setEditFaculty(prev => ({ ...prev, biodata: null }))
}

        >
          ✕
        </button>
      </div>
    ) : (
      <>
        <input
          type="file"
          id="bio-up"
          className="d-none"
          onChange={handleFileUpload}
          disabled={!!faculty.biodata_path && !faculty.deleted_success}
        />
        <label
          htmlFor="bio-up"
          className={`cursor-pointer d-flex align-items-center gap-3 ${
            !!faculty.biodata_path && !faculty.deleted_success
              ? "opacity-50"
              : ""
          }`}
        >
          <div className="btn btn-sm btn-outline-primary rounded-pill px-3">
            Choose New File
          </div>
          <span className="text-muted small">
            {faculty.deleted_success
              ? "File removed. Select replacement."
              : faculty.biodata_path
              ? "Remove existing file to upload new."
              : "PDF or Doc (Max 5MB)"}
          </span>
        </label>
      </>
    )}
  </div>

  {faculty.deleted_success && (
    <div className="alert alert-success mt-2 py-2 px-3 border-0 rounded-3">
      <small className="fw-bold">
        ✔ Biodata deleted. Click “Save Profile” to finalize.
      </small>
    </div>
  )}

  {faculty.delete_error && (
    <div className="alert alert-danger mt-2 py-2 px-3 border-0 rounded-3">
      <small className="fw-bold">
        ❌ Could not remove file from server.
      </small>
    </div>
  )}
</div>

              </div>

              <div className="d-flex gap-3 mt-5">
                <button className="btn btn-slate-100 text-slate-600 rounded-pill px-4 fw-bold"   onClick={() => {
    setEditFaculty(null);   // 🔥 discard changes
    setEditMode(false);
  }}>Discard</button>
                <button 
                  className="btn btn-primary rounded-pill px-5 fw-bold shadow-primary" 
                  onClick={handleSave}
                  disabled={faculty.saving_profile}
                >
                  {faculty.saving_profile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE COMPONENT */
            <div className="d-flex flex-column gap-4">
              {/* BIO SECTION */}
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h6 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
                  <div className="p-1 bg-primary-soft rounded text-primary">
                        <FaFileAlt size={14} />
                    </div> About the Faculty
                </h6>
                <p className="text-slate-600 leading-relaxed mb-0">
                  {faculty.about || "This profile is currently being updated. No biographical information available."}
                </p>
              </div>

              {/* ACADEMIC FOCUS */}
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h6 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
                  <div className="p-1 bg-primary-soft rounded text-primary">
                        <FaChartBar size={14} />
                    </div> Academic Specialization
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {faculty.subject ? (
                    faculty.subject.split(',').map((tag, idx) => (
                      <span key={idx} className="badge-skill">{tag.trim()}</span>
                    ))
                  ) : (
                    <span className="text-muted small">Specialization details not provided.</span>
                  )}
                </div>
              </div>
              {/* --- RECENT ACTIVITY SECTION --- */}
<div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-4">
    <div className="p-4 bg-white border-bottom border-light">
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="fw-bold text-slate-900 mb-0 d-flex align-items-center gap-2">
                    <div className="p-1 bg-primary-soft rounded text-primary">
                        <FaChartBar size={14} />
                    </div>
                    Upload Insights
                </h6>
                <p className="text-muted mb-0 x-small">Date-wise category distribution</p>
            </div>
            <div className="text-end">
                <h4 className="fw-bold text-primary mb-0">{stats.total}</h4>
                <span className="text-uppercase text-slate-400 fw-bold" style={{ fontSize: '10px' }}>Total Files</span>
            </div>
        </div>
    </div>

    <div className="p-4">
        {/* CHART AREA */}
        <div style={{ height: '240px', width: '100%' }}>
            {stats.timeline && stats.timeline.length > 0 ? (
                <Bar data={timelineData} options={chartOptions} />
            ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center bg-slate-50 rounded-4 border border-dashed">
                    <FaCloudUploadAlt size={30} className="text-slate-300 mb-2" />
                    <p className="text-slate-500 small">No activity recorded yet.</p>
                </div>
            )}
        </div>

        {/* INTERACTIVE LEGEND AREA */}
        <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold text-slate-800 small mb-3 uppercase ls-1">
                {activeDate ? `Breakdown for ${activeDate.date}` : "Overall Distribution"}
            </h6>

            <div className="d-flex flex-wrap gap-3">
                {Object.keys(stats.categories).map((cat) => {
                    const count = activeDate 
                        ? (activeDate.details?.[cat] || 0) 
                        : (stats.categories[cat] || 0);

                    // Get specific color for this category
                    const theme = generateColorFromString(cat);

                    return (
                        <div
                            key={cat}
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border bg-white shadow-sm transition-all"
                            style={{ 
                                borderLeft: `4px solid ${theme.bg}`, // Unique category color
                                opacity: activeDate && count === 0 ? 0.3 : 1,
                                transform: activeDate && count > 0 ? 'translateY(-3px)' : 'none'
                            }}
                        >
                            <span className="fw-bold" style={{ color: theme.bg }}>{count}</span>
                            <span className="text-slate-600 small fw-medium">{cat}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
</div>
{/* --- END ACTIVITY SECTION --- */}
              
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);}
