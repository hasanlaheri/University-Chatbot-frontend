import React from "react";
import ReactMarkdown from "react-markdown";
import {
  FaGraduationCap,
  FaFilter,
  FaCheck,
  FaStop,
  FaVolumeUp,
  FaPaperPlane,
  FaChevronUp,
  FaChevronDown

} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";

export default function ChatLayout({
  /* layout */
  isSidebarOpen,

  /* header */
  collegeName,
  isFilterIncomplete,
  showFilterShelf,
  setShowFilterShelf,

  /* filters */
  mode,
  setMode,
  department_id,
  setDepartmentId,
  year,
  setYear,
  semester,
  setSemester,
  subject,
  setSubject,
  availableSubjects,
  isAcademicMode,
  departments,
  settings,
  fetchSettingsIfNeeded,
  handleApply,

  /* messages */
  messages,
  copyToClipboard,
  copiedIndex,
  isSpeechSupported,
  speakingIndex,
  speakText,
  stopSpeaking,
  currentSessionId,
  typingSessionId,
  messagesEndRef,

  /* input */
  input,
  setInput,
  textareaRef,
  adjustTextareaHeight,
  sendMessage
}) {
  return (
    <div
      className="flex-grow-1 d-flex flex-column"
      style={{
        marginLeft: isSidebarOpen ? "260px" : "80px",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100vh",
        backgroundColor: "#f8f9fa"
      }}
    >
      {/* ================= HEADER ================= */}
      <header
        className="chat-header-pro d-flex align-items-center px-4 shadow-sm bg-white"
        style={{ height: "64px", zIndex: 10 }}
      >
        <div className="d-flex flex-column">
          <h6 className="fw-bold mb-0 text-dark">
            {collegeName || "University AI Assistant"}
          </h6>
          <div className="d-flex align-items-center gap-2">
            <span
              className={`dot ${
                isFilterIncomplete ? "bg-warning" : "bg-success"
              }`}
            />
            <small className="text-muted" style={{ fontSize: "12px" }}>
              {isFilterIncomplete ? "Awaiting Context..." : "Ready to help"}
            </small>
          </div>
        </div>
   {/* TOGGLE BUTTON (Shifted to Right Side) */}
<button
  className="btn d-flex align-items-center gap-3 shadow-sm ms-auto"
  onClick={() => setShowFilterShelf(!showFilterShelf)}
  style={{
    backgroundColor: "#ffffff",
    border: "1px solid",
    borderColor: showFilterShelf ? "#1e293b" : "#e2e8f0",
    borderRadius: "12px",
    padding: "10px 18px",
    color: "#475569",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: "160px", // Maintains consistent width during state change
    justifyContent: "space-between"
  }}
>
  <div className="d-flex align-items-center gap-2">
    <FaFilter 
      size={12} 
      className={showFilterShelf ? "text-info" : "text-muted"} 
      style={{ transition: "0.3s" }}
    />
    <span
      className="fw-bold"
      style={{ 
        fontSize: "0.75rem", 
        letterSpacing: "0.8px", 
        textTransform: "uppercase" 
      }}
    >
      Filters
    </span>
  </div>

  <div className="d-flex align-items-center gap-2">
    {/* Notification Dot for Incomplete Filters */}
    {isFilterIncomplete && !showFilterShelf && (
      <span className="position-relative d-flex" style={{ width: "8px", height: "8px" }}>
        <span className="animate-ping position-absolute inline-flex h-100 w-100 rounded-full bg-warning opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
      </span>
    )}

    {/* Directional Arrow */}
    {showFilterShelf ? (
      <FaChevronUp size={10} className="opacity-75 animate-fade-in" />
    ) : (
      <FaChevronDown size={10} className="opacity-75 animate-fade-in" />
    )}
  </div>
</button>
  
      </header>

      

      {/* ================= FILTER BAR ================= */}
      {showFilterShelf && (
      <div className="filter-shelf bg-white border-bottom px-4 py-2 d-flex align-items-center gap-2 flex-wrap">
        
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            className="form-select border-0 bg-transparent py-1 shadow-none"
            style={{ fontSize: "0.85rem" }}
            value={mode}
            onChange={e => setMode(e.target.value)}
          >
            <option value="">Select Mode</option>
            <option value="Campus">Campus</option>
            <option value="Academic">Academic</option>
            <option value="Staff">Staff</option>
            <option value="Sports">Sports</option>
            <option value="Administration">Administration</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Training and Placement">
              Training & Placement
            </option>
          </select>
        </div>

        {mode === "Academic" && (
          <div className="filter-group animate-fade-in">
            <select
              className="form-select border-0 bg-transparent py-1 shadow-none"
              value={department_id}
              onChange={e => setDepartmentId(e.target.value)}
            >
              <option value="">Department</option>
              {departments.map(d => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
              {/* <option value="all">All Departments</option> */}
            </select>
          </div>
        )}

        {isAcademicMode && (
          <div className="d-flex gap-2 animate-fade-in">
            <div className="filter-group mini">
              <select
                className="form-select border-0 bg-transparent py-1 shadow-none"
                value={year}
                onFocus={fetchSettingsIfNeeded}
                onChange={e => setYear(e.target.value)}
              >
                <option value="">Year</option>
                {settings &&
                  Array.from(
                    { length: settings.total_years },
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    )
                  )}
              </select>
            </div>

            <div className="filter-group mini">
              <select
                className="form-select border-0 bg-transparent py-1 shadow-none"
                value={semester}
                onFocus={fetchSettingsIfNeeded}
                onChange={e => setSemester(e.target.value)}
              >
                <option value="">Sem</option>
                {settings &&
                  Array.from(
                    { length: settings.total_semesters },
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    )
                  )}
              </select>
            </div>
            {/* NEW: SUBJECT SELECT */}
      <div className={`filter-group ${!year || !semester ? 'opacity-50' : 'animate-fade-in'}`}>
        <select
          className="form-select border-0 bg-transparent py-1 shadow-none"
          style={{ fontSize: "0.85rem", minWidth: "120px" }}
          value={subject || ""}
          disabled={!year || !semester}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="">{!year || !semester ? "Select Sem first" : "All Subjects"}</option>
          {availableSubjects && availableSubjects.map((sub, idx) => (
            <option key={idx} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>
    
          </div>
        )}
        
{/* ACTIONS GROUP */}
    <div className="ms-auto d-flex align-items-center gap-2">
      
      {/* CLEAR FILTERS BUTTON */}
      <button
        className="btn btn-sm text-muted hover-text-danger d-flex align-items-center gap-1 border-0 bg-transparent px-3"
        style={{ fontSize: "0.8rem", fontWeight: "600" }}
        onClick={() => {
          setMode("");
          setDepartmentId("");
          setYear("");
          setSemester("");
          setSubject("");
          handleApply(true);
          // If you have a specific clear function passed as a prop, call it here
        }}
      >
        <svg size={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px' }}>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset
      </button>

      {/* APPLY FILTERS BUTTON */}
      <button
        className={`btn btn-sm rounded-pill px-4 ${
          isFilterIncomplete
            ? "btn-outline-primary"
            : "btn-primary shadow-sm"
        }`}
        style={{ fontWeight: "600" }}
        onClick={handleApply}
      >
        Apply 
      </button>

    </div>
  </div>
)}

      {/* ================= MESSAGES ================= */}
      <div className="flex-grow-1 overflow-auto px-3 px-md-5 py-4 custom-chat-scrollbar">
        <div className="max-width-container mx-auto" style={{ maxWidth: 850 }}>
          {messages.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center mt-5 opacity-50">
              <FaGraduationCap size={48} className="mb-3 text-primary" />
              <h5 className="fw-light">Welcome to University AI</h5>
              <p className="small">
                Set your filters above to start the conversation
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`d-flex mb-4 ${
                  m.role === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
    className={
      m.role === "user"
        ? "message-bubble-pro user-bubble" // Keep user bubble for contrast
        : "ai-message-minimal"            // New minimal style for AI
    }
  >
                  <div className="bubble-content">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>

                  {m.role === "assistant" && m.final && (
                    <div className="bubble-actions d-flex gap-3 mt-1 justify-content-start">
                      <button
                        className="action-btn-mini"
                        onClick={() => copyToClipboard(m.content, i)}
                      >
                        {copiedIndex === i ? (
                          <FaCheck className="text-success" />
                        ) : (
                          <MdContentCopy />
                        )}
                      </button>

                      {isSpeechSupported && (
                        <button
                          className="action-btn-mini"
                          onClick={() =>
                            speakingIndex === i
                              ? stopSpeaking()
                              : speakText(m.content, i)
                          }
                        >
                          {speakingIndex === i ? (
                            <FaStop />
                          ) : (
                            <FaVolumeUp />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

{currentSessionId && typingSessionId === currentSessionId && (
  <div className="d-flex mb-4 animate-fade-in align-items-center gap-3">
    {/* Minimalist Icon - no container */}
    <FaGraduationCap className="text-primary opacity-50" size={20} />
    
    <div className="d-flex flex-column justify-content-center">
      <div className="d-flex align-items-center gap-2">
        <span 
          className="fw-bold text-muted" 
          style={{ 
            fontSize: '11px', 
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}
        >
          Thinking
        </span>
        {/* Sleek inline dots */}
        <div className="minimal-typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  </div>
)}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ================= INPUT ================= */}
     <div
  className="p-3 p-md-4"
  style={{
    backgroundColor: "transparent",
    position: "relative",
    height: "120px"
  }}
>
  <div
    className="max-width-container mx-auto"
    style={{
      maxWidth: 850,
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      margin: "auto",
      zIndex: 10
    }}
  >
          <div
            className={`input-container-pro shadow-sm ${
              isFilterIncomplete ? "disabled-ui" : ""
            }`}
          >
            <textarea
              ref={textareaRef}
              className="form-control pro-textarea border-0"
              value={input}
              placeholder={
                isFilterIncomplete
                  ? "Apply filter above to chat..."
                  : "Ask a university related question..."
              }
              onChange={e => {
                setInput(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              onKeyDown={e => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !isFilterIncomplete
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isFilterIncomplete}
              rows={1}
            />
            <button
              className={`send-btn-pro ${
                !input.trim() || isFilterIncomplete
                  ? "opacity-25"
                  : "active"
              }`}
              onClick={() =>
                !isFilterIncomplete && input.trim() && sendMessage()
              }
              disabled={isFilterIncomplete}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>

          <p
            className="text-center text-muted mt-2 mb-0"
            style={{ fontSize: "10px" }}
          >
            AI can make mistakes. Verify important information with
            university staff.
          </p>
        </div>
      </div>
    </div>
  );
}
