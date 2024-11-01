import { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Layout,
  Row,
  Col,
  Tag,
  Tooltip,
  Dropdown,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const FoodCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Mock data - thay thế bằng API call thực tế
  const [categories] = useState([
    {
      id: 1,
      name: "Thức ăn hỗn hợp",
      description: "Thức ăn được phối trộn từ nhiều nguyên liệu khác nhau",
      status: "active",
      totalProducts: 15,
    },
    {
      id: 2,
      name: "Cám",
      description: "Các loại cám cho vật nuôi",
      status: "active",
      totalProducts: 8,
    },
    {
      id: 3,
      name: "Thức ăn tinh",
      description: "Thức ăn có hàm lượng dinh dưỡng cao",
      status: "inactive",
      totalProducts: 10,
    },
  ]);

  const columns = [
    {
      title: "Tên loại",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          {text.length > 50 ? `${text.substring(0, 50)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: "Số sản phẩm",
      dataIndex: "totalProducts",
      key: "totalProducts",
      render: (total) => <Tag color="blue">{total}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Đang sử dụng" : "Ngừng sử dụng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => handleView(record),
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa loại thức ăn",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận xóa",
                content: "Bạn có chắc chắn muốn xóa loại thức ăn này?",
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: {
                  danger: true,
                  size: "middle",
                },
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
            arrow={{
              pointAtCenter: true,
            }}
          >
            <Button
              icon={<MoreOutlined />}
              style={{
                border: "none",
                background: "transparent",
                boxShadow: "none",
              }}
              className="action-button"
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleView = (record) => {
    // Xử lý xem chi tiết
    console.log("View:", record);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    console.log(id);
    try {
      setLoading(true);
      // Gọi API xóa
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success("Xóa loại thức ăn thành công");
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi xóa loại thức ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      // Gọi API thêm/sửa
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success(
        `${editingCategory ? "Cập nhật" : "Thêm"} loại thức ăn thành công`
      );
      setIsModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
    } catch (error) {
      console.log(error);
      message.error(
        `Có lỗi xảy ra khi ${
          editingCategory ? "cập nhật" : "thêm"
        } loại thức ăn`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <span
              style={{ fontSize: "24px", fontWeight: 600, color: "#262626" }}
            >
              Quản lý loại thức ăn
            </span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm loại thức ăn
            </Button>
          </Col>
        </Row>
      </div>

      {/* Search Section */}
      <Card
        bodyStyle={{ padding: "16px" }}
        style={{ marginBottom: "16px", borderRadius: "8px" }}
      >
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm theo tên loại..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} loại thức ăn`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#262626" }}>
            {editingCategory
              ? "Cập nhật loại thức ăn"
              : "Thêm loại thức ăn mới"}
          </span>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        footer={null}
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "active" }}
        >
          <Form.Item
            name="name"
            label="Tên loại thức ăn"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại thức ăn" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Select.Option value="active">Đang sử dụng</Select.Option>
              <Select.Option value="inactive">Ngừng sử dụng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingCategory(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .action-button {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background-color: #f5f5f5 !important;
          border-radius: 4px;
        }

        .ant-table {
          background: white;
        }

        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          border-bottom: 1px solid #f0f0f0;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fafafa;
        }

        .ant-btn {
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          height: 32px;
        }

        .ant-input {
          border-radius: 6px;
        }

        .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-dropdown-menu {
          padding: 4px;
          border-radius: 8px;
        }

        .ant-dropdown-menu-item {
          border-radius: 4px;
        }

        .ant-tag {
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  );
};

export default FoodCategoriesPage;
