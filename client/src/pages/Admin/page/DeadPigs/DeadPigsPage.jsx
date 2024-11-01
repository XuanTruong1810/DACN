import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Card,
  Typography,
  Select,
  InputNumber,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeadPigsPage = () => {
  const [deadPigs, setDeadPigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Fake data
  const fakeData = [
    {
      id: 1,
      pigId: "H001",
      deathDate: "2024-03-15",
      cause: "Bệnh tiêu chảy",
      weight: 25.5,
      disposalMethod: "Chôn lấp",
      location: "Khu vực A",
      handledBy: "Nguyễn Văn A",
      notes: "Đã xử lý theo quy trình an toàn sinh học",
    },
    // Thêm dữ liệu mẫu khác nếu cần
  ];

  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setDeadPigs(fakeData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: "Mã heo",
      dataIndex: "pigId",
      key: "pigId",
    },
    {
      title: "Ngày chết",
      dataIndex: "deathDate",
      key: "deathDate",
      sorter: (a, b) => new Date(a.deathDate) - new Date(b.deathDate),
    },
    {
      title: "Nguyên nhân",
      dataIndex: "cause",
      key: "cause",
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Phương pháp xử lý",
      dataIndex: "disposalMethod",
      key: "disposalMethod",
    },
    {
      title: "Người xử lý",
      dataIndex: "handledBy",
      key: "handledBy",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingRecord) {
        // Xử lý cập nhật
        const updatedRecords = deadPigs.map((record) =>
          record.id === editingRecord.id ? { ...values, id: record.id } : record
        );
        setDeadPigs(updatedRecords);
        message.success("Cập nhật thông tin thành công");
      } else {
        // Xử lý thêm mới
        const newRecord = {
          ...values,
          id: deadPigs.length + 1,
        };
        setDeadPigs([...deadPigs, newRecord]);
        message.success("Thêm mới thành công");
      }
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản ghi này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setDeadPigs(deadPigs.filter((record) => record.id !== id));
        message.success("Xóa thành công");
      },
    });
  };

  const handleView = (record) => {
    Modal.info({
      title: "Chi tiết xử lý heo chết",
      width: 600,
      content: (
        <div style={{ padding: "20px 0" }}>
          <p>
            <strong>Mã heo:</strong> {record.pigId}
          </p>
          <p>
            <strong>Ngày chết:</strong> {record.deathDate}
          </p>
          <p>
            <strong>Nguyên nhân:</strong> {record.cause}
          </p>
          <p>
            <strong>Cân nặng:</strong> {record.weight} kg
          </p>
          <p>
            <strong>Phương pháp xử lý:</strong> {record.disposalMethod}
          </p>
          <p>
            <strong>Vị trí xử lý:</strong> {record.location}
          </p>
          <p>
            <strong>Người xử lý:</strong> {record.handledBy}
          </p>
          <p>
            <strong>Ghi chú:</strong> {record.notes}
          </p>
        </div>
      ),
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={3}>Quản lý heo chết</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={deadPigs}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingRecord ? "Cập nhật thông tin" : "Thêm mới"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingRecord(null);
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="pigId"
              label="Mã heo"
              rules={[{ required: true, message: "Vui lòng nhập mã heo" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="deathDate"
              label="Ngày chết"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="cause"
              label="Nguyên nhân"
              rules={[{ required: true, message: "Vui lòng nhập nguyên nhân" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="weight"
              label="Cân nặng (kg)"
              rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="disposalMethod"
              label="Phương pháp xử lý"
              rules={[
                { required: true, message: "Vui lòng chọn phương pháp xử lý" },
              ]}
            >
              <Select>
                <Option value="Chôn lấp">Chôn lấp</Option>
                <Option value="Đốt">Đốt</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label="Vị trí xử lý"
              rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="handledBy"
              label="Người xử lý"
              rules={[{ required: true, message: "Vui lòng nhập người xử lý" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space style={{ float: "right" }}>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRecord ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DeadPigsPage;
