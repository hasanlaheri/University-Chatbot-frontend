import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/faculty.css";

export default function FacultyUpload() {
  const [departments, setDepartments] = useState([]);
const [settings, setSettings] = useState(null);
  const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    department_id: "",
    category: "",
    year: "",
    semester: "",
    visibility: "public", 
    file: null
  });

 const [loading, setLoading] = useState(false);

const handleUpload = async () => {
  if (!form.department_id || !form.file) {
  toast.error("Please fill all required fields");
  return;
}

if (!isUnitDepartment) {
  if (!form.category || !form.year || !form.semester) {
    toast.error("Please select year & semester");
    return;
  }
}


  setLoading(true);

  const fd = new FormData();
  fd.append("department_id", form.department_id);
  fd.append("category", form.category);
  fd.append("year", form.year);
  fd.append("semester", form.semester);
  fd.append("visibility", form.visibility);
  fd.append("file", form.file);

  try {
    const res = await fetch("http://localhost:5000/faculty/upload", {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token")
      },
      body: fd
    });

    const data = await res.json();

 if (data.success) {
  navigate(`/${user.college_code.toLowerCase()}/${user.role}`, {
    state: {
      uploadResult: data.indexed ? "success" : "partial"
    }
  });



    } else {
      toast.error(data.error || "Upload failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};
const selectedDepartment = departments.find(
  d => String(d.id) === String(form.department_id)
);

const isUnitDepartment = selectedDepartment?.type === "unit";


const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "department_id") {
    const dept = departments.find(d => String(d.id) === String(value));

    if (dept?.type === "unit") {
      setForm({
        ...form,
        department_id: value,
        year: "",
        semester: "",
        category: ""
      });
      return;
    }
  }

  setForm({ ...form, [name]: value });
};


  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg"
    ];

    if (!allowed.includes(f.type)) {
      alert("Only PDF / DOC / DOCX / PNG / JPG allowed");
      e.target.value = "";
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      e.target.value = "";
      return;
    }

    setForm({ ...form, file: f });
  };
const disableYearSem = isUnitDepartment;
const removeFile = () => {
  setForm({ ...form, file: null });
};

useEffect(() => {
  const collegeId = localStorage.getItem("college_id");
  if (!collegeId) return;

  // Load departments
  fetch(`http://localhost:5000/departments/${collegeId}`)
    .then(res => res.json())
    .then(data => setDepartments(data))
    .catch(err => console.error("Failed to load departments:", err));

  // Load college settings
  fetch(`http://localhost:5000/college/settings/${collegeId}`)
    .then(res => res.json())
    .then(data => setSettings(data))
    .catch(err => console.error("Failed to load settings:", err));
}, []);

  return (
  <div
    className="min-vh-100 d-flex justify-content-center align-items-center p-3"
    style={{
      background: "radial-gradient(circle at top left, #eef5ff, #dae9ff)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}
  >
    <ToastContainer position="top-right" autoClose={3000} newestOnTop />

    {/* SPIRAL LOADING OVERLAY */}
    {loading && (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
        style={{ zIndex: 9999, background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(6px)" }}>
        <div className="custom-spinner"></div>
        <h5 className="mt-4 fw-bold text-primary animate-pulse">Processing Material...</h5>
      </div>
    )}

    <div
      className="card border-0 shadow-xl overflow-hidden"
      style={{ 
        width: "100%", 
        maxWidth: "680px", 
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="p-4 p-md-5">
        <div className="text-center mb-5">
          <div className="icon-badge mb-3">
            <FaCloudUploadAlt size={32} />
          </div>
          <h2 className="fw-bold text-dark mb-1">Upload Material</h2>
          <p className="text-secondary small">Empower your students with fresh resources</p>
        </div>

        <div className="row g-4">
          {/* Classification Section */}
          <div className="col-12">
            <div className="section-header">
              <span className="small fw-bold text-primary text-uppercase">Classification</span>
            </div>
          </div>

          <div className="col-md-6">
            <label className="custom-label">Department</label>
            <select className="custom-input form-select shadow-none"
              name="department_id" value={form.department_id} onChange={handleChange} disabled={loading}>
              <option value="">Choose Dept</option>
              {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
            </select>
          </div>

          <div className="col-md-6">
            <label className="custom-label">Resource Type</label>
            <select className="custom-input form-select shadow-none"
              name="category" value={form.category} onChange={handleChange} disabled={loading}>
              <option value="">Select Category</option>
              <option value="Notes">Notes</option>
              <option value="Notice">Notice</option>
              <option value="Timetable">Time Table</option>
              <option value="Assignment">Assignment</option>
              <option value="Exam">Exam Question Bank</option>
              <option value="Test">Test Question Bank</option>
            </select>
          </div>

          {/* Academic Scope Section */}
          <div className="col-12 mt-4">
            <div className="section-header">
              <span className="small fw-bold text-primary text-uppercase">Academic Scope</span>
            </div>
          </div>

          <div className="col-md-4">
            <label className="custom-label">Visibility</label>
            <select className="custom-input form-select shadow-none"
              name="visibility" value={form.visibility} onChange={handleChange} disabled={loading}>
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="custom-label">Year</label>
            <select className="custom-input form-select shadow-none"
              name="year" value={form.year} onChange={handleChange} disabled={disableYearSem || loading}>
              {!settings ? <option>...</option> : (
                <>
                  <option value="">Year</option>
                  {Array.from({ length: settings.total_years }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Year</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="col-md-4">
  <label className="custom-label">Semester</label>
  <select 
    className="custom-input form-select shadow-none"
    name="semester" 
    value={form.semester} 
    onChange={handleChange} 
    disabled={disableYearSem || loading || !form.year} // Keep disabled if no year is chosen
  >
    {!settings ? (
      <option>...</option>
    ) : (
      <>
        <option value="">Sem</option>
        {(() => {
          // 1. Calculate the valid range based on selected year
          // Year 1 -> 1, 2 | Year 2 -> 3, 4 | Year 3 -> 5, 6...
          const endSem = form.year * 2;
          const startSem = endSem - 1;

          // 2. Map only those two semesters
          return [startSem, endSem].map((sem) => (
            // Safety check against total_semesters in settings
            sem <= settings.total_semesters && (
              <option key={sem} value={sem}>
                Sem {sem}
              </option>
            )
          ));
        })()}
      </>
    )}
  </select>
</div>

          {/* File Upload Section */}
          <div className="col-12 mt-4">
            <div className={`upload-zone ${form.file ? 'file-active' : ''}`}>
              <label className="custom-label text-center d-block mb-3">Material File (Max 5MB)</label>
              
              {form.file ? (
                <div className="file-preview d-flex align-items-center justify-content-between p-3 rounded-3">
                  <div className="d-flex align-items-center">
                    <div className="file-icon me-3">📄</div>
                    <span className="text-truncate" style={{ maxWidth: '250px' }}>{form.file.name}</span>
                  </div>
                  <button className="btn-close-custom" onClick={() => setForm({ ...form, file: null })} disabled={loading}>✕</button>
                </div>
              ) : (
                <div className="position-relative">
                  <input type="file" className="file-input-hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFile} disabled={loading} />
                  <div className="file-dummy p-4 text-center">
                    <span className="text-muted small">Click to browse or drag & drop</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-2">
          <button className="btn-primary-gradient w-100 py-3 mb-3" onClick={handleUpload} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Publish Resource'}
          </button>
          
          <button className="btn-cancel w-100 py-2" onClick={()=>navigate(`/${user.college_code.toLowerCase()}/${user.role}`)}>
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
