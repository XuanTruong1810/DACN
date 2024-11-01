import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Badge,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Form,
  Select,
  Input,
  DatePicker,
  Menu,
  Dropdown,
  Timeline,
  Alert,
  Descriptions,
  InputNumber,
  Tooltip,
  Spin,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { mockBills, mockSuppliers, mockAreas } from "./mock/mockData";
import "./styles/FoodImportApproval.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const FoodImportApproval = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [bills, setBills] = useState(mockBills);
  const [filters, setFilters] = useState({
    status: undefined,
    area: undefined,
    creator: "",
    billCode: "",
    dateRange: [],
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: mockBills.length,
  });
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Effects
  useEffect(() => {
    fetchData();
  }, [filters, pagination.current, pagination.pageSize]);

  // API calls simulation
  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Filter data
      let filteredData = [...mockBills];
      if (filters.status) {
        filteredData = filteredData.filter(
          (bill) => bill.status === filters.status
        );
      }
      if (filters.area) {
        filteredData = filteredData.filter(
          (bill) => bill.area === filters.area
        );
      }
      if (filters.creator) {
        filteredData = filteredData.filter((bill) =>
          bill.createdBy.toLowerCase().includes(filters.creator.toLowerCase())
        );
      }
      if (filters.billCode) {
        filteredData = filteredData.filter((bill) =>
          bill.id.toLowerCase().includes(filters.billCode.toLowerCase())
        );
      }

      setBills(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      area: undefined,
      creator: "",
      billCode: "",
      dateRange: [],
    });
  };

  const handleView = (record) => {
    setSelectedBill(record);
    setDrawerVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedBill(record);
    setApproveModalVisible(true);
    // Initialize form with default values
    approveForm.setFieldsValue({
      supplierId: undefined,
      items: record.items.map((item) => ({
        ...item,
        price: null,
      })),
      deposit: 0,
    });
  };

  const handleApproveSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update bill status
      const updatedBills = bills.map((bill) =>
        bill.id === selectedBill.id ? { ...bill, status: "approved" } : bill
      );
      setBills(updatedBills);

      message.success(`Đã duyệt phiếu ${selectedBill.id}`);
      setApproveModalVisible(false);
      approveForm.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi duyệt phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (record) => {
    setSelectedBill(record);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update bill status
      const updatedBills = bills.map((bill) =>
        bill.id === selectedBill.id
          ? { ...bill, status: "rejected", rejectReason: values.reason }
          : bill
      );
      setBills(updatedBills);

      message.success(`Đã từ chối phiếu ${selectedBill.id}`);
      setRejectModalVisible(false);
      rejectForm.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi từ chối phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (record) => {
    message.loading({ content: "Đang chuẩn bị in...", key: "print" });
    setTimeout(() => {
      message.success({
        content: "Đã gửi lệnh in thành công!",
        key: "print",
        duration: 2,
      });
    }, 1000);
  };

  const handleViewHistory = (record) => {
    Modal.info({
      title: (
        <Space>
          <HistoryOutlined />
          <span>Lịch sử thao tác</span>
        </Space>
      ),
      width: 600,
      className: "history-modal",
      content: (
        <Timeline>
          {record.history?.map((item, index) => (
            <Timeline.Item
              key={index}
              color={
                item.action === "create"
                  ? "blue"
                  : item.action === "approve"
                  ? "green"
                  : item.action === "reject"
                  ? "red"
                  : "gray"
              }
            >
              <div className="history-item">
                <Text strong>
                  {item.action === "create"
                    ? "Tạo phiếu"
                    : item.action === "approve"
                    ? "Duyệt phiếu"
                    : item.action === "reject"
                    ? "Từ chối phiếu"
                    : item.action}
                </Text>
                <div className="history-info">
                  <Text type="secondary">Thời gian: {item.time}</Text>
                  <br />
                  <Text type="secondary">Người thực hiện: {item.user}</Text>
                  {item.note && (
                    <>
                      <br />
                      <Text type="secondary">Ghi chú: {item.note}</Text>
                    </>
                  )}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ),
    });
  };

  const calculateItemTotal = (quantity, price) => {
    return (quantity || 0) * (price || 0);
  };

  const calculateBillTotal = (items) => {
    return items.reduce((sum, item) => {
      const price =
        approveForm.getFieldValue(["items", items.indexOf(item), "price"]) || 0;
      return sum + calculateItemTotal(item.quantity, price);
    }, 0);
  };

  const SupplierDetail = ({ supplier }) => {
    if (!supplier) return null;

    return (
      <Card
        size="small"
        className="supplier-info"
        title={
          <Space>
            <UserOutlined />
            <span>Thông tin nhà cung cấp</span>
          </Space>
        }
      >
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="Mã NCC" span={1}>
            <Text strong>{supplier.code}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên NCC" span={1}>
            <Text strong>{supplier.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Người đại diện" span={1}>
            {supplier.representative}
          </Descriptions.Item>
          <Descriptions.Item label="Mã số thuế" span={1}>
            {supplier.taxCode}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            {supplier.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={1}>
            {supplier.email}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {supplier.address}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // Table Columns
  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <Space>
          <CalendarOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text strong type="success">
          {amount.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "pending"
            ? "processing"
            : status === "approved"
            ? "success"
            : "error";
        let text =
          status === "pending"
            ? "Chờ duyệt"
            : status === "approved"
            ? "Đã duyệt"
            : "Từ chối";
        let icon =
          status === "pending" ? (
            <ClockCircleOutlined />
          ) : status === "approved" ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          );

        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => {
        const actionMenu = (
          <Menu className="custom-action-menu">
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              Xem chi tiết
            </Menu.Item>
            <Menu.Divider />
            <Menu.ItemGroup title="Thao tác phê duyệt">
              {record.status === "pending" && (
                <>
                  <Menu.Item
                    key="approve"
                    icon={<CheckCircleOutlined className="approve-icon" />}
                    onClick={() => handleApprove(record)}
                    className="approve-menu-item"
                  >
                    Duyệt phiếu
                  </Menu.Item>
                  <Menu.Item
                    key="reject"
                    icon={<CloseCircleOutlined className="reject-icon" />}
                    onClick={() => handleReject(record)}
                    danger
                  >
                    Từ chối
                  </Menu.Item>
                </>
              )}
            </Menu.ItemGroup>
          </Menu>
        );

        return (
          <Space size="middle" className="action-space">
            {record.status === "pending" && (
              <div className="quick-actions">
                <Tooltip title="Duyệt nhanh" placement="top">
                  <Button
                    type="primary"
                    className="approve-button"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(record)}
                  >
                    Duyệt
                  </Button>
                </Tooltip>
                <Tooltip title="Từ chối" placement="top">
                  <Button
                    danger
                    className="reject-button"
                    icon={<CloseOutlined />}
                    onClick={() => handleReject(record)}
                  >
                    Từ chối
                  </Button>
                </Tooltip>
              </div>
            )}

            <Dropdown
              overlay={actionMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className="more-actions-button"
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // Render
  return (
    <div className="food-import-approval">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-title">
          <Title level={3}>
            <FileSearchOutlined /> Duyệt phiếu nhập thức ăn
          </Title>
          <Text type="secondary">
            Quản lý và phê duyệt các phiếu nhập thức ăn cho vật nuôi
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
          <RangePicker
            style={{ width: 300 }}
            placeholder={["Từ ngày", "Đến ngày"]}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
          />
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="statistics-row">
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Chờ duyệt</Text>}
              value={bills.filter((b) => b.status === "pending").length}
              prefix={
                <ClockCircleOutlined className="statistic-icon pending" />
              }
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Cần xử lý</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Đã duyệt</Text>}
              value={bills.filter((b) => b.status === "approved").length}
              prefix={
                <CheckCircleOutlined className="statistic-icon success" />
              }
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Trong tháng này</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Tổng giá trị</Text>}
              value={bills.reduce((sum, bill) => sum + bill.totalAmount, 0)}
              prefix={<DollarOutlined className="statistic-icon primary" />}
              suffix="đ"
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Trong tháng này</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Trạng thái" className="mb-0">
              <Select
                placeholder="Tất cả trạng thái"
                allowClear
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              >
                <Select.Option value="pending">
                  <Badge status="processing" text="Chờ duyệt" />
                </Select.Option>
                <Select.Option value="approved">
                  <Badge status="success" text="Đã duyệt" />
                </Select.Option>
                <Select.Option value="rejected">
                  <Badge status="error" text="Từ chối" />
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Khu vực" className="mb-0">
              <Select
                placeholder="Tất cả khu vực"
                allowClear
                style={{ width: "100%" }}
                value={filters.area}
                onChange={(value) => handleFilterChange("area", value)}
              >
                {mockAreas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Người tạo" className="mb-0">
              <Input
                placeholder="Tìm theo người tạo"
                prefix={<UserOutlined />}
                value={filters.creator}
                onChange={(e) => handleFilterChange("creator", e.target.value)}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Mã phiếu" className="mb-0">
              <Input
                placeholder="Nhập mã phiếu"
                prefix={<FileSearchOutlined />}
                value={filters.billCode}
                onChange={(e) => handleFilterChange("billCode", e.target.value)}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={handleResetFilters}>Đặt lại</Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchData}
              >
                Tìm kiếm
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={bills}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={pagination}
          className="custom-table"
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title={`Duyệt phiếu nhập ${selectedBill?.id}`}
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          approveForm.resetFields();
        }}
        width={1000}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setApproveModalVisible(false);
              approveForm.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => approveForm.submit()}
            loading={loading}
          >
            Xác nhận duyệt
          </Button>,
        ]}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApproveSubmit}
        >
          {/* Supplier Selection */}
          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhà cung cấp"
              optionFilterProp="children"
              onChange={(value) => {
                const supplier = mockSuppliers.find((s) => s.id === value);
                setSelectedSupplier(supplier);
              }}
            >
              {mockSuppliers.map((supplier) => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  <Space direction="vertical" size={0}>
                    <Text strong>{supplier.name}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {supplier.code} - {supplier.phone}
                    </Text>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedSupplier && <SupplierDetail supplier={selectedSupplier} />}

          {/* Products List */}
          <Title level={5} style={{ marginTop: 24 }}>
            Chi tiết sản phẩm
          </Title>
          <Form.List name="items">
            {(fields) => (
              <>
                {selectedBill?.items.map((item, index) => (
                  <Card
                    key={item.id}
                    size="small"
                    className="product-card"
                    title={
                      <Space>
                        <ShoppingCartOutlined />
                        <span>{item.name}</span>
                      </Space>
                    }
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Số lượng"
                          name={["items", index, "quantity"]}
                          initialValue={item.quantity}
                        >
                          <InputNumber
                            disabled
                            style={{ width: "100%" }}
                            formatter={(value) => `${value} ${item.unit}`}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Đơn giá"
                          name={["items", index, "price"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập đơn giá",
                            },
                            {
                              type: "number",
                              min: 1000,
                              message: "Đơn giá phải lớn hơn 1,000đ",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="đ"
                            onChange={() => {
                              // Force re-render to update total
                              approveForm.setFieldsValue({
                                items: approveForm.getFieldValue("items"),
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="Thành tiền">
                          <InputNumber
                            disabled
                            style={{ width: "100%" }}
                            value={calculateItemTotal(
                              approveForm.getFieldValue([
                                "items",
                                index,
                                "quantity",
                              ]),
                              approveForm.getFieldValue([
                                "items",
                                index,
                                "price",
                              ])
                            )}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="đ"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}

                {/* Tổng cộng và tiền cọc */}
                <Card
                  size="small"
                  className="total-card"
                  title={
                    <Space>
                      <DollarOutlined />
                      <span>Tổng cộng</span>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Statistic
                        title={<Text strong>Tổng tiền hàng</Text>}
                        value={calculateBillTotal(selectedBill?.items || [])}
                        precision={0}
                        suffix="đ"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="deposit"
                        label={<Text strong>Tiền cọc</Text>}
                        rules={[
                          { required: true, message: "Vui lòng nhập tiền cọc" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const totalAmount = calculateBillTotal(
                                selectedBill?.items || []
                              );
                              if (value && value > totalAmount) {
                                return Promise.reject(
                                  "Tiền cọc không được lớn hơn tổng tiền"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          addonAfter="đ"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider style={{ margin: "12px 0" }} />
                  <Row>
                    <Col span={24}>
                      <Alert
                        message={
                          <Space>
                            <InfoCircleOutlined />
                            <Text>Số tiền cần thanh toán:</Text>
                            <Text
                              strong
                              type="danger"
                              style={{ fontSize: "16px" }}
                            >
                              {(
                                calculateBillTotal(selectedBill?.items || []) -
                                (approveForm.getFieldValue("deposit") || 0)
                              )
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              đ
                            </Text>
                          </Space>
                        }
                        type="info"
                        showIcon={false}
                      />
                    </Col>
                  </Row>
                </Card>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default FoodImportApproval;
