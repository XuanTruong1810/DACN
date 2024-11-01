import React from "react";
import { Table, Space, Button, Tag, Typography, Badge } from "antd";
import { InfoCircleOutlined, CheckOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProductsTable = ({
  loading,
  dataSource,
  selectedProducts,
  onSelect,
  onShowDetail,
}) => {
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 300,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.category}
          </Text>
          {record.isLow && <Tag color="error">Sắp hết hàng</Tag>}
        </Space>
      ),
    },
    {
      title: "Tồn kho",
      children: [
        {
          title: "Hiện tại",
          dataIndex: "currentStock",
          key: "currentStock",
          width: 120,
          render: (value, record) => (
            <Text type={record.isLow ? "danger" : "secondary"}>
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
        {
          title: "Tối thiểu",
          dataIndex: "minStock",
          key: "minStock",
          width: 120,
          render: (value, record) => (
            <Text>
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
      ],
    },
    {
      title: "Định mức/ngày",
      dataIndex: "dailyUsage",
      key: "dailyUsage",
      width: 150,
      render: (value, record) => (
        <Text>
          {value.toLocaleString()} {record.unit}/ngày
        </Text>
      ),
    },
    {
      title: "Đề xuất nhập",
      children: [
        {
          title: "Số lượng",
          dataIndex: "suggestedAmount",
          key: "suggestedAmount",
          width: 150,
          render: (value, record) => (
            <Text strong type="success">
              {value.toLocaleString()} {record.unit}
            </Text>
          ),
        },
        {
          title: "Đơn giá",
          dataIndex: "price",
          key: "price",
          width: 150,
          render: (value) => <Text>{value.toLocaleString()} đ</Text>,
        },
        {
          title: "Thành tiền",
          key: "totalPrice",
          width: 150,
          render: (_, record) => (
            <Text strong type="danger">
              {(record.price * record.suggestedAmount).toLocaleString()} đ
            </Text>
          ),
        },
      ],
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type={selectedProducts.includes(record.id) ? "default" : "primary"}
            size="small"
            icon={
              selectedProducts.includes(record.id) ? <CheckOutlined /> : null
            }
            onClick={() => onSelect(record)}
          >
            {selectedProducts.includes(record.id) ? "Đã chọn" : "Chọn"}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => onShowDetail(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      pagination={false}
      scroll={{ x: 1500 }}
      className="custom-table"
      rowClassName={(record) =>
        selectedProducts.includes(record.id) ? "selected-row" : ""
      }
    />
  );
};

export default ProductsTable;
