import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserEdit,
  FaUpload,
} from "react-icons/fa";

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
const user = JSON.parse(localStorage.getItem("user"));
  const [editMode, setEditMode] = useState(false); // ✅ toggle view/edit
const [departments, setDepartments] = useState([]);
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



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaculty({ ...faculty, [name]: value });
  };

  const handleFileUpload = (e) => {
    setFaculty({ ...faculty, biodata: e.target.files[0] });
  };

const handleSave = async () => {
  const token = localStorage.getItem("token");

  setFaculty(prev => ({ ...prev, saving_profile:true }));  // <--- start loader

  const formData = new FormData();
  formData.append("subject", faculty.subject);
  formData.append("about", faculty.about);
  if (faculty.biodata) {
    formData.append("biodata", faculty.biodata);
  }

  const res = await fetch("http://127.0.0.1:5000/faculty/profile/save", {
    method: "POST",
    headers: { "Authorization": token },
    body: formData
  });

  const data = await res.json();

  if (!data.error) {
    setFaculty(prev => ({ ...prev, saving_profile:false }));
    setEditMode(false);      // <--- go to view mode
  } else {
    alert("Error saving profile: " + data.error);
    setFaculty(prev => ({ ...prev, saving_profile:false }));
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




  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center p-4"
      style={{
        background: "linear-gradient(135deg, #007bff, #0056b3)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div className="d-flex align-items-center w-100 mb-4">
        <button
          className="btn btn-outline-light me-3 rounded-pill px-3 py-2"
          onClick={() => navigate(`/${user.college_code.toLowerCase()}/${user.role}`)}
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>
        <h3 className="fw-bold mb-0">Faculty Profile</h3>
      </div>

      {/* ========================= EDIT MODE ========================= */}
      {editMode && (
        <div
          className="card shadow-lg border-0 p-4"
          style={{
            width: "100%",
            maxWidth: "700px",
            borderRadius: "18px",
            background: "white",
            color: "#333",
          }}
        >
          <div className="text-center mb-4">
            <FaUserEdit size={50} className="text-primary mb-2" />
            <h4 className="fw-bold text-primary mb-0">Your Information</h4>
            <p className="text-muted small">
              Update your profile and teaching details
            </p>
          </div>

          {/* form fields */}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-muted">
                Name
              </label>
              <input
                type="text"
                className="form-control rounded-3 border-0 shadow-sm"
                name="username"
                value={faculty.username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-muted">
                Email
              </label>
              <input
  type="email"
  className="form-control rounded-3 border-0 shadow-sm"
  name="email"
  value={faculty.email}
  disabled
/>
<small className="text-muted">
  Email cannot be changed
</small>

            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-muted">
                Contact
              </label>
              <input
                type="tel"
                className="form-control rounded-3 border-0 shadow-sm"
                name="contact"
                value={faculty.contact}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-muted">
                Department
              </label>
              <select
  className="form-select rounded-3 border-0 shadow-sm"
  name="department"
  value={faculty.department}
  onChange={handleChange}
>
  <option value="">Select Department</option>

  {departments.map(dep => (
    <option key={dep.id} value={dep.name}>
      {dep.name}
    </option>
  ))}
</select>

            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-muted">
                Subject Teaching
              </label>
              <input
                type="text"
                className="form-control rounded-3 border-0 shadow-sm"
                name="subject"
                value={faculty.subject}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-muted">
                About Yourself
              </label>
              <textarea
                className="form-control rounded-3 border-0 shadow-sm"
                rows="3"
                name="about"
                value={faculty.about}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-muted">
                Upload Biodata
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="file"
                  className="form-control rounded-3 border-0 shadow-sm"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={faculty.biodata !== null}
                />
                <FaUpload className="text-primary" />
              </div>

              {faculty.biodata && (
                <div className="d-flex align-items-center justify-content-between mt-2 px-2 py-1 bg-light rounded-3 shadow-sm">
                  <small className="text-success">
                    Uploaded: <strong>{faculty.biodata.name}</strong>
                  </small>
                  <button
                    className="btn btn-sm btn-outline-danger border-0"
                    onClick={() => setFaculty({ ...faculty, biodata: null })}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
                
              )}
     {faculty.biodata_path && (
  <div className="mt-3 text-center">
    
    {!faculty.deleting_biodata && !faculty.deleted_success && (
      <button
        className="btn btn-danger w-100"
        onClick={handleDeleteBiodata}
      >
        Delete Previous Biodata
      </button>
    )}

    {faculty.deleting_biodata && (
      <div className="text-warning fw-bold">
        Deleting…
      </div>
    )}

    {faculty.deleted_success && (
      <div className="text-success fw-bold">
        ✔ Biodata deleted — click Save Changes
      </div>
    )}

    {faculty.delete_error && (
      <div className="text-danger fw-bold">
        ❌ Error deleting file
      </div>
    )}
    
  </div>
)}
 
            </div>
          </div>

          <button
  className="btn btn-primary w-100 mt-4 py-2 fw-semibold rounded-pill shadow-sm"
  onClick={handleSave}
  disabled={faculty.saving_profile}
>
  {faculty.saving_profile ? "Saving…" : "Save Changes"}
</button>

        </div>
      )}

      {/* ========================= VIEW MODE ========================= */}
      {!editMode && (
        <div
          className="card shadow-lg border-0 p-4 mt-4"
          style={{ width: "100%", maxWidth: "700px", borderRadius: "18px" }}
        >
          <h4 className="fw-bold text-primary mb-3">Profile Overview</h4>

          <p><strong>Name:</strong> {faculty.username}</p>
          <p><strong>Email:</strong> {faculty.email}</p>
          <p><strong>Contact:</strong> {faculty.contact}</p>
          <p><strong>Department:</strong> {faculty.department}</p>
          <p><strong>Subject:</strong> {faculty.subject}</p>
          <p><strong>About:</strong> {faculty.about}</p>

         {faculty.biodata_path && (
  <a
    href={`http://127.0.0.1:5000/uploads/biodata/${faculty.biodata_path.split("/").pop()}`}
    target="_blank"
    rel="noreferrer"
    className="btn btn-outline-primary mt-3"
  >
    View Biodata
  </a>
)}


          <button
            className="btn btn-warning w-100 mt-4"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
