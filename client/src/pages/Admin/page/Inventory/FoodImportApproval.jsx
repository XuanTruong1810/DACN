import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  message,
  Modal,
  Tag,
  Select,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  ShopOutlined,
  WarningOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Text, Title } = Typography;
const { Option } = Select;

// Tạo axios instance
const axiosClient = axios.create({
  baseURL: "http://localhost:5197",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const FoodImportApproval = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [requestDetails, setRequestDetails] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [commonSupplier, setCommonSupplier] = useState(null);
  const [deliveryDates, setDeliveryDates] = useState({});
  const [approving, setApproving] = useState(false);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // Fetch requests on mount
  useEffect(() => {
    getRequests();
    getSuppliers();
  }, []);

  // API Calls
  const getRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/FoodImportRequest");
      console.log(response.data.data.items);
      setRequests(response.data.data.items);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu đề xuất");
    }
    setLoading(false);
  };

  const getSuppliers = async () => {
    try {
      const response = await axiosClient.get("/api/v1/Suppliers", {
        params: {
          pageSize: 100,
          typeSuppliers: ["food"],
          status: "active",
        },
      });
      setSuppliers(response.data.data.items || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Lỗi khi tải danh sách nhà cung cấp");
      setSuppliers([]);
    }
  };

  const getRequestDetails = async (requestId) => {
    try {
      const response = await axiosClient.get(
        `/api/FoodImportRequest/${requestId}`
      );
      const requestData = response.data.data;

      // Map data từ details của response
      const details = requestData.details.map((detail) => ({
        id: detail.foodId, // Sử dụng foodId làm id vì không có id riêng cho detail
        foodId: detail.foodId,
        foodName: detail.food.name,
        expectedQuantity: detail.expectedQuantity,
        description: detail.food.description,
        foodTypeName: detail.food.foodTypeName,
        areaName: detail.food.areaName,
        suppliers: detail.food.suppliers,
      }));

      setRequestDetails(details);
      setSelectedRequest(requestData);
      console.log("Request Details:", details);
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết phiếu đề xuất");
      setRequestDetails([]);
    }
  };

  // Handlers
  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    getRequestDetails(record.id);
    setShowDetail(true);
  };

  const handleDetailChange = (foodId, field, value) => {
    setSelectedDetails((prev) => ({
      ...prev,
      [foodId]: {
        ...prev[foodId],
        [field]: value,
      },
    }));
  };

  const handleApprove = async () => {
    if (!token) {
      message.error("Vui lòng đăng nhập lại");
      return;
    }

    try {
      setApproving(true);
      const groupedDetails = groupDetailsBySupplier();

      // Format request theo đúng schema API yêu cầu
      const importRequests = Object.values(groupedDetails.assigned).map(
        (group) => ({
          requestId: selectedRequest.id, // Thêm requestId vào mỗi item
          supplierId: group.supplierId,
          expectedDeliveryTime: deliveryDates[group.supplierId],
          depositAmount: calculateGroupDeposit(group.items),
          note: `Phiếu nhập từ đề xuất ${selectedRequest.id}`,
          details: group.items.map((item) => ({
            foodId: item.foodId,
            unitPrice: selectedDetails[item.id]?.price || 0,
            expectedQuantity: item.expectedQuantity,
          })),
        })
      );

      // Gọi API xét duyệt
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/FoodImport`,
        importRequests, // Gửi array các phiếu nhập
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            requestId: selectedRequest.id,
          },
        }
      );

      if (response.status === 200) {
        message.success("Xét duyệt thành công");
        setShowDetail(false);
        getRequests();
      }
    } catch (error) {
      console.error("Error approving:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xét duyệt"
      );
    } finally {
      setApproving(false);
    }
  };

  // Thêm hàm xử lý từ chối
  const handleReject = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/FoodImportRequest/reject/${
          selectedRequest.id
        }`,
        {
          note: "Không chấp thuận đề xuất", // Có thể thêm modal để nhập lý do
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Đã từ chối đề xuất");
        setShowDetail(false);
        getRequests();
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi từ chối đề xuất");
    }
  };

  const handleCommonSupplierChange = (supplierId) => {
    setCommonSupplier(supplierId);
    // Cập nhật tất cả các mt hàng với cùng nhà cung cấp
    const updatedDetails = {};
    requestDetails.forEach((detail) => {
      updatedDetails[detail.id] = {
        ...selectedDetails[detail.id],
        supplierId: supplierId,
      };
    });
    setSelectedDetails(updatedDetails);
  };

  // Thêm hàm để nhóm sản phẩm theo nhà cung cấp đã chọn
  const groupDetailsBySupplier = () => {
    const grouped = {
      unassigned: [],
      assigned: {},
    };

    requestDetails.forEach((detail) => {
      const selectedSupplier = selectedDetails[detail.id]?.supplierId;
      if (!selectedSupplier) {
        grouped.unassigned.push(detail);
      } else {
        const supplier = suppliers.find((s) => s.id === selectedSupplier);
        if (!grouped.assigned[selectedSupplier]) {
          grouped.assigned[selectedSupplier] = {
            supplierId: selectedSupplier,
            supplierName: supplier?.name || "",
            supplier: supplier,
            items: [],
          };
        }
        grouped.assigned[selectedSupplier].items.push(detail);
      }
    });

    return grouped;
  };

  // Các hàm tính toán
  const calculateItemTotal = (record) => {
    const price = selectedDetails[record.id]?.price || 0;
    return price * record.expectedQuantity;
  };

  const calculateGroupTotal = (items) => {
    return items.reduce((sum, item) => {
      return sum + calculateItemTotal(item);
    }, 0);
  };

  const calculateGroupDeposit = (items) => {
    return items.reduce((sum, item) => {
      return sum + (selectedDetails[item.id]?.deposit || 0);
    }, 0);
  };

  // Các hàm xử lý
  const handlePriceChange = (recordId, value) => {
    const record = requestDetails.find((d) => d.id === recordId);
    const newTotal = value * record.expectedQuantity;
    const currentDeposit = selectedDetails[recordId]?.deposit || 0;

    setSelectedDetails((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        price: value,
        deposit: currentDeposit > newTotal ? 0 : currentDeposit, // Reset nếu tiền cọc vượt quá
        depositError:
          currentDeposit > newTotal
            ? "Đã reset tiền cọc do thay đổi đơn giá"
            : null,
      },
    }));

    if (currentDeposit > newTotal) {
      message.warning(
        "Đã reset tiền cọc do thay đổi đơn giá làm thành tiền thấp hơn tiền cọc"
      );
    }
  };

  const handleDepositChange = (recordId, value) => {
    const record = requestDetails.find((d) => d.id === recordId);
    const totalAmount = calculateItemTotal(record);

    setSelectedDetails((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        deposit: value,
        depositError:
          value > totalAmount
            ? `Tiền cọc tối đa ${totalAmount.toLocaleString()}đ`
            : null,
      },
    }));
  };

  const handleDeliveryDateChange = (supplierId, date) => {
    setDeliveryDates((prev) => ({
      ...prev,
      [supplierId]: date,
    }));
  };

  // Columns cho bảng chi tiết
  const detailColumns = [
    {
      title: "Tên thức ăn",
      dataIndex: "foodName",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 250,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      width: 100,
    },
    {
      title: "Số lượng",
      dataIndex: "expectedQuantity",
      width: 120,
      render: (value) => `${value.toLocaleString()} kg`,
    },
    {
      title: "Đơn giá",
      width: 150,
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          onChange={(value) => handlePriceChange(record.id, value)}
          value={selectedDetails[record.id]?.price}
          min={0}
          addonAfter="đ"
        />
      ),
    },
    {
      title: "Thành tiền",
      width: 150,
      render: (_, record) => {
        const total = calculateItemTotal(record);
        return (
          <Text strong style={{ color: "#1890ff" }}>
            {total.toLocaleString()}đ
          </Text>
        );
      },
    },
    {
      title: "Tiền cọc",
      width: 150,
      render: (_, record) => {
        const total = calculateItemTotal(record);
        const currentDeposit = selectedDetails[record.id]?.deposit || 0;
        const hasError = currentDeposit > total;
        const errorMessage = selectedDetails[record.id]?.depositError;

        return (
          <Tooltip title={errorMessage} visible={hasError} color="red">
            <div>
              <InputNumber
                style={{
                  width: "100%",
                  borderColor: hasError ? "#ff4d4f" : undefined,
                }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                onChange={(value) => handleDepositChange(record.id, value)}
                value={currentDeposit}
                max={total}
                min={0}
                status={hasError ? "error" : ""}
                addonAfter="đ"
                onStep={(value, info) => {
                  // Kiểm tra khi người dùng dùng nút tăng/giảm
                  if (value > total) {
                    message.error(
                      `Tiền cọc không được vượt quá ${total.toLocaleString()}đ`
                    );
                  }
                }}
                onBlur={() => {
                  // Kiểm tra và hiển thị thông báo khi người dùng rời khỏi input
                  if (currentDeposit > total) {
                    message.error(
                      `Tiền cọc không được vượt quá ${total.toLocaleString()}đ`
                    );
                  }
                }}
              />
              {hasError && (
                <div
                  style={{
                    color: "#ff4d4f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Vượt quá thành tiền
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDetailChange(record.id, "supplierId", null)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  // Columns cho bảng chưa chọn nhà cung cấp
  const unassignedColumns = [
    {
      title: "Tên thc ăn",
      dataIndex: "foodName",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 250,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      width: 100,
    },
    {
      title: "Số lượng",
      dataIndex: "expectedQuantity",
      width: 120,
      render: (value) => `${value.toLocaleString()} kg`,
    },
    {
      title: "Nhà cung cấp",
      width: 200,
      render: (_, record) => (
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn nhà cung cấp"
          onChange={(value) =>
            handleDetailChange(record.id, "supplierId", value)
          }
        >
          {record.suppliers.map((supplier) => (
            <Option key={supplier.supplierId} value={supplier.supplierId}>
              {supplier.supplierName}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  const renderDetailTables = () => {
    const groupedDetails = groupDetailsBySupplier();

    return (
      <div>
        {/* Render các nhóm đã chọn nhà cung cấp */}
        {Object.values(groupedDetails.assigned).map((group) => (
          <Card
            key={group.supplierId}
            title={
              <Row justify="space-between" align="middle">
                <Col>
                  <Space size="large">
                    <Space>
                      <ShopOutlined />
                      <Text strong>{group.supplierName}</Text>
                      <Tag color="success">{group.items.length} sản phẩm</Tag>
                    </Space>
                    <Text type="secondary">|</Text>
                    <Space>
                      <Text>Tổng tiền:</Text>
                      <Text strong style={{ color: "#1890ff" }}>
                        {calculateGroupTotal(group.items).toLocaleString()}đ
                      </Text>
                    </Space>
                    <Text type="secondary">|</Text>
                    <Space>
                      <Text>Tổng tiền cọc:</Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        {calculateGroupDeposit(group.items).toLocaleString()}đ
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text>Ngày giao:</Text>
                    <DatePicker
                      style={{ width: 200 }}
                      placeholder="Chọn ngày giao hàng"
                      value={deliveryDates[group.supplierId]}
                      onChange={(date) =>
                        handleDeliveryDateChange(group.supplierId, date)
                      }
                      disabledDate={(current) => {
                        return current && current < moment().startOf("day");
                      }}
                      format="DD/MM/YYYY"
                      status={!deliveryDates[group.supplierId] ? "error" : ""}
                    />
                    {selectedRequest?.status === "approved" && (
                      <Button
                        type="primary"
                        onClick={() => handleCreateImport(group)}
                        disabled={!isValidForImport(group)}
                        loading={loading}
                      >
                        Tạo phiếu nhập
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            }
            style={{ marginBottom: 16 }}
            className="supplier-group"
          >
            <div
              style={{
                background: "#fafafa",
                padding: "12px 24px",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #f0f0f0",
              }}
            >
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Mã nhà cung cấp:</Text>
                    <Text strong>{group.supplierId}</Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Địa chỉ:</Text>
                    <Text strong>
                      {group.supplier?.address || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text strong>
                      {group.supplier?.phone || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Email:</Text>
                    <Text strong>
                      {group.supplier?.email || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Người đại diện:</Text>
                    <Text strong>
                      {group.supplier?.representative || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag
                      color={
                        group.supplier?.status === "active"
                          ? "success"
                          : "error"
                      }
                    >
                      {group.supplier?.status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={detailColumns}
              dataSource={group.items}
              pagination={false}
              rowKey="id"
              bordered
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ color: "#1890ff" }}>
                        {calculateGroupTotal(group.items).toLocaleString()}đ
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong style={{ color: "#52c41a" }}>
                        {calculateGroupDeposit(group.items).toLocaleString()}đ
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        ))}

        {/* Phần chưa chọn nhà cung cấp giữ nguyên */}
        {groupedDetails.unassigned.length > 0 && (
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#faad14" }} />
                <Text strong>Chưa chọn nhà cung cấp</Text>
                <Tag color="warning">
                  {groupedDetails.unassigned.length} sản phẩm
                </Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={unassignedColumns}
              dataSource={groupedDetails.unassigned}
              pagination={false}
              rowKey="id"
              bordered
            />
          </Card>
        )}
      </div>
    );
  };

  const calculateTotal = () => {
    if (!Array.isArray(requestDetails)) return 0;

    return requestDetails.reduce((sum, detail) => {
      const price = selectedDetails[detail.id]?.price || 0;
      return sum + price * detail.expectedQuantity;
    }, 0);
  };

  const calculateTotalDeposit = () => {
    if (!Array.isArray(requestDetails)) return 0;

    return requestDetails.reduce((sum, detail) => {
      return sum + (selectedDetails[detail.id]?.deposit || 0);
    }, 0);
  };

  const isValidForApproval = () => {
    const groupedDetails = groupDetailsBySupplier();

    // Kiểm tra còn sản phẩm chưa chọn nhà cung cấp
    if (groupedDetails.unassigned.length > 0) {
      return false;
    }

    // Kiểm tra từng nhóm
    return Object.values(groupedDetails.assigned).every((group) => {
      // Kiểm tra đã chọn ngày giao
      if (!deliveryDates[group.supplierId]) {
        return false;
      }

      // Kiểm tra tất cả sản phẩm trong nhóm
      return group.items.every((item) => {
        const detail = selectedDetails[item.id];
        // Kiểm tra đơn giá và tiền cọc
        if (!detail?.price || detail.price <= 0) {
          return false;
        }
        if (detail.deposit < 0) {
          return false;
        }
        return true;
      });
    });
  };

  // Thêm styles
  const styles = {
    card: {
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    table: {
      ".ant-table-thead > tr > th": {
        backgroundColor: "#f5f5f5",
        fontWeight: "bold",
      },
    },
    modal: {
      ".ant-modal-header": {
        borderBottom: "1px solid #f0f0f0",
        padding: "16px 24px",
      },
      ".ant-modal-title": {
        fontSize: 20,
        fontWeight: "bold",
      },
      ".ant-modal-body": {
        padding: "24px",
      },
    },
    tag: {
      fontSize: 14,
      padding: "4px 12px",
    },
    button: {
      height: 40,
      padding: "0 20px",
      fontSize: 16,
    },
    summary: {
      backgroundColor: "#f5f5f5",
      padding: "16px 24px",
      borderRadius: 8,
      marginBottom: 16,
    },
    supplierInfo: {
      background: "#fafafa",
      padding: "12px 24px",
      borderRadius: 8,
      marginBottom: 16,
      border: "1px solid #f0f0f0",
    },
    infoLabel: {
      color: "#8c8c8c",
      marginBottom: 4,
    },
    infoValue: {
      fontWeight: 500,
    },
  };

  // Thêm vào đầu component, sau phần khai báo states
  const requestColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 150,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 250,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Tag
          color={record.status === "pending" ? "processing" : "success"}
          style={styles.tag}
        >
          {record.status === "pending" ? "Đợi xét duyệt" : "Đã xét duyệt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Render Modal
  const renderDetailModal = () => {
    const groupedDetails = groupDetailsBySupplier();

    return (
      <Modal
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết phiếu đề xuất #{selectedRequest?.id}
            </Title>
            <Tag
              color={
                selectedRequest?.status === "pending" ? "processing" : "success"
              }
            >
              {selectedRequest?.status === "pending"
                ? "Đợi xét duyệt"
                : "Đã xét duyệt"}
            </Tag>
          </Space>
        }
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        width={1400}
        style={styles.modal}
        footer={null}
      >
        {/* Thông tin chung */}
        <div style={styles.summary}>
          <Row gutter={24}>
            <Col span={8}>
              <Text type="secondary">Người tạo:</Text>
              <div>
                <Text strong>{selectedRequest?.createdBy}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Ngày tạo:</Text>
              <div>
                <Text strong>
                  {selectedRequest?.createdTime &&
                    new Date(selectedRequest.createdTime).toLocaleString()}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Ghi chú:</Text>
              <div>
                <Text strong>{selectedRequest?.note}</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Render các nhóm đã chọn nhà cung cấp */}
        {Object.values(groupedDetails.assigned).map((group) => (
          <Card
            key={group.supplierId}
            title={
              <Row justify="space-between" align="middle">
                <Col>
                  <Space size="large">
                    <Space>
                      <ShopOutlined />
                      <Text strong>{group.supplierName}</Text>
                      <Tag color="success">{group.items.length} sản phẩm</Tag>
                    </Space>
                    <Text type="secondary">|</Text>
                    <Space>
                      <Text>Tổng tiền:</Text>
                      <Text strong style={{ color: "#1890ff" }}>
                        {calculateGroupTotal(group.items).toLocaleString()}đ
                      </Text>
                    </Space>
                    <Text type="secondary">|</Text>
                    <Space>
                      <Text>Tổng tiền cọc:</Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        {calculateGroupDeposit(group.items).toLocaleString()}đ
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text>Ngày giao:</Text>
                    <DatePicker
                      style={{ width: 200 }}
                      placeholder="Chọn ngày giao hàng"
                      value={deliveryDates[group.supplierId]}
                      onChange={(date) =>
                        handleDeliveryDateChange(group.supplierId, date)
                      }
                      disabledDate={(current) => {
                        return current && current < moment().startOf("day");
                      }}
                      format="DD/MM/YYYY"
                      status={!deliveryDates[group.supplierId] ? "error" : ""}
                    />
                    {selectedRequest?.status === "approved" && (
                      <Button
                        type="primary"
                        onClick={() => handleCreateImport(group)}
                        disabled={!isValidForImport(group)}
                        loading={loading}
                      >
                        Tạo phiếu nhập
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            }
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                background: "#fafafa",
                padding: "12px 24px",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #f0f0f0",
              }}
            >
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Mã nhà cung cấp:</Text>
                    <Text strong>{group.supplierId}</Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Địa chỉ:</Text>
                    <Text strong>
                      {group.supplier?.address || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text strong>
                      {group.supplier?.phone || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Email:</Text>
                    <Text strong>
                      {group.supplier?.email || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Người đại diện:</Text>
                    <Text strong>
                      {group.supplier?.representative || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag
                      color={
                        group.supplier?.status === "active"
                          ? "success"
                          : "error"
                      }
                    >
                      {group.supplier?.status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={detailColumns}
              dataSource={group.items}
              pagination={false}
              rowKey="id"
              bordered
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ color: "#1890ff" }}>
                        {calculateGroupTotal(group.items).toLocaleString()}đ
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong style={{ color: "#52c41a" }}>
                        {calculateGroupDeposit(group.items).toLocaleString()}đ
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        ))}

        {/* Render sản phẩm chưa chọn nhà cung cấp */}
        {groupedDetails.unassigned.length > 0 && (
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#faad14" }} />
                <Text strong>Chưa chọn nhà cung cấp</Text>
                <Tag color="warning">
                  {groupedDetails.unassigned.length} sản phẩm
                </Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={unassignedColumns}
              dataSource={groupedDetails.unassigned}
              pagination={false}
              rowKey="id"
              bordered
            />
          </Card>
        )}

        {/* Footer buttons */}
        <div
          style={{
            textAlign: "right",
            marginTop: 24,
            padding: "16px 0",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Space size="middle">
            <Button
              size="large"
              onClick={() => setShowDetail(false)}
              style={styles.button}
            >
              Đóng
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button danger onClick={handleReject}>
                  Không chấp thuận
                </Button>
                <Tooltip
                  title={
                    !isValidForApproval()
                      ? "Vui lòng kiểm tra: \n- Tất cả sản phẩm đã chọn nhà cung cấp\n- Đã nhập đơn giá và tiền cọc\n- Đã chọn ngày giao"
                      : ""
                  }
                >
                  <Button
                    type="primary"
                    onClick={handleApprove}
                    disabled={!isValidForApproval()}
                    loading={approving}
                  >
                    Xét duyệt
                  </Button>
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      </Modal>
    );
  };

  const isValidForImport = (group) => {
    // Kiểm tra đã chọn ngày giao
    if (!deliveryDates[group.supplierId]) {
      return false;
    }

    // Kiểm tra tất cả sản phẩm có đơn giá và số lượng hợp lệ
    return group.items.every((item) => {
      const detail = selectedDetails[item.id];
      return (
        detail?.price > 0 && item.expectedQuantity > 0 && detail?.deposit >= 0
      );
    });
  };

  const handleCreateImport = async (group) => {
    // console.log(group);
    // console.log(selectedRequest.id);
    try {
      setLoading(true);

      const importRequest = {
        requestId: selectedRequest.id,
        supplierId: group.supplierId,
        expectedDeliveryTime: deliveryDates[group.supplierId],
        depositAmount: calculateGroupDeposit(group.items),
        note: `Phiếu nhập từ đề xuất ${selectedRequest.id}`,
        details: group.items.map((item) => ({
          foodId: item.foodId,
          unitPrice: selectedDetails[item.id]?.price || 0,
          expectedQuantity: item.expectedQuantity,
        })),
      };
      console.log(importRequest);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/FoodImport`,
        importRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            requestId: selectedRequest.id,
          },
        }
      );

      if (response.status === 200) {
        message.success(`Tạo phiếu nhập cho ${group.supplierName} thành công`);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating import:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu nhập"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="food-import-approval">
      <Card
        title={<Title level={3}>Danh sách phiếu đề xuất nhập thức ăn</Title>}
        style={styles.card}
        className="mb-4"
      >
        <Table
          columns={requestColumns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          style={styles.table}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} phiếu`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
      {renderDetailModal()}
    </div>
  );
};

export default FoodImportApproval;
