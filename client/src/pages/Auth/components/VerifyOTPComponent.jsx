import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import axios from "axios";

const VerifyOTPComponent = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    const countdown =
      timer > 0 &&
      !canResend &&
      setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

    if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(countdown);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];

    pastedData.forEach((value, index) => {
      if (index < 6 && /^\d$/.test(value)) {
        newOtp[index] = value;
      }
    });

    setOtp(newOtp);
    if (newOtp[0])
      inputRefs.current[newOtp.findIndex((val) => !val) || 5].focus();
  };

  const handleResend = async () => {
    try {
      setCanResend(false);
      setTimer(60);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/ForgotPassword`,
        { email }
      );

      if (response.status == 200) {
        setError("");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(error.response?.data?.message || "Không thể gửi lại mã OTP");
      setCanResend(true);
      setTimer(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.some((digit) => !digit)) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/Confirm_OTP_ResetPassword`,
        {
          email: email,
          otp: otp.join(""),
        }
      );

      if (response.status == 200) {
        // Chuyển đến trang reset password
        navigate("/auth/reset-password", {
          state: {
            email,
            verifiedOTP: true, // Đánh dấu đã verify OTP thành công
          },
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error.response?.data?.message || "Mã OTP không hợp lệ");
      // Clear OTP khi verify thất bại
      setOtp(["", "", "", "", "", ""]);
      // Focus vào ô đầu tiên
      inputRefs.current[0]?.focus();
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
          Xác thực OTP <strong style={{ color: "#e67e22" }}>Nông trại</strong>
        </h3>
        <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>
          Vui lòng nhập mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* OTP Input Fields */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            justifyContent: "center",
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: "50px",
                height: "50px",
                textAlign: "center",
                fontSize: "1.5rem",
                borderRadius: "10px",
                border: error ? "2px solid #e74c3c" : "2px solid #eee",
                outline: "none",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "#e74c3c",
              textAlign: "center",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Timer and Resend */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#7f8c8d",
          }}
        >
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#e67e22",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Gửi lại mã
            </button>
          ) : (
            <span>Gửi lại mã sau {timer} giây</span>
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
            disabled={loading || otp.some((digit) => !digit)}
            style={{
              flex: 1,
              height: "50px",
              borderRadius: "10px",
              background: "#e67e22",
              border: "none",
              color: "white",
              fontWeight: 500,
              fontSize: "1.1rem",
              cursor:
                loading || otp.some((digit) => !digit)
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.3s ease",
              opacity: loading || otp.some((digit) => !digit) ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading && <Spinner />}
            {loading ? "Đang xử lý..." : "Xác nhận"}
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
            }}
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTPComponent;
