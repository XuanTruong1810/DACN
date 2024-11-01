import { useState, useEffect } from "react";
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
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { ViewDetailsModal } from "./components/ViewDetailsModal";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PigImportApproval = () => {
  const [importRequests, setImportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form] = Form.useForm();

  // Giả lập danh sách nhà cung cấp
  const fakeSuppliers = [
    { id: 1, name: "Trang trại A", address: "Địa chỉ A", phone: "0123456789" },
    { id: 2, name: "Trang trại B", address: "Địa chỉ B", phone: "0987654321" },
    { id: 3, name: "Trang trại C", address: "Địa chỉ C", phone: "0123498765" },
  ];

  // Giả lập dữ liệu yêu cầu nhập
  const fakeRequests = [
    {
      id: 1,
      requestCode: "NH001",
      requestDate: "2024-03-15",
      supplier: "Trang trại A",
      quantity: 50,
      expectedDate: "2024-03-20",
      status: "pending",
      pigType: "Heo thịt",
      averageWeight: 20,
      requestedBy: "Nguyễn Văn A",
      notes: "Heo giống chất lượng cao",
      documents: [
        { name: "Giấy kiểm định.pdf", url: "#" },
        { name: "Hợp đồng.pdf", url: "#" },
      ],
      origin: "Đồng Nai",
      breed: "Landrace",
      age: "3 tháng",
      gender: "Đực",
      healthStatus: "Khỏe mạnh",
      vaccinated: true,
      vaccinationDetails: "Đã tiêm đầy đủ các mũi vaccine theo quy định",
    },
    // Thêm dữ liệu mẫu khác
  ];

  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setImportRequests(fakeRequests);
      setSuppliers(fakeSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

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
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => handleView(record),
          },
          {
            key: "export-pdf",
            label: "Xuất PDF",
            icon: <FilePdfOutlined />,
            onClick: () => handleExportPDF(record),
          },
          {
            key: "export-excel",
            label: "Xuất Excel",
            icon: <FileExcelOutlined />,
            onClick: () => handleExportExcel(record),
          },
        ];

        if (record.status === "pending") {
          items.unshift(
            {
              key: "approve",
              label: "Duyệt yêu cầu",
              icon: <CheckOutlined style={{ color: "#52c41a" }} />,
              onClick: () => handleApprove(record),
            },
            {
              key: "reject",
              label: "Từ chối",
              icon: <CloseOutlined style={{ color: "#ff4d4f" }} />,
              onClick: () => handleReject(record),
              danger: true,
            }
          );
        }

        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>

            {record.status === "pending" && (
              <>
                <Tooltip title="Duyệt yêu cầu">
                  <Button
                    type="text"
                    icon={<CheckOutlined style={{ color: "#52c41a" }} />}
                    onClick={() => handleApprove(record)}
                  />
                </Tooltip>
                <Tooltip title="Từ chối">
                  <Button
                    type="text"
                    icon={<CloseOutlined style={{ color: "#ff4d4f" }} />}
                    onClick={() => handleReject(record)}
                  />
                </Tooltip>
              </>
            )}

            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const handleView = (record) => {
    setSelectedRequest(record);
    setIsViewModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedRequest(record);
    Modal.confirm({
      title: "Phê duyệt yêu cầu nhập heo",
      width: 600,
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select placeholder="Chọn nhà cung cấp">
              {suppliers.map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Đơn giá (VNĐ/kg)"
            rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="deposit"
            label="Tiền cọc (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập tiền cọc" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          const updatedRequests = importRequests.map((req) =>
            req.id === record.id
              ? {
                  ...req,
                  status: "approved",
                  ...values,
                  approvedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  approvedBy: "Admin", // Thay bằng user thật
                }
              : req
          );
          setImportRequests(updatedRequests);
          message.success("Đã duyệt yêu cầu nhập heo thành công");
          form.resetFields();
        } catch (error) {
          console.log(error);
          return Promise.reject();
        }
      },
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
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
          const updatedRequests = importRequests.map((req) =>
            req.id === record.id
              ? {
                  ...req,
                  status: "rejected",
                  rejectReason: values.rejectReason,
                  rejectedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  rejectedBy: "Admin", // Thay bằng user thật
                }
              : req
          );
          setImportRequests(updatedRequests);
          message.success("Đã từ chối yêu cầu nhập heo");
          form.resetFields();
        } catch (error) {
          console.log(error);
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

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={3}>Duyệt yêu cầu nhập heo</Title>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => handleExportExcel()}
              >
                Xuất Excel
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={() => handleExportPDF()}
              >
                Xuất PDF
              </Button>
            </Space>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={importRequests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
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
      </Card>
    </div>
  );
};

export default PigImportApproval;
