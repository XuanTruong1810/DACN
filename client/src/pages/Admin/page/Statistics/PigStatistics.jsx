/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Statistic,
  Typography,
  Space,
  Table,
  Tag,
  Alert,
  Spin,
  Button,
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
  Cell,
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
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { message } from "antd";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PigStatistics = () => {
  // States for data
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [isDateSelected, setIsDateSelected] = useState(true);
  const [basicStats, setBasicStats] = useState({
    totalPigs: 0,
    growthRate: 0,
    import: { quantity: 0, totalValue: 0 },
    export: { quantity: 0, totalValue: 0 },
    death: { quantity: 0, rate: 0 },
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    weightGain: { value: 0, growthRate: 0 },
    fcr: { value: 0, difference: 0 },
    survival: { rate: 0, difference: 0 },
    efficiency: { rate: 0, reachedTarget: false },
  });
  const [pigTrends, setPigTrends] = useState([]);
  const [weightDistribution, setWeightDistribution] = useState([]);
  const [areaEfficiency, setAreaEfficiency] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Giới hạn chọn ngày
  const disabledDate = (current) => {
    // Không cho chọn ngày sau năm 2057
    if (current && current > dayjs("2057-12-31")) {
      return true;
    }
    return false;
  };

  // Các preset ranges
  const customRanges = {
    "Tháng này": [dayjs().startOf("month"), dayjs().endOf("month")],
    "Tháng trước": [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
    "Quý này": [dayjs().startOf("quarter"), dayjs().endOf("quarter")],
    "Quý trước": [
      dayjs().subtract(1, "quarter").startOf("quarter"),
      dayjs().subtract(1, "quarter").endOf("quarter"),
    ],
    "Năm nay": [dayjs().startOf("year"), dayjs().endOf("year")],
    "Năm trước": [
      dayjs().subtract(1, "year").startOf("year"),
      dayjs().subtract(1, "year").endOf("year"),
    ],
  };

  // Fetch all data
  const fetchAllData = async (fromDate, toDate) => {
    if (!fromDate || !toDate) return;

    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const [
        basicStatsRes,
        trendRes,
        weightDistRes,
        performanceRes,
        areaEfficiencyRes,
      ] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/StatisticPig/pig-statistic`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              fromDate: fromDate.format("YYYY-MM-DD"),
              toDate: toDate.format("YYYY-MM-DD"),
            },
          }
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/StatisticPig/pig-trend`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              fromDate: fromDate.format("YYYY-MM-DD"),
              toDate: toDate.format("YYYY-MM-DD"),
            },
          }
        ),
        axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/StatisticPig/pig-weight-distribution`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              fromDate: fromDate.format("YYYY-MM-DD"),
              toDate: toDate.format("YYYY-MM-DD"),
            },
          }
        ),
        axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/StatisticPig/pig-fcr-distribution`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              fromDate: fromDate.format("YYYY-MM-DD"),
              toDate: toDate.format("YYYY-MM-DD"),
            },
          }
        ),
        axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/StatisticPig/pig-area-efficiency`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              fromDate: fromDate.format("YYYY-MM-DD"),
              toDate: toDate.format("YYYY-MM-DD"),
            },
          }
        ),
      ]);

      // Update all states with API data
      setBasicStats(basicStatsRes.data.data);
      setPigTrends(trendRes.data.data);
      setWeightDistribution(weightDistRes.data.data);
      setPerformanceMetrics(performanceRes.data.data);
      setAreaEfficiency(areaEfficiencyRes.data.data);
      setTrendData(trendRes.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      fetchAllData(dates[0], dates[1]);
    }
  };

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchAllData(dateRange[0], dateRange[1]);
    }
  }, []);

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      render: (text) => (
        <Space>
          <HomeOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tổng số heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      align: "center",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Số chuồng",
      dataIndex: "stableUsage",
      key: "stableUsage",
      align: "center",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status === "Đang hoạt động" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Tỷ lệ lấp đầy (%)",
      dataIndex: "occupancyRate",
      key: "occupancyRate",
      align: "center",
      render: (rate) => {
        const color =
          rate > 80
            ? "red"
            : rate > 50
            ? "orange"
            : rate > 0
            ? "green"
            : "gray";
        return <Text style={{ color }}>{rate}%</Text>;
      },
    },
  ];

  // Hàm fetch data
  const fetchTrendData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [fromDate, toDate] = dateRange;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/StatisticPig/pig-trend`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            fromDate: fromDate.format("YYYY-MM-DD"),
            toDate: toDate.format("YYYY-MM-DD"),
          },
        }
      );

      if (response.data?.data) {
        setTrendData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching trend data:", error);
      message.error("Không thể tải dữ liệu biểu đồ");
    }
  };

  // Fetch data
  const fetchWeightDistribution = async () => {
    try {
      const token = localStorage.getItem("token");
      const [fromDate, toDate] = dateRange;

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/StatisticPig/pig-weight-distribution`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            fromDate: fromDate.format("YYYY-MM-DD"),
            toDate: toDate.format("YYYY-MM-DD"),
          },
        }
      );

      if (response.data?.data) {
        setWeightDistribution(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching weight distribution:", error);
      message.error("Không thể tải dữ liệu phân bố trọng lượng");
    }
  };

  // Phần render Performance Metrics Cards
  const renderPerformanceCards = () => {
    const cards = [
      {
        title: "Tăng trọng TB/ngày",
        value: performanceMetrics.weightGain.value,
        suffix: "kg/ngày",
        trend: performanceMetrics.weightGain.growthRate,
        trendSuffix: "% so với tháng trước",
        icon: <RiseOutlined style={{ color: "#1890ff" }} />,
        color: "#1890ff",
      },
      {
        title: "FCR trung bình",
        value: performanceMetrics.fcr.value,
        suffix: "kg/kg",
        subTitle: `${
          performanceMetrics.fcr.difference > 0 ? "Tốt hơn" : "Kém hơn"
        } ${Math.abs(performanceMetrics.fcr.difference)} so với chuẩn`,
        icon: <FieldTimeOutlined style={{ color: "#52c41a" }} />,
        color: "#52c41a",
      },
      {
        title: "Tỷ lệ xuất chuồng đạt",
        value: performanceMetrics.survival.rate,
        suffix: "%",
        trend: performanceMetrics.survival.difference,
        trendSuffix: "% so với mục tiêu",
        icon: <AlertOutlined style={{ color: "#faad14" }} />,
        color: "#faad14",
      },
      {
        title: "Hiệu suất chuồng",
        value: performanceMetrics.efficiency.rate,
        suffix: "%",
        subTitle: performanceMetrics.efficiency.reachedTarget
          ? "Đạt mục tiêu"
          : "Chưa đạt mục tiêu",
        icon: <DashboardOutlined style={{ color: "#ff4d4f" }} />,
        color: "#ff4d4f",
      },
    ];

    return (
      <Row gutter={[24, 24]} style={{ marginTop: "32px" }}>
        {cards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="statistic-card">
              <Statistic
                title={<Text strong>{card.title}</Text>}
                value={card.value}
                suffix={card.suffix}
                prefix={card.icon}
                valueStyle={{ color: card.color }}
              />
              <div style={{ marginTop: 8 }}>
                {card.trend !== undefined ? (
                  <Text
                    type={card.trend > 0 ? "success" : "danger"}
                    style={{ fontSize: "14px" }}
                  >
                    <span>
                      {card.trend > 0 ? "+" : ""}
                      {card.trend}
                      {card.trendSuffix}
                    </span>
                  </Text>
                ) : (
                  <Text
                    type={
                      card.subTitle.includes("Đạt") ||
                      card.subTitle.includes("Tốt")
                        ? "success"
                        : "danger"
                    }
                    style={{ fontSize: "14px" }}
                  >
                    {card.subTitle}
                  </Text>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="statistics-container" style={{ padding: "24px" }}>
      {/* Header with date range picker */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <PieChartOutlined /> Thống kê đàn heo
          </Title>
        </Col>
        <Col>
          <div style={{ marginBottom: 16, padding: "8px 0" }}>
            <RangePicker
              ranges={customRanges}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              allowClear={false}
              locale={locale}
              size="middle"
              style={{ width: 240 }}
              disabledDate={disabledDate}
            />
          </div>
        </Col>
      </Row>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        // Overview Statistics Cards
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="statistic-card"
              style={{ background: "#fff" }}
            >
              <Statistic
                title={<Text strong>Tổng đàn hiện tại</Text>}
                value={basicStats.totalPigs}
                suffix="con"
                prefix={<PieChartOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="success">
                  <ArrowUpOutlined /> {basicStats.growthRate}% so với tháng
                  trước
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="statistic-card">
              <Statistic
                title={<Text strong>Nhập trong kỳ</Text>}
                value={basicStats.import.quantity}
                suffix="con"
                prefix={<ArrowUpOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Tổng giá trị: {basicStats.import.totalValue.toLocaleString()}đ
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="statistic-card">
              <Statistic
                title={<Text strong>Xuất trong kỳ</Text>}
                value={basicStats.export.quantity}
                suffix="con"
                prefix={<ArrowDownOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Tổng giá trị: {basicStats.export.totalValue.toLocaleString()}đ
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="statistic-card">
              <Statistic
                title={<Text strong>Tỷ lệ heo chết</Text>}
                value={basicStats.death.rate}
                suffix="%"
                prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="danger">
                  {basicStats.death.quantity} con trong kỳ
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

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
                <LineChartOutlined style={{ color: "#1890ff" }} />
                <Text strong>Biến động đàn heo theo thời gian</Text>
              </Space>
            }
            bordered={false}
          >
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: "#E5E5E5" }}
                  />
                  <YAxis tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    name="Tổng đàn"
                    type="monotone"
                    dataKey="totalPigs"
                    stroke="#1890ff"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    name="Nhập"
                    type="monotone"
                    dataKey="importQuantity"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    name="Xuất"
                    type="monotone"
                    dataKey="exportQuantity"
                    stroke="#faad14"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    name="Chết"
                    type="monotone"
                    dataKey="deathQuantity"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Distribution Charts */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Biểu đồ phân bố theo khu vực */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined style={{ color: "#1890ff" }} />
                <Text strong>Phân bố theo khu vực</Text>
              </Space>
            }
            style={{ height: "100%" }}
          >
            <div style={{ height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={areaEfficiency.map((area, index) => ({
                      name: area.areaName,
                      value: area.totalPigs,
                      fill: [
                        "#1890ff",
                        "#52c41a",
                        "#faad14",
                        "#13c2c2",
                        "#722ed1",
                        "#eb2f96",
                      ][index % 6], // Rotate through 6 different colors
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(1)}%)`
                    }
                  />
                  <Tooltip formatter={(value) => `${value} con`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Biểu đồ phân bố theo trọng lượng */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1890ff" }} />
                <Text strong>Phân bố theo trọng lượng</Text>
              </Space>
            }
            style={{ height: "100%" }}
          >
            <div style={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={weightDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="range"
                    tickLine={false}
                    axisLine={{ stroke: "#E5E5E5" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#E5E5E5" }}
                    label={{
                      value: "Số lượng heo",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} con`, "Số lượng"]}
                  />
                  <Bar dataKey="pigCount" fill="#1890ff">
                    {weightDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pigCount > 0 ? "#1890ff" : "#f0f0f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hiển thị legend tự tạo */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Space size="large">
                {weightDistribution.map((item, index) => (
                  <Space key={index}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        backgroundColor:
                          item.pigCount > 0 ? "#1890ff" : "#f0f0f0",
                        marginRight: 8,
                      }}
                    />
                    <Text>
                      {item.range}: {item.pigCount} con
                    </Text>
                  </Space>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {renderPerformanceCards()}

      <div style={{ marginTop: "48px" }}>
        <Card
          title={
            <Space>
              <HomeOutlined style={{ color: "#1890ff" }} />
              <Text strong>Chi tiết hiệu suất theo khu vực</Text>
            </Space>
          }
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={areaEfficiency}
            loading={loading}
            pagination={{
              total: areaEfficiency.length,
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} bàn ghi`,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default PigStatistics;
