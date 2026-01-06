import React, { useState, useEffect } from "react";
import '../App.css';
import LogoutButton from "../components/LogoutButton";
import ReactMarkdown from "react-markdown";
import { useNavigate} from "react-router-dom";
import { FaUserCircle, FaCheck, FaTimes, FaEdit,FaVolumeUp, FaStop} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import PasswordEye from "../components/PasswordEye";




export default function UserChat() {
  
   const user = JSON.parse(localStorage.getItem("user"));
  const [collegeName, setCollegeName] = useState("University ChatBot");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [mode, setMode] = useState("");
const [department_id, setDepartmentId] = useState("");
const [year, setYear] = useState("");
const [semester, setSemester] = useState("");
const [setOriginalTitle] = useState("");
const menuRef = React.useRef(null);
const [filter, setFilter] = useState({
  mode: "",
  department_id: "",
  year: "",
  semester: ""
});
const [showChangePassword, setShowChangePassword] = useState(false);

const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const resetChangePasswordState = () => {
  setShowChangePassword(false);
  setPasswordError("");
  setPasswordForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
};
const [showCurrentPass, setShowCurrentPass] = useState(false);
const [speakingIndex, setSpeakingIndex] = useState(null);
const isSpeechSupported =
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";
const stripMarkdown = (text) => {
  return text
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/[#*_`>-]/g, "")       // remove markdown symbols
    .replace(/\n+/g, " ");          // normalize spacing
};

const [showNewPass, setShowNewPass] = useState(false);
const [showConfirmPass, setShowConfirmPass] = useState(false);
const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
  const saved = localStorage.getItem("sidebar_open");
  if (saved !== null) return saved === "true";
  return window.innerWidth >= 768; // mobile default closed
});
const collegeId = localStorage.getItem("college_id");
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [hoverId, setHoverId] = useState(null);
const [menuId, setMenuId] = useState(null); 
const [editingId, setEditingId] = useState(null);
const [editingTitle, setEditingTitle] = useState("");
const [toastMessage, setToastMessage] = useState("");
const [showToast, setShowToast] = useState(false);
const messagesEndRef = React.useRef(null);
const navigate = useNavigate();
const [editProfile, setEditProfile] = useState(false);
const [profileForm, setProfileForm] = useState({
  _initialized: false,
  username: "",
  email: "",
  department_id: "",
  year: "",
  semester: ""
});
const [departments, setDepartments] = useState([]);
const [copiedIndex, setCopiedIndex] = useState(null);
const copyToClipboard = async (text, index) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  } catch (err) {
    console.error("Copy failed", err);
  }
};

const isNewSessionRef = React.useRef(false);
const [typingSessionId, setTypingSessionId] = useState(null);
useEffect(() => {
  // scroll ONLY if this session is active
  if (!messagesEndRef.current) return;

  messagesEndRef.current.scrollIntoView({
    behavior: "smooth",
  });
}, [
  messages,
  typingSessionId === currentSessionId // 👈 session-aware dependency
]);

