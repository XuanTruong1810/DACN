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
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
      title: "Duyệt yêu cầu nhập heo",
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
          <Descriptions
            bordered
            size="small"
            column={2}
            style={{ marginBottom: 20 }}
          >
            <Descriptions.Item label="Mã yêu cầu">
              {record.requestCode}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {dayjs(record.requestDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Loại heo">
              {record.pigType}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {record.quantity} con
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
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
