import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { RollbackOutlined } from "@ant-design/icons";

const Forbidden = () => {
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
              background: "linear-gradient(45deg, #ff9a2b, #ff6c41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            403
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
            Xin lỗi, bạn không có quyền truy cập trang này
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<RollbackOutlined />}
            onClick={() => navigate(-1)}
            style={{
              height: "48px",
              padding: "0 32px",
              fontSize: "16px",
              borderRadius: "24px",
              background: "linear-gradient(45deg, #ff9a2b, #ff6c41)",
              border: "none",
              boxShadow: "0 4px 15px rgba(255, 154, 43, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(255, 154, 43, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(255, 154, 43, 0.3)";
            }}
          >
            Quay lại
          </Button>
        }
      />
    </div>
  );
};

export default Forbidden;