useEffect(() => {
  const fetchCollegeName = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/chat/college/${collegeId}`
      );
      const data = await res.json();
      setCollegeName(data.college_name);
    } catch (err) {
      console.error("Failed to fetch college name", err);
    }
  };

  if (collegeId) fetchCollegeName();
}, [collegeId]);
const prevSessionRef = React.useRef(null);

useEffect(() => {
  if (!currentSessionId) return;

  // 🚫 DO NOT clear messages if this is a newly created session
  if (
    prevSessionRef.current &&
    prevSessionRef.current !== currentSessionId &&
    !isNewSessionRef.current
  ) {
    setMessages([]);
  }

  // reset flag after first render
  isNewSessionRef.current = false;

  prevSessionRef.current = currentSessionId;
}, [currentSessionId]);

const speakText = (text, index) => {
  // stop anything already speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));

  utterance.lang = "en-US"; // you can make this dynamic later
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onend = () => {
    setSpeakingIndex(null);
  };

  setSpeakingIndex(index);
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
  window.speechSynthesis.cancel();
  setSpeakingIndex(null);
};
useEffect(() => {
  return () => {
    window.speechSynthesis.cancel();
  };
}, []);



useEffect(() => {
  localStorage.setItem("sidebar_open", isSidebarOpen);
}, [isSidebarOpen]);

useEffect(() => {
  function handleClickOutside(e) {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuId(null);
    }
  }

  if (menuId !== null) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuId]);

const [settings, setSettings] = useState(null);
const [showProfile, setShowProfile] = useState(false);
const displayRole = user?.role === "user"
  ? "STUDENT"
  : (user?.role || "").toUpperCase();

const [confirmAccountDelete, setConfirmAccountDelete] = useState(false);
const [deletingAccount, setDeletingAccount] = useState(false);
const closeProfile = () => {
  setShowProfile(false);
  setEditProfile(false);

  // 🔥 RESET CHANGE PASSWORD STATE
  resetChangePasswordState();

  // 🔥 RESET DELETE STATE
  setConfirmAccountDelete(false);
  setDeletingAccount(false);

  // optional: clear password fields
  setPasswordForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
};
const [passwordError, setPasswordError] = useState("");


const isAcademicMode = mode === "Academic";
const isFilterIncomplete =
  !filter.mode ||
  (filter.mode === "Academic" &&
 (!filter.department_id || !filter.year || !filter.semester))


const textareaRef = React.useRef(null);



const fetchSettingsIfNeeded = async () => {
  if (settings) return; // ✅ already fetched, don't refetch

  if (!collegeId) return;

  try {
    const res = await fetch(
      `http://localhost:5000/college/settings/${collegeId}`
    );
    const data = await res.json();
    setSettings(data);
  } catch (err) {
    console.error("Failed to load settings:", err);
  }
};

useEffect(() => {
  if (!showProfile) return;

  fetchSettingsIfNeeded(); // 👈 ensures Year & Semester load in profile form
}, [showProfile]);


useEffect(() => {
  if (!collegeId) return;

  fetch(`http://localhost:5000/departments/academic/${collegeId}`)
    .then(res => res.json())
    .then(data => setDepartments(data))
    .catch(console.error);
}, [collegeId]);


useEffect(() => {
  if (!showProfile || !user) return;

  setProfileForm(prev => {
    // 👇 prevent overwriting user edits
    if (prev._initialized) return prev;

    return {
      _initialized: true, // 👈 flag
      username: user.username || "",
      email: user.email || "",
      department_id: user.department_id
        ? String(user.department_id)
        : "",
      year: user.year ? String(user.year) : "",
      semester: user.semester ? String(user.semester) : ""
    };
  });
}, [showProfile, user]);


useEffect(() => {
  if (mode !== "Academic") {
    // 🔥 Clear academic-only filters
    setDepartmentId("");
    setYear("");
    setSemester("");

    setFilter(prev => ({
      ...prev,
      department_id: "",
      year: "",
      semester: ""
    }));
  }
}, [mode]);


useEffect(() => {
  async function loadSessions() {
    const email = localStorage.getItem("email");

    const res = await fetch(
      `http://localhost:5000/chat/list?user_email=${email}`,
      {
        headers: { Authorization: localStorage.getItem("token") }
      }
    );

    // 🔥 HANDLE ACCOUNT DELETED
    if (res.status === 401) {
      alert("⚠ Your account has been deleted. Logging out...");
      localStorage.clear();
      setTimeout(() => (window.location.href = "/"), 800);
      return;
    }

    if (!res.ok) return;

    const data = await res.json();
    setSessions(data);

  }

  loadSessions();
}, []);

 

React.useEffect(() => {
  async function loadMessages() {
    if (!currentSessionId) return;

    const exists = sessions.some(s => s.id === currentSessionId);
    if (!exists) return;

    const res = await fetch(
      `http://localhost:5000/chat/${currentSessionId}/messages`,
      {
        headers: { Authorization: localStorage.getItem("token") },
      }
    );

    if (res.status === 401) {
      alert("⚠ Your account has been deleted. Logging out...");
      localStorage.clear();
      setTimeout(() => (window.location.href = "/"), 800);
      return;
    }

    const data = await res.json();

if (data.length > 0) {
  setMessages(
    data.map(m => ({
      ...m,
      final: m.role === "assistant"   
    }))
  );
}

  }

  loadMessages();
}, [currentSessionId, sessions]);






