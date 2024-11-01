import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Statistic,
  Typography,
  Space,
  Divider,
  Button,
  Table,
  Tag,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  WarningOutlined,
  RiseOutlined,
  FieldTimeOutlined,
  AlertOutlined,
  DashboardOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PigStatistics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [dateRange, setDateRange] = useState([]);

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Chuồng",
      dataIndex: "house",
      key: "house",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tổng số heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Trọng lượng TB (kg)",
      dataIndex: "avgWeight",
      key: "avgWeight",
      render: (value) => value.toFixed(1),
    },
    {
      title: "FCR",
      dataIndex: "fcr",
      key: "fcr",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Tỷ lệ chết (%)",
      dataIndex: "mortality",
      key: "mortality",
      render: (value) => value.toFixed(1),
    },
    {
      title: "Hiệu suất (%)",
      dataIndex: "efficiency",
      key: "efficiency",
      render: (value) => (
        <Text
          type={value >= 95 ? "success" : value >= 90 ? "warning" : "danger"}
        >
          {value}%
        </Text>
      ),
    },
  ];

  // Mock data cho bảng hiệu suất chuồng
  const housePerformanceData = [
    {
      key: "1",
      house: "Chuồng A",
      totalPigs: 300,
      avgWeight: 75.5,
      fcr: 2.8,
      mortality: 0.5,
      efficiency: 95,
    },
    {
      key: "2",
      house: "Chuồng B",
      totalPigs: 280,
      avgWeight: 78.2,
      fcr: 2.6,
      mortality: 0.3,
      efficiency: 98,
    },
    {
      key: "3",
      house: "Chuồng C",
      totalPigs: 320,
      avgWeight: 72.8,
      fcr: 2.9,
      mortality: 0.8,
      efficiency: 92,
    },
    {
      key: "4",
      house: "Chuồng D",
      totalPigs: 290,
      avgWeight: 76.4,
      fcr: 2.7,
      mortality: 0.4,
      efficiency: 96,
    },
  ];

  return (
    <div className="statistics-container" style={{ padding: "24px" }}>
      {/* Enhanced Header Section */}
      <div className="stats-header">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <div className="header-content">
              <Title level={2} className="page-title">
                <PieChartOutlined className="title-icon" /> Thống kê đàn heo
              </Title>
              <div className="header-description">
                <Text className="description-text">
                  Theo dõi và phân tích số liệu đàn heo
                </Text>
                <Tag color="blue" className="time-tag">
                  Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                </Tag>
              </div>
            </div>
          </Col>
          <Col>
            <Space size="middle" className="header-actions">
              <Select
                defaultValue="month"
                style={{ width: 140 }}
                className="time-select"
                options={[
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                  { value: "quarter", label: "Quý này" },
                  { value: "year", label: "Năm nay" },
                ]}
              />
              <RangePicker style={{ width: 280 }} className="date-picker" />
              <Button type="primary" icon={<DownloadOutlined />}>
                Xuất báo cáo
              </Button>
              <Button icon={<ReloadOutlined />} />
            </Space>
          </Col>
        </Row>
      </div>

      {/* Overview Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="statistic-card"
            style={{ background: "#fff" }}
          >
            <Statistic
              title={<Text strong>Tổng đàn hiện tại</Text>}
              value={1500}
              suffix="con"
              prefix={<PieChartOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">
                <ArrowUpOutlined /> 12% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Nhập trong kỳ</Text>}
              value={200}
              suffix="con"
              prefix={<ArrowUpOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Tổng giá trị: 600.000.000đ</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Xuất trong kỳ</Text>}
              value={180}
              suffix="con"
              prefix={<ArrowDownOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Tổng giá trị: 900.000.000đ</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Tỷ lệ heo chết</Text>}
              value={0.33}
              suffix="%"
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="danger">5 con trong kỳ</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row
        gutter={[24, 24]}
        style={{
          marginTop: "32px",
          marginBottom: "40px",
        }}
      >
        <Col span={24}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <Text strong>Biến động đàn heo theo thời gian</Text>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={[
                  {
                    name: "T1",
                    total: 1200,
                    import: 200,
                    export: 150,
                    dead: 3,
                  },
                  {
                    name: "T2",
                    total: 1247,
                    import: 180,
                    export: 130,
                    dead: 2,
                  },
                  {
                    name: "T3",
                    total: 1295,
                    import: 220,
                    export: 170,
                    dead: 4,
                  },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1890ff"
                  name="Tổng đàn"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="import"
                  stroke="#52c41a"
                  name="Nhập"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="export"
                  stroke="#faad14"
                  name="Xuất"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="dead"
                  stroke="#ff4d4f"
                  name="Chết"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Distribution Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: "40px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <Text strong>Phân bố theo chuồng</Text>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Chuồng A", value: 300, fill: "#1890ff" },
                    { name: "Chuồng B", value: 400, fill: "#52c41a" },
                    { name: "Chuồng C", value: 350, fill: "#faad14" },
                    { name: "Chuồng D", value: 450, fill: "#13c2c2" },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <Text strong>Phân bố theo trọng lượng</Text>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[
                  { range: "20-40kg", count: 300 },
                  { range: "41-60kg", count: 450 },
                  { range: "61-80kg", count: 400 },
                  { range: "81-100kg", count: 350 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Số lượng" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics Cards */}
      <Row
        gutter={[24, 24]}
        style={{
          marginTop: "32px",
          marginBottom: "40px",
        }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title={<Text strong>Tăng trọng TB/ngày</Text>}
              value={0.85}
              suffix="kg/ngày"
              prefix={<RiseOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">+5% so với tháng trước</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title={<Text strong>FCR trung bình</Text>}
              value={2.7}
              precision={1}
              suffix="kg/kg"
              prefix={<FieldTimeOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">Tốt hơn 0.1 so với chuẩn</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title={<Text strong>Tỷ lệ xuất chuồng đạt</Text>}
              value={96.5}
              suffix="%"
              prefix={<AlertOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="warning">-0.5% so với mục tiêu</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title={<Text strong>Hiệu suất chuồng</Text>}
              value={94.8}
              suffix="%"
              prefix={<DashboardOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Đạt mục tiêu</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: "48px" }}>
        <Card
          title={
            <Space>
              <DashboardOutlined style={{ color: "#1890ff" }} />
              <Text strong>Chi tiết hiệu suất theo chuồng</Text>
            </Space>
          }
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={housePerformanceData}
            pagination={{
              total: housePerformanceData.length,
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

export default PigStatistics;
