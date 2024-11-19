import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Card, message, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title } = Typography;

const FoodExport = () => {
  const navigate = useNavigate();
  const [foodExports, setFoodExports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách xuất thức ăn
  const fetchFoodExports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/FoodExport`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFoodExports(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách xuất thức ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodExports();
  }, []);

  // Columns cho bảng chính
  const columns = [
    {
      title: "Mã phiếu xuất",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày xuất",
      dataIndex: "exportDate",
      key: "exportDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Người xuất",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
  ];

  // Columns cho chi tiết xuất
  const expandedRowRender = (record) => {
    const detailColumns = [
      {
        title: "Tên thức ăn",
        dataIndex: "foodName",
        key: "foodName",
      },
      {
        title: "Số lượng xuất (kg)",
        dataIndex: "quantity",
        key: "quantity",
        render: (value) => `${value} kg`,
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.details}
        pagination={false}
        rowKey="id"
      />
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Title level={3}>Quản lý xuất thức ăn</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/exports/daily-food")}
            >
              Tạo phiếu xuất
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={foodExports}
          expandable={{ expandedRowRender }}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default FoodExport;
