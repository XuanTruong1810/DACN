import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Button,
  message,
  Tooltip,
  Badge,
  Space,
  Input,
  Dropdown,
  Menu,
  DatePicker,
  Row,
  Col,
  Statistic,
  Form,
  Select,
  Modal,
} from "antd";
import {
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  PercentageOutlined,
  CalculatorOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Column } from "@ant-design/plots";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ExportRequestList = () => {
  const [loading, setLoading] = useState(false);
  const [exportRequests, setExportRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState(null);
  const navigate = useNavigate();

  // Thêm state cho thống kê
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPigs: 0,
  });

  useEffect(() => {
    fetchExportRequests();
  }, []);

  const fetchExportRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/pigExport/request`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = response.data.data;
      setExportRequests(data);

      // Tính toán thống kê
      const stats = {
        total: data.length,
        pending: data.filter((r) => r.status === "pending").length,
        approved: data.filter((r) => r.status === "approved").length,
        rejected: data.filter((r) => r.status === "rejected").length,
        totalPigs: data.reduce((sum, r) => sum + r.details.length, 0),
      };
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching export requests:", error);
      message.error("Không thể tải danh sách phiếu đề xuất xuất");
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu
  const getFilteredData = () => {
    return exportRequests.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.note &&
          item.note.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus = !filteredStatus || item.status === filteredStatus;

      const matchesDate =
        !dateRange ||
        (dayjs(item.requestDate).isAfter(dateRange[0]) &&
          dayjs(item.requestDate).isBefore(dateRange[1]));

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: {
        color: "processing",
        icon: <ClockCircleOutlined />,
        text: "Chờ duyệt",
      },
      approved: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đã duyệt",
      },
      rejected: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Từ chối",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Thêm hàm xác nhận phiếu
  const handleApproveRequest = async (record) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/pigExport/request/${
          record.id
        }/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Xác nhận phiếu thành công");
      fetchExportRequests(); // Refresh danh sách
    } catch (error) {
      console.error("Error approving request:", error);
      message.error(
        "Không thể xác nhận phiếu: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  // Thêm hàm từ chối phiếu
  const handleRejectRequest = async (record, rejectReason) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/pigExport/request/${
          record.id
        }/reject`,
        { reason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Từ chối phiếu thành công");
      fetchExportRequests(); // Refresh danh sách
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error(
        "Không thể từ chối phiếu: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  // Cập nhật menu thao tác
  const moreMenu = (record) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => navigate(`/admin/exports/animals/${record.id}`)}
      >
        Xem chi tiết
      </Menu.Item>
      {record.status === "pending" && (
        <>
          <Menu.Item
            key="approve"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Xác nhận duyệt phiếu",
                content: "Bạn có chắc chắn muốn duyệt phiếu này?",
                onOk: () => handleApproveRequest(record),
                okText: "Xác nhận",
                cancelText: "Hủy",
              });
            }}
          >
            Duyệt phiếu
          </Menu.Item>
          <Menu.Item
            key="reject"
            icon={<CloseCircleOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Từ chối phiếu",
                content: (
                  <Input.TextArea
                    placeholder="Nhập lý do từ chối"
                    onChange={(e) => (rejectReason = e.target.value)}
                  />
                ),
                onOk: () => handleRejectRequest(record, rejectReason),
                okText: "Xác nhận",
                cancelText: "Hủy",
              });
            }}
          >
            Từ chối
          </Menu.Item>
        </>
      )}
      <Menu.Item key="print" icon={<PrinterOutlined />}>
        In phiếu
      </Menu.Item>
      <Menu.Item key="export" icon={<FileExcelOutlined />}>
        Xuất Excel
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
      width: 150,
    },
    {
      title: "Ngày tạo",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </Space>
      ),
      sorter: (a, b) =>
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
      width: 120,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (email) => (
        <Tooltip title={email}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {email}
          </Text>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: "Số lượng heo",
      dataIndex: "details",
      key: "pigCount",
      render: (details) => (
        <Badge
          count={details.length}
          style={{
            backgroundColor: "#52c41a",
            fontWeight: "bold",
          }}
        />
      ),
      width: 120,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <Tooltip title={note}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {note || "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Dropdown overlay={moreMenu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const detailColumns = [
      {
        title: "Mã heo",
        dataIndex: "pigId",
        key: "pigId",
        render: (id) => <Tag color="blue">{id}</Tag>,
      },
      {
        title: "Cân nặng (kg)",
        dataIndex: "currentWeight",
        key: "currentWeight",
        render: (weight) => (
          <span style={{ fontWeight: 500 }}>{weight.toFixed(1)} kg</span>
        ),
      },
      {
        title: "Tình trạng sức khỏe",
        dataIndex: "healthStatus",
        key: "healthStatus",
        render: (status) => (
          <Tag
            icon={
              status === "good" ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
            color={status === "good" ? "success" : "error"}
          >
            {status === "good" ? "Tốt" : "Xấu"}
          </Tag>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        render: (note) => (
          <Tooltip title={note}>
            <Text ellipsis style={{ maxWidth: 200 }}>
              {note || "-"}
            </Text>
          </Tooltip>
        ),
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.details}
        pagination={false}
        rowKey="pigId"
        size="small"
      />
    );
  };

  // Component biểu đồ
  const StatisticsCharts = ({ data }) => {
    const chartData = [
      { type: "Chờ duyệt", value: statistics.pending },
      { type: "Đã duyệt", value: statistics.approved },
      { type: "Từ chối", value: statistics.rejected },
    ];

    const config = {
      data: chartData,
      xField: "type",
      yField: "value",
      label: {
        position: "middle",
        style: {
          fill: "#FFFFFF",
          opacity: 0.6,
        },
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      meta: {
        type: {
          alias: "Trạng thái",
        },
        value: {
          alias: "Số lượng",
        },
      },
    };

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Thống kê trạng thái phiếu đề xuất" bordered={false}>
            <Column {...config} />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số phiếu"
              value={statistics.total}
              prefix={<ExportOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pending}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Đã duyệt"
              value={statistics.approved}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Từ chối"
              value={statistics.rejected}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số heo"
              value={statistics.totalPigs}
              suffix="con"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Tỷ lệ duyệt"
              value={
                statistics.total
                  ? ((statistics.approved / statistics.total) * 100).toFixed(1)
                  : 0
              }
              suffix="%"
              valueStyle={{ color: "#722ed1" }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic
              title="Trung bình/phiếu"
              value={
                statistics.total
                  ? (statistics.totalPigs / statistics.total).toFixed(1)
                  : 0
              }
              suffix="con"
              valueStyle={{ color: "#13c2c2" }}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <ExportOutlined /> Danh sách phiếu đề xuất xuất
          </Title>
        }
        extra={
          <Space>
            <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={() => navigate("/admin/exports/animals/create")}
            >
              Tạo đề xuất xuất
            </Button>
          </Space>
        }
        className="custom-card"
        style={{ borderRadius: 8 }}
      >
        {/* Thanh công cụ tìm kiếm và lọc */}
        <Space style={{ marginBottom: 16 }} size="middle">
          <Input
            placeholder="Tìm kiếm theo mã phiếu, người tạo..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <RangePicker onChange={setDateRange} style={{ width: 300 }} />
          <Button icon={<FilterOutlined />}>Lọc</Button>
        </Space>

        <Table
          loading={loading}
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} phiếu`,
          }}
        />
      </Card>
    </div>
  );
};

export default ExportRequestList;
