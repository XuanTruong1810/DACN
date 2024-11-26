import React, { useState, useEffect, useCallback } from "react";
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
  Form,
} from "antd";
import {
  EyeOutlined,
  ShopOutlined,
  WarningOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
  PrinterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Option } = Select;

// Tạo axios instance
const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
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
  const [groupDeposits, setGroupDeposits] = useState({});

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
    // Kiểm tra validate
    const groupedDetails = groupDetailsBySupplier();
    const hasInvalidData = Object.values(groupedDetails.assigned).some(
      (group) => {
        // Kiểm tra ngày giao
        if (!deliveryDates[group.supplierId]) {
          message.error(
            `Vui lòng chọn ngày giao cho nhà cung cấp ${group.supplierName}`
          );
          return true;
        }

        // Kiểm tra tiền cọc
        if (!selectedDetails[`group_${group.supplierId}`]?.deposit) {
          message.error(
            `Vui lòng nhập tiền cọc cho nhà cung cấp ${group.supplierName}`
          );
          return true;
        }

        // Kiểm tra đơn giá
        const hasInvalidPrice = group.items.some((item) => {
          if (!selectedDetails[item.id]?.price) {
            message.error(
              `Vui lòng nhập đơn giá cho sản phẩm ${item.foodName}`
            );
            return true;
          }
          return false;
        });

        return hasInvalidPrice;
      }
    );

    if (hasInvalidData) return;

    try {
      setApproving(true);
      const importRequests = Object.values(groupedDetails.assigned).map(
        (group) => ({
          requestId: selectedRequest.id,
          supplierId: group.supplierId,
          expectedDeliveryTime: deliveryDates[group.supplierId],
          depositAmount: selectedDetails[`group_${group.supplierId}`].deposit,
          note: `Phiếu nhập từ đề xuất ${selectedRequest.id}`,
          details: group.items.map((item) => ({
            foodId: item.foodId,
            unitPrice: selectedDetails[item.id].price,
            expectedQuantity: item.expectedQuantity,
          })),
        })
      );

      // Gọi API xét duyệt
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/FoodImport`,
        importRequests,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            requestId: selectedRequest.id,
          },
        }
      );

      message.success("Xét duyệt thành công");
      setShowDetail(false);
      getRequests();
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
            ? `Tien cọc tối đa ${totalAmount.toLocaleString()}đ`
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

  // Thêm handler cho việc thay đổi tiền cọc
  const handleGroupDepositChange = (supplierId, value) => {
    const group = Object.values(groupedDetails.assigned).find(
      (g) => g.supplierId === supplierId
    );
    const totalAmount = calculateGroupTotal(group.items);

    if (value > totalAmount) {
      message.error(
        `Tiền cọc không được vượt quá ${totalAmount.toLocaleString()}đ`
      );
      return;
    }

    setSelectedDetails((prev) => ({
      ...prev,
      [`group_${supplierId}`]: {
        ...prev[`group_${supplierId}`],
        deposit: value,
      },
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
              <Space>
                <ShopOutlined />
                <Text strong>{group.supplierName}</Text>
                <Tag color="success">{group.items.length} sản phẩm</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row gutter={32} align="middle">
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Ngày giao dự kiến</Text>}
                        required
                        validateStatus={
                          !deliveryDates[group.supplierId] ? "error" : ""
                        }
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          className="w-full"
                          format="DD/MM/YYYY"
                          value={deliveryDates[group.supplierId]}
                          onChange={(date) =>
                            setDeliveryDates((prev) => ({
                              ...prev,
                              [group.supplierId]: date,
                            }))
                          }
                          disabledDate={(current) => {
                            return current && current < moment().startOf("day");
                          }}
                          placeholder="Chọn ngày giao"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <Text strong>Tiền cọc:</Text>
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          validateStatus={
                            !selectedDetails[`group_${group.supplierId}`]
                              ?.deposit
                              ? "error"
                              : ""
                          }
                          required
                        >
                          <InputNumber
                            style={{ width: 200 }}
                            min={0}
                            max={calculateGroupTotal(group.items)}
                            value={
                              selectedDetails[`group_${group.supplierId}`]
                                ?.deposit
                            }
                            onChange={(value) =>
                              handleGroupDepositChange(group.supplierId, value)
                            }
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="đ"
                          />
                        </Form.Item>
                        <Text type="secondary">
                          (Tối đa:{" "}
                          {calculateGroupTotal(group.items).toLocaleString()}đ)
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>

            <Table
              columns={detailColumns}
              dataSource={group.items}
              pagination={false}
              rowKey="id"
              bordered
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              getRequestDetails(record.id);
              setShowDetail(true);
            }}
          >
            Chi tiết
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrintRequest(record)}
          >
            In phiếu
          </Button>
        </Space>
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
              <Space>
                <ShopOutlined />
                <Text strong>{group.supplierName}</Text>
                <Tag color="success">{group.items.length} sản phẩm</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row gutter={32} align="middle">
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Ngày giao dự kiến</Text>}
                        required
                        validateStatus={
                          !deliveryDates[group.supplierId] ? "error" : ""
                        }
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          className="w-full"
                          format="DD/MM/YYYY"
                          value={deliveryDates[group.supplierId]}
                          onChange={(date) =>
                            setDeliveryDates((prev) => ({
                              ...prev,
                              [group.supplierId]: date,
                            }))
                          }
                          disabledDate={(current) => {
                            return current && current < moment().startOf("day");
                          }}
                          placeholder="Chọn ngày giao"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <Text strong>Tiền cọc:</Text>
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          validateStatus={
                            !selectedDetails[`group_${group.supplierId}`]
                              ?.deposit
                              ? "error"
                              : ""
                          }
                          required
                        >
                          <InputNumber
                            style={{ width: 200 }}
                            min={0}
                            max={calculateGroupTotal(group.items)}
                            value={
                              selectedDetails[`group_${group.supplierId}`]
                                ?.deposit
                            }
                            onChange={(value) =>
                              handleGroupDepositChange(group.supplierId, value)
                            }
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="đ"
                          />
                        </Form.Item>
                        <Text type="secondary">
                          (Tối đa:{" "}
                          {calculateGroupTotal(group.items).toLocaleString()}đ)
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>

            <Table
              columns={detailColumns}
              dataSource={group.items}
              pagination={false}
              rowKey="id"
              bordered
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

  // Thêm hàm in phiếu
  const handlePrintRequest = useCallback((record) => {
    const fileName = `Phieu_Yeu_Cau_${record.id}_${dayjs().format("DDMMYYYY")}`;

    const printWindow = window.open("", fileName);
    printWindow.document.write(`
      <html>
        <head>
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
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHIẾU YÊU CẦU NHẬP THỨC ĂN</h2>
            <p>Ngày in: ${dayjs().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
          <div class="info">
            <p><strong>Mã phiếu:</strong> ${record.id}</p>
            <p><strong>Người tạo:</strong> ${record.createdBy}</p>
            <p><strong>Ngày tạo:</strong> ${moment(record.createdTime).format(
              "DD/MM/YYYY HH:mm"
            )}</p>
            <p><strong>Trạng thái:</strong> ${
              record.status === "Pending"
                ? "Chờ duyệt"
                : record.status === "Completed"
                ? "Đã duyệt"
                : "Đã từ chối"
            }</p>
            <p><strong>Ghi chú:</strong> ${record.note || "Không có"}</p>
          </div>

          <h3>Chi tiết sản phẩm:</h3>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên thức ăn</th>
                <th>Số lượng</th>
                <th>Đơn vị</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${record.details
                ?.map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.foodName}</td>
                  <td>${item.expectedQuantity}</td>
                  <td>${item.unit || "Kg"}</td>
                  <td>${item.note || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div style="margin-top: 50px;">
            <table style="width: 100%; border: none;">
              <tr style="border: none;">
                <td style="width: 50%; border: none; text-align: center;">
                  <p><strong>Người lập phiếu</strong></p>
                  <p style="margin-top: 70px;">${record.createdBy}</p>
                </td>
                <td style="width: 50%; border: none; text-align: center;">
                  <p><strong>Người duyệt</strong></p>
                  <p style="margin-top: 70px;">.........................</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

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
