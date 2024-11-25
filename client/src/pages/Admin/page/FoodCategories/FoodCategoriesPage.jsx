import { useState, useEffect } from "react";
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
  Popover,
  Divider,
  Badge,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  FilterOutlined,
  CopyOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import axios from "axios";

const FoodCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");

  // Thêm state để kiểm tra filter đang được áp dụng
  const isFiltering = statusFilter !== "all";

  // Thêm state cho modal chi tiết
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Thêm state cho loading chi tiết
  const [detailLoading, setDetailLoading] = useState(false);

  // Content của Popover filter
  const filterContent = (
    <div style={{ width: 250 }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: "#262626" }}>
          Trạng thái
        </span>
        <Select
          style={{
            width: "100%",
            marginTop: 8,
          }}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        >
          <Select.Option value="all">Tất cả trạng thái</Select.Option>
          <Select.Option value="active">Đang sử dụng</Select.Option>
          <Select.Option value="inactive">Ngừng sử dụng</Select.Option>
        </Select>
      </div>
      <Divider style={{ margin: "12px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          size="small"
          onClick={() => {
            setStatusFilter("all");
          }}
        >
          Đặt lại
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // Xử lý áp dụng filter
          }}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );

  // Fetch categories
  const fetchCategories = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/FoodType`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data);

      setCategories(response.data.data);
      setPagination({
        current: 1,
        pageSize: 10,
        total: response.data.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("Không thể tải danh sách loại thức ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, statusFilter]);

  // Add new category
  const handleAdd = async (values) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/FoodType`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: values,
      });

      if (response.status === 201) {
        const newCategory = response.data.data;
        setCategories((prev) => [newCategory, ...prev]);
        message.success("Thêm loại thức ăn thành công");
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error adding category:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm loại thức ăn"
      );
    }
  };

  // Update category
  const handleUpdate = async (values) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/FoodType`,
        method: "PATCH",
        params: { id: editingCategory.id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: values,
      });

      if (response.status === 200) {
        const updatedCategory = response.data.data;
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? updatedCategory : cat
          )
        );
        message.success("Cập nhật loại thức ăn thành công");
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error updating category:", error.response?.data);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật loại thức ăn"
      );
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      await axios({
        url: `${import.meta.env.VITE_API_URL}/api/FoodType`,
        method: "DELETE",
        params: { id: id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      message.success("Xóa loại thức ăn thành công");
    } catch (error) {
      console.error("Error deleting category:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa loại thức ăn"
      );
    }
  };

  // Table columns
  const columns = [
    {
      title: "Tên loại",
      dataIndex: "foodTypeName",
      key: "foodTypeName",
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
            onClick: () => handleViewDetails(record),
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
  const fetchCategoryDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/feedtypes/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data);
      if (response.status === 200) {
        setSelectedCategory(response.data.data);
        setIsViewModalVisible(true);
      } else {
        message.error("Không thể tải thông tin chi tiết");
      }
    } catch (error) {
      console.error("Error fetching category detail:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải thông tin chi tiết"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Cập nhật hàm handleViewDetails
  const handleViewDetails = (record) => {
    fetchCategoryDetail(record.id);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Thêm hàm format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    // Format ngày
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Format giờ
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Tạo chuỗi thời gian đẹp
    return (
      <div className="datetime-display">
        <div className="date-part">
          <CalendarOutlined style={{ marginRight: 8 }} />
          {`${day}/${month}/${year}`}
        </div>
        <div className="time-part">
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {`${hours}:${minutes}`}
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ padding: "24px", background: "#f5f7fa" }}>
      {/* Header Card */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
        }}
      >
        <Row gutter={[24, 16]} align="middle" justify="space-between">
          <Col flex="auto">
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              Quản lý loại thức ăn
            </span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              onClick={() => {
                setIsModalVisible(true);
                setEditingCategory(null);
                form.resetFields();
              }}
              style={{
                background: "#1890ff",
                borderRadius: 6,
                height: 40,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Thêm loại thức ăn
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo tên..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: 6,
                height: 40,
              }}
            />
          </Col>
          <Col>
            <Popover
              content={filterContent}
              title={
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#262626",
                    padding: "4px 0",
                  }}
                >
                  Bộ lọc
                </div>
              }
              trigger="click"
              placement="bottomLeft"
              overlayStyle={{
                width: 300,
                padding: "12px 0",
              }}
            >
              <Badge dot={isFiltering}>
                <Button
                  icon={<FilterOutlined />}
                  style={{
                    height: 40,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Bộ lọc
                </Button>
              </Badge>
            </Popover>
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} loại thức ăn`,
            style: { padding: "16px 24px" },
          }}
        />
      </Card>

      {/* Update styles */}
      {/* eslint-disable */}
      <style jsx global>{`
        .ant-card {
          background: white;
        }

        .ant-table {
          background: white;
        }

        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          color: #262626;
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
        }

        .ant-table-tbody > tr > td {
          padding: 16px 24px;
          color: #595959;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fafafa;
        }

        .ant-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          gap: 8px;
        }

        .ant-input {
          border-radius: 6px;
        }

        .ant-input:hover {
          border-color: #40a9ff;
        }

        .ant-input:focus {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #40a9ff;
        }

        .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        }

        .ant-modal-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .ant-modal-body {
          padding: 24px;
        }

        .ant-form-item-label > label {
          font-weight: 500;
          color: #262626;
        }

        .ant-tag {
          border-radius: 4px;
          padding: 4px 8px;
          font-weight: 500;
        }

        .ant-dropdown-menu {
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        }

        .ant-dropdown-menu-item {
          padding: 8px 12px;
          border-radius: 4px;
        }

        .ant-popover-inner {
          border-radius: 8px;
          box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        }

        .ant-popover-title {
          border-bottom: 1px solid #f0f0f0;
          padding: 12px 16px;
        }

        .ant-popover-inner-content {
          padding: 12px 16px;
        }

        .ant-badge-dot {
          background: #1890ff;
          box-shadow: 0 0 0 1px #fff;
        }

        .ant-form-item-label > label {
          font-weight: 500;
          color: #262626;
        }

        .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .ant-modal-title {
          font-weight: 600;
          font-size: 16px;
          color: #262626;
        }

        .ant-modal-body {
          padding: 24px;
        }

        .ant-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
        }

        .ant-input {
          border-radius: 6px;
        }

        .ant-input:hover {
          border-color: #40a9ff;
        }

        .ant-input:focus {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .ant-select-selector {
          border-radius: 6px !important;
        }

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #40a9ff;
        }
      `}</style>

      {/* Thêm Modal Form */}
      <Modal
        title={
          editingCategory ? "Chỉnh sửa loại thức ăn" : "Thêm loại thức ăn mới"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCategory ? handleUpdate : handleAdd}
          initialValues={
            editingCategory || {
              status: "active",
            }
          }
        >
          <Form.Item
            name="feedTypeName"
            label="Tên loại thức ăn"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên loại thức ăn",
              },
              {
                max: 100,
                message: "Tên không được vượt quá 100 ký tự",
              },
            ]}
          >
            <Input placeholder="Nhập tên loại thức ăn" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả",
              },
              {
                max: 500,
                message: "Mô tả không được vượt quá 500 ký tự",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả cho loại thức ăn"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái",
              },
            ]}
          >
            <Select>
              <Select.Option value="active">Đang sử dụng</Select.Option>
              <Select.Option value="inactive">Ngừng sử dụng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
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

      {/* Thêm Modal chi tiết */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết loại thức ăn</span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedCategory(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewModalVisible(false);
              setSelectedCategory(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Spin size="large" />
          </div>
        ) : selectedCategory ? (
          <div className="detail-container">
            <div className="detail-header">
              <h2>{selectedCategory.feedTypeName}</h2>
              <Tag
                color={
                  selectedCategory.status === "active" ? "success" : "error"
                }
              >
                {selectedCategory.status === "active"
                  ? "Đang sử dụng"
                  : "Ngừng sử dụng"}
              </Tag>
            </div>

            <Divider />

            <div className="detail-content">
              <div className="detail-item">
                <div className="label">ID</div>
                <div className="value id-value">
                  <span>{selectedCategory.id}</span>
                  <Tooltip title="Sao chép">
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCategory.id);
                        message.success("Đã sao chép ID");
                      }}
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="detail-item">
                <div className="label">Tên loại thức ăn</div>
                <div className="value">{selectedCategory.feedTypeName}</div>
              </div>

              <div className="detail-item">
                <div className="label">Mô tả</div>
                <div className="value description">
                  {selectedCategory.description}
                </div>
              </div>

              <div className="detail-item">
                <div className="label">Số lượng sản phẩm</div>
                <div className="value">
                  <Tag color="blue">{selectedCategory.totalProducts}</Tag>
                </div>
              </div>

              <div className="detail-item">
                <div className="label">
                  <div className="label-icon">
                    <FieldTimeOutlined />
                  </div>
                  <span>Thông tin thời gian</span>
                </div>
                <div className="time-info">
                  <div className="time-item">
                    <div className="time-label">
                      <div className="dot create-dot" />
                      Được tạo
                    </div>
                    <div className="time-value">
                      {formatDateTime(selectedCategory.createdTime)}
                    </div>
                  </div>

                  {selectedCategory.updatedTime && (
                    <div className="time-item">
                      <div className="time-label">
                        <div className="dot update-dot" />
                        Cập nhật lần cuối
                      </div>
                      <div className="time-value">
                        {formatDateTime(selectedCategory.updatedTime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <style jsx>{`
          .detail-container {
            padding: 0 16px;
          }

          .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .detail-header h2 {
            margin: 0;
            color: #262626;
            font-size: 20px;
            font-weight: 600;
          }

          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .label {
            font-size: 14px;
            color: #8c8c8c;
            font-weight: 500;
          }

          .value {
            font-size: 15px;
            color: #262626;
            line-height: 1.5;
          }

          .description {
            background: #fafafa;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #f0f0f0;
          }
        `}</style>
      </Modal>

      {/* Thêm styles cho Modal */}
      <style jsx global>{`
        .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
        }

        .ant-modal-title {
          font-weight: 600;
          font-size: 16px;
          color: #262626;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ant-modal-body {
          padding: 24px 0;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
        }

        .ant-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          margin-top: 0;
        }

        .ant-divider {
          margin: 16px 0;
        }

        .ant-tag {
          font-weight: 500;
          text-transform: uppercase;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
        }
      `}</style>

      {/* Thêm styles */}
      <style jsx>{`
        .datetime-display {
          display: flex;
          gap: 16px;
          align-items: center;
          font-size: 14px;
          color: #262626;
        }

        .date-part,
        .time-part {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          padding: 4px 12px;
          border-radius: 4px;
          font-family: "SF Mono", "Courier New", Courier, monospace;
        }

        .label-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #e6f4ff;
          border-radius: 6px;
          margin-right: 8px;
          color: #1890ff;
        }

        .time-info {
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 8px;
        }

        .time-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 0;
        }

        .time-item:not(:last-child) {
          border-bottom: 1px dashed #f0f0f0;
        }

        .time-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8c8c8c;
          font-size: 13px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .create-dot {
          background: #52c41a;
        }

        .update-dot {
          background: #1890ff;
        }

        .time-value {
          margin-left: 16px;
        }
      `}</style>

      {/* Cập nhật global styles */}
      <style jsx global>{`
        .ant-modal-body {
          padding: 24px;
        }

        .detail-item {
          margin-bottom: 24px;
        }

        .detail-item .label {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 500;
          color: #262626;
        }

        .anticon {
          font-size: 14px;
        }
      `}</style>
    </Layout>
  );
};

export default FoodCategoriesPage;
