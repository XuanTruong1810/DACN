import { useState, useEffect } from "react";
import axiosInstance from "../../../../utils/axiosConfig";
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
  DatePicker,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeadPigsPage = () => {
  const [deadPigs, setDeadPigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchDeadPigs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/api/v1/pigs/cancel`,
        {
          params: {
            pageIndex: 1,
            pageSize: 10,
          },
        }
      );
      if (response.status === 200) {
        const { items, total } = response.data.data;
        setDeadPigs(items);
        setPagination((prev) => ({
          ...prev,
          total: total,
        }));
      }
    } catch (error) {
      console.error("Error fetching dead pigs:", error);
      message.error("Không thể tải danh sách heo đã hủy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadPigs();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày hủy",
      dataIndex: "deathDate",
      key: "deathDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Nguyên nhân",
      dataIndex: "deathReason",
      key: "deathReason",
    },
    {
      title: "Ghi chú",
      dataIndex: "deathNote",
      key: "deathNote",
    },
    {
      title: "Phương pháp xử lý",
      dataIndex: "handlingMethod",
      key: "handlingMethod",
      render: (method) => {
        switch (method) {
          case "Burial":
            return "Thiêu hủy";
          case "Burning":
            return "Chôn cất";
          default:
            return method;
        }
      },
    },
    {
      title: "Ghi chú xử lý",
      dataIndex: "handlingNotes",
      key: "handlingNotes",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const cancelData = {
        deathDate: values.deathDate.format("YYYY-MM-DD"),
        deathReason: values.deathReason,
        deathNote: values.deathNote,
        handlingMethod: values.handlingMethod,
        handlingNotes: values.handlingNotes,
      };

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/v1/pigs/${values.pigId}/cancel`,
        cancelData
      );

      if (response.status === 200) {
        message.success("Xử lý heo chết thành công");
        fetchDeadPigs();
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error canceling pig:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi xử lý");
    } finally {
      setLoading(false);
    }
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
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize,
              });
            },
          }}
          style={{
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          }}
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
          width={700}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                name="pigId"
                label="Mã heo"
                rules={[{ required: true, message: "Vui lòng nhập mã heo" }]}
              >
                <Input
                  placeholder="Nhập mã heo"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="deathDate"
                label="Ngày chết"
                rules={[{ required: true, message: "Vui lòng chọn ngày chết" }]}
                initialValue={moment()}
              >
                <DatePicker
                  disabledDate={(current) =>
                    current &&
                    (current < moment().startOf("day") ||
                      current > moment().endOf("day"))
                  }
                  style={{ width: "100%", borderRadius: "6px" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="deathReason"
              label="Nguyên nhân"
              rules={[{ required: true, message: "Vui lòng nhập nguyên nhân" }]}
            >
              <Input
                placeholder="Nhập nguyên nhân"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>

            <Form.Item
              name="deathNote"
              label="Ghi chú nguyên nhân"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập ghi chú nguyên nhân",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú về nguyên nhân"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>

            <Form.Item
              name="handlingMethod"
              label="Phương pháp xử lý"
              rules={[
                { required: true, message: "Vui lòng chọn phương pháp xử lý" },
              ]}
            >
              <Select
                placeholder="Chọn phương pháp xử lý"
                style={{ borderRadius: "6px" }}
              >
                <Option value="Burial">Chôn lấp</Option>
                <Option value="Burning">Thiêu hủy</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="handlingNotes"
              label="Ghi chú xử lý"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập ghi chú xử lý",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú về cách xử lý"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: "20px" }}>
              <Space style={{ float: "right" }}>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                  }}
                  style={{ borderRadius: "6px" }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ borderRadius: "6px" }}
                >
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
