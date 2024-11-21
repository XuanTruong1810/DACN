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
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const { Text, Title } = Typography;

const MedicineImportList = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // States
  const [loading, setLoading] = useState(false);
  const [medicineImports, setMedicineImports] = useState([]);
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
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
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
          Pending: { color: "warning", text: "Chờ nhận hàng" },
          Completed: { color: "success", text: "Đã nhận hàng" },
          Stocked: { color: "success", text: "Đã nhập kho" },
        };
        return (
          <Tag color={statusConfig[status]?.color || "default"}>
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày nhận dự kiến",
      dataIndex: "expectedDeliveryTime",
      key: "expectedDeliveryTime",
      width: 180,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Đặt cọc",
      dataIndex: "deposit",
      key: "deposit",
      width: 150,
      render: (value) => `${value.toLocaleString()}đ`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              getImportDetails(record.id);
              setShowViewDetail(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === "Pending" && (
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleDelivery(record)}
            >
              Giao hàng
            </Button>
          )}
          {record.status === "Completed" && !record.isStocked && (
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

  useEffect(() => {
    getMedicineImports();
  }, []);

  const getMedicineImports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/MedicineImports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMedicineImports(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu nhập thuốc");
    }
    setLoading(false);
  };

  const getImportDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/MedicineImports/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSelectedImport(response.data.data);
      setShowViewDetail(true);
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
    getMedicineImports();
  };

  const renderDetailModal = () => (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Chi tiết phiếu nhập thuốc</span>
        </Space>
      }
      open={showViewDetail}
      onCancel={() => setShowViewDetail(false)}
      footer={[
        <Button key="close" onClick={() => setShowViewDetail(false)}>
          Đóng
        </Button>,
      ]}
      width={1000}
    >
      {selectedImport && (
        <>
          <Card
            title="Thông tin chung"
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu" span={1}>
                {selectedImport.id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedImport.status === "Pending"
                      ? "warning"
                      : selectedImport.status === "Completed"
                      ? "success"
                      : selectedImport.status === "Stocked"
                      ? "processing"
                      : "default"
                  }
                >
                  {selectedImport.status === "Pending"
                    ? "Chờ nhận hàng"
                    : selectedImport.status === "Completed"
                    ? "Đã nhận hàng"
                    : selectedImport.status === "Stocked"
                    ? "Đã nhập kho"
                    : selectedImport.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Nhà cung cấp">
                {selectedImport.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {selectedImport.createByName}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {moment(selectedImport.createTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhận dự kiến">
                {moment(selectedImport.expectedDeliveryTime).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>

              {selectedImport.deliveryTime && (
                <Descriptions.Item label="Ngày nhận thực tế">
                  {moment(selectedImport.deliveryTime).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {selectedImport.stockTime && (
                <Descriptions.Item label="Ngày nhập kho">
                  {moment(selectedImport.stockTime).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card
            title="Thông tin thanh toán"
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Tổng tiền hàng"
                  value={selectedImport.totalPrice}
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#cf1322" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đã đặt cọc"
                  value={selectedImport.deposit}
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Còn phải trả"
                  value={selectedImport.totalPrice - selectedImport.deposit}
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="Chi tiết đơn hàng" bordered={false}>
            <Table
              dataSource={selectedImport.details}
              columns={[
                {
                  title: "Tên thuốc",
                  dataIndex: "medicineName",
                  key: "medicineName",
                },
                {
                  title: "Loại",
                  dataIndex: "isVaccine",
                  key: "isVaccine",
                  render: (isVaccine) => (
                    <Tag color={isVaccine ? "blue" : "green"}>
                      {isVaccine ? "Vaccine" : "Thuốc"}
                    </Tag>
                  ),
                },
                {
                  title: "Đơn vị",
                  dataIndex: "unit",
                  key: "unit",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  render: (price) => `${price.toLocaleString()}đ`,
                },
                {
                  title: "Số lượng yêu cầu",
                  dataIndex: "expectedQuantity",
                  key: "expectedQuantity",
                },
                {
                  title: "Số lượng thực tế",
                  dataIndex: "actualQuantity",
                  key: "actualQuantity",
                },
                {
                  title: "Số lượng từ chối",
                  dataIndex: "rejectQuantity",
                  key: "rejectQuantity",
                  render: (value) => <Text type="danger">{value}</Text>,
                },
                {
                  title: "Số lượng nhận",
                  dataIndex: "receivedQuantity",
                  key: "receivedQuantity",
                  render: (value) => <Text type="success">{value}</Text>,
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  render: (_, record) =>
                    `${(
                      record.unitPrice * record.receivedQuantity
                    ).toLocaleString()}đ`,
                },
              ]}
              pagination={false}
              summary={(pageData) => {
                const totalAmount = pageData.reduce(
                  (sum, item) => sum + item.unitPrice * item.receivedQuantity,
                  0
                );
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={8}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{totalAmount.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </>
      )}
    </Modal>
  );

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

  const handleDeliveryConfirm = async () => {
    try {
      await axios.post(
        `${API_URL}/api/MedicineImports/${selectedDelivery.id}/delivery`,
        {
          deliveryTime: deliveryDate.toISOString(),
          details: deliveryDetails.map((detail) => ({
            medicineId: detail.medicineId,
            acceptedQuantity: detail.actualQuantity,
            receivedQuantity: detail.receivedQuantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Giao hàng thành công");
      setShowDeliveryModal(false);
      setShowConfirmModal(true);
      getMedicineImports();
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi xác nhận giao hàng");
    }
  };

  const handleStock = async (id) => {
    try {
      await axios.post(
        `${API_URL}/api/MedicineImports/${id}/stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Nhập kho thành công");
      getMedicineImports();
    } catch (error) {
      message.error("Lỗi khi nhập kho");
    }
  };

  return (
    <div className="medicine-import-page" style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng số phiếu</Text>}
              value={medicineImports.length}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Đã nhận hàng</Text>}
              value={
                medicineImports.filter((r) => r.status === "Completed").length
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Chờ nhận hàng</Text>}
              value={
                medicineImports.filter((r) => r.status === "Pending").length
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng sản phẩm</Text>}
              value={medicineImports.reduce(
                (total, imp) => total + (imp.details?.length || 0),
                0
              )}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#eb2f96", fontSize: 24 }}
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
          dataSource={medicineImports}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phiếu nhập`,
          }}
        />
      </Card>

      {renderDetailModal()}

      <Drawer
        title="Bộ lọc nâng cao"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={300}
      >
        <Form layout="vertical">
          <Form.Item label="Trạng thái">
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value })}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="Pending">
                <Badge status="warning" text="Chờ nhận hàng" />
              </Select.Option>
              <Select.Option value="Completed">
                <Badge status="success" text="Đã nhận hàng" />
              </Select.Option>
              <Select.Option value="Cancelled">
                <Badge status="error" text="Đã hủy" />
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Khoảng thời gian">
            <DatePicker.RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange({ dateRange: dates })}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Xác nhận giao hàng</span>
          </Space>
        }
        open={showDeliveryModal}
        onOk={handleDeliveryConfirm}
        onCancel={() => setShowDeliveryModal(false)}
        width={800}
      >
        {selectedDelivery && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu">
                {selectedDelivery.id}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">
                {selectedDelivery.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedDelivery.createTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày dự kiến">
                {moment(selectedDelivery.expectedDeliveryTime).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Đặt cọc">
                {selectedDelivery.deposit.toLocaleString()}đ
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao hàng">
                <DatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 16 }}
              dataSource={deliveryDetails}
              columns={[
                {
                  title: "Tên thuốc",
                  dataIndex: "medicineName",
                },
                {
                  title: "Số lượng yêu cầu",
                  dataIndex: "expectedQuantity",
                },
                {
                  title: "Số lượng thực tế",
                  dataIndex: "actualQuantity",
                  render: (_, record, index) => (
                    <InputNumber
                      min={0}
                      value={record.actualQuantity}
                      onChange={(value) => {
                        const newDetails = [...deliveryDetails];
                        newDetails[index].actualQuantity = value;
                        setDeliveryDetails(newDetails);
                      }}
                    />
                  ),
                },
                {
                  title: "Số lượng nhận",
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
                      }}
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
                    {selectedDelivery.deposit.toLocaleString()}đ
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
                      ) - selectedDelivery.deposit
                    ).toLocaleString()}
                    đ
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24 }}>
                <Text type="secondary">
                  * Số tiền còn lại cần thanh toán cho nhà cung cấp{" "}
                  <Text strong>{selectedDelivery.supplierName}</Text>
                </Text>
              </div>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MedicineImportList;
