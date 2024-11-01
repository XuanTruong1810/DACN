import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Progress,
  Button,
  Tag,
} from "antd";
import {
  InboxOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import StatisticsHeader from "./components/StatisticsHeader";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Text, Title } = Typography;

const InventoryStatistics = () => {
  // Mock data cho biểu đồ giá trị tồn kho
  const inventoryValueData = [
    { month: "T1", food: 800000000, medicine: 200000000 },
    { month: "T2", food: 850000000, medicine: 180000000 },
    { month: "T3", food: 900000000, medicine: 220000000 },
    { month: "T4", food: 750000000, medicine: 190000000 },
  ];

  // Mock data cho bảng sản phẩm sắp hết
  const lowStockData = [
    {
      key: "1",
      name: "Thức ăn heo A",
      type: "food",
      currentStock: 500,
      minStock: 1000,
      unit: "kg",
      status: "warning",
    },
    {
      key: "2",
      name: "Vitamin B1",
      type: "medicine",
      currentStock: 20,
      minStock: 50,
      unit: "lọ",
      status: "danger",
    },
    // Thêm data khác...
  ];

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "food" ? "green" : "blue"}>
          {type === "food" ? "Thức ăn" : "Thuốc"}
        </Tag>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock, record) => `${stock.toLocaleString()} ${record.unit}`,
    },
    {
      title: "Mức tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      render: (min, record) => `${min.toLocaleString()} ${record.unit}`,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Progress
          percent={Math.round((record.currentStock / record.minStock) * 100)}
          size="small"
          status={
            record.currentStock < record.minStock ? "exception" : "active"
          }
        />
      ),
    },
  ];

  return (
    <div className="statistics-container" style={{ padding: "24px" }}>
      <StatisticsHeader
        title="Thống kê kho"
        icon={InboxOutlined}
        description="Theo dõi tình trạng kho thức ăn và thuốc"
      />

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <div className="stat-header">
              <DollarOutlined
                className="stat-icon"
                style={{
                  backgroundColor: "rgba(24, 144, 255, 0.1)",
                  color: "#1890ff",
                }}
              />
              <Text type="secondary">Tổng giá trị tồn kho</Text>
            </div>
            <div className="stat-content">
              <Title level={3} style={{ margin: "16px 0", color: "#1890ff" }}>
                1.2 <span className="stat-unit">tỷ</span>
              </Title>
              <div className="stat-footer">
                <Tag color="success" icon={<ArrowUpOutlined />}>
                  Tăng 8%
                </Tag>
                <Text type="secondary" className="stat-period">
                  so với tháng trước
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <div className="stat-header">
              <ShoppingOutlined
                className="stat-icon"
                style={{
                  backgroundColor: "rgba(82, 196, 26, 0.1)",
                  color: "#52c41a",
                }}
              />
              <Text type="secondary">Giá trị nhập kho</Text>
            </div>
            <div className="stat-content">
              <Title level={3} style={{ margin: "16px 0", color: "#52c41a" }}>
                350 <span className="stat-unit">triệu</span>
              </Title>
              <div className="stat-footer">
                <Tag color="success" icon={<ArrowUpOutlined />}>
                  Tăng 12%
                </Tag>
                <Text type="secondary" className="stat-period">
                  so với tháng trước
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Thêm 2 card thống kê khác tương tự */}
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <DollarOutlined />
                <Text strong>Biến động giá trị tồn kho</Text>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={inventoryValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)} triệu`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="food"
                  name="Thức ăn"
                  stroke="#52c41a"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="medicine"
                  name="Thuốc"
                  stroke="#1890ff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Table */}
      <div style={{ marginTop: "60px" }}>
        <Card
          title={
            <Space>
              <InboxOutlined style={{ color: "#ff4d4f" }} />
              <Text strong>Sản phẩm sắp hết hàng</Text>
            </Space>
          }
          extra={
            <Button type="primary" icon={<DownloadOutlined />}>
              Xuất Excel
            </Button>
          }
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={lowStockData}
            pagination={{
              total: lowStockData.length,
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default InventoryStatistics;
