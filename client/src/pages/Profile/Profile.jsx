import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Tabs,
  Form,
  Input,
  Upload,
  message,
  Divider,
  Space,
  Badge,
  Spin,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "./Profile.css";
import moment from "moment";
import ImgCrop from "antd-img-crop";

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/api/user/profile`
      );
      const userData = response.data.data;
      console.log("User Data:", userData);

      setUserInfo(userData);

      form.setFieldsValue({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth ? moment(userData.dateOfBirth) : null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }

    return true;
  };

  const handleAvatarChange = (info) => {
    if (info.file) {
      setAvatarFile(info.file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserInfo((prev) => ({
          ...prev,
          avatarUrl: e.target.result,
        }));
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleEditMode = () => {
    if (!editMode) {
      form.setFieldsValue({
        fullName: userInfo.fullName,
        phoneNumber: userInfo.phoneNumber,
        dateOfBirth: userInfo.dateOfBirth ? moment(userInfo.dateOfBirth) : null,
      });
    } else {
      form.setFieldsValue({
        fullName: userInfo.fullName,
        phoneNumber: userInfo.phoneNumber,
        dateOfBirth: userInfo.dateOfBirth ? moment(userInfo.dateOfBirth) : null,
      });
    }
    setEditMode(!editMode);
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();

      formData.append("fullName", values.fullName);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("dateOfBirth", values.dateOfBirth?.format("YYYY-MM-DD"));

      if (avatarFile) {
        formData.append("avatar", avatarFile.originFileObj);
      }

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        message.success("Cập nhật thông tin thành công!");
        setUserInfo(response.data.data);
        setEditMode(false);
        setAvatarFile(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Không thể cập nhật thông tin!");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/Auth/Change_Password`,
        {
          password: values.currentPassword,
          newPassword: values.newPassword,
        }
      );

      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  const items = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      children: (
        <>
          <div className="edit-header">
            <div className="edit-header-title">
              <Title level={4} className="edit-title">
                Thông tin cá nhân
              </Title>
              <Text className="edit-subtitle">
                Cập nhật thông tin cá nhân của bạn
              </Text>
            </div>
            <Button
              className={`edit-button ${!editMode ? "primary" : ""}`}
              type={editMode ? "default" : "primary"}
              icon={<EditOutlined />}
              onClick={handleEditMode}
            >
              {editMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
            </Button>
          </div>
          <div className="edit-form">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={!editMode}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input placeholder="Nhập họ và tên của bạn" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại của bạn" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="dateOfBirth"
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh của bạn"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Form.Item className="form-actions">
                  <Space size="middle">
                    <Button type="primary" htmlType="submit">
                      Lưu thay đi
                    </Button>
                    <Button onClick={() => setEditMode(false)}>Hủy</Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Đổi mật khẩu",
      children: (
        <>
          <div className="edit-header">
            <div className="edit-header-title">
              <Title level={4} className="edit-title">
                Đổi mật khẩu
              </Title>
              <Text className="edit-subtitle">
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
              </Text>
            </div>
          </div>
          <div className="edit-form">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu hiện tại",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu mới" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu mới",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Mật khẩu xác nhận không khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu mới" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
                <Space>
                  <Button onClick={() => passwordForm.resetFields()}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="edit-button primary"
                  >
                    Đổi mật khẩu
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <Badge
                  count={
                    editMode && (
                      <div className="avatar-upload-btn">
                        <ImgCrop rotate>
                          <Upload
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleAvatarChange}
                            accept="image/*"
                          >
                            <CameraOutlined
                              style={{ fontSize: "18px", color: "#64748b" }}
                            />
                          </Upload>
                        </ImgCrop>
                      </div>
                    )
                  }
                >
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={userInfo?.avatar}
                    className="user-avatar"
                  />
                </Badge>
              </div>
              <Title level={4} style={{ marginBottom: 4, color: "#1e293b" }}>
                {userInfo?.fullName}
              </Title>
              <Text style={{ color: "#64748b", fontSize: "15px" }}>
                {userInfo?.role}
              </Text>
            </div>

            <div className="user-info-list">
              <div className="info-item">
                <div className="info-icon">
                  <MailOutlined />
                </div>
                <div className="info-content">
                  <div className="info-label">Email</div>
                  <div className="info-value">{userInfo?.email}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <PhoneOutlined />
                </div>
                <div className="info-content">
                  <div className="info-label">Số điện thoại</div>
                  <div className="info-value">
                    {userInfo?.phoneNumber || "Chưa cập nhật"}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <CalendarOutlined />
                </div>
                <div className="info-content">
                  <div className="info-label">Ngày sinh</div>
                  <div className="info-value">
                    {userInfo?.dateOfBirth
                      ? moment(userInfo.dateOfBirth).format("DD/MM/YYYY")
                      : "Chưa cập nhật"}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <SafetyCertificateOutlined />
                </div>
                <div className="info-content">
                  <div className="info-label">Trạng thái tài khoản</div>
                  <div className="info-value">
                    <span
                      className={`status-badge ${
                        userInfo?.lockoutEnd ? "locked" : "active"
                      }`}
                    >
                      <span className="status-dot" />
                      {userInfo?.lockoutEnd ? "Đã khóa" : "Đang hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={16}>
          <div className="edit-card">
            <Tabs items={items} defaultActiveKey="1" className="custom-tabs" />
          </div>
        </Col>
      </Row>
    </div>
  );
};

// EditProfileForm component
const EditProfileForm = ({ userInfo, editMode, setEditMode }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Updated values:", values);
    message.success("Cập nhật thông tin thành công!");
    setEditMode(false);
  };

  return (
    <div className="edit-profile-form">
      <div className="form-header">
        <Space size="middle" align="center">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Thông tin cá nhân
            </Title>
            <Text type="secondary">Cập nhật thông tin cá nhân của bạn</Text>
          </div>
        </Space>
        <Button
          type={editMode ? "default" : "primary"}
          icon={<EditOutlined />}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
        </Button>
      </div>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        initialValues={userInfo}
        disabled={!editMode}
        onFinish={handleUpdateProfile}
        className="profile-form"
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Họ và tên"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Email"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                placeholder="Số điện thoại"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="department" label="Chức vụ">
              <Input
                prefix={<IdcardOutlined className="site-form-item-icon" />}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        {editMode && (
          <Form.Item className="form-actions">
            <Space size="middle">
              <Button type="primary" htmlType="submit">
                Lưu thay đi
              </Button>
              <Button onClick={() => setEditMode(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

// SecurityForm component
const SecurityForm = ({ form }) => {
  const handlePasswordChange = (values) => {
    console.log("Password change:", values);
    message.success("Đổi mật khẩu thành công!");
    form.resetFields();
  };

  return (
    <div className="security-form">
      <div className="form-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Bảo mật tài khoản
          </Title>
          <Text type="secondary">Cập nhật mật khẩu và thiết lập bảo mật</Text>
        </div>
      </div>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
        className="password-form"
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu hiện tại"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mt khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                  message: "Mật khẩu phải chứa chữ hoa, chữ thường và số!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Bảo mật hai lớp" className="security-card">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Xác thực hai yếu tố</Text>
                  <Paragraph type="secondary">
                    Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố
                  </Paragraph>
                  <Button type="primary" ghost>
                    Thiết lập
                  </Button>
                </div>

                <Divider />

                <div>
                  <Text strong>Lịch sử đăng nhập</Text>
                  <Paragraph type="secondary">
                    Xem lịch sử đăng nhập trên các thiết bị
                  </Paragraph>
                  <Button>Xem chi tiết</Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Profile;
