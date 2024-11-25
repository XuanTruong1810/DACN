import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Card,
  Typography,
  Select,
  Badge,
  InputNumber,
  Tooltip,
  Dropdown,
  Row,
  Col,
  Statistic,
  DatePicker,
  Collapse,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DashboardOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import ViewDetailsModal from "./components/ViewDetailsModal";
import dayjs from "dayjs";
import axios from "axios";
import ApproveRequestModal from "./components/ApproveRequestModal";
import { Text } from "recharts";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const PigImportApproval = () => {
  const [importRequests, setImportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form] = Form.useForm();
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    dateRange: null,
  });

  // Giả lập danh sách nhà cung cấp

  // Thêm hàm fetchRequests để lấy danh sách yêu cầu
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Kiểm tra và đảm bảo response.data.data.items tồn tại
      const items = response.data?.data?.items || [];

      // Format lại data cho phù hợp với UI
      const formattedRequests = items.map((request) => ({
        id: request.id,
        requestCode: request.id,
        supplier: request.suppliersName,
        requestDate: request.createTime,
        quantity: request.expectedQuantity,
        pigType: "Heo thịt", // Mặc định
        status: request.approvedTime
          ? "approved"
          : request.rejectedTime
          ? "rejected"
          : "pending",
        age: request.age,
        weight: request.weight,
        healthStatus: request.healthStatus,
        notes: request.note,
      }));

      setImportRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Sửa useEffect đ gọi API thật
  useEffect(() => {
    fetchRequests();
  }, []);

  // Thêm useEffect để load danh sách nhà cung cấp khi component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Thêm hàm fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers?typeSuppliers=pig`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("API RESPONSE");
      console.log(response);
      const formattedSuppliers = response.data.data.items.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
        address: supplier.address,
        phone: supplier.phone,
      }));

      setSuppliers(formattedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { status: "warning", text: "Chờ duyệt" },
      approved: { status: "success", text: "Đã duyệt" },
      rejected: { status: "error", text: "Từ chối" },
    };
    const config = statusConfig[status];
    return <Badge status={config.status} text={config.text} />;
  };

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestCode",
      key: "requestCode",
      width: 120,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      width: 150,
      render: (supplier) => {
        if (!supplier) {
          return <Badge status="default" text="Chưa xác nhận" />;
        }
        return supplier;
      },
    },
    {
      title: "Loại heo",
      dataIndex: "pigType",
      key: "pigType",
      width: 120,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (value) => `${value} con`,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setIsViewModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  style={{ color: "#52c41a" }}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                  style={{ color: "#ff4d4f" }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    setSelectedRequest(record);
    setIsViewModalVisible(true);
  };

  // Sửa lại hàm handleApprove để xử lý chấp nhận yêu cầu
  const handleApprove = (record) => {
    setSelectedRecord(record);
    setApproveModalVisible(true);
  };

  const handleApproveSubmit = async (values) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/Accept?id=${
          selectedRecord.id
        }`,
        {
          suppliersId: values.supplierId,
          unitPrice: values.unitPrice,
          deposit: values.deposit,
          note: values.note || "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response:", response.data);
      message.success("Đã duyệt yêu cầu nhập heo thành công");
      setApproveModalVisible(false);
      fetchRequests();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu"
      );
    }
  };

  // Sửa lại hàm handleReject để gọi API từ chối
  const handleReject = (record) => {
    Modal.confirm({
      title: "Xác nhận từ chối",
      content: (
        <Form form={form}>
          <Form.Item
            name="rejectReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/${
              record.id
            }/reject`,
            {
              reason: values.rejectReason,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.success("Đã từ chối yêu cầu nhập heo");
          form.resetFields();
          fetchRequests(); // Refresh lại danh sách
        } catch (error) {
          message.error(
            error.response?.data?.message || "Có lỗi xảy ra khi từ chối yêu cầu"
          );
          return Promise.reject();
        }
      },
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
    });
  };

  const handleExportPDF = (record) => {
    console.log(record);
    message.info("Tính năng đang được phát triển");
  };

  const handleExportExcel = (record) => {
    console.log(record);
    message.info("Tính năng đang được phát triển");
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // Thêm logic search
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    // Thêm logic filter by status
  };

  const handleDateRange = (dates) => {
    setDateRange(dates);
    // Thêm logic filter by date
  };

  const handleReset = () => {
    setSearchText("");
    setStatusFilter(null);
    setDateRange(null);
    fetchRequests();
  };

  // Hàm xử lý filter data
  const filterData = useCallback(() => {
    let result = [...importRequests];

    // Filter by search text
    if (filters.search) {
      result = result.filter(
        (item) =>
          item.requestCode
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      result = result.filter((item) => {
        const itemDate = dayjs(item.requestDate);
        return (
          itemDate.isAfter(filters.dateRange[0], "day") &&
          itemDate.isBefore(filters.dateRange[1], "day")
        );
      });
    }

    setFilteredData(result);
  }, [importRequests, filters]);

  // Update filtered data when filters or data change
  useEffect(() => {
    filterData();
  }, [filterData, importRequests, filters]);

  return (
    <div className="pig-import-approval">
      <Card className="stats-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={
                <Space>
                  <DashboardOutlined />
                  <span>Tổng yêu cầu</span>
                </Space>
              }
              value={importRequests.length}
              className="custom-statistic"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={
                <Space>
                  <FilterOutlined />
                  <span>Chờ duyệt</span>
                </Space>
              }
              value={
                importRequests.filter((r) => r.status === "pending").length
              }
              valueStyle={{ color: "#faad14" }}
              className="custom-statistic"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={
                <Space>
                  <CheckOutlined />
                  <span>Đã duyệt</span>
                </Space>
              }
              value={
                importRequests.filter((r) => r.status === "approved").length
              }
              valueStyle={{ color: "#52c41a" }}
              className="custom-statistic"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={
                <Space>
                  <CloseOutlined />
                  <span>Đã từ chối</span>
                </Space>
              }
              value={
                importRequests.filter((r) => r.status === "rejected").length
              }
              valueStyle={{ color: "#ff4d4f" }}
              className="custom-statistic"
            />
          </Col>
        </Row>
      </Card>

      <Card className="main-card">
        <div className="card-header">
          <div className="header-left">
            <Title level={4}>Danh sách yêu cầu nhập heo</Title>
            <Text type="secondary">
              Quản lý và theo dõi các yêu cầu nhập heo
            </Text>
          </div>
        </div>

        <Card className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={7}>
              <div className="filter-item">
                <Input
                  placeholder="Tìm kiếm yêu cầu..."
                  prefix={<SearchOutlined className="search-icon" />}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  allowClear
                  className="search-input"
                />
              </div>
            </Col>

            <Col xs={24} md={7}>
              <div className="filter-item">
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder={
                    <Space>
                      <FilterOutlined />
                      <span>Trạng thái</span>
                    </Space>
                  }
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                  className="status-select"
                  dropdownClassName="status-dropdown"
                >
                  <Option value="pending">
                    <Badge status="warning" text="Chờ duyệt" />
                  </Option>
                  <Option value="approved">
                    <Badge status="success" text="Đã duyệt" />
                  </Option>
                  <Option value="rejected">
                    <Badge status="error" text="Đã từ chối" />
                  </Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} md={7}>
              <div className="filter-item">
                <RangePicker
                  style={{ width: "100%" }}
                  value={filters.dateRange}
                  onChange={(dates) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: dates,
                    }))
                  }
                  placeholder={["Từ ngày", "Đến ngày"]}
                  className="date-picker"
                  format="DD/MM/YYYY"
                  suffixIcon={<CalendarOutlined />}
                />
              </div>
            </Col>

            <Col xs={24} md={3}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({
                    search: "",
                    status: null,
                    dateRange: null,
                  });
                  fetchRequests();
                }}
                className="reset-button"
              />
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
            pageSize: 10,
          }}
          className="data-table"
        />

        <ViewDetailsModal
          visible={isViewModalVisible}
          record={selectedRequest}
          onClose={() => {
            setIsViewModalVisible(false);
            setSelectedRequest(null);
          }}
        />

        <ApproveRequestModal
          visible={approveModalVisible}
          record={selectedRecord}
          suppliers={suppliers}
          onOk={handleApproveSubmit}
          onCancel={() => {
            setApproveModalVisible(false);
            setSelectedRecord(null);
          }}
        />
      </Card>
    </div>
  );
};

