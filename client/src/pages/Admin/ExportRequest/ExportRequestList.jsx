/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
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
  Menu,
  DatePicker,
  Row,
  Col,
  Statistic,
  Form,
  Select,
  Modal,
  Descriptions,
  Divider,
  InputNumber,
  Spin,
} from "antd";
import {
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { Column } from "@ant-design/plots";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ExportRequestList = () => {
  const [loading, setLoading] = useState(false);
  const [exportRequests, setExportRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState("pending");
  const navigate = useNavigate();
  const location = useLocation();

  // Thêm state cho thống kê
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPigs: 0,
  });

  // Thêm state cho modal
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedExportDetail, setSelectedExportDetail] = useState(null);

  // Thêm state cho modal tạo phiếu xuất
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Thêm state cho danh sách khách hàng
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchExportRequests();
    fetchCustomers();
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
      console.log(response);
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

  // Thêm hàm fetch danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Customer`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCustomers(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách khách hàng");
    }
  };

  // Lọc dữ liệu
  const getFilteredData = () => {
    let filteredData = exportRequests;

    // Lọc theo trạng thái trước
    if (filteredStatus) {
      filteredData = filteredData.filter(
        (item) => item.status === filteredStatus
      );
    }

    // Sau đó mới lọc theo các điều kiện khác
    return filteredData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.note &&
          item.note.toLowerCase().includes(searchText.toLowerCase()));

      const matchesDate =
        !dateRange ||
        (dayjs(item.requestDate).isAfter(dateRange[0]) &&
          dayjs(item.requestDate).isBefore(dateRange[1]));

      return matchesSearch && matchesDate;
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
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Thêm hàm xác nhận phiếu
  const handleApproveRequest = (record) => {
    setSelectedExportDetail(record);
    setIsCreateModalVisible(true);
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

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
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
            >
              Tìm
            </Button>
            <Button onClick={clearFilters} size="small">
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
      title: "Ngày đề xuất",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {/* Preset buttons */}
            <Space wrap>
              <Button
                size="small"
                onClick={() => {
                  setSelectedKeys([
                    [dayjs().startOf("day"), dayjs().endOf("day")],
                  ]);
                  confirm();
                }}
              >
                Hôm nay
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedKeys([
                    [
                      dayjs().subtract(1, "day").startOf("day"),
                      dayjs().subtract(1, "day").endOf("day"),
                    ],
                  ]);
                  confirm();
                }}
              >
                Hôm qua
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedKeys([
                    [
                      dayjs().subtract(7, "days").startOf("day"),
                      dayjs().endOf("day"),
                    ],
                  ]);
                  confirm();
                }}
              >
                7 ngày qua
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedKeys([
                    [
                      dayjs().subtract(30, "days").startOf("day"),
                      dayjs().endOf("day"),
                    ],
                  ]);
                  confirm();
                }}
              >
                30 ngày qua
              </Button>
            </Space>

            {/* Custom range picker */}
            <RangePicker
              value={selectedKeys[0]}
              onChange={(dates) => {
                setSelectedKeys(dates ? [dates] : []);
              }}
              style={{ width: "100%" }}
            />

            {/* Action buttons */}
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
              >
                Lọc
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  setSelectedKeys([]);
                  confirm();
                }}
                size="small"
              >
                Xóa
              </Button>
            </Space>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value || !Array.isArray(value) || value.length !== 2) return true;
        const recordDate = dayjs(record.requestDate);
        return recordDate.isAfter(value[0]) && recordDate.isBefore(value[1]);
      },
    },
    {
      title: "Người đề xuất",
      dataIndex: "createdByName",
      key: "createdByName",
      render: (name) => (
        <Tooltip title={name}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {name}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
      ],
      defaultFilteredValue: ["pending"],
      onFilter: (value, record) => record.status === value,
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
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ fontSize: "16px", color: "#1890ff", cursor: "pointer" }}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "pending" && isAdminRoute() && (
            <Tooltip title="Duyệt phiếu">
              <CheckCircleOutlined
                style={{
                  fontSize: "16px",
                  color: "#52c41a",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedExportDetail(record);
                  setIsCreateModalVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
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

  // Thêm component ViewDetailModal
  const ViewDetailModal = ({ visible, record, onClose }) => {
    return (
      <Modal
        title="Chi tiết phiếu đề xuất xuất"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        {record && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu">
                {record.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(record.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(record.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng heo">
                <Badge
                  count={record.details.length}
                  style={{
                    backgroundColor: "#52c41a",
                    fontSize: "14px",
                    minWidth: "45px",
                    height: "22px",
                    lineHeight: "22px",
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {record.note || "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Chi tiết heo xuất</Divider>

            <Table
              dataSource={record.details}
              columns={[
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
                    <span style={{ fontWeight: 500 }}>
                      {weight.toFixed(1)} kg
                    </span>
                  ),
                },
                {
                  title: "Tình trạng sức khỏe",
                  dataIndex: "healthStatus",
                  key: "healthStatus",
                  render: (status) => (
                    <Tag color={status === "good" ? "success" : "error"}>
                      {status === "good" ? "Tốt" : "Xấu"}
                    </Tag>
                  ),
                },
                {
                  title: "Ghi chú",
                  dataIndex: "note",
                  key: "note",
                  render: (note) => note || "-",
                },
              ]}
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>
    );
  };

  // Thêm hàm xử lý xem chi tiết
  const handleViewDetail = (record) => {
    setSelectedExportDetail(record);
    setIsViewModalVisible(true);
  };

  // Thêm component modal tạo phiếu xuất
  const CreateExportModal = ({ visible, record, onClose }) => {
    const [selectedCustomerInfo, setSelectedCustomerInfo] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [itemPrices, setItemPrices] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Hàm xử lý khi chọn khách hàng
    const handleCustomerSelect = (customerId) => {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      setSelectedCustomerInfo(selectedCustomer);
    };

    // Hàm tính toán giá cho từng item và tổng giá
    const calculatePrices = (unitPrice, weights) => {
      const newItemPrices = {};
      let newTotal = 0;

      record.details.forEach((item, index) => {
        const weight = weights?.[index]?.exportWeight || item.currentWeight;
        const price = weight * unitPrice;
        newItemPrices[item.pigId] = price;
        newTotal += price;
      });

      setItemPrices(newItemPrices);
      setTotalPrice(newTotal);
    };

    // Xử lý khi đơn giá thay đổi
    const handleUnitPriceChange = (value) => {
      const weights = form.getFieldValue("pigs");
      calculatePrices(value, weights);
    };

    // Xử lý khi cân nặng thay đổi
    const handleWeightChange = (value, index) => {
      const unitPrice = form.getFieldValue("unitPrice") || 0;
      const weights = form.getFieldValue("pigs") || [];
      weights[index] = { exportWeight: value };
      calculatePrices(unitPrice, weights);
    };

    const handleCreateExport = async (values) => {
      setSubmitting(true);
      try {
        // 1. Call API approve request first
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/v1/pigExport/request/${
            record.id
          }/approve`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // 2. Prepare data for create export
        const exportData = {
          customerId: values.customerId,
          exportDate: values.exportDate.toISOString(),
          unitPrice: values.unitPrice,
          details: record.details.map((pig, index) => ({
            pigId: pig.pigId,
            actualWeight: values.pigs[index].exportWeight || pig.currentWeight,
          })),
        };

        // 3. Call API create export
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/pigExport/export`,
          exportData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        message.success("Duyệt phiếu và tạo phiếu xuất thành công");
        onClose();
        fetchExportRequests(); // Refresh list
      } catch (error) {
        console.error("Error:", error);
        message.error(
          "Lỗi khi duyệt phiếu: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setSubmitting(false);
      }
    };

    if (!record) return null;

    return (
      <Modal
        title="Tạo phiếu xuất heo"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={() => form.submit()}
          >
            Xác nhận xuất
          </Button>,
        ]}
        width={800}
        maskClosable={!submitting}
        closable={!submitting}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateExport}
          initialValues={{
            exportDate: dayjs(),
          }}
        >
          <Card className="mb-4">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="customerId"
                  label={<Text strong>Khách hàng</Text>}
                  rules={[
                    { required: true, message: "Vui lòng chọn khách hàng" },
                  ]}
                >
                  <Select
                    placeholder="Chọn khách hàng"
                    loading={!customers.length}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCustomerSelect}
                  >
                    {customers.map((customer) => (
                      <Select.Option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="exportDate"
                  label={<Text strong>Ngày xuất</Text>}
                  initialValue={dayjs()}
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày xuất" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày xuất"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unitPrice"
                  label={<Text strong>Đơn giá (VNĐ/kg)</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={handleUnitPriceChange}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Thêm phần hiển thị thông tin khách hàng */}
            {selectedCustomerInfo && (
              <>
                <Divider />
                <Descriptions title="Thông tin khách hàng" column={2}>
                  <Descriptions.Item label="Mã khách hàng">
                    <Tag color="blue">{selectedCustomerInfo.id}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên khách hàng">
                    <Text strong>{selectedCustomerInfo.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên công ty">
                    <Text strong>
                      {selectedCustomerInfo.companyName || "-"}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {selectedCustomerInfo.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedCustomerInfo.email || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {selectedCustomerInfo.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedCustomerInfo.note || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>

          <Card title="Danh sách heo xuất" className="mt-4">
            <Table
              dataSource={record.details || []}
              columns={[
                {
                  title: "Mã heo",
                  dataIndex: "pigId",
                  key: "pigId",
                  render: (id) => <Tag color="blue">{id}</Tag>,
                },
                {
                  title: "Tình trạng sức khỏe",
                  dataIndex: "healthStatus",
                  key: "healthStatus",
                  render: (status) => (
                    <Tag color={status === "good" ? "success" : "error"}>
                      {status === "good" ? "Tốt" : "Xấu"}
                    </Tag>
                  ),
                },
                {
                  title: "Tiêm vaccine",
                  dataIndex: "isVaccinationComplete",
                  key: "isVaccinationComplete",
                  render: () => (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Đã tiêm đủ
                    </Tag>
                  ),
                },
                {
                  title: "Cân nặng hiện tại (kg)",
                  dataIndex: "currentWeight",
                  key: "currentWeight",
                  render: (weight) => (
                    <span style={{ fontWeight: 500 }}>
                      {weight.toFixed(1)} kg
                    </span>
                  ),
                },
                {
                  title: "Cân nặng xuất (kg)",
                  dataIndex: "exportWeight",
                  key: "exportWeight",
                  render: (_, record, index) => (
                    <Form.Item
                      name={["pigs", index, "exportWeight"]}
                      initialValue={record.currentWeight}
                      style={{ margin: 0 }}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={0.1}
                        precision={1}
                        onChange={(value) => handleWeightChange(value, index)}
                      />
                    </Form.Item>
                  ),
                },
                {
                  title: "Thành tiền (VNĐ)",
                  key: "totalPrice",
                  render: (_, record) => (
                    <Text strong style={{ color: "#1890ff" }}>
                      {new Intl.NumberFormat("vi-VN").format(
                        itemPrices[record.pigId] || 0
                      )}
                    </Text>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text strong>Tổng cộng ({record.details.length} con)</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      {record.details
                        .reduce((sum, _, index) => {
                          const weight =
                            form.getFieldValue([
                              "pigs",
                              index,
                              "exportWeight",
                            ]) || record.details[index].currentWeight;
                          return sum + weight;
                        }, 0)
                        .toFixed(1)}{" "}
                      kg
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                      {new Intl.NumberFormat("vi-VN").format(totalPrice)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Form>
        {submitting && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Space direction="vertical" align="center">
              <Spin size="large" />
              <Text>Đang xử lý xuất heo...</Text>
            </Space>
          </div>
        )}
      </Modal>
    );
  };

  // Thêm hàm tính tiền
  const calculateItemPrice = (exportWeight, unitPrice) => {
    return (exportWeight || 0) * (unitPrice || 0);
  };

  // Thêm hàm kiểm tra URL
  const isAdminRoute = () => {
    return location.pathname.includes("/admin/exports");
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "#f6ffed" }}>
            <Statistic
              title={<Text strong>Tổng số phiếu</Text>}
              value={statistics.total}
              prefix={<ExportOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "#e6f7ff" }}>
            <Statistic
              title={<Text strong>Chờ duyệt</Text>}
              value={statistics.pending}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "#f6ffed" }}>
            <Statistic
              title={<Text strong>Đã duyệt</Text>}
              value={statistics.approved}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "#fff7e6" }}>
            <Statistic
              title={<Text strong>Tổng số heo</Text>}
              value={statistics.totalPigs}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<UnorderedListOutlined style={{ color: "#fa8c16" }} />}
              suffix="con"
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
        className="custom-card"
        style={{ borderRadius: 8 }}
      >
        <Table
          columns={columns}
          dataSource={getFilteredData()}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} phiếu`,
          }}
          defaultFilteredValue={{
            status: ["pending"],
          }}
          onChange={(pagination, filters, sorter) => {
            // Cập nhật lại filteredStatus khi filter thay đổi
            if (filters.status && filters.status.length > 0) {
              setFilteredStatus(filters.status[0]);
            } else {
              setFilteredStatus("pending"); // Reset về pending khi clear filter
            }
          }}
        />
      </Card>

      <ViewDetailModal
        visible={isViewModalVisible}
        record={selectedExportDetail}
        onClose={() => {
          setIsViewModalVisible(false);
          setSelectedExportDetail(null);
        }}
      />

      <CreateExportModal
        visible={isCreateModalVisible}
        record={selectedExportDetail}
        onClose={() => {
          setIsCreateModalVisible(false);
          setSelectedExportDetail(null);
          form.resetFields();
          fetchExportRequests(); // Refresh list after closing
        }}
      />
    </div>
  );
};

export default ExportRequestList;
