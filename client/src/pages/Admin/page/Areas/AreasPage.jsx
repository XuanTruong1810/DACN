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
  Badge,
  Typography,
  Progress,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const AreasPage = () => {
  const [loading, setLoading] = useState(false);
  const [, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [form] = Form.useForm();

  // Mock data - thay thế bằng API call thực tế
  const [areas] = useState([
    {
      id: 1,
      name: "Khu A",
      description: "Khu vực chăn nuôi heo thịt",
      totalHouses: 5,
      occupiedHouses: 3,
      status: "active",
      capacity: 1000,
      currentOccupancy: 750,
      manager: "Nguyễn Văn A",
    },
    {
      id: 2,
      name: "Khu B",
      description: "Khu vực chăn nuôi heo nái",
      totalHouses: 3,
      occupiedHouses: 3,
      status: "active",
      capacity: 500,
      currentOccupancy: 500,
      manager: "Trần Thị B",
    },
    {
      id: 3,
      name: "Khu C",
      description: "Khu vực cách ly",
      totalHouses: 2,
      occupiedHouses: 0,
      status: "maintenance",
      capacity: 200,
      currentOccupancy: 0,
      manager: "Phạm Văn C",
    },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      active: "success",
      inactive: "default",
      maintenance: "warning",
      full: "error",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      maintenance: "Đang bảo trì",
      full: "Đã đầy",
    };
    return texts[status] || "Không xác định";
  };

  const columns = [
    {
      title: "Tên khu vực",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          {text.length > 40 ? `${text.substring(0, 40)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: "Chuồng trại",
      key: "houses",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge
            status={
              record.occupiedHouses === record.totalHouses ? "error" : "success"
            }
            text={
              <Text>
                {record.occupiedHouses}/{record.totalHouses} chuồng đang sử dụng
              </Text>
            }
          />
          <Progress
            percent={Math.round(
              (record.currentOccupancy / record.capacity) * 100
            )}
            size="small"
            status={
              record.currentOccupancy === record.capacity
                ? "exception"
                : "active"
            }
          />
        </Space>
      ),
    },
    {
      title: "Người quản lý",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
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
            key: "houses",
            label: "Quản lý chuồng trại",
            icon: <HomeOutlined />,
            onClick: () => handleManageHouses(record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa khu vực",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận xóa",
                content: "Bạn có chắc chắn muốn xóa khu vực này?",
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
    setEditingArea(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleManageHouses = (record) => {
    // Chuyển đến trang quản lý chuồng trại của khu vực này
    console.log("Manage houses:", record);
  };

  const handleDelete = async (id) => {
    console.log(id);
    try {
      setLoading(true);
      // Gọi API xóa
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success("Xóa khu vực thành công");
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi xóa khu vực");
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
        `${editingArea ? "Cập nhật" : "Thêm"} khu vực thành công`
      );
      setIsModalVisible(false);
      form.resetFields();
      setEditingArea(null);
    } catch (error) {
      console.log(error);
      message.error(
        `Có lỗi xảy ra khi ${editingArea ? "cập nhật" : "thêm"} khu vực`
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
            <Space align="center" size="middle">
              <span
                style={{ fontSize: "24px", fontWeight: 600, color: "#262626" }}
              >
                Quản lý khu vực
              </span>
              <Tag color="blue">
                <Space>
                  <HomeOutlined />
                  {areas.reduce((acc, curr) => acc + curr.totalHouses, 0)}{" "}
                  chuồng trại
                </Space>
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingArea(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm khu vực
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
              placeholder="Tìm kiếm theo tên khu vực..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo trạng thái"
              allowClear
              options={[
                { value: "active", label: "Đang hoạt động" },
                { value: "maintenance", label: "Đang bảo trì" },
                { value: "inactive", label: "Ngừng hoạt động" },
                { value: "full", label: "Đã đầy" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={areas}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} khu vực`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#262626" }}>
            {editingArea ? "Cập nhật khu vực" : "Thêm khu vực mới"}
          </span>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingArea(null);
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
            label="Tên khu vực"
            rules={[{ required: true, message: "Vui lòng nhập tên khu vực" }]}
          >
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalHouses"
                label="Số lượng chuồng"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng chuồng" },
                ]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức chứa tối đa"
                rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="manager"
            label="Người quản lý"
            rules={[{ required: true, message: "Vui lòng nhập người quản lý" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="maintenance">Đang bảo trì</Select.Option>
              <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingArea(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingArea ? "Cập nhật" : "Thêm mới"}
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

        .ant-progress-inner {
          border-radius: 4px !important;
        }

        .ant-progress-bg {
          border-radius: 4px !important;
        }
      `}</style>
    </Layout>
  );
};

export default AreasPage;
