/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Progress,
  Tag,
  Spin,
  DatePicker,
} from "antd";
import {
  InboxOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "../../../../utils/axiosConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const InventoryStatistics = () => {
  const [statistics, setStatistics] = useState({
    totalInventoryValue: 0,
    recentImportValue: 0,
    loading: true,
    error: null,
  });

  const [chartData, setChartData] = useState([]);

  const [lowStockData, setLowStockData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
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

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      fetchStatistics(dates[0].toDate(), dates[1].toDate());
      fetchTrendData(dates[0].toDate(), dates[1].toDate());
      fetchLowStockItems(dates[0].toDate(), dates[1].toDate());
    }
  };

  const fetchStatistics = async (fromDate, toDate) => {
    try {
      setStatistics((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/StatisticInventory/inventory-statistics`,
        {
          params: {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          },
        }
      );

      const data = response.data.data;
      setStatistics({
        totalInventoryValue: data.current.value,
        recentImportValue: data.latest.value,
        loading: false,
        error: null,
        currentGrowth: parseFloat(data.current.growthRate),
        latestGrowth: parseFloat(data.latest.growthRate),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatistics((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Có lỗi xảy ra khi tải dữ liệu",
      }));
    }
  };

  const fetchTrendData = async (fromDate, toDate) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/StatisticInventory/inventory-trend`,
        {
          params: {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          },
        }
      );

      const data = response.data.data;
      const transformedData = data.labels.map((month, index) => ({
        month: month,
        medicine: data.medicineValues[index],
        food: data.foodValues[index],
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  };

  const fetchLowStockItems = async (fromDate, toDate) => {
    try {
      setLoadingTable(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/StatisticInventory/low-stock-items`,
        {
          params: {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          },
        }
      );

      const items = response.data.data;
      const transformedData = items.map((item, index) => ({
        key: `${item.type}-${index}`,
        name: item.name,
        type: item.type.toLowerCase(),
        currentStock: item.currentStock,
        minStock: item.minimumStock,
        status: item.isLow ? "danger" : "warning",
      }));

      setLowStockData(transformedData);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStatistics(dateRange[0].toDate(), dateRange[1].toDate());
    fetchTrendData(dateRange[0].toDate(), dateRange[1].toDate());
    fetchLowStockItems(dateRange[0].toDate(), dateRange[1].toDate());
  }, []);

  // Format số tiền thành tỷ/triệu
  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return {
        value: (value / 1000000000).toFixed(1),
        unit: "tỷ",
      };
    } else if (value >= 1000000) {
      return {
        value: (value / 1000000).toFixed(0),
        unit: "triệu",
      };
    } else if (value >= 1000) {
      return {
        value: (value / 1000).toFixed(0),
        unit: "nghìn",
      };
    } else {
      return {
        value: value.toFixed(0),
        unit: "đồng",
      };
    }
  };

  const totalValueFormatted = formatCurrency(statistics.totalInventoryValue);
  const recentImportFormatted = formatCurrency(statistics.recentImportValue);

  console.log("totalValueFormatted", totalValueFormatted);
  console.log("recentImportFormatted", recentImportFormatted);

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
        <Tag color={type === "Thuốc" ? "blue" : "green"}>
          {type === "Thức ăn" ? "Thức ăn" : "Thuốc"}
        </Tag>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock) => `${stock.toLocaleString()}`,
    },
    {
      title: "Mức tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      render: (min) => `${min.toLocaleString()}`,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Progress
          percent={Math.round((record.currentStock / record.minStock) * 100)}
          size="small"
          status={record.status === "danger" ? "exception" : "active"}
        />
      ),
    },
  ];

  return (
    <div className="statistics-container" style={{ padding: "24px" }}>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <div>
            <Title level={2}>
              <InboxOutlined /> Thống kê kho
            </Title>
            <div>
              <Text>Thống kê tình hình nhập xuất và tồn kho</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Cập nhật: {new Date().toLocaleDateString("vi-VN")}
              </Tag>
            </div>
          </div>
        </Col>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            allowClear={false}
            ranges={customRanges}
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

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
                {statistics.loading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {totalValueFormatted.value}{" "}
                    <span className="stat-unit">
                      {totalValueFormatted.unit}
                    </span>
                  </>
                )}
              </Title>
              <div className="stat-footer">
                <Tag color="success" icon={<ArrowUpOutlined />}>
                  Tăng 8%
                </Tag>
                <Text type="secondary" className="stat-period">
                  so với lần nhập kho trước
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
              <Text type="secondary">Giá trị nhập kho gần nhất</Text>
            </div>
            <div className="stat-content">
              <Title level={3} style={{ margin: "16px 0", color: "#52c41a" }}>
                {statistics.loading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {recentImportFormatted.value}{" "}
                    <span className="stat-unit">
                      {recentImportFormatted.unit}
                    </span>
                  </>
                )}
              </Title>
              <div className="stat-footer">
                <Tag color="success" icon={<ArrowUpOutlined />}>
                  Tăng 12%
                </Tag>
                <Text type="secondary" className="stat-period">
                  so với lần nhập kho trước
                </Text>
              </div>
            </div>
          </Card>
        </Col>
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
              <LineChart data={chartData}>
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
          bordered={false}
        >
          <Table
            loading={loadingTable}
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
