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

      // Sắp xếp danh sách backup theo thời gian mới nhất
      const sortedBackups = response.data.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setBackups(sortedBackups);
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

  const handleRestore = (fileName) => {
    confirm({
      title: (
        <div style={confirmModalStyle.title}>Xác nhận phục hồi dữ liệu</div>
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

          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/Backup/${fileName}/restore`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.success("Phục hồi dữ liệu thành công");
          // window.location.reload();
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

  const handleQuickRestore = () => {
    if (backups.length === 0) {
      message.warning("Không có bản sao lưu nào");
      return;
    }

    const latestBackup = backups[0];

    confirm({
      title: <div style={confirmModalStyle.title}>Xác nhận phục hồi nhanh</div>,
      content: (
        <div style={confirmModalStyle.content}>
          <Text>
            Bạn có chắc chắn muốn phục hồi dữ liệu từ bản sao lưu mới nhất (
            {dayjs(latestBackup.createdAt).format("DD/MM/YYYY HH:mm:ss")})?
          </Text>
          <Divider />
          <Text type="secondary">Tên file: {latestBackup.fileName}</Text>
          <Divider />
          <Text type="danger" strong style={confirmModalStyle.warning}>
            Lưu ý: Dữ liệu hiện tại sẽ bị thay thế bởi dữ liệu từ bản sao lưu
            này.
          </Text>
        </div>
      ),
      onOk: () => handleRestore(latestBackup.fileName),
      okText: "Xác nhận",
      cancelText: "Hủy",
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginTop: 0 }}>
          <InfoCircleOutlined /> Hướng dẫn
        </Title>
        <Text>
          • Chọn &quot;Phục hồi&quot; để khôi phục dữ liệu từ bản sao lưu đã
          chọn
        </Text>
        <br />
        <Text type="warning">
          • Lưu ý: Khi phục hồi, dữ liệu hiện tại sẽ bị thay thế hoàn toàn bởi
          dữ liệu từ bản sao lưu
        </Text>
      </Card>

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
          <Space>
            <Tooltip title="Phục hồi bản sao lưu mới nhất">
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleQuickRestore}
                loading={loading}
                danger
              >
                Phục hồi nhanh
              </Button>
            </Tooltip>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchBackups}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={backups}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Tổng số ${total} bản sao lưu`,
            style: { marginTop: 16 },
          }}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "16px 24px",
                backgroundColor: "white",
                borderRadius: "8px",
                marginBottom: "8px",
                border: "1px solid #f0f0f0",
              }}
              actions={[
                <Tooltip key="restore-tooltip" title="Phục hồi dữ liệu">
                  <Button
                    key="restore"
                    type="primary"
                    icon={<ImportOutlined />}
                    onClick={() => handleRestore(item.fileName)}
                    loading={loading}
                    style={{ borderRadius: "6px" }}
                  >
                    Phục hồi
                  </Button>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                  </div>
                }
                title={
                  <Space size="middle" style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {item.fileName}
                    </Text>
                    <Tag
                      color="blue"
                      style={{ borderRadius: "4px", padding: "2px 8px" }}
                    >
                      {(item.size / (1024 * 1024)).toFixed(2)} MB
                    </Tag>
                  </Space>
                }
                description={
                  <Space>
                    <HistoryOutlined style={{ color: "#8c8c8c" }} />
                    <Text type="secondary">
                      Sao lưu lúc:{" "}
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                    </Text>
                  </Space>
                }
                style={{ margin: "4px 0" }}
              />
            </List.Item>
          )}
          style={{
            backgroundColor: "#fafafa",
            padding: "16px",
            borderRadius: "8px",
          }}
        />
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
