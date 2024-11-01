import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
} from "antd";
import {
  EyeOutlined,
  FilterOutlined,
  PrinterOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ExportList = () => {
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [exports, setExports] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: [],
    customer: [],
    search: "",
  });

  // Fake data
  const fakeExports = [
    {
      id: "PXC001",
      date: "2024-03-15",
      customer: "Công ty CP Chăn nuôi ABC",
      totalPigs: 25,
      totalWeight: 2500,
      totalAmount: 187500000,
      status: "completed",
      note: "Xuất bán thương phẩm",
      type: "sale",
    },
    {
      id: "PXC002",
      date: "2024-03-14",
      customer: "Công ty TNHH Thực phẩm XYZ",
      totalPigs: 15,
      totalWeight: 1480,
      totalAmount: 111000000,
      status: "pending",
      note: "Đang chờ thanh toán",
      type: "sale",
    },
    {
      id: "PXC003",
      date: "2024-03-13",
      customer: "Lò mổ Thành Công",
      totalPigs: 30,
      totalWeight: 3000,
      totalAmount: 225000000,
      status: "completed",
      note: "Đã thanh toán đủ",
      type: "sale",
    },
    {
      id: "PXC004",
      date: "2024-03-12",
      customer: "Công ty TNHH MTV Chăn nuôi DEF",
      totalPigs: 5,
      totalWeight: 500,
      totalAmount: 0,
      status: "cancelled",
      note: "Hủy do không đạt thỏa thuận giá",
      type: "sale",
    },
    {
      id: "PXC005",
      date: "2024-03-11",
      customer: "Heo chết do bệnh",
      totalPigs: 2,
      totalWeight: 180,
      totalAmount: 0,
      status: "completed",
      note: "Tiêu hủy theo quy định",
      type: "dead",
    },
  ];

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      render: (id) => <Link to={`/admin/exports/${id}`}>{id}</Link>,
    },
    {
      title: "Ngày xuất",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Khách hàng/Lý do",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Số lượng",
      dataIndex: "totalPigs",
      key: "totalPigs",
      render: (total) => `${total} con`,
      sorter: (a, b) => a.totalPigs - b.totalPigs,
    },
    {
      title: "Tổng KL (kg)",
      dataIndex: "totalWeight",
      key: "totalWeight",
      render: (weight) => `${weight} kg`,
      sorter: (a, b) => a.totalWeight - b.totalWeight,
    },
    {
      title: "Thành tiền (VNĐ)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => amount.toLocaleString("vi-VN"),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          completed: { color: "success", text: "Hoàn thành" },
          pending: { color: "processing", text: "Đang xử lý" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        return (
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => handleView(record),
          },
          {
            key: "print",
            label: "In phiếu",
            icon: <PrinterOutlined />,
            onClick: () => handlePrint(record),
          },
          record.status !== "completed" && {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record),
          },
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const FilterSection = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: "100%" }}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Trạng thái"
            onChange={(values) => setFilters({ ...filters, status: values })}
            allowClear
          >
            <Option value="completed">Hoàn thành</Option>
            <Option value="pending">Đang xử lý</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm theo mã phiếu, khách hàng"
            prefix={<SearchOutlined />}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
        </Col>
      </Row>
    </Card>
  );

  const handleView = (record) => {
    Modal.info({
      title: `Chi tiết phiếu xuất ${record.id}`,
      width: 700,
      content: (
        <div style={{ marginTop: 16 }}>
          <p>
            <strong>Ngày xuất:</strong>{" "}
            {new Date(record.date).toLocaleDateString("vi-VN")}
          </p>
          <p>
            <strong>Khách hàng:</strong> {record.customer}
          </p>
          <p>
            <strong>Số lượng:</strong> {record.totalPigs} con
          </p>
          <p>
            <strong>Tổng khối lượng:</strong> {record.totalWeight} kg
          </p>
          <p>
            <strong>Thành tiền:</strong>{" "}
            {record.totalAmount.toLocaleString("vi-VN")} VNĐ
          </p>
          <p>
            <strong>Trạng thái:</strong> {record.status}
          </p>
          <p>
            <strong>Ghi chú:</strong> {record.note}
          </p>
        </div>
      ),
    });
  };

  const handlePrint = (record) => {
    message.success(`Đang in phiếu xuất ${record.id}`);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa phiếu xuất ${record.id}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setExports(exports.filter((item) => item.id !== record.id));
        message.success("Xóa phiếu xuất thành công");
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setExports(fakeExports);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              Danh sách phiếu xuất chuồng
            </Title>
            <Button
              type="text"
              icon={<FilterOutlined rotate={showFilter ? 180 : 0} />}
              onClick={() => setShowFilter(!showFilter)}
            >
              {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </Space>
          <Link to="/Admin/CreateExport">
            <Button type="primary">Tạo phiếu xuất</Button>
          </Link>
        </div>

        {showFilter && <FilterSection />}

        <Table
          columns={columns}
          dataSource={exports}
          rowKey="id"
          loading={loading}
          pagination={{
            total: exports.length,
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} phiếu xuất`,
            showSizeChanger: true,
          }}
          summary={(pageData) => {
            const totalPigs = pageData.reduce(
              (sum, record) => sum + record.totalPigs,
              0
            );
            const totalWeight = pageData.reduce(
              (sum, record) => sum + record.totalWeight,
              0
            );
            const totalAmount = pageData.reduce(
              (sum, record) => sum + record.totalAmount,
              0
            );

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  Tổng cộng
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  {totalPigs} con
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {totalWeight} kg
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  {totalAmount.toLocaleString("vi-VN")} VNĐ
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} colSpan={2}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ExportList;
