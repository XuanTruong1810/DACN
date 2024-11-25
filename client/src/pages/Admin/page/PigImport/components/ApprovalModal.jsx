import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Space,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  Alert,
  Descriptions,
  Statistic,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const styles = {
  card: {
    borderRadius: "8px",
    marginBottom: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  summary: {
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    marginTop: "16px",
  },
  statistic: {
    marginBottom: "0",
  },
};

export const ApprovalModal = {
  show({ record, suppliers, onSuccess }) {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(true);

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        onSuccess(values);
        setVisible(false);
      } catch (error) {
        // Form validation failed
      }
    };

    Modal.confirm({
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Duyệt yêu cầu nhập heo</Text>
        </Space>
      ),
      width: 800,
      content: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            supplier: record.supplier,
            quantity: record.quantity,
            unitPrice: 0,
            deposit: 0,
            expectedReceiveDate: dayjs(record.expectedDate),
          }}
        >
          {/* Thông tin yêu cầu */}
          <Card
            size="small"
            title={
              <Space>
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
                <Text strong>Thông tin yêu cầu</Text>
              </Space>
            }
            style={styles.card}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã yêu cầu" span={1}>
                <Text strong>{record.requestCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu" span={1}>
                <Text>{dayjs(record.requestDate).format("DD/MM/YYYY")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại heo" span={1}>
                <Text>{record.pigType}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng" span={1}>
                <Text strong>{record.quantity} con</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Form nhập thông tin */}
          <Card
            size="small"
            title={
              <Space>
                <FileTextOutlined style={{ color: "#722ed1" }} />
                <Text strong>Thông tin nhập heo</Text>
              </Space>
            }
            style={styles.card}
          >
            <Form.Item
              name="supplier"
              label="Nhà cung cấp"
              rules={[
                { required: true, message: "Vui lòng chọn nhà cung cấp" },
              ]}
            >
              <Select>
                {suppliers.map((supplier) => (
                  <Option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="Đơn giá (VNĐ/con)"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="deposit"
              label="Tiền cọc (VNĐ)"
              rules={[{ required: true, message: "Vui lòng nhập tiền cọc" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="expectedReceiveDate"
              label="Ngày nhận dự kiến"
              rules={[{ required: true, message: "Vui lòng chọn ngày nhận" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <TextArea rows={4} />
            </Form.Item>
          </Card>

          {/* Tóm tắt thông tin */}
          <Card
            size="small"
            title={
              <Space>
                <DollarOutlined style={{ color: "#f5222d" }} />
                <Text strong>Tóm tắt thông tin</Text>
              </Space>
            }
            style={styles.card}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="unitPrice"
                  label="Đơn giá"
                  rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deposit"
                  label="Tiền cọc"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiền cọc" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div style={{ background: "#f5f5f5", padding: 15, borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Số lượng:</Text>
                <Text strong>{record.quantity} con</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Đơn giá:</Text>
                <Text strong>
                  {Form.useWatch("unitPrice", form)?.toLocaleString() || 0}{" "}
                  VNĐ/con
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Tổng tiền:</Text>
                <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                  {(
                    (Form.useWatch("unitPrice", form) || 0) * record.quantity
                  ).toLocaleString()}{" "}
                  VNĐ
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Tiền cọc:</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {Form.useWatch("deposit", form)?.toLocaleString() || 0} VNĐ
                </Text>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Còn lại:</Text>
                <Text strong style={{ color: "#f5222d" }}>
                  {(
                    (Form.useWatch("unitPrice", form) || 0) * record.quantity -
                    (Form.useWatch("deposit", form) || 0)
                  ).toLocaleString()}{" "}
                  VNĐ
                </Text>
              </div>
            </Space>
          </div>
        </Form>
      ),
      onOk: handleOk,
      onCancel: () => setVisible(false),
      okText: "Xác nhận duyệt",
      cancelText: "Hủy",
      maskClosable: false,
      visible,
    });
  },
};
