import { useState, useEffect } from "react";
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
  Select,
  DatePicker,
  TimePicker,
  Upload,
  Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

const PigImportRequest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableHouses, setAvailableHouses] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [totalAvailableSpace, setTotalAvailableSpace] = useState(0);
  const [areaIdA, setAreaIdA] = useState(null);

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

        const areaA = areasResponse.data.data.items.find((area) =>
          area.name.toLowerCase().includes("a")
        );

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
      title: "Nhiệt độ",
      dataIndex: "temperature",
      key: "temperature",
    },
    {
      title: "Độ ẩm",
      dataIndex: "humidity",
      key: "humidity",
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

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>Tạo yêu cầu nhập heo đực giống</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            pigType: "boar", // Mặc định là heo đực
            quantity: 1,
            averageWeight: 0,
            age: 1,
            healthStatus: "healthy", // Mặc định là khỏe mạnh
          }}
        >
          <Card title="Thông tin heo" type="inner">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                name="quantity"
                label="Số lượng (con)"
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
                />
              </Form.Item>

              <Form.Item
                name="averageWeight"
                label="Trọng lượng trung bình (kg)"
                rules={[
                  { required: true, message: "Vui lòng nhập trọng lượng" },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="age"
                label="Độ tuổi (tuần)"
                rules={[{ required: true, message: "Vui lòng nhập độ tuổi" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="healthStatus"
                label="Tình trạng sức khỏe"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn tình trạng sức khỏe",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn tình trạng sức khỏe"
                  options={healthStatusOptions}
                />
              </Form.Item>
            </div>
          </Card>

          <Card
            title="Thông tin chuồng trại"
            type="inner"
            style={{ marginTop: "16px" }}
          >
            <Alert
              message="Thông tin số lượng"
              description={
                <Space direction="vertical">
                  <div>
                    Tổng số chỗ trống có sẵn:{" "}
                    <Tag color="blue">{totalAvailableSpace} con</Tag>
                  </div>
                  {selectedQuantity > 0 && (
                    <>
                      <div>
                        Số lượng cần nhập:{" "}
                        <Tag color="green">{selectedQuantity} con</Tag>
                      </div>
                      <div>
                        Còn lại sau khi nhập:{" "}
                        <Tag color="orange">
                          {totalAvailableSpace - selectedQuantity} con
                        </Tag>
                      </div>
                    </>
                  )}
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={columns}
              dataSource={availableHouses}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>

          <Form.Item name="notes" label="Ghi chú" style={{ marginTop: "16px" }}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item style={{ marginTop: "16px" }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo yêu cầu
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setSelectedQuantity(0);
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PigImportRequest;
