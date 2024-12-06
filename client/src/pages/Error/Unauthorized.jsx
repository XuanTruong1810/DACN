import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { LoginOutlined } from "@ant-design/icons";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Result
        status="403"
        title={
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2b86ff, #416cff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            401
          </div>
        }
        subTitle={
          <div
            style={{
              fontSize: "24px",
              color: "#666",
              marginBottom: "20px",
            }}
          >
            Bạn cần đăng nhập để truy cập trang này
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={() => navigate("/auth/login")}
            style={{
              height: "48px",
              padding: "0 32px",
              fontSize: "16px",
              borderRadius: "24px",
              background: "linear-gradient(45deg, #2b86ff, #416cff)",
              border: "none",
              boxShadow: "0 4px 15px rgba(43, 134, 255, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(43, 134, 255, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(43, 134, 255, 0.3)";
            }}
          >
            Đăng nhập ngay
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
