import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

function LandingPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center text-center bg-light position-relative">
      {/* University Info */}
      <div className="p-5">
        <h1 className="display-5 fw-bold text-primary">University Chatbot</h1>
        <p className="lead text-muted mt-3" style={{ maxWidth: "600px" }}>
          Your intelligent assistant for academic, administrative, and campus-related queries.
        </p>
      </div>

      {/* Login Dropdown */}
      <div
        className="position-absolute top-0 end-0 p-3"
        style={{ zIndex: 1000 }}
      >
        <Dropdown onSelect={handleSelect}>
          <Dropdown.Toggle variant="primary" id="login-dropdown">
            Login
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item eventKey="admin">Admin</Dropdown.Item>
            <Dropdown.Item eventKey="faculty">Faculty</Dropdown.Item>
            <Dropdown.Item eventKey="user">User</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}

export default LandingPage;
