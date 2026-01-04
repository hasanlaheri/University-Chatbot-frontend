import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import UserDashboard from "./pages/UserChat";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import FacultyProfile from "./pages/FacultyProfile";
import FacultyNewUpload from "./pages/FacultyNewUpload";
import DepartmentPage from "./pages/DepartmentPage";
import GuestPage from "./pages/GuestPage";
import CampusInfo from "./pages/CampusInfo"
import StudentManagement from "./pages/StudentManagement";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register/:role" element={<RegisterPage />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["general_admin", "campus_admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/campus-info"
  element={
    <ProtectedRoute allowedRoles="campus_admin">
      <CampusInfo />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/department/:depName"
  element={
    <ProtectedRoute allowedRoles={["general_admin", "campus_admin"]}>
      <DepartmentPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/students-management"
  element={
    <ProtectedRoute allowedRoles="campus_admin">
      <StudentManagement />
    </ProtectedRoute>
  }
/>


<Route 
  path="/admin/guests" 
  element={
    <ProtectedRoute allowedRoles={["general_admin", "campus_admin"]}>
      <GuestPage />
    </ProtectedRoute>
  }
/>


        <Route
          path="/:college/:role"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/:college/:role/chat"
  element={
    <ProtectedRoute allowedRoles={["user", "guest"]}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>
         <Route
  path="/:college/:role/chat/:sessionId"
  element={
    <ProtectedRoute allowedRoles={["user", "guest"]}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

            <Route
          path="/:college/:role/profile"
          element={
            <ProtectedRoute>
              <FacultyProfile />
            </ProtectedRoute>
          }
        />
          <Route
          path="/:college/:role/upload-new"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyNewUpload />
            </ProtectedRoute>
          }
        />

      
      </Routes>
    </Router>
  );
}

export default App;
