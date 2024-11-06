import { useState, useEffect } from "react";
import axios from "axios";
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [form] = Form.useForm();
  const [houses, setHouses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filters, setFilters] = useState({
    area: [],
    status: [],
    type: [],
    occupancy: null,
  });

  // Define options for selects
  const statusOptions = [
    { value: 1, label: "Đang hoạt động" },
    { value: 2, label: "Đang bảo trì" },
    { value: 3, label: "Ngưng hoạt động" },
  ];

  const occupancyOptions = [
    { value: "empty", label: "Trống" },
    { value: "low", label: "Dưới 50%" },
    { value: "high", label: "Trên 50%" },
    { value: "full", label: "Đã đầy" },
  ];

  // Fetch houses data
  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      const formattedHouses = response.data.data.items.map((house) => ({
        id: house.id,
        name: house.name,
        area: house.areaName,
        capacity: house.capacity,
        currentOccupancy: house.currentOccupancy,
        status: house.status,
        temperature: house.temperature,
        humidity: house.humidity,
      }));

      setHouses(formattedHouses);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải dữ liệu chuồng"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch areas data
  const fetchAreas = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/areas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const formattedAreas = response.data.data.items.map((area) => ({
        value: area.id,
        label: area.name,
      }));

      setAreas(formattedAreas);
    } catch (error) {
      message.error("Không thể tải dữ liệu khu vực");
    }
  };

  useEffect(() => {
    fetchHouses();
    fetchAreas();
  }, []);

  // Handle submit form
  const handleSubmit = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      const formData = {
        name: values.name,
        areasId: values.area,
        capacity: values.capacity,
        currentOccupancy: values.currentOccupancy || 0,
        temperature: values.temperature,
        humidity: values.humidity,
        status:
          values.status == 1
            ? "Available"
            : values.status == 2
            ? "UnderMaintenance"
            : "StopWorking",
      };

      if (editingHouse) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/v1/stables/${editingHouse.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Cập nhật chuồng thành công");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/stables`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Thêm chuồng mới thành công");
      }

      fetchHouses();
      setIsModalVisible(false);
      form.resetFields();
      setEditingHouse(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete house
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/stables/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Xóa chuồng thành công");
      fetchHouses();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa chuồng"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: "#52c41a",
      Full: "#f5222d", // màu đỏ
      UnderMaintenance: "#faad14", // màu vàng
      StopWorking: "#f5222d",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      Available: "Còn trống",
      StopWorking: "Ngừng hoạt động",
      UnderMaintenance: "Đang bảo trì",
      Full: "Đã đầy",
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

  // Thêm hàm handleApplyFilter
  const handleApplyFilter = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL}/api/v1/Stables`;

      // Tạo object params
      const params = new URLSearchParams();

      // Thêm filter area
      if (filters.area?.length > 0) {
        params.append("areaId", filters.area[0]);
      }

      // Thêm filter status
      if (filters.status?.length > 0) {
        params.append("status", filters.status[0]);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: params,
      });

      let filteredHouses = response.data.data.items.map((house) => ({
        id: house.id,
        name: house.name,
        area: house.areaName,
        capacity: house.capacity,
        currentOccupancy: house.currentOccupancy,
        status: house.status,
        temperature: house.temperature,
        humidity: house.humidity,
      }));

      // Lọc theo occupancy ở client side
      if (filters.occupancy) {
        filteredHouses = filteredHouses.filter((house) => {
          const occupancyRate = house.currentOccupancy / house.capacity;
          switch (filters.occupancy) {
            case "empty":
              return house.currentOccupancy === 0;
            case "low":
              return occupancyRate < 0.5;
            case "high":
              return (
                occupancyRate >= 0.5 && house.currentOccupancy < house.capacity
              );
            case "full":
              return house.currentOccupancy === house.capacity;
            default:
              return true;
          }
        });
      }

      setHouses(filteredHouses);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lọc dữ liệu");
    } finally {
      setLoading(false);
    }
  };

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
            options={areas}
            value={filters.area}
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
            placeholder="Trạng thái"
            allowClear
            options={statusOptions}
            value={filters.status}
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
            value={filters.occupancy}
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
                  occupancy: null,
                });
                fetchHouses(); // Reset về dữ liệu ban đầu
              }}
            >
              Xóa lọc
            </Button>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApplyFilter}
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
            value={
              houses.filter(
                (h) =>
                  h.status !== "UnderMaintenance" && h.status !== "StopWorking"
              ).length
            }
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Đang bảo trì"
            value={houses.filter((h) => h.status === "UnderMaintenance").length}
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

  // Thêm hàm handleEdit
  const handleEdit = (record) => {
    setEditingHouse(record);
    let statusNumber;
    switch (record.status) {
      case "Available":
        statusNumber = 1;
        break;
      case "UnderMaintenance":
        statusNumber = 2;
        break;
      case "StopWorking":
        statusNumber = 3;
        break;
      default:
        statusNumber = 1;
    }

    form.setFieldsValue({
      name: record.name,
      area: record.areasId,
      capacity: record.capacity,
      currentOccupancy: record.currentOccupancy,
      temperature: record.temperature,
      humidity: record.humidity,
      status: statusNumber,
    });
    setIsModalVisible(true);
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
          initialValues={{ status: 1 }}
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
                <Select options={areas} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức chứa"
                rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currentOccupancy"
                label="Số lượng hiện tại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng hiện tại",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const capacity = getFieldValue("capacity");
                      if (!value || value <= capacity) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Số lượng không thể vượt quá sức chứa")
                      );
                    },
                  }),
                ]}
              >
                <Input type="number" min={0} />
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
            <Select
              options={statusOptions}
              onChange={(value) => {
                // Nếu chuyển sang ngưng hoạt động, reset currentOccupancy về 0
                if (value === 3) {
                  form.setFieldValue("currentOccupancy", 0);
                }
              }}
            />
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
