import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const NotFound = () => {
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
        status="404"
        title={
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
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
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            style={{
              height: "48px",
              padding: "0 32px",
              fontSize: "16px",
              borderRadius: "24px",
              background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
              border: "none",
              boxShadow: "0 4px 15px rgba(255, 65, 108, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(255, 65, 108, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(255, 65, 108, 0.3)";
            }}
          >
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
