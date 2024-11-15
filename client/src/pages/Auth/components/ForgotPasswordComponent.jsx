import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import axios from "axios";

const ForgotPasswordComponent = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/ForgotPassword`,
        { email }
      );

      if (response.status === 200) {
        navigate("/auth/confirm-otp", { state: { email } });
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!"
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
          Quên mật khẩu <strong style={{ color: "#e67e22" }}>Nông trại</strong>
        </h3>
        <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>
          Nhập email của bạn để khôi phục mật khẩu
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="email"
            style={{
              color: "#34495e",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            required
            style={{
              width: "100%",
              height: "50px",
              padding: "0 15px",
              borderRadius: "10px",
              border: "2px solid #eee",
              transition: "all 0.3s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#e67e22";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#eee";
            }}
          />
        </div>

        {/* Submit Button with Spinner */}
        <button
          type="submit"
          disabled={loading || !email}
          style={{
            width: "100%",
            height: "50px",
            borderRadius: "10px",
            background: "#e67e22",
            border: "none",
            color: "white",
            fontWeight: 500,
            fontSize: "1.1rem",
            cursor: loading || !email ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: loading || !email ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {loading && <Spinner />}
          {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
        </button>

        {/* Back to Login Link */}
        <div
          style={{
            marginTop: "1.5rem",
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

export default ForgotPasswordComponent;
