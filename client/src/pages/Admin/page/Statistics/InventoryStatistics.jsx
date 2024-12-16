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

const { Text, Title } = Typography;

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Gọi API lấy danh sách phiếu nhập thuốc và thức ăn
        const [medicineResponse, foodResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/MedicineImports`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/FoodImport`),
        ]);

        // Lấy data từ response (do server trả về dạng BaseResponse)
        const medicineImports = medicineResponse.data.data;
        const foodImports = foodResponse.data.data;
        console.log("medicineImports", medicineImports);
        console.log("foodImports", foodImports);

        // Tính tổng giá trị tồn kho
        let totalMedicineValue = 0;
        let totalFoodValue = 0;

        // Tính giá trị tồn thuốc - sử dụng actualQuantity và unitPrice từ details
        medicineImports.forEach((importItem) => {
          totalMedicineValue += importItem.totalPrice;
        });

        // Tính giá trị tồn thức ăn - sử dụng actualQuantity và unitPrice từ details
        foodImports.forEach((importItem) => {
          totalFoodValue += importItem.totalAmount;
        });
        // Tính giá trị nhập kho gần nhất
        const latestMedicineImport = medicineImports
          .filter((imp) => imp.status === "Stocked")
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0];

        console.log("latestMedicineImport", latestMedicineImport);

        const latestFoodImport = foodImports
          .filter((imp) => imp.status === "stocked")
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0];
        console.log("latestFoodImport", latestFoodImport);

        const recentImportValue =
          (latestMedicineImport?.totalPrice || 0) +
          (latestFoodImport?.totalAmount || 0);

        console.log("recentImportValue", recentImportValue);

        // Tạo map để lưu trữ dữ liệu theo tháng
        const monthlyData = new Map();

        // Xử lý dữ liệu thuốc
        medicineImports.forEach((imp) => {
          const date = new Date(imp.createTime);
          const monthKey = `T${date.getMonth() + 1}`;

          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
              month: monthKey,
              medicine: 0,
              food: 0,
            });
          }

          const monthData = monthlyData.get(monthKey);
          imp.details.forEach((detail) => {
            monthData.medicine += detail.actualQuantity * detail.unitPrice;
          });
        });

        // Xử lý dữ liệu thức ăn
        foodImports.forEach((imp) => {
          const date = new Date(imp.createTime);
          const monthKey = `T${date.getMonth() + 1}`;

          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
              month: monthKey,
              medicine: 0,
              food: 0,
            });
          }

          const monthData = monthlyData.get(monthKey);
          imp.details.forEach((detail) => {
            monthData.food += detail.actualQuantity * detail.unitPrice;
          });
        });

        // Chuyển Map thành mảng và sắp xếp theo tháng
        const sortedData = Array.from(monthlyData.values()).sort((a, b) => {
          const monthA = parseInt(a.month.substring(1));
          const monthB = parseInt(b.month.substring(1));
          return monthA - monthB;
        });

        setChartData(sortedData);

        setStatistics({
          totalInventoryValue: totalMedicineValue + totalFoodValue,
          recentImportValue,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatistics({
          ...statistics,
          loading: false,
          error: error.message || "Có lỗi xảy ra khi tải dữ liệu",
        });
      }
    };

    fetchStatistics();
  }, []);

  // Thêm useEffect mới để fetch data cho bảng
  useEffect(() => {
    const fetchLowStockData = async () => {
      try {
        setLoadingTable(true);
        // Gọi API lấy danh sách thuốc và thức ăn
        const [medicineResponse, foodResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/Medicine`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Food`),
        ]);

        const medicines = medicineResponse.data.data;
        const foods = foodResponse.data.data.items;
        console.log("medicines", medicines);
        console.log("foods", foods);

        const THRESHOLD = 100; // Ngưỡng cố định cho hàng sắp hết

        // Xử lý và kết hợp dữ liệu
        const medicineItems = medicines
          .filter((med) => med.quantityInStock <= THRESHOLD && med.isActive) // Dưới 100 là sắp hết
          .map((med) => ({
            key: `med-${med.id}`,
            name: med.medicineName,
            type: "medicine",
            currentStock: med.quantityInStock,
            minStock: THRESHOLD,
            unit: med.unit,
            status: med.quantityInStock < THRESHOLD / 2 ? "danger" : "warning", // Dưới 50 là danger
          }));

        const foodItems = foods
          .filter(
            (food) => food.quantityInStock <= 500 && food.status === "active"
          ) // Dưới 100 là sắp hết
          .map((food) => ({
            key: `food-${food.id}`,
            name: food.name,
            type: "food",
            currentStock: food.quantityInStock,
            minStock: 500,
            unit: "kg",
            status: food.quantityInStock < 500 / 2 ? "danger" : "warning", // Dưới 50 là danger
          }));

        // Kết hợp và sắp xếp theo mức độ cảnh báo
        const combinedData = [...medicineItems, ...foodItems].sort((a, b) => {
          // Sắp xếp danger lên trước
          if (a.status === "danger" && b.status !== "danger") return -1;
          if (a.status !== "danger" && b.status === "danger") return 1;
          // Sau đó sắp xếp theo tỷ lệ tồn kho/min stock
          return a.currentStock / a.minStock - b.currentStock / b.minStock;
        });

        setLowStockData(combinedData);
        setLoadingTable(false);
      } catch (error) {
        console.error(error);
        setLoadingTable(false);
      }
    };

    fetchLowStockData();
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