// Thêm styles
const style = document.createElement("style");
style.textContent = `
  .pig-import-approval {
    padding: 24px;
    background: #f0f2f5;
    min-height: 100vh;
  }

  .stats-card {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .main-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .custom-statistic .ant-statistic-title {
    font-size: 14px;
    color: rgba(0,0,0,0.45);
    margin-bottom: 8px;
  }

  .custom-statistic .ant-statistic-content {
    font-size: 24px;
    font-weight: 600;
  }

  .custom-table .ant-table {
    background: white;
    border-radius: 8px;
  }

  .custom-table .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }

  .custom-table .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }

  .custom-pagination {
    margin-top: 16px;
  }

  .ant-btn {
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 16px;
    font-weight: 500;
  }

  .ant-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }

  .ant-badge-status-text {
    margin-left: 8px;
    font-size: 14px;
  }

  .ant-tooltip {
    font-size: 13px;
  }

  @media (max-width: 768px) {
    .pig-import-approval {
      padding: 16px;
    }
    
    .card-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .refresh-button {
    background: white;
    border: 1px solid #d9d9d9;
    transition: all 0.3s;
  }

  .refresh-button:hover {
    color: #1890ff;
    border-color: #1890ff;
    background: #e6f7ff;
  }

  .custom-table {
    margin-top: 16px;
  }

  .filters-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .search-wrapper {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .search-input .ant-input {
    height: 40px;
    border-radius: 8px;
    padding-left: 40px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s;
    font-size: 14px;
  }

  .search-input .ant-input:hover {
    border-color: #40a9ff;
  }

  .search-input .ant-input:focus {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  .search-input .ant-input-prefix {
    margin-right: 8px;
  }

  .search-icon {
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    transition: all 0.3s;
  }

  .search-input:hover .search-icon,
  .search-input:focus-within .search-icon {
    color: #40a9ff;
  }

  .search-button {
    min-width: 120px;
    height: 40px;
    border-radius: 8px;
    font-weight: 500;
    background: #1890ff;
    border: none;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    transition: all 0.3s;
  }

  .search-button:hover {
    background: #40a9ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.25);
  }

  .search-button:active {
    background: #096dd9;
    transform: translateY(0);
  }

  .ant-input-clear-icon {
    color: rgba(0, 0, 0, 0.25);
    font-size: 14px;
    margin-right: 8px;
  }

  .ant-input-clear-icon:hover {
    color: rgba(0, 0, 0, 0.45);
  }

  .filter-item label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
  }

  @media (max-width: 576px) {
    .search-wrapper {
      flex-direction: column;
    }

    .search-button {
      width: 100%;
    }
  }

  // Thêm animation cho loading state
  .search-button.ant-btn-loading:before {
    opacity: 0.8;
  }

  // Cải thiện focus state
  .search-input .ant-input-affix-wrapper:focus,
  .search-input .ant-input-affix-wrapper-focused {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  // Thêm transition cho clear icon
  .ant-input-clear-icon {
    transition: all 0.3s;
  }

  // Cải thiện disabled state
  .search-input .ant-input[disabled] {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .search-button[disabled] {
    background: #f5f5f5;
    border-color: #d9d9d9;
    color: rgba(0, 0, 0, 0.25);
    box-shadow: none;
  }

  .status-select .ant-select-selector {
    height: 40px !important;
    border-radius: 6px !important;
    padding: 4px 11px !important;
  }

  .status-select .ant-select-selection-item {
    line-height: 32px !important;
  }

  .date-picker {
    border-radius: 6px;
  }

  .date-picker .ant-picker-input > input {
    height: 32px;
  }

  .ant-btn {
    height: 40px;
    border-radius: 6px;
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .data-table {
    margin-top: 24px;
  }

  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }

  @media (max-width: 768px) {
    .filter-card {
      padding: 16px;
    }
    
    .filter-item {
      margin-bottom: 16px;
    }
  }

  .filter-card {
    margin-bottom: 24px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
  }

  .filter-item {
    width: 100%;
  }

  .search-input {
    height: 36px;
  }

  .search-input .ant-input {
    height: 36px;
    padding: 4px 11px 4px 40px;
    border-radius: 6px;
    border: 1px solid #d9d9d9;
    transition: all 0.2s;
  }

  .search-input .ant-input:hover,
  .status-select:hover .ant-select-selector,
  .date-picker:hover {
    border-color: #40a9ff !important;
  }

  .search-input .ant-input:focus,
  .status-select .ant-select-focused .ant-select-selector,
  .date-picker-focused {
    border-color: #40a9ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
  }

  .search-icon {
    color: #bfbfbf;
    font-size: 14px;
  }

  .status-select .ant-select-selector {
    height: 36px !important;
    padding: 4px 11px !important;
    border-radius: 6px !important;
    display: flex;
    align-items: center;
  }

  .status-dropdown .ant-select-item {
    padding: 8px 12px;
    min-height: 32px;
    display: flex;
    align-items: center;
  }

  .date-picker {
    height: 36px;
    border-radius: 6px;
  }

  .date-picker .ant-picker-input > input {
    font-size: 14px;
  }

  .reset-button {
    height: 36px;
    width: 36px;
    padding: 0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8c8c8c;
    border: 1px solid #d9d9d9;
    background: transparent;
    transition: all 0.2s;
  }

  .reset-button:hover {
    color: #40a9ff;
    border-color: #40a9ff;
    background: rgba(24, 144, 255, 0.1);
  }

  .ant-badge-status-dot {
    width: 6px;
    height: 6px;
  }

  .ant-badge-status-text {
    font-size: 14px;
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    .filter-card {
      padding: 12px;
    }
    
    .reset-button {
      width: 100%;
    }
  }
`;
document.head.appendChild(style);

export default PigImportApproval;
