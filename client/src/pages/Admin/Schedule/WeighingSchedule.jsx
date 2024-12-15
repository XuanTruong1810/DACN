/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Card,
  Badge,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tooltip,
  message,
  Modal,
  Table,
  Input,
  InputNumber,
  Tag,
  Alert,
} from "antd";
import {
  PrinterOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import locale from "antd/es/calendar/locale/vi_VN";

const { Title, Text } = Typography;
const { TextArea } = Input;

const WeighingSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [weighingPlans, setWeighingPlans] = useState([]);
  const [isWeighingModalVisible, setIsWeighingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlanPigs, setSelectedPlanPigs] = useState([]);
  const [weighingData, setWeighingData] = useState({});
  const [weighingNote, setWeighingNote] = useState("");
  const calendarRef = useRef(null);

  // Fetch danh sách kế hoạch cân
  const fetchWeighingPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/CalenderWeighing/calender-weighing`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setWeighingPlans(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeighingPlans();
  }, []);

  // Xử lý dữ liệu cho calendar cell
  const getListData = (value) => {
    const date = value.format("YYYY-MM-DD");
    const result = [];

    // Tìm kế hoạch cân cho ngày này
    const plansForDate = weighingPlans.filter(
      (plan) => dayjs(plan.weighingDate).format("YYYY-MM-DD") === date
    );

    if (plansForDate.length > 0) {
      const plan = plansForDate[0];
      // Đếm số heo đã cân trong kế hoạch này
      const weighedPigs = plan.weighingDetails.filter(
        (detail) =>
          detail.lastWeighingDate &&
          dayjs(detail.lastWeighingDate).format("YYYY-MM-DD") === date
      );

      // Nếu có heo đã cân
      if (weighedPigs.length > 0) {
        result.push({
          type: "weighed",
          totalPigs: weighedPigs.length,
          weighingDetails: weighedPigs,
          lastWeighingDate: weighedPigs[0].lastWeighingDate,
        });
      }

      // Đếm số heo chưa cân
      const remainingPigs = plan.weighingDetails.filter(
        (detail) =>
          !detail.lastWeighingDate ||
          dayjs(detail.lastWeighingDate).format("YYYY-MM-DD") !== date
      );

      // Nếu còn heo chưa cân
      if (remainingPigs.length > 0) {
        result.push({
          type: "planned",
          weighingDate: plan.weighingDate,
          totalPigs: remainingPigs.length,
          weighingDetails: remainingPigs,
        });
      }
    }

    return result;
  };

  // Render nội dung cho calendar cell
  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul
        className="events"
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {listData.map((item, index) => (
          <li key={index}>
            <Tooltip
              title={
                <>
                  <div>
                    {item.type === "weighed" ? "Đã cân" : "Lịch cân"}:{" "}
                    {item.totalPigs} con
                  </div>
                  {item.type === "weighed" && (
                    <div>
                      Ngày cân:{" "}
                      {dayjs(item.lastWeighingDate).format("DD/MM/YYYY")}
                    </div>
                  )}
                </>
              }
              placement="topLeft"
            >
              <Badge
                status={item.type === "weighed" ? "default" : "processing"}
                text={
                  <span
                    style={{
                      color: item.type === "weighed" ? "#999" : "inherit",
                      textDecoration:
                        item.type === "weighed" ? "line-through" : "none",
                      fontSize: item.type === "weighed" ? "12px" : "14px",
                      cursor: item.type === "planned" ? "pointer" : "default",
                    }}
                  >
                    {item.type === "weighed" ? "Đã cân" : "Lịch cân"} -{" "}
                    {item.totalPigs} con
                  </span>
                }
                style={{
                  whiteSpace: "nowrap",
                  display: "block",
                  marginBottom: 4,
                  opacity: item.type === "weighed" ? 0.7 : 1,
                }}
                onClick={() => {
                  if (item.type === "planned") {
                    handleDateClick(value, item);
                  }
                }}
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  // Xử lý khi click vào một ngày
  const handleDateClick = (date, plan) => {
    const isWeighed =
      plan.lastWeighingDate &&
      dayjs(plan.lastWeighingDate).format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD");

    if (isWeighed) {
      return; // Không làm gì nếu đã cân
    }

    setSelectedDate(date);
    const formattedPigs = plan.weighingDetails.map((pig) => ({
      key: pig.pigId,
      pigId: pig.pigId,
      stableName: pig.stableName,
      areaId: pig.areaId,
      areaName: pig.areaName,
      weight: pig.weight || weighingData[pig.pigId] || "",
      note: "",
    }));
    setSelectedPlanPigs(formattedPigs);
    setIsWeighingModalVisible(true);
  };

  // Xử lý in phiếu
  const handlePrint = () => {
    // Nhóm heo theo khu vực và chuồng
    const pigsByArea = selectedPlanPigs.reduce((acc, pig) => {
      if (!acc[pig.areaName]) {
        acc[pig.areaName] = {};
      }
      if (!acc[pig.areaName][pig.stableName]) {
        acc[pig.areaName][pig.stableName] = [];
      }
      acc[pig.areaName][pig.stableName].push({
        ...pig,
        weight: weighingData[pig.pigId] || "",
      });
      return acc;
    }, {});

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Phiếu Cân Heo</title>
          <style>
            @media print {
              body { 
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
                margin-bottom: 20px;
              }
              th, td { 
                border: 1px solid black; 
                padding: 8px; 
                text-align: left; 
              }
              h2, h3, h4 { 
                margin: 10px 0;
              }
              h2 { 
                text-align: center;
                font-size: 24px;
              }
              h3 { 
                color: #003366;
                font-size: 20px;
                border-bottom: 2px solid #003366;
                padding-bottom: 5px;
              }
              h4 {
                color: #666;
                font-size: 16px;
                margin-left: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>PHIẾU CÂN HEO</h2>
          </div>
          <div class="date-info">
            Ngày: ${selectedDate?.format("DD/MM/YYYY")}
          </div>

          ${Object.entries(pigsByArea)
            .map(
              ([areaName, stables]) => `
              <div class="area-section">
                <h3>Khu: ${areaName}</h3>
                ${Object.entries(stables)
                  .map(
                    ([stableName, pigs]) => `
                    <div class="stable-section">
                      <h4>Chuồng: ${stableName}</h4>
                      <table>
                        <thead>
                          <tr>
                            <th style="width: 30%">Mã Heo</th>
                            <th style="width: 20%">Cân nặng (kg)</th>
                            <th style="width: 50%">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${pigs
                            .map(
                              (pig) => `
                            <tr>
                              <td>${pig.pigId}</td>
                              <td>${pig.weight}</td>
                              <td>${pig.note || ""}</td>
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `
            )
            .join("")}
          
          <div style="text-align: right; margin: 20px 0;">
            <strong>Tổng số heo: ${selectedPlanPigs.length} con</strong>
          </div>

          ${
            weighingNote
              ? `
            <div class="note-section">
              <strong>Ghi chú chung:</strong>
              <p>${weighingNote}</p>
            </div>
          `
              : ""
          }

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Xử lý lưu phiếu cân
  const handleWeighingSave = async () => {
    try {
      const invalidPigs = selectedPlanPigs.filter(
        (pig) => !weighingData[pig.pigId]
      );
      if (invalidPigs.length > 0) {
        message.error("Vui lòng nhập cân nặng cho tất cả các heo");
        return;
      }

      const payload = {
        weighingDate: dayjs(selectedDate).format("YYYY-MM-DD"),
        areaId: selectedPlanPigs[0].areaId,
        weighingDetails: selectedPlanPigs.map((pig) => ({
          pigId: pig.pigId,
          weight: weighingData[pig.pigId],
        })),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/WeighingHistory`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      if (response.status === 200) {
        message.success("Ghi nhận cân heo thành công");
        setIsWeighingModalVisible(false);
        setWeighingData({});
        fetchWeighingPlans();
      }
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi lưu phiếu cân: " + error.message);
    }
  };

  // Sắp xếp và nhóm dữ liệu theo khu vực
  const groupedPigsByArea = selectedPlanPigs.reduce((acc, pig) => {
    if (!acc[pig.areaName]) {
      acc[pig.areaName] = [];
    }
    acc[pig.areaName].push(pig);
    return acc;
  }, {});

  // Columns cho bảng cân heo
  const weighingColumns = [
    {
      title: "Chuồng",
      dataIndex: "stableName",
      width: 120,
    },
    {
      title: "Mã Heo",
      dataIndex: "pigId",
      width: 150,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Cân nặng (kg)",
      width: 150,
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          placeholder="Nhập cân nặng..."
          value={weighingData[record.pigId]}
          onChange={(value) => {
            setWeighingData((prev) => ({
              ...prev,
              [record.pigId]: value,
            }));
          }}
          size="small"
          disabled={!canCreateWeighingRecord(selectedDate)}
        />
      ),
    },
    {
      title: "Ghi chú",
      width: 200,
      render: (_, record) => (
        <Input
          placeholder="Nhập ghi chú..."
          value={record.note}
          onChange={(e) => {
            const newData = [...selectedPlanPigs];
            const index = newData.findIndex(
              (item) => item.pigId === record.pigId
            );
            newData[index] = { ...newData[index], note: e.target.value };
            setSelectedPlanPigs(newData);
          }}
          size="small"
        />
      ),
    },
  ];

  // Thêm hàm kiểm tra ngày
  const canCreateWeighingRecord = (date) => {
    const today = dayjs().startOf("day");
    const weighingDate = dayjs(date).startOf("day");
    return weighingDate.isSame(today);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3}>
              <HistoryOutlined /> Lịch trình cân heo
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                onClick={() => {
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
                }}
              >
                Hôm nay
              </Button>
              <Button
                type="primary"
                icon={<HistoryOutlined />}
                onClick={() => navigate("/dispatch/weighing-history")}
              >
                Lịch sử cân
              </Button>
            </Space>
          </Col>
        </Row>

        <div ref={calendarRef}>
          <Calendar
            locale={locale}
            cellRender={(date, { type }) =>
              type === "date" ? dateCellRender(date) : null
            }
            loading={loading}
          />
        </div>
      </Card>

      <Modal
        title="Phiếu cân heo"
        open={isWeighingModalVisible}
        onCancel={() => {
          setIsWeighingModalVisible(false);
          setWeighingData({});
          setWeighingNote("");
        }}
        width={1000}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsWeighingModalVisible(false);
              setWeighingData({});
              setWeighingNote("");
            }}
          >
            Hủy
          </Button>,
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            disabled={selectedPlanPigs.length === 0}
          >
            In phiếu
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleWeighingSave}
            disabled={selectedPlanPigs.length === 0}
          >
            Lưu phiếu ({selectedPlanPigs.length} con)
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small" title="Thông tin cân heo">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Ngày cân:</Text>{" "}
                    <Text>{selectedDate?.format("DD/MM/YYYY")}</Text>
                  </div>
                  <div>
                    <Text strong>Tổng số heo:</Text>{" "}
                    <Text>{selectedPlanPigs.length} con</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          <TextArea
            rows={4}
            placeholder="Ghi chú chung..."
            value={weighingNote}
            onChange={(e) => setWeighingNote(e.target.value)}
          />

          {/* Hiển thị theo từng khu vực */}
          {Object.entries(groupedPigsByArea).map(([areaName, pigs]) => (
            <Card
              key={areaName}
              title={`${areaName}`} // Bỏ phần hiển thị số lượng heo trong khu
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Table
                columns={weighingColumns.filter(
                  (col) => col.dataIndex !== "areaName"
                )}
                dataSource={pigs}
                pagination={false}
                size="small"
                bordered
              />
            </Card>
          ))}
        </Space>
        {!canCreateWeighingRecord(selectedDate) && (
          <Alert
            message="Chỉ có thể tạo phiếu cân cho ngày hôm nay"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </Modal>
      <style jsx>{`
        .area-divider {
          border-top: 2px solid #1890ff;
        }
        .stable-divider {
          border-top: 1px solid #d9d9d9;
        }
      `}</style>
    </div>
  );
};

export default WeighingSchedule;
