import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add handlers
  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      ...customer,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (customer) => {
    Modal.confirm({
      title: "Xác nhận xóa khách hàng",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa khách hàng sau?</p>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="Công ty">
              {customer.companyName || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer.phone}
            </Descriptions.Item>
          </Descriptions>
          <p style={{ color: "#ff4d4f", marginTop: 8 }}>
            Lưu ý: Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        message.success("Đã xóa khách hàng thành công");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingCustomer) {
        // Update
        setCustomers((prev) =>
          prev.map((cus) =>
            cus.id === editingCustomer.id ? { ...cus, ...values } : cus
          )
        );
        message.success("Đã cập nhật thông tin khách hàng");
      } else {
        // Create
        const newCustomer = {
          ...values,
          id: `CUS${String(customers.length + 1).padStart(3, "0")}`,
        };
        setCustomers((prev) => [...prev, newCustomer]);
        message.success("Đã thêm khách hàng mới");
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns = [
    {
      title: "Tên người đại diện",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (text) => (text ? <Tag color="blue">{text}</Tag> : "Không có"),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <PhoneOutlined /> {record.phone}
          </Space>
          <Space>
            <MailOutlined /> {record.email}
          </Space>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space split={<Divider type="vertical" />}>
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Thông tin chi tiết khách hàng",
      width: 600,
      content: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên người đại diện" span={2}>
            {record.name}
          </Descriptions.Item>
          <Descriptions.Item label="Tên công ty" span={2}>
            {record.companyName || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {record.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {record.address}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {record.note || "Không có"}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: "Đóng",
    });
  };

  const handleFilterChange = (changedValues, allValues) => {
    setFilters(allValues);
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters({
      search: "",
    });
  };

  const getFilteredCustomers = () => {
    return customers.filter((customer) => {
      if (
        filters.search &&
        !customer.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !customer.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !customer.phone.includes(filters.search) &&
        !(
          customer.companyName &&
          customer.companyName
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  };

  const renderCustomerForm = () => (
    <Form form={form} layout="vertical" requiredMark={true}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên người đại diện"
            rules={[
              { required: true, message: "Vui lòng nhập tên người đại diện" },
            ]}
          >
            <Input placeholder="Nhập tên người đại diện" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="companyName" label="Tên công ty">
            <Input placeholder="Nhập tên công ty (nếu có)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
      >
        <Input.TextArea placeholder="Nhập địa chỉ" />
      </Form.Item>

      <Form.Item name="note" label="Ghi chú">
        <Input.TextArea placeholder="Nhập ghi chú (nếu có)" />
      </Form.Item>
    </Form>
  );

  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={filterForm}
        onValuesChange={handleFilterChange}
        layout="vertical"
        initialValues={filters}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search" label="Tìm kiếm">
              <Input
                placeholder="Tên, công ty, email hoặc SĐT"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} style={{ textAlign: "right" }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                Đặt lại
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  // Trigger search if needed
                }}
              >
                Tìm kiếm
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  // Thêm style CSS
  const styles = `
    .ant-table {
      background: white;
      border-radius: 8px;
    }

    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }

    .ant-btn {
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }

    .ant-input, .ant-input-search {
      border-radius: 6px;
    }

    .ant-card {
      border-radius: 8px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    }

    .ant-modal-content {
      border-radius: 8px;
      overflow: hidden;
    }

    .ant-tag {
      border-radius: 4px;
    }

    .ant-space {
      gap: 8px !important;
    }
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý khách hàng
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        {renderFilters()}

        <Table
          columns={columns}
          dataSource={getFilteredCustomers()}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} khách hàng`,
            pageSize: 10,
          }}
          scroll={{ x: 1000 }}
        />

        <Modal
          title={
            editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"
          }
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={720}
          centered
        >
          {renderCustomerForm()}
        </Modal>

        <style jsx>{styles}</style>
      </Card>
    </motion.div>
  );
};

export default CustomerManagement;
