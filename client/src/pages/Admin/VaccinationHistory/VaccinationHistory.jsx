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
} from "antd";
import {
  CalendarOutlined,
  PrinterOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const VaccinationHistory = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin/health/");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  useEffect(() => {
    fetchVaccinationHistory();
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
