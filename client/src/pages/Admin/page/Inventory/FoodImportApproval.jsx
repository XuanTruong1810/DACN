/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
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
  Alert,
  Input,
  Divider,
} from "antd";
import {
  ShopOutlined,
  WarningOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import "./styles/FoodImportApproval.css";

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNote, setConfirmNote] = useState("");
  const [itemNotes, setItemNotes] = useState({});
  const [generalNote, setGeneralNote] = useState("");

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // Fetch requests on mount
  useEffect(() => {
    getRequests();
    getSuppliers();
  }, []);

  // API Calls
  const getRequests = async (search, status, fromDate, toDate) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (fromDate) params.append("fromDate", fromDate.toISOString());
      if (toDate) params.append("toDate", toDate.toISOString());

      const response = await axiosClient.get(
        `/api/FoodImportRequest?${params}`
      );
      if (response.status === 200) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Có lỗi xảy ra khi tải danh sách phiếu đề xuất");
    } finally {
      setLoading(false);
    }
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
      console.log("response", requestData);

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

  // Hàm xử lý ghi chú trước khi gửi xuống server
  const processNotes = () => {
    const groupedDetails = groupDetailsBySupplier();
    const processedNotes = {};

    groupedDetails.unassigned.forEach((item) => {
      // Nếu sản phẩm có ghi chú riêng thì ưu tiên ghi chú riêng
      // Nếu không có ghi chú riêng thì sử dụng ghi chú tổng
      processedNotes[item.id] =
        itemNotes[item.id]?.trim() || generalNote.trim();
    });

    return processedNotes;
  };

  // Cập nhật hàm handleApprove để sử dụng ghi chú đã xử lý
  const handleApprove = async () => {
    try {
      setApproving(true);
      const groupedDetails = groupDetailsBySupplier();
      const processedNotes = processNotes();

      const response = await axiosClient.post(
        `/api/FoodImportRequest/approve/${selectedRequest.id}`,
        {
          // Truyền data theo FoodImportRequestDTO
          accepts: Object.values(groupedDetails.assigned).map((group) => ({
            expectedDeliveryTime: deliveryDates[group.supplierId],
            deposit: selectedDetails[`group_${group.supplierId}`]?.deposit || 0,
            supplierId: group.supplierId,
            details: group.items.map((item) => ({
              foodId: item.id,
              unitPrice: selectedDetails[item.id]?.price || 0,
              expectedQuantity: item.expectedQuantity,
            })),
          })),
          rejects: groupedDetails.unassigned.map((item) => ({
            foodId: item.id,
            reason:
              processedNotes[item.id] ||
              generalNote ||
              "Không chọn nhà cung cấp",
          })),
        }
      );

      if (response.status === 200) {
        message.success("Xét duyệt phiếu đề xuất thành công");
        setShowConfirmModal(false);
        setShowDetail(false);
        setItemNotes({});
        setGeneralNote("");
        getRequests(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error approving request:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xét duyệt phiếu đề xuất"
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
            supplierAddress: supplier?.address || "",
            supplierPhone: supplier?.phone || "",
            supplierEmail: supplier?.email || "",
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
    console.log("Handling deposit change:", supplierId, value);

    // Tính toán tổng tiền trực tiếp từ requestDetails và selectedDetails
    const groupItems = requestDetails.filter(
      (item) => selectedDetails[item.id]?.supplierId === supplierId
    );
    const totalAmount = groupItems.reduce((sum, item) => {
      const price = selectedDetails[item.id]?.price || 0;
      return sum + price * item.expectedQuantity;
    }, 0);

    if (value > totalAmount) {
      message.error(
        `Tiền cọc không được vượt quá ${totalAmount.toLocaleString()}đ`
      );
      return;
    }

    setSelectedDetails((prev) => {
      const newState = {
        ...prev,
        [`group_${supplierId}`]: {
          ...prev[`group_${supplierId}`],
          deposit: value,
        },
      };
      console.log("New state after deposit change:", newState);
      return newState;
    });
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
              <Space direction="vertical">
                <Space>
                  <ShopOutlined />
                  <Text strong>{group.supplierName}</Text>
                  <Tag color="success">{group.items.length} sản phẩm</Tag>
                </Space>
                <Text type="secondary">Địa chỉ: {group.supplierAddress}</Text>
                <Text type="secondary">
                  Số điện thoại: {group.supplierPhone}
                </Text>
                <Text type="secondary">Email: {group.supplierEmail}</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Row gutter={32} align="middle">
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Ngày giao dự kiến</Text>}
                        required
                        validateStatus={
                          !deliveryDates[group.supplierId] ? "error" : ""
                        }
                        style={{ marginBottom: 24 }}
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
                      <Space style={{ marginBottom: 24 }}>
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
            <Alert
              message="Lưu ý"
              description="Những sản phẩm không được chọn nhà cung cấp sẽ bị hủy sau khi xét duyệt"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
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

    // Kiểm tra từng nhóm đã chọn nhà cung cấp
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
      "& .ant-table-thead > tr > th": {
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

  // Sửa lại hàm filterByDate
  const filterByDate = (value, record) => {
    if (!value || !value[0]) return true;

    const recordDate = moment(record.createdTime);
    const [startDate, endDate] = value;

    console.log("Filter values:", {
      value,
      recordDate: recordDate.format("YYYY-MM-DD HH:mm:ss"),
      startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
      endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
      isInRange: recordDate.isBetween(startDate, endDate, "day", "[]"),
    });

    return recordDate.isBetween(startDate, endDate, "day", "[]");
  };

  // Cập nhật requestColumns với các bộ lọc
  const requestColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 150,
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
              Xóa
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
      title: "Ngày tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 180,
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8, width: 320 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <DatePicker.RangePicker
              value={selectedKeys[0]}
              onChange={(dates, dateStrings) => {
                setSelectedKeys(dates ? [dates] : []);
              }}
              style={{ width: "100%", marginBottom: 8 }}
              format="DD/MM/YYYY"
            />

            {/* Thêm các nút tùy chọn nhanh */}
            <Space wrap style={{ width: "100%" }}>
              <Button
                size="small"
                onClick={() => {
                  const today = moment();
                  setSelectedKeys([[today.startOf("day"), today.endOf("day")]]);
                }}
              >
                Hôm nay
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const yesterday = moment().subtract(1, "days");
                  setSelectedKeys([
                    [yesterday.startOf("day"), yesterday.endOf("day")],
                  ]);
                }}
              >
                Hôm qua
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const startOfWeek = moment().startOf("week");
                  const endOfWeek = moment().endOf("week");
                  setSelectedKeys([[startOfWeek, endOfWeek]]);
                }}
              >
                Tuần này
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const lastWeekStart = moment()
                    .subtract(1, "week")
                    .startOf("week");
                  const lastWeekEnd = moment()
                    .subtract(1, "week")
                    .endOf("week");
                  setSelectedKeys([[lastWeekStart, lastWeekEnd]]);
                }}
              >
                Tuần trước
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const startOfMonth = moment().startOf("month");
                  const endOfMonth = moment().endOf("month");
                  setSelectedKeys([[startOfMonth, endOfMonth]]);
                }}
              >
                Tháng này
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const lastMonthStart = moment()
                    .subtract(1, "month")
                    .startOf("month");
                  const lastMonthEnd = moment()
                    .subtract(1, "month")
                    .endOf("month");
                  setSelectedKeys([[lastMonthStart, lastMonthEnd]]);
                }}
              >
                Tháng trước
              </Button>
            </Space>

            <Divider style={{ margin: "8px 0" }} />

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                Lọc
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Xóa
              </Button>
            </Space>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: filterByDate,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "createdByName",
      key: "createdByName",
      width: 250,
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
              Xóa
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.createdByName.toLowerCase().includes(value.toLowerCase()),
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
        <Tag color={record.status === "pending" ? "processing" : "success"}>
          {record.status === "pending" ? "Đợi xét duyệt" : "Đã xét duyệt"}
        </Tag>
      ),
      filters: [
        { text: "Đợi xét duyệt", value: "pending" },
        { text: "Đã xét duyệt", value: "completed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleViewDetail(record)}
          disabled={record.status === "completed"}
          title={record.status === "completed" ? "Phiếu đã được xét duyệt" : ""}
        >
          {record.status === "completed" ? "Đã duyệt" : "Xét duyệt"}
        </Button>
      ),
    },
  ];

  // Thêm hàm xử lý khi click nút xét duyệt
  const handleApproveClick = () => {
    const groupedDetails = groupDetailsBySupplier();

    if (groupedDetails.unassigned.length > 0) {
      setShowConfirmModal(true);
    } else {
      handleApprove();
    }
  };

  // Hàm kiểm tra điều kiện enable nút xác nhận
  const isValidForConfirm = () => {
    const groupedDetails = groupDetailsBySupplier();

    // Kiểm tra từng sản phẩm chưa chọn
    const hasValidNotes = groupedDetails.unassigned.every((item) => {
      // Nếu sản phẩm có ghi chú riêng thì kiểm tra ghi chú riêng
      if (itemNotes[item.id]?.trim()) {
        return true;
      }
      // Nếu không có ghi chú riêng thì kiểm tra có ghi chú tổng không
      return generalNote.trim() !== "";
    });

    return hasValidNotes;
  };

  // Cập nhật render Modal
  const renderConfirmModal = () => {
    const groupedDetails = groupDetailsBySupplier();

    const columns = [
      {
        title: "Tên thức ăn",
        dataIndex: "foodName",
        key: "foodName",
        width: "25%",
      },
      {
        title: "Số lượng (kg)",
        dataIndex: "expectedQuantity",
        key: "expectedQuantity",
        width: "15%",
      },
      {
        title: "Người tạo",
        dataIndex: "createdByName",
        key: "createdByName",
        width: "15%",
      },
      {
        title: "Ghi chú",
        key: "note",
        width: "45%",
        render: (_, record) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ marginBottom: 8 }}>
              Ghi chú:
            </Text>
            <Input.TextArea
              rows={2}
              value={itemNotes[record.id] || ""}
              onChange={(e) => {
                setItemNotes((prev) => ({
                  ...prev,
                  [record.id]: e.target.value,
                }));
              }}
              placeholder="Nhập ghi chú cho sản phẩm này..."
            />
          </div>
        ),
      },
    ];

    return (
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#faad14" }} />
            <Text strong>Xác nhận xét duyệt</Text>
          </Space>
        }
        open={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          setItemNotes({});
          setGeneralNote("");
        }}
        width={1000}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setShowConfirmModal(false);
              setItemNotes({});
              setGeneralNote("");
            }}
          >
            Quay lại
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShowConfirmModal(false);
              handleApprove();
            }}
            disabled={!isValidForConfirm()} // Sử dụng hàm kiểm tra mới
          >
            Xác nhận xét duyệt
          </Button>,
        ]}
      >
        <Alert
          message="Lưu ý quan trọng"
          description={
            <div>
              <p>Các sản phẩm sau sẽ bị hủy do chưa chọn nhà cung cấp:</p>
              <p>
                - Tổng số sản phẩm bị hủy: {groupedDetails.unassigned.length}
              </p>
              <p>
                - Vui lòng kiểm tra và ghi chú cho từng sản phẩm trước khi xác
                nhận
              </p>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Ghi chú tổng */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Ghi chú tổng:
          </Text>
          <Input.TextArea
            rows={4}
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            placeholder="Nhập ghi chú tổng cho việc hủy các sản phẩm..."
            required
          />
        </div>

        <Table
          columns={columns}
          dataSource={groupedDetails.unassigned}
          pagination={false}
          size="middle"
          bordered
          style={{ marginBottom: 16 }}
          rowKey="id"
        />

        <Alert
          message="Xác nhận"
          description="Bạn có chắc chắn muốn tiếp tục xét duyệt? Các sản phẩm không được chọn sẽ bị hủy và không thể khôi phục."
          type="error"
          showIcon
        />
      </Modal>
    );
  };

  // Modal xác nhận
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
              <Text type="secondary">Người yêu cầu:</Text>
              <div>
                <Text strong>{selectedRequest?.createdByName}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Ngày yêu cầu:</Text>
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
              <Space direction="vertical">
                <Space>
                  <ShopOutlined />
                  <Text strong>{group.supplierName}</Text>
                  <Tag color="success">{group.items.length} sản phẩm</Tag>
                </Space>
                <Text type="secondary">Địa chỉ: {group.supplierAddress}</Text>
                <Text type="secondary">
                  Số điện thoại: {group.supplierPhone}
                </Text>
                <Text type="secondary">Email: {group.supplierEmail}</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Row gutter={32} align="middle">
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Ngày giao dự kiến</Text>}
                        required
                        validateStatus={
                          !deliveryDates[group.supplierId] ? "error" : ""
                        }
                        style={{ marginBottom: 24 }}
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
                      <Space style={{ marginBottom: 24 }}>
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
                            disabled={!isAllPricesEntered(group.items)}
                          />
                        </Form.Item>
                        <Text type="secondary">
                          {isAllPricesEntered(group.items)
                            ? `(Tối đa: ${calculateGroupTotal(
                                group.items
                              ).toLocaleString()}đ)`
                            : "(Vui lòng nhập đơn giá cho tất cả sản phẩm)"}
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
            <Alert
              message="Lưu ý"
              description="Những sản phẩm không được chọn nhà cung cấp sẽ bị hủy sau khi xét duyệt"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
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
              <Tooltip
                title={
                  !isValidForApproval()
                    ? "Vui lòng kiểm tra: \n- Tất cả sản phẩm đã chọn nhà cung cấp\n- Đã nhập đơn giá và tiền cọc\n- Đã chọn ngày giao"
                    : ""
                }
              >
                <Button
                  type="primary"
                  onClick={handleApproveClick}
                  disabled={!isValidForApproval()}
                  loading={approving}
                >
                  Xét duyệt
                </Button>
              </Tooltip>
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
        // fetchData();
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
                : "ã từ chối"
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

  // Thêm hàm kiểm tra đơn giá
  const isAllPricesEntered = (items) => {
    return items.every((item) => {
      const detail = selectedDetails[item.id];
      return detail?.price && detail.price > 0;
    });
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
      {renderConfirmModal()}
    </div>
  );
};

export default FoodImportApproval;
