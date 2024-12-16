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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchStatistics = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const stablesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
        {
          headers,
          params: {
            pageIndex: page,
            pageSize: pageSize,
          },
        }
      );

      const responseData = stablesResponse.data.data;
      const stables = responseData.items;

      setPagination({
        current: responseData.currentPage,
        pageSize: responseData.pageSize,
        total: responseData.totalCount,
      });

      if (
        dateRange[0].isSame(dayjs().subtract(30, "days")) &&
        dateRange[1].isSame(dayjs())
      ) {
        const stableStats = stables.map((stable) => ({
          stableId: stable.id,
          stableName: stable.name,
          areaName: stable.areaName || "Chưa có khu vực",
          totalPigs: stable.currentOccupancy,
          averageWeight: 0,
          fcr: 0,
          capacity: stable.capacity,
          currentOccupancy: stable.currentOccupancy,
          mortalityRate: 0,
          efficiency:
            stable.capacity > 0
              ? parseFloat(
                  ((stable.currentOccupancy / stable.capacity) * 100).toFixed(2)
                )
              : 0,
        }));

        setStableStats(stableStats);

        const totalPigs = stables.reduce(
          (sum, stable) => sum + stable.currentOccupancy,
          0
        );
        const nonEmptyStables = stables.filter((stable) => stable.capacity > 0);

        setOverallStats({
          totalPigs,
          averageWeight: 0,
          averageFCR: 0,
          averageEfficiency:
            nonEmptyStables.length > 0
              ? parseFloat(
                  (
                    nonEmptyStables.reduce(
                      (sum, stable) =>
                        sum + (stable.currentOccupancy / stable.capacity) * 100,
                      0
                    ) / nonEmptyStables.length
                  ).toFixed(2)
                )
              : 0,
          overallMortalityRate: 0,
          previousAverageWeight: 0,
          previousFCR: 0,
          previousEfficiency: 0,
          previousMortalityRate: 0,
        });
      } else {
        const daysDiff = dateRange[1].diff(dateRange[0], "days");

        const stableStats = stables.map((stable) => {
          const seed = stable.id.charCodeAt(stable.id.length - 1) + daysDiff;
          const fakePigCount = Math.floor(
            Math.random() * (stable.capacity - 10) + 10
          );

          return {
            stableId: stable.id,
            stableName: stable.name,
            areaName: stable.areaName || "Chưa có khu vực",
            totalPigs: fakePigCount,
            averageWeight: parseFloat((Math.random() * 20 + 50).toFixed(2)),
            fcr: parseFloat((Math.random() * 0.4 + 2.5).toFixed(2)),
            capacity: stable.capacity,
            currentOccupancy: fakePigCount,
            mortalityRate: parseFloat((Math.random() * 1.5).toFixed(2)),
            efficiency: parseFloat(
              ((fakePigCount / stable.capacity) * 100).toFixed(2)
            ),
          };
        });

        setStableStats(stableStats);

        const totalPigs = stableStats.reduce(
          (sum, stable) => sum + stable.totalPigs,
          0
        );
        const averageWeight = parseFloat(
          (
            stableStats.reduce((sum, stable) => sum + stable.averageWeight, 0) /
            stableStats.length
          ).toFixed(2)
        );
        const overallFCR = parseFloat(
          (
            stableStats.reduce((sum, stable) => sum + stable.fcr, 0) /
            stableStats.length
          ).toFixed(2)
        );
        const overallEfficiency = parseFloat(
          (
            stableStats.reduce((sum, stable) => sum + stable.efficiency, 0) /
            stableStats.length
          ).toFixed(2)
        );

        setOverallStats({
          totalPigs,
          averageWeight,
          averageFCR: overallFCR,
          averageEfficiency: overallEfficiency,
          overallMortalityRate: parseFloat((Math.random() * 1.5).toFixed(2)),
          previousAverageWeight: averageWeight - 5,
          previousFCR: overallFCR + 0.1,
          previousEfficiency: overallEfficiency - 5,
          previousMortalityRate: parseFloat((Math.random() * 2).toFixed(2)),
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    fetchStatistics(pagination.current, pagination.pageSize);
  };

  useEffect(() => {
    fetchStatistics(1, 10);
  }, [dateRange]);

  const columns = [
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
    },
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
                      data={[
                        {
                          subject: "Tăng trọng",
                          current: overallStats?.averageWeight || 0,
                          previous: overallStats?.previousAverageWeight || 0,
                          fullMark: 100,
                        },
                        {
                          subject: "FCR",
                          current: (overallStats?.averageFCR || 0) * 20,
                          previous: (overallStats?.previousFCR || 0) * 20,
                          fullMark: 100,
                        },
                        {
                          subject: "Tỷ lệ sống",
                          current:
                            100 - (overallStats?.overallMortalityRate || 0),
                          previous:
                            100 - (overallStats?.previousMortalityRate || 0),
                          fullMark: 100,
                        },
                        {
                          subject: "Hiệu suất",
                          current: overallStats?.averageEfficiency || 0,
                          previous: overallStats?.previousEfficiency || 0,
                          fullMark: 100,
                        },
                      ]}
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
                  <span>Chi tiết hiệu suất theo chuồng</span>
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
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceStatistics;
