import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

function LandingPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column position-relative"
      style={{ 
        backgroundColor: "#FFFFFF",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* Decorative Background Elements */}
      <div className="position-absolute" style={{ top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      <div className="position-absolute" style={{ bottom: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%)', borderRadius: '50%' }}></div>

      {/* Top Navigation */}
      <nav className="d-flex justify-content-between align-items-center px-4 px-md-5 py-4" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
            <span className="text-white fw-bold small">U</span>
          </div>
          <span className="fw-bold fs-5 tracking-tight text-dark">UniPortal</span>
        </div>

        <Dropdown onSelect={handleSelect} align="end">
          <Dropdown.Toggle 
            variant="none" 
            className="btn-login-modern shadow-sm px-4 py-2 border"
            style={{ borderRadius: '12px', fontWeight: '600', backgroundColor: '#fff' }}
          >
            Sign In
          </Dropdown.Toggle>

          <Dropdown.Menu className="border-0 shadow-lg mt-2 p-2" style={{ borderRadius: '15px', minWidth: '180px' }}>
            <div className="px-3 py-2 small text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>Select Role</div>
            <Dropdown.Item eventKey="admin" className="rounded-3 py-2">🏛️ Admin</Dropdown.Item>
            <Dropdown.Item eventKey="faculty" className="rounded-3 py-2">🎓 Faculty</Dropdown.Item>
            <Dropdown.Item eventKey="user" className="rounded-3 py-2">👤 Student / Guest</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </nav>

      {/* Hero Content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center px-4" style={{ zIndex: 1 }}>
        <div className="text-center" style={{ maxWidth: "800px" }}>
          
          <h1 className="display-3 fw-bold text-dark mb-4" style={{ letterSpacing: '-2px' }}>
            Your Intelligence Layer for <br />
            <span style={{ 
              background: "linear-gradient(90deg, #4F46E5, #06B6D4)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>Campus Life.</span>
          </h1>

          <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: "600px", fontSize: '1.1rem', lineHeight: '1.6' }}>
            A seamless bridge between academic resources, administrative tasks, and instant campus assistance.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button 
              className="btn btn-primary btn-lg px-5 py-3 shadow-lg border-0 transition-all"
              style={{ borderRadius: '16px', fontWeight: '700', backgroundColor: '#4F46E5' }}
              onClick={() => handleSelect('user')}
            >
              Start Chatting
            </button>
            <button 
              className="btn btn-outline-light btn-lg px-5 py-3 text-dark border shadow-sm transition-all"
              style={{ borderRadius: '16px', fontWeight: '700' }}
            >
              Learn More
            </button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center">
        <span className="text-muted small">© 2026 University Portal. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default LandingPage;