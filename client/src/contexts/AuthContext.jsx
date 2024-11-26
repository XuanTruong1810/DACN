import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage on initial load
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setPermissions(userData.permissions || []);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (response) => {
    const { data } = response;

    // Save to localStorage
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Save user info
    const userData = {
      email: data.user.email,
      roles: data.user.roles,
      permissions: data.user.permissions,
    };
    localStorage.setItem("user", JSON.stringify(userData));

    // Update state
    setToken(data.accessToken);
    setUser(userData);
    setPermissions(data.user.permissions);
    setIsAuthenticated(true);

    // Redirect to dashboard
    navigate("/admin");
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Reset state
    setToken(null);
    setUser(null);
    setPermissions([]);
    setIsAuthenticated(false);

    // Redirect to login
    navigate("/login");
  };

  const hasPermission = (requiredPermission) => {
    if (!permissions) return false;
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    if (!permissions || !requiredPermissions) return false;
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  const value = {
    user,
    token,
    permissions,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
