/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Spin,
  Empty,
  Typography,
  Space,
  message,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Text } = Typography;

const ViewDetailsModal = ({ visible, record, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [supplierDetail, setSupplierDetail] = useState(null);

  useEffect(() => {
    if (visible && record?.id) {
      fetchDetails(record.id);
    }
  }, [visible, record]);

  useEffect(() => {
    if (detailData?.suppliersId) {
      fetchSupplierDetail(detailData.suppliersId);
    }
  }, [detailData]);

  const fetchDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/PigIntakes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("response data pig intake", response.data.data);
      setDetailData(response.data.data);
    } catch (error) {
      console.error("Error fetching details:", error);
      message.error("Không thể tải thông tin chi tiết!");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetail = async (supplierId) => {
    console.log("supplierId", supplierId);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/suppliers/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("response data", response.data.data);
      setSupplierDetail(response.data.data);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      message.error("Không thể tải thông tin nhà cung cấp!");
    }
  };

  const getStatusDisplay = () => {
    if (!detailData) return null;

    if (detailData.stokeDate) {
      return <Tag color="success">Đã nhập kho</Tag>;
    }
    if (detailData.deliveryDate) {
      return <Tag color="processing">Đã giao hàng</Tag>;
    }
    if (detailData.approvedTime) {
      return <Tag color="warning">Đã duyệt</Tag>;
    }
    if (detailData.rejectedTime) {
      return <Tag color="error">Đã từ chối</Tag>;
    }
    return <Tag color="default">Chờ duyệt</Tag>;
  };

  const renderSupplierCard = () => (
    <Card title="Thông tin nhà cung cấp" style={{ marginBottom: 16 }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã nhà cung cấp">
          {detailData?.suppliersId || "Chưa chọn"}
        </Descriptions.Item>

        <Descriptions.Item label="Tên nhà cung cấp">
          {supplierDetail?.name || "Chưa chọn"}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ">
          {supplierDetail?.address || "Chưa chọn"}
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {supplierDetail?.phone || "Chưa chọn"}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {supplierDetail?.email || "Chưa chọn"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined style={{ color: "#1890ff" }} />
          <Text strong>Chi tiết phiếu nhập heo</Text>
        </Space>
      }
      open={visible}
      onCancel={() => {
        onClose();
        setSupplierDetail(null);
      }}
      width={800}
      footer={null}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : detailData ? (
        <>
          <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu" span={2}>
                <Text strong>{detailData.id}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái" span={2}>
                {getStatusDisplay()}
              </Descriptions.Item>

              <Descriptions.Item label="Người tạo">
                {detailData.createByName}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {dayjs(detailData.createdTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {renderSupplierCard()}

          <Card title="Chi tiết nhập heo" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số lượng dự kiến">
                <Text strong>{detailData.expectedQuantity}</Text> con
              </Descriptions.Item>

              {detailData.approvedTime && (
                <>
                  <Descriptions.Item label="Đơn giá">
                    <Text type="success">
                      {detailData.unitPrice?.toLocaleString("vi-VN")} VNĐ/con
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Tiền cọc">
                    <Text>
                      {detailData.deposit?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Tổng tiền dự kiến">
                    <Text type="warning">
                      {(
                        detailData.unitPrice * detailData.expectedQuantity
                      )?.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </Text>
                  </Descriptions.Item>
                </>
              )}

              {detailData.deliveryDate && (
                <>
                  <Descriptions.Item label="Số lượng nhận">
                    {detailData.receivedQuantity} con
                  </Descriptions.Item>

                  <Descriptions.Item label="Số lượng chấp nhận">
                    <Text type="success">
                      {detailData.acceptedQuantity} con
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Số lượng từ chối">
                    <Text type="danger">{detailData.rejectedQuantity} con</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Tổng tiền thực tế">
                    <Text type="success">
                      {detailData.totalPrice?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Còn lại phải trả">
                    <Text type="danger">
                      {detailData.remainingAmount?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {detailData.note && (
            <Card title="Ghi chú">
              <Text>{detailData.note}</Text>
            </Card>
          )}
        </>
      ) : (
        <Empty description="Không có dữ liệu" />
      )}
    </Modal>
  );
};

export default ViewDetailsModal;
