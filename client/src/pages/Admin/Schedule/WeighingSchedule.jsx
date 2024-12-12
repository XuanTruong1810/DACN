import { useState, useEffect } from "react";
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
    return weighingPlans.filter(
      (plan) => dayjs(plan.weighingDate).format("YYYY-MM-DD") === date
    );
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
                <div>
                  <div>Khu: {item.areaName}</div>
                  <div>Số lượng: {item.pigIds.length} con</div>
                </div>
              }
              placement="topLeft"
            >
              <Badge
                status="processing"
                text={`${item.areaName} - ${item.pigIds.length} con`}
                style={{
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  display: "block",
                  marginBottom: 4,
                }}
                onClick={() => handleDateClick(value, item)}
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  // Xử lý khi click vào một ngày
  const handleDateClick = (date, plan) => {
    console.log(plan);
    setSelectedDate(date);
    const formattedPigs = plan.weighingDetails.map((pig) => ({
      key: pig.pigId,
      pigId: pig.pigId,
      stableName: pig.stableName,
      areaId: plan.areaId,
      areaName: plan.areaName,
      weight: weighingData[pig.pigId] || "",
      note: "",
    }));
    setSelectedPlanPigs(formattedPigs);
    setIsWeighingModalVisible(true);
  };

  // Xử lý in phiếu
  const handlePrint = () => {
    // Nhóm heo theo chuồng
    const pigsByStable = selectedPlanPigs.reduce((acc, pig) => {
      if (!acc[pig.stableName]) {
        acc[pig.stableName] = [];
      }
      acc[pig.stableName].push({
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
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              h2, h3 { text-align: center; }
              .print-header { text-align: center; margin-bottom: 20px; }
              .date-info { text-align: right; margin: 10px 0; }
              .stable-section { margin-top: 20px; }
              .stable-header { 
                background-color: #f5f5f5;
                padding: 10px;
                margin-bottom: 10px;
                border: 1px solid #ddd;
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
          ${Object.entries(pigsByStable)
            .map(
              ([stableName, pigs]) => `
              <div class="stable-section">
                <div class="stable-header">
                  <h3>Chuồng: ${stableName}</h3>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 35%">Mã Heo</th>
                      <th style="width: 25%">Chuồng</th>
                      <th style="width: 20%">Cân nặng (kg)</th>
                      <th style="width: 20%">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pigs
                      .map(
                        (pig) => `
                      <tr>
                        <td>${pig.pigId}</td>
                        <td>${pig.stableName}</td>
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
          ${
            weighingNote
              ? `
            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
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

  // Columns cho bảng cân heo
  const weighingColumns = [
    {
      title: "Mã Heo",
      dataIndex: "pigId",
      width: 150,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      width: 120,
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
            <Title level={3}>Lịch cân heo</Title>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<HistoryOutlined />}
                onClick={() => navigate("/weighing-history")}
              >
                Lịch sử cân
              </Button>
            </Space>
          </Col>
        </Row>

        <Calendar
          locale={locale}
          dateCellRender={dateCellRender}
          loading={loading}
        />
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
        footer={
          canCreateWeighingRecord(selectedDate)
            ? [
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
              ]
            : [
                <Button
                  key="cancel"
                  onClick={() => {
                    setIsWeighingModalVisible(false);
                    setWeighingData({});
                    setWeighingNote("");
                  }}
                >
                  Đóng
                </Button>,
              ]
        }
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
                    <Text strong>Khu:</Text>{" "}
                    <Text>{selectedPlanPigs[0]?.areaName}</Text>
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

          <Table
            columns={weighingColumns}
            dataSource={selectedPlanPigs}
            pagination={false}
            scroll={{ y: 400 }}
            size="small"
            bordered
          />
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
    </div>
  );
};

export default WeighingSchedule;
