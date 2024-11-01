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

const { Title } = Typography;
const { TextArea } = Input;

const PigImportRequest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableHouses, setAvailableHouses] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [totalAvailableSpace, setTotalAvailableSpace] = useState(0);

  // Giả lập dữ liệu chuồng trại
  const fakeHouses = [
    {
      id: 1,
      areaName: "Khu A",
      houseName: "Chuồng A1",
      totalCapacity: 100,
      currentQuantity: 70,
      availableSpace: 30,
      status: "active",
      lastCleaned: "2024-03-15",
      type: "growing",
    },
    {
      id: 2,
      areaName: "Khu A",
      houseName: "Chuồng A2",
      totalCapacity: 100,
      currentQuantity: 50,
      availableSpace: 50,
      status: "active",
      lastCleaned: "2024-03-14",
      type: "growing",
    },
    {
      id: 3,
      areaName: "Khu B",
      houseName: "Chuồng B1",
      totalCapacity: 80,
      currentQuantity: 0,
      availableSpace: 80,
      status: "ready",
      lastCleaned: "2024-03-16",
      type: "growing",
    },
  ];

  useEffect(() => {
    // Giả lập API call để lấy danh sách chuồng
    setLoading(true);
    setTimeout(() => {
      // Lọc ra các chuồng còn trống
      const availableHouses = fakeHouses.filter(
        (house) => house.availableSpace > 0
      );
      setAvailableHouses(availableHouses);

      // Tính tổng số chỗ trống
      const total = availableHouses.reduce(
        (sum, house) => sum + house.availableSpace,
        0
      );
      setTotalAvailableSpace(total);

      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Chuồng",
      dataIndex: "houseName",
      key: "houseName",
    },
    {
      title: "Sức chứa tối đa",
      dataIndex: "totalCapacity",
      key: "totalCapacity",
      render: (value) => `${value} con`,
    },
    {
      title: "Số lượng hiện tại",
      dataIndex: "currentQuantity",
      key: "currentQuantity",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          active: { color: "processing", text: "Đang sử dụng" },
          ready: { color: "success", text: "Sẵn sàng" },
          cleaning: { color: "warning", text: "Đang vệ sinh" },
          maintenance: { color: "error", text: "Đang bảo trì" },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Vệ sinh lần cuối",
      dataIndex: "lastCleaned",
      key: "lastCleaned",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  const handleQuantityChange = (value) => {
    setSelectedQuantity(value || 0);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Kiểm tra số lượng
      if (values.quantity > totalAvailableSpace) {
        message.error(
          `Số lượng yêu cầu (${values.quantity}) vượt quá số chỗ trống có sẵn (${totalAvailableSpace})`
        );
        return;
      }

      const formattedData = {
        ...values,
        requestDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        expectedDate: values.expectedDate?.format("YYYY-MM-DD"),
        expectedTime: values.expectedTime?.format("HH:mm"),
        documents: values.documents?.fileList?.map((file) => ({
          name: file.name,
          url: file.url || file.response?.url,
        })),
        status: "pending",
        requestedBy: "Current User", // Thay bằng user thật
        availableHouses: availableHouses.map((house) => ({
          id: house.id,
          name: house.houseName,
          availableSpace: house.availableSpace,
        })),
      };

      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Submitted data:", formattedData);

      message.success("Đã tạo yêu cầu nhập heo thành công!");
      form.resetFields();
      setSelectedQuantity(0);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tạo yêu cầu!");
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
