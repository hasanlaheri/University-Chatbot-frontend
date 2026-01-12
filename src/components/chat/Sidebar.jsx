import React from "react";
import {
  FaGraduationCap,
  FaPlus,
  FaRegComments,
  FaRegCommentDots,
  FaEllipsisH,
  FaBars,
  FaPowerOff,
  FaUserCircle,
  FaTrash,
  FaEdit
} from "react-icons/fa";

import LogoutButton from "../LogoutButton";

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  sessions,
  setSessions,
  currentSessionId,
  setCurrentSessionId,
  hoverId,
  setHoverId,
  menuId,
  setMenuId,
  editingId,
  setEditingId,
  editingTitle,
  setEditingTitle,
  setOriginalTitle,
  saveRename,
  delChat,
  navigate,
  user,
  menuRef,
  setShowProfile
}) {

  return (
    <>
      {/* ===================== FULL SIDEBAR ===================== */}
      <div
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"} d-flex flex-column shadow-sm`}
      >
        {/* APP TITLE / HEADER */}
        <div className="p-4 d-flex align-items-start justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div
                className="bg-primary rounded-2 p-1 d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
              >
                <FaGraduationCap className="text-white" size={20} />
              </div>
              {isSidebarOpen && (
                <h6 className="fw-bold mb-0 text-white">UniBot AI</h6>
              )}
            </div>

            {isSidebarOpen && (
              <small
                className="text-secondary ps-5"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                {sessions.length.toLocaleString()} CONVERSATIONS
              </small>
            )}
          </div>

          {isSidebarOpen && (
            <button
              className="sidebar-close-btn"
              title="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
            >
              ❮
            </button>
          )}
        </div>

        {/* NEW CHAT BUTTON */}
        <div className="px-3 mb-4">
          <button
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 py-2 new-chat-btn"
            style={{ fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.2)" }}
            onClick={async () => {
              const res = await fetch("http://localhost:5000/chat/new", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify({
                  user_email: localStorage.getItem("email"),
                }),
              });

              const data = await res.json();
              const sessionId = data.session_id;

              setSessions(prev => [...prev, { id: sessionId, title: "New Chat" }]);
              setCurrentSessionId(sessionId);

              navigate(
                `/${user.college_code.toLowerCase()}/${user.role}/chat/${sessionId}`
              );
            }}
          >
            <FaPlus size={14} />
            {isSidebarOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* CHAT LIST */}
        <div className="flex-grow-1 overflow-auto px-2 custom-scrollbar">
          {sessions.length === 0 ? (
            isSidebarOpen && (
              <div className="text-center text-secondary mt-5 px-3">
                <small className="opacity-50">
                  No conversations yet. Start a new chat to begin.
                </small>
              </div>
            )
          ) : (
            sessions.map(s => {
              const isActive = s.id === currentSessionId;

              return (
                <div
                  key={s.id}
                  className={`chat-session-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setCurrentSessionId(s.id);
                    navigate(
                      `/${user.college_code.toLowerCase()}/${user.role}/chat/${s.id}`
                    );
                  }}
                  onMouseEnter={() => setHoverId(s.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <div className="d-flex align-items-center gap-3 w-100">
                    <FaRegCommentDots className="opacity-50" size={14} />

                    <div className="flex-grow-1 text-truncate">
                      {editingId === s.id ? (
                        <input
                          autoFocus
                          className="form-control form-control-sm bg-dark text-white border-primary py-0"
                          style={{ fontSize: "0.85rem" }}
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            setEditingId(null);
                            setEditingTitle("");
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter" && editingTitle.trim()) {
                              saveRename(s.id);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingTitle("");
                            }
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "0.9rem" }}>{s.title}</span>
                      )}
                    </div>

                    {isSidebarOpen && hoverId === s.id && !editingId && (
                      <div
                        className="p-1 hover-dim rounded"
                        onClick={e => {
                          e.stopPropagation();
                          setMenuId(s.id);
                        }}
                      >
                        <FaEllipsisH size={14} />
                      </div>
                    )}
                  </div>

                  {menuId === s.id && (
                    <div
                      ref={menuRef}
                      className="shadow-lg border py-1 bg-white rounded-3 position-absolute"
                      style={{ right: "10px", top: "35px", zIndex: 100, minWidth: "120px" }}
                    >
                      <div
                        className="px-3 py-2 small hover-bg text-dark d-flex align-items-center gap-2"
                        onClick={e => {
                          e.stopPropagation();
                          setMenuId(null);
                          setEditingId(s.id);
                          setEditingTitle(s.title);
                          setOriginalTitle(s.title);
                        }}
                      >
                        <FaEdit size={12} className="text-muted" /> Rename
                      </div>
                      <div
                        className="px-3 py-2 small text-danger hover-bg d-flex align-items-center gap-2"
                        onClick={e => {
                          e.stopPropagation();
                          setMenuId(null);
                          delChat(s.id);
                        }}
                      >
                        <FaTrash size={12} /> Delete
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between">
            <div
              className="d-flex align-items-center gap-2 cursor-pointer profile-pill"
              onClick={() => setShowProfile(true)}
            >
              <FaUserCircle size={35} className="text-primary" />
            </div>
            {isSidebarOpen && <LogoutButton />}
          </div>
        </div>
      </div>

      {/* ===================== SIDEBAR RAIL ===================== */}
      {!isSidebarOpen && (
        <div className="sidebar-rail d-flex flex-column align-items-center py-3">
          <button
            className="rail-action-btn mb-4"
            title="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars size={18} />
          </button>

          <button
            className="rail-action-btn primary mb-3"
            title="New Chat"
            onClick={async () => {
              const res = await fetch("http://localhost:5000/chat/new", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify({
                  user_email: localStorage.getItem("email"),
                }),
              });

              const data = await res.json();
              setSessions(prev => [...prev, { id: data.session_id, title: "New Chat" }]);
              setCurrentSessionId(data.session_id);

              navigate(
                `/${user.college_code.toLowerCase()}/${user.role}/chat/${data.session_id}`
              );
            }}
          >
            <FaPlus size={18} />
          </button>

          <div className="rail-divider mb-3" />

          <div className="rail-icon-indicator mb-auto opacity-25">
            <FaRegComments size={20} />
          </div>

          <div className="d-flex flex-column align-items-center gap-4 pb-2">
            <div onClick={() => setShowProfile(true)}>
              <FaUserCircle
                size={32}
                className="text-primary cursor-pointer hover-scale"
                title="My Profile"
              />
            </div>

            <button
              className="rail-action-btn danger"
              title="Logout"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              <FaPowerOff size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
