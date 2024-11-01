import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Typography,
  Row,
  Col,
  Alert,
  Divider,
  Tooltip,
  Dropdown,
  Menu,
  Descriptions,
} from "antd";
import {
  FilterOutlined,
  CheckCircleOutlined,
  ImportOutlined,
  FilePdfOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Constants
const PAGE_SIZE = 10;
const ANIMATION_DURATION = 0.3;

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Thêm config cho actions
const ACTION_CONFIG = {
  check: {
    key: "check",
    text: "Kiểm tra",
    icon: <CheckCircleOutlined />,
    type: "primary",
    color: "#1890ff",
  },
  import: {
    key: "import",
    text: "Nhập heo",
    icon: <ImportOutlined />,
    type: "default",
    color: "#52c41a",
  },
  viewDetail: {
    key: "viewDetail",
    text: "Xem chi tiết",
    icon: <EyeOutlined />,
    type: "link",
    color: "#666666",
  },
};

const ActionButton = ({ config, onClick, disabled }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{ display: "inline-block" }}
  >
    <Tooltip title={config.text}>
      <Button
        type={config.type}
        icon={config.icon}
        onClick={onClick}
        disabled={disabled}
        style={{
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {config.text}
      </Button>
    </Tooltip>
  </motion.div>
);

const ImportRequestManagement = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isCheckModalVisible, setIsCheckModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [checkForm] = Form.useForm();

  // Pagination & Sorting states
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: PAGE_SIZE,
    },
    sortField: null,
    sortOrder: null,
    filters: {},
  });

  // Giả lập dữ liệu phiếu yêu cầu
  const fakeRequests = [
    {
      id: "PYC001",
      requestDate: "2024-03-20",
      quantity: 5,
      status: "pending",
      pricePerPig: 8500000,
      notes: "Heo đực giống từ trại A",
      supplier: "Công ty A",
      createdBy: "Nguyễn Văn A",
    },
    // Thêm dữ liệu mẫu khác...
  ];

  // Danh sách nhà cung cấp để filter
  const suppliers = ["Công ty A", "Công ty B", "Công ty C"];

  // Xử lý filter
  const handleFilterChange = (values) => {
    setFilters(values);
    // Thực hiện filter dữ liệu theo values
  };

  // Memoized Values
  const statusConfig = useMemo(
    () => ({
      pending: { color: "processing", text: "Chờ nhập" },
      completed: { color: "success", text: "Đã nhập" },
      cancelled: { color: "error", text: "Đã hủy" },
    }),
    []
  );

  const columns = useMemo(
    () => [
      {
        title: "Mã phiếu",
        dataIndex: "id",
        key: "id",
        width: 120,
      },
      {
        title: "Ngày yêu cầu",
        dataIndex: "requestDate",
        key: "requestDate",
        width: 120,
        render: (date) => dayjs(date).format("DD/MM/YYYY"),
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "supplier",
        key: "supplier",
        width: 200,
        filterSearch: true,
        filters: suppliers.map((s) => ({ text: s, value: s })),
        onFilter: (value, record) => record.supplier === value,
      },
      {
        title: "Số lượng yêu cầu",
        dataIndex: "quantity",
        key: "quantity",
        width: 150,
        render: (quantity) => <Text strong>{quantity} con</Text>,
      },
      {
        title: "Đơn giá",
        dataIndex: "pricePerPig",
        key: "pricePerPig",
        width: 150,
        render: (price) => (
          <Text type="success" strong>
            {price.toLocaleString()} VNĐ/con
          </Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        filters: [
          { text: "Chờ nhập", value: "pending" },
          { text: "Đã nhập", value: "completed" },
          { text: "Đã hủy", value: "cancelled" },
        ],
        onFilter: (value, record) => record.status === value,
        render: (status) => {
          return (
            <Tag color={statusConfig[status].color}>
              {statusConfig[status].text}
            </Tag>
          );
        },
      },
      {
        title: "Thao tác",
        key: "action",
        width: 250,
        fixed: "right",
        render: (_, record) => {
          const isChecked = !!record.checkInfo;
          const isPending = record.status === "pending";

          return (
            <Space size="small" split={<Divider type="vertical" />}>
              <ActionButton
                config={ACTION_CONFIG.check}
                onClick={() => handleCheck(record)}
                disabled={!isPending}
              />

              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="import"
                      icon={ACTION_CONFIG.import.icon}
                      disabled={!isChecked || !isPending}
                      onClick={() => handleImport(record)}
                    >
                      {ACTION_CONFIG.import.text}
                    </Menu.Item>
                    <Menu.Item
                      key="viewDetail"
                      icon={ACTION_CONFIG.viewDetail.icon}
                      onClick={() => handleViewDetail(record)}
                    >
                      {ACTION_CONFIG.viewDetail.text}
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  style={{ borderRadius: "6px" }}
                />
              </Dropdown>
            </Space>
          );
        },
      },
    ],
    []
  );

  // Handlers
  const handleCheck = useCallback((request) => {
    setSelectedRequest(request);
    setIsCheckModalVisible(true);
  }, []);

  const handleImport = useCallback((record) => {
    setSelectedRequest(record);
    setIsImportModalVisible(true);
  }, []);

  const handleFirstStepSubmit = async () => {
    try {
      await checkForm.validateFields();
      setIsShowPayment(true);
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin!");
    }
  };

  const handleFinalCheckSubmit = useCallback(() => {
    const formValues = checkForm.getFieldsValue();
    setSelectedRequest((prev) => ({
      ...prev,
      checkInfo: {
        ...formValues,
        checkedAt: dayjs(),
      },
    }));

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              checkInfo: {
                ...formValues,
                checkedAt: dayjs(),
              },
            }
          : req
      )
    );

    setIsCheckModalVisible(false);
    setIsShowPayment(false);
    checkForm.resetFields();
    message.success("Kiểm tra thành công!");
  }, [selectedRequest, checkForm]);

  const handleImportSubmit = () => {
    // Cập nhật trạng thái thành completed
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: "completed" } : req
      )
    );
    setIsImportModalVisible(false);
    message.success("Nhập heo thành công!");
  };

  const calculateTotalAmount = () => {
    const quantity = checkForm.getFieldValue("acceptedQuantity") || 0;
    const price = selectedRequest?.pricePerPig || 0;
    return quantity * price;
  };

  const calculateRemainingAmount = () => {
    const total = calculateTotalAmount();
    const deposit = selectedRequest?.deposit || 0;
    return total - deposit;
  };

  // Table change handler
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // Nếu có API, bạn có thể gọi API ở đây
    setLoading(true);
    fetchData({
      pageSize: pagination.pageSize,
      current: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Fetch data function (mock)
  const fetchData = async (params = {}) => {
    try {
      // Mock API call
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve(fakeRequests), 500)
      );
      setRequests(response);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu!");
      console.error("Error fetching data:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(tableParams);
  }, []);

  // Thêm handler cho view detail
  const handleViewDetail = useCallback(
    (record) => {
      Modal.info({
        title: "Chi tiết phiếu yêu cầu",
        content: (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Mã phiếu">
                {record.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {dayjs(record.requestDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">
                {record.supplier}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {record.quantity} con
              </Descriptions.Item>
              <Descriptions.Item label="Đơn giá">
                {record.pricePerPig.toLocaleString()} VNĐ/con
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConfig[record.status].color}>
                  {statusConfig[record.status].text}
                </Tag>
              </Descriptions.Item>
              {record.checkInfo && (
                <>
                  <Descriptions.Item label="Ngày kiểm tra">
                    {dayjs(record.checkInfo.checkedAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng chấp nhận">
                    {record.checkInfo.acceptedQuantity} con
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </motion.div>
        ),
        width: 600,
        icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
        okText: "Đóng",
      });
    },
    [statusConfig]
  );

  // Render Methods
  const renderCheckModal = () => (
    <AnimatePresence>
      {isCheckModalVisible && (
        <Modal
          title={
            <Space>
              <CheckCircleOutlined style={{ color: "#1890ff" }} />
              <Text strong>
                {isShowPayment ? "Xác nhận thanh toán" : "Kiểm tra heo"}
              </Text>
            </Space>
          }
          open={isCheckModalVisible}
          onCancel={() => {
            setIsCheckModalVisible(false);
            setIsShowPayment(false);
            checkForm.resetFields();
          }}
          footer={
            isShowPayment ? (
              <Space>
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button onClick={() => setIsShowPayment(false)}>
                    Quay lại
                  </Button>
                </motion.div>
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button type="primary" onClick={handleFinalCheckSubmit}>
                    Xác nhận
                  </Button>
                </motion.div>
              </Space>
            ) : (
              <Space>
                <Button
                  onClick={() => {
                    setIsCheckModalVisible(false);
                    setIsShowPayment(false);
                    checkForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" onClick={handleFirstStepSubmit}>
                  Tiếp theo
                </Button>
              </Space>
            )
          }
          width={700}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: ANIMATION_DURATION }}
          >
            {!isShowPayment ? (
              <Form form={checkForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="supplierQuantity"
                      label={<Text strong>Số lượng nhà cung cấp giao</Text>}
                      rules={[
                        { required: true, message: "Vui lòng nhập số lượng" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        placeholder="Nhập số lượng"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="acceptedQuantity"
                      label={<Text strong>Số lượng chấp nhận</Text>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số lượng chấp nhận",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        placeholder="Nhập số lượng chấp nhận"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="deliveryDate"
                  label={<Text strong>Ngày giao hàng</Text>}
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày giao hàng" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày giao hàng"
                  />
                </Form.Item>

                <Form.Item name="notes" label={<Text strong>Ghi chú</Text>}>
                  <TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
                </Form.Item>
              </Form>
            ) : (
              <Card bordered={false}>
                <Alert
                  message="Thông tin kiểm tra"
                  description={
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text>
                        Số lượng giao:{" "}
                        <Text strong>
                          {checkForm.getFieldValue("supplierQuantity")} con
                        </Text>
                      </Text>
                      <Text>
                        Số lượng chấp nhận:{" "}
                        <Text strong>
                          {checkForm.getFieldValue("acceptedQuantity")} con
                        </Text>
                      </Text>
                      <Text>
                        Ngày giao:{" "}
                        <Text strong>
                          {checkForm
                            .getFieldValue("deliveryDate")
                            ?.format("DD/MM/YYYY")}
                        </Text>
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card
                  size="small"
                  title={<Text strong>Chi tiết thanh toán</Text>}
                >
                  <Row gutter={[0, 16]}>
                    <Col span={24}>
                      <Space
                        direction="horizontal"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Tổng tiền:</Text>
                        <Text strong>
                          {calculateTotalAmount().toLocaleString()} VNĐ
                        </Text>
                      </Space>
                    </Col>

                    <Col span={24}>
                      <Space
                        direction="horizontal"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Đã cọc:</Text>
                        <Text strong type="success">
                          {(selectedRequest?.deposit || 0).toLocaleString()} VNĐ
                        </Text>
                      </Space>
                    </Col>

                    <Col span={24}>
                      <Divider style={{ margin: "12px 0" }} />
                      <Space
                        direction="horizontal"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong type="danger">
                          Số tiền còn lại:
                        </Text>
                        <Text strong type="danger" style={{ fontSize: "16px" }}>
                          {calculateRemainingAmount().toLocaleString()} VNĐ
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Card>
            )}
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );

  const renderImportModal = () => (
    <Modal
      title={
        <Space>
          <ImportOutlined style={{ color: "#52c41a" }} />
          <Text strong>Nhập heo vào chuồng</Text>
        </Space>
      }
      open={isImportModalVisible}
      footer={
        <Space>
          <Button onClick={() => setIsImportModalVisible(false)}>Đóng</Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => message.info("Tính năng xuất PDF đang phát triển")}
          >
            Xuất PDF
          </Button>
        </Space>
      }
      onCancel={() => setIsImportModalVisible(false)}
      width={500}
    >
      <Alert
        message="Xác nhận nhập heo thành công!"
        description="Bạn có thể xuất file PDF hoặc đóng cửa sổ này."
        type="success"
        showIcon
      />
    </Modal>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: ANIMATION_DURATION }}
    >
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý phiếu yêu cầu nhập heo
              </Title>
            </Col>
            <Col>
              <Space size="middle">
                <RangePicker
                  onChange={(dates) =>
                    handleFilterChange({ ...filters, dateRange: dates })
                  }
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFilters({})}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            ...tableParams.pagination,
            total: requests.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} phiếu`,
          }}
          onChange={handleTableChange}
        />

        {renderCheckModal()}
        {renderImportModal()}
      </Card>
    </motion.div>
  );
};

export default React.memo(ImportRequestManagement);
