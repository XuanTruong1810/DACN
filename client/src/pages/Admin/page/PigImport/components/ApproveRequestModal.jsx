/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Alert,
  Statistic,
  Divider,
  DatePicker,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  NumberOutlined,
  BankOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;

const ApproveRequestModal = ({
  visible,
  record,
  suppliers,
  onOk,
  onCancel,
}) => {
  console.log(suppliers);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Watch form values for calculations
  const unitPrice = Form.useWatch("unitPrice", form) || 0;
  const deposit = Form.useWatch("deposit", form) || 0;
  const totalAmount = unitPrice * record?.quantity;

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        requestCode: record.requestCode,
        supplier: record.supplier,
        quantity: record.quantity,
        email: record.email,
      });
    }
  }, [visible, record, form]);

  return (
    <Modal
      title={
        <Space align="center">
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Duyệt yêu cầu nhập heo
            </Title>
            <Text type="secondary">Mã yêu cầu: {record?.requestCode}</Text>
          </div>
        </Space>
      }
      open={visible}
      onOk={form.submit}
      onCancel={onCancel}
      width={1000}
      confirmLoading={loading}
      okText="Xác nhận duyệt"
      cancelText="Hủy"
      className="approve-request-modal"
      centered
      okButtonProps={{
        style: {
          backgroundColor: "#52c41a",
          borderColor: "#52c41a",
          padding: "0 32px",
          height: "36px",
          borderRadius: "6px",
        },
      }}
      cancelButtonProps={{
        style: {
          padding: "0 32px",
          height: "36px",
          borderRadius: "6px",
        },
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <CancelBtn />
          <OkBtn />
        </div>
      )}
    >
      <div className="modal-content">
        {/* Thông tin yêu cầu */}
        <Card className="info-section">
          <Row gutter={[24, 24]}>
            <Col span={6}>
              <Statistic
                title={
                  <>
                    <CalendarOutlined /> Ngày yêu cầu
                  </>
                }
                value={dayjs(record?.requestDate).format("DD/MM/YYYY")}
                className="custom-statistic"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={
                  <>
                    <NumberOutlined /> Số lượng
                  </>
                }
                value={record?.quantity}
                suffix="con"
                className="custom-statistic"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={
                  <>
                    <UserOutlined /> Người yêu cầu
                  </>
                }
                value={record?.requester || "N/A"}
                className="custom-statistic"
              />
            </Col>
          </Row>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setLoading(true);
              const expectedReceiveDate = values.expectedReceiveDate
                ? values.expectedReceiveDate.hour(0).minute(0).second(0)
                : null;

              await onOk({
                ...values,
                expectedReceiveDate: expectedReceiveDate?.format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
              });
              form.resetFields();
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* Thông tin nhà cung cấp */}
          <Card
            title={
              <Space>
                <ShopOutlined />
                <Text strong>Thông tin nhà cung cấp</Text>
              </Space>
            }
            className="supplier-section"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="supplierId"
                  label="Chọn nhà cung cấp"
                  rules={[
                    { required: true, message: "Vui lòng chọn nhà cung cấp" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn nhà cung cấp"
                    optionFilterProp="children"
                    className="supplier-select"
                    options={suppliers}
                    onSelect={(value) => {
                      const supplier = suppliers.find((s) => s.value === value);
                      form.setFieldsValue({
                        supplierAddress: supplier?.address,
                        supplierPhone: supplier?.phone,
                        supplierEmail: supplier?.email,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supplierEmail"
                  label={
                    <>
                      <UserOutlined /> Email
                    </>
                  }
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="supplierAddress"
                  label={
                    <>
                      <EnvironmentOutlined /> Địa chỉ
                    </>
                  }
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="supplierPhone"
                  label={
                    <>
                      <PhoneOutlined /> Số điện thoại
                    </>
                  }
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Thêm trường ngày dự kiến giao trước phần thanh toán */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <Text strong>Thông tin giao hàng</Text>
              </Space>
            }
            className="delivery-section"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expectedReceiveDate"
                  label="Ngày dự kiến nhận"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày dự kiến nhận",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.isBefore(dayjs(), "day")) {
                          return Promise.reject(
                            "Ngày dự kiến nhận không được nhỏ hơn ngày hiện tại"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày dự kiến nhận"
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Thông tin thanh toán */}
          <Card
            title={
              <Space>
                <DollarOutlined />
                <Text strong>Thông tin thanh toán</Text>
              </Space>
            }
            className="payment-section"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="unitPrice"
                  label="Đơn giá (VNĐ/con)"
                  rules={[
                    { required: true, message: "Vui lòng nhập đơn giá" },
                    {
                      type: "number",
                      min: 1000,
                      message: "Đơn giá phải lớn hơn hoặc bằng 1,000 VNĐ",
                    },
                  ]}
                  tooltip="Đơn giá cho mỗi con heo"
                >
                  <InputNumber
                    className="price-input"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    placeholder="Nhập đơn giá"
                    min={1000}
                    step={1000}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deposit"
                  label="Tiền cọc (VNĐ)"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiền cọc" },
                    {
                      type: "number",
                      min: 0,
                      message: "Tiền cọc không được âm",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value > totalAmount) {
                          return Promise.reject(
                            "Tiền cọc không được lớn hơn tổng tiền"
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    className="price-input"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    placeholder="Nhập tiền cọc"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16} className="payment-summary">
              <Col span={8}>
                <Statistic
                  title="Tổng tiền"
                  value={totalAmount}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tiền cọc"
                  value={deposit}
                  precision={0}
                  prefix={<BankOutlined />}
                  suffix="VNĐ"
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Còn lại"
                  value={totalAmount - deposit}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Ghi chú */}
          <Form.Item name="note" label="Ghi chú">
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú nếu có..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Alert
            message="Lưu ý quan trọng"
            description="Vui lòng kiểm tra kỹ thông tin trước khi duyệt. Hành động này không thể hoàn tác sau khi xác nhận."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            className="warning-alert"
          />
        </Form>
      </div>
    </Modal>
  );
};

// Add styles
const style = document.createElement("style");
style.textContent = `
  .approve-request-modal .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .approve-request-modal .modal-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding-right: 8px;
  }

  .approve-request-modal .ant-card {
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .approve-request-modal .info-section {
    background: #fafafa;
    border: none;
  }

  .approve-request-modal .custom-statistic .ant-statistic-title {
    font-size: 14px;
    color: rgba(0,0,0,0.45);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .approve-request-modal .supplier-select {
    width: 100%;
  }

  .approve-request-modal .price-input {
    width: 100%;
  }

  .approve-request-modal .payment-summary {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
  }

  .approve-request-modal .warning-alert {
    margin-top: 16px;
    border-radius: 8px;
  }

  .approve-request-modal .ant-form-item-label {
    padding-bottom: 4px;
  }

  .approve-request-modal ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .approve-request-modal ::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
  }

  .approve-request-modal ::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }
`;
document.head.appendChild(style);

export default ApproveRequestModal;
