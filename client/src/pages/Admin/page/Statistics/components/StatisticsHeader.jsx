import React from "react";
import {
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Space,
  Button,
  Tag,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StatisticsHeader = ({ title, icon: Icon, description }) => {
  return (
    <div className="stats-header">
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <div className="header-content">
            <Title level={2} className="page-title">
              <Icon className="title-icon" /> {title}
            </Title>
            <div className="header-description">
              <Text className="description-text">{description}</Text>
              <Tag color="blue" className="time-tag">
                Cập nhật: {new Date().toLocaleDateString("vi-VN")}
              </Tag>
            </div>
          </div>
        </Col>
        <Col>
          <Space size="middle" className="header-actions">
            <Select
              defaultValue="month"
              style={{ width: 140 }}
              className="time-select"
              options={[
                { value: "week", label: "Tuần này" },
                { value: "month", label: "Tháng này" },
                { value: "quarter", label: "Quý này" },
                { value: "year", label: "Năm nay" },
              ]}
            />
            <RangePicker style={{ width: 280 }} className="date-picker" />
            <Button type="primary" icon={<DownloadOutlined />}>
              Xuất báo cáo
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsHeader;
