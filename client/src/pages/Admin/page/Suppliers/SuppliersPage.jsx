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
  Typography,
  Descriptions,
  Divider,
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

const SUPPLIER_TYPE_COLORS = {
  food: "#f50", // màu cam đậm
  medicine: "#108ee9", // màu xanh dương
  pig: "#87d068", // màu xanh lá
};

const SuppliersPage = () => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [searchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    type: [],
    status: [],
  });
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
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Fetch suppliers data
  const fetchSuppliers = async (params = {}) => {
    try {
      setLoading(true);
      console.log("Current searchTerm:", searchTerm); // Debug log

      const queryParams = new URLSearchParams();

      queryParams.append("pageIndex", params.current || pagination.current);
      queryParams.append("pageSize", params.pageSize || pagination.pageSize);

      if (searchTerm && searchTerm.trim() !== "") {
        queryParams.append("searchTerm", searchTerm.trim());
      }

      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((type) => {
          queryParams.append("typeSuppliers", type);
        });
      }

      if (filters.status && filters.status.length > 0) {
        queryParams.append("status", filters.status[0]);
      }

      const finalUrl = `${
        import.meta.env.VITE_API_URL
      }/api/v1/suppliers?${queryParams.toString()}`;
      console.log("Calling API:", finalUrl);

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
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space>
            <PhoneOutlined />
            <span style={{ fontWeight: 500 }}>{record.phone}</span>
          </Space>
          <Space>
            <MailOutlined />
            <Typography.Text
              ellipsis={{
                tooltip: record.email,
              }}
              style={{ maxWidth: 160 }}
            >
              {record.email}
            </Typography.Text>
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
      width: 150,
      render: (typeSuppier) => {
        let types = Array.isArray(typeSuppier) ? typeSuppier : [typeSuppier];

        return (
          <Space size={[0, 4]} wrap style={{ gap: "4px !important" }}>
            {types.map((type, index) => {
              let color;
              let label;
              switch (type) {
                case "food":
                  color = SUPPLIER_TYPE_COLORS.food;
                  label = "Thức ăn";
                  break;
                case "medicine":
                  color = SUPPLIER_TYPE_COLORS.medicine;
                  label = "Thuốc";
                  break;
                case "pig":
                  color = SUPPLIER_TYPE_COLORS.pig;
                  label = "Heo";
                  break;
                default:
                  color = "#d9d9d9";
                  label = type;
              }

              return (
                <Tag
                  color={color}
                  key={index}
                  style={{
                    minWidth: "80px",
                    textAlign: "center",
                    margin: "2px",
                    padding: "0 10px",
                    fontSize: "13px",
                    lineHeight: "22px",
                    borderRadius: "4px",
                  }}
                >
                  {label}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag
          color={status === "active" ? "success" : "error"}
          style={{
            minWidth: "90px",
            textAlign: "center",
            padding: "0 8px",
            margin: "0",
            fontSize: "12px",
            lineHeight: "20px",
            borderRadius: "4px",
          }}
        >
          {status === "active" ? "Đang hợp tác" : "Ngừng hợp tác"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
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
          {
            key: "status",
            label:
              record.status === "active"
                ? "Ngưng hợp tác"
                : "Kích hoạt hợp tác",
            icon:
              record.status === "active" ? <StopOutlined /> : <CheckOutlined />,
            danger: record.status === "active",
            onClick: () => confirmStatusChange(record),
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

  const handleView = async (record) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSelectedSupplier(response.data.data);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      message.error("Không thể tải thông tin chi tiết nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusChange = (record) => {
    const isDeactivating = record.status === "active";
    Modal.confirm({
      title: isDeactivating
        ? "Xác nhận ngưng hợp tác"
        : "Xác nhận kích hoạt hợp tác",
      content: (
        <div>
          <p>{`Bạn có chắc chắn muốn ${
            isDeactivating ? "ngưng" : "kích hoạt"
          } hợp tác với nhà cung cấp "${record.name}"?`}</p>
          {isDeactivating && (
            <p style={{ color: "#ff4d4f" }}>
              Lưu ý: Ngưng hợp tác sẽ tạm dừng tất cả giao dịch với nhà cung cấp
              này!
            </p>
          )}
        </div>
      ),
      okText: isDeactivating ? "Ngưng hợp tác" : "Kích hoạt",
      okButtonProps: {
        danger: isDeactivating,
      },
      cancelText: "Hủy",
      onOk: () =>
        handleStatusChange(record, isDeactivating ? "inactive" : "active"),
    });
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
          ...record,
          permissions: record.permissions?.map((p) => p.id) || [],
          status: newStatus,
        },
      });

      if (response.status === 200) {
        const updatedSupplier = response.data.data;

        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.id === record.id ? updatedSupplier : supplier
          )
        );

        message.success(
          newStatus === "active"
            ? "Đã kích hoạt hợp tác thành công"
            : "Đã ngưng hợp tác thành công"
        );
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    }
  };

  const handleAddSupplier = async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        typeSuppier: values.typeSuppier,
        status: values.status,
        permissions: values.products, // Đây là mảng id của các sản phẩm đã chọn
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        message.success("Thêm nhà cung cấp thành công");
        setIsModalVisible(false);
        form.resetFields();
        setProducts([]);
        setSelectedType(null);
        fetchSuppliers(); // Refresh lại danh sách
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Có lỗi xảy ra khi thêm nhà cung cấp");
      }
    }
  };

  const handleEditClick = async (record) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const supplierData = response.data.data;
      setEditingSupplier(supplierData);

      // Fetch products based on supplier type
      if (supplierData.typeSuppier !== "pig") {
        await fetchProductsByType(supplierData.typeSuppier);
      }

      // Cập nhật form với dữ liệu hiện tại
      editForm.setFieldsValue({
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        typeSuppier: supplierData.typeSuppier,
        status: supplierData.status,
        // Lấy danh sách ID sản phẩm từ permissions
        permissions: supplierData.permissions?.map((p) => p.id) || [],
      });

      setIsEditModalVisible(true);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      message.error("Không thể tải thông tin nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        typeSuppier: values.typeSuppier,
        status: values.status,
        permissions: values.permissions || [],
      };

      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        params: { id: editingSupplier.id },
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });

      if (response.status === 200) {
        message.success("Cập nhật nhà cung cấp thành công");
        setIsEditModalVisible(false);
        setEditingSupplier(null);
        editForm.resetFields();
        fetchSuppliers(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật nhà cung cấp"
      );
    }
  };

  const fetchProductsByType = async (type) => {
    try {
      let endpoint = "";
      if (type === "food") {
        endpoint = `${import.meta.env.VITE_API_URL}/api/Food`;
      } else if (type === "medicine") {
        endpoint = `${import.meta.env.VITE_API_URL}/api/v1/Medicine`;
      }

      if (endpoint) {
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
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
          setProducts([]);
          setSelectedType(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSupplier}
          initialValues={{
            status: "active",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên nhà cung cấp"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
                ]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="typeSuppier"
                label="Loại nhà cung cấp"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại nhà cung cấp",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn loại nhà cung cấp"
                  onChange={(value) => {
                    setSelectedType(value);
                    fetchProductsByType(value);
                    form.setFieldsValue({ products: undefined }); // Reset selected products
                  }}
                >
                  <Select.Option value="food">Thức ăn</Select.Option>
                  <Select.Option value="medicine">Thuốc</Select.Option>
                  <Select.Option value="pig">Heo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" />
          </Form.Item>

          {/* Chỉ hiển thị select sản phẩm khi không phải nhà cung cấp heo */}
          {selectedType && selectedType !== "pig" && (
            <Form.Item
              name="products"
              label={`Danh sách ${
                selectedType === "medicine" ? "thuốc" : "thức ăn"
              }`}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một sản phẩm",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder={`Chọn ${
                  selectedType === "medicine" ? "thuốc" : "thức ăn"
                }`}
                style={{ width: "100%" }}
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {products.map((product) => (
                  <Select.Option key={product.id} value={product.id}>
                    {selectedType === "medicine"
                      ? product.medicineName
                      : product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="status" label="Trạng thái" initialValue="active">
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
                  setProducts([]);
                  setSelectedType(null);
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
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateSupplier}
          initialValues={{ status: "active" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên nhà cung cấp"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
                ]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="typeSuppier"
                label="Loại nhà cung cấp"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại nhà cung cấp",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn loại nhà cung cấp"
                  disabled // Không cho phép thay đổi loại nhà cung cấp
                >
                  <Select.Option value="food">Thức ăn</Select.Option>
                  <Select.Option value="medicine">Thuốc</Select.Option>
                  <Select.Option value="pig">Heo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" />
          </Form.Item>

          {editingSupplier && editingSupplier.typeSuppier !== "pig" && (
            <Form.Item
              name="permissions"
              label={`Danh sách ${
                editingSupplier.typeSuppier === "medicine" ? "thuốc" : "thức ăn"
              }`}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một sảản phẩm",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder={`Chọn ${
                  editingSupplier.typeSuppier === "medicine"
                    ? "thuốc"
                    : "thức ăn"
                }`}
                style={{ width: "100%" }}
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {products.map((product) => (
                  <Select.Option
                    key={product.id}
                    value={product.id}
                    // Thêm style để đánh dấu sản phẩm đã được chọn
                    className={
                      editingSupplier.permissions?.some(
                        (p) => p.id === product.id
                      )
                        ? "ant-select-item-option-selected"
                        : ""
                    }
                  >
                    {editingSupplier.typeSuppier === "medicine"
                      ? product.medicineName
                      : product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="Trạng thái"
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

      {/* Modal Xem chi tiết */}
      <Modal
        title="Chi tiết nhà cung cấp"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedSupplier(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewModalVisible(false);
              setSelectedSupplier(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedSupplier && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã nhà cung cấp" span={2}>
                {selectedSupplier.id}
              </Descriptions.Item>
              <Descriptions.Item label="Tên nhà cung cấp" span={2}>
                {selectedSupplier.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedSupplier.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedSupplier.email}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedSupplier.address}
              </Descriptions.Item>
              <Descriptions.Item label="Loại nhà cung cấp">
                <Space size={[0, 4]} wrap style={{ gap: "4px !important" }}>
                  {Array.isArray(selectedSupplier.typeSuppier) ? (
                    selectedSupplier.typeSuppier.map((type, index) => (
                      <Tag
                        key={index}
                        color={SUPPLIER_TYPE_COLORS[type]}
                        style={{
                          minWidth: "80px",
                          textAlign: "center",
                          margin: "2px",
                          padding: "0 10px",
                        }}
                      >
                        {type === "food"
                          ? "Thức ăn"
                          : type === "medicine"
                          ? "Thuốc"
                          : "Heo"}
                      </Tag>
                    ))
                  ) : (
                    <Tag
                      color={SUPPLIER_TYPE_COLORS[selectedSupplier.typeSuppier]}
                      style={{
                        minWidth: "80px",
                        textAlign: "center",
                        margin: "2px",
                        padding: "0 10px",
                      }}
                    >
                      {selectedSupplier.typeSuppier === "food"
                        ? "Thức ăn"
                        : selectedSupplier.typeSuppier === "medicine"
                        ? "Thuốc"
                        : "Heo"}
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedSupplier.status === "active" ? "success" : "error"
                  }
                >
                  {selectedSupplier.status === "active"
                    ? "Đang hợp tác"
                    : "Ngừng hợp tác"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedSupplier.typeSuppier !== "pig" &&
              selectedSupplier.permissions && (
                <>
                  <Divider orientation="left">
                    Danh sách{" "}
                    {selectedSupplier.typeSuppier === "food"
                      ? "thức ăn"
                      : "thuốc"}{" "}
                    cung cấp
                  </Divider>
                  <Table
                    dataSource={selectedSupplier.permissions}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Mã sản phẩm",
                        dataIndex: "id",
                        key: "id",
                      },
                      {
                        title: "Tên sản phẩm",
                        dataIndex: "name",
                        key: "name",
                      },
                    ]}
                  />
                </>
              )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default SuppliersPage;
