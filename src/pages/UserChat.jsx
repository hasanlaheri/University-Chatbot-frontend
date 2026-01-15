import React, { useState, useEffect } from "react";
import "../styles/chat.css";
import Sidebar from "../components/chat/Sidebar";
import ProfileModal from "../components/chat/ProfileModal";
import ChatLayout from "../components/chat/ChatLayout";
import { useNavigate} from "react-router-dom";
import { authFetch } from "../utils/AuthFetch"

export default function UserChat() {
  
   const user = JSON.parse(localStorage.getItem("user"));
  const [collegeName, setCollegeName] = useState("University ChatBot");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [mode, setMode] = useState("");
const [department_id, setDepartmentId] = useState("");
const [year, setYear] = useState("");
const [semester, setSemester] = useState("");
const [originalTitle, setOriginalTitle] = useState("");
const menuRef = React.useRef(null);
const [filter, setFilter] = useState({
  mode: "",
  department_id: "",
  year: "",
  semester: ""
});

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/");
  }
}, []);

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

const handleDeleteAccount = async () => {
  if (deletingAccount) return;

  setDeletingAccount(true);

  try {
    const res = await authFetch("http://localhost:5000/user/delete-account", {
  method: "DELETE",
});


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
};


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

    const res = await authFetch(
  `http://localhost:5000/chat/list?user_email=${email}`
);

   
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

    const res = await authFetch(
  `http://localhost:5000/chat/${currentSessionId}/messages`
);


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
  const res = await authFetch("http://localhost:5000/chat/new", {
    method: "POST",
    headers: {
      "content-type": "application/json",
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
    const res = await authFetch(
  `http://localhost:5000/chat/${sessionId}/send`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    const res = await authFetch("http://localhost:5000/change-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, 
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
<Sidebar
  isSidebarOpen={isSidebarOpen}
  setIsSidebarOpen={setIsSidebarOpen}
  sessions={sessions}
  setSessions={setSessions}
  currentSessionId={currentSessionId}
  setCurrentSessionId={setCurrentSessionId}
  hoverId={hoverId}
  setHoverId={setHoverId}
  menuId={menuId}
  setMenuId={setMenuId}
  editingId={editingId}
  setEditingId={setEditingId}
  editingTitle={editingTitle}
  setEditingTitle={setEditingTitle}
  setOriginalTitle={setOriginalTitle}
  saveRename={saveRename}
  delChat={delChat}
  navigate={navigate}
  user={user}
  menuRef={menuRef}
  setShowProfile={setShowProfile}
/>



{/* MAIN CHAT AREA */}
<ChatLayout
  isSidebarOpen={isSidebarOpen}

  collegeName={collegeName}
  isFilterIncomplete={isFilterIncomplete}

  mode={mode}
  setMode={setMode}
  department_id={department_id}
  setDepartmentId={setDepartmentId}
  year={year}
  setYear={setYear}
  semester={semester}
  setSemester={setSemester}
  isAcademicMode={isAcademicMode}
  departments={departments}
  settings={settings}
  fetchSettingsIfNeeded={fetchSettingsIfNeeded}
  handleApply={handleApply}

  messages={messages}
  copyToClipboard={copyToClipboard}
  copiedIndex={copiedIndex}
  isSpeechSupported={isSpeechSupported}
  speakingIndex={speakingIndex}
  speakText={speakText}
  stopSpeaking={stopSpeaking}
  currentSessionId={currentSessionId}
  typingSessionId={typingSessionId}
  messagesEndRef={messagesEndRef}

  input={input}
  setInput={setInput}
  textareaRef={textareaRef}
  adjustTextareaHeight={adjustTextareaHeight}
  sendMessage={sendMessage}
/>

     <ProfileModal
  showProfile={showProfile}
  closeProfile={closeProfile}
  user={user}
  displayRole={displayRole}

  editProfile={editProfile}
  setEditProfile={setEditProfile}

  showChangePassword={showChangePassword}
  setShowChangePassword={setShowChangePassword}

  showCurrentPass={showCurrentPass}
  setShowCurrentPass={setShowCurrentPass}
  showNewPass={showNewPass}
  setShowNewPass={setShowNewPass}
  showConfirmPass={showConfirmPass}
  setShowConfirmPass={setShowConfirmPass}

  passwordForm={passwordForm}
  setPasswordForm={setPasswordForm}
  passwordError={passwordError}
  handleChangePassword={handleChangePassword}
  resetChangePasswordState={resetChangePasswordState}

  profileForm={profileForm}
  setProfileForm={setProfileForm}
  handleSaveProfile={handleSaveProfile}

  departments={departments}
  settings={settings}

  confirmAccountDelete={confirmAccountDelete}
  setConfirmAccountDelete={setConfirmAccountDelete}
  handleDeleteAccount={handleDeleteAccount}

  openEditProfile={openEditProfile}
/>

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
