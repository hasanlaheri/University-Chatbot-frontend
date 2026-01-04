import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GuestPage() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin/guests", {
      headers: {
        "Content-Type": "application/json",
        "College-Id": localStorage.getItem("college_id"),
        "Authorization": localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => setGuests(data))
      .catch(err => console.log("Guest fetch error: ", err));
  }, []);

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #16222A, #3A6073)",
        color: "white"
      }}
    >

      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center p-3 px-md-5 text-white"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.15)"
        }}
      >
        <h4 className="fw-bold mb-0">👤 Guest Users</h4>

        <button
          className="btn btn-warning btn-sm fw-bold"
          onClick={() => navigate("/admin")}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div className="container mt-4 mb-5" style={{ flexGrow: 1 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-white">Total Guests: {guests.length}</h5>
        </div>

        {/* Guest Table */}
        <div
          className="table-responsive rounded shadow"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "15px"
          }}
        >
          <table className="table table-borderless text-white align-middle mb-0">
            <thead style={{ background: "rgba(255,255,255,0.12)" }}>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {guests.length > 0 ? (
                guests.map(g => (
                  <tr
                    key={g.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <td>{g.name}</td>
                    <td>{g.email}</td>
                    <td>{g.contact || "—"}</td>
                    <td>{g.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3 opacity-75">
                    No guest users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
