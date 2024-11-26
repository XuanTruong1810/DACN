import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ requiredPermissions, children }) => {
  const { user, hasAnyPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
