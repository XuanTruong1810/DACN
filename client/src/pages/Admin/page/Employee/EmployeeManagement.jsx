import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Space,
  Button,
  Tag,
  message,
  Typography,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Row,
  Col,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  UserAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import EmployeeFilter from "./components/EmployeeFilter";

const { Title } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser] = useState(null);
  const [form] = Form.useForm();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
    roles: [],
  });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/User`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setUsers(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhân viên: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper function để map role names
  const mapRoleName = (role) => {
    const roleMap = {
      Admin: "Quản lý",
      Dispatch: "Nhân viên điều phối",
      FeedManager: "Nhân viên dinh dưỡng",
      Veterinarian: "Nhân viên thú y",
    };
    return roleMap[role] || role;
  };

  // Thêm style chung cho tất cả Tag
  const roleTagStyle = {
    width: "140px", // Chiều rộng cố định
    textAlign: "center",
    margin: "2px",
  };

  const columns = [
    {
      title: "Nhân viên",
      key: "user",
      fixed: "left",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.fullName}</Typography.Text>
            <Typography.Text type="secondary">{record.email}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      width: 120,
      render: (phone) => phone || "-",
    },
    {
      title: "Chức vụ",
      dataIndex: "roles",
      width: 180,
      filters: [
        { text: "Quản lý", value: "Admin" },
        { text: "Nhân viên điều phối", value: "Dispatch" },
        { text: "Nhân viên dinh dưỡng", value: "FeedManager" },
        { text: "Nhân viên thú y", value: "Veterinarian" },
      ],
      onFilter: (value, record) => record.roles.includes(value),
      render: (roles) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          {roles?.map((role) => {
            const getTagColor = (role) => {
              switch (role) {
                case "Admin":
                  return "red";
                case "Dispatch":
                  return "blue";
                case "FeedManager":
                  return "green";
                case "Veterinarian":
                  return "purple";
                default:
                  return "default";
              }
            };

            return (
              <Tag key={role} color={getTagColor(role)} style={roleTagStyle}>
                {mapRoleName(role)}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      filters: [
        { text: "Đang hoạt động", value: true },
        { text: "Đã khóa", value: false },
      ],
      onFilter: (value, record) => {
        const isLocked =
          record.lockOutEnd && new Date(record.lockOutEnd) > new Date();
        return value ? !isLocked : isLocked;
      },
      render: (_, record) => {
        const isLocked =
          record.lockOutEnd && new Date(record.lockOutEnd) > new Date();
        return (
          <Tag color={isLocked ? "error" : "success"}>
            {isLocked ? "Đã khóa" : "Hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày vào làm",
      dataIndex: "createdTime",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Khóa" : "Mở khóa"}>
            <Button
              type="text"
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Placeholder functions for CRUD operations
  const handleEdit = (record) => {
    console.log(record);
    setEditingEmployee(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      roles: record.roles,
      dateOfBirth: dayjs(record.dateOfBirth),
    });
    setPreviewImage(record.avatar);
    setIsEditModalVisible(true);
  };

  const handleToggleStatus = async (record) => {
    // Thêm xác nhận trước khi thực hiện
    Modal.confirm({
      title: `Xác nhận ${record.lockOutEnd ? "Mở khóa" : "Khóa"} tài khoản`,
      content: (
        <div>
          <p>{`Bạn có chắc chắn muốn ${
            record.lockOutEnd ? "Mở khóa" : "Khóa"
          } tài khoản của nhân viên:`}</p>
          <p>
            Họ và tên: <strong>{record.fullName}</strong>
          </p>
          <p>
            Email: <strong>{record.email}</strong>
          </p>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      okType: record.lockOutEnd ? "danger" : "primary",
      async onOk() {
        try {
          // Xác định endpoint dựa vào trạng thái hiện tại
          const endpoint = record.lockOutEnd ? "unlock" : "lock";

          const response = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/User/${record.id}/${endpoint}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log(response);
          message.success(
            `${response.lockOutEnd ? "Khóa" : "Mở khóa"} tài khoản thành công`
          );
          fetchUsers(); // Refresh data
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          message.error(`Lỗi: ${errorMessage}`);
        }
      },
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa nhân viên ${record.fullName}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/User/${record.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.success("Xóa nhân viên thành công");
          fetchUsers(); // Refresh lại danh sách
        } catch (error) {
          message.error("Lỗi khi xóa nhân viên: " + error.message);
        }
      },
    });
  };

  // Thêm hàm xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format lại ngày tháng trước khi gửi
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/User/${editingUser.id}`,
        formattedValues,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Cập nhật thông tin thành công");
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // Refresh data
    } catch (error) {
      message.error("Lỗi khi cập nhật: " + error.message);
    }
  };

  // Thêm hàm xử lý thêm mới
  const handleAdd = () => {
    addForm.resetFields();
    setIsAddModalVisible(true);
  };

  // Hàm kiểm tra file trước khi upload
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ chấp nhận file JPG/PNG!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return true;
  };

  // Hàm xử lý khi chọn ảnh
  const handleImageChange = (info) => {
    const file = info.file;
    if (beforeUpload(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm hàm xử lý submit form thêm mới
  const handleAddSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await addForm.validateFields();
      console.log("Form values:", values);

      const formData = new FormData();

      // Map các trường theo DTO và kiểm tra từng giá trị
      if (!values.email) {
        throw new Error("Email là bắt buộc");
      }
      formData.append("userName", values.email);
      formData.append("email", values.email);

      if (!values.fullName) {
        throw new Error("Họ tên là bắt buộc");
      }
      formData.append("fullName", values.fullName);

      // Thêm số điện thoại
      if (values.phoneNumber) {
        formData.append("phoneNumber", values.phoneNumber);
      }

      if (values.avatar?.file) {
        formData.append("avatar", values.avatar.file);
      }

      if (values.dateOfBirth) {
        formData.append("dateOfBirth", values.dateOfBirth.toISOString());
      }

      if (Array.isArray(values.roles) && values.roles.length > 0) {
        values.roles.forEach((role) => {
          formData.append("roles", role);
        });
      }

      // Gọi API tạo nhân viên mới
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/User`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      if (response.status === 201) {
        message.success("Thêm nhân viên mới thành công!");
        setIsAddModalVisible(false);
        addForm.resetFields();
        setPreviewImage("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error details:", error);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const formErrors = {};

        if (serverErrors.Email) {
          formErrors.email = serverErrors.Email[0];
        }

        if (serverErrors.Roles) {
          formErrors.roles = serverErrors.Roles[0];
        }

        addForm.setFields(
          Object.entries(formErrors).map(([field, error]) => ({
            name: field,
            errors: [error],
          }))
        );
      }

      message.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi thêm nhân viên mới. Vui lòng thử lại!"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Thêm hàm handleEditSubmit
  const handleEditSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await editForm.validateFields();

      const formData = new FormData();

      formData.append("fullName", values.fullName);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("dateOfBirth", values.dateOfBirth.format("YYYY-MM-DD"));

      if (values.avatar?.file) {
        formData.append("avatar", values.avatar.file);
      }

      if (Array.isArray(values.roles)) {
        values.roles.forEach((role) => {
          formData.append("roles", role);
        });
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/User/${editingEmployee.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        message.success("Cập nhật thông tin nhân viên thành công!");
        setIsEditModalVisible(false);
        editForm.resetFields();
        setPreviewImage("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Form thêm mới với giao diện cải tiến
  const renderAddForm = () => (
    <div className="modern-employee-form">
      <Row gutter={[40, 0]}>
        {/* Left Column - Avatar & Name */}
        <Col span={10}>
          <div className="avatar-upload-section">
            <div className="section-title">Ảnh đại diện</div>
            <Form.Item
              name="avatar"
              rules={[
                {
                  required: true,
                  message: "Vui lòng tải lên ảnh đại diện",
                },
              ]}
            >
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Ảnh phải nhỏ hơn 2MB!");
                    return Upload.LIST_IGNORE;
                  }
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("Chỉ chấp nhận file ảnh!");
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                onChange={handleImageChange}
              >
                {previewImage ? (
                  <div className="avatar-preview">
                    <img
                      src={previewImage}
                      alt="avatar"
                      className="avatar-image"
                    />
                    <div className="avatar-hover">
                      <div className="hover-content">
                        <CameraOutlined className="hover-icon" />
                        <div>Thay đổi ảnh</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <CameraOutlined
                      style={{ fontSize: "32px", color: "#8c8c8c" }}
                    />
                  </div>
                )}
              </Upload>
            </Form.Item>

            <div className="basic-info">
              <Form.Item
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input
                  prefix={<UserOutlined className="field-icon" />}
                  placeholder="Họ và tên"
                />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Column - Additional Info */}
        <Col span={14}>
          <div className="additional-info">
            <div className="section-title">Thông tin chi tiết</div>

            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email",
                    },
                    {
                      type: "email",
                      message: "Email không hợp lệ",
                    },
                    {
                      pattern:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Email không đúng định dạng",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="field-icon" />}
                    placeholder="Email"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="field-icon" />}
                    placeholder="Số điện thoại"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày sinh"
                    format="DD/MM/YYYY"
                    suffixIcon={<CalendarOutlined className="field-icon" />}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <div className="role-section">
                  <div className="role-title">Vai trò</div>
                  <Form.Item
                    name="roles"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một vai trò",
                      },
                      {
                        validator: (_, value) => {
                          if (!value || value.length === 0) {
                            return Promise.reject(
                              "Vui lòng chọn ít nhất một vai trò"
                            );
                          }
                          if (value && value.length > 3) {
                            return Promise.reject(
                              "Không được chọn quá 3 vai trò"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn vai trò"
                      optionLabelProp="label"
                    >
                      <Select.Option value="Admin" label="Quản lý">
                        <Space>
                          <CrownOutlined className="role-icon admin" />
                          <span>Quản lý</span>
                        </Space>
                      </Select.Option>
                      <Select.Option
                        value="Dispatch"
                        label="Nhân viên điều phối"
                      >
                        <Space>
                          <TeamOutlined className="role-icon dispatch" />
                          <span>Nhân viên điều phối</span>
                        </Space>
                      </Select.Option>
                      <Select.Option
                        value="FeedManager"
                        label="Nhân viên dinh dưỡng"
                      >
                        <Space>
                          <ExperimentOutlined className="role-icon feed" />
                          <span>Nhân viên dinh dưỡng</span>
                        </Space>
                      </Select.Option>
                      <Select.Option
                        value="Veterinarian"
                        label="Nhân viên thú y"
                      >
                        <Space>
                          <MedicineBoxOutlined className="role-icon vet" />
                          <span>Nhân viên thú y</span>
                        </Space>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );

  // Form chỉnh sửa
  const renderEditForm = () => (
    <div className="modern-employee-form">
      <Row gutter={[40, 0]}>
        <Col span={10}>
          <div className="avatar-upload-section">
            <div className="section-title">Ảnh đại diện</div>
            <Form.Item name="avatar">
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
              >
                {previewImage ? (
                  <div className="avatar-preview">
                    <img
                      src={previewImage}
                      alt="avatar"
                      className="avatar-image"
                    />
                    <div className="avatar-hover">
                      <div className="hover-content">
                        <CameraOutlined className="hover-icon" />
                        <span>Thay đổi ảnh</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <CameraOutlined
                      style={{ fontSize: "32px", color: "#8c8c8c" }}
                    />
                  </div>
                )}
              </Upload>
            </Form.Item>

            <div className="basic-info">
              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                  { max: 50, message: "Họ tên không được vượt quá 50 ký tự" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Ngày sinh"
                  suffixIcon={<CalendarOutlined className="field-icon" />}
                />
              </Form.Item>
            </div>
          </div>
        </Col>

        <Col span={14}>
          <div className="additional-info">
            <div className="section-title">Thông tin chi tiết</div>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Form.Item name="email" label="Email">
                  <Input
                    prefix={<MailOutlined />}
                    disabled // Email không được phép sửa
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} maxLength={10} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="roles"
                  label="Vai trò"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ít nhất một vai trò",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn vai trò"
                    optionLabelProp="label"
                  >
                    <Select.Option value="Admin" label="Quản lý">
                      <Space>
                        <CrownOutlined className="role-icon admin" />
                        <span>Quản lý</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Dispatch" label="Nhân viên điều phối">
                      <Space>
                        <TeamOutlined className="role-icon dispatch" />
                        <span>Nhân viên điều phối</span>
                      </Space>
                    </Select.Option>
                    <Select.Option
                      value="FeedManager"
                      label="Nhân viên dinh dưỡng"
                    >
                      <Space>
                        <ExperimentOutlined className="role-icon feed" />
                        <span>Nhân viên dinh dưỡng</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Veterinarian" label="Nhân viên thú y">
                      <Space>
                        <MedicineBoxOutlined className="role-icon vet" />
                        <span>Nhân viên thú y</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );

  // Updated styles
  const styles = `
    .modern-employee-form {
      padding: 32px;
      background: #ffffff;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }

    .avatar-upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px dashed #e2e8f0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #475569;
      margin-bottom: 20px;
      text-align: center;
      width: 100%;
    }

    .avatar-uploader {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .avatar-uploader .ant-upload {
      width: 280px;
      height: 380px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .avatar-uploader .ant-upload:hover {
      border-color: #4f46e5;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    }

    .avatar-preview {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .avatar-hover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .avatar-preview:hover .avatar-hover {
      opacity: 1;
    }

    .hover-content {
      text-align: center;
      color: white;
    }

    .hover-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
    }

    .upload-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 24px;
      color: #64748b;
    }

    .upload-text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .upload-hint {
      font-size: 14px;
      color: #94a3b8;
      text-align: center;
    }

    .basic-info {
      width: 100%;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .basic-info .ant-form-item {
      margin-bottom: 16px;
    }

    .basic-info .ant-input-affix-wrapper,
    .basic-info .ant-picker {
      height: 40px;
      border-radius: 8px;
    }

    .basic-info .ant-input-affix-wrapper:hover,
    .basic-info .ant-picker:hover {
      border-color: #4f46e5;
    }

    .basic-info .ant-input-prefix,
    .basic-info .ant-picker-suffix {
      color: #94a3b8;
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .avatar-uploader .ant-upload {
        width: 240px;
        height: 320px;
      }
    }

    .additional-info {
      background: #ffffff;
      padding: 28px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      height: 100%;
    }

    .role-section {
      margin-top: 8px;
    }

    .role-title {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .ant-input-affix-wrapper {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .ant-input-affix-wrapper:hover,
    .ant-input-affix-wrapper-focused {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    .field-icon {
      color: #94a3b8;
    }

    .ant-picker {
      width: 100%;
      padding: 12px 16px;
      border-radius: 8px;
    }

    .ant-select-selector {
      border-radius: 8px !important;
      min-height: 45px !important;
      padding: 4px 12px !important;
    }

    .ant-select-selection-item {
      display: flex;
      align-items: center;
    }

    .role-icon {
      font-size: 16px;
      margin-right: 8px;
    }

    .role-icon.admin { color: #f59e0b; }
    .role-icon.dispatch { color: #3b82f6; }
    .role-icon.feed { color: #10b981; }
    .role-icon.vet { color: #ec4899; }

    .ant-modal-content {
      border-radius: 16px;
      overflow: hidden;
    }

    .ant-modal-header {
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }

    .ant-btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 500;
    }

    .ant-spin-nested-loading {
      width: 100%;
    }

    .ant-spin-container {
      transition: all 0.3s;
    }

    .ant-spin-blur {
      opacity: 0.7;
    }

    .ant-spin-dot {
      font-size: 24px;
    }

    .ant-spin-text {
      margin-top: 8px;
      font-size: 14px;
      color: #1890ff;
    }

    .ant-btn-loading {
      opacity: 0.8;
      pointer-events: none;
    }
  `;

  // Thêm hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Thêm hàm lọc dữ liệu
  const getFilteredData = () => {
    return users.filter((user) => {
      // Lọc theo tìm kiếm
      const searchMatch =
        !filters.search ||
        user.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      // Lọc theo vai trò
      const roleMatch =
        !filters.roles.length ||
        user.roles.some((role) => filters.roles.includes(role));

      return searchMatch && roleMatch;
    });
  };

  return (
    <Card title={<Title level={3}>Quản lý nhân viên</Title>}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <EmployeeFilter
          onFilterChange={handleFilterChange}
          onAdd={handleAdd} // Truyền hàm handleAdd xuống component con
        />

        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            total: getFilteredData().length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          filterMultiple={true}
        />

        {/* Modal thêm mới */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserAddOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
              <span>Thêm nhân viên mới</span>
            </div>
          }
          open={isAddModalVisible}
          onOk={handleAddSubmit}
          onCancel={() => {
            if (!submitLoading) {
              setIsAddModalVisible(false);
              addForm.resetFields();
              setPreviewImage("");
            }
          }}
          width={1000}
          centered
          okText="Thêm nhân viên"
          cancelText="Hủy"
          confirmLoading={submitLoading}
          maskClosable={!submitLoading}
          closable={!submitLoading}
          keyboard={!submitLoading}
        >
          <Spin spinning={submitLoading} tip="Đang xử lý...">
            <Form
              form={addForm}
              layout="vertical"
              initialValues={{
                roles: [],
              }}
            >
              {renderAddForm()}
            </Form>
          </Spin>
        </Modal>

        {/* Modal chỉnh sửa hiện tại */}
        <Modal
          title="Chỉnh sửa thông tin nhân viên"
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={600}
        >
          {renderEditForm()}
        </Modal>

        {/* Modal Edit */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EditOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
              <span>Chỉnh sửa thông tin nhân viên</span>
            </div>
          }
          open={isEditModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => {
            if (!submitLoading) {
              setIsEditModalVisible(false);
              editForm.resetFields();
              setPreviewImage("");
              setEditingEmployee(null);
            }
          }}
          width={1000}
          centered
          okText={submitLoading ? "Đang cập nhật..." : "Cập nhật"}
          cancelText="Hủy"
          confirmLoading={submitLoading}
        >
          <Spin spinning={submitLoading} tip="Đang xử lý...">
            <Form form={editForm} layout="vertical">
              {renderEditForm()}
            </Form>
          </Spin>
        </Modal>
      </Space>
      <style>{styles}</style>
    </Card>
  );
};

export default UserManagementPage;
