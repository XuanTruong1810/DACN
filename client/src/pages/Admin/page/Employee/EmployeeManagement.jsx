import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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
      message.error("Lỗi khi tải danh sách người dùng: " + error.message);
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
      title: "Người dùng",
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
      title: "Tên đăng nhập",
      dataIndex: "userName",
      width: 150,
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
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
    console.log("Edit user:", record);
  };

  const handleToggleStatus = async (record) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/User/${record.id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success(
        `${record.isActive ? "Khóa" : "Mở khóa"} tài khoản thành công`
      );
      fetchUsers(); // Refresh data
    } catch (error) {
      message.error("Lỗi khi thay đổi trạng thái: " + error.message);
    }
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/User/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Xóa người dùng thành công");
      fetchUsers(); // Refresh data
    } catch (error) {
      message.error("Lỗi khi xóa người dùng: " + error.message);
    }
  };

  return (
    <Card title={<Title level={3}>Quản lý người dùng</Title>}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Button type="primary">Thêm người dùng</Button>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Space>
    </Card>
  );
};

export default UserManagementPage;
