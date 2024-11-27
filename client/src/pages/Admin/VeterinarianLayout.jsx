import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import VeterinarianSideBar from "./layout/VeterinarianSideBar";

const VeterinarianLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <VeterinarianSideBar />
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

export default VeterinarianLayout;
