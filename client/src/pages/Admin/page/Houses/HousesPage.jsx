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
  Dropdown,
  Select,
  Typography,
  Progress,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  HomeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const HousesPage = () => {
  const [loading, setLoading] = useState(false);
  //   const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    area: [],
    status: [],
    type: [],
    occupancy: null,
  });

  // Mock data - thay thế bằng API call thực tế
  const [houses] = useState([
    {
      id: 1,
      name: "Chuồng A1",
      area: "Khu A",
      type: "Heo thịt",
      capacity: 100,
      currentOccupancy: 80,
      status: "active",
      temperature: 25,
      humidity: 70,
      lastCleaned: "2024-03-15",
      nextMaintenance: "2024-04-15",
    },
    {
      id: 2,
      name: "Chuồng B2",
      area: "Khu B",
      type: "Heo nái",
      capacity: 50,
      currentOccupancy: 50,
      status: "full",
      temperature: 26,
      humidity: 65,
      lastCleaned: "2024-03-14",
      nextMaintenance: "2024-04-14",
    },
    {
      id: 3,
      name: "Chuồng C1",
      area: "Khu C",
      type: "Cách ly",
      capacity: 20,
      currentOccupancy: 0,
      status: "maintenance",
      temperature: 24,
      humidity: 60,
      lastCleaned: "2024-03-13",
      nextMaintenance: "2024-03-20",
    },
  ]);

  // Mock data cho select options
  const areaOptions = [
    { value: "Khu A", label: "Khu A" },
    { value: "Khu B", label: "Khu B" },
    { value: "Khu C", label: "Khu C" },
  ];

  const typeOptions = [
    { value: "Heo thịt", label: "Heo thịt" },
    { value: "Heo nái", label: "Heo nái" },
    { value: "Cách ly", label: "Cách ly" },
  ];

  const statusOptions = [
    { value: "active", label: "Đang hoạt động" },
    { value: "full", label: "Đã đầy" },
    { value: "maintenance", label: "Đang bảo trì" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  const occupancyOptions = [
    { value: "empty", label: "Trống" },
    { value: "low", label: "Dưới 50%" },
    { value: "high", label: "Trên 50%" },
    { value: "full", label: "Đã đầy" },
  ];

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
      title: "Tên chuồng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <HomeOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      render: (text) => (
        <Tag icon={<EnvironmentOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "Loại chuồng",
      dataIndex: "type",
      key: "type",
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: "Sức chứa",
      key: "occupancy",
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Text>
            {record.currentOccupancy}/{record.capacity}
          </Text>
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
      title: "Môi trường",
      key: "environment",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>Nhiệt độ: {record.temperature}°C</Text>
          <Text>Độ ẩm: {record.humidity}%</Text>
        </Space>
      ),
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
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa chuồng",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận xóa",
                content: "Bạn có chắc chắn muốn xóa chuồng này?",
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

  // Filter panel component
  const FilterPanel = () => (
    <Card
      bodyStyle={{ padding: "16px" }}
      style={{ marginBottom: "16px", borderRadius: "8px" }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6} lg={5}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Khu vực"
            allowClear
            options={areaOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, area: value }))
            }
            maxTagCount="responsive"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Loại chuồng"
            allowClear
            options={typeOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
            maxTagCount="responsive"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Trạng thái"
            allowClear
            options={statusOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            maxTagCount="responsive"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Select
            style={{ width: "100%" }}
            placeholder="Mức độ sử dụng"
            allowClear
            options={occupancyOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, occupancy: value }))
            }
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={4} style={{ textAlign: "right" }}>
          <Space>
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                setFilters({
                  area: [],
                  status: [],
                  type: [],
                  occupancy: null,
                });
              }}
            >
              Xóa lọc
            </Button>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => {
                // Xử lý lọc dữ liệu
                console.log("Filters:", filters);
              }}
            >
              Áp dụng
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // Statistics cards
  const StatisticCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tổng số chuồng"
            value={houses.length}
            prefix={<HomeOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Đang hoạt động"
            value={houses.filter((h) => h.status === "active").length}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Đang bảo trì"
            value={houses.filter((h) => h.status === "maintenance").length}
            prefix={<WarningOutlined />}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tỷ lệ s dụng"
            value={Math.round(
              (houses.reduce((acc, curr) => acc + curr.currentOccupancy, 0) /
                houses.reduce((acc, curr) => acc + curr.capacity, 0)) *
                100
            )}
            suffix="%"
            prefix={<EnvironmentOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
    </Row>
  );

  const handleSubmit = (values) => {
    setLoading(true);
    try {
      if (editingHouse) {
        // Handle edit
        message.success("Cập nhật chuồng thành công");
      } else {
        // Handle create
        message.success("Thêm chuồng mới thành công");
      }
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      setEditingHouse(null);
    }
  };

  return (
    <Layout
      style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <span
              style={{ fontSize: "24px", fontWeight: 600, color: "#262626" }}
            >
              Quản lý chuồng trại
            </span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingHouse(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm chuồng mới
            </Button>
          </Col>
        </Row>
      </div>

      <StatisticCards />
      <FilterPanel />

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={houses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} chuồng`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#262626" }}>
            {editingHouse ? "Cập nhật thông tin chuồng" : "Thêm chuồng mới"}
          </span>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingHouse(null);
        }}
        footer={null}
        width={700}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "active" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên chuồng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chuồng" },
                ]}
              >
                <Input prefix={<HomeOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="area"
                label="Khu vực"
                rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
              >
                <Select options={areaOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại chuồng"
                rules={[
                  { required: true, message: "Vui lòng chọn loại chuồng" },
                ]}
              >
                <Select options={typeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức chứa"
                rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="temperature"
                label="Nhiệt độ (°C)"
                rules={[{ required: true, message: "Vui lòng nhập nhiệt độ" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="humidity"
                label="Độ ẩm (%)"
                rules={[{ required: true, message: "Vui lòng nhập độ ẩm" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select options={statusOptions} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingHouse(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingHouse ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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

        .ant-card {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-statistic-title {
          color: #8c8c8c;
        }

        .ant-statistic-content {
          color: #262626;
        }
      `}</style>
    </Layout>
  );
};

export default HousesPage;
