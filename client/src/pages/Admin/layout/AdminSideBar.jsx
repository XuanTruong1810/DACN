/* eslint-disable react-hooks/exhaustive-deps */
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
  TagsOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LineChartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Menu, Avatar, Dropdown, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  console.log(currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { type: "divider" },
    { key: "restore", icon: <ImportOutlined />, label: "Phục hồi dữ liệu" },
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
              label: <Link to="/admin/animals/pigs">Danh sách vật nuôi</Link>,
            },
          ],
        },
        {
          key: "areas",
          icon: <AppstoreOutlined />,
          label: "Quản lý khu vực",
          children: [
            {
              key: "areasList",
              icon: <UnorderedListOutlined />,
              label: <Link to="/admin/areas">Danh sách khu vực</Link>,
            },
            {
              key: "houses",
              icon: <HomeOutlined />,
              label: <Link to="/admin/houses">Chuồng trại</Link>,
            },
          ],
        },
      ],
    },
    {
      key: "farmRecords",
      icon: <HistoryOutlined />,
      label: "Nhật ký trang trại",
      children: [
        {
          key: "vaccineRecords",
          icon: <MedicineBoxOutlined />,
          label: (
            <Link to="/admin/health/vaccination-history">
              Nhật ký tiêm phòng
            </Link>
          ),
        },
        {
          key: "weightRecords",
          icon: <LineChartOutlined />,
          label: <Link to="/admin/weighing-history">Nhật ký cân heo</Link>,
        },
        {
          key: "medicalRecords",
          icon: <HeartOutlined />,
          label: (
            <Link to="/admin/health/medical-history">Nhật ký điều trị</Link>
          ),
        },
        {
          key: "feedingRecords",
          icon: <ExportOutlined />,
          label: (
            <Link to="/admin/exports/daily-food-history">Nhật ký cho ăn</Link>
          ),
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
                  key: "pendingRequests",
                  icon: <CheckSquareOutlined />,
                  label: (
                    <Link to="/admin/inventory/pending-requests">
                      Duyệt phiếu nhập
                    </Link>
                  ),
                },
              ],
            },
            {
              key: "importFoods",
              icon: <AppstoreOutlined />,
              label: "Phiếu nhập thức ăn",
              children: [
                {
                  key: "pendingFoodImports",
                  icon: <CheckSquareOutlined />,
                  label: (
                    <Link to="/admin/inventory/food-import-approval">
                      Duyệt phiếu nhập
                    </Link>
                  ),
                },
                {
                  key: "importFoodsList",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/admin/inventory/food-imports">
                      Danh sách phiếu nhập
                    </Link>
                  ),
                },
              ],
            },
            {
              key: "importMedicines",
              icon: <MedicineBoxOutlined />,
              label: "Phiếu nhập thuốc",
              children: [
                {
                  key: "pendingMedicineImports",
                  icon: <CheckSquareOutlined />,
                  label: (
                    <Link to="/admin/inventory/import-medicines/pending">
                      Duyệt phiếu nhập
                    </Link>
                  ),
                },
                {
                  key: "importMedicineRequests",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/admin/inventory/import-medicines">
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
                  key: "pendingExports",
                  icon: <CheckSquareOutlined />,
                  label: (
                    <Link to="/admin/exports/request/list">
                      Duyệt phiếu xuất
                    </Link>
                  ),
                },
                {
                  key: "exportsList",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/admin/exports/animals/list">
                      Danh sách phiếu xuất heo
                    </Link>
                  ),
                },
              ],
            },
          ],
        },
        {
          key: "supplies",
          icon: <InboxOutlined />,
          label: "Vật tư",
          children: [
            {
              key: "food",
              icon: <AppstoreOutlined />,
              label: "Thức ăn",
              children: [
                {
                  key: "food-categories",
                  icon: <TagsOutlined />,
                  label: (
                    <Link to="/admin/inventory/food-categories">
                      Loại thức ăn
                    </Link>
                  ),
                },
                {
                  key: "food-list",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/admin/inventory/foods">Danh sách thức ăn</Link>
                  ),
                },
              ],
            },
            {
              key: "medicines",
              icon: <MedicineBoxOutlined />,
              label: "Thuốc",
              children: [
                {
                  key: "medicine-list",
                  icon: <UnorderedListOutlined />,
                  label: (
                    <Link to="/admin/inventory/medicines">Danh sách thuốc</Link>
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "management",
      icon: <TeamOutlined />,
      label: "Quản lý chung",
      children: [
        {
          key: "suppliers",
          icon: <ShoppingOutlined />,
          label: <Link to="/admin/suppliers">Nhà cung cấp</Link>,
        },
        {
          key: "employees",
          icon: <TeamOutlined />,
          label: <Link to="/admin/employees">Nhân viên</Link>,
        },
        {
          key: "customers",
          icon: <UserOutlined />,
          label: <Link to="/admin/customers">Khách hàng</Link>,
        },
      ],
    },
    {
      key: "statistics",
      icon: <PieChartOutlined />,
      label: "Thống kê",
      children: [
        {
          key: "performanceStats",
          icon: <BarChartOutlined />,
          label: <Link to="/admin">Thống kê hiệu suất</Link>,
        },
        {
          key: "pigStats",
          icon: <PieChartOutlined />,
          label: <Link to="/admin/statistics/pigs">Thống kê đàn heo</Link>,
        },
        {
          key: "inventoryStats",
          icon: <DatabaseOutlined />,
          label: <Link to="/admin/statistics/inventory">Thống kê kho</Link>,
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
      localStorage.removeItem("user");
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

export default Sidebar;
