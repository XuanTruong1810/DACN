import {
  TeamOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  ImportOutlined,
  ExportOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Menu, Avatar, Dropdown, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const FeedManagementSideBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const menuItems = [
    {
      key: "inventory",
      icon: <ShoppingOutlined />,
      label: "Quản lý kho",
      children: [
        {
          key: "imports",
          icon: <ImportOutlined />,
          label: "Nhập kho",
          children: [
            {
              key: "importFoods",
              icon: <AppstoreOutlined />,
              label: "Phiếu nhập thức ăn",
              children: [
                {
                  key: "createFoodImport",
                  icon: <FileTextOutlined />,
                  label: (
                    <Link to="/feed-manager/inventory/import-foods/create">
                      Tạo phiếu nhập
                    </Link>
                  ),
                },
                {
                  key: "foodImportList",
                  icon: <UnorderedListOutlined />,
                  label: <Link to="/feed-manager">Danh sách phiếu nhập</Link>,
                },
              ],
            },
          ],
        },
        {
          key: "exports",
          icon: <ExportOutlined />,
          label: "Xuất kho",
          children: [
            {
              key: "dailyFoodExport",
              icon: <AppstoreOutlined />,
              label: (
                <Link to="/feed-manager/exports/daily-food-export">
                  Xuất thức ăn hằng ngày
                </Link>
              ),
            },
          ],
        },
      ],
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === "profile") navigate("/profile");
    if (key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/auth/login");
    }
  };

  return (
    <Header
      style={{
        background: "#001529",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          width: "250px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderRight: "1px solid #002140",
        }}
      >
        <TeamOutlined
          style={{ fontSize: "24px", color: "#fff", marginRight: "8px" }}
        />
        <span style={{ fontSize: "18px", color: "#fff", fontWeight: 500 }}>
          Quản lý trang trại
        </span>
      </div>

      <Menu
        mode="horizontal"
        theme="dark"
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          background: "#001529",
        }}
      />

      <div style={{ padding: "0 24px" }}>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
            style: { minWidth: "150px" },
          }}
          trigger={["click"]}
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              icon={<UserOutlined />}
              src={currentUser.avatar}
              style={{ backgroundColor: "#1890ff" }}
            />
            <span style={{ color: "#fff", padding: "0 8px" }}>
              {currentUser.fullName}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#fff",
                backgroundColor: "#1890ff",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {currentUser.roles[0] === "Admin"
                ? "Quản trị viên"
                : currentUser.roles[0] === "Veterinarian"
                ? "Bác sĩ thú y"
                : currentUser.roles[0] === "Dispatch"
                ? "Điều phối heo"
                : currentUser.roles[0] === "FeedManager"
                ? "Nhân viên dinh dưỡng"
                : currentUser.roles[0]}
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default FeedManagementSideBar;
