import React, { useState, useEffect } from "react";
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
} from "antd";
import { PlusOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import locale from "antd/es/calendar/locale/vi_VN";

const { Title } = Typography;

const WeighingSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [weighingPlans, setWeighingPlans] = useState([]);

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
      setWeighingPlans(response.data.data);
    } catch (error) {
      console.log(error);
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
    if (plan) {
      navigate(
        `/weighing-form?date=${date.format("YYYY-MM-DD")}&areaName=${
          plan.areaName
        }`,
        {
          state: {
            weighingDetails: plan.weighingDetails,
            pigIds: plan.pigIds,
          },
        }
      );
    }
  };

  // Xử lý khi chọn ngày trên calendar
  const handleSelect = (date) => {
    const selectedDate = dayjs(date).format("YYYY-MM-DD");
    const plans = weighingPlans.filter(
      (plan) => dayjs(plan.weighingDate).format("YYYY-MM-DD") === selectedDate
    );

    if (plans.length > 0) {
      navigate(
        `/weighing-form?date=${selectedDate}&areaName=${plans[0].areaName}`,
        {
          state: {
            weighingDetails: plans[0].weighingDetails,
            pigIds: plans[0].pigIds,
          },
        }
      );
    }
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
                icon={<HistoryOutlined />}
                onClick={() => navigate("/weighing-history")}
              >
                Lịch sử cân
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/weighing-plan/create")}
              >
                Tạo kế hoạch cân
              </Button>
            </Space>
          </Col>
        </Row>

        <Calendar
          locale={locale}
          dateCellRender={dateCellRender}
          onSelect={handleSelect}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default WeighingSchedule;
