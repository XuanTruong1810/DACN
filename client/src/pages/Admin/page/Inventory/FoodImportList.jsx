import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  Badge,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  message,
  Tooltip,
  Tag,
  Select,
  Drawer,
  Statistic,
  Modal,
  Descriptions,
  InputNumber,
  Alert,
} from "antd";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const { Text } = Typography;

const FoodImportList = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // States
  const [loading, setLoading] = useState(false);
  const [foodImports, setFoodImports] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [showViewDetail, setShowViewDetail] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: [],
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(moment());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formErrors, setFormErrors] = useState({
    deliveryDate: false,
    quantities: false,
  });
  const [showStockConfirmModal, setShowStockConfirmModal] = useState(false);
  const [stockingId, setStockingId] = useState(null);

  useEffect(() => {
    getFoodImports();
  }, []);

  const getFoodImports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/FoodImport`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFoodImports(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu nhập");
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 150,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 200,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : ""),
    },
    {
      title: "Người tạo",
      dataIndex: "createByName",
      key: "createByName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusConfig = {
          pending: { color: "warning", text: "Chờ nhận hàng" },
          delivered: { color: "success", text: "Đã nhận hàng" },
          stocked: { color: "success", text: "Đã nhập kho" },
        };
        return (
          <Tag color={statusConfig[status]?.color || "default"}>
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
    },
    {
      title: "Đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      width: 150,
      render: (value) => (value ? `${value.toLocaleString()}đ` : "0đ"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleDelivery(record)}
            >
              Giao hàng
            </Button>
          )}
          {record.status === "delivered" && (
            <Button
              type="primary"
              icon={<InboxOutlined />}
              onClick={() => handleStock(record.id)}
            >
              Nhập kho
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = async (record) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/FoodImport/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSelectedImport(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      message.error("Lỗi khi tải chi tiết phiếu nhập");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      dateRange: [],
    });
    setSearchText("");
    getFoodImports();
  };

  const handleDelivery = (record) => {
    setSelectedDelivery(record);
    setDeliveryDetails(
      record.details.map((detail) => ({
        ...detail,
        actualQuantity: detail.expectedQuantity,
        receivedQuantity: detail.expectedQuantity,
      }))
    );
    setDeliveryDate(moment());
    setShowDeliveryModal(true);
  };

  const validateDeliveryForm = () => {
    const errors = {
      deliveryDate: !deliveryDate,
      quantities: false,
    };

    // Kiểm tra số lượng
    const hasInvalidQuantities = deliveryDetails.some((detail) => {
      // Số lượng thực tế không được vượt quá số lượng yêu cầu
      if (detail.actualQuantity > detail.expectedQuantity) {
        return true;
      }
      // Số lượng nhận không được vượt quá số lượng thực tế
      if (detail.receivedQuantity > detail.actualQuantity) {
        return true;
      }
      // Các số lượng phải được nhập
      if (!detail.actualQuantity || !detail.receivedQuantity) {
        return true;
      }
      return false;
    });

    errors.quantities = hasInvalidQuantities;
    setFormErrors(errors);

    return !errors.deliveryDate && !hasInvalidQuantities;
  };

  const handleDeliveryConfirm = async () => {
    if (!validateDeliveryForm()) {
      message.error("Vui lòng kiểm tra lại thông tin giao hàng!");
      return;
    }

    try {
      const payload = {
        deliveryTime: deliveryDate.toISOString(),
        details: deliveryDetails.map((detail) => ({
          foodId: detail.foodId,
          actualQuantity: detail.actualQuantity,
          receivedQuantity: detail.receivedQuantity,
          note: detail.note || null,
        })),
        note: null, // Có thể thêm field note nếu cần
      };

      await axios.put(
        `${API_URL}/api/FoodImport/${selectedDelivery.id}/delivery`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Giao hàng thành công");
      setShowDeliveryModal(false);
      setShowConfirmModal(true);
      getFoodImports();
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi xác nhận giao hàng");
    }
  };

  const handleStock = (id) => {
    setStockingId(id);
    setShowStockConfirmModal(true);
  };

  const handleStockConfirm = async () => {
    try {
      await axios.put(
        `${API_URL}/api/FoodImport/${stockingId}/stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Nhập kho thành công");
      setShowStockConfirmModal(false);
      getFoodImports();
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi nhập kho");
    }
  };

  const renderDetailModal = () => (
    <Modal
      title={`Chi tiết phiếu nhập ${selectedImport?.id}`}
      open={showDetailModal}
      onCancel={() => setShowDetailModal(false)}
      footer={null}
      width={1000}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Mã phiếu">
          {selectedImport?.id}
        </Descriptions.Item>
        <Descriptions.Item label="Nhà cung cấp">
          {selectedImport?.supplierName}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {moment(selectedImport?.createTime).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Người tạo">
          {selectedImport?.createByName}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag
            color={selectedImport?.status === "pending" ? "warning" : "success"}
          >
            {selectedImport?.status === "pending"
              ? "Chờ nhận hàng"
              : "Đã nhận hàng"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tiền đặt cọc">
          <Text type="success">
            {selectedImport?.depositAmount?.toLocaleString()}đ
          </Text>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <Text strong>Chi tiết sản phẩm:</Text>
        <Table
          dataSource={selectedImport?.details || []}
          columns={[
            {
              title: "Tên thức ăn",
              dataIndex: "foodName",
            },
            {
              title: "Đơn giá",
              dataIndex: "unitPrice",
              render: (value) => `${value?.toLocaleString()}đ`,
            },
            {
              title: "Số lượng yêu cầu",
              dataIndex: "expectedQuantity",
              render: (value) => `${value?.toLocaleString()} kg`,
            },
            {
              title: "Thành tiên",
              dataIndex: "totalPrice",
              render: (value) => `${value?.toLocaleString()}đ`,
            },
          ]}
          pagination={false}
        />
      </div>
    </Modal>
  );

  return (
    <div className="food-import-list">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng số phiếu</Text>}
              value={foodImports.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Chờ nhận hàng</Text>}
              value={foodImports.filter((r) => r.status === "pending").length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng giá trị</Text>}
              value={foodImports.reduce(
                (sum, item) => sum + (item.depositAmount || 0),
                0
              )}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
      </Row>

      <Card className="main-table-card">
        <Space
          style={{
            marginBottom: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Space>
            <Input.Search
              placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
            >
              Bộ lọc
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              Làm mới
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={foodImports}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phiếu nhập`,
          }}
        />
      </Card>

      {renderDetailModal()}

      <Modal
        title="Xác nhận giao hàng"
        open={showDeliveryModal}
        onOk={handleDeliveryConfirm}
        onCancel={() => setShowDeliveryModal(false)}
        okButtonProps={{
          disabled: formErrors.deliveryDate || formErrors.quantities,
        }}
        width={1000}
      >
        {selectedDelivery && (
          <>
            <Card bordered={false} className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Mã phiếu">
                      {selectedDelivery.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp">
                      {selectedDelivery.supplierName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {moment(selectedDelivery.createTime).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">
                      {selectedDelivery.createByName}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Ngày giao dự kiến">
                      {moment(selectedDelivery.expectedDeliveryTime).format(
                        "DD/MM/YYYY"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiền đặt cọc">
                      <Text type="success">
                        {selectedDelivery.depositAmount?.toLocaleString()}đ
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <span>
                          Ngày giao thực tế
                          <span style={{ color: "#ff4d4f" }}> *</span>
                        </span>
                      }
                      validateStatus={formErrors.deliveryDate ? "error" : ""}
                    >
                      <DatePicker
                        value={deliveryDate}
                        onChange={(date) => {
                          setDeliveryDate(date);
                          setFormErrors((prev) => ({
                            ...prev,
                            deliveryDate: !date,
                          }));
                        }}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {formErrors.quantities && (
              <Alert
                message="Lỗi nhập số lượng"
                description="Vui lòng kiểm tra lại:
                  - Số lượng thực tế không được vượt quá số lượng yêu cầu
                  - Số lượng nhận không được vượt quá số lượng thực tế
                  - Phải nhập đầy đủ các số lượng"
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              dataSource={deliveryDetails}
              columns={[
                {
                  title: "Tên thức ăn",
                  dataIndex: "foodName",
                },
                {
                  title: "Số lượng yêu cầu",
                  dataIndex: "expectedQuantity",
                  render: (value) => `${value.toLocaleString()} kg`,
                },
                {
                  title: "Số lượng chấp nhận",
                  dataIndex: "actualQuantity",
                  render: (_, record, index) => (
                    <InputNumber
                      min={0}
                      max={record.expectedQuantity}
                      value={record.actualQuantity}
                      onChange={(value) => {
                        const newDetails = [...deliveryDetails];
                        newDetails[index].actualQuantity = value;
                        newDetails[index].receivedQuantity = Math.min(
                          value || 0,
                          newDetails[index].receivedQuantity || 0
                        );
                        setDeliveryDetails(newDetails);
                        validateDeliveryForm();
                      }}
                      status={
                        record.actualQuantity > record.expectedQuantity
                          ? "error"
                          : ""
                      }
                      addonAfter="kg"
                    />
                  ),
                },
                {
                  title: "Số lượng giao tới",
                  dataIndex: "receivedQuantity",
                  render: (_, record, index) => (
                    <InputNumber
                      min={0}
                      max={record.actualQuantity}
                      value={record.receivedQuantity}
                      onChange={(value) => {
                        const newDetails = [...deliveryDetails];
                        newDetails[index].receivedQuantity = value;
                        setDeliveryDetails(newDetails);
                        validateDeliveryForm();
                      }}
                      status={
                        record.receivedQuantity > record.actualQuantity
                          ? "error"
                          : ""
                      }
                      addonAfter="kg"
                    />
                  ),
                },
              ]}
              pagination={false}
            />
          </>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: "#52c41a" }} />
            <span>Thông tin thanh toán</span>
          </Space>
        }
        open={showConfirmModal}
        onOk={() => setShowConfirmModal(false)}
        onCancel={() => setShowConfirmModal(false)}
        width={600}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setShowConfirmModal(false)}
          >
            Xác nhận
          </Button>,
        ]}
      >
        {selectedDelivery && (
          <>
            <Alert
              message="Giao hàng thành công!"
              description="Vui lòng kiểm tra thông tin thanh toán bên dưới"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card bordered={false}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label={<Text strong>Tổng tiền hàng</Text>}>
                  <Text type="warning" style={{ fontSize: 16 }}>
                    {deliveryDetails
                      .reduce(
                        (sum, item) =>
                          sum + item.receivedQuantity * item.unitPrice,
                        0
                      )
                      .toLocaleString()}
                    đ
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label={<Text strong>Đã đặt cọc</Text>}>
                  <Text type="success" style={{ fontSize: 16 }}>
                    {selectedDelivery.depositAmount?.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Text strong>Còn phải thanh toán</Text>}
                  className="payment-highlight"
                >
                  <Text
                    type="danger"
                    style={{ fontSize: 18, fontWeight: "bold" }}
                  >
                    {(
                      deliveryDetails.reduce(
                        (sum, item) =>
                          sum + item.receivedQuantity * item.unitPrice,
                        0
                      ) - (selectedDelivery.depositAmount || 0)
                    ).toLocaleString()}
                    đ
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: "#52c41a" }} />
            <Text strong>Xác nhận nhập kho</Text>
          </Space>
        }
        open={showStockConfirmModal}
        onOk={handleStockConfirm}
        onCancel={() => setShowStockConfirmModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn nhập kho phiếu nhập này?</p>
      </Modal>
    </div>
  );
};

export default FoodImportList;
