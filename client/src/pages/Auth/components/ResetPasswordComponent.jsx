import { useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../../components/Spinner";

// Eye Icons
const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const ResetPasswordComponent = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Xử lý logic reset password ở đây
      console.log("Form submitted:", formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "2rem",
            color: "#2c3e50",
            marginBottom: "0.5rem",
          }}
        >
          Đặt lại mật khẩu{" "}
          <strong style={{ color: "#e67e22" }}>Nông trại</strong>
        </h3>
        <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>
          Vui lòng nhập mật khẩu mới của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="newPassword"
            style={{
              color: "#34495e",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Mật khẩu mới
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              style={{
                width: "100%",
                height: "50px",
                padding: "0 45px 0 15px",
                borderRadius: "10px",
                border: "2px solid #eee",
                transition: "all 0.3s ease",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                color: "#666",
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.newPassword && (
            <div
              style={{
                color: "#e74c3c",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.newPassword}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="confirmPassword"
            style={{
              color: "#34495e",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Xác nhận mật khẩu
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu mới"
              style={{
                width: "100%",
                height: "50px",
                padding: "0 45px 0 15px",
                borderRadius: "10px",
                border: "2px solid #eee",
                transition: "all 0.3s ease",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                color: "#666",
              }}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div
              style={{
                color: "#e74c3c",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              height: "50px",
              borderRadius: "10px",
              background: "#e67e22",
              border: "none",
              color: "white",
              fontWeight: 500,
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading && <Spinner />}
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>

          <Link
            to="/auth/login"
            style={{
              flex: 1,
              height: "50px",
              borderRadius: "10px",
              background: "#95a5a6",
              border: "none",
              color: "white",
              fontWeight: 500,
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordComponent;
