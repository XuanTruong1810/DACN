import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import { Content } from "antd/es/layout/layout";

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
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

export default MainLayout;
