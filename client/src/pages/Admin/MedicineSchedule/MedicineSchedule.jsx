import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Badge,
  Modal,
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Tooltip,
  Table,
  message,
  List,
  Divider,
  Checkbox,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  PrinterOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import locale from "dayjs/locale/vi";
import "dayjs/locale/vi";
import "./MedicineSchedule.css";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const MedicineSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);

  // Fetch lịch tiêm
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/VaccinationPlan`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setScheduleData(response.data.data);
    } catch (error) {
      message.error("Không thể tải lịch tiêm vaccine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  // Hiển thị trên calendar
  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const today = dayjs().format("YYYY-MM-DD");
    const listData = scheduleData.filter(
      (item) => dayjs(item.examinationDate).format("YYYY-MM-DD") === date
    );

    if (listData.length === 0) {
      return null;
    }

    // Kiểm tra xem ngày đã tới chưa
    const isDateReached = date <= today; // TODO: Uncomment this when backend is ready

    // const isDateReached = true; // TODO: Uncomment this when backend is ready

    // Gom nhóm các vaccine giống nhau
    const groupedVaccines = listData.reduce((acc, item) => {
      if (!acc[item.medicineName]) {
        acc[item.medicineName] = {
          medicineName: item.medicineName,
          totalQuantity: 0,
          count: 0,
          vaccineId: item.vaccineId,
        };
      }
      acc[item.medicineName].totalQuantity += item.vaccinationQuantity;
      acc[item.medicineName].count += 1;
      return acc;
    }, {});

    return (
      <ul className="events">
        {Object.values(groupedVaccines).map((item) => (
          <li key={item.medicineName}>
            <Tooltip
              title={
                !isDateReached
                  ? "Chưa tới ngày tiêm"
                  : `${item.count > 1 ? `${item.count} đợt tiêm - ` : ""}${
                      item.totalQuantity
                    } con cần tiêm`
              }
            >
              <div className="vaccine-info">
                <MedicineBoxOutlined /> Tiêm {item.medicineName}
                <div className="pig-count">
                  {item.count > 1 ? `(${item.count} đợt - ` : "("}
                  {item.totalQuantity} con)
                </div>
                <Button
                  type="link"
                  size="small"
                  disabled={!isDateReached}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/veterinarian/health/vaccination/create?vaccineId=${item.vaccineId}&date=${date}`
                    );
                  }}
                  style={{
                    padding: "4px 8px",
                    marginTop: "4px",
                    opacity: isDateReached ? 1 : 0.5,
                    cursor: isDateReached ? "pointer" : "not-allowed",
                  }}
                >
                  Tạo phiếu tiêm
                </Button>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  // Modal chi tiết
  const renderDayDetails = () => {
    if (!selectedDate) return null;

    const date = selectedDate.format("YYYY-MM-DD");
    const today = dayjs().format("YYYY-MM-DD");
    const isToday = date === today;

    const daySchedule = scheduleData.filter(
      (item) => dayjs(item.examinationDate).format("YYYY-MM-DD") === date
    );

    const groupPigsByStable = (pigs) => {
      return pigs.reduce((acc, pig) => {
        if (!acc[pig.stableName]) {
          acc[pig.stableName] = [];
        }
        acc[pig.stableName].push(pig);
        return acc;
      }, {});
    };

    const allPigsGrouped = groupPigsByStable(
      daySchedule.flatMap((s) => s.pigs)
    );

    return (
      <>
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
        <Modal
          title={null}
          open={isPrintModalVisible}
          onCancel={() => setIsPrintModalVisible(false)}
          width={1000}
          className="invoice-modal"
          footer={[
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              disabled={!isToday}
            >
              In phiếu
            </Button>,
            <Button key="close" onClick={() => setIsPrintModalVisible(false)}>
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
            <Row style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text strong>Ngày tiêm chủng: </Text>
                <Text>{selectedDate.format("DD/MM/YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Vaccine sử dụng: </Text>
                <Text>{daySchedule[0]?.medicineName}</Text>
              </Col>
            </Row>

            {/* Tables */}
            {Object.entries(allPigsGrouped).map(([stableName, pigs]) => (
              <div key={stableName} style={{ marginBottom: 32 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Chuồng: {stableName}
                </Title>
                <Table
                  bordered
                  size="middle"
                  pagination={false}
                  columns={[
                    {
                      title: "Mã heo",
                      dataIndex: "pigId",
                      width: "10%",
                      render: (id) => (
                        <Tag
                          color="blue"
                          style={{
                            fontSize: "13px",
                            padding: "4px 8px",
                            margin: "0 auto",
                            display: "flex",
                            justifyContent: "center",
                            width: "fit-content",
                          }}
                        >
                          {id}
                        </Tag>
                      ),
                    },
                    {
                      title: "Sức khỏe",
                      width: "12%",
                      render: () => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "8px 4px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                border: "1.5px solid #000",
                                height: 16,
                                width: 16,
                                borderRadius: "3px",
                              }}
                            ></div>
                            <span>Khỏe</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                border: "1.5px solid #000",
                                height: 16,
                                width: 16,
                                borderRadius: "3px",
                              }}
                            ></div>
                            <span>Yếu</span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Tiêm",
                      width: "8%",
                      render: () => (
                        <div
                          style={{
                            border: "1.5px solid #000",
                            height: 24,
                            width: 24,
                            margin: "0 auto",
                            borderRadius: "3px",
                          }}
                        ></div>
                      ),
                    },
                    {
                      title: "Chuẩn đoán",
                      width: "15%",
                      render: () => <div style={{ height: 40 }}></div>,
                    },
                    {
                      title: "Cách điều trị",
                      width: "20%",
                      render: () => <div style={{ height: 40 }}></div>,
                    },
                    {
                      title: "Ngày khám lại",
                      width: "15%",
                      render: () => <div style={{ height: 40 }}></div>,
                    },
                    {
                      title: "Thuốc sử dụng",
                      width: "20%",
                      render: () => <div style={{ height: 40 }}></div>,
                    },
                  ]}
                  dataSource={pigs}
                />
              </div>
            ))}

            {/* Signatures */}
            <Row
              justify="space-between"
              style={{ marginTop: 48, textAlign: "center" }}
            >
              <Col span={8}>
                <Text strong style={{ fontSize: "14px" }}>
                  Người lập phiếu
                </Text>
                <div style={{ marginTop: 60 }}>
                  <Text type="secondary">(Ký và ghi rõ họ tên)</Text>
                </div>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: "14px" }}>
                  Người kiểm tra
                </Text>
                <div style={{ marginTop: 60 }}>
                  <Text type="secondary">(Ký và ghi rõ họ tên)</Text>
                </div>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: "14px" }}>
                  Người thực hiện
                </Text>
                <div style={{ marginTop: 60 }}>
                  <Text type="secondary">(Ký và ghi rõ họ tên)</Text>
                </div>
              </Col>
            </Row>
          </div>
        </Modal>
      </>
    );
  };

  const handlePrint = () => {
    setIsPrintModalVisible(true);
  };

  const onSelect = (date) => {
    setSelectedDate(date);
    handlePrint();
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
            <Title level={3}>Lịch tiêm vaccine</Title>
            <Text type="secondary">
              Quản lý lịch tiêm vaccine định kỳ cho đàn heo
            </Text>
          </Space>
          <Space>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => {
                setSelectedDate(dayjs());
                // Scroll calendar to today's date
                const todayCell = document.querySelector(
                  ".ant-picker-cell-today"
                );
                if (todayCell) {
                  todayCell.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
            >
              Hôm nay
            </Button>
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() =>
                (window.location.href =
                  "/veterinarian/health/vaccination-history")
              }
            >
              Lịch sử tiêm chủng
            </Button>
          </Space>
        </div>

        <Calendar
          locale={{ lang: { locale: "vi" } }}
          dateCellRender={dateCellRender}
          value={selectedDate}
          onSelect={onSelect}
          className="medicine-calendar"
        />
      </Card>

      {renderDayDetails()}
    </div>
  );
};

export default MedicineSchedule;
