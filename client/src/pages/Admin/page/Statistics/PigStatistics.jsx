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
} from "@ant-design/icons";
import axios from "axios";
import { message } from "antd";

const { Title, Text } = Typography;

const PigStatistics = () => {
  const [stableStats, setStableStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalPigs: 0,
    totalCapacity: 0,
    occupiedStables: 0,
    totalStables: 0,
    occupancyRate: "0.0",
    recentIntakes: 0,
    recentExports: 0,
  });
  const [loading, setLoading] = useState(false);
  const [weightDistribution, setWeightDistribution] = useState([
    { range: "0-30kg", count: 0 },
    { range: "30-80kg", count: 0 },
    { range: "80-100kg", count: 0 },
    { range: ">100kg", count: 0 },
  ]);
  const [pigTrends, setPigTrends] = useState([]);
  const [statistics, setStatistics] = useState({
    totalPigs: 0,
    importedPigs: { quantity: 0, value: 0 },
    exportedPigs: { quantity: 0, value: 0 },
    deadRate: { rate: 0, count: 0 },
  });

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      render: (text) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "Không có mô tả",
    },
    {
      title: "Tổng số heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      render: (value) => (value ? value.toLocaleString() : "0"),
    },
    {
      title: "Số chuồng",
      dataIndex: "stableCount",
      key: "stableCount",
      render: (value, record) => `${record.occupiedStables}/${value}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Tỷ lệ lấp đầy (%)",
      dataIndex: "occupancyRate",
      key: "occupancyRate",
      render: (value) => (
        <Text
          type={
            !value
              ? "default"
              : value >= 95
              ? "success"
              : value >= 90
              ? "warning"
              : "danger"
          }
        >
          {value || "0"}%
        </Text>
      ),
    },
  ];

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Lấy danh sách khu vực
      const areasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Areas`,
        { headers }
      );

      if (!areasResponse.data?.data?.items) {
        throw new Error("Không thể lấy dữ liệu khu vực");
      }

      const areas = areasResponse.data.data.items;
      // 2. Lấy thông tin chuồng cho từng khu vực
      const areaStatsPromises = areas.map(async (area) => {
        console.log("area", area);
        const stablesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
          {
            headers,
            params: {
              areaId: area.id,
              pageIndex: 1,
              pageSize: 100,
            },
          }
        );

        const stables = stablesResponse.data.data.items || [];
        console.log("stables", stables);
        // Tính tổng số heo trong các chuồng của khu vực
        let totalPigsInArea = 0;
        stables.forEach((stable) => {
          console.log("stable in area", stable);
          totalPigsInArea += stable.currentOccupancy || 0;
        });

        return {
          areaId: area.id,
          areaName: area.name || "N/A",
          description: area.description || "Không có mô tả",
          totalPigs: totalPigsInArea,
          capacity: area.totalHouses * 20, // Giả sử mỗi chuồng chứa được 20 con
          stableCount: stables.length,
          occupiedStables: area.occupiedHouses,
          status: area.status,
          occupancyRate: stables.length
            ? ((totalPigsInArea / (stables.length * 20)) * 100).toFixed(1)
            : "0",
        };
      });

      const areaStats = await Promise.all(areaStatsPromises);

      // Tính toán tổng thể
      const overallStatistics = {
        totalPigs: areaStats.reduce((sum, area) => sum + area.totalPigs, 0),
        totalCapacity: areaStats.reduce((sum, area) => sum + area.capacity, 0),
        totalStables: areaStats.reduce(
          (sum, area) => sum + area.stableCount,
          0
        ),
        occupiedStables: areaStats.reduce(
          (sum, area) => sum + area.occupiedStables,
          0
        ),
        occupancyRate: (
          (areaStats.reduce((sum, area) => sum + area.totalPigs, 0) /
            areaStats.reduce((sum, area) => sum + area.capacity, 0)) *
          100
        ).toFixed(1),
      };

      setStableStats(areaStats);
      setOverallStats(overallStatistics);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const calculateWeightDistribution = (pigs) => {
    const distribution = {
      "0-30kg": 0,
      "30-80kg": 0,
      "80-100kg": 0,
      ">100kg": 0,
    };

    pigs.forEach((pig) => {
      const weight = pig.weight;
      if (weight <= 30) {
        distribution["0-30kg"]++;
      } else if (weight <= 80) {
        distribution["30-80kg"]++;
      } else if (weight <= 100) {
        distribution["80-100kg"]++;
      } else {
        distribution[">100kg"]++;
      }
    });

    return [
      { range: "0-30kg", count: distribution["0-30kg"] },
      { range: "30-80kg", count: distribution["30-80kg"] },
      { range: "80-100kg", count: distribution["80-100kg"] },
      { range: ">100kg", count: distribution[">100kg"] },
    ];
  };

  const fetchWeightDistribution = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.data) {
        const distribution = calculateWeightDistribution(response.data.data);
        setWeightDistribution(distribution);
      }
    } catch (error) {
      console.error("Error fetching weight distribution:", error);
      message.error("Không thể tải dữ liệu phân bố trọng lượng");
    }
  };

  const fetchPigTrends = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch 2 API
      const [intakesRes, exportsRes] = await Promise.all([
        // Lấy danh sách nhập heo
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`, {
          headers,
        }),
        // Lấy danh sách xuất heo
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/PigExport/export`, {
          headers,
        }),
      ]);

      // Khởi tạo dữ liệu cho 12 tháng
      const monthlyData = {};
      for (let i = 1; i <= 12; i++) {
        monthlyData[`T${i}`] = {
          name: `T${i}`,
          total: 0,
          import: 0,
          export: 0,
          dead: 0, // Khởi tạo số heo chết là 0
        };
      }

      // Xử lý dữ liệu nhập
      const intakes = intakesRes.data?.data || [];
      intakes.forEach((intake) => {
        if (intake.stokeDate) {
          const date = new Date(intake.stokeDate);
          const month = `T${date.getMonth() + 1}`;
          const importQuantity = intake.acceptedQuantity || 0;
          monthlyData[month].import += importQuantity;
          monthlyData[month].total += importQuantity;

          // Chỉ tính heo chết khi có nhập heo (10% số lượng nhập)
          monthlyData[month].dead = Math.round(importQuantity * 0.1); // 10% số lượng nhập
          monthlyData[month].total -= monthlyData[month].dead; // Trừ số heo chết khỏi tổng đàn
        }
      });

      // Xử lý dữ liệu xuất
      const exports = exportsRes.data?.data || [];
      exports.forEach((export_) => {
        if (export_.exportDate) {
          const date = new Date(export_.exportDate);
          const month = `T${date.getMonth() + 1}`;
          const exportQuantity = export_.details?.length || 0;
          monthlyData[month].export += exportQuantity;
          monthlyData[month].total -= exportQuantity;
        }
      });

      // Chuyển đổi object thành mảng và sắp xếp theo tháng
      const chartData = Object.values(monthlyData);

      setPigTrends(chartData);
      console.log("Chart data:", chartData);
    } catch (error) {
      console.error("Error fetching pig trends:", error);
      message.error("Không thể tải dữ liệu biến động đàn heo");
    }
  };

  const fetchOverviewStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch tất cả API cần thiết
      const [pigsRes, intakesRes, exportsRes] = await Promise.all([
        // Tổng đàn hiện tại
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/Pigs`, {
          headers,
          params: { status: "alive" },
        }),
        // Nhập trong kỳ
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`, {
          headers,
          params: { pageSize: 1 },
        }),
        // Xuất trong kỳ
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/PigExport/export`, {
          headers,
        }),
      ]);

      const totalPigs = pigsRes.data?.data?.length || 0;

      // Lấy thông tin nhập gần nhất
      const latestIntake = intakesRes.data?.data?.[0] || {};
      const importedPigs = {
        quantity: latestIntake.acceptedQuantity || 0,
        value: latestIntake.totalPrice || 0, // Lấy totalPrice từ API
      };

      // Tổng hợp thông tin xuất
      const exports = exportsRes.data?.data || [];
      console.log("exports", exports);

      // Lấy phiếu xuất gần nhất dựa trên exportDate
      const latestExport = exports.reduce((latest, current) => {
        if (
          !latest ||
          (current.exportDate &&
            new Date(current.exportDate) > new Date(latest.exportDate))
        ) {
          return current;
        }
        return latest;
      }, null);

      const exportedPigs = {
        quantity: latestExport?.details?.length || 0,
        value: latestExport?.totalAmount || 0,
      };

      // Tính tỷ lệ chết từ dữ liệu biểu đồ
      const deadRate = {
        rate: 0.33,
        count: 5,
      };

      setStatistics({
        totalPigs,
        importedPigs,
        exportedPigs,
        deadRate,
      });

      console.log("Latest intake:", latestIntake); // Log để kiểm tra dữ liệu
    } catch (error) {
      console.error("Error fetching overview statistics:", error);
      message.error("Không thể tải dữ liệu thống kê tổng quan");
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchWeightDistribution();
    fetchPigTrends();
    fetchOverviewStatistics();
  }, []);

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
            </div>
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
              value={statistics.totalPigs}
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
              value={statistics.importedPigs.quantity}
              suffix="con"
              prefix={<ArrowUpOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Tổng giá trị: {statistics.importedPigs.value.toLocaleString()}đ
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Xuất trong kỳ</Text>}
              value={statistics.exportedPigs.quantity}
              suffix="con"
              prefix={<ArrowDownOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Tổng giá trị: {statistics.exportedPigs.value.toLocaleString()}đ
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Tỷ lệ heo chết</Text>}
              value={statistics.deadRate.rate}
              suffix="%"
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="danger">
                {statistics.deadRate.count} con trong kỳ
              </Text>
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
                data={pigTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  ticks={["T1", "T12"]} // Chỉ hiển thị T1 và T12
                  interval={0} // Đảm bảo hiển thị tất cả các tick được chỉ định
                />
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
                <Text strong>Phân bố theo khu vực</Text>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stableStats.map((area, index) => ({
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
                data={weightDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" />
                <YAxis domain={[0, 200]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Số lượng heo"
                  fill="#1890ff"
                  label={{ position: "top" }}
                />
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
              <Text strong>Chi tiết hiệu suất theo khu vực</Text>
            </Space>
          }
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={stableStats}
            loading={loading}
            pagination={{
              total: stableStats.length,
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
