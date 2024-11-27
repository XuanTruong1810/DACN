import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AdminSideBar from "./layout/AdminSideBar";
import { Content } from "antd/es/layout/layout";

const AdminLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSideBar />
      <Layout
        style={{
          marginTop: "64px", // Thêm margin-top bằng với chiều cao của header
          minHeight: "100vh",
        }}
      >
        <Content style={{ padding: "24px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
