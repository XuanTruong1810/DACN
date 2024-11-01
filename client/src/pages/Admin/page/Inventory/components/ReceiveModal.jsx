import React from "react";
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Card,
  Descriptions,
  Statistic,
  Button,
  Space,
  message,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const ReceiveModal = ({
  visible,
  onCancel,
  selectedBill,
  form,
  loading,
  onFinish,
}) => {
  if (!selectedBill) return null;

  const calculateItemTotal = (quantity, price) => {
    return (quantity || 0) * (price || 0);
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => {
      const receivedQty =
        form.getFieldValue([
          "items",
          items.indexOf(item),
          "receivedQuantity",
        ]) || 0;
      return sum + calculateItemTotal(receivedQty, item.price);
    }, 0);
  };

  const calculateRemainingPayment = () => {
    const total = calculateTotalAmount(selectedBill.items);
    return total - selectedBill.deposit;
  };

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Xác nhận nhận hàng - Phiếu {selectedBill.id}</span>
        </Space>
      }
      open={visible}
      width={1000}
      className="receive-modal"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            Modal.confirm({
              title: "Xác nhận nhận hàng",
              content: "Bạn có chắc chắn muốn xác nhận nhận hàng không?",
              okText: "Xác nhận",
              cancelText: "Hủy",
              onOk: () => form.submit(),
            });
          }}
          loading={loading}
          className="confirm-receive-button"
        >
          Xác nhận nhận hàng
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card className="supplier-info">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Nhà cung cấp">
              {selectedBill.supplier.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mã NCC">
              {selectedBill.supplier.code}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedBill.supplier.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedBill.supplier.email}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Form.Item
          name="receiveDate"
          label="Ngày nhận hàng"
          rules={[{ required: true, message: "Vui lòng chọn ngày nhận hàng" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            showTime={false}
          />
        </Form.Item>

        <Form.List name="items">
          {() => (
            <>
              {selectedBill.items.map((item, index) => (
                <Card
                  key={item.id}
                  className="product-receive-card"
                  title={
                    <Space>
                      <ShoppingCartOutlined />
                      <span>{item.name}</span>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Số lượng đặt">
                        <InputNumber
                          disabled
                          style={{ width: "100%" }}
                          value={item.quantity}
                          formatter={(value) => `${value} ${item.unit}`}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["items", index, "receivedQuantity"]}
                        label="Số lượng nhận"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng nhận",
                          },
                          {
                            validator: (_, value) => {
                              if (value > item.quantity) {
                                return Promise.reject(
                                  "Số lượng nhận không được vượt quá số lượng đặt"
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={item.quantity}
                          formatter={(value) => `${value} ${item.unit}`}
                          parser={(value) => value.replace(` ${item.unit}`, "")}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Thành tiền">
                        <InputNumber
                          disabled
                          style={{ width: "100%" }}
                          value={calculateItemTotal(
                            form.getFieldValue([
                              "items",
                              index,
                              "receivedQuantity",
                            ]),
                            item.price
                          )}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          addonAfter="đ"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Card className="summary-card">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Tổng tiền hàng"
                      value={calculateTotalAmount(selectedBill.items)}
                      precision={0}
                      suffix="đ"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Tiền cọc"
                      value={selectedBill.deposit}
                      precision={0}
                      suffix="đ"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Còn phải trả"
                      value={calculateRemainingPayment()}
                      precision={0}
                      suffix="đ"
                      className="remaining-payment"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ReceiveModal;
