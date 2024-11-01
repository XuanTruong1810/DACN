import { Modal, Descriptions, Tag, Typography, Space, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export const ViewDetailsModal = ({ visible, record, onClose }) => {
  if (!record) return null;

  return (
    <Modal
      title="Chi tiết yêu cầu nhập heo"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Mã yêu cầu" span={2}>
          {record.requestCode}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày yêu cầu">
          {dayjs(record.requestDate).format("DD/MM/YYYY")}
        </Descriptions.Item>

        <Descriptions.Item label="Người yêu cầu">
          {record.requestedBy}
        </Descriptions.Item>

        <Descriptions.Item label="Nhà cung cấp" span={2}>
          {record.supplier}
        </Descriptions.Item>

        <Descriptions.Item label="Loại heo">{record.pigType}</Descriptions.Item>

        <Descriptions.Item label="Giống">{record.breed}</Descriptions.Item>

        <Descriptions.Item label="Số lượng">
          {record.quantity} con
        </Descriptions.Item>

        <Descriptions.Item label="Cân nặng trung bình">
          {record.averageWeight} kg
        </Descriptions.Item>

        <Descriptions.Item label="Độ tuổi">{record.age}</Descriptions.Item>

        <Descriptions.Item label="Giới tính">{record.gender}</Descriptions.Item>

        <Descriptions.Item label="Nguồn gốc" span={2}>
          {record.origin}
        </Descriptions.Item>

        <Descriptions.Item label="Tình trạng sức khỏe" span={2}>
          {record.healthStatus}
        </Descriptions.Item>

        <Descriptions.Item label="Tình trạng tiêm vaccine" span={2}>
          {record.vaccinated ? (
            <Tag color="success">Đã tiêm vaccine</Tag>
          ) : (
            <Tag color="error">Chưa tiêm vaccine</Tag>
          )}
        </Descriptions.Item>

        {record.vaccinationDetails && (
          <Descriptions.Item label="Chi tiết tiêm vaccine" span={2}>
            {record.vaccinationDetails}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Tài liệu đính kèm" span={2}>
          <Space direction="vertical">
            {record.documents.map((doc, index) => (
              <Button
                key={index}
                icon={<FilePdfOutlined />}
                type="link"
                onClick={() => window.open(doc.url, "_blank")}
              >
                {doc.name}
              </Button>
            ))}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Ghi chú" span={2}>
          {record.notes || "Không có"}
        </Descriptions.Item>

        {record.status === "approved" && (
          <>
            <Descriptions.Item label="Ngày duyệt">
              {dayjs(record.approvedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Người duyệt">
              {record.approvedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn giá">
              {record.unitPrice?.toLocaleString()} VNĐ/con
            </Descriptions.Item>
            <Descriptions.Item label="Tiền cọc">
              {record.deposit?.toLocaleString()} VNĐ
            </Descriptions.Item>
          </>
        )}

        {record.status === "rejected" && (
          <>
            <Descriptions.Item label="Ngày từ chối">
              {dayjs(record.rejectedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Người từ chối">
              {record.rejectedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do từ chối" span={2}>
              {record.rejectReason}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Modal>
  );
};
