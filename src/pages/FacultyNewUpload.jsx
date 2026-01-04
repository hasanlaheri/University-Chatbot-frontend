import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


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
      className="min-vh-100 d-flex justify-content-center align-items-start p-4"
      style={{
        background: "linear-gradient(135deg, #e9f2ff, #d7e9ff)",
        color: "white",
        fontFamily: "Poppins"
      }}
    >
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
/>

      <div
        className="card shadow-lg border-0 p-4 mt-3"
        style={{ width: "100%", maxWidth: "650px", borderRadius: "18px" }}
      >
        <div className="text-center mb-4">
          <FaCloudUploadAlt size={60} className="text-primary mb-2" />
          <h3 className="fw-bold text-primary mb-1">Upload New Material</h3>
          <p className="text-muted small">
            Help students stay updated by uploading new resources
          </p>
        </div>

        <div className="row g-3">

          {/* Department */}
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted">Department</label>
            <select className="form-select rounded-3 shadow-sm"
              name="department_id" value={form.department_id} onChange={handleChange} disabled={loading}>
              <option value="">Select...</option>
              {departments.map(dep => (
  <option key={dep.id} value={dep.id}>{dep.name}</option>

))}

            </select>
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted">Category</label>
            <select className="form-select rounded-3 shadow-sm"
              name="category" value={form.category} onChange={handleChange} disabled={loading}>
              <option value="">Select...</option>
              <option value="Notes">Notes</option>
              <option value="Notice">Notice</option>
              <option value="Time table">Time table</option>
              <option value="Assignment">Assignment</option>
            </select>
          </div>
          {/* Visibility */}
<div className="col-md-6">
  <label className="form-label fw-semibold text-muted">Visibility</label>
  <select
    className="form-select rounded-3 shadow-sm"
    name="visibility"
    value={form.visibility}
    onChange={handleChange}
    disabled={loading}
  >
    <option value="public">Public (Students + Guests)</option>
    <option value="private">Private (Students only)</option>
  </select>
</div>


{/* Year */}
<div className="col-md-6">
  <label className="form-label fw-semibold text-muted">Year</label>

  {!settings ? (
    <select className="form-select rounded-3 shadow-sm" disabled>
      <option>Loading...</option>
    </select>
  ) : (
    <select
      className="form-select rounded-3 shadow-sm"
      name="year"
      value={form.year}
      onChange={handleChange}
      disabled={disableYearSem || loading}
    >
      <option value="">Select...</option>

      {Array.from({ length: settings.total_years }, (_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1} Year
        </option>
      ))}
    </select>
  )}
</div>

{/* Semester */}
<div className="col-md-6">
  <label className="form-label fw-semibold text-muted">Semester</label>

  {!settings ? (
    <select className="form-select rounded-3 shadow-sm" disabled>
      <option>Loading...</option>
    </select>
  ) : (
    <select
      className="form-select rounded-3 shadow-sm"
      name="semester"
      value={form.semester}
      onChange={handleChange}
      disabled={disableYearSem || loading}
    >
      <option value="">Select...</option>

      {Array.from({ length: settings.total_semesters }, (_, i) => (
        <option key={i + 1} value={i + 1}>
          Sem {i + 1}
        </option>
      ))}
    </select>
  )}
</div>



          {/* File */}
       {/* File */}
<div className="col-12">
  <label className="form-label fw-semibold text-muted">Upload File (Max 5MB)</label>

  {form.file ? (
    <div className="d-flex align-items-center justify-content-between mt-2 px-2 py-1 bg-light rounded-3 shadow-sm">
      <small className="text-success">
        Uploaded: <strong>{form.file.name}</strong>
      </small>
      <button
        className="btn btn-sm btn-outline-danger border-0"
        onClick={() => setForm({ ...form, file: null })}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  ) : (
    <input
      type="file"
      className="form-control rounded-3 shadow-sm"
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      onChange={handleFile}
      disabled={loading}
    />
  )}
</div>

        </div>

        <small className="text-muted d-block mt-3">
          * Allowed formats: PDF, DOC, DOCX, PNG, JPG <br />
          * Keep file name clean & readable <br />
          * Do not upload duplicate material
        </small>

        <button
  className="btn btn-primary w-100 mt-4 py-2 fw-semibold rounded-pill shadow-sm"
  style={{ background: "linear-gradient(135deg, #007bff, #0056b3)", border: "none" }}
  onClick={handleUpload}
  disabled={loading}
>
  {loading ? "Uploading..." : "Upload Material"}
</button>


        <button
          className="btn btn-outline-secondary w-100 mt-3 rounded-pill"
          onClick={()=>navigate(`/${user.college_code.toLowerCase()}/${user.role}`)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
