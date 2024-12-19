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
  Progress,
  message,
  Spin,
} from "antd";
import {
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
  DashboardOutlined,
  BarChartOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PerformanceStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [stableStats, setStableStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
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
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy thống kê hiệu suất tổng quan
      const performanceResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/StatisticPerformance/performance`,
        {
          params: {
            fromDate: dateRange[0].toISOString(),
            toDate: dateRange[1].toISOString(),
          },
        }
      );

      const performanceData = performanceResponse.data.data;
      setOverallStats({
        totalPigs: performanceData.totalPigs,
        averageWeight: performanceData.averageWeight,
        averageFCR: performanceData.fcr,
        averageEfficiency: performanceData.efficiency,
      });

      // 2. Lấy dữ liệu biểu đồ Radar
      const radarResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/StatisticPerformance/radar-chart`,
        {
          params: {
            fromDate: dateRange[0].toISOString(),
            toDate: dateRange[1].toISOString(),
          },
        }
      );

      const radarData = radarResponse.data.data;
      setRadarData([
        {
          subject: "Tăng trọng",
          current: radarData.current.weightGain || 0,
          previous: radarData.previous.weightGain || 0,
          fullMark: 100,
        },
        {
          subject: "FCR",
          current: (radarData.current.fcr || 0) * 20, // Scale FCR value
          previous: (radarData.previous.fcr || 0) * 20,
          fullMark: 100,
        },
        {
          subject: "Tỷ lệ sống",
          current: radarData.current.survivalRate || 0,
          previous: radarData.previous.survivalRate || 0,
          fullMark: 100,
        },
        {
          subject: "Hiệu suất",
          current: radarData.current.efficiency || 0,
          previous: radarData.previous.efficiency || 0,
          fullMark: 100,
        },
      ]);

      // 3. Lấy thống kê theo khu vực
      const areaResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/StatisticPerformance/area-performance`,
        {
          params: {
            fromDate: dateRange[0].toISOString(),
            toDate: dateRange[1].toISOString(),
          },
        }
      );

      const areaData = areaResponse.data.data;
      setStableStats(
        areaData.map((area) => ({
          key: area.areaName,
          areaName: area.areaName,
          totalPigs: area.totalPigs,
          averageWeight: area.averageWeight,
          fcr: area.fcr,
          mortalityRate: area.deathRate,
          efficiency: area.efficiency,
        }))
      );

      setPagination(prev => ({
        ...prev,
        total: areaData.length
      }));

    } catch (error) {
      console.error("Error fetching statistics:", error);
      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const handleTableChange = (pagination, filters, sorter) => {
    fetchStatistics(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Tổng heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      render: (value) => `${value} con`,
    },
    {
      title: "Trọng lượng TB",
      dataIndex: "averageWeight",
      key: "averageWeight",
      render: (value) => `${value.toFixed(2)} kg`,
    },
    {
      title: "FCR",
      dataIndex: "fcr",
      key: "fcr",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Tỷ lệ chết",
      dataIndex: "mortalityRate",
      key: "mortalityRate",
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "Hiệu suất",
      key: "efficiency",
      dataIndex: "efficiency",
      render: (value) => (
        <Progress
          percent={Number(value.toFixed(2))}
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
        <div className="stats-header">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <DashboardOutlined /> Thống kê hiệu suất
              </Title>
            </Col>
            <Col>
              <RangePicker
                value={dateRange}
                ranges={customRanges}
                onChange={(dates) => setDateRange(dates)}
                allowClear={false}
              />
            </Col>
          </Row>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng số heo"
                    value={overallStats?.totalPigs}
                    suffix="con"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Trọng lượng TB"
                    value={overallStats?.averageWeight}
                    precision={2}
                    suffix="kg"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="FCR Trung bình"
                    value={overallStats?.averageFCR}
                    precision={2}
                    valueStyle={
                      overallStats?.averageFCR <= 2.7
                        ? { color: "#3f8600" }
                        : { color: "#cf1322" }
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Hiệu suất TB"
                    value={overallStats?.averageEfficiency}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <RadarChartOutlined />
                      <Text strong>Phân tích hiệu suất</Text>
                    </Space>
                  }
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart
                      data={radarData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Hiện tại"
                        dataKey="current"
                        stroke="#1890ff"
                        fill="#1890ff"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Kỳ trước"
                        dataKey="previous"
                        stroke="#52c41a"
                        fill="#52c41a"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <RechartsTooltip 
                        formatter={(value, name, props) => {
                          const subject = props;
                          if (subject === "FCR") {
                            return [(value / 20).toFixed(2), name]; // Convert back from scaled value
                          }
                          return [value.toFixed(2) + '%', name];
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <BarChartOutlined />
                      <Text strong>FCR theo khu vực</Text>
                    </Space>
                  }
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={stableStats.map((stable) => ({
                        house: stable.stableName,
                        fcr: stable.fcr,
                        target: 2.7,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="house" />
                      <YAxis domain={[2, 3]} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="fcr" name="FCR thực tế" fill="#1890ff" />
                      <Bar
                        dataKey="target"
                        name="FCR mục tiêu"
                        fill="#52c41a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Card
              className="mt-4"
              title={
                <Space>
                  <DashboardOutlined />
                  <span>Chi tiết hiệu suất theo khu vực</span>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={stableStats}
                rowKey="stableId"
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: true }}
                loading={loading}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceStatistics;
