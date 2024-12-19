/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
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
  Divider,
  notification,
} from "antd";
import {
  CalendarOutlined,
  PrinterOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
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
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const calendarRef = useRef(null);

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
      console.log("API Response:", response.data);
      console.log("Schedule Data:", response.data.data);
      console.log("First Item Sample:", response.data.data[0]);
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

  useEffect(() => {
    const checkTodaySchedule = () => {
      if (hasShownNotification) return;

      const today = dayjs().format("YYYY-MM-DD");
      const todayPlans = scheduleData.filter(
        (item) =>
          dayjs(item.examinationDate).format("YYYY-MM-DD") === today &&
          item.status !== "completed"
      );

      if (todayPlans.length > 0) {
        // Gom nhóm các vaccine giống nhau
        const groupedVaccines = todayPlans.reduce((acc, item) => {
          if (!acc[item.medicineName]) {
            acc[item.medicineName] = {
              medicineName: item.medicineName,
              totalQuantity: 0,
              count: 0,
              vaccineId: item.vaccineId,
              status: item.status,
            };
          }
          acc[item.medicineName].totalQuantity += item.vaccinationQuantity;
          acc[item.medicineName].count += 1;
          return acc;
        }, {});

        if (Object.keys(groupedVaccines).length > 0) {
          const totalVaccines = Object.keys(groupedVaccines).length;
          const totalPigs = Object.values(groupedVaccines).reduce(
            (sum, item) => sum + item.totalQuantity,
            0
          );

          // Tạo danh sách tên vaccine
          const vaccineNames = Object.values(groupedVaccines)
            .map((item) => item.medicineName)
            .join(", ");

          const notificationKey = `vaccination-${today}`;

          notification.info({
            key: notificationKey,
            message: "Lịch tiêm vaccine hôm nay",
            description: (
              <div>
                <p>
                  Có {totalVaccines} loại vaccine cần tiêm cho {totalPigs} con
                  heo
                </p>
                <p>Vaccine cần tiêm: {vaccineNames}</p>
              </div>
            ),
            placement: "topRight",
            duration: 3,
            style: {
              backgroundColor: "#e6f7ff",
              border: "1px solid #91d5ff",
            },
            icon: <MedicineBoxOutlined style={{ color: "#1890ff" }} />,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notification.destroy(notificationKey);

                  if (calendarRef.current) {
                    const todayElement = calendarRef.current.querySelector(
                      ".ant-picker-calendar-date-today"
                    );
                    if (todayElement) {
                      todayElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }

                  setSelectedDate(dayjs());
                  setIsPrintModalVisible(true);
                }}
              >
                Xem chi tiết
              </Button>
            ),
          });

          setHasShownNotification(true);
        }
      }
    };

    if (scheduleData.length > 0) {
      checkTodaySchedule();
    }
  }, [scheduleData, hasShownNotification]);

  // Hiển thị trên calendar
  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const listData = scheduleData.filter(
      (item) => dayjs(item.examinationDate).format("YYYY-MM-DD") === date
    );

    if (listData.length === 0) {
      return null;
    }

    // Gom nhóm các vaccine giống nhau
    const groupedVaccines = listData.reduce((acc, item) => {
      if (!acc[item.medicineName]) {
        acc[item.medicineName] = {
          medicineName: item.medicineName,
          totalQuantity: 0,
          count: 0,
          vaccineId: item.vaccineId,
          status: item.status,
        };
      }
      acc[item.medicineName].totalQuantity += item.vaccinationQuantity;
      acc[item.medicineName].count += 1;
      return acc;
    }, {});

    const isToday = date === dayjs().format("YYYY-MM-DD");
    const isPast = value.isBefore(dayjs(), "day");

    return (
      <ul className="events" style={{ margin: 0, padding: "4px 0" }}>
        {Object.values(groupedVaccines).map((item) => (
          <li
            key={item.medicineName}
            style={{
              opacity: item.status === "completed" ? 0.7 : 1,
              transition: "all 0.3s",
              marginBottom: "8px",
              backgroundColor:
                item.status === "completed"
                  ? "#f5f5f5" // Light gray for completed
                  : isPast && item.status !== "completed"
                  ? "#fff1f0" // Light red for overdue
                  : isToday
                  ? "#f6ffed" // Light green for today
                  : "#e6f7ff", // Light blue for future
              padding: "8px",
              borderRadius: "6px",
              border: `1px solid ${
                item.status === "completed"
                  ? "#d9d9d9" // Gray border for completed
                  : isPast && item.status !== "completed"
                  ? "#ffa39e" // Red border for overdue
                  : isToday
                  ? "#b7eb8f" // Green border for today
                  : "#91d5ff" // Blue border for future
              }`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "4px",
                fontSize: "16px",
                zIndex: 1,
              }}
            >
              {item.status === "completed" ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : isPast ? (
                <WarningOutlined style={{ color: "#f5222d" }} />
              ) : isToday ? (
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              ) : null}
            </div>

            <Tooltip
              title={`${item.count > 1 ? `${item.count} đợt tiêm - ` : ""}${
                item.totalQuantity
              } con ${item.status === "completed" ? "đã tiêm" : "cần tiêm"}`}
            >
              <div className="vaccine-info">
                <MedicineBoxOutlined
                  style={{
                    color:
                      item.status === "completed"
                        ? "#8c8c8c" // Gray for completed
                        : isPast && item.status !== "completed"
                        ? "#f5222d" // Red for overdue
                        : isToday
                        ? "#52c41a" // Green for today
                        : "#1890ff", // Blue for future
                    fontSize: "16px",
                    marginRight: "8px",
                  }}
                />
                <span
                  style={{
                    color:
                      item.status === "completed"
                        ? "#8c8c8c"
                        : isPast && item.status !== "completed"
                        ? "#f5222d"
                        : isToday
                        ? "#52c41a"
                        : "#1890ff",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Tiêm {item.medicineName}
                </span>
                <div
                  className="pig-count"
                  style={{
                    color:
                      item.status === "completed"
                        ? "#8c8c8c"
                        : isPast && item.status !== "completed"
                        ? "#f5222d"
                        : isToday
                        ? "#52c41a"
                        : "#1890ff",
                    fontSize: "13px",
                    margin: "4px 0",
                  }}
                >
                  {item.count > 1 ? `(${item.count} đợt - ` : "("}
                  {item.totalQuantity} con)
                </div>
                {item.status !== "completed" && (
                  <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/veterinarian/health/vaccination/create?vaccineId=${item.vaccineId}&date=${date}`
                      );
                    }}
                    style={{
                      padding: "4px 8px",
                      marginTop: "4px",
                      color:
                        isPast && item.status !== "completed"
                          ? "#f5222d"
                          : isToday
                          ? "#52c41a"
                          : "#1890ff",
                    }}
                  >
                    Tạo phiếu tiêm
                  </Button>
                )}
                {item.status === "completed" && (
                  <Tag
                    color="default"
                    style={{
                      marginTop: "4px",
                      padding: "2px 8px",
                    }}
                  >
                    Đã tiêm
                  </Tag>
                )}
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

    const vaccineGroups = daySchedule.reduce((groups, schedule) => {
      if (!groups[schedule.medicineName]) {
        groups[schedule.medicineName] = [];
      }
      groups[schedule.medicineName].push(schedule);
      return groups;
    }, {});

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

              /* Ẩn các phần không c��n thiết của modal */
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
              // disabled={!isToday}
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
                <div>
                  <Title level={3} style={{ margin: 0, letterSpacing: "1px" }}>
                    TRANG TRẠI CHĂN NUÔI HEO NTNPIGFARM
                  </Title>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Địa chỉ: Số 4, đường N1, khu dân cư phục vụ tái định cư, khu
                    phố Nhị Hòa, phường Hiệp Hòa, thành phố Biên Hòa, tỉnh Đồng
                    Nai
                    <br />
                    Điện thoại: 0971758902 - Email: truongtamcobra@gmail.com
                  </Text>
                </div>
              </Space>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Title */}
            <Title level={2} style={{ textAlign: "center", margin: "24px 0" }}>
              PHIẾU TIÊM CHỦNG
            </Title>

            {/* Info */}
            <Row style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text strong>Ngày tiêm chủng: </Text>
                <Text>{selectedDate.format("DD/MM/YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Vaccine sử dụng: </Text>
                <div>
                  {[
                    ...new Set(
                      daySchedule.map((schedule) => schedule.medicineName)
                    ),
                  ].map((medicineName, index) => (
                    <Tag key={index} color="blue" style={{ marginRight: 8 }}>
                      {medicineName}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Tables */}
            {Object.entries(vaccineGroups).map(([medicineName, schedules]) => (
              <div key={medicineName} style={{ marginBottom: 32 }}>
                <Title level={4}>Vaccine: {medicineName}</Title>
                {Object.entries(
                  groupPigsByStable(schedules.flatMap((s) => s.pigs))
                ).map(([stableName, pigs]) => (
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
              </div>
            ))}

            {/* Signatures */}
            <Row justify="end" style={{ marginTop: 48, textAlign: "center" }}>
              <Col span={7}>
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
            <Title level={3}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} /> Lịch tiêm chủng
              định kỳ cho đàn heo
            </Title>
            <Text type="secondary">
              Quản lý lịch tiêm chủng định kỳ cho đàn heo
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
              Nhật ký tiêm chủng
            </Button>
          </Space>
        </div>

        <div ref={calendarRef}>
          <Calendar
            locale={{ lang: { locale: "vi" } }}
            cellRender={(current, info) => {
              if (info.type === "date") {
                return dateCellRender(current);
              }
              return info.originNode;
            }}
            value={selectedDate}
            onSelect={onSelect}
            className="medicine-calendar"
          />
        </div>
      </Card>

      {renderDayDetails()}

      <style jsx global>{`
        .medicine-calendar .ant-picker-calendar-date-content {
          height: 100px !important;
          overflow: auto;
        }
        .medicine-calendar .events {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .medicine-calendar .ant-picker-cell {
          min-height: 120px;
        }
      `}</style>
    </div>
  );
};

export default MedicineSchedule;