const handleApply = () => {
  // store filters in some state e.g filterState
 setFilter({
  mode,
  department_id,
  year,
  semester
});

};

function typeAssistantMessage(fullText) {
  let index = 0;

  setMessages(prev => [...prev, { role: "assistant", content: "", final: false }]);

  const interval = setInterval(() => {
    index++;

    setMessages(prev => {
      const last = prev[prev.length - 1];

      // Stop when finished
      if (index > fullText.length) {
        clearInterval(interval);
        return [...prev.slice(0, -1), { ...last, content: fullText, final: true }];
      }

      return [...prev.slice(0, -1), { ...last, content: fullText.slice(0, index) }];
    });
  }, 15); // typing speed (lower = faster)
}


async function sendMessage() {
  if (!input.trim()) return;

  const userMessage = input;
  

  let sessionId = currentSessionId;

  if (!sessionId) {
  const res = await fetch("http://localhost:5000/chat/new", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify({ user_email: localStorage.getItem("email") }),
  });

  const data = await res.json();
  sessionId = data.session_id;

  isNewSessionRef.current = true; // ✅ MARK NEW SESSION

  setSessions(prev => [...prev, { id: sessionId, title: "New Chat" }]);
  setCurrentSessionId(sessionId);

  navigate(`/${user.college_code.toLowerCase()}/${user.role}/chat/${sessionId}`);
}

  setInput("");
    if (textareaRef.current) {
    textareaRef.current.style.height = "38px";
  }

  // ✅ ALWAYS show user message immediately
  setMessages(prev => [...prev, { role: "user", content: userMessage }]);

  setTypingSessionId(sessionId);

  try {
    const res = await fetch(`http://localhost:5000/chat/${sessionId}/send`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        message: userMessage,
        mode,
        department_id: department_id || null,
        year,
        semester,
      }),
    });

    if (res.status === 410) return;

    const data = await res.json();
    typeAssistantMessage(data.answer);

  } finally {
    setTypingSessionId(null);
  }
}



async function saveRename(id){
  await fetch(`http://localhost:5000/chat/${id}/rename`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "Authorization": localStorage.getItem("token")
  },
  body: JSON.stringify({ title: editingTitle })
});


  setSessions(sessions.map(x => x.id===id ? {...x,title:editingTitle} : x))
  setEditingId(null)
  setEditingTitle("")
}

async function delChat(id){
 await fetch(`http://localhost:5000/chat/${id}`, {
  method: "DELETE",
  headers: {
    "Authorization": localStorage.getItem("token")
  }
});

  setSessions(sessions.filter(x => x.id!==id))
  if(currentSessionId===id) setCurrentSessionId(null)
  setMessages([])

  // 🔥 FIX: redirect to base user page
  const user = JSON.parse(localStorage.getItem("user"));
  navigate(`/${user.college_code.toLowerCase()}/${user.role}/chat`);
}

const adjustTextareaHeight = (el) => {
  if (!el) return;

  el.style.height = "auto";

  const maxHeight = 120; // ~4 lines
  el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
};

const handleSaveProfile = async () => {
  try {
    const res = await fetch("http://localhost:5000/user/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(profileForm),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update profile");
      return;
    }

    const data = await res.json();

    // 🔄 update localStorage user
    localStorage.setItem("user", JSON.stringify(data.user));

    setEditProfile(false);
  } catch (err) {
    console.error("Update profile error:", err);
  }
};
// 🔹 OPEN EDIT PROFILE HANDLER
const openEditProfile = async () => {
  await fetchSettingsIfNeeded();

 setProfileForm(prev => ({
  ...prev, // 👈 KEEP initialized values
  username: user?.username || "",
  email: user?.email || ""
}));


  setEditProfile(true);
};

