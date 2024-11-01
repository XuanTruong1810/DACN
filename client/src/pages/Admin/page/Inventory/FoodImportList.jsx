// src/pages/Admin/page/Inventory/FoodImportList/index.jsx
import React, { useState, useEffect } from "react";
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
  InputNumber,
  Divider,
  Statistic,
} from "antd";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { mockBills } from "./mock/FoodImportListdata";
import ReceiveModal from "./components/ReceiveModal";
import "./styles/FoodImportList.css";

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const FoodImportList = () => {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: [],
  });
  const [receiveForm] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalBills: 0,
    pendingBills: 0,
    totalAmount: 0,
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [searchText, filters]);

  useEffect(() => {
    const summary = bills.reduce(
      (acc, bill) => ({
        totalBills: acc.totalBills + 1,
        pendingBills: acc.pendingBills + (bill.status === "pending" ? 1 : 0),
        totalAmount: acc.totalAmount + bill.totalAmount,
      }),
      { totalBills: 0, pendingBills: 0, totalAmount: 0 }
    );

    setSummaryData(summary);
  }, [bills]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let filteredData = [...mockBills];

      const filterFunctions = {
        search: (data) =>
          !searchText
            ? data
            : data.filter(
                (bill) =>
                  bill.id.toLowerCase().includes(searchText.toLowerCase()) ||
                  bill.supplier.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
              ),
        status: (data) =>
          filters.status === "all"
            ? data
            : data.filter((bill) => bill.status === filters.status),
        dateRange: (data) =>
          !filters.dateRange?.length
            ? data
            : data.filter((bill) => {
                const billDate = dayjs(bill.createdAt);
                return (
                  billDate.isAfter(filters.dateRange[0], "day") &&
                  billDate.isBefore(filters.dateRange[1], "day")
                );
              }),
        amount: (data) =>
          data.filter((bill) => {
            const valid = {
              min: !filters.minAmount || bill.totalAmount >= filters.minAmount,
              max: !filters.maxAmount || bill.totalAmount <= filters.maxAmount,
            };
            return valid.min && valid.max;
          }),
      };

      filteredData = Object.values(filterFunctions).reduce(
        (data, filterFn) => filterFn(data),
        filteredData
      );

      setBills(filteredData);

      const summary = filteredData.reduce(
        (acc, bill) => ({
          totalBills: acc.totalBills + 1,
          pendingBills: acc.pendingBills + (bill.status === "pending" ? 1 : 0),
          totalAmount: acc.totalAmount + bill.totalAmount,
        }),
        { totalBills: 0, pendingBills: 0, totalAmount: 0 }
      );
      setSummaryData(summary);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = (record) => {
    setSelectedBill(record);
    setReceiveModalVisible(true);
    receiveForm.setFieldsValue({
      receiveDate: dayjs(),
      items: record.items.map(() => ({ receivedQuantity: 0 })),
    });
  };

  const handlePrint = (record) => {
    message.loading({ content: "Đang chuẩn bị in...", key: "print" });
    setTimeout(() => {
      message.success({
        content: "Đã gửi lệnh in thành công!",
        key: "print",
        duration: 2,
      });
    }, 1000);
  };

  const handleFinishReceive = async (values) => {
    try {
      setLoading(true);
      // Validate received quantities
      const hasInvalidQuantity = values.items.some(
        (item, index) =>
          item.receivedQuantity > selectedBill.items[index].quantity
      );

      if (hasInvalidQuantity) {
        message.error("Số lượng nhận không được vượt quá số lượng đặt!");
        return;
      }

      // API call simulation
      await new Promise((r) => setTimeout(r, 1000));

      message.success("Đã xác nhận nhận hàng thành công!");
      setReceiveModalVisible(false);
      receiveForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.loading({ content: "Đang xuất dữ liệu...", key: "export" });
    setTimeout(() => {
      message.success({
        content: "Xuất dữ liệu thành công!",
        key: "export",
        duration: 2,
      });
    }, 1000);
  };

  const handleRefresh = () => {
    setSearchText("");
    setFilters({
      status: "all",
      dateRange: [],
    });
    fetchData();
  };

  const handleBatchPrint = () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một phiếu!");
      return;
    }
    message.loading({ content: "Đang chuẩn bị in...", key: "batchPrint" });
    setTimeout(() => {
      message.success({
        content: `Đã gửi lệnh in ${selectedRows.length} phiếu!`,
        key: "batchPrint",
        duration: 2,
      });
    }, 1000);
  };

  const handleFilterChange = (values) => {
    setFilters((prev) => ({
      ...prev,
      ...values,
    }));
    setCurrentPage(1);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left",
      render: (id) => (
        <Tag color="blue" className="bill-id">
          {id}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </Space>
      ),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier) => supplier.name,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <span className="amount">{amount.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Badge
          status={
            status === "pending"
              ? "warning"
              : status === "received"
              ? "success"
              : "default"
          }
          text={
            status === "pending"
              ? "Chờ nhận hàng"
              : status === "received"
              ? "Đã nhận hàng"
              : "Khác"
          }
          className="status-badge"
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle" className="action-space">
          {record.status === "pending" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReceive(record)}
              className="receive-button"
            >
              Nhận hàng
            </Button>
          )}
          <Button.Group>
            <Tooltip title="Xem chi tiết">
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>
            <Tooltip title="In phiếu">
              <Button
                icon={<PrinterOutlined />}
                onClick={() => handlePrint(record)}
              />
            </Tooltip>
          </Button.Group>
        </Space>
      ),
    },
  ];

  return (
    <div className="food-import-list">
      <Row gutter={[16, 16]} className="summary-section">
        <Col xs={24} sm={8}>
          <Card className="summary-card" hoverable>
            <Statistic
              title="Tổng số phiếu"
              value={summaryData.totalBills}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="summary-card">
            <Statistic
              title="Chờ nhận hàng"
              value={summaryData.pendingBills}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="summary-card">
            <Statistic
              title="Tổng giá trị"
              value={summaryData.totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
      </Row>

      <Card className="page-header">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={3}>
              <ShoppingCartOutlined /> Danh sách phiếu nhập thức ăn
            </Title>
          </Col>
          <Col xs={24} md={16}>
            <Space size="middle" className="header-actions">
              <Search
                placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp..."
                allowClear
                enterButton
                className="search-input"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
                type={
                  Object.keys(filters).some(
                    (key) =>
                      filters[key] !== "all" && filters[key]?.length !== 0
                  )
                    ? "primary"
                    : "default"
                }
              >
                Bộ lọc{" "}
                {Object.keys(filters).some(
                  (key) => filters[key] !== "all" && filters[key]?.length !== 0
                ) &&
                  `(${
                    Object.keys(filters).filter(
                      (key) =>
                        filters[key] !== "all" && filters[key]?.length !== 0
                    ).length
                  })`}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        className="table-card"
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handleBatchPrint}
              disabled={selectedRows.length === 0}
            >
              In đã chọn ({selectedRows.length})
            </Button>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={bills}
          rowKey="id"
          loading={loading}
          rowSelection={{
            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
            selectedRowKeys: selectedRows.map((row) => row.id),
          }}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: bills.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} phiếu`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1300 }}
          className="custom-table"
        />
      </Card>

      <Drawer
        title={
          <Space>
            <FilterOutlined />
            <span>Bộ lọc tìm kiếm</span>
          </Space>
        }
        width={380}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        extra={
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setFilters({
                status: "all",
                dateRange: [],
                minAmount: null,
                maxAmount: null,
              });
              setFilterDrawerVisible(false);
            }}
          >
            Xóa bộ lọc
          </Button>
        }
      >
        <Form
          layout="vertical"
          initialValues={filters}
          onValuesChange={(_, allValues) => handleFilterChange(allValues)}
        >
          <Form.Item label="Thời gian">
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange({ dateRange: dates })}
              allowClear
            />
          </Form.Item>

          <Divider />

          <Form.Item label="Trạng thái">
            <Select
              style={{ width: "100%" }}
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value })}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">
                <Badge status="warning" text="Chờ nhận hàng" />
              </Select.Option>
              <Select.Option value="received">
                <Badge status="success" text="Đã nhận hàng" />
              </Select.Option>
              <Select.Option value="cancelled">
                <Badge status="error" text="Đã hủy" />
              </Select.Option>
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item label="Giá trị">
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                style={{ width: "50%" }}
                placeholder="Từ"
                value={filters.minAmount}
                onChange={(value) => handleFilterChange({ minAmount: value })}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
              />
              <InputNumber
                style={{ width: "50%" }}
                placeholder="Đến"
                value={filters.maxAmount}
                onChange={(value) => handleFilterChange({ maxAmount: value })}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
              />
            </Space.Compact>
          </Form.Item>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 16px",
              background: "#fff",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space style={{ float: "right" }}>
              <Button onClick={() => setFilterDrawerVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                onClick={() => setFilterDrawerVisible(false)}
              >
                Áp dụng
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>

      <ReceiveModal
        visible={receiveModalVisible}
        onCancel={() => {
          setReceiveModalVisible(false);
          receiveForm.resetFields();
        }}
        selectedBill={selectedBill}
        form={receiveForm}
        loading={loading}
        onFinish={handleFinishReceive}
      />
    </div>
  );
};

export default FoodImportList;
