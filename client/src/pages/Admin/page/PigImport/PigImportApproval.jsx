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
import ViewDetailsModal from "./components/ViewDetailsModal";
import dayjs from "dayjs";
import axios from "axios";

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

  // Sửa useEffect để gọi API thật
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
    Modal.confirm({
      title: "Phê duyệt yêu cầu nhập heo",
      width: 600,
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhà cung cấp"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={suppliers}
              onSelect={(value) => {
                const supplier = suppliers.find((s) => s.value === value);
                form.setFieldsValue({
                  supplierAddress: supplier?.address,
                  supplierPhone: supplier?.phone,
                });
              }}
            />
          </Form.Item>

          <Form.Item name="supplierAddress" label="Địa chỉ nhà cung cấp">
            <Input disabled />
          </Form.Item>

          <Form.Item name="supplierPhone" label="Số điện thoại">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Đơn giá (VNĐ/kg)"
            rules={[
              { required: true, message: "Vui lòng nhập đơn giá" },
              { type: "number", min: 1, message: "Đơn giá phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="deposit"
            label="Tiền cọc (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập tiền cọc" },
              { type: "number", min: 0, message: "Tiền cọc không được âm" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const unitPrice = getFieldValue("unitPrice");
                  const totalPrice = unitPrice * record.quantity;
                  if (value && value > totalPrice) {
                    return Promise.reject(
                      "Tiền cọc không được lớn hơn tổng tiền"
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          console.log("values:", values);
          // Gọi API chấp nhận yêu cầu với thêm supplierId
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/accept?id=${
              record.id
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

          message.success("Đã duyệt yêu cầu nhập heo thành công");
          form.resetFields();
          fetchRequests();
        } catch (error) {
          console.error("Error approving request:", error);
          message.error(
            error.response?.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu"
          );
          return Promise.reject();
        }
      },
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
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