const handleChangePassword = async () => {
  setPasswordError("");

  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  // 🔐 Frontend validations
  if (!currentPassword) {
    setPasswordError("Please enter your current password");
    return;
  }

  if (!newPassword) {
    setPasswordError("Please enter a new password");
    return;
  }

  if (newPassword.length < 6) {
    setPasswordError("New password must be at least 6 characters long");
    return;
  }

  if (!confirmPassword) {
    setPasswordError("Please confirm your new password");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("Confirm password does not match new password");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();

    // ❌ Backend validation (current password mismatch)
    if (!res.ok) {
      setPasswordError(data.error || "Current password is incorrect");
      return;
    }

    setToastMessage("Password changed successfully");
setShowToast(true);

resetChangePasswordState(); // closes & clears form



  } catch (err) {
    console.error(err);
    setPasswordError("Server error. Please try again later.");
  }
};
useEffect(() => {
  if (!showToast) return;

  const t = setTimeout(() => setShowToast(false), 3000);
  return () => clearTimeout(t);
}, [showToast]);



  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>


      
{/* SIDEBAR */}
<div
  className={`sidebar ${
    isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
  }`}
>

  {/* APP TITLE */}
  <div className="mb-3">
    <h5 className="fw-bold mb-1">🎓 University Chatbot</h5>
    <small className="text-secondary">
      {sessions.length} conversation{sessions.length !== 1 && "s"}
    </small>
  </div>

  {/* NEW CHAT BUTTON */}
  <button
    className="btn btn-sm btn-light mb-3 w-100 fw-semibold"
    onClick={async () => {
      const res = await fetch("http://localhost:5000/chat/new", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
        body: JSON.stringify({ user_email: localStorage.getItem("email") }),
      });

      const data = await res.json();
      const sessionId = data.session_id;


setSessions(prev => [
  ...prev,
  { id: sessionId, title: "New Chat" }
]);


      setCurrentSessionId(sessionId);

      const user = JSON.parse(localStorage.getItem("user"));
      navigate(`/${user.college_code.toLowerCase()}/${user.role}/chat/${sessionId}`);
    }}
  >
    ➕ New Chat
  </button>

  {/* CHAT LIST */}
  <div className="flex-grow-1 overflow-auto">
    {sessions.length === 0 && (
      <div className="text-center text-secondary mt-4">
        <p className="mb-1">No conversations yet</p>
        <small>Start a new chat to begin</small>
      </div>
    )}

    {sessions.map((s) => {
      const isActive = s.id === currentSessionId;

      return (
        <div
          key={s.id}
          onClick={() => {
            setCurrentSessionId(s.id);
            const user = JSON.parse(localStorage.getItem("user"));
            navigate(`/${user.college_code.toLowerCase()}/${user.role}/chat/${s.id}`);
          }}
          onMouseEnter={() => setHoverId(s.id)}
          onMouseLeave={() => setHoverId(null)}
          style={{
            background: isActive ? "#3f4a5a" : "#2c323c",
            borderLeft: isActive ? "4px solid #0d6efd" : "4px solid transparent",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s ease",
          }}
        >
          {/* CHAT TITLE */}
          {editingId === s.id ? (
        <input
  autoFocus
  value={editingTitle}
  onChange={(e) => setEditingTitle(e.target.value)}
  onBlur={() => {
    setEditingId(null);
    setEditingTitle("");
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && editingTitle.trim()) {
      saveRename(s.id);
    }

    if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  }}
  className="form-control form-control-sm"
/>

          ) : (
            <div className="fw-semibold text-truncate">
              💬 {s.title}
            </div>
          )}

          {/* MENU */}
          {hoverId === s.id && (
        <div
  className="chat-menu-btn"
  onClick={(e) => {
    e.stopPropagation();
    setMenuId(s.id);
  }}
>
  ⋮
</div>

          )}
{menuId === s.id && (
  <div
    ref={menuRef}
    style={{
      position: "absolute",
      right: "8px",
      top: "28px",
      background: "white",
      color: "black",
      borderRadius: "6px",
      padding: "4px 0",
      zIndex: 10,
      minWidth: "100px",
    }}
  >

              <div
                className="px-3 py-1 hover-bg"
                style={{ cursor: "pointer" }}
                onClick={() => {
  setMenuId(null);
  setEditingId(s.id);
  setEditingTitle(s.title);
  setOriginalTitle(s.title);
}}

              >
                ✏️ Rename
              </div>
              <div
                className="px-3 py-1 text-danger"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setMenuId(null);
                  delChat(s.id);
                }}
              >
                🗑 Delete
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>



{/* FOOTER */}
<div className="mt-auto d-flex align-items-center gap-3 px-2">
  {/* PROFILE ICON */}
  <FaUserCircle
    size={40}
    className="text-light cursor-pointer"
    title="My Profile"
    onClick={() => setShowProfile(true)}
  />

  {/* LOGOUT */}
  <LogoutButton />
</div>



</div>


{/* COLLAPSED ICON RAIL */}
{!isSidebarOpen && (
  <div className="sidebar-rail">
    {/* Open Sidebar */}
    <button
      className="rail-btn"
      title="Open sidebar"
      onClick={() => setIsSidebarOpen(true)}
    >
      ☰
    </button>

    {/* New Chat */}
    <button
      className="rail-btn"
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
        setSessions(prev => [
          ...prev,
          { id: data.session_id, title: "New Chat" },
        ]);
        setCurrentSessionId(data.session_id);

        const user = JSON.parse(localStorage.getItem("user"));
        navigate(
          `/${user.college_code.toLowerCase()}/${user.role}/chat/${data.session_id}`
        );
      }}
    >
      ➕
    </button>

    {/* Spacer */}
    <div className="rail-spacer" />
     <FaUserCircle
    size={40}
    className="text-light cursor-pointer"
    title="My Profile"
    onClick={() => setShowProfile(true)}
  />

    {/* Logout */}
    <button
      className="rail-btn danger"
      title="Logout"
      onClick={() => {
        localStorage.clear();
        window.location.href = "/";
      }}
    >
      ⏻
    </button>
    
  </div>
)}



{/* MAIN CHAT AREA */}
<div
  className="flex-grow-1 d-flex flex-column bg-light"
  style={{
    marginLeft: isSidebarOpen ? "260px" : "56px",
    transition: "margin-left 0.3s ease",
    height: "100vh",
  }}
>





{/* HEADER */}
<div className="p-3 border-bottom d-flex align-items-center gap-2 bg-white">
  {isSidebarOpen && (
    <button
      className="btn btn-outline-secondary"
      onClick={() => setIsSidebarOpen(false)}
    >
      ❮
    </button>
  )}

  <h5 className="fw-bold mb-0 text-truncate">
    {collegeName || "University ChatBot"}
  </h5>
</div>



  {/* FILTER BAR (fixed) */}
  <div className="p-2 border-bottom bg-white d-flex gap-2">

    {/* MODE */}
    <select
      className="form-select form-select-sm"
      style={{ maxWidth: "150px" }}
      value={mode}
      onChange={(e) => setMode(e.target.value)}
    >
      <option value="">Mode</option>
      <option value="Campus">Campus</option>
      <option value="Academic">Academic</option>
      <option value="Staff">Staff</option>
      <option value="Sports">Sports</option>
      <option value="Administration">Administration</option>
      <option value="Scholarship">Scholarship</option>
      <option value="Training and Placement">Training and Placement</option>
    </select>

    {/* DEPARTMENT */}
<select
  className="form-select form-select-sm"
  style={{ maxWidth: "250px" }}
  value={department_id}
  onChange={(e) => setDepartmentId(e.target.value)}
  disabled={mode !== "Academic"}
>
  <option value="">Department</option>

  {departments.map(d => (
    <option key={d.id} value={String(d.id)}>
      {d.name}
    </option>
  ))}

  <option value="all">All</option>
</select>


    {/* YEAR */}
<select
  className="form-select form-select-sm"
  style={{ maxWidth: "100px" }}
  value={year}
  disabled={!isAcademicMode}
  onFocus={fetchSettingsIfNeeded}   // 👈 FETCH ON CLICK
  onChange={(e) => {
    setYear(e.target.value);
    setFilter(prev => ({ ...prev, year: e.target.value }));
  }}
>
  <option value="">Year</option>

  {settings ? (
    Array.from({ length: settings.total_years || 0 }, (_, i) => (
      <option key={i + 1} value={i + 1}>{i + 1}</option>
    ))
  ) : (
    <option disabled>Loading...</option>
  )}
</select>




    {/* SEMESTER */}
<select
  className="form-select form-select-sm"
  style={{ maxWidth: "100px" }}
  value={semester}
  disabled={!isAcademicMode}
  onFocus={fetchSettingsIfNeeded}   // 👈 FETCH ON CLICK
  onChange={(e) => {
    setSemester(e.target.value);
    setFilter(prev => ({ ...prev, semester: e.target.value }));
  }}
>
  <option value="">Semester</option>

  {settings ? (
    Array.from({ length: settings.total_semesters || 0 }, (_, i) => (
      <option key={i + 1} value={i + 1}>{i + 1}</option>
    ))
  ) : (
    <option disabled>Loading...</option>
  )}
</select>




    <button
  className="btn btn-sm btn-primary ms-1"
  style={{
    boxShadow: isFilterIncomplete ? "0 0 6px 2px rgba(0, 123, 255, 0.6)" : "none",
    transition: "box-shadow 0.3s ease-in-out"
  }}
  onClick={handleApply}
>
  Apply
</button>

  </div>

  {/* MESSAGES (only this scrolls) */}
  <div
    className="flex-grow-1 overflow-auto"
    style={{ padding: "16px" }}
  >
{messages.map((m, i) => (
  <div key={i} className={m.role === "user" ? "text-end" : "text-start"}>
<div
  className="p-2 mb-2 position-relative"
  style={{
    background: m.role === "user" ? "#d1e7dd" : "#fff",
    display: "inline-block",
    borderRadius: "8px",
    maxWidth: m.role === "user" ? "75%" : "65%",
    wordWrap: "break-word",
    textAlign: "left"
  }}
>
  <ReactMarkdown>{m.content}</ReactMarkdown>
{m.role === "assistant" && m.final && (
  <button
    className="btn btn-sm btn-light"
    style={{
      position: "absolute",
      bottom: "6px",
      right: "6px",
      padding: "4px 6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
    title={copiedIndex === i ? "Copied" : "Copy"}
    onClick={() => copyToClipboard(m.content, i)}
  >
    {copiedIndex === i ? (
      <FaCheck size={12} color="#198754" />   // ✅ green check
    ) : (
     <MdContentCopy size={12} />
    )}
  </button>
)}
  {isSpeechSupported && m.role === "assistant" && m.final && (
    <button
      className="btn btn-sm btn-light"
      style={{
        position: "absolute",
        bottom: "6px",
        right: "36px", // space from copy icon
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      title={speakingIndex === i ? "Stop reading" : "Read aloud"}
      onClick={() =>
        speakingIndex === i
          ? stopSpeaking()
          : speakText(m.content, i)
      }
    >
      {speakingIndex === i ? (
        <FaStop size={12} color="#000000ff" />
      ) : (
        <FaVolumeUp size={12} />
      )}
    </button>
  )}

</div>

  </div>
))}

{currentSessionId &&
 typingSessionId === currentSessionId && (
  <div className="text-start mb-3">
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
)}


<div ref={messagesEndRef} />


    {messages.length === 0 && (
      <p className="text-muted text-center mt-5">How Can I Assist You Today..?</p>
    )}
  </div>

        {/* input area */}
        
<div
  className="p-3 border-top bg-white"
  style={{
    position:"sticky",
    bottom:0,
    zIndex:20
  }}
>

<div
  className="input-group align-items-end"
  style={{ flexWrap: "nowrap" }}
>
<textarea
  ref={textareaRef}                 // 👈 IMPORTANT
  className="form-control"
  value={input}
  placeholder={
    !filter.mode
      ? "Apply filters first"
      : (filter.mode === "Academic" &&
 (!filter.department_id || !filter.year || !filter.semester))

      ? "Apply department, year & semester first"
      : "Type your question..."
  }
  onChange={(e) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey && !isFilterIncomplete) {
      e.preventDefault();
      sendMessage();
    }
  }}
  disabled={isFilterIncomplete}
  rows={1}
  style={{
    resize: "none",
    overflowY: "auto",
    maxHeight: "120px",
    minHeight: "38px",
    lineHeight: "1.5",
    boxSizing: "border-box"
  }}
/>





  <button
    className="btn btn-primary"
    onClick={() => {
      if (!isFilterIncomplete) sendMessage();
    }}
    disabled={isFilterIncomplete}
  >
    ➤
  </button>
</div>

        </div>
      </div>
      {showProfile && (
  <>
    {/* BACKDROP */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 9998 }}
      onClick={closeProfile}
    />

    {/* MODAL */}
    <div
      className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow p-4"
      style={{ width: "360px", zIndex: 9999 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
  <h5 className="fw-bold mb-0">👤 My Profile</h5>

  {/* EDIT ICON */}
  {!showChangePassword && (
  <FaEdit
    title="Edit Profile"
    style={{ cursor: "pointer" }}
    onClick={openEditProfile}
  />
)}
</div>


 {/* PROFILE CONTENT */}
{showChangePassword ? (
  /* 🔐 CHANGE PASSWORD FORM */
  <>
    <h6 className="fw-bold mb-3">🔒 Change Password</h6>

    <label className="form-label small">Current Password</label>
    <div style={{ position: "relative" }}>
  <input
    type={showCurrentPass ? "text" : "password"}
    className="form-control mb-2"
    value={passwordForm.currentPassword}
    onChange={e =>
      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
    }
  />

  <PasswordEye
    visible={showCurrentPass}
    onToggle={() => setShowCurrentPass(v => !v)}
  />
</div>


    <label className="form-label small">New Password</label>

<div style={{ position: "relative" }}>
  <input
    type={showNewPass ? "text" : "password"}
    className="form-control mb-2"
    value={passwordForm.newPassword}
    onChange={e =>
      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
    }
  />

  <PasswordEye
    visible={showNewPass}
    onToggle={() => setShowNewPass(v => !v)}
  />
</div>



    <label className="form-label small">Confirm New Password</label>
    <div style={{ position: "relative" }}>
  <input
    type={showConfirmPass ? "text" : "password"}
    className="form-control mb-3"
    value={passwordForm.confirmPassword}
    onChange={e =>
      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
    }
  />

  <PasswordEye
    visible={showConfirmPass}
    onToggle={() => setShowConfirmPass(v => !v)}
  />
</div>

{passwordError && (
    <div className="alert alert-danger py-2 mb-3">
      {passwordError}
    </div>
  )}

    <div className="d-flex gap-2">
      <button
        className="btn btn-primary w-50"
        onClick={handleChangePassword}
      >
        Update
      </button>

      <button
        className="btn btn-secondary w-50"
        onClick={resetChangePasswordState}
      >
        Cancel
      </button>
    </div>
  </>
) :editProfile ? (
  <>
    {/* NAME */}
    <label className="form-label small">Name</label>
    <input
      className="form-control mb-2"
      value={profileForm.username}
      onChange={e =>
        setProfileForm({ ...profileForm, username: e.target.value })
      }
    />

    {/* EMAIL */}
    <label className="form-label small">Email</label>
    <input
      className="form-control mb-2"
      value={profileForm.email}
      onChange={e =>
        setProfileForm({ ...profileForm, email: e.target.value })
      }
    />

    {/* DEPARTMENT */}
    <label className="form-label small">Department</label>
<select
  className="form-select mb-2"
  value={String(profileForm.department_id || "")}
  onChange={e =>
    setProfileForm({
      ...profileForm,
      department_id: e.target.value
    })
  }
>
  <option value="">Select</option>

  {departments.map(d => (
    <option key={d.id} value={d.id}>
      {d.name}
    </option>
  ))}
</select>


    {/* YEAR */}
    <label className="form-label small">Year</label>
<select
  className="form-select mb-2"
  value={profileForm.year || ""}
  onChange={e =>
    setProfileForm(prev => ({
      ...prev,
      year: e.target.value
    }))
  }
>

  <option value="">Select</option>
  {Array.from({ length: settings?.total_years || 0 }, (_, i) => (
    <option key={i + 1} value={String(i + 1)}>
      {i + 1}
    </option>
  ))}
</select>


    {/* SEMESTER */}
    <label className="form-label small">Semester</label>
<select
  className="form-select mb-3"
  value={profileForm.semester || ""}
  onChange={e =>
    setProfileForm(prev => ({
      ...prev,
      semester: e.target.value
    }))
  }
>

  <option value="">Select</option>
  {Array.from({ length: settings?.total_semesters || 0 }, (_, i) => (
    <option key={i + 1} value={String(i + 1)}>
      {i + 1}
    </option>
  ))}
</select>


    {/* ACTIONS */}
    <div className="d-flex gap-2">
      <button
        className="btn btn-primary w-50"
        onClick={handleSaveProfile}
      >
        Save
      </button>

      <button
        className="btn btn-secondary w-50"
        onClick={() => setEditProfile(false)}
      >
        Cancel
      </button>
    </div>
  </>
) : (
<>
  {/* READ-ONLY VIEW */}
  <div className="small text-muted mb-2">
    <strong>Name:</strong> {user?.username}
  </div>

  <div className="small text-muted mb-2">
    <strong>Email:</strong> {user?.email}
  </div>

  <div className="small text-muted mb-2">
    <strong>Department:</strong> {user?.department || "—"}
  </div>

  <div className="small text-muted mb-2">
    <strong>Year:</strong> {user?.year || "—"}
  </div>

  <div className="small text-muted mb-2">
    <strong>Semester:</strong> {user?.semester || "—"}
  </div>

  <div className="small text-muted mb-3">
    <strong>Role:</strong> {displayRole}
  </div>

{/* ACTION BUTTONS */}
<div className="d-flex gap-3 mt-3 align-items-center">

  {/* UPDATE BUTTON — HIDDEN WHEN DELETE CONFIRMATION ACTIVE */}
{!confirmAccountDelete && (
  <button
    className="btn btn-sm btn-outline-secondary w-50"
    onClick={() => {
      setShowChangePassword(true);
      setEditProfile(false);
    }}
  >
    🔒 Change Password
  </button>
)}



  {/* DELETE / CONFIRM AREA */}
  {!confirmAccountDelete ? (
    <button
      className="btn btn-outline-danger w-50"
      onClick={() => setConfirmAccountDelete(true)}
    >
      🗑 Delete
    </button>
  ) : (
    <div className="d-flex align-items-center gap-3 text-danger">
      <span className="small">Are you sure? Your Account will be permanently deleted</span>

      {/* ✔ CONFIRM */}
      <FaCheck
        title="Confirm delete"
        size={18}
        style={{
          cursor: deletingAccount ? "not-allowed" : "pointer",
          opacity: deletingAccount ? 0.6 : 1
        }}
        onClick={async () => {
          if (deletingAccount) return;

          setDeletingAccount(true);

          try {
            const res = await fetch(
              "http://localhost:5000/user/delete-account",
              {
                method: "DELETE",
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            if (!res.ok) {
              setDeletingAccount(false);
              return;
            }

            localStorage.clear();
            window.location.href = "/";
          } catch (err) {
            console.error(err);
            setDeletingAccount(false);
          }
        }}
      />

      {/* ❌ CANCEL */}
      <FaTimes
        title="Cancel"
        size={18}
        style={{ cursor: "pointer", color: "#6c757d" }}
        onClick={() => {
          setConfirmAccountDelete(false);
          setDeletingAccount(false);
        }}
      />
    </div>
  )}
</div>

        <button
        className="btn btn-sm btn-secondary w-100 mt-3"
        onClick={closeProfile}
      >
        Close
      </button>
</>

)}


    </div>
  </>
)}
{showToast && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#198754",
      color: "white",
      padding: "10px 16px",
      borderRadius: "6px",
      zIndex: 10000,
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
    }}
  >
    {toastMessage}
  </div>
)}

    </div>
  );
}
