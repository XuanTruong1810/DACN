import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import Spinner from "../../../components/Spinner";
import axios from "axios";

const ResetPasswordComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const verifiedOTP = location.state?.verifiedOTP;

  // Redirect nếu chưa verify OTP
  useEffect(() => {
    if (!email || !verifiedOTP) {
      navigate("/auth/forgot-password");
    }
  }, [email, verifiedOTP, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error khi user type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/ResetPassword`,
        {
          email: email,
          newPassword: formData.newPassword,
        }
      );

      if (response.status == 200) {
        // Redirect to login with success message
        navigate("/auth/login", {
          state: { message: "Đặt lại mật khẩu thành công!" },
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu"
      );
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
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            color: "#e74c3c",
            backgroundColor: "#fde8e7",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
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
              type={showPassword.new ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                height: "50px",
                padding: "0 15px",
                borderRadius: "10px",
                border: "2px solid #eee",
                transition: "all 0.3s ease",
                outline: "none",
                paddingRight: "40px", // Space for eye icon
              }}
            />
            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => ({ ...prev, new: !prev.new }))
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              {showPassword.new ? (
                <EyeInvisibleOutlined style={{ color: "#95a5a6" }} />
              ) : (
                <EyeOutlined style={{ color: "#95a5a6" }} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: "2rem", position: "relative" }}>
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
              type={showPassword.confirm ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                height: "50px",
                padding: "0 15px",
                borderRadius: "10px",
                border: "2px solid #eee",
                transition: "all 0.3s ease",
                outline: "none",
                paddingRight: "40px",
              }}
            />
            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              {showPassword.confirm ? (
                <EyeInvisibleOutlined style={{ color: "#95a5a6" }} />
              ) : (
                <EyeOutlined style={{ color: "#95a5a6" }} />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading || !formData.newPassword || !formData.confirmPassword
          }
          style={{
            width: "100%",
            height: "50px",
            borderRadius: "10px",
            background: "#e67e22",
            border: "none",
            color: "white",
            fontWeight: 500,
            fontSize: "1.1rem",
            cursor:
              loading || !formData.newPassword || !formData.confirmPassword
                ? "not-allowed"
                : "pointer",
            transition: "all 0.3s ease",
            opacity:
              loading || !formData.newPassword || !formData.confirmPassword
                ? 0.7
                : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "1rem",
          }}
        >
          {loading && <Spinner />}
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>

        {/* Back to Login Link */}
        <div
          style={{
            textAlign: "center",
          }}
        >
          <Link
            to="/auth/login"
            style={{
              color: "#e67e22",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordComponent;
