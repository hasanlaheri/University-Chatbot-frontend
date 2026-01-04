import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole, allowedRoles }) {
  const { user, loading } = useAuth();
  const localUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const activeUser = user || localUser;

  if (loading) return <div>Loading...</div>;

  if (!token || !activeUser) return <Navigate to="/" replace />;

  // normalize role (string) on activeUser
  const userRole = (activeUser.role || "").toLowerCase();

  if (allowedRoles && Array.isArray(allowedRoles)) {
    // convert allowedRoles entries to lowercase for comparison
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(userRole)) return <Navigate to="/" replace />;
  } else if (allowedRole) {
    if (userRole !== String(allowedRole).toLowerCase()) return <Navigate to="/" replace />;
  }

  return children;
}
