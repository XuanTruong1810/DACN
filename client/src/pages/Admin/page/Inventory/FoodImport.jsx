import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Divider,
  message,
  Row,
  Col,
  Badge,
  Tag,
  Modal,
  Descriptions,
  Empty,
  Statistic,
} from "antd";
import {
  ShoppingCartOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const FoodImport = () => {
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  // Mock data
  const areas = [
    {
      id: 1,
      name: "Khu A",
      description: "Khu vực chăn nuôi heo con",
      capacity: 1000,
      currentOccupancy: 800,
    },
    {
      id: 2,
      name: "Khu B",
      description: "Khu vực chăn nuôi heo thịt",
      capacity: 1500,
      currentOccupancy: 1200,
    },
    {
      id: 3,
      name: "Khu C",
      description: "Khu vực chăn nuôi heo nái",
      capacity: 800,
      currentOccupancy: 600,
    },
  ];

  // Table columns
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 300,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.category}
          </Text>
          {record.isLow && <Tag color="error">Sắp hết hàng</Tag>}
        </Space>
      ),
    },
    {
      title: "Tồn kho",
      children: [
        {
          title: "Hiện tại",
          dataIndex: "currentStock",
          key: "currentStock",
          width: 120,
          render: (value, record) => (
            <Text type={record.isLow ? "danger" : "secondary"}>
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
        {
          title: "Tối thiểu",
          dataIndex: "minStock",
          key: "minStock",
          width: 120,
          render: (value, record) => (
            <Text>
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
      ],
    },
    {
      title: "Định mức/ngày",
      dataIndex: "dailyUsage",
      key: "dailyUsage",
      width: 150,
      render: (value, record) => (
        <Text>
          {value.toLocaleString()} {record.unit}/ngày
        </Text>
      ),
    },
    {
      title: "Đề xuất nhập",
      children: [
        {
          title: "Số lượng",
          dataIndex: "suggestedAmount",
          key: "suggestedAmount",
          width: 150,
          render: (value, record) => (
            <Text strong type="success">
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
        {
          title: "Đơn giá",
          dataIndex: "price",
          key: "price",
          width: 150,
          render: (value) => <Text>{value.toLocaleString()} đ</Text>,
        },
        {
          title: "Thành tiền",
          key: "totalPrice",
          width: 150,
          render: (_, record) => (
            <Text strong type="danger">
              {(record.price * record.suggestedAmount).toLocaleString()} đ
            </Text>
          ),
        },
      ],
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type={selectedProducts.includes(record.id) ? "default" : "primary"}
            size="small"
            onClick={() => handleProductSelect(record)}
          >
            {selectedProducts.includes(record.id) ? "Đã chọn" : "Chọn"}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleShowDetail(record)}
          />
        </Space>
      ),
    },
  ];

  // Effects
  useEffect(() => {
    form.setFieldsValue({
      area: areas[0].id,
      days: 7, // Set mặc định 7 ngày
    });
    handleParametersChange(null, { area: areas[0].id, days: 7 });
  }, []);

  // Handlers
  const handleParametersChange = async (changedValues, allValues) => {
    if (allValues.area && allValues.days) {
      setLoading(true);
      try {
        const response = await mockGetSuggestedProducts(
          allValues.area,
          allValues.days
        );
        setSuggestedProducts(response);
      } catch (error) {
        message.error("Có lỗi xảy ra khi tải dữ liệu");
      }
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      return [...prev, product.id];
    });
  };

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleConfirmImport = () => {
    message.success("Tạo phiếu nhập thành công!");
    setShowBill(false);
    setSelectedProducts([]);
    setSuggestedProducts([]);
    form.resetFields();
  };

  return (
    <div className="food-import-container">
      {/* Statistics Overview */}
      <Row gutter={[24, 24]} className="statistics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card">
            <Statistic
              title={<Text strong>Tổng sản phẩm</Text>}
              value={suggestedProducts.length}
              prefix={<ShoppingCartOutlined className="statistic-icon" />}
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Đang hiển thị</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card warning">
            <Statistic
              title={<Text strong>Sản phẩm sắp hết</Text>}
              value={suggestedProducts.filter((p) => p.isLow).length}
              prefix={<WarningOutlined className="statistic-icon" />}
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Cần nhập bổ sung</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card success">
            <Statistic
              title={<Text strong>Đã chọn</Text>}
              value={selectedProducts.length}
              prefix={<CheckCircleOutlined className="statistic-icon" />}
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Sản phẩm</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="statistic-card primary">
            <Statistic
              title={<Text strong>Tổng giá trị</Text>}
              value={selectedProducts.reduce((sum, id) => {
                const product = suggestedProducts.find((p) => p.id === id);
                return (
                  sum + (product ? product.price * product.suggestedAmount : 0)
                );
              }, 0)}
              prefix={<DollarOutlined className="statistic-icon" />}
              suffix="đ"
              className="custom-statistic"
            />
            <div className="statistic-footer">
              <Text type="secondary">Dự kiến</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={showBill ? 16 : 24}>
          <Card
            className="main-card"
            bordered={false}
            title={
              <div className="card-title-section">
                <div className="title-left">
                  <ShoppingCartOutlined className="card-icon primary" />
                  <span>
                    <Title level={4} style={{ margin: 0 }}>
                      Nhập thức ăn
                    </Title>
                    <Text type="secondary">
                      Quản lý nhập kho thức ăn theo khu vực
                    </Text>
                  </span>
                </div>
                <Space>
                  <Button icon={<HistoryOutlined />}>Lịch sử nhập</Button>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    disabled={selectedProducts.length === 0}
                  >
                    In phiếu nhập
                  </Button>
                </Space>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              className="parameters-form"
              onValuesChange={handleParametersChange}
            >
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="area"
                    label={
                      <Space>
                        <EnvironmentOutlined />
                        <Text strong>Khu vực</Text>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng chọn khu vực" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn khu vực"
                      className="custom-select"
                      dropdownClassName="custom-dropdown"
                    >
                      {areas.map((area) => (
                        <Option key={area.id} value={area.id}>
                          <div className="area-option">
                            <div>
                              <Text strong>{area.name}</Text>
                              <Text
                                type="secondary"
                                className="area-description"
                              >
                                {area.description}
                              </Text>
                            </div>
                            <Badge
                              count={`${Math.round(
                                (area.currentOccupancy / area.capacity) * 100
                              )}%`}
                              style={{
                                backgroundColor:
                                  area.currentOccupancy >= area.capacity * 0.8
                                    ? "#ff4d4f"
                                    : "#52c41a",
                              }}
                            />
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="days"
                    label={
                      <Space>
                        <CalendarOutlined />
                        <Text strong>Số ngày dự trù</Text>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập số ngày" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={90}
                      style={{ width: "100%" }}
                      placeholder="Nhập số ngày"
                      className="custom-input"
                      formatter={(value) => `${value} ngày`}
                      parser={(value) => value.replace(" ngày", "")}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider />

            {/* Products Table */}
            {suggestedProducts.length > 0 && (
              <Card className="products-card" style={{ marginTop: "24px" }}>
                <div className="table-header">
                  <Space>
                    <CalculatorOutlined />
                    <Text strong>Danh sách thức ăn đề xuất</Text>
                  </Space>
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => setShowBill(true)}
                      disabled={selectedProducts.length === 0}
                    >
                      Xem hóa đơn ({selectedProducts.length})
                    </Button>
                  </Space>
                </div>

                <Table
                  columns={columns}
                  dataSource={suggestedProducts}
                  loading={loading}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1500 }}
                  className="custom-table"
                />
              </Card>
            )}
          </Card>
        </Col>

        {/* Bill Section */}
        {showBill && (
          <Col xs={24} lg={8}>
            <Card
              className="bill-card"
              title={
                <Space>
                  <CheckCircleOutlined />
                  <span>Phiếu nhập kho</span>
                </Space>
              }
              extra={
                <Button type="text" danger onClick={() => setShowBill(false)}>
                  Đóng
                </Button>
              }
            >
              {selectedProducts.length > 0 ? (
                <>
                  <div className="bill-items">
                    {suggestedProducts
                      .filter((p) => selectedProducts.includes(p.id))
                      .map((item) => (
                        <div key={item.id} className="bill-item">
                          <div className="bill-item-header">
                            <Text strong>{item.name}</Text>
                            <Button
                              type="text"
                              danger
                              size="small"
                              onClick={() => handleProductSelect(item)}
                            >
                              Xóa
                            </Button>
                          </div>
                          <div className="bill-item-details">
                            <Text type="secondary">
                              {item.suggestedAmount.toLocaleString()}{" "}
                              {item.unit} x {item.price.toLocaleString()}đ
                            </Text>
                            <Text strong>
                              {(
                                item.price * item.suggestedAmount
                              ).toLocaleString()}
                              đ
                            </Text>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Divider />

                  <div className="bill-total">
                    <Title level={4}>Tổng cộng</Title>
                    <Title level={3} type="danger">
                      {suggestedProducts
                        .filter((p) => selectedProducts.includes(p.id))
                        .reduce(
                          (sum, item) =>
                            sum + item.price * item.suggestedAmount,
                          0
                        )
                        .toLocaleString()}
                      đ
                    </Title>
                  </div>

                  <div className="bill-actions">
                    <Button
                      type="primary"
                      block
                      icon={<CheckCircleOutlined />}
                      onClick={handleConfirmImport}
                    >
                      Xác nhận nhập kho
                    </Button>
                    <Button block icon={<PrinterOutlined />}>
                      In phiếu nhập
                    </Button>
                  </div>
                </>
              ) : (
                <Empty description="Chưa có sản phẩm nào được chọn" />
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Product Detail Modal */}
      <Modal
        title="Chi tiết sản phẩm"
        open={showProductDetail}
        onCancel={() => setShowProductDetail(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên sản phẩm" span={2}>
            {selectedProduct?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mã sản phẩm">
            {selectedProduct?.id}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {selectedProduct?.category}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp" span={2}>
            {selectedProduct?.supplier}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {selectedProduct?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị tính">
            {selectedProduct?.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn giá">
            {selectedProduct?.price.toLocaleString()} đ/{selectedProduct?.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho hiện tại">
            <Space>
              {selectedProduct?.currentStock.toLocaleString()}{" "}
              {selectedProduct?.unit}
              {selectedProduct?.isLow && <Tag color="error">Sắp hết hàng</Tag>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho tối thiểu">
            {selectedProduct?.minStock.toLocaleString()} {selectedProduct?.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Định mức sử dụng">
            {selectedProduct?.dailyUsage.toLocaleString()}{" "}
            {selectedProduct?.unit}/ngày
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng đề xuất">
            {selectedProduct?.suggestedAmount.toLocaleString()}{" "}
            {selectedProduct?.unit}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

// Mock API
const mockGetSuggestedProducts = async (areaId, days) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: 1,
      name: "Thức ăn heo con C100",
      currentStock: 500,
      dailyUsage: 50,
      suggestedAmount: 50 * days,
      unit: "kg",
      price: 15000,
      isLow: true,
      supplier: "Công ty TNHH Thức ăn chăn nuôi ABC",
      category: "Thức ăn heo con",
      minStock: 1000,
      description: "Thức ăn dạng viên cho heo con từ 15-30kg",
    },
    {
      id: 2,
      name: "Thức ăn heo thịt G100",
      currentStock: 1200,
      dailyUsage: 100,
      suggestedAmount: 100 * days,
      unit: "kg",
      price: 12000,
      isLow: false,
      supplier: "Công ty TNHH Thức ăn chăn nuôi ABC",
      category: "Thức ăn heo thịt",
      minStock: 2000,
      description: "Thức ăn dạng viên cho heo thịt từ 30-60kg",
    },
    {
      id: 3,
      name: "Thức ăn heo thịt G200",
      currentStock: 800,
      dailyUsage: 120,
      suggestedAmount: 120 * days,
      unit: "kg",
      price: 11500,
      isLow: true,
      supplier: "Công ty TNHH Thức ăn chăn nuôi XYZ",
      category: "Thức ăn heo thịt",
      minStock: 2500,
      description: "Thức ăn dạng viên cho heo thịt từ 60-100kg",
    },
    {
      id: 4,
      name: "Thức ăn heo nái mang thai",
      currentStock: 900,
      dailyUsage: 80,
      suggestedAmount: 80 * days,
      unit: "kg",
      price: 13500,
      isLow: false,
      supplier: "Công ty TNHH Thức ăn chăn nuôi XYZ",
      category: "Thức ăn heo nái",
      minStock: 1500,
      description: "Thức ăn cho heo nái mang thai",
    },
    {
      id: 5,
      name: "Thức ăn heo nái nuôi con",
      currentStock: 600,
      dailyUsage: 90,
      suggestedAmount: 90 * days,
      unit: "kg",
      price: 14000,
      isLow: true,
      supplier: "Công ty TNHH Thức ăn chăn nuôi DEF",
      category: "Thức ăn heo nái",
      minStock: 1800,
      description: "Thức ăn cho heo nái đang nuôi con",
    },
  ];
};

export default FoodImport;
