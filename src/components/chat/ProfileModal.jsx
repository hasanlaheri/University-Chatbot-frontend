import React from "react";
import {
  FaEdit,
  FaUniversity,
  FaCalendarAlt,
  FaUserShield,
  FaLock,
  FaTrash,
  FaUser
} from "react-icons/fa";

import PasswordEye from "../PasswordEye";
import EmailOtp from "../chat/EmailOtp";


export default function ProfileModal({
  showProfile,
  closeProfile,

  user,
  displayRole,

  editProfile,
  setEditProfile,

  showChangePassword,
  setShowChangePassword,

  showCurrentPass,
  setShowCurrentPass,
  showNewPass,
  setShowNewPass,
  showConfirmPass,
  setShowConfirmPass,

  passwordForm,
  setPasswordForm,
  passwordError,
  handleChangePassword,
  resetChangePasswordState,

  profileForm,
  setProfileForm,
  handleSaveProfile,

  departments,
  settings,

  confirmAccountDelete,
  setConfirmAccountDelete,
  handleDeleteAccount,

  openEditProfile,
  emailOtpStage,
  emailOtp,
  setEmailOtp,
  emailOtpError,
  handleVerifyEmailOtp,
  sendingEmailOtp,
  profileError,
  handleProfileChange,
  sendOtpError,
  setEmailOtpStage,
  setEmailOtpError
}) {
  if (!showProfile) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          zIndex: 9998
        }}
        onClick={closeProfile}
      />

      {/* MODAL */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-0 profile-modal overflow-hidden"
        style={{ width: "400px", zIndex: 9999 }}
      >
        {/* HEADER */}
        <div className="p-4 text-center border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="flex-grow-1 text-center ps-4">
              <h5 className="fw-bold mb-0">
                {editProfile ? "Edit Profile" : "My Profile"}
              </h5>
              <small className="text-muted">{user?.email}</small>
            </div>

            {!showChangePassword && !editProfile && (
              <button
                className="btn btn-link p-0 text-primary"
                onClick={openEditProfile}
              >
                <FaEdit size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* ================= CHANGE PASSWORD ================= */}
          {showChangePassword ? (
            <div className="fade-in">
              <h6 className="fw-bold mb-3 text-uppercase small text-secondary">
                🔒 Security Update
              </h6>

              {/* CURRENT */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Current Password
                </label>
                <div className="position-relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    className="form-control bg-light border-0"
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value
                      })
                    }
                  />
                  <PasswordEye
                    visible={showCurrentPass}
                    onToggle={() => setShowCurrentPass(v => !v)}
                  />
                </div>
              </div>

              {/* NEW */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  New Password
                </label>
                <div className="position-relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    className="form-control bg-light border-0"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value
                      })
                    }
                  />
                  <PasswordEye
                    visible={showNewPass}
                    onToggle={() => setShowNewPass(v => !v)}
                  />
                </div>
              </div>

              {/* CONFIRM */}
              <div className="mb-4">
                <label className="form-label fw-semibold small">
                  Confirm Password
                </label>
                <div className="position-relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className="form-control bg-light border-0"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value
                      })
                    }
                  />
                  <PasswordEye
                    visible={showConfirmPass}
                    onToggle={() => setShowConfirmPass(v => !v)}
                  />
                </div>
              </div>

              {passwordError && (
                <div className="alert alert-danger py-2 small">
                  {passwordError}
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleChangePassword}
                >
                  Update Password
                </button>
                <button
                  className="btn btn-light w-100"
                  onClick={resetChangePasswordState}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : editProfile ? (
            /* ================= EDIT PROFILE ================= */
            <div className="fade-in">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Full Name
                  </label>
                  <input
                    className="form-control bg-light border-0"
                    value={profileForm.username}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        username: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Email Address
                  </label>
                  <input
  className={`form-control bg-light border-0 ${profileError ? "is-invalid" : ""}`}
  value={profileForm.email}
  onChange={e => handleProfileChange("email", e.target.value)}
/>
{sendOtpError && (
  <div className="alert alert-danger py-2 small mt-2">
    {sendOtpError}
  </div>
)}


                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Department
                  </label>
                  <select
                    className="form-select bg-light border-0"
                    value={profileForm.department_id || ""}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        department_id: e.target.value
                      })
                    }
                  >
                    <option value="">N/A</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">Year</label>
                  <select
                    className="form-select bg-light border-0"
                    value={profileForm.year || ""}
                    onChange={e =>
                      setProfileForm(prev => ({
                        ...prev,
                        year: e.target.value
                      }))
                    }
                  >
                    <option value="">N/A</option>
                    {Array.from(
                      { length: settings?.total_years || 0 },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">
                    Semester
                  </label>
                  <select
                    className="form-select bg-light border-0"
                    value={profileForm.semester || ""}
                    onChange={e =>
                      setProfileForm(prev => ({
                        ...prev,
                        semester: e.target.value
                      }))
                    }
                  >
                    <option value="">N/A</option>
                    {Array.from(
                      { length: settings?.total_semesters || 0 },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
               <button
  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
  onClick={handleSaveProfile}
  disabled={emailOtpStage || sendingEmailOtp}
>
  {sendingEmailOtp ? (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      />
    
    </>
  ) : (
    "Save Changes"
  )}
</button>


                <button
                  className="btn btn-light w-100"
                  onClick={() => setEditProfile(false)}
                >
                  Cancel
                </button>
                {profileError && (
  <div className="alert alert-danger mt-3 py-2 small text-center animate-fade-in">
    {profileError}
  </div>
)}

              </div>
<EmailOtp
  show={emailOtpStage}
  email={profileForm.email}
  emailOtp={emailOtp}
  setEmailOtp={setEmailOtp}
  emailOtpError={emailOtpError}
  handleVerifyEmailOtp={handleVerifyEmailOtp}
  sendingEmailOtp={sendingEmailOtp}
  onClose={() => {
    setEmailOtpStage(false);
    setEmailOtp("");
    setEmailOtpError("");
  }}
/>


            </div>
          ) : (
            /* ================= VIEW PROFILE ================= */
            <div className="fade-in">
              <div className="profile-info-grid mb-4">
                <div className="info-item">
  <FaUser className="text-primary me-3" />
  <div>
    <div className="text-muted small">Full Name</div>
    <div className="fw-semibold">
      {user?.username || "—"}
    </div>
  </div>
</div>

                <div className="info-item">
                  <FaUniversity className="text-primary me-3" />
                  <div>
                    <div className="text-muted small">Department</div>
                    <div className="fw-semibold">
                      {user?.department || "—"}
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <FaCalendarAlt className="text-primary me-3" />
                  <div>
                    <div className="text-muted small">Academic Year</div>
                    <div className="fw-semibold">
                      Year {user?.year || "—"} / Sem{" "}
                      {user?.semester || "—"}
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <FaUserShield className="text-primary me-3" />
                  <div>
                    <div className="text-muted small">Access Level</div>
                    <div className="fw-semibold">{displayRole}</div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 mb-3">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill"
                  onClick={() => setShowChangePassword(true)}
                >
                  <FaLock size={12} className="me-2" />
                  Change Password
                </button>
              </div>

              <div className="border-top pt-3">
                {!confirmAccountDelete ? (
                  <button
                    className="btn btn-link btn-sm text-danger w-100"
                    onClick={() => setConfirmAccountDelete(true)}
                  >
                    <FaTrash size={12} className="me-2" />
                    Delete Account
                  </button>
                ) : (
                  <div className="alert alert-danger p-2 text-center">
                    <p className="small mb-2">
                      Permanently delete account?
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={handleDeleteAccount}
                      >
                        Yes, Delete
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setConfirmAccountDelete(false)
                        }
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!editProfile && !showChangePassword && (
          <div className="bg-light p-3 text-center">
            <button
              className="btn btn-sm btn-dark px-4 rounded-pill"
              onClick={closeProfile}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </>
  );
}
