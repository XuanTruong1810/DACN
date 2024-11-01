import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Typography,
  Dropdown,
  Menu,
  Descriptions,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

// Fake data
const MOCK_EMPLOYEES = [
  {
    id: "NV001",
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    position: "manager",
    birthDate: "1990-05-15",
    phone: "0912345678",
    status: "active",
  },
  {
    id: "NV002",
    fullName: "Trần Thị Bình",
    email: "tranthib@gmail.com",
    position: "supervisor",
    birthDate: "1992-08-20",
    phone: "0923456789",
    status: "active",
  },
  {
    id: "NV003",
    fullName: "Lê Văn Cường",
    email: "levanc@gmail.com",
    position: "veterinarian",
    birthDate: "1988-12-10",
    phone: "0934567890",
    status: "active",
  },
  {
    id: "NV004",
    fullName: "Phạm Thị Dung",
    email: "phamthid@gmail.com",
    position: "staff",
    birthDate: "1995-03-25",
    phone: "0945678901",
    status: "inactive",
  },
  {
    id: "NV005",
    fullName: "Hoàng Văn Em",
    email: "hoangvane@gmail.com",
    position: "worker",
    birthDate: "1993-07-30",
    phone: "0956789012",
    status: "active",
  },
];

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    position: [],
    status: [],
    dateRange: [],
  });
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const positionOptions = [
    { value: "manager", label: "Quản lý" },
    { value: "supervisor", label: "Giám sát" },
    { value: "staff", label: "Nhân viên" },
    { value: "veterinarian", label: "Bác sĩ thú y" },
    { value: "worker", label: "Công nhân" },
  ];

  const columns = [
    {
      title: "Mã NV",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      render: (position) => {
        const pos = positionOptions.find((p) => p.value === position);
        const color =
          position === "manager"
            ? "gold"
            : position === "supervisor"
            ? "blue"
            : position === "veterinarian"
            ? "green"
            : position === "staff"
            ? "cyan"
            : "purple";

        return <Tag color={color}>{pos?.label}</Tag>;
      },
      filters: positionOptions.map((pos) => ({
        text: pos.label,
        value: pos.value,
      })),
      onFilter: (value, record) => record.position === value,
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Đang làm việc" : "Đã nghỉ việc"}
        </Tag>
      ),
      filters: [
        { text: "Đang làm việc", value: "active" },
        { text: "Đã nghỉ việc", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const menu = (
          <Menu
            items={[
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => handleViewDetails(record),
              },
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                type: "divider",
              },
              {
                key: "status",
                label: record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
                icon:
                  record.status === "active" ? (
                    <LockOutlined />
                  ) : (
                    <UnlockOutlined />
                  ),
                onClick: () => handleToggleStatus(record),
              },
              {
                key: "delete",
                label: "Xóa",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
              },
            ]}
          />
        );

        return (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
              arrow={{
                pointAtCenter: true,
              }}
            >
              <Button icon={<EllipsisOutlined />} className="border-none" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...employee,
      birthDate: dayjs(employee.birthDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (employee) => {
    Modal.confirm({
      title: "Xác nhận xóa nhân viên",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa nhân viên sau?</p>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã NV">{employee.id}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {employee.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Chức vụ">
              {
                positionOptions.find((pos) => pos.value === employee.position)
                  ?.label
              }
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
        setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
        message.success("Đã xóa nhân viên thành công");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingEmployee) {
        // Update
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id ? { ...emp, ...values } : emp
          )
        );
        message.success("Đã cập nhật thông tin nhân viên");
      } else {
        // Create
        const newEmployee = {
          ...values,
          id: `NV${String(employees.length + 1).padStart(3, "0")}`,
          status: "active",
        };
        setEmployees((prev) => [...prev, newEmployee]);
        message.success("Đã thêm nhân viên mới");
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleFilterChange = (changedValues, allValues) => {
    setFilters(allValues);
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters({
      search: "",
      position: [],
      status: [],
      dateRange: [],
    });
  };

  const getFilteredEmployees = () => {
    return employees.filter((employee) => {
      // Filter by search text
      if (
        filters.search &&
        !employee.fullName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) &&
        !employee.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !employee.phone.includes(filters.search)
      ) {
        return false;
      }

      // Filter by position
      if (
        filters.position?.length &&
        !filters.position.includes(employee.position)
      ) {
        return false;
      }

      // Filter by status
      if (filters.status?.length && !filters.status.includes(employee.status)) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange?.length === 2) {
        const birthDate = dayjs(employee.birthDate);
        const startDate = filters.dateRange[0];
        const endDate = filters.dateRange[1];
        if (!birthDate.isBetween(startDate, endDate, "day", "[]")) {
          return false;
        }
      }

      return true;
    });
  };

  const renderEmployeeForm = () => (
    <Form form={form} layout="vertical" requiredMark={true}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên" },
              { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
              {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
              },
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
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

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
          >
            <Select placeholder="Chọn chức vụ">
              {positionOptions.map((pos) => (
                <Select.Option key={pos.value} value={pos.value}>
                  {pos.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="birthDate"
            label="Ngày sinh"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const age = dayjs().diff(value, "years");
                  if (age < 18) {
                    return Promise.reject("Nhân viên phải đủ 18 tuổi");
                  }
                  if (age > 60) {
                    return Promise.reject("Ngày sinh không hợp lệ");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              disabledDate={(current) => {
                return current && current > dayjs().endOf("day");
              }}
            />
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
                pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="0xxxxxxxxx" maxLength={10} />
          </Form.Item>
        </Col>
      </Row>
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
                placeholder="Tên, email hoặc SĐT"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="position" label="Chức vụ">
              <Select
                mode="multiple"
                placeholder="Chọn chức vụ"
                allowClear
                maxTagCount="responsive"
              >
                {positionOptions.map((pos) => (
                  <Select.Option key={pos.value} value={pos.value}>
                    {pos.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="Trạng thái">
              <Select
                mode="multiple"
                placeholder="Chọn trạng thái"
                allowClear
                maxTagCount="responsive"
              >
                <Select.Option value="active">Đang làm việc</Select.Option>
                <Select.Option value="inactive">Đã nghỉ việc</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="dateRange" label="Ngày sinh">
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
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

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Thông tin chi tiết nhân viên",
      width: 600,
      content: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Mã NV" span={2}>
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item label="Họ và tên" span={2}>
            {record.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {record.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">
            {
              positionOptions.find((pos) => pos.value === record.position)
                ?.label
            }
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={record.status === "active" ? "success" : "error"}>
              {record.status === "active" ? "Đang làm việc" : "Đã nghỉ việc"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {dayjs(record.birthDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: "Đóng",
    });
  };

  const handleToggleStatus = (record) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    Modal.confirm({
      title: `Xác nhận ${
        newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"
      } tài khoản`,
      content: `Bạn có chắc chắn muốn ${
        newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"
      } tài khoản của nhân viên ${record.fullName}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === record.id ? { ...emp, status: newStatus } : emp
          )
        );
        message.success(
          `Đã ${
            newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"
          } tài khoản thành công`
        );
      },
    });
  };

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
            <Title level={3}>Quản lý nhân viên</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAdd}
            >
              Thêm nhân viên
            </Button>
          </Col>
        </Row>

        {renderFilters()}

        <Table
          columns={columns}
          dataSource={getFilteredEmployees()}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhân viên`,
          }}
        />

        <Modal
          title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={720}
        >
          {renderEmployeeForm()}
        </Modal>
      </Card>
    </motion.div>
  );
};

export default EmployeeManagement;
