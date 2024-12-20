import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { Form, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const LoginComponent = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const location = useLocation();
  const successMessage = location.state?.message;
  const { updateUser } = useAuth();

  // Show success message if exists
  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
    }
  }, [successMessage]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/Login`,
        {
          email: values.email,
          password: values.password,
        }
      );
      if (response.status === 200) {
        localStorage.setItem("token", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
        localStorage.setItem("avatar", response.data.data.user.avatar);
        message.success("Đăng nhập thành công!");
        updateUser(response.data.data.user);
        if (response.data.data.user.roles[0] === "Admin") {
          navigate("/admin");
        } else if (response.data.data.user.roles[0] === "Dispatch") {
          navigate("/dispatch");
        } else if (response.data.data.user.roles[0] === "FeedManager") {
          navigate("/feed-manager");
        } else if (response.data.data.user.roles[0] === "Veterinarian") {
          navigate("/veterinarian");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.response?.data?.message || "Email hoặc mật khẩu không đúng"
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
      <div className="mb-8">
        <h3 className="text-3xl font-semibold text-gray-800 mb-2">
          Đăng nhập <strong className="text-orange-500">Nông trại</strong>
        </h3>
        <p className="text-gray-600 text-lg">Chào mừng bạn quay trở lại</p>
      </div>

      {/* Form */}
      <Form form={form} onFinish={onFinish} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-gray-700 font-medium">
            Email
          </label>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <input
              type="email"
              id="email"
              placeholder="your-email@gmail.com"
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 
                focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                transition-all duration-300"
            />
          </Form.Item>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{
              color: "#34495e",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Mật khẩu
          </label>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,16}$/,
                message:
                  "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
              },
            ]}
          >
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Nhập mật khẩu"
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "0 45px 0 15px",
                  borderRadius: "10px",
                  border: "2px solid #eee",
                  transition: "all 0.3s ease",
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
                  fontSize: "18px",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Form.Item>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              className="w-4 h-4 text-orange-500 border-gray-300 rounded 
                focus:ring-orange-500"
            />
            <label htmlFor="remember" className="ml-2 text-gray-600">
              Ghi nhớ đăng nhập
            </label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-orange-500 hover:text-orange-600 font-medium 
              transition-colors duration-300"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 
            text-white font-medium text-lg rounded-lg 
            transition-all duration-300 disabled:opacity-70 
            disabled:cursor-not-allowed"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </Form>
    </div>
  );
};

export default LoginComponent;
