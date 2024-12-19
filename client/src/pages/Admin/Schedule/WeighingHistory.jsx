/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  DatePicker,
  Badge,
  Input,
  Button,
} from "antd";
import {
  HistoryOutlined,
  FileTextOutlined,
  ContainerOutlined,
  DashboardOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WeighingHistory = () => {
  const [loading, setLoading] = useState(false);
  const [weighingHistory, setWeighingHistory] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có phải đang ở route dispatch hay không
  const isDispatchRoute = location.pathname.includes("/dispatch");

  // Thống kê
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    totalPigs: 0,
    averageWeight: 0,
  });

  // Fetch data và tính toán thống kê
  const fetchWeighingHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/WeighingHistory`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data.data;
      setWeighingHistory(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeighingHistory();
  }, []);

  const calculateStatistics = (data) => {
    const stats = {
      totalRecords: data.length,
      totalPigs: data.reduce((sum, record) => sum + record.totalPigs, 0),
      averageWeight:
        data.reduce((sum, record) => sum + record.averageWeight, 0) /
        (data.length || 1),
    };
    setStatistics(stats);
  };

  // Thêm style cho phần tìm kiếm
  const searchInputStyle = {
    searchContainer: {
      padding: "12px",
      width: "300px",
    },
    searchInput: {
      marginBottom: "12px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
    },
    button: {
      width: "48%",
    },
  };

  // Thêm các preset ranges cho date picker
  const dateRangePresets = [
    {
      label: "Hôm nay",
      value: [dayjs().startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "Hôm qua",
      value: [
        dayjs().subtract(1, "day").startOf("day"),
        dayjs().subtract(1, "day").endOf("day"),
      ],
    },
    {
      label: "7 ngày qua",
      value: [dayjs().subtract(7, "days").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "30 ngày qua",
      value: [
        dayjs().subtract(30, "days").startOf("day"),
        dayjs().endOf("day"),
      ],
    },
    {
      label: "Tháng này",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Tháng trước",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
  ];

  // Columns cho bảng chính
  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 180,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={searchInputStyle.searchContainer}>
          <Input
            placeholder="Nhập mã phiếu cần tìm..."
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={searchInputStyle.searchInput}
            prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
            allowClear
          />
          <div style={searchInputStyle.buttonContainer}>
            <Button
              type="primary"
              onClick={() => confirm()}
              style={searchInputStyle.button}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              style={searchInputStyle.button}
            >
              Đặt lại
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? "#1890ff" : undefined,
            fontSize: "16px",
          }}
        />
      ),
      onFilter: (value, record) =>
        record.id.toLowerCase().includes(value.toLowerCase()),
      render: (id) => {
        const searchValue = columns[0].filteredValue?.[0];
        if (!searchValue) {
          return (
            <Tag color="blue" icon={<FileTextOutlined />}>
              {id}
            </Tag>
          );
        }

        const index = id.toLowerCase().indexOf(searchValue.toLowerCase());
        if (index === -1) {
          return (
            <Tag color="blue" icon={<FileTextOutlined />}>
              {id}
            </Tag>
          );
        }

        const beforeStr = id.substring(0, index);
        const searchStr = id.substring(index, index + searchValue.length);
        const afterStr = id.substring(index + searchValue.length);

        return (
          <Tag color="blue" icon={<FileTextOutlined />}>
            {beforeStr}
            <span
              style={{
                backgroundColor: "#ffd591",
                padding: "0 1px",
                borderRadius: "2px",
              }}
            >
              {searchStr}
            </span>
            {afterStr}
          </Tag>
        );
      },
    },
    {
      title: "Ngày cân",
      dataIndex: "weighingDate",
      key: "weighingDate",
      width: 150,
      render: (date) => (
        <Badge status="processing" text={dayjs(date).format("DD/MM/YYYY")} />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 12 }}>
          <RangePicker
            presets={dateRangePresets}
            showTime={false}
            format="DD/MM/YYYY"
            value={selectedKeys[0]}
            onChange={(dates) => {
              setSelectedKeys(dates ? [dates] : []);
              if (dates) {
                confirm();
              }
            }}
            allowClear
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: "48%" }}
            >
              Lọc
            </Button>
            <Button
              onClick={() => {
                setSelectedKeys([]);
                confirm();
              }}
              size="small"
              style={{ width: "48%" }}
            >
              Đặt lại
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined
          style={{
            color: filtered ? "#1890ff" : undefined,
            fontSize: "16px",
          }}
        />
      ),
      onFilter: (value, record) => {
        if (!value || value.length !== 2) return true;
        const recordDate = dayjs(record.weighingDate);
        return (
          recordDate.isAfter(value[0], "day") &&
          recordDate.isBefore(value[1], "day")
        );
      },
      sorter: (a, b) => {
        const dateA = dayjs(a.weighingDate);
        const dateB = dayjs(b.weighingDate);
        return dateB.diff(dateA);
      },
      defaultSortOrder: "ascend",
    },
    {
      title: "Số lượng heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      width: 150,
      render: (total) => (
        <Tag color="cyan" icon={<ContainerOutlined />}>
          {total} con
        </Tag>
      ),
      sorter: (a, b) => a.totalPigs - b.totalPigs,
    },
    {
      title: "Trọng lượng TB (kg)",
      dataIndex: "averageWeight",
      key: "averageWeight",
      width: 180,
      render: (weight) => (
        <Tag color="green" icon={<DashboardOutlined />}>
          {weight.toFixed(2)} kg
        </Tag>
      ),
      sorter: (a, b) => a.averageWeight - b.averageWeight,
    },
    {
      title: "Người cân",
      dataIndex: "createdByName",
      key: "createdByName",
      width: 180,
      render: (name) => (
        <Tag color="volcano" icon={<TeamOutlined />}>
          {name}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      width: 250,
    },
  ];

  // Columns cho bảng chi tiết
  const detailColumns = [
    {
      title: "Mã heo",
      dataIndex: "pigId",
      key: "pigId",
      width: 180,
      render: (id) => <Tag color="purple">{id}</Tag>,
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      width: 180,
      render: (weight) => (
        <Tag color="orange" icon={<DashboardOutlined />}>
          {weight.toFixed(2)} kg
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      width: 250,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3}>
              <HistoryOutlined /> Lịch sử cân heo
            </Title>
          </Col>
          {isDispatchRoute && (
            <Col>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => navigate("/dispatch")}
                size="large"
              >
                Lịch cân heo
              </Button>
            </Col>
          )}
        </Row>

        {/* Thống kê */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card
              style={{ height: "100%" }}
              styles={{
                backgroundColor: "#e6f7ff",
                padding: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      color: "#0050b3",
                      fontSize: "16px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Tổng số phiếu cân
                  </span>
                }
                value={statistics.totalRecords}
                prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#0050b3",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{ height: "100%" }}
              styles={{
                backgroundColor: "#f6ffed",
                padding: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      color: "#389e0d",
                      fontSize: "16px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Tổng số heo đã cân
                  </span>
                }
                value={statistics.totalPigs}
                prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#389e0d",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
                suffix="con"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{ height: "100%" }}
              bodyStyle={{
                backgroundColor: "#fff7e6",
                padding: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      color: "#d46b08",
                      fontSize: "16px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Trọng lượng trung bình
                  </span>
                }
                value={statistics.averageWeight.toFixed(2)}
                prefix={<DashboardOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{
                  color: "#d46b08",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
                suffix="kg"
              />
            </Card>
          </Col>
        </Row>

        {/* Bảng lịch sử */}
        <Table
          columns={columns}
          dataSource={weighingHistory}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1300 }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            expandedRowRender: (record) => (
              <Card size="small" title="Chi tiết cân từng heo">
                <Table
                  columns={detailColumns}
                  dataSource={record.details}
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default WeighingHistory;
