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
  Table,
  Progress,
  Button,
  Tooltip,
  Tag,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  RiseOutlined,
  FieldTimeOutlined,
  AlertOutlined,
  DashboardOutlined,
  BarChartOutlined,
  RadarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import "./styles/PerformanceStatistics.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PerformanceStatistics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [dateRange, setDateRange] = useState([]);

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
    // Thêm data cho các chuồng khác
  ];

  const columns = [
    {
      title: "Chuồng",
      dataIndex: "house",
      key: "house",
    },
    {
      title: "Tổng heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      render: (value) => `${value} con`,
    },
    {
      title: "Trọng lượng TB",
      dataIndex: "avgWeight",
      key: "avgWeight",
      render: (value) => `${value} kg`,
    },
    {
      title: "FCR",
      dataIndex: "fcr",
      key: "fcr",
    },
    {
      title: "Tỷ lệ chết",
      dataIndex: "mortality",
      key: "mortality",
      render: (value) => `${value}%`,
    },
    {
      title: "Hiệu suất",
      key: "efficiency",
      dataIndex: "efficiency",
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={
            value >= 95 ? "success" : value >= 85 ? "normal" : "exception"
          }
        />
      ),
    },
  ];

  return (
    <div className="performance-stats">
      <div className="stats-container">
        {/* Enhanced Header Section */}
        <div className="stats-header">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                <DashboardOutlined /> Thống kê hiệu suất
              </Title>
              <Text type="secondary">
                Phân tích chi tiết hiệu suất chăn nuôi và các chỉ số quan trọng
              </Text>
            </Col>
            <Col>
              <Space size="middle">
                <Select
                  defaultValue="month"
                  style={{ width: 120 }}
                  onChange={setTimeRange}
                  options={[
                    { value: "week", label: "Tuần này" },
                    { value: "month", label: "Tháng này" },
                    { value: "quarter", label: "Quý này" },
                    { value: "year", label: "Năm nay" },
                  ]}
                />
                <RangePicker onChange={setDateRange} style={{ width: 250 }} />
                <Tooltip title="Tải xuống báo cáo">
                  <Button icon={<DownloadOutlined />}>Xuất báo cáo</Button>
                </Tooltip>
                <Tooltip title="Làm mới dữ liệu">
                  <Button icon={<ReloadOutlined />} />
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Enhanced Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="stat-card"
              bodyStyle={{ padding: "24px" }}
            >
              <div className="stat-header">
                <RiseOutlined
                  className="stat-icon"
                  style={{
                    backgroundColor: "rgba(24, 144, 255, 0.1)",
                    color: "#1890ff",
                  }}
                />
                <Text type="secondary">Tăng trọng TB</Text>
              </div>

              <div className="stat-content">
                <Title level={3} style={{ margin: "16px 0", color: "#1890ff" }}>
                  0.85 <span className="stat-unit">kg/ngày</span>
                </Title>

                <div className="stat-footer">
                  <Tag color="success" icon={<ArrowUpOutlined />}>
                    Tăng 5%
                  </Tag>
                  <Text type="secondary" className="stat-period">
                    so với tháng trước
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="stat-card"
              bodyStyle={{ padding: "24px" }}
            >
              <div className="stat-header">
                <FieldTimeOutlined
                  className="stat-icon"
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    color: "#52c41a",
                  }}
                />
                <Text type="secondary">FCR trung bình</Text>
              </div>

              <div className="stat-content">
                <Title level={3} style={{ margin: "16px 0", color: "#52c41a" }}>
                  2.7 <span className="stat-unit">kg/kg</span>
                </Title>

                <div className="stat-footer">
                  <Tag color="success">Tốt hơn 0.1</Tag>
                  <Text type="secondary" className="stat-period">
                    so với chuẩn
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="stat-card"
              bodyStyle={{ padding: "24px" }}
            >
              <div className="stat-header">
                <AlertOutlined
                  className="stat-icon"
                  style={{
                    backgroundColor: "rgba(250, 173, 20, 0.1)",
                    color: "#faad14",
                  }}
                />
                <Text type="secondary">Tỷ lệ xuất chuồng</Text>
              </div>

              <div className="stat-content">
                <Title level={3} style={{ margin: "16px 0", color: "#faad14" }}>
                  96.5 <span className="stat-unit">%</span>
                </Title>

                <div className="stat-footer">
                  <Tag color="warning" icon={<ArrowDownOutlined />}>
                    Giảm 0.5%
                  </Tag>
                  <Text type="secondary" className="stat-period">
                    so với mục tiêu
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="stat-card"
              bodyStyle={{ padding: "24px" }}
            >
              <div className="stat-header">
                <DashboardOutlined
                  className="stat-icon"
                  style={{
                    backgroundColor: "rgba(255, 77, 79, 0.1)",
                    color: "#ff4d4f",
                  }}
                />
                <Text type="secondary">Hiệu suất chuồng</Text>
              </div>

              <div className="stat-content">
                <Title level={3} style={{ margin: "16px 0", color: "#ff4d4f" }}>
                  94.8 <span className="stat-unit">%</span>
                </Title>

                <div className="stat-footer">
                  <Tag color="processing">Đạt mục tiêu</Tag>
                  <Text type="secondary" className="stat-period">
                    kỳ này
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Charts Section */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              className="chart-card"
              title={
                <Space>
                  <BarChartOutlined style={{ color: "#1890ff" }} />
                  <span className="chart-title">
                    Biểu đồ tăng trọng theo thời gian
                  </span>
                </Space>
              }
              extra={
                <Space>
                  <Select
                    defaultValue="all"
                    style={{ width: 120 }}
                    options={[
                      { value: "all", label: "Tất cả chuồng" },
                      { value: "a", label: "Chuồng A" },
                      { value: "b", label: "Chuồng B" },
                    ]}
                  />
                  <Button type="text" icon={<DownloadOutlined />} />
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={[
                    { week: "T1", weight: 25, target: 24 },
                    { week: "T2", weight: 35, target: 34 },
                    { week: "T3", weight: 48, target: 46 },
                    { week: "T4", weight: 60, target: 58 },
                    { week: "T5", weight: 75, target: 72 },
                    { week: "T6", weight: 90, target: 88 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Trọng lượng thực tế"
                    stroke="#1890ff"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Mục tiêu"
                    stroke="#52c41a"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <RadarChartOutlined />
                  <Text strong>Chỉ số hiệu suất chính</Text>
                </Space>
              }
              bordered={false}
            >
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={[
                    {
                      subject: "Tăng trọng",
                      A: 95,
                      B: 85,
                      fullMark: 100,
                    },
                    {
                      subject: "FCR",
                      A: 90,
                      B: 88,
                      fullMark: 100,
                    },
                    {
                      subject: "Tỷ lệ sống",
                      A: 98,
                      B: 96,
                      fullMark: 100,
                    },
                    {
                      subject: "Chất lượng",
                      A: 92,
                      B: 89,
                      fullMark: 100,
                    },
                    {
                      subject: "Hiệu suất chuồng",
                      A: 94,
                      B: 91,
                      fullMark: 100,
                    },
                  ]}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Hiện tại"
                    dataKey="A"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Kỳ trước"
                    dataKey="B"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BarChartOutlined />
                  <Text strong>FCR theo chuồng</Text>
                </Space>
              }
              bordered={false}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={[
                    { house: "Chuồng A", fcr: 2.8, target: 2.7 },
                    { house: "Chuồng B", fcr: 2.6, target: 2.7 },
                    { house: "Chuồng C", fcr: 2.7, target: 2.7 },
                    { house: "Chuồng D", fcr: 2.9, target: 2.7 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="house" />
                  <YAxis domain={[2, 3]} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="fcr" name="FCR thực tế" fill="#1890ff" />
                  <Bar dataKey="target" name="FCR mục tiêu" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Performance Table */}
        <Card
          className="performance-table mt-5"
          title={
            <Space>
              <DashboardOutlined style={{ color: "#1890ff" }} />
              <span className="chart-title">
                Chi tiết hiệu suất theo chuồng
              </span>
            </Space>
          }
          extra={
            <Space>
              <Button type="primary" icon={<DownloadOutlined />}>
                Xuất Excel
              </Button>
            </Space>
          }
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

export default PerformanceStatistics;
