import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Layout,
  Select,
  Row,
  Col,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  EyeOutlined,
  StopOutlined,
  CheckOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import axios from "axios";

// Định nghĩa constants cho supplier types

const SUPPLIER_TYPE_LABELS = {
  feed: "Thức ăn",
  medicine: "Thuốc",
  pig: "Heo",
};

const SUPPLIER_TYPE_COLORS = {
  feed: "#f50", // màu cam đậm
  medicine: "#108ee9", // màu xanh dương
  pig: "#87d068", // màu xanh lá
};

const SuppliersPage = () => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    type: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tempFilters, setTempFilters] = useState({
    type: [],
    status: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // Fetch suppliers data
  const fetchSuppliers = async (params = {}) => {
    try {
      setLoading(true);
      console.log("Current searchTerm:", searchTerm); // Debug log

      const queryParams = new URLSearchParams();

      // Thêm các params cơ bản
      queryParams.append("pageIndex", params.current || pagination.current);
      queryParams.append("pageSize", params.pageSize || pagination.pageSize);

      // Thêm searchTerm nếu có giá trị
      if (searchTerm && searchTerm.trim() !== "") {
        queryParams.append("searchTerm", searchTerm.trim());
      }

      // Thêm từng typeSupplier vào query params
      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((type) => {
          queryParams.append("typeSuppliers", type);
        });
      }

      // Thêm status nếu có
      if (filters.status && filters.status.length > 0) {
        queryParams.append("status", filters.status[0]);
      }

      const finalUrl = `${
        import.meta.env.VITE_API_URL
      }/api/v1/suppliers?${queryParams.toString()}`;
      console.log("Calling API:", finalUrl); // Debug log

      const response = await axios({
        url: finalUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("API Response:", response.data);

      const { items, totalCount, currentPage, pageSize } = response.data.data;
      setSuppliers(items);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
      });
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      message.error("Không thể tải dữ liệu nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchSuppliers({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, [
    searchTerm,
    JSON.stringify(filters),
    pagination.current,
    pagination.pageSize,
  ]);

  const columns = [
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.phone).toLowerCase().includes(value.toLowerCase()) ||
          String(record.email).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <PhoneOutlined /> {record.phone}
          </Space>
          <Space>
            <MailOutlined /> {record.email}
          </Space>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <Tooltip title={address}>
          <Space>
            <EnvironmentOutlined />
            {address.length > 30 ? `${address.substring(0, 30)}...` : address}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Loại",
      dataIndex: "typeSuppier",
      key: "typeSuppier",
      render: (typeSuppier) => {
        let types = Array.isArray(typeSuppier) ? typeSuppier : [typeSuppier];

        return types.map((type, index) => {
          let color;
          switch (type) {
            case "feed":
              color = SUPPLIER_TYPE_COLORS.feed;
              break;
            case "medicine":
              color = SUPPLIER_TYPE_COLORS.medicine;
              break;
            case "pig":
              color = SUPPLIER_TYPE_COLORS.pig;
              break;
            default:
              color = "#d9d9d9";
          }

          return (
            <Tag color={color} key={index}>
              {SUPPLIER_TYPE_LABELS[type]}
            </Tag>
          );
        });
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Đang hợp tác" : "Ngừng hợp tác"}
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
            onClick: () => handleEditClick(record),
          },
          {
            type: "divider",
          },
          record.status === "active"
            ? {
                key: "deactivate",
                label: "Ngừng hợp tác",
                icon: <StopOutlined />,
                danger: true,
                onClick: () => handleStatusChange(record, "inactive"),
              }
            : {
                key: "activate",
                label: "Kích hoạt lại",
                icon: <CheckOutlined />,
                onClick: () => handleStatusChange(record, "active"),
              },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa nhà cung cấp",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => confirmDelete(record),
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

  const handleDelete = async (supplierId) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers/`,
        method: "DELETE",
        params: { id: supplierId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        // Cập nhật state bằng cách lọc bỏ supplier đã xóa
        setSuppliers((prevSuppliers) =>
          prevSuppliers.filter((supplier) => supplier.id !== supplierId)
        );

        // Cập nhật total trong pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        message.success("Xóa nhà cung cấp thành công");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa nhà cung cấp"
      );
    }
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa nhà cung cấp",
      content: `Bạn có chắc chắn muốn xóa nhà cung cấp "${record.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDelete(record.id),
    });
  };

  const handleView = (record) => {
    // Xử lý xem chi tiết
    console.log("View:", record);
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        method: "PATCH",
        params: { id: record.id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: {
          name: record.name,
          email: record.email,
          phone: record.phone,
          address: record.address,
          typeSuppier: record.typeSuppier,
          status: newStatus,
        },
      });

      if (response.status === 200) {
        const updatedSupplier = response.data.data;

        // Cập nhật state
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.id === record.id ? updatedSupplier : supplier
          )
        );

        message.success(
          newStatus === "active" ? "Đã kích hoạt hợp tác" : "Đã ngưng hợp tác"
        );
      }
    } catch (error) {
      console.error("Error updating supplier status:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    }
  };

  const confirmStatusChange = (record, newStatus) => {
    const isDeactivating = newStatus === "inactive";
    Modal.confirm({
      title: isDeactivating
        ? "Xác nhận ngưng hợp tác"
        : "Xác nhận kích hoạt hợp tác",
      content: `Bạn có chắc chắn muốn ${
        isDeactivating ? "ngưng" : "kích hoạt"
      } hợp tác với "${record.name}" không?`,
      okText: "Xác nhận",
      okType: isDeactivating ? "danger" : "primary",
      cancelText: "Hủy",
      onOk: () => handleStatusChange(record, newStatus),
    });
  };

  const handleAddSupplier = async (values) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: values,
      });

      // Kiểm tra status code 201 (Created)
      if (response.status === 201) {
        console.log(response.data.data);
        const newSupplier = response.data.data;

        message.success("Thêm nhà cung cấp thành công");
        setIsModalVisible(false);
        form.resetFields();

        // Cập nhật state trực tiếp
        setSuppliers((prev) => [newSupplier, ...prev]);

        // Cập nhật tổng số lượng trong pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
      }
    } catch (error) {
      console.error("Error adding supplier:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm nhà cung cấp"
      );
    }
  };

  const handleEditClick = (record) => {
    setEditingSupplier(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleUpdateSupplier = async (values) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        method: "PATCH",
        params: { id: editingSupplier.id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: values,
      });

      if (response.status === 200) {
        const updatedSupplier = response.data.data;

        // Cập nhật state suppliers
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.id === editingSupplier.id ? updatedSupplier : supplier
          )
        );

        message.success("Cập nhật thông tin thành công");
        setIsEditModalVisible(false);
        setEditingSupplier(null);
        editForm.resetFields();
      }
    } catch (error) {
      console.error("Error updating supplier:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin"
      );
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
              Quản lý nhà cung cấp
            </span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Thêm nhà cung cấp
            </Button>
          </Col>
        </Row>
      </div>

      {/* Search and Filter Section */}
      <Card
        bodyStyle={{ padding: "16px" }}
        style={{ marginBottom: "16px", borderRadius: "8px" }}
      >
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => {
                console.log("Searching for:", value);
                setSearchTerm(value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{ width: "100%" }}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={14} lg={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col>
                <Select
                  style={{ width: 180 }}
                  placeholder="Loại nhà cung cấp"
                  mode="multiple"
                  maxTagCount="responsive"
                  allowClear
                  value={tempFilters.type}
                  onChange={(value) => {
                    setTempFilters((prev) => ({ ...prev, type: value }));
                  }}
                  options={[
                    { label: "Thức ăn", value: "feed" },
                    { label: "Thuốc", value: "medicine" },
                    { label: "Heo", value: "pig" },
                  ]}
                />
              </Col>
              <Col>
                <Select
                  style={{ width: 180 }}
                  placeholder="Trạng thái"
                  allowClear
                  value={tempFilters.status[0]}
                  onChange={(value) => {
                    setTempFilters((prev) => ({
                      ...prev,
                      status: value ? [value] : [],
                    }));
                  }}
                  options={[
                    { label: "Đang hợp tác", value: "active" },
                    { label: "Ngừng hợp tác", value: "inactive" },
                  ]}
                />
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={() => {
                      setTempFilters({
                        type: [],
                        status: [],
                      });
                      setFilters({
                        type: [],
                        status: [],
                      });
                      setPagination((prev) => ({ ...prev, current: 1 }));
                    }}
                  >
                    Xóa lọc
                  </Button>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => {
                      // Áp dụng bộ lọc
                      setFilters({ ...tempFilters }); // Tạo object mới để đảm bảo reference thay đổi
                      setPagination((prev) => ({ ...prev, current: 1 }));
                    }}
                  >
                    Áp dụng
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={suppliers || []}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhà cung cấp`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize,
              }));
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal giữ nguyên */}

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .ant-input-search .ant-input-prefix {
          margin-right: 8px;
        }

        .ant-input-search .ant-input-group-addon {
          display: none;
        }

        .ant-input-search .ant-input {
          padding-right: 40px;
        }

        .ant-input-search .ant-input-suffix {
          right: 12px;
        }

        .ant-select-multiple .ant-select-selection-placeholder {
          padding: 0 8px;
        }

        .ant-picker {
          border-radius: 6px;
        }

        .ant-select-selector {
          border-radius: 6px !important;
        }

        .ant-btn {
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          height: 32px;
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

        .ant-badge-count {
          box-shadow: none;
          font-weight: 600;
        }

        .ant-space {
          gap: 8px !important;
        }
      `}</style>

      <Modal
        title="Thêm nhà cung cấp mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSupplier}>
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="typeSuppier"
            label="Loại nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng chọn loại nhà cung cấp" },
            ]}
          >
            <Select placeholder="Chọn loại nhà cung cấp">
              <Select.Option value="feed">Thức ăn</Select.Option>
              <Select.Option value="medicine">Thuốc</Select.Option>
              <Select.Option value="pig">Heo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">Đang hợp tác</Select.Option>
              <Select.Option value="inactive">Ngừng hợp tác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật thông tin nhà cung cấp"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingSupplier(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateSupplier}
          initialValues={editingSupplier}
        >
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="typeSuppier"
            label="Loại nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng chọn loại nhà cung cấp" },
            ]}
          >
            <Select placeholder="Chọn loại nhà cung cấp">
              <Select.Option value="feed">Thức ăn</Select.Option>
              <Select.Option value="medicine">Thuốc</Select.Option>
              <Select.Option value="pig">Heo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">Đang hợp tác</Select.Option>
              <Select.Option value="inactive">Ngừng hợp tác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setIsEditModalVisible(false);
                  setEditingSupplier(null);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SuppliersPage;
