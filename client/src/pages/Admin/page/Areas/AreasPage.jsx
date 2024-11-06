import { useState, useEffect, useMemo } from "react";
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
  Descriptions,
  Statistic,
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
import axios from "axios";

const { Text } = Typography;

const AreasPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [form] = Form.useForm();
  const [areas, setAreas] = useState([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingArea, setViewingArea] = useState(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/areas`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data.data.items);
      setAreas(response.data.data.items);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      message.error("Không thể tải dữ liệu khu vực");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesSearch =
        area.name.toLowerCase().includes(searchText.toLowerCase()) ||
        area.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || area.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [areas, searchText, statusFilter]);

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
              (record.occupiedHouses / record.totalHouses) * 100
            )}
            size="small"
            status={
              record.occupiedHouses === record.totalHouses
                ? "exception"
                : "active"
            }
          />
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
    setViewingArea(record);
    setIsViewModalVisible(true);
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
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/areas/${id}`);
      message.success("Xóa khu vực thành công");
      fetchAreas();
    } catch (error) {
      console.error("Failed to delete area:", error);
      message.error("Có lỗi xảy ra khi xóa khu vực");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        occupiedHouses: 0,
      };

      if (editingArea) {
        const response = await axios({
          url: `${import.meta.env.VITE_API_URL}/api/v1/areas/`,
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          params: {
            id: editingArea.id,
          },
          data: formData,
        });

        // Cập nhật area trong state
        setAreas((prev) =>
          prev.map((area) =>
            area.id === editingArea.id ? response.data.data : area
          )
        );
      } else {
        const response = await axios({
          url: `${import.meta.env.VITE_API_URL}/api/v1/areas`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          data: formData,
        });

        // Thêm area mới vào state
        setAreas((prev) => [...prev, response.data.data]);
      }

      message.success(
        `${editingArea ? "Cập nhật" : "Thêm"} khu vực thành công`
      );
      setIsModalVisible(false);
      form.resetFields();
      setEditingArea(null);
    } catch (error) {
      console.error("Failed to submit area:", error);
      message.error(
        error.response?.data?.message ||
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
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm theo tên khu vực..."
              allowClear
              value={searchText}
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
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "active", label: "Đang hoạt động" },
                { value: "maintenance", label: "Đang bảo trì" },
                { value: "inactive", label: "Ngừng hoạt động" },
                { value: "ready", label: "Sẵn sàng" },
              ]}
            />
          </Col>
          {(searchText || statusFilter) && (
            <Col>
              <Button
                type="link"
                onClick={() => {
                  setSearchText("");
                  setStatusFilter(null);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Table Section */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={filteredAreas}
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
          initialValues={{
            status: "active",
            occupiedHouses: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Tên khu vực"
            rules={[{ required: true, message: "Vui lòng nhập tên khu vực" }]}
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Ví dụ: Khu A - Heo nái"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Khu vực dành cho heo nái mang thai và nuôi con"
            />
          </Form.Item>

          <Form.Item
            name="totalHouses"
            label="Số lượng chuồng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng chuồng" },
            ]}
          >
            <Input type="number" min={1} placeholder="Ví dụ: 30" />
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
              <Select.Option value="ready">Sẵn sàng</Select.Option>
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

      {/* Modal chi tiết */}
      <Modal
        title={
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <span
              style={{ fontSize: "18px", fontWeight: 600, color: "#262626" }}
            >
              Chi tiết khu vực
            </span>
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setViewingArea(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewModalVisible(false);
              setViewingArea(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={600}
        centered
      >
        {viewingArea && (
          <div className="area-details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên khu vực">
                <Text strong>{viewingArea.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả">
                {viewingArea.description}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(viewingArea.status)}>
                  {getStatusText(viewingArea.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Thông tin chuồng trại">
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Row justify="space-between">
                    <Col>Tổng số chuồng:</Col>
                    <Col>
                      <Text strong>{viewingArea.totalHouses}</Text>
                    </Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>Số chuồng đang sử dụng:</Col>
                    <Col>
                      <Text strong>{viewingArea.occupiedHouses}</Text>
                    </Col>
                  </Row>
                  <Progress
                    percent={Math.round(
                      (viewingArea.occupiedHouses / viewingArea.totalHouses) *
                        100
                    )}
                    size="small"
                    status={
                      viewingArea.occupiedHouses === viewingArea.totalHouses
                        ? "exception"
                        : "active"
                    }
                  />
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: "24px" }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="Tỷ lệ sử dụng"
                      value={Math.round(
                        (viewingArea.occupiedHouses / viewingArea.totalHouses) *
                          100
                      )}
                      suffix="%"
                      valueStyle={{ color: "#1890ff" }}
                      prefix={<HomeOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="Chuồng trống"
                      value={
                        viewingArea.totalHouses - viewingArea.occupiedHouses
                      }
                      valueStyle={{ color: "#52c41a" }}
                      prefix={<HomeOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        )}
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

        .area-details .ant-descriptions-item-label {
          width: 180px;
          background-color: #fafafa;
        }

        .area-details .ant-card {
          border-radius: 6px;
        }

        .area-details .ant-statistic {
          text-align: center;
        }

        .area-details .ant-descriptions {
          background: white;
        }

        .area-details .ant-descriptions-item-content {
          padding: 12px 16px;
        }
      `}</style>
    </Layout>
  );
};

export default AreasPage;
