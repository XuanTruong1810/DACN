import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Select,
  Typography,
  Tag,
  Row,
  Col,
  InputNumber,
  Dropdown,
  Descriptions,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const MedicinePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const columns = [
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
      sorter: (a, b) => a.medicineName.localeCompare(b.medicineName),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại",
      dataIndex: "isVaccine",
      key: "isVaccine",
      render: (isVaccine) => (
        <Tag color={isVaccine ? "green" : "blue"}>
          {isVaccine ? "Vaccine" : "Thuốc"}
        </Tag>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => handleView(record),
              },
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: "delete",
                label: "Xóa",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/v1/Medicine");
      setMedicines(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu thuốc");
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axiosClient.get("/api/v1/Suppliers", {
        params: { typeSuppliers: "medicine" },
      });
      setSuppliers(response.data.data.items);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhà cung cấp");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      if (editingId) {
        await axiosClient.patch(`/api/v1/Medicine/${editingId}`, values);
        message.success("Cập nhật thành công");
      } else {
        await axiosClient.post("/api/v1/Medicine", values);
        message.success("Thêm mới thành công");
      }
      setModalVisible(false);
      fetchMedicines();
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thuốc này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axiosClient.delete(`/api/v1/Medicine/${id}`);
          message.success("Xóa thành công");
          fetchMedicines();
        } catch (error) {
          message.error("Lỗi khi xóa thuốc");
        }
      },
    });
  };

  const handleView = async (record) => {
    try {
      const response = await axiosClient.get(`/api/v1/Medicine/${record.id}`);
      Modal.info({
        title: "Chi tiết thuốc",
        width: 800,
        content: (
          <Descriptions column={2}>
            <Descriptions.Item label="Tên thuốc">
              {response.data.data.medicineName}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              {response.data.data.isVaccine ? "Vaccine" : "Thuốc"}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              {response.data.data.unit}
            </Descriptions.Item>
            <Descriptions.Item label="Cách dùng">
              {response.data.data.usage}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng tồn kho">
              {response.data.data.quantityInStock}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {response.data.data.description}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {response.data.data.isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
            </Descriptions.Item>
            {response.data.data.isVaccine && (
              <Descriptions.Item label="Số ngày chích sau nhập chuồng">
                {response.data.data.daysAfterImport}
              </Descriptions.Item>
            )}
          </Descriptions>
        ),
      });
    } catch (error) {
      message.error("Lỗi khi tải thông tin thuốc");
    }
  };

  const MedicineForm = ({ form, editingMedicine }) => {
    const [isVaccine, setIsVaccine] = useState(form.getFieldValue("isVaccine"));

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="medicine-form"
      >
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medicineName"
                label="Tên thuốc"
                rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
              >
                <Input placeholder="Nhập tên thuốc..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isVaccine"
                label="Phân loại"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(value) => {
                    setIsVaccine(value);
                    form.setFieldValue("unit", value ? "Lọ" : "Viên");
                  }}
                  placeholder="Chọn loại..."
                >
                  <Option value={false}>Thuốc</Option>
                  <Option value={true}>Vaccine</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị tính">
                <Input disabled />
              </Form.Item>
            </Col>
            {isVaccine && (
              <Col span={8}>
                <Form.Item
                  name="daysAfterImport"
                  label="Số ngày chích sau nhập chuồng"
                  tooltip="Số ngày sau khi nhập chuồng sẽ tiến hành tiêm vaccine"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Nhập số ngày..."
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={isVaccine ? 8 : 16}>
              <Form.Item
                name="usage"
                label="Cách dùng"
                rules={[{ required: true, message: "Vui lòng nhập cách dùng" }]}
              >
                <Input.TextArea
                  rows={1}
                  placeholder="Nhập hướng dẫn sử dụng..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin chi tiết */}
        <Card title="Thông tin chi tiết" className="mb-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về thuốc..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="isActive" label="Trạng thái" initialValue={true}>
                <Select>
                  <Option value={true}>
                    <Badge status="success" text="Đang sử dụng" />
                  </Option>
                  <Option value={false}>
                    <Badge status="error" text="Ngừng sử dụng" />
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Danh sách nhà cung cấp */}
        <Card title="Nhà cung cấp" className="mb-4">
          <Form.List name="medicineSuppliers">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Row
                    key={field.key}
                    gutter={16}
                    align="middle"
                    className="mb-2"
                  >
                    <Col span={22}>
                      <Form.Item
                        {...field}
                        name={[field.name, "supplierId"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn nhà cung cấp",
                          },
                        ]}
                      >
                        <Select placeholder="Chọn nhà cung cấp...">
                          {suppliers.map((supplier) => (
                            <Option
                              key={supplier.id}
                              value={supplier.id}
                              disabled={form
                                .getFieldValue("medicineSuppliers")
                                ?.some(
                                  (item, i) =>
                                    i !== index &&
                                    item?.supplierId === supplier.id
                                )}
                            >
                              {supplier.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "center" }}>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    disabled={fields.length >= suppliers.length}
                  >
                    Thêm nhà cung cấp
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Nút submit */}
        <Form.Item className="text-right">
          <Space>
            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingMedicine ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={3}>Quản lý thuốc</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Thêm thuốc mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={medicines}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} mục`,
          }}
        />

        <Modal
          title={editingId ? "Sửa thuốc" : "Thêm thuốc mới"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
          }}
          footer={null}
          width={800}
        >
          <MedicineForm form={form} editingMedicine={editingId} />
        </Modal>
      </Space>
    </Card>
  );
};

export default MedicinePage;
