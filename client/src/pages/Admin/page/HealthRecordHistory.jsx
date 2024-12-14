/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  message,
  Space,
  Button,
  Tag,
  Row,
  Col,
  Layout,
  Modal,
  Statistic,
} from "antd";
import { HistoryOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const pageStyles = {
  layout: {
    padding: "16px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  mainCard: {
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "none",
    marginTop: "8px",
  },
  headerIcon: {
    fontSize: 28,
    color: "#1890ff",
    backgroundColor: "#e6f7ff",
    padding: "8px",
    borderRadius: "8px",
  },
  headerTitle: {
    margin: 0,
    color: "#262626",
  },
  statsCard: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    height: "100%",
    padding: "20px",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
  },
  table: {
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    ".ant-table-thead > tr > th": {
      background: "#fafafa",
      fontWeight: 600,
    },
    ".ant-table-tbody > tr:hover > td": {
      background: "#f0f7ff",
    },
  },
  createButton: {
    background: "#1890ff",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
    padding: "0 24px",
    height: "40px",
    "&:hover": {
      background: "#40a9ff",
      boxShadow: "0 4px 8px rgba(24, 144, 255, 0.3)",
    },
  },
  backButton: {
    borderRadius: "6px",
    height: "40px",
    padding: "0 24px",
  },
};

// Cập nhật style cho các card thống kê
const statsCardStyles = {
  totalRecords: {
    background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
    borderLeft: "4px solid #722ed1",
  },
  totalPigs: {
    background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
    borderLeft: "4px solid #1890ff",
  },
  healthyPigs: {
    background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
    borderLeft: "4px solid #52c41a",
  },
  sickPigs: {
    background: "linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)",
    borderLeft: "4px solid #ff4d4f",
  },
};

const HealthRecordHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.includes("/admin/");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    sick: 0,
    totalRecords: 0,
  });

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/PigExamination`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            examinationType: "Regular",
          },
        }
      );
      console.log("Examination response:", response.data);

      if (response.status === 200) {
        setData(response.data.data);
        setStats((prev) => ({
          ...prev,
          totalRecords: response.data.data.length,
        }));
      }
    } catch (error) {
      console.error("Examination error:", error);
      message.error("Không thể tải dữ liệu khám bệnh");
    } finally {
      setLoading(false);
    }
  };

  const fetchPigStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Pig stats response:", response.data);

      if (response.status === 200) {
        const pigs = response.data.data;
        const pigStats = pigs.reduce(
          (acc, pig) => {
            acc.total++;
            if (pig.healthStatus === "good") {
              acc.healthy++;
            } else {
              acc.sick++;
            }
            return acc;
          },
          { total: 0, healthy: 0, sick: 0 }
        );

        setStats((prev) => ({
          ...prev,
          ...pigStats,
        }));
      }
    } catch (error) {
      console.error("Pig stats error:", error);
      message.error("Không thể tải thống kê heo");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchExaminations(), fetchPigStats()]);
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Ngày khám",
      dataIndex: "examinationDate",
      key: "examinationDate",
      width: 200,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.examinationDate).unix() - dayjs(b.examinationDate).unix(),
    },
    {
      title: "Người khám",
      dataIndex: "createdByName",
      key: "createdByName",
      width: 200,
    },
    {
      title: "Số heo",
      key: "pigCount",
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.pigExaminationDetails?.length || 0} con</Tag>
      ),
    },
    {
      title: "Ghi chú",
      key: "examinationNote",
      ellipsis: true,
      render: (_, record) => record.examinationNote || "",
    },
  ];

  const DetailModal = ({ visible, record, onClose }) => {
    if (!record) return null;

    return (
      <Modal
        title="Chi tiết phiếu khám bệnh"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Ngày khám:</Text>{" "}
                <Text style={{ fontSize: "16px", color: "#1890ff" }}>
                  {dayjs(record.examinationDate).format("DD/MM/YYYY")}
                </Text>
              </Col>
              <Col span={8}>
                <Text strong>Mã phiếu:</Text>{" "}
                <Tag color="blue">{record.id}</Tag>
              </Col>
              <Col span={8}>
                <Text strong>Người khám:</Text> {record.createdByName}
              </Col>
            </Row>
          </Card>

          <Table
            columns={[
              {
                title: "Mã heo",
                dataIndex: "pigId",
                key: "pigId",
                width: 120,
                render: (id) => <Tag color="blue">{id}</Tag>,
              },
              {
                title: "Chẩn đoán",
                dataIndex: "diagnosis",
                key: "diagnosis",
                width: 200,
              },
              {
                title: "Cách điều trị",
                dataIndex: "treatmentMethod",
                key: "treatmentMethod",
                width: 200,
              },
              {
                title: "Thuốc sử dụng",
                key: "medicines",
                render: (_, record) => (
                  <Space direction="vertical">
                    {record.pigExaminationMedicines?.map((med, index) => (
                      <Tag key={index}>
                        {med.medicineName} - {med.medicineQuantity} liều
                      </Tag>
                    ))}
                  </Space>
                ),
              },
              {
                title: "Ghi chú",
                dataIndex: "healthNote",
                key: "healthNote",
                ellipsis: true,
              },
            ]}
            dataSource={record.pigExaminationDetails}
            pagination={false}
            scroll={{ y: 400 }}
            size="small"
          />
        </Space>
      </Modal>
    );
  };

  return (
    <Layout style={pageStyles.layout}>
      <Card bordered={false} style={pageStyles.mainCard}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "20px" }}
          >
            <Col>
              <Space align="center" size="middle">
                <HistoryOutlined style={pageStyles.headerIcon} />
                <Title level={4} style={pageStyles.headerTitle}>
                  Lịch sử khám bệnh
                </Title>
              </Space>
            </Col>
            {!isAdminPage && (
              <Col>
                <Button
                  type="primary"
                  icon={<MedicineBoxOutlined />}
                  onClick={() => navigate("/veterinarian/health/create")}
                  size="middle"
                  style={pageStyles.createButton}
                >
                  Tạo phiếu khám
                </Button>
              </Col>
            )}
          </Row>

          {/* Thống kê */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...pageStyles.statsCard,
                  ...statsCardStyles.totalRecords,
                }}
                hoverable
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#722ed1" }}>
                      Tổng phiếu khám
                    </Text>
                  }
                  value={stats.totalRecords}
                  suffix="phiếu"
                  valueStyle={{
                    color: "#722ed1",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                  prefix={
                    <HistoryOutlined
                      style={{
                        fontSize: "28px",
                        color: "#722ed1",
                        backgroundColor: "#f9f0ff",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    />
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...pageStyles.statsCard,
                  ...statsCardStyles.totalPigs,
                }}
                hoverable
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      Tổng số heo
                    </Text>
                  }
                  value={stats.total}
                  suffix="con"
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                  prefix={
                    <MedicineBoxOutlined
                      style={{
                        fontSize: "28px",
                        color: "#1890ff",
                        backgroundColor: "#e6f7ff",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    />
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...pageStyles.statsCard,
                  ...statsCardStyles.healthyPigs,
                }}
                hoverable
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                      Số heo khỏe mạnh
                    </Text>
                  }
                  value={stats.healthy}
                  suffix="con"
                  valueStyle={{
                    color: "#52c41a",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                  prefix={
                    <Tag
                      color="success"
                      style={{
                        fontSize: "20px",
                        padding: "8px",
                        borderRadius: "8px",
                        margin: "4px",
                      }}
                    >
                      ✓
                    </Tag>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...pageStyles.statsCard,
                  ...statsCardStyles.sickPigs,
                }}
                hoverable
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                      Số heo đang bệnh
                    </Text>
                  }
                  value={stats.sick}
                  suffix="con"
                  valueStyle={{
                    color: "#ff4d4f",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                  prefix={
                    <Tag
                      color="error"
                      style={{
                        fontSize: "20px",
                        padding: "8px",
                        borderRadius: "8px",
                        margin: "4px",
                      }}
                    >
                      !
                    </Tag>
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={{
              total: data.length,
              pageSize: 10,
              showTotal: (total) => `Tổng số: ${total} bản ghi`,
              style: { marginTop: "16px" },
            }}
            scroll={{ x: 1200 }}
            style={pageStyles.table}
            onRow={(record) => ({
              onClick: () => {
                setSelectedRecord(record);
                setModalVisible(true);
              },
              style: { cursor: "pointer" },
            })}
          />
        </Space>
      </Card>
      <DetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => {
          setModalVisible(false);
          setSelectedRecord(null);
        }}
      />
    </Layout>
  );
};

export default HealthRecordHistory;
