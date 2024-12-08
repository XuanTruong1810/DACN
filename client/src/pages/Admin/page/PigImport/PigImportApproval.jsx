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
  Badge,
  Tooltip,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DashboardOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import ViewDetailsModal from "./components/ViewDetailsModal";
import dayjs from "dayjs";
import axios from "axios";
import ApproveRequestModal from "./components/ApproveRequestModal";

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PigImportApproval = () => {
  const [importRequests, setImportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form] = Form.useForm();
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [filteredData, setFilteredData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    dateRange: null,
  });

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

      console.log("API RESPONSE data");
      console.log(response.data);
      const items = response.data?.data || [];

      const formattedRequests = items.map((request) => ({
        id: request.id,
        requestCode: request.id,
        supplier: request.suppliersName,
        requestDate: request.createdTime,
        quantity: request.expectedQuantity,
        requester: request.createByName,
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

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
        email: supplier.email,
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
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mã yêu cầu"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{
              width: 188,
              marginBottom: 8,
              display: "block",
              height: "32px",
              lineHeight: "32px",
              padding: "4px 11px",
            }}
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
        record.requestCode.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <RangePicker
            value={selectedKeys[0]}
            onChange={(dates) => {
              setSelectedKeys(dates ? [dates] : []);
            }}
            onPressEnter={() => confirm()}
            format="DD/MM/YYYY"
            style={{
              marginBottom: 8,
              width: 250,
            }}
            ranges={{
              "Hôm nay": [dayjs(), dayjs()],
              "7 ngày qua": [dayjs().subtract(7, "days"), dayjs()],
              "30 ngày qua": [dayjs().subtract(30, "days"), dayjs()],
              "Tháng này": [dayjs().startOf("month"), dayjs().endOf("month")],
            }}
          />
          <div>
            <Space>
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
                Đặt lại
              </Button>
            </Space>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value || value.length !== 2) return true;
        const recordDate = dayjs(record.requestDate).startOf("day");
        const startDate = dayjs(value[0]).startOf("day");
        const endDate = dayjs(value[1]).endOf("day");
        return (
          (recordDate.isAfter(startDate) && recordDate.isBefore(endDate)) ||
          recordDate.isSame(startDate) ||
          recordDate.isSame(endDate)
        );
      },
      sorter: (a, b) =>
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requester",
      key: "requester",
      width: 150,
      render: (requester) => requester || "N/A",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      width: 150,
      filters: suppliers.map((supplier) => ({
        text: supplier.label,
        value: supplier.label,
      })),
      onFilter: (value, record) => record.supplier === value,
      render: (supplier) =>
        supplier || <Badge status="default" text="Chưa xác nhận" />,
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
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
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

  const handleApprove = (record) => {
    setSelectedRecord(record);
    setApproveModalVisible(true);
  };

  const handleApproveSubmit = async (values) => {
    try {
      const formattedDate = values.expectedReceiveDate
        ? dayjs(values.expectedReceiveDate).toISOString()
        : null;

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/Accept?id=${
          selectedRecord.id
        }`,
        {
          suppliersId: values.supplierId,
          unitPrice: values.unitPrice,
          deposit: values.deposit,
          note: values.note || "",
          expectedReceiveDate: formattedDate,
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
  const filterData = useCallback(() => {
    let result = [...importRequests];
    if (filters.search) {
      result = result.filter(
        (item) =>
          item.requestCode
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

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

  useEffect(() => {
    filterData();
  }, [filterData, importRequests, filters]);

  return (
    <div className="pig-import-approval">
      <Card
        className="stats-card"
        style={{ marginBottom: 16, borderRadius: "12px" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div className="statistic-card total">
              <div className="statistic-icon">
                <DashboardOutlined />
              </div>
              <div className="statistic-content">
                <div className="statistic-title">Tổng số yêu cầu</div>
                <div className="statistic-value">{importRequests.length}</div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="statistic-card pending">
              <div className="statistic-icon">
                <CloseOutlined />
              </div>
              <div className="statistic-content">
                <div className="statistic-title">Chờ duyệt</div>
                <div className="statistic-value">
                  {
                    importRequests.filter((req) => req.status === "pending")
                      .length
                  }
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="statistic-card approved">
              <div className="statistic-icon">
                <CheckOutlined />
              </div>
              <div className="statistic-content">
                <div className="statistic-title">Đã duyệt</div>
                <div className="statistic-value">
                  {
                    importRequests.filter((req) => req.status === "approved")
                      .length
                  }
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="statistic-card rejected">
              <div className="statistic-icon">
                <CloseOutlined />
              </div>
              <div className="statistic-content">
                <div className="statistic-title">Từ chối</div>
                <div className="statistic-value">
                  {
                    importRequests.filter((req) => req.status === "rejected")
                      .length
                  }
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="main-card">
        <div className="card-header">
          <Title level={4}>Danh sách yêu cầu nhập heo</Title>
        </div>

        <Table
          columns={columns.filter((col) => col.dataIndex !== "pigType")}
          dataSource={importRequests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          rowClassName={(record) =>
            record.status === "pending" ? "pending-row" : ""
          }
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
            pageSize: 10,
          }}
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
    
    .reset-button {
      width: 100%;
    }
  }

  .statistic-card {
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .pending-row {
    background-color: #fffbe6;
    transition: all 0.3s;
  }

  .pending-row:hover {
    background-color: #fff7cc !important;
  }

  .stats-card {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .statistic-card {
    padding: 24px;
    border-radius: 16px;
    height: 100%;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .statistic-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .statistic-card.total {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border-left: 5px solid #096dd9;
  }

  .statistic-card.pending {
    background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%);
    border-left: 5px solid #faad14;
  }

  .statistic-card.approved {
    background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
    border-left: 5px solid #52c41a;
  }

  .statistic-card.rejected {
    background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
    border-left: 5px solid #ff4d4f;
  }

  .statistic-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    backdrop-filter: blur(8px);
  }

  .statistic-content {
    flex: 1;
  }

  .statistic-title {
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    margin-bottom: 8px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .statistic-value {
    color: white;
    font-size: 28px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .statistic-card {
      margin-bottom: 16px;
    }
  }

  .statistic-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .statistic-card:hover::before {
    opacity: 1;
  }

  .statistic-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    opacity: 0;
    transform: rotate(30deg);
    transition: opacity 0.3s ease;
  }

  .statistic-card:hover::after {
    opacity: 1;
  }
`;
document.head.appendChild(style);

export default PigImportApproval;
