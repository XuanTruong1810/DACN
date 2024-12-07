/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
  DatabaseOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styled from "styled-components";

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

const StyledWrapper = styled.div`
  .form-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: #374151;
  }

  .ant-input,
  .ant-select-selector,
  .ant-input-number {
    border-radius: 8px;
  }

  .ant-input:hover,
  .ant-select-selector:hover,
  .ant-input-number:hover {
    border-color: #4096ff;
  }

  .ant-input-disabled,
  .ant-input-number-disabled {
    background-color: #f3f4f6;
    border-color: #e5e7eb;
    color: #6b7280;
  }

  .supplier-list-item {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .ant-btn {
    height: 40px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;
  }
`;

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
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm kiếm tên thuốc"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Xóa
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.medicineName
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "isVaccine",
      key: "isVaccine",
      filters: [
        { text: "Thuốc", value: false },
        { text: "Vaccine", value: true },
      ],
      onFilter: (value, record) => record.isVaccine === value,
      render: (isVaccine) => (
        <Tag color={isVaccine ? "green" : "blue"}>
          {isVaccine ? "Vaccine" : "Thuốc"}
        </Tag>
      ),
    },
    {
      title: "Số lượng tồn",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      render: (quantity) => (
        <Tag color={quantity > 0 ? "green" : "red"}>{quantity || 0}</Tag>
      ),
      sorter: (a, b) => (a.quantityInStock || 0) - (b.quantityInStock || 0),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      filters: [
        { text: "Viên", value: "Viên" },
        { text: "Lọ", value: "Lọ" },
      ],
      onFilter: (value, record) => record.unit === value,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
      console.log(response.data.data);
      setMedicines(response.data.data);
    } catch (error) {
      console.log("error", error);
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
      console.log("error", error);
      message.error("Lỗi khi tải danh sách nhà cung cấp");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        medicineName: values.medicineName,
        description: values.description,
        usage: values.usage,
        isVaccine: values.isVaccine,
        daysAfterImport: values.isVaccine ? values.daysAfterImport : 0,
        isActive: values.isActive,

        medicineSuppliers:
          values.medicineSuppliers?.map((supplier) => supplier.supplierId) ||
          [],
      };

      console.log("Submit Data:", submitData); // For debugging

      if (editingId) {
        await axiosClient.patch(`/api/v1/Medicine/${editingId}`, submitData);
        message.success("Cập nhật thuốc thành công");
      } else {
        await axiosClient.post("/api/v1/Medicine", submitData);
        message.success("Thêm thuốc mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchMedicines();
    } catch (error) {
      console.error("Submit error:", error);
      console.log("Error response:", error.response?.data);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin thuốc"
      );
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
          console.log("error", error);
          message.error("Lỗi khi xóa thuốc");
        }
      },
    });
  };

  const handleView = async (record) => {
    try {
      const response = await axiosClient.get(`/api/v1/Medicine/${record.id}`);
      const medicine = response.data.data;
      console.log("medicine", medicine);

      Modal.info({
        title: "Chi tiết thuốc",
        width: 800,
        content: (
          <div style={{ maxHeight: "70vh", overflow: "auto" }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên thuốc" span={2}>
                <strong>{medicine.medicineName}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Loại">
                <Tag color={medicine.isVaccine ? "green" : "blue"}>
                  {medicine.isVaccine ? "Vaccine" : "Thuốc"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={medicine.isActive ? "success" : "error"}
                  text={medicine.isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Đơn vị tính">
                {medicine.unit}
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng tồn kho">
                {medicine.quantityInStock || 0}
              </Descriptions.Item>

              {medicine.isVaccine && (
                <Descriptions.Item
                  label="Số ngày chích sau nhập chuồng"
                  span={2}
                >
                  {medicine.daysAfterImport} ngày
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Cách dùng" span={2}>
                {medicine.usage}
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả" span={2}>
                {medicine.description}
              </Descriptions.Item>

              <Descriptions.Item label="Nhà cung cấp" span={2}>
                {medicine.suppliers?.length > 0 ? (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {medicine.suppliers.map((supplier) => (
                      <Tag key={supplier.id} color="processing">
                        {suppliers.find((s) => s.id === supplier.id)?.name ||
                          supplier.name}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "#999" }}>Chưa có nhà cung cấp</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ),
        okText: "Đóng",
        className: "medicine-detail-modal",
      });
    } catch (error) {
      console.log("error", error);
      message.error("Lỗi khi tải thông tin thuốc");
    }
  };

  const handleEdit = async (record) => {
    try {
      setEditingId(record.id);
      const response = await axiosClient.get(`/api/v1/Medicine/${record.id}`);
      const medicineData = response.data.data;

      // Transform data before setting to form
      const formData = {
        medicineName: medicineData.medicineName,
        isVaccine: medicineData.isVaccine,
        unit: medicineData.unit,
        daysAfterImport: medicineData.daysAfterImport,
        usage: medicineData.usage,
        description: medicineData.description,
        isActive: medicineData.isActive,
        // Transform suppliers data correctly
        medicineSuppliers:
          medicineData.suppliers?.map((supplier) => ({
            supplierId: supplier.id, // Handle both possible data structures
            supplierName: supplier.name,
          })) || [],
      };

      console.log("Original Data:", medicineData);
      console.log("Transformed Form Data:", formData);

      form.setFieldsValue(formData);
      setModalVisible(true);
    } catch (error) {
      console.error("Edit error:", error);
      message.error("Lỗi khi tải thông tin thuốc");
    }
  };

  const MedicineForm = ({ form, editingMedicine, suppliers }) => {
    const [isVaccine, setIsVaccine] = useState(
      editingMedicine ? form.getFieldValue("isVaccine") : false
    );

    const getAvailableSuppliers = (currentFieldName) => {
      const allSuppliers = suppliers || [];
      const formValues = form.getFieldValue("medicineSuppliers") || [];
      const selectedSupplierIds = formValues
        .map((item, index) =>
          index !== currentFieldName ? item?.supplierId : null
        )
        .filter((id) => id !== null);

      const availableSuppliers = allSuppliers.filter(
        (supplier) => !selectedSupplierIds.includes(supplier.id)
      );

      const currentSupplierId = form.getFieldValue([
        "medicineSuppliers",
        currentFieldName,
        "supplierId",
      ]);
      if (currentSupplierId) {
        const currentSupplier = allSuppliers.find(
          (s) => s.id === currentSupplierId
        );
        if (
          currentSupplier &&
          !availableSuppliers.find((s) => s.id === currentSupplierId)
        ) {
          availableSuppliers.push(currentSupplier);
        }
      }

      return availableSuppliers;
    };

    const handleRemoveSupplier = (name) => {
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa nhà cung cấp này?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => {
          form.setFieldsValue({
            medicineSuppliers: form
              .getFieldValue("medicineSuppliers")
              .filter((_, index) => index !== name),
          });
        },
      });
    };

    return (
      <StyledWrapper>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="medicineName"
                label="Tên thuốc"
                rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
              >
                <Input placeholder="Nhập tên thuốc" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="isVaccine"
                label="Phân loại"
                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
              >
                <Select
                  onChange={(value) => {
                    setIsVaccine(value);
                    form.setFieldValue("unit", value ? "Lọ" : "Viên");
                  }}
                  placeholder="Chọn loại..."
                  size="large"
                >
                  <Option value={false}>
                    <Space>
                      <Tag color="blue">Thuốc</Tag>
                    </Space>
                  </Option>
                  <Option value={true}>
                    <Space>
                      <Tag color="green">Vaccine</Tag>
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị tính"
                tooltip="Đơn vị tính s được tự động điền theo loại thuốc"
              >
                <Input disabled size="large" />
              </Form.Item>
            </Col>

            {isVaccine && (
              <Col span={12}>
                <Form.Item
                  name="daysAfterImport"
                  label="Số ngày chích sau nhập chuồng"
                  rules={[{ required: true, message: "Vui lòng nhập số ngày" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Nhập số ngày..."
                    size="large"
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={isVaccine ? 12 : 24}>
              <Form.Item
                name="usage"
                label="Cách dùng"
                rules={[{ required: true, message: "Vui lòng nhập cách dùng" }]}
              >
                <Input.TextArea
                  rows={1}
                  placeholder="Nhập hướng dẫn sử dụng..."
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về thuốc..."
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="isActive" label="Trạng thái" initialValue={true}>
                <Select size="large">
                  <Option value={true}>
                    <Badge status="success" text="Đang sử dụng" />
                  </Option>
                  <Option value={false}>
                    <Badge status="error" text="Ngừng sử dụng" />
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Card
                title={
                  <Space>
                    <DatabaseOutlined style={{ color: "#1890ff" }} />
                    <span>Thông tin nhà cung cấp</span>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Form.List name="medicineSuppliers">
                  {(fields, { add }) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {fields.map(({ key, name, ...restField }) => {
                        const availableSuppliers = getAvailableSuppliers(name);

                        return (
                          <Card
                            key={key}
                            size="small"
                            bordered={false}
                            style={{
                              background: "#f8f9fa",
                              borderRadius: "8px",
                              position: "relative",
                            }}
                          >
                            <Button
                              type="text"
                              danger
                              onClick={() => handleRemoveSupplier(name)}
                              icon={<DeleteOutlined />}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                              }}
                            />

                            <Form.Item
                              {...restField}
                              name={[name, "supplierId"]}
                              label="Nhà cung cấp"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn nhà cung cấp",
                                },
                              ]}
                              style={{ margin: 0 }}
                            >
                              <Select
                                placeholder="Chọn nhà cung cấp"
                                showSearch
                                optionFilterProp="label"
                                size="large"
                                style={{ width: "100%" }}
                                filterOption={(input, option) =>
                                  option?.label
                                    ?.toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {availableSuppliers.map((supplier) => (
                                  <Option
                                    key={supplier.id}
                                    value={supplier.id}
                                    label={supplier.name}
                                  >
                                    {supplier.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Card>
                        );
                      })}

                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                        style={{
                          borderRadius: "8px",
                          height: "45px",
                        }}
                        disabled={fields.length >= suppliers.length}
                      >
                        Thêm nhà cung cấp
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Card>
            </Col>
          </Row>

          <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
              <Button size="large" onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                {editingMedicine ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Row>
        </Form>
      </StyledWrapper>
    );
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
          <MedicineForm
            form={form}
            editingMedicine={editingId}
            suppliers={suppliers}
          />
        </Modal>
      </Space>
    </Card>
  );
};

export default MedicinePage;
