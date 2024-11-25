import { useState, useEffect } from "react";

import axiosConfig from "../../../../utils/axiosConfig";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  InputNumber,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Alert,
  Statistic,
  Divider,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  InboxOutlined,
  WarningOutlined,
  DashboardOutlined,
  BarChartOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Thêm custom styles
const styles = {
  pageContainer: {
    padding: "24px",
    background: "#f0f2f5",
    minHeight: "100vh",
  },
  headerCard: {
    borderRadius: "8px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  mainCard: {
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  innerCard: {
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
  },
  statsCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "24px",
    height: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  table: {
    ".ant-table": {
      borderRadius: "8px",
    },
  },
};

const PigImportRequest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableHouses, setAvailableHouses] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [totalAvailableSpace, setTotalAvailableSpace] = useState(0);
  const [areaIdA, setAreaIdA] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch areas để lấy ID của khu A
        const areasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/areas`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const areaA = areasResponse.data.data.items[0];
        console.log(areaA);

        if (!areaA) {
          message.error("Không tìm thấy khu vực A");
          return;
        }

        setAreaIdA(areaA.id);

        // 2. Fetch stables của khu A
        const stablesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/Stables?areaId=${areaA.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Format lại data cho phù hợp với response API
        const formattedStables = stablesResponse.data.data.items.map(
          (stable) => ({
            id: stable.id,
            areaName: stable.areaName,
            name: stable.name,
            capacity: stable.capacity,
            currentOccupancy: stable.currentOccupancy,
            availableSpace: stable.capacity - stable.currentOccupancy,
            status:
              stable.status === "Available"
                ? "active"
                : stable.status === "UnderMaintenance"
                ? "maintenance"
                : stable.status === "Cleaning"
                ? "cleaning"
                : "ready",
            temperature: stable.temperature,
            humidity: stable.humidity,
          })
        );

        // Lọc ra các chuồng còn trống và đang hoạt động
        const availableStables = formattedStables.filter(
          (stable) => stable.availableSpace > 0 && stable.status === "active"
        );

        setAvailableHouses(availableStables);

        // Tính tổng số chỗ trống
        const total = availableStables.reduce(
          (sum, stable) => sum + stable.availableSpace,
          0
        );
        setTotalAvailableSpace(total);
      } catch (error) {
        message.error(
          error.response?.data?.message || "Không thể tải dữ liệu chuồng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Chuồng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Sức chứa tối đa",
      dataIndex: "capacity",
      key: "capacity",
      render: (value) => `${value} con`,
    },
    {
      title: "Số lượng hiện tại",
      dataIndex: "currentOccupancy",
      key: "currentOccupancy",
      render: (value) => `${value} con`,
    },
    {
      title: "Còn trống",
      dataIndex: "availableSpace",
      key: "availableSpace",
      render: (value) => (
        <Tag color={value > 0 ? "green" : "red"}>{value} con</Tag>
      ),
    },
    {
      title: "Môi trường",
      key: "environment",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <ThunderboltOutlined style={{ color: "#faad14" }} />
            <span>Nhiệt độ: {record.temperature}°C</span>
          </Space>
          <Space>
            <CloudOutlined style={{ color: "#1890ff" }} />
            <span>Độ ẩm: {record.humidity}%</span>
          </Space>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          active: { color: "processing", text: "Đang hoạt động" },
          ready: { color: "success", text: "Sẵn sàng" },
          cleaning: { color: "warning", text: "Đang vệ sinh" },
          maintenance: { color: "error", text: "Đang bảo trì" },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const handleQuantityChange = (value) => {
    setSelectedQuantity(value || 0);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (values.quantity > totalAvailableSpace) {
        message.error(
          `Số lượng yêu cầu (${values.quantity}) vượt quá số chỗ trống có sẵn (${totalAvailableSpace})`
        );
        return;
      }

      const formData = {
        areasId: areaIdA,
        expectedQuantity: values.quantity,
        age: values.age,
        weight: values.averageWeight,
        healthStatus: values.healthStatus,
        note: values.notes,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Đã tạo yêu cầu nhập heo thành công!");
      navigate("/admin/inventory/request-list");
      form.resetFields();
      setSelectedQuantity(0);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo yêu cầu!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa options cho tình trạng sức khỏe
  const healthStatusOptions = [
    { value: "healthy", label: "Khỏe mạnh" },
    { value: "sick", label: "Bệnh" },
    { value: "quarantine", label: "Cần kiểm dịch" },
  ];

  // Thêm style cho cột môi trường
  const additionalStyle = `
    .environment-column {
      min-width: 150px;
    }
    .environment-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .environment-value {
      font-weight: 500;
    }
    .ant-table-cell .anticon {
      font-size: 16px;
    }
  `;

  // Cập nhật style
  const style = document.createElement("style");
  style.textContent = `
    .custom-table .ant-table {
      border-radius: 8px;
      overflow: hidden;
    }
    .custom-table .ant-table-thead > tr > th {
      background: #fafafa;
    }
    .ant-card {
      border-radius: 8px;
    }
    .ant-input, .ant-input-number {
      border-radius: 6px;
    }
    .ant-btn {
      border-radius: 6px;
      display: flex;
      align-items: center;
    }
    .ant-alert {
      border-radius: 6px;
    }
    .ant-statistic-title {
      margin-bottom: 8px;
    }
    ${additionalStyle}
  `;
  document.head.appendChild(style);

  return (
    <div style={styles.pageContainer}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <HomeOutlined /> Tạo yêu cầu nhập heo
            </Title>
          </Col>
        </Row>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1,
        }}
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card style={styles.statsCard}>
              <Statistic
                title={<Text strong>Tổng số chỗ trống</Text>}
                value={totalAvailableSpace}
                suffix="con"
                prefix={<InboxOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={styles.statsCard}>
              <Statistic
                title={<Text strong>Số lượng cần nhập</Text>}
                value={selectedQuantity}
                suffix="con"
                prefix={<DashboardOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={styles.statsCard}>
              <Statistic
                title={<Text strong>Còn lại sau khi nhập</Text>}
                value={totalAvailableSpace - selectedQuantity}
                suffix="con"
                prefix={<BarChartOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card style={styles.mainCard}>
          {/* Thông tin chuồng trại */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={4}>
              <HomeOutlined /> Thông tin chuồng trại
            </Title>
            <Alert
              message={
                <Text strong>
                  <WarningOutlined /> Thông tin chuồng trại hiện có
                </Text>
              }
              description="Dưới đây là danh sách các chuồng còn trống và đang hoạt động"
              type="info"
              showIcon
              style={{ marginBottom: "16px" }}
            />
            <Table
              columns={columns}
              dataSource={availableHouses}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              style={styles.table}
              className="custom-table"
            />
          </div>

          <Divider />

          {/* Thông tin heo */}
          <div>
            <Title level={4}>
              <InboxOutlined /> Thông tin heo
            </Title>
            <Alert
              message={
                <Text strong>
                  <WarningOutlined /> Lưu ý quan trọng
                </Text>
              }
              description="Heo cần đạt chuẩn từ 7 tuần tuổi trở lên và có cân nặng từ 10 đến 20 kg"
              type="warning"
              showIcon
              style={{ marginBottom: "24px" }}
            />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="quantity"
                  label={<Text strong>Số lượng heo cần nhập (con)</Text>}
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                    {
                      validator: (_, value) => {
                        if (value > totalAvailableSpace) {
                          return Promise.reject(
                            `Số lượng không được vượt quá ${totalAvailableSpace} con`
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    onChange={handleQuantityChange}
                    placeholder="Nhập số lượng heo"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="notes" label={<Text strong>Ghi chú</Text>}>
                  <TextArea
                    rows={4}
                    placeholder="Nhập ghi chú nếu có"
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <Row justify="end" style={{ marginTop: "24px" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  setSelectedQuantity(0);
                }}
                size="large"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
                size="large"
              >
                Tạo yêu cầu
              </Button>
            </Space>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default PigImportRequest;
