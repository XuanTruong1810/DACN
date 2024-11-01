import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Typography,
  Row,
  Col,
  message,
  Table,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const CreateExport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPigs, setSelectedPigs] = useState([]);

  // Fake data cho danh sách heo
  const pigsList = [
    {
      id: "P001",
      earTag: "ET001",
      house: "Chuồng A1",
      weight: 100,
      age: 150,
      breed: "Duroc",
    },
    {
      id: "P002",
      earTag: "ET002",
      house: "Chuồng A1",
      weight: 98,
      age: 148,
      breed: "Landrace",
    },
    {
      id: "P003",
      earTag: "ET003",
      house: "Chuồng A2",
      weight: 102,
      age: 152,
      breed: "Yorkshire",
    },
    // ... thêm dữ liệu mẫu
  ];

  // Fake data cho khách hàng
  const customers = [
    { id: 1, name: "Công ty A", address: "Địa chỉ A", phone: "0123456789" },
    { id: 2, name: "Công ty B", address: "Địa chỉ B", phone: "0987654321" },
    // ... thêm dữ liệu mẫu
  ];

  const columns = [
    {
      title: "Mã thẻ tai",
      dataIndex: "earTag",
      key: "earTag",
    },
    {
      title: "Chuồng",
      dataIndex: "house",
      key: "house",
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Tuổi (ngày)",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Giống",
      dataIndex: "breed",
      key: "breed",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePig(record.id)}
        />
      ),
    },
  ];

  const handleAddPig = (pigId) => {
    const pig = pigsList.find((p) => p.id === pigId);
    if (pig && !selectedPigs.find((p) => p.id === pigId)) {
      setSelectedPigs([...selectedPigs, pig]);
    }
  };

  const handleRemovePig = (pigId) => {
    setSelectedPigs(selectedPigs.filter((pig) => pig.id !== pigId));
  };

  const handleSubmit = async (values) => {
    if (selectedPigs.length === 0) {
      message.error("Vui lòng chọn ít nhất một heo để xuất chuồng");
      return;
    }

    setLoading(true);
    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log({
        ...values,
        pigs: selectedPigs,
        totalPigs: selectedPigs.length,
        totalWeight: selectedPigs.reduce((sum, pig) => sum + pig.weight, 0),
      });

      message.success("Tạo phiếu xuất chuồng thành công");
      form.resetFields();
      setSelectedPigs([]);
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi tạo phiếu xuất chuồng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>Tạo phiếu xuất chuồng</Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="exportDate"
                label="Ngày xuất chuồng"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày xuất chuồng" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn khách hàng"
                  optionFilterProp="children"
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="pricePerKg"
                label="Giá bán (VNĐ/kg)"
                rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Title level={4}>Danh sách heo xuất chuồng</Title>

          <Form.Item style={{ marginBottom: 16 }}>
            <Select
              showSearch
              placeholder="Chọn heo để thêm vào danh sách"
              style={{ width: 300 }}
              onChange={handleAddPig}
              value={undefined}
            >
              {pigsList
                .filter((pig) => !selectedPigs.find((p) => p.id === pig.id))
                .map((pig) => (
                  <Option key={pig.id} value={pig.id}>
                    {`${pig.earTag} - ${pig.house} - ${pig.weight}kg`}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Table
            columns={columns}
            dataSource={selectedPigs}
            rowKey="id"
            pagination={false}
            summary={(pageData) => {
              const totalWeight = pageData.reduce(
                (sum, pig) => sum + pig.weight,
                0
              );
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Tổng cộng
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {totalWeight} kg
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3}>
                    {pageData.length} con
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo phiếu xuất chuồng
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setSelectedPigs([]);
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateExport;
