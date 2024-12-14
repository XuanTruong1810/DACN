/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Statistic,
  Modal,
  Divider,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const DailyFoodHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFeedManager = location.pathname.includes("/feed-manager/");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/FoodExport`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);

      // Sắp xếp theo ngày mới nhất
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.exportDate) - new Date(a.exportDate)
      );

      setData(sortedData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thống kê
  const statistics = {
    totalExports: data.length,
    totalQuantity: data.reduce(
      (sum, record) => sum + record.details.reduce((s, d) => s + d.quantity, 0),
      0
    ),
    uniqueDates: [
      ...new Set(
        data.map((record) => dayjs(record.exportDate).format("DD/MM/YYYY"))
      ),
    ].length,
  };

  // Nhóm theo ngày
  const groupedByDate = data.reduce((groups, record) => {
    const date = dayjs(record.exportDate).format("DD/MM/YYYY");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  const columns = [
    {
      title: "Ngày xuất",
      dataIndex: "exportDate",
      key: "exportDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(b.exportDate) - new Date(a.exportDate),
      defaultSortOrder: "descend",
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      filterSearch: true,
      filters: [...new Set(data.map((item) => item.areaName))].map((area) => ({
        text: area,
        value: area,
      })),
      onFilter: (value, record) => record.areaName === value,
    },
    {
      title: "Người xuất",
      dataIndex: "exportByName",
      key: "exportByName",
    },
    {
      title: "Số loại thức ăn",
      dataIndex: "details",
      key: "foodCount",
      render: (details) => details?.length || 0,
      sorter: (a, b) => (a.details?.length || 0) - (b.details?.length || 0),
    },
    {
      title: "Tổng khối lượng (kg)",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (quantity) => quantity?.toFixed(1) || 0,
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
    },
  ];

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const renderDetailModal = () => (
    <Modal
      title={
        <span style={{ color: "#1890ff" }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Chi tiết phiếu xuất -{" "}
          {dayjs(selectedRecord?.exportDate).format("DD/MM/YYYY")}
        </span>
      }
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" style={{ backgroundColor: "#f0f5ff" }}>
              <Text strong style={{ color: "#1890ff" }}>
                Khu vực:{" "}
              </Text>
              <Text>{selectedRecord?.areaName}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
              <Text strong style={{ color: "#52c41a" }}>
                Người xuất:{" "}
              </Text>
              <Text>{selectedRecord?.exportByName}</Text>
            </Card>
          </Col>
        </Row>
        {selectedRecord?.note && (
          <Card
            size="small"
            style={{ marginTop: 16, backgroundColor: "#fff7e6" }}
          >
            <Text strong style={{ color: "#fa8c16" }}>
              Ghi chú:{" "}
            </Text>
            <Text>{selectedRecord.note}</Text>
          </Card>
        )}
      </div>

      <Table
        dataSource={selectedRecord?.details}
        pagination={false}
        columns={[
          {
            title: "Tên thức ăn",
            dataIndex: "foodName",
            key: "foodName",
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity) => (
              <Text style={{ color: "#1890ff" }}>{quantity.toFixed(1)} kg</Text>
            ),
          },
        ]}
        summary={(pageData) => (
          <Table.Summary.Row style={{ backgroundColor: "#f0f5ff" }}>
            <Table.Summary.Cell>
              <strong>Tổng cộng</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <strong style={{ color: "#1890ff" }}>
                {pageData
                  .reduce((sum, item) => sum + item.quantity, 0)
                  .toFixed(1)}{" "}
                kg
              </strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ color: "#1890ff" }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Lịch Sử Xuất Thức Ăn
          </Title>
        </Col>
        {isFeedManager && (
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate("/feed-manager/exports/daily-food-export")
              }
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Tạo phiếu xuất
            </Button>
          </Col>
        )}
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card
            hoverable
            style={{ backgroundColor: "#e6f7ff", borderColor: "#91d5ff" }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#0050b3" }}>
                  Tổng số phiếu xuất
                </Text>
              }
              value={statistics.totalExports}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#389e0d" }}>
                  Tổng khối lượng đã xuất
                </Text>
              }
              value={statistics.totalQuantity.toFixed(1)}
              suffix="kg"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#d46b08" }}>
                  Số ngày có xuất
                </Text>
              }
              value={statistics.uniqueDates}
              suffix="ngày"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {Object.entries(groupedByDate).map(([date, records]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <Divider orientation="left">
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <Text strong style={{ marginLeft: 8, color: "#1890ff" }}>
                {date} - {records.length} phiếu xuất
              </Text>
            </Divider>
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: {
                  cursor: "pointer",
                  transition: "all 0.3s",
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = "";
                },
              })}
            />
          </div>
        ))}
      </Card>

      {selectedRecord && renderDetailModal()}
    </div>
  );
};

export default DailyFoodHistory;
