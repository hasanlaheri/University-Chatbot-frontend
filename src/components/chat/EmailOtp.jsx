import React from "react";
import { FaCheckCircle, FaTimes, FaShieldAlt } from "react-icons/fa";

export default function EmailOtpModal({
  show,
  email,
  emailOtp,
  setEmailOtp,
  emailOtpError,
  handleVerifyEmailOtp,
  sendingEmailOtp,
  onClose
}) {
  if (!show) return null;

  return (
    <>
   {/* IMPROVED BLUR BACKDROP */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 otp-blur-overlay"
        style={{
          background: "rgba(15, 23, 42, 0.45)", // Lighter slate to let blur show through
          zIndex: 10000,
        }}
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4 animate-pop-in"
        style={{ 
          width: "100%", 
          maxWidth: "400px", 
          zIndex: 10001,
          border: "1px solid rgba(255, 255, 255, 0.2)" 
        }}
      >
        {/* HEADER */}
        <div className="text-end mb-1">
          <button
            className="btn btn-link text-muted p-0 shadow-none"
            onClick={onClose}
            style={{ fontSize: "1.2rem" }}
          >
            <FaTimes />
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
            <FaShieldAlt size={28} />
          </div>
          <h5 className="fw-bold text-dark mb-1">Confirm Your Email</h5>
          <p className="small text-muted px-4">
            For your security, enter the 6-digit code sent to <br />
            <span className="text-primary fw-medium">{email}</span>
          </p>
        </div>

        {/* OTP INPUT SECTION */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center" style={{ letterSpacing: '1px' }}>
            Verification Code
          </label>
          <input
            type="text"
            className={`form-control form-control-lg text-center fw-bold shadow-none ${
              emailOtpError ? "is-invalid border-danger" : "border-2"
            }`}
            style={{
              letterSpacing: "0.8rem",
              fontSize: "1.8rem",
              height: "70px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              transition: "all 0.2s ease"
            }}
            placeholder="000000"
            maxLength={6}
            value={emailOtp}
            autoFocus
            onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))}
          />
          
          {emailOtpError && (
            <div className="text-danger small text-center mt-2 fw-medium animate-shake">
              {emailOtpError}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary py-3 fw-bold rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2 border-0"
            style={{ background: "linear-gradient(45deg, #0d6efd, #0b5ed7)" }}
            onClick={handleVerifyEmailOtp}
            disabled={sendingEmailOtp || emailOtp.length < 6}
          >
            {sendingEmailOtp ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Verifying Code...
              </>
            ) : (
              <>
                <FaCheckCircle /> Verify & Update Email
              </>
            )}
          </button>
          
          <button 
            className="btn btn-link btn-sm text-decoration-none text-muted mt-2"
            disabled={sendingEmailOtp}
          >
            Didn't receive the email? <span className="text-primary fw-bold">Resend Code</span>
          </button>
        </div>
      </div>
    </>
  );
}