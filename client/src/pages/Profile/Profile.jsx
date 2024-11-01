import React, { useState } from "react";
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
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  UploadOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  CalendarOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import "./Profile.css";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const userInfo = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0123456789",
    role: "Quản trị viên",
    address: "Quận 1, TP. Hồ Chí Minh",
    joinDate: "01/01/2023",
    avatar: null,
    id: "NV001",
    department: "Quản lý trang trại",
    status: "active",
  };

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]}>
        {/* Left Column - User Info Card */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="user-card">
            <div className="avatar-section">
              <Badge
                count={
                  <div className="avatar-upload">
                    <Upload
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={() => message.success("Avatar updated!")}
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                      />
                    </Upload>
                  </div>
                }
              >
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={userInfo.avatar}
                  className="user-avatar"
                />
              </Badge>
              <Title level={3} className="user-name">
                {userInfo.name}
              </Title>
              <div className="user-role">
                <Badge status="success" text={userInfo.role} />
              </div>
            </div>

            <Divider />

            <div className="user-details">
              <div className="detail-item">
                <IdcardOutlined className="detail-icon" />
                <div>
                  <Text type="secondary">Mã nhân viên</Text>
                  <Paragraph strong>{userInfo.id}</Paragraph>
                </div>
              </div>

              <div className="detail-item">
                <MailOutlined className="detail-icon" />
                <div>
                  <Text type="secondary">Email</Text>
                  <Paragraph strong>{userInfo.email}</Paragraph>
                </div>
              </div>

              <div className="detail-item">
                <PhoneOutlined className="detail-icon" />
                <div>
                  <Text type="secondary">Số điện thoại</Text>
                  <Paragraph strong>{userInfo.phone}</Paragraph>
                </div>
              </div>

              <div className="detail-item">
                <HomeOutlined className="detail-icon" />
                <div>
                  <Text type="secondary">Địa chỉ</Text>
                  <Paragraph strong>{userInfo.address}</Paragraph>
                </div>
              </div>

              <div className="detail-item">
                <CalendarOutlined className="detail-icon" />
                <div>
                  <Text type="secondary">Ngày vào làm</Text>
                  <Paragraph strong>{userInfo.joinDate}</Paragraph>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Edit Forms */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="edit-card">
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: "info",
                  label: (
                    <span>
                      <UserOutlined />
                      Thông tin cá nhân
                    </span>
                  ),
                  children: (
                    <EditProfileForm
                      userInfo={userInfo}
                      editMode={editMode}
                      setEditMode={setEditMode}
                    />
                  ),
                },
                {
                  key: "security",
                  label: (
                    <span>
                      <SafetyCertificateOutlined />
                      Bảo mật
                    </span>
                  ),
                  children: <SecurityForm form={form} />,
                },
              ]}
            />
          </Card>
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
        onFinish={onFinish}
        disabled={!editMode}
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
            <Form.Item name="department" label="Phòng ban">
              <Input
                prefix={<IdcardOutlined className="site-form-item-icon" />}
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea
                placeholder="Địa chỉ"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>

        {editMode && (
          <Form.Item className="form-actions">
            <Space size="middle">
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
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
              label="Mật khẩu mới"
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
