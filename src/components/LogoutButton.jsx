import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/");
    }, 1500); // animation duration
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className="btn btn-outline-light d-flex align-items-center gap-2"
        style={{
          borderRadius: "30px",
          padding: "8px 18px",
          fontWeight: "600",
          transition: "all 0.3s ease",
        }}
        disabled={loggingOut}
      >
        <FiLogOut size={18} />
        {loggingOut ? "Logging out..." : "Logout"}
      </button>

      {/* ✅ Logout Animation Overlay */}
      {loggingOut && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75 text-white"
          style={{ zIndex: 2000 }}
        >
          <div
            className="spinner-border text-light mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          ></div>
          <h5>Logging you out...</h5>
        </div>
      )}
    </>
  );
}
