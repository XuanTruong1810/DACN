/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  message,
  Modal,
  Row,
  Col,
  Divider,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  PrinterOutlined,
  MedicineBoxOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useLocation } from "react-router-dom";

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
};

const VaccinationHistory = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin/health/");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalPigs: 0,
    totalRecords: 0,
    vaccineTypes: 0,
    totalVaccinated: 0,
  });

  const fetchVaccinationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/PigExamination?examinationType=vaccination`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setData(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải lịch sử tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [vaccinationResponse, medicineResponse, pigsResponse] =
        await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/PigExamination?examinationType=Vaccination`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/v1/Medicine?isVaccine=true`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/Pigs`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

      if (
        vaccinationResponse.status === 200 &&
        medicineResponse.status === 200 &&
        pigsResponse.status === 200
      ) {
        const vaccinations = vaccinationResponse.data.data;
        const vaccines = medicineResponse.data.data;
        const pigs = pigsResponse.data.data;

        // Tính tổng số lượt tiêm dựa trên healthNote
        const totalVaccinatedCount = vaccinations.reduce((sum, record) => {
          const validVaccinations = record.pigExaminationDetails.filter(
            (detail) => detail.healthNote === "Tiêm chủng"
          );
          return sum + validVaccinations.length;
        }, 0);

        setStats({
          totalPigs: pigs.length,
          totalRecords: vaccinations.length,
          vaccineTypes: vaccines.length,
          totalVaccinated: totalVaccinatedCount,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu thống kê");
    }
  };

  useEffect(() => {
    fetchVaccinationHistory();
    fetchStats();
  }, []);

  const tableData = data
    .map((record) => ({
      key: record.id,
      id: record.id,
      examinationDate: record.examinationDate,
      medicineName: record.medicineName,
      createdByName: record.createdByName,
      details: record.pigExaminationDetails,
    }))
    .sort(
      (a, b) =>
        dayjs(b.examinationDate).unix() - dayjs(a.examinationDate).unix()
    );

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Mã heo",
        dataIndex: "pigId",
        key: "pigId",
        width: "12%",
        render: (id) => <Tag color="blue">{id}</Tag>,
      },
      {
        title: "Chuẩn đoán",
        dataIndex: "diagnosis",
        key: "diagnosis",
        width: "20%",
      },
      {
        title: "Phương pháp điều trị",
        dataIndex: "treatmentMethod",
        key: "treatmentMethod",
        width: "20%",
      },
      {
        title: "Thuốc sử dụng",
        dataIndex: "pigExaminationMedicines",
        key: "medicines",
        width: "28%",
        render: (medicines) => (
          <Space direction="vertical" size={2}>
            {medicines?.map((med, index) => (
              <Space key={index}>
                <MedicineBoxOutlined />
                {med.medicineName} ({med.medicineQuantity} liều)
              </Space>
            ))}
          </Space>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "healthNote",
        key: "healthNote",
        width: "20%",
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.details}
        pagination={false}
        rowKey="pigId"
      />
    );
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: "15%",
      render: (id) => <Tag color="processing">{id}</Tag>,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "examinationDate",
      key: "examinationDate",
      width: "20%",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
      sorter: (a, b) =>
        dayjs(a.examinationDate).unix() - dayjs(b.examinationDate).unix(),
    },
    {
      title: "Vaccine",
      dataIndex: "medicineName",
      key: "medicineName",
      width: "30%",
      render: (name) => (
        <Space>
          <MedicineBoxOutlined style={{ color: "#1890ff" }} />
          {name}
        </Space>
      ),
    },
    {
      title: "Số lượng heo",
      key: "pigCount",
      width: "15%",
      render: (_, record) => (
        <Tag color="blue">{record.details.length} con</Tag>
      ),
    },
    {
      title: "Người thực hiện",
      dataIndex: "createdByName",
      key: "createdByName",
      width: "20%",
      render: (name) => <Text strong>{name}</Text>,
    },
  ];

  const renderVaccinationDetail = () => {
    if (!selectedRecord) return null;

    return (
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        className="invoice-modal"
        footer={[
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            In phiếu
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div
          className="print-content"
          style={{ padding: "40px", backgroundColor: "#fff" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <img src="/logo.png" alt="Logo" style={{ height: "60px" }} />
              <div>
                <Title level={3} style={{ margin: 0, letterSpacing: "1px" }}>
                  CÔNG TY TNHH CHĂN NUÔI ABC
                </Title>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Địa chỉ: 123 Đường XYZ, Quận ABC, TP.HCM
                  <br />
                  Điện thoại: (028) 1234 5678 - Email: info@abc.com
                </Text>
              </div>
            </Space>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Title */}
          <Title level={2} style={{ textAlign: "center", margin: "24px 0" }}>
            PHIẾU TIÊM VACCINE
          </Title>

          {/* Info */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Text strong>Mã phiếu: </Text>
              <Text>{selectedRecord.id}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Ngày tiêm: </Text>
              <Text>
                {dayjs(selectedRecord.examinationDate).format("DD/MM/YYYY")}
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>Người thực hiện: </Text>
              <Text>{selectedRecord.createdByName}</Text>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Text strong>Vaccine: </Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                <MedicineBoxOutlined /> {selectedRecord.medicineName}
              </Tag>
            </Col>
          </Row>

          {/* Chi tiết tiêm */}
          <Title level={5} style={{ marginTop: 32, marginBottom: 16 }}>
            Chi tiết tiêm chủng:
          </Title>
          <Table
            bordered
            size="middle"
            pagination={false}
            columns={[
              {
                title: "Mã heo",
                dataIndex: "pigId",
                width: "12%",
                render: (id) => <Tag color="blue">{id}</Tag>,
              },
              {
                title: "Chuẩn đoán",
                dataIndex: "diagnosis",
                width: "20%",
              },
              {
                title: "Phương pháp điều trị",
                dataIndex: "treatmentMethod",
                width: "20%",
              },
              {
                title: "Thuốc sử dụng",
                dataIndex: "pigExaminationMedicines",
                width: "28%",
                render: (medicines) => (
                  <Space direction="vertical" size={2}>
                    {medicines?.map((med, index) => (
                      <Space key={index}>
                        <MedicineBoxOutlined />
                        {med.medicineName} ({med.medicineQuantity} liều)
                      </Space>
                    ))}
                  </Space>
                ),
              },
              {
                title: "Ghi chú",
                dataIndex: "healthNote",
                width: "20%",
              },
            ]}
            dataSource={selectedRecord.pigExaminationDetails}
            rowKey="pigId"
          />

          {/* Chữ ký */}
          <Row
            justify="space-between"
            style={{ marginTop: 48, textAlign: "center" }}
          >
            <Col span={8}>
              <Text strong>Người lập phiếu</Text>
              <div style={{ marginTop: 60 }}>
                <Text type="secondary">(Ký và ghi rõ họ tên)</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Người kiểm tra</Text>
              <div style={{ marginTop: 60 }}>
                <Text type="secondary">(Ký và ghi rõ họ tên)</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Người thực hiện</Text>
              <div style={{ marginTop: 60 }}>
                <Text>{selectedRecord.createdByName}</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space direction="vertical" size={4}>
            <Title level={3}>Lịch sử tiêm chủng</Title>
            <Text type="secondary">
              Theo dõi lịch sử tiêm vaccine của đàn heo
            </Text>
          </Space>
          {!isAdminRoute && (
            <Space>
              <Button
                icon={<CalendarOutlined />}
                onClick={() => (window.location.href = "../../veterinarian")}
              >
                Lịch tiêm
              </Button>
            </Space>
          )}
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                ...pageStyles.statsCard,
                background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
                borderLeft: "4px solid #52c41a",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                    Tổng phiếu tiêm
                  </Text>
                }
                value={stats.totalRecords}
                suffix="phiếu"
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={
                  <HistoryOutlined
                    style={{
                      fontSize: "28px",
                      color: "#52c41a",
                      backgroundColor: "#f6ffed",
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
              hoverable
              style={{
                ...pageStyles.statsCard,
                background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
                borderLeft: "4px solid #1890ff",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    Tổng số heo
                  </Text>
                }
                value={stats.totalPigs}
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
              hoverable
              style={{
                ...pageStyles.statsCard,
                background: "linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)",
                borderLeft: "4px solid #2f54eb",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#2f54eb" }}>
                    Số loại vaccine
                  </Text>
                }
                value={stats.vaccineTypes}
                suffix="loại"
                valueStyle={{
                  color: "#2f54eb",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={
                  <ExperimentOutlined
                    style={{
                      fontSize: "28px",
                      color: "#2f54eb",
                      backgroundColor: "#f0f5ff",
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
              hoverable
              style={{
                ...pageStyles.statsCard,
                background: "linear-gradient(135deg, #fff0f6 0%, #ffffff 100%)",
                borderLeft: "4px solid #eb2f96",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#eb2f96" }}>
                    Tổng lượt tiêm
                  </Text>
                }
                value={stats.totalVaccinated}
                suffix="lượt"
                valueStyle={{
                  color: "#eb2f96",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={
                  <LineChartOutlined
                    style={{
                      fontSize: "28px",
                      color: "#eb2f96",
                      backgroundColor: "#fff0f6",
                      padding: "8px",
                      borderRadius: "8px",
                    }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          dataSource={tableData}
          loading={loading}
          rowKey="key"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`,
          }}
          defaultSortOrder="descend"
          sortDirections={["descend", "ascend"]}
          defaultSortField="examinationDate"
        />
      </Card>

      {renderVaccinationDetail()}

      <style>
        {`
          @media print {
            /* Ẩn tất cả các phần tử khác */
            body > *:not(.ant-modal-root) {
              display: none !important;
            }
            
            /* Hiển thị modal và nội dung */
            .ant-modal-root {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
            }

            /* Ẩn các phần không cần thiết của modal */
            .ant-modal-mask,
            .ant-modal-footer,
            .ant-modal-close {
              display: none !important;
            }

            /* Định dạng nội dung in */
            .ant-modal-content {
              box-shadow: none;
              padding: 0;
            }

            .print-content {
              padding: 20px;
              width: 100%;
            }

            /* Đảm bảo bảng hiển thị đúng */
            .ant-table {
              width: 100% !important;
            }

            .ant-table-bordered .ant-table-cell {
              border-color: #000 !important;
            }

            /* Định dạng trang in */
            @page {
              size: A4;
              margin: 2cm;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VaccinationHistory;
