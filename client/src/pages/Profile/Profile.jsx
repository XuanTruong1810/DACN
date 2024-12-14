/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import {
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
  Space,
  Badge,
  Spin,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "./Profile.css";
import moment from "moment";
import ImgCrop from "antd-img-crop";

const { Title, Text } = Typography;

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordForm] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  const handleAvatarChange = ({ file }) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file.originFileObj || file);

    setAvatarFile(file.originFileObj || file);
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
      setIsSaving(true);
      const formData = new FormData();

      formData.append("fullName", values.fullName);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("dateOfBirth", values.dateOfBirth?.format("YYYY-MM-DD"));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await axiosInstance.put(
        `${import.meta.env.VITE_API_URL}/api/User/profile`,
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
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Không thể cập nhật thông tin!");
    } finally {
      setIsSaving(false);
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
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button
                      onClick={() => setEditMode(false)}
                      disabled={isSaving}
                    >
                      Hủy
                    </Button>
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
                            beforeUpload={() => false}
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
                    src={avatarPreview || userInfo?.avatar}
                    className="user-avatar"
                  />
                </Badge>
              </div>
              <Title level={4} style={{ marginBottom: 4, color: "#1e293b" }}>
                {userInfo?.fullName}
              </Title>
              <Text style={{ color: "#64748b", fontSize: "15px" }}>
                {roleMapping[userInfo?.role] || userInfo?.role}
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

// Cập nhật object mapping role theo đúng hệ thống
const roleMapping = {
  Admin: "Quản trị viên",
  Veterinarian: "Bác sĩ thú y",
  Dispatch: "Nhân viên điều phối",
  FeedManager: "Quản lý thức ăn",
};

export default Profile;
