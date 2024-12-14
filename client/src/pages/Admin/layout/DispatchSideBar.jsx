import {
  HomeOutlined,
  TeamOutlined,
  BugOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  ImportOutlined,
  ExportOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Menu, Avatar, Dropdown, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const DispatchSideBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },

    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const menuItems = [
    {
      key: "farm-management",
      icon: <BugOutlined />,
      label: "Quản lý trang trại",
      children: [
        {
          key: "animals",
          icon: <BugOutlined />,
          label: "Quản lý vật nuôi",
          children: [
            {
              key: "animalsList",
              icon: <UnorderedListOutlined />,
              label: (
                <Link to="/dispatch/animals/pigs">Danh sách vật nuôi</Link>
              ),
            },
            {
              key: "moveHouse",
              icon: <HomeOutlined />,
              label: (
                <Link to="/dispatch/animals/move-house">Chuyển chuồng</Link>
              ),
            },
            {
              key: "weighingSchedule",
              icon: <BarChartOutlined />,
              label: <Link to="/dispatch">Lịch cân heo</Link>,
            },
          ],
        },
      ],
    },
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
              key: "importRequests",
              icon: <FileTextOutlined />,
              label: "Phiếu nhập heo",
              children: [
                {
                  key: "createImportRequest",
                  icon: <FileTextOutlined />,
                  label: (
                    <Link to="/Dispatch/inventory/create-request">
                      Tạo phiếu nhập
                    </Link>
                  ),
                },
                {
                  key: "importRequestList",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/Dispatch/inventory/request-list">
                      Danh sách phiếu nhập
                    </Link>
                  ),
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
              key: "exportAnimals",
              icon: <BugOutlined />,
              label: "Xuất vật nuôi",
              children: [
                {
                  key: "createExportRequest",
                  icon: <FileTextOutlined />,
                  label: (
                    <Link to="/Dispatch/exports/animals/create">
                      Đề xuất xuất vật nuôi
                    </Link>
                  ),
                },
              ],
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

export default DispatchSideBar;
