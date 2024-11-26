import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  message,
  Typography,
  Space,
  List,
  Tag,
  Tooltip,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  ImportOutlined,
  ExclamationCircleFilled,
  CloudDownloadOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  FileOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { confirm } = Modal;

const Restore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Backup`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      setBackups(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách sao lưu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleRestore = (path) => {
    confirm({
      title: (
        <div style={confirmModalStyle.title}>
          <ExclamationCircleFilled
            style={{ color: "#faad14", marginRight: 8 }}
          />
          Xác nhận phục hồi dữ liệu
        </div>
      ),
      content: (
        <div style={confirmModalStyle.content}>
          <Text>
            Bạn có chắc chắn muốn phục hồi dữ liệu từ bản sao lưu này?
          </Text>
          <Divider />
          <Text type="danger" strong style={confirmModalStyle.warning}>
            Lưu ý: Dữ liệu hiện tại sẽ bị thay thế bởi dữ liệu từ bản sao lưu
            này.
          </Text>
        </div>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          const encodedPath = encodeURIComponent(path);
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/Backup/${encodedPath}/restore`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.success("Phục hồi dữ liệu thành công");
          window.location.reload();
        } catch (error) {
          console.error(error);
          message.error("Phục hồi dữ liệu thất bại");
        } finally {
          setLoading(false);
        }
      },
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <DatabaseOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              Phục hồi dữ liệu
            </Title>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBackups}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={backups}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Tổng số ${total} bản sao lưu`,
          }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title="Phục hồi dữ liệu">
                  <Button
                    type="primary"
                    icon={<ImportOutlined />}
                    onClick={() => handleRestore(item.path)}
                    loading={loading}
                  >
                    Phục hồi
                  </Button>
                </Tooltip>,
                <Tooltip title="Tải xuống bản sao lưu">
                  <Button
                    type="default"
                    icon={<CloudDownloadOutlined />}
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tải xuống
                  </Button>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <FileOutlined
                    style={{
                      fontSize: 36,
                      color: "#1890ff",
                      border: "1px solid #e8e8e8",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  />
                }
                title={
                  <Space>
                    <Text strong>{item.fileName}</Text>
                    <Tag color="blue">{item.size}</Tag>
                  </Space>
                }
                description={
                  <Space>
                    <HistoryOutlined />
                    <Text type="secondary">
                      Sao lưu lúc:{" "}
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Thêm thông tin hướng dẫn */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>
          <InfoCircleOutlined /> Hướng dẫn
        </Title>
        <Text>
          • Chọn "Phục hồi" để khôi phục dữ liệu từ bản sao lưu đã chọn
        </Text>
        <br />
        <Text>• Chọn "Tải xuống" để tải bản sao lưu về máy tính</Text>
        <br />
        <Text type="warning">
          • Lưu ý: Khi phục hồi, dữ liệu hiện tại sẽ bị thay thế hoàn toàn bởi
          dữ liệu từ bản sao lưu
        </Text>
      </Card>
    </div>
  );
};

// Thêm styles cho modal xác nhận
const confirmModalStyle = {
  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  content: {
    marginTop: "16px",
  },
  warning: {
    color: "#ff4d4f",
    marginTop: "8px",
  },
};

export default Restore;
