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
  Spin,
} from "antd";
import {
  FilterOutlined,
  CheckCircleOutlined,
  ImportOutlined,
  FilePdfOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

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
  <Tooltip
    title={
      disabled
        ? config.key === "check"
          ? "Yêu cầu chưa được xác nhận"
          : "Heo chưa được giao"
        : config.text
    }
  >
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
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {config.text}
    </Button>
  </Tooltip>
);

const ImportRequestManagement = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isCheckModalVisible, setIsCheckModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const [form] = Form.useForm();
  const [checkForm] = Form.useForm();

  // Thêm state cho suppliers
  const [suppliers, setSuppliers] = useState([]);

  // Thêm state để quản lý modal payment
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  // Thêm state để lưu areaId của khu A
  const AREA_A_ID = "KV001"; // ID của khu vực A - cần thay đổi theo ID thực tế của bạn

  // Thêm state để lưu thông tin khu vực A
  const [areaA, setAreaA] = useState(null);

  // Thêm state cho modal chi tiết
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Thêm useEffect để fetch khu vực A khi component mount
  useEffect(() => {
    fetchAreaA();
  }, []);

  // Thêm hàm fetch khu vực A
  const fetchAreaA = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Areas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const areaAData = response.data.data.items[0];
      if (!areaAData) {
        message.error("Không tìm thấy khu vực A!");
        return;
      }

      setAreaA(areaAData);
    } catch (error) {
      console.error("Error fetching area A:", error);
      message.error("Không thể tải thông tin khu vực A!");
    }
  };

  // Thêm hàm fetchSuppliers
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers?type=pig`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const items = response.data?.data?.items || [];

      // Chỉ lấy suppliers có type là pig
      const pigSuppliers = items.filter(
        (supplier) => supplier.typeSuppier?.toLowerCase() === "pig"
      );

      // Format data cho filter
      const formattedSuppliers = pigSuppliers.map((supplier) => ({
        text: supplier.name,
        value: supplier.id,
      }));

      setSuppliers(formattedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  // Thêm useEffect để load suppliers khi component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Xử lý filter
  const handleFilterChange = (values) => {
    setFilters(values);
    // Thực hiện filter dữ liệu theo values
  };

  // Memoized Values

  const getStatusTag = (record) => {
    if (!record) return null;

    if (record.stokeDate) {
      return <Tag color="success">Đã nhập kho</Tag>;
    }
    if (record.deliveryDate) {
      return <Tag color="processing">Đã giao hàng</Tag>;
    }
    if (record.approvedTime) {
      return <Tag color="warning">Đã chấp thuận</Tag>;
    }
    return <Tag color="default">Chờ duyệt</Tag>;
  };

  // Định nghĩa handleCheck trước
  const handleCheck = useCallback(async (request) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/${request.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSelectedRequest({
        ...request,
        detailInfo: response.data.data,
      });

      // Reset form và set initial values
      checkForm.setFieldsValue({
        receivedQuantity: request.quantity || 0,
        acceptedQuantity: request.quantity || 0,
        deliveryDate: null,
      });

      setIsCheckModalVisible(true);
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Không thể tải thông tin chi tiết!");
    }
  }, []);

  // Sửa lại hàm handleImport
  const handleImport = useCallback(
    async (record) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!areaA?.id) {
        message.error("Không tìm thấy thông tin khu vực A!");
        return;
      }

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/Allocate`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              AreasId: areaA.id,
              pigIntakeId: record.id,
            },
          }
        );

        message.success("Phân bổ heo vào khu vực A thành công!");
        setIsImportModalVisible(false);
        fetchData(tableParams);
      } catch (error) {
        console.error("Error allocating pigs:", error);
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else if (error.response?.status === 400) {
          message.error(
            error.response?.data?.message ||
              "Khu vực A đã đầy hoặc không thể nhập thêm heo!"
          );
        } else {
          message.error("Có lỗi xảy ra khi phân bổ heo!");
        }
      }
    },
    [areaA, tableParams]
  );

  // Sau đó mới định nghĩa columns với useMemo
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
        filters: suppliers,
        filterMode: "tree",
        filterSearch: true,
        onFilter: (value, record) => record.supplier === value,
        render: (supplier) => supplier || "N/A",
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
        key: "status",
        width: 150,
        render: (_, record) => getStatusTag(record),
      },
      {
        title: "Thao tác",
        key: "action",
        fixed: "right",
        width: 200,
        render: (_, record) => {
          const canCheck = record.approvedTime && !record.deliveryDate;
          const canImport = record.deliveryDate && !record.stokeDate;

          return (
            <Space>
              {canCheck && (
                <ActionButton
                  config={ACTION_CONFIG.check}
                  onClick={() => handleCheck(record)}
                />
              )}

              {canImport && (
                <ActionButton
                  config={ACTION_CONFIG.import}
                  onClick={() => handleImport(record)}
                />
              )}

              <Tooltip title="Xem chi tiết">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                />
              </Tooltip>
            </Space>
          );
        },
      },
    ],
    [handleCheck, handleImport]
  );

  // Sửa lại hàm handleFinalCheckSubmit
  const handleFinalCheckSubmit = useCallback(async () => {
    try {
      const values = await checkForm.validateFields();

      // Tính toán các thông tin thanh toán
      const totalAmount = values.acceptedQuantity * selectedRequest.pricePerPig;
      const deposit = selectedRequest.deposit || 0;
      const remainingAmount = totalAmount - deposit;

      // Lưu thông tin thanh toán
      setPaymentInfo({
        receivedQuantity: values.receivedQuantity,
        acceptedQuantity: values.acceptedQuantity,
        pricePerPig: selectedRequest.pricePerPig,
        totalAmount: totalAmount,
        deposit: deposit,
        remainingAmount: remainingAmount,
        deliveryDate: values.deliveryDate,
      });

      // Hiển thị modal thanh toán
      setIsPaymentModalVisible(true);
    } catch (error) {
      console.error("Error calculating payment:", error);
      message.error("Vui lòng điền đầy đủ thông tin!");
    }
  }, [selectedRequest, checkForm]);

  // Thêm hàm xử lý xác nhận thanh toán
  const handlePaymentConfirm = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes?id=${
          selectedRequest.id
        }`,
        {
          deliveryDate: paymentInfo.deliveryDate.toISOString(),
          receivedQuantity: paymentInfo.receivedQuantity,
          acceptedQuantity: paymentInfo.acceptedQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Kiểm tra và xác nhận thanh toán thành công!");
      setIsPaymentModalVisible(false);
      setIsCheckModalVisible(false);
      checkForm.resetFields();
      fetchData(tableParams);
    } catch (error) {
      console.error("Error submitting delivery:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!"
      );
    }
  };

  // Thêm component modal thanh toán
  const renderPaymentModal = () => (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <Text strong>Xác nhận thông tin thanh toán</Text>
        </Space>
      }
      open={isPaymentModalVisible}
      onCancel={() => setIsPaymentModalVisible(false)}
      onOk={handlePaymentConfirm}
      width={600}
    >
      {paymentInfo && (
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Số lượng nhận">
              {paymentInfo.receivedQuantity} con
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng chấp nhận">
              {paymentInfo.acceptedQuantity} con
            </Descriptions.Item>
            <Descriptions.Item label="Đơn giá">
              {paymentInfo.pricePerPig?.toLocaleString("vi-VN")} VNĐ/con
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <Text strong>
                {paymentInfo.totalAmount?.toLocaleString("vi-VN")} VNĐ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền cọc">
              <Text type="success">
                {paymentInfo.deposit?.toLocaleString("vi-VN")} VNĐ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Còn lại phải trả">
              <Text type="danger" strong>
                {paymentInfo.remainingAmount?.toLocaleString("vi-VN")} VNĐ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày giao">
              {paymentInfo.deliveryDate?.format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>

          <Alert
            style={{ marginTop: 16 }}
            message="Xác nhận thông tin thanh toán"
            description="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
            type="info"
            showIcon
          />
        </div>
      )}
    </Modal>
  );

  const calculateTotalAmount = () => {
    const quantity = form.getFieldValue("acceptedQuantity") || 0;
    const price = selectedRequest?.pricePerPig || 0;
    return quantity * price;
  };

  // Table change handler
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    fetchData({
      pageSize: pagination.pageSize,
      current: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      supplier: filters.supplier?.[0],
      ...filters,
    });
  }, []);

  // Fetch data function (mock)
  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            pageSize: params.pageSize || PAGE_SIZE,
            pageIndex: params.current || 1,
          },
        }
      );
      console.log(response);
      const items = response.data?.data?.items || [];

      const formattedRequests = items.map((request) => ({
        id: request.id || "",
        requestCode: request.code || "",
        requestDate: request.createdTime || null,
        quantity: request.expectedQuantity || 0,
        // Đảm bảo các trường thời gian luôn có giá trị (null nếu không có)
        approvedTime: request.approvedTime || null,
        deliveryDate: request.deliveryDate || null,
        stokeDate: request.stokeDate || null,
        pricePerPig: request.unitPrice || 0,
        notes: request.note || "",
        supplier: request.suppliersName || "Chưa xác nhận",
        createdBy: request.createdBy || "",
        deposit: request.deposit || 0,
        // Thêm các trường khác nếu cần
      }));

      setRequests(formattedRequests);
      setTableParams({
        ...tableParams,
        pagination: {
          ...params,
          total: response.data.data.totalCount || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(tableParams);
  }, []);

  // Thêm handler cho view detail
  const handleViewDetail = async (record) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setDetailData(response.data.data);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      message.error("Không thể tải thông tin chi tiết!");
    }
  };

  // Thêm component modal chi tiết
  const renderViewModal = () => (
    <Modal
      title={
        <Space>
          <EyeOutlined style={{ color: "#1890ff" }} />
          <Text strong>Chi tiết yêu cầu nhập heo</Text>
        </Space>
      }
      open={isViewModalVisible}
      onCancel={() => {
        setIsViewModalVisible(false);
        setDetailData(null);
      }}
      footer={[
        <Button key="close" onClick={() => setIsViewModalVisible(false)}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {detailData ? (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã yêu cầu">
            {detailData.id || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Nhà cung cấp">
            {detailData.suppliersName || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Số lượng dự kiến">
            {detailData.expectedQuantity || 0} con
          </Descriptions.Item>

          <Descriptions.Item label="Đơn giá">
            {detailData.unitPrice?.toLocaleString("vi-VN")} VNĐ/con
          </Descriptions.Item>

          <Descriptions.Item label="Tiền cọc">
            {detailData.deposit?.toLocaleString("vi-VN")} VNĐ
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {getStatusTag({
              approvedTime: detailData.approvedTime,
              deliveryDate: detailData.deliveryDate,
              stokeDate: detailData.stokeDate,
            })}
          </Descriptions.Item>

          {detailData.approvedTime && (
            <Descriptions.Item label="Thời gian xác nhận">
              {dayjs(detailData.approvedTime).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
          )}

          {detailData.deliveryDate && (
            <>
              <Descriptions.Item label="Thời gian giao hàng">
                {dayjs(detailData.deliveryDate).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng nhận">
                {detailData.receivedQuantity || 0} con
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng chấp nhận">
                {detailData.acceptedQuantity || 0} con
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng từ chối">
                {detailData.rejectedQuantity || 0} con
              </Descriptions.Item>
            </>
          )}

          {detailData.stokeDate && (
            <>
              <Descriptions.Item label="Thời gian nhập kho">
                {dayjs(detailData.stokeDate).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực">
                {detailData.areasName || "N/A"}
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="Người tạo">
            {detailData.createdBy || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian tạo">
            {dayjs(detailData.createTime).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>

          {detailData.note && (
            <Descriptions.Item label="Ghi chú">
              {detailData.note}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      )}
    </Modal>
  );

  // Render Methods
  const renderCheckModal = () => (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#1890ff" }} />
          <Text strong>Kiểm tra heo nhập</Text>
        </Space>
      }
      open={isCheckModalVisible}
      onCancel={() => {
        setIsCheckModalVisible(false);
        setIsShowPayment(false);
        checkForm.resetFields();
      }}
      onOk={handleFinalCheckSubmit}
      width={700}
    >
      <Form
        form={checkForm}
        layout="vertical"
        initialValues={{
          receivedQuantity: selectedRequest?.quantity || 0,
          acceptedQuantity: selectedRequest?.quantity || 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="receivedQuantity"
              label="Số lượng nhận"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng nhận" },
                { type: "number", min: 0, message: "Số lượng không được âm" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập số lượng nhận"
                onChange={(value) => {
                  // Tự động cập nhật số lượng chấp nhận không vượt quá số lượng nhận
                  const acceptedQuantity =
                    checkForm.getFieldValue("acceptedQuantity");
                  if (acceptedQuantity > value) {
                    checkForm.setFieldsValue({ acceptedQuantity: value });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="acceptedQuantity"
              label="Số lượng chấp nhận"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng chấp nhận" },
                { type: "number", min: 0, message: "Số lượng không được âm" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value > getFieldValue("receivedQuantity")) {
                      return Promise.reject(
                        "Số lượng chấp nhận không được lớn hơn số lượng nhận"
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập số lượng chấp nhận"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="deliveryDate"
          label="Ngày giao hàng"
          rules={[{ required: true, message: "Vui lòng chọn ngày giao hàng" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm:ss"
            placeholder="Chọn ngày giờ giao hàng"
          />
        </Form.Item>
      </Form>
    </Modal>
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
      onCancel={() => setIsImportModalVisible(false)}
      onOk={() => handleImport(selectedRequest)}
      okText="Xác nhận nhập kho"
      cancelText="Hủy"
      width={500}
      okButtonProps={{
        disabled: !areaA?.id,
      }}
    >
      {!areaA ? (
        <Alert
          message="Không tìm thấy khu vực A"
          description="Vui lòng kiểm tra lại cấu hình khu vực."
          type="error"
          showIcon
        />
      ) : (
        <Alert
          message="Xác nhận nhập heo vào khu vực A"
          description={
            <div>
              <p>Thông tin nhập kho:</p>
              <ul>
                <li>Khu vực: {areaA.name}</li>
                <li>Mã khu vực: {areaA.code}</li>
                <li>Số lượng: {selectedRequest?.acceptedQuantity || 0} con</li>
                <li>Nhà cung cấp: {selectedRequest?.supplier || "N/A"}</li>
              </ul>
              <p>Lưu ý: Heo sẽ được tự động nhập vào khu vực A.</p>
            </div>
          }
          type="info"
          showIcon
        />
      )}
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
        {renderPaymentModal()}
        {renderViewModal()}
        {renderImportModal()}
      </Card>
    </motion.div>
  );
};

export default React.memo(ImportRequestManagement);
