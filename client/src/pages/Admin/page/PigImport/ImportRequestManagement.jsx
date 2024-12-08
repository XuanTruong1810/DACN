/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
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
  Tooltip,
  Descriptions,
  Spin,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  ImportOutlined,
  FilePdfOutlined,
  EyeOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;

const PAGE_SIZE = 10;
const ANIMATION_DURATION = 0.3;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

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
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // eslint-disable-next-line no-unused-vars
  const [form] = Form.useForm();
  const [checkForm] = Form.useForm();

  const [suppliers, setSuppliers] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const [areaA, setAreaA] = useState(null);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [allocationResult, setAllocationResult] = useState(null);
  const [isAllocationModalVisible, setIsAllocationModalVisible] =
    useState(false);

  const [allocatedPigs, setAllocatedPigs] = useState(null);
  const [isAllocatedListVisible, setIsAllocatedListVisible] = useState(false);

  const [statistics, setStatistics] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    importedRequests: 0,
  });

  useEffect(() => {
    fetchAreaA();
  }, []);

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
      const pigSuppliers = items.filter(
        (supplier) => supplier.typeSuppier?.toLowerCase() === "pig"
      );

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

  useEffect(() => {
    fetchSuppliers();
  }, []);

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

      // Reset form và set initial values với ngày hiện tại
      checkForm.setFieldsValue({
        receivedQuantity: request.quantity || 0,
        acceptedQuantity: request.quantity || 0,
        deliveryDate: dayjs(), // Set ngày giao hàng mặc định là ngày hiện tại
      });

      setIsCheckModalVisible(true);
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Không thể tải thông tin chi tiết!");
    }
  }, []);

  const handleImport = useCallback(
    async (record) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!areaA?.id) {
        message.error("Không tìm thấy thông tin khu vực A!");
        return;
      }

      try {
        const response = await axios.post(
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

        setAllocatedPigs(response.data.data);
        setIsAllocatedListVisible(true);

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

  const columns = useMemo(
    () => [
      {
        title: "Mã phiếu",
        dataIndex: "id",
        key: "id",
        width: 120,
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Tìm mã phiếu"
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => confirm()}
              style={{ width: 188, marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Tìm
              </Button>
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 90 }}
              >
                Đặt lại
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
          record.id.toLowerCase().includes(value.toLowerCase()),
      },
      {
        title: "Ngày yêu cầu",
        dataIndex: "requestDate",
        key: "requestDate",
        width: 120,
        render: (date) => dayjs(date).format("DD/MM/YYYY"),
        sorter: (a, b) =>
          dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
        defaultSortOrder: "descend",
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "supplier",
        key: "supplier",
        width: 200,
        filters: suppliers.map((supplier) => ({
          text: supplier.text,
          value: supplier.text,
        })),
        filterMode: "tree",
        filterSearch: true,
        onFilter: (value, record) => {
          return record.supplier?.toLowerCase() === value?.toLowerCase();
        },
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
        title: "Người yêu cầu",
        dataIndex: "createdByName",
        key: "createdByName",
        width: 150,
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Tìm người yêu cầu"
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => confirm()}
              style={{ width: 188, marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Tìm
              </Button>
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 90 }}
              >
                Đặt lại
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
          record.createdByName?.toLowerCase().includes(value.toLowerCase()),
        render: (text) => <Text>{text || "N/A"}</Text>,
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 150,
        filters: [
          { text: "Chờ duyệt", value: "pending" },
          { text: "Đã xác nhận", value: "approved" },
          { text: "Đã giao", value: "delivered" },
        ],
        onFilter: (value, record) => {
          switch (value) {
            case "pending":
              return (
                !record.approvedTime &&
                !record.deliveryDate &&
                !record.stokeDate
              );
            case "approved":
              return record.approvedTime && !record.deliveryDate;
            case "delivered":
              return record.deliveryDate && !record.stokeDate;
            case "imported":
              return record.stokeDate;
            default:
              return true;
          }
        },
        render: (_, record) => {
          if (record.stokeDate) {
            return <Tag color="success">Đã nhập kho</Tag>;
          }
          if (record.deliveryDate) {
            return <Tag color="processing">Đã giao</Tag>;
          }
          if (record.approvedTime) {
            return <Tag color="warning">Đã xác nhận</Tag>;
          }
          return <Tag color="default">Chờ duyệt</Tag>;
        },
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

  // Sửa lại hàm xử lý khi submit form kiểm tra
  const handleCheckSubmit = async (values) => {
    try {
      setLoading(true);

      // 1. Gọi API Patch để ghi nhận giao hàng
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`,
        {
          deliveryDate: values.deliveryDate.toISOString(),
          receivedQuantity: values.receivedQuantity,
          acceptedQuantity: values.acceptedQuantity,
        },
        {
          params: { id: selectedRequest.id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 2. Gọi API Allocate và lưu kết quả
      const allocateResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/Allocate`,
        null,
        {
          params: {
            AreasId: areaA?.id,
            pigIntakeId: selectedRequest.id,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAllocatedPigs(allocateResponse.data.data);
      setIsAllocatedListVisible(true);

      message.success("Kiểm tra giao hàng và nhập kho thành công!");
      setIsCheckModalVisible(false);
      checkForm.resetFields();
      fetchData(tableParams);
    } catch (error) {
      console.error("Error:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/${
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

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/PigIntakes/Allocate?pigIntakeId=${selectedRequest.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);

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

  const calculateStatistics = (data) => {
    const stats = {
      totalRequests: data.length,
      pendingRequests: 0,
      approvedRequests: 0,
      importedRequests: 0,
    };

    data.forEach((request) => {
      if (request.stokeDate) {
        stats.importedRequests++;
      } else if (request.approvedTime) {
        stats.approvedRequests++;
      } else {
        stats.pendingRequests++;
      }
    });

    setStatistics(stats);
  };

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
      console.log("API Response:", response.data);

      const items = response.data?.data || [];

      const formattedRequests = items.map((request) => ({
        id: request.id || "",
        requestCode: request.code || "",
        requestDate: request.createdTime || null,
        quantity: request.expectedQuantity || 0,

        approvedTime: request.approvedTime || null,
        deliveryDate: request.deliveryDate || null,
        stokeDate: request.stokeDate || null,
        pricePerPig: request.unitPrice || 0,
        notes: request.note || "",
        supplier: request.suppliersName || "Chưa xác nhận",
        createdBy: request.createdBy || "",
        deposit: request.deposit || 0,
        createdByName: request.createByName || "N/A",
      }));

      setRequests(formattedRequests);
      calculateStatistics(formattedRequests);
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

  useEffect(() => {
    fetchData(tableParams);
  }, []);

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
            {detailData.createByName || "N/A"}
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

  const renderAllocationResultModal = () => (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Kết quả phân bổ heo vào chuồng</Text>
        </Space>
      }
      open={isAllocationModalVisible}
      onCancel={() => setIsAllocationModalVisible(false)}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={() => setIsAllocationModalVisible(false)}
        >
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {allocationResult && (
        <div>
          <Alert
            message="Phân bổ heo thành công"
            description={`Đã phân bổ ${selectedRequest?.acceptedQuantity} con heo vào các chuồng sau:`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={allocationResult}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Mã chuồng",
                dataIndex: "code",
                key: "code",
              },
              {
                title: "Tên chuồng",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Số lượng heo",
                dataIndex: "totalPig",
                key: "totalPig",
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );

  const handlePrintList = useCallback(() => {
    const fileName = `DS_Heo_${
      selectedRequest?.id || "Unknown"
    }_${dayjs().format("DDMMYYYY")}`;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fileName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
            }
            .info { 
              margin-bottom: 20px;
              line-height: 1.5;
            }
            @media print {
              @page {
                size: auto;
                margin: 20mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>DANH SÁCH HEO ĐƯỢC PHÂN BỔ</h2>
            <p>Ngày: ${dayjs().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã heo</th>
                <th>Chuồng</th>
              </tr>
            </thead>
            <tbody>
              ${allocatedPigs
                ?.map(
                  (pig, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${pig.id}</td>
                  <td>${pig.stableName}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            document.title = "${fileName}";
          </script>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.document.title = fileName;

      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  }, [allocatedPigs, selectedRequest]);

  const renderAllocatedPigsModal = () => (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Danh sách heo được phân bổ</Text>
        </Space>
      }
      open={isAllocatedListVisible}
      onCancel={() => setIsAllocatedListVisible(false)}
      width={800}
      footer={[
        <Button
          key="print"
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handlePrintList}
        >
          In danh sách
        </Button>,
        <Button key="close" onClick={() => setIsAllocatedListVisible(false)}>
          Đóng
        </Button>,
      ]}
    >
      <Alert
        message="Phân bổ heo thành công"
        description={`Đã phân bổ ${
          allocatedPigs?.length || 0
        } con heo vào khu vực A`}
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Table
        dataSource={allocatedPigs}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: "STT",
            key: "index",
            width: 60,
            render: (_, __, index) => index + 1,
          },
          {
            title: "Mã heo",
            dataIndex: "id",
            key: "id",
          },
          {
            title: "Chuồng",
            dataIndex: "stableName",
            key: "stableName",
          },
        ]}
      />
    </Modal>
  );

  const renderCheckModal = () => (
    <Modal
      title="Kiểm tra giao hàng"
      open={isCheckModalVisible}
      onOk={checkForm.submit}
      onCancel={() => {
        setIsCheckModalVisible(false);
        checkForm.resetFields();
      }}
      confirmLoading={loading}
      okText="Xác nhận giao hàng và nhập kho"
      cancelText="Hủy"
    >
      <Alert
        message="Lưu ý"
        description="Khi xác nhận, hệ thống sẽ tự động ghi nhận giao hàng và nhập kho."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form
        form={checkForm}
        layout="vertical"
        onFinish={handleCheckSubmit}
        initialValues={{
          deliveryDate: dayjs(),
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
          </Row>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} justify="space-around">
            <Col span={6}>
              <Statistic
                title="Tổng số phiếu"
                value={statistics.totalRequests}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Chờ duyệt"
                value={statistics.pendingRequests}
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Đã xác nhận"
                value={statistics.approvedRequests}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Đã nhập kho"
                value={statistics.importedRequests}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Col>
          </Row>
        </Card>

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
        {renderAllocationResultModal()}
        {renderAllocatedPigsModal()}
      </Card>
    </motion.div>
  );
};

// Thêm styles
const style = document.createElement("style");
style.textContent = `
  .main-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .card-header {
    margin-bottom: 24px;
  }

  .custom-table {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 500;
    }
    
    .ant-table-filter-trigger {
      color: #8c8c8c;
      
      &:hover {
        color: #1890ff;
      }
      
      &.active {
        color: #1890ff;
      }
    }
  }

  .ant-tag {
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    border: none;
    
    &.ant-tag-success {
      background: #f6ffed;
      color: #52c41a;
    }
    
    &.ant-tag-processing {
      background: #e6f7ff;
      color: #1890ff;
    }
    
    &.ant-tag-warning {
      background: #fffbe6;
      color: #faad14;
    }
    
    &.ant-tag-default {
      background: #f5f5f5;
      color: #8c8c8c;
    }
  }
`;

export default React.memo(ImportRequestManagement);
