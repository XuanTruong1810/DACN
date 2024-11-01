import React from "react";
import {
  Card,
  Space,
  Button,
  Typography,
  Divider,
  Empty,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  CloseOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const BillCard = ({
  selectedProducts,
  suggestedProducts,
  onClose,
  onProductRemove,
  onConfirm,
}) => {
  const selectedItems = suggestedProducts.filter((p) =>
    selectedProducts.includes(p.id)
  );

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.suggestedAmount,
    0
  );

  return (
    <Card
      className="bill-card"
      bordered={false}
      title={
        <div className="bill-header">
          <Space>
            <CheckCircleOutlined className="bill-icon" />
            <span>
              <Text strong style={{ fontSize: "16px" }}>
                Phiếu nhập kho
              </Text>
              <Text
                type="secondary"
                style={{ display: "block", fontSize: "12px" }}
              >
                {new Date().toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </span>
          </Space>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      }
      bodyStyle={{ padding: "16px" }}
    >
      <div className="bill-content">
        {selectedItems.length > 0 ? (
          <>
            <div className="bill-info">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Khu vực</Text>
                  <Text strong style={{ display: "block" }}>
                    {
                      areas.find((a) => a.id === form.getFieldValue("area"))
                        ?.name
                    }
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Số ngày dự trù</Text>
                  <Text strong style={{ display: "block" }}>
                    {form.getFieldValue("days")} ngày
                  </Text>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <div className="bill-items">
              {suggestedProducts
                .filter((p) => selectedProducts.includes(p.id))
                .map((product) => (
                  <div key={product.id} className="bill-item">
                    <div className="bill-item-header">
                      <Space direction="vertical" size={0}>
                        <Text strong>{product.name}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {product.category}
                        </Text>
                      </Space>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleProductSelect(product)}
                      />
                    </div>
                    <div className="bill-item-details">
                      <div className="bill-item-quantity">
                        <Text type="secondary">Số lượng:</Text>
                        <Text strong>
                          {" "}
                          {product.suggestedAmount.toLocaleString()}{" "}
                          {product.unit}
                        </Text>
                      </div>
                      <div className="bill-item-price">
                        <Text type="secondary">Đơn giá:</Text>
                        <Text strong> {product.price.toLocaleString()}đ</Text>
                      </div>
                      <div className="bill-item-total">
                        <Text type="secondary">Thành tiền:</Text>
                        <Text strong type="danger">
                          {(
                            product.price * product.suggestedAmount
                          ).toLocaleString()}
                          đ
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="bill-summary">
              <div className="bill-total">
                <div className="total-info">
                  <Text>Tổng số lượng:</Text>
                  <Text strong>
                    {suggestedProducts
                      .filter((p) => selectedProducts.includes(p.id))
                      .reduce((sum, item) => sum + item.suggestedAmount, 0)
                      .toLocaleString()}{" "}
                    sản phẩm
                  </Text>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div className="total-amount">
                  <Text strong style={{ fontSize: "16px" }}>
                    Tổng tiền:
                  </Text>
                  <Title level={3} type="danger" style={{ margin: 0 }}>
                    {suggestedProducts
                      .filter((p) => selectedProducts.includes(p.id))
                      .reduce(
                        (sum, item) => sum + item.price * item.suggestedAmount,
                        0
                      )
                      .toLocaleString()}
                    đ
                  </Title>
                </div>
              </div>

              <div className="bill-actions">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={handleConfirmImport}
                >
                  Xác nhận nhập kho
                </Button>
                <Button block size="large" icon={<PrinterOutlined />}>
                  In phiếu nhập
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Empty
            description="Chưa có sản phẩm nào được chọn"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Card>
  );
};

export default BillCard;
