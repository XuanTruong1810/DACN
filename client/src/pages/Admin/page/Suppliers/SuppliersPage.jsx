import React, { useState } from "react";
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
  DatePicker,
  Badge,
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
  SortAscendingOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const SuppliersPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    type: [],
    status: [],
    createdAt: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - thay thế bằng API call thực tế
  const [suppliers] = useState([
    {
      id: 1,
      name: "Công ty TNHH Thức ăn chăn nuôi A",
      phone: "0123456789",
      email: "contact@companya.com",
      address: "Số 123, Đường ABC, Quận XYZ, TP.HCM",
      type: "Thức ăn",
      status: "active",
    },
    {
      id: 2,
      name: "Công ty CP Thuốc thú y B",
      phone: "0987654321",
      email: "info@companyb.com",
      address: "Số 456, Đường DEF, Quận UVW, Hà Nội",
      type: "Thuốc",
      status: "inactive",
    },
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
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "Thức ăn" ? "green" : "blue"}>{type}</Tag>
      ),
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
            onClick: () => handleEdit(record),
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
                onClick: () => handleStatusChange(record.id, "inactive"),
              }
            : {
                key: "activate",
                label: "Kích hoạt lại",
                icon: <CheckOutlined />,
                onClick: () => handleStatusChange(record.id, "active"),
              },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa nhà cung cấp",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận xóa",
                content: "Bạn có chắc chắn muốn xóa nhà cung cấp này?",
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: {
                  danger: true,
                  size: "middle",
                },
                cancelButtonProps: {
                  size: "middle",
                },
                onOk: () => handleDelete(record.id),
                okType: "danger",
                centered: true,
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

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    console.log(id);
    try {
      setLoading(true);
      // Gọi API xóa
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Xóa nhà cung cấp thành công");
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi xóa nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      // Gọi API tạo/cập nhật
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(
        `${editingSupplier ? "Cập nhật" : "Thêm"} nhà cung cấp thành công`
      );
      setIsModalVisible(false);
      form.resetFields();
      setEditingSupplier(null);
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi lưu nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    // Xử lý xem chi tiết
    console.log("View:", record);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      // Gọi API cập nhật trạng thái
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Cập nhật trạng thái thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
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
              Quản lý nhà cung cấp
            </span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSupplier(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
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
              onChange={(e) => setSearchText(e.target.value)}
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
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, type: value }))
                  }
                  options={[
                    { label: "Thức ăn", value: "Thức ăn" },
                    { label: "Thuốc", value: "Thuốc" },
                    { label: "Khác", value: "Khác" },
                  ]}
                />
              </Col>
              <Col>
                <Select
                  style={{ width: 180 }}
                  placeholder="Trạng thái"
                  mode="multiple"
                  maxTagCount="responsive"
                  allowClear
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                  options={[
                    { label: "Đang hợp tác", value: "active" },
                    { label: "Ngừng hợp tác", value: "inactive" },
                  ]}
                />
              </Col>
              <Col>
                <RangePicker
                  style={{ width: 240 }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={(dates) =>
                    setFilters((prev) => ({ ...prev, createdAt: dates }))
                  }
                />
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={() => {
                      setFilters({
                        type: [],
                        status: [],
                        createdAt: [],
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
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhà cung cấp`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal giữ nguyên */}

      <style jsx global>{`
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
    </Layout>
  );
};

export default SuppliersPage;
