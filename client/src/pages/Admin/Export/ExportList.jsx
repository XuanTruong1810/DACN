import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Button,
  message,
  Space,
  Input,
  DatePicker,
  Modal,
  Select,
  Form,
  InputNumber,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  ExportOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "./ExportCss.css";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Thêm dữ liệu khách hàng mẫu
const MOCK_CUSTOMERS = [
  {
    id: "CUS001",
    name: "Công ty TNHH Thực phẩm ABC",
    phone: "0901234567",
    address: "123 Nguyễn Văn A, Q.1, TP.HCM",
  },
  {
    id: "CUS002",
    name: "Công ty CP Chăn nuôi XYZ",
    phone: "0909876543",
    address: "456 Lê Văn B, Q.2, TP.HCM",
  },
  {
    id: "CUS003",
    name: "Doanh nghiệp Thực phẩm Sạch",
    phone: "0905555666",
    address: "789 Phạm Văn C, Q.3, TP.HCM",
  },
  {
    id: "CUS004",
    name: "Công ty TNHH Thương mại DEF",
    phone: "0907777888",
    address: "321 Trần Văn D, Q.4, TP.HCM",
  },
];

const ExportList = () => {
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState([]);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [pendingPigs, setPendingPigs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedPigs, setSelectedPigs] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/pigExport`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setExports(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách phiếu xuất");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPigs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/export/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setPendingPigs(response.data.data);
    } catch (error) {
      message.error("Không th tải danh sách heo chờ xuất");
    }
  };

  const showCreateModal = () => {
    fetchPendingPigs();
    setIsModalVisible(true);
  };

  const pigColumns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (status) => (
        <Tag color={status === "good" ? "success" : "warning"}>
          {status === "good" ? "Tốt" : "Cần chú ý"}
        </Tag>
      ),
    },
    {
      title: "Tiêm vaccine",
      dataIndex: "isVaccinationComplete",
      key: "isVaccinationComplete",
      render: (isComplete) => (
        <Tag color={isComplete ? "success" : "warning"}>
          {isComplete ? "Đã tiêm đủ" : "Chưa tiêm đủ"}
        </Tag>
      ),
    },
    {
      title: "Cân nặng hiện tại (kg)",
      dataIndex: "weight",
      key: "weight",
      render: (weight) => weight.toFixed(1),
    },
    {
      title: "Cân nặng xuất (kg)",
      dataIndex: "exportWeight",
      key: "exportWeight",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.weight * 1.1}
          disabled={!selectedRowKeys.includes(record.id)}
          defaultValue={record.weight}
          onChange={(value) => handleWeightChange(record.id, value)}
          style={{ width: "100px" }}
        />
      ),
    },
    {
      title: "Thành tiền (VNĐ)",
      key: "totalPrice",
      render: (_, record) => {
        const unitPrice = form.getFieldValue("unitPrice") || 0;
        const exportWeight = record.exportWeight || record.weight;
        const total = exportWeight * unitPrice;
        return (
          <Text strong style={{ color: "#1890ff" }}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(total)}
          </Text>
        );
      },
    },
  ];

  const handleWeightChange = (pigId, weight) => {
    setSelectedPigs((prev) =>
      prev.map((pig) =>
        pig.id === pigId ? { ...pig, exportWeight: weight } : pig
      )
    );
    form.setFieldsValue({ dummy: Date.now() });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedPigs(
        selectedRows.map((row) => ({
          ...row,
          exportWeight: row.weight, // Mặc định lấy cân nặng hiện tại
        }))
      );
    },
  };

  const calculateTotal = () => {
    return selectedPigs.reduce(
      (total, pig) => total + (pig.exportWeight || 0),
      0
    );
  };

  const handleCreateExport = async (values) => {
    if (selectedPigs.length === 0) {
      message.error("Vui lòng chọn ít nhất một con heo");
      return;
    }

    const invoice = {
      code: `EXP${Date.now().toString().slice(-6)}`,
      exportDate: dayjs().format("DD/MM/YYYY HH:mm"),
      customer: customers.find((c) => c.id === values.customerId),
      unitPrice: values.unitPrice,
      pigs: selectedPigs.map((pig) => ({
        ...pig,
        exportWeight: pig.exportWeight || pig.weight,
        total: (pig.exportWeight || pig.weight) * values.unitPrice,
      })),
      totalWeight: calculateTotal(),
      totalAmount: selectedPigs.length,
      totalPrice: calculateTotal() * values.unitPrice,
    };

    setInvoiceData(invoice);
    setIsInvoiceVisible(true);
    setIsModalVisible(false);
    form.resetFields();
    setSelectedPigs([]);
    setSelectedRowKeys([]);
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Ngày xuất",
      dataIndex: "exportDate",
      key: "exportDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng khối lượng",
      dataIndex: "totalWeight",
      key: "totalWeight",
      render: (weight) => `${weight} kg`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "success" : "processing"}>
          {status === "completed" ? "Đã hoàn thnh" : "Đang xử lý"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/exports/${record.id}`)}
          >
            Chi tiết
          </Button>
          <Button icon={<PrinterOutlined />}>In phiếu</Button>
        </Space>
      ),
    },
  ];

  const InvoiceModal = () => (
    <Modal
      title={null}
      visible={isInvoiceVisible}
      onCancel={() => setIsInvoiceVisible(false)}
      width={800}
      className="invoice-modal"
      footer={[
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          size="large"
        >
          In phiếu
        </Button>,
        <Button
          key="close"
          size="large"
          onClick={() => setIsInvoiceVisible(false)}
        >
          Đóng
        </Button>,
      ]}
    >
      {invoiceData && (
        <div style={{ padding: "24px", backgroundColor: "#fff" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ marginBottom: "16px" }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ height: "60px", marginBottom: "8px" }}
              />
              <Title
                level={4}
                style={{ margin: 0, fontSize: "18px", letterSpacing: "1px" }}
              >
                CÔNG TY TNHH CHĂN NUÔI ABC
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  display: "block",
                  lineHeight: "1.5",
                }}
              >
                Địa chỉ: 123 Đường XYZ, Quận ABC, TP.HCM
                <br />
                Điện thoại: (028) 1234 5678 - Email: info@abc.com
              </Text>
            </div>
            <Divider style={{ margin: "16px 0", borderColor: "#d9d9d9" }} />
            <Title
              level={2}
              style={{ margin: 0, fontSize: "24px", letterSpacing: "2px" }}
            >
              PHIẾU XUẤT HEO
            </Title>
            <Title
              level={4}
              style={{
                margin: "8px 0 0",
                fontWeight: "normal",
                fontSize: "15px",
              }}
            >
              Mã phiếu:{" "}
              <Text style={{ fontWeight: "bold" }}>{invoiceData.code}</Text>
            </Title>
            <Text style={{ fontSize: "14px" }}>
              Ngày xuất: {invoiceData.exportDate}
            </Text>
          </div>

          {/* Thông tin khách hàng */}
          <Card
            style={{ marginBottom: "24px", borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Tên doanh nghiệp:
                  </Text>
                  <Text strong style={{ fontSize: "15px" }}>
                    {invoiceData.customer.name || "Doanh nghiệp lẻ"}
                  </Text>
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Người đại diện:
                  </Text>
                  <Text style={{ fontSize: "14px" }}>Nguyễn Văn A</Text>
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Số điện thoại:
                  </Text>
                  <Text style={{ fontSize: "14px" }}>
                    {invoiceData.customer.phone}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Địa chỉ:
                  </Text>
                  <Text style={{ fontSize: "14px" }}>
                    {invoiceData.customer.address}
                  </Text>
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Đơn giá:
                  </Text>
                  <Text strong style={{ fontSize: "15px", color: "#1890ff" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(invoiceData.unitPrice)}{" "}
                    /kg
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Bảng chi tiết */}
          <Table
            dataSource={invoiceData.pigs}
            pagination={false}
            bordered
            style={{ marginBottom: "24px" }}
            className="invoice-table"
            columns={[
              {
                title: "Mã heo",
                dataIndex: "id",
                key: "id",
                width: "20%",
                render: (id) => (
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "13px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {id}
                  </Tag>
                ),
              },
              {
                title: "Chuồng",
                dataIndex: "stableName",
                key: "stableName",
                width: "25%",
                render: (text) => (
                  <Text style={{ fontSize: "14px" }}>{text}</Text>
                ),
              },
              {
                title: "Cân nặng (kg)",
                dataIndex: "exportWeight",
                key: "exportWeight",
                width: "25%",
                render: (weight) => (
                  <Text strong style={{ fontSize: "14px" }}>
                    {weight.toFixed(1)}
                  </Text>
                ),
              },
              {
                title: "Thành tiền",
                dataIndex: "total",
                key: "total",
                width: "30%",
                render: (total) => (
                  <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(total)}
                  </Text>
                ),
              },
            ]}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong style={{ fontSize: "14px" }}>
                      Tổng cộng
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ fontSize: "14px" }}>
                      {invoiceData.totalWeight.toFixed(1)} kg
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(invoiceData.totalPrice)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          {/* Chữ ký */}
          <Row
            justify="space-between"
            style={{ marginTop: "40px", textAlign: "center" }}
          >
            <Col span={8}>
              <Text strong style={{ fontSize: "14px" }}>
                Người lập phiếu
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "13px" }}>
                (Ký và ghi rõ họ tên)
              </Text>
            </Col>
            <Col span={8}>
              <Text strong style={{ fontSize: "14px" }}>
                Người giao hàng
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "13px" }}>
                (Ký và ghi rõ họ tên)
              </Text>
            </Col>
            <Col span={8}>
              <Text strong style={{ fontSize: "14px" }}>
                Người nhận hàng
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "13px" }}>
                (Ký và ghi rõ họ tên)
              </Text>
            </Col>
          </Row>

          {/* Footer */}
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <Text
              type="secondary"
              style={{ fontSize: "13px", fontStyle: "italic" }}
            >
              * Phiếu này có giá trị xuất kho và được lập thành 03 bản: 01 bản
              lưu kế toán, 01 bản lưu kho, 01 bản giao khách hàng
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={<Title level={4}>Danh sách phiếu xuất</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Tạo phiếu xuất
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã phiếu"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <RangePicker />
        </Space>

        <Table
          columns={columns}
          dataSource={exports}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={<Title level={4}>Tạo phiếu xuất mới</Title>}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedPigs([]);
          setSelectedRowKeys([]);
          form.resetFields();
        }}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <Form form={form} onFinish={handleCreateExport} layout="vertical">
          <Card style={{ marginBottom: 16 }}>
            <Space
              size="large"
              style={{ width: "100%", justifyContent: "start" }}
            >
              <Form.Item
                name="customerId"
                label={<Text strong>Khách hàng</Text>}
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng" },
                ]}
                style={{ marginBottom: 0, width: 300 }}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: customer.name,
                  }))}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="unitPrice"
                label={<Text strong>Đơn giá (VNĐ/kg)</Text>}
                rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
                style={{ marginBottom: 0, width: 200 }}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  size="large"
                  onChange={() => {
                    form.setFieldsValue({ dummy: Date.now() });
                  }}
                />
              </Form.Item>
            </Space>
          </Card>

          <Card
            title={<Text strong>Danh sách heo chờ xuất</Text>}
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              rowSelection={rowSelection}
              columns={pigColumns}
              dataSource={pendingPigs}
              rowKey="id"
              size="middle"
              scroll={{ y: 400 }}
              pagination={false}
            />
          </Card>

          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="large">
                  <Statistic
                    title="Tổng số heo đã chọn"
                    value={selectedPigs.length}
                    suffix="con"
                  />
                  <Statistic
                    title="Tổng khối lượng xuất"
                    value={calculateTotal().toFixed(1)}
                    suffix="kg"
                  />
                </Space>
              </Col>
              <Col>
                <Statistic
                  title="Tổng tiền"
                  value={
                    calculateTotal() * (form.getFieldValue("unitPrice") || 0)
                  }
                  formatter={(value) => (
                    <Text style={{ fontSize: "24px", color: "#1890ff" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)}
                    </Text>
                  )}
                />
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <Row justify="end">
              <Space>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setSelectedPigs([]);
                    setSelectedRowKeys([]);
                    form.resetFields();
                  }}
                  size="large"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={selectedPigs.length === 0}
                  size="large"
                  icon={<ExportOutlined />}
                >
                  Tạo phiếu xuất
                </Button>
              </Space>
            </Row>
          </Card>
        </Form>
      </Modal>
      <InvoiceModal />
    </div>
  );
};

export default ExportList;
