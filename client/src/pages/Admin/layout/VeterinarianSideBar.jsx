import {
  HomeOutlined,
  TeamOutlined,
  BugOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  PieChartOutlined,
  InboxOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  ImportOutlined,
  ExportOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  BarsOutlined,
  TagsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Menu, Avatar, Dropdown, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";

const VeterinarianSideBar = () => {
  const navigate = useNavigate();
  const currentUser = {
    name: "Veterinarian",
    avatar: null,
    role: "Bác sĩ",
  };

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
              key: "deadAnimals",
              icon: <FileTextOutlined />,
              label: <Link to="/Veterinarian/animals/dead">Hủy heo</Link>,
            },
          ],
        },
        {
          key: "health",
          icon: <MedicineBoxOutlined />,
          label: "Quản lý sức khỏe",
          children: [
            {
              key: "createHealthRecord",
              icon: <FileTextOutlined />,
              label: (
                <Link to="/Veterinarian/health/create">Tạo phiếu khám</Link>
              ),
            },
            {
              key: "medicineHistory",
              icon: <BarsOutlined />,
              label: <Link to="/Veterinarian">Lịch tiêm chủng định kì</Link>,
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
              key: "importMedicines",
              icon: <MedicineBoxOutlined />,
              label: "Phiếu nhập thuốc",
              children: [
                {
                  key: "createMedicineImport",
                  icon: <FileTextOutlined />,
                  label: (
                    <Link to="/Veterinarian/inventory/import-medicines/create">
                      Tạo phiếu nhập
                    </Link>
                  ),
                },
                {
                  key: "medicineImportList",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/Veterinarian/inventory/import-medicines/list">
                      Danh sách phiếu nhập
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
    if (key === "restore") navigate("/admin/restore");
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
              {currentUser.name}
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
              {currentUser.role}
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default VeterinarianSideBar;
