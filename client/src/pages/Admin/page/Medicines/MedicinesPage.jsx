import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  InputNumber,
  Card,
  Typography,
  Row,
  Col,
  Select,
  Dropdown,
  Tooltip,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  StopOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [form] = Form.useForm();

  // Fake data
  const fakeMedicines = [
    {
      id: 1,
      name: "Vitamin AD3E",
      type: "Vitamin",
      unit: "Chai",
      quantity: 50,
      manufacturer: "Công ty Dược phẩm Merap",
      expiryDate: "2024-12-31",
      description: "Bổ sung vitamin A, D3, E cho heo, tăng cường sức đề kháng",
      status: "active",
      price: 150000,
      dosage: "1-2ml/con/ngày",
    },
    {
      id: 2,
      name: "Amoxicillin 20%",
      type: "Kháng sinh",
      unit: "Chai",
      quantity: 30,
      manufacturer: "Công ty TNHH Thú y Hàn Việt",
      expiryDate: "2024-10-15",
      description: "Điều trị nhiễm khuẩn đường hô hấp, tiêu hóa",
      status: "active",
      price: 280000,
      dosage: "1ml/10kg thể trọng",
    },
    {
      id: 3,
      name: "Vaccine PRRS",
      type: "Vaccine",
      unit: "Lọ",
      quantity: 20,
      manufacturer: "MSD Animal Health",
      expiryDate: "2024-08-20",
      description: "Phòng bệnh lợn tai xanh (PRRS)",
      status: "active",
      price: 850000,
      dosage: "2ml/con",
    },
    {
      id: 4,
      name: "Danofloxacin 5%",
      type: "Kháng sinh",
      unit: "Chai",
      quantity: 15,
      manufacturer: "Công ty CP Dược TW Medipharco",
      expiryDate: "2024-11-30",
      description: "Điều trị viêm phổi, viêm ruột ở heo",
      status: "inactive",
      price: 320000,
      dosage: "1ml/10kg thể trọng/ngày",
    },
    {
      id: 5,
      name: "Vitamin C",
      type: "Vitamin",
      unit: "Gói",
      quantity: 100,
      manufacturer: "Công ty Dược phẩm Việt Nam",
      expiryDate: "2024-09-15",
      description: "Bổ sung Vitamin C, tăng sức đề kháng",
      status: "active",
      price: 45000,
      dosage: "1 gói/100kg thức ăn",
    },
    {
      id: 6,
      name: "Vaccine Dịch tả",
      type: "Vaccine",
      unit: "Lọ",
      quantity: 25,
      manufacturer: "Navetco",
      expiryDate: "2024-07-25",
      description: "Phòng bệnh dịch tả lợn cổ điển",
      status: "active",
      price: 450000,
      dosage: "1ml/con",
    },
    {
      id: 7,
      name: "Tylosin 20%",
      type: "Kháng sinh",
      unit: "Chai",
      quantity: 40,
      manufacturer: "Công ty Dược phẩm Merap",
      expiryDate: "2024-12-10",
      description: "Điều trị viêm phổi, viêm khớp",
      status: "active",
      price: 180000,
      dosage: "1ml/10kg thể trọng",
    },
    {
      id: 8,
      name: "Men tiêu hóa",
      type: "Thuốc bổ",
      unit: "Gói",
      quantity: 80,
      manufacturer: "Công ty TNHH Thú y Hàn Việt",
      expiryDate: "2024-10-01",
      description: "Hỗ trợ tiêu hóa, cải thiện hệ vi sinh đường ruột",
      status: "active",
      price: 35000,
      dosage: "1 gói/100kg thức ăn",
    },
    {
      id: 9,
      name: "Vaccine FMD",
      type: "Vaccine",
      unit: "Lọ",
      quantity: 15,
      manufacturer: "Boehringer Ingelheim",
      expiryDate: "2024-06-30",
      description: "Phòng bệnh lở mồm long móng",
      status: "active",
      price: 920000,
      dosage: "2ml/con",
    },
    {
      id: 10,
      name: "Dung dịch sát trùng",
      type: "Thuốc sát trùng",
      unit: "Chai",
      quantity: 60,
      manufacturer: "Công ty TNHH Thú y Việt Nam",
      expiryDate: "2024-12-25",
      description: "Sát trùng chuồng trại, dụng cụ chăn nuôi",
      status: "active",
      price: 85000,
      dosage: "1:1000 với nước",
    },
  ];

  const [filters, setFilters] = useState({
    search: "",
    type: [],
    manufacturer: [],
    status: "all",
  });

  const typeOptions = [
    "Vitamin",
    "Kháng sinh",
    "Vaccine",
    "Thuốc bổ",
    "Thuốc sát trùng",
    "Thuốc giảm đau",
    "Thuốc trị ký sinh trùng",
  ];
  const unitOptions = ["Chai", "Lọ", "Ống", "Gói", "Hộp", "Viên", "Kg", "Gram"];

  const columns = [
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => {
        const actionItems = [
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
            key: "divider1",
            type: "divider",
          },
          {
            key: "status",
            label: record.status === "active" ? "Ngừng sử dụng" : "Kích hoạt",
            icon:
              record.status === "active" ? <StopOutlined /> : <CheckOutlined />,
            onClick: () => handleToggleStatus(record),
            danger: record.status === "active",
          },
          {
            key: "divider2",
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Dropdown
            menu={{ items: actionItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="action-btn"
            />
          </Dropdown>
        );
      },
    },
  ];

  const FilterSection = () => (
    <div
      style={{
        padding: "16px",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        background: "#fafafa",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm theo tên thuốc"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Lọc theo loại thuốc"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            allowClear
          >
            {typeOptions.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Trạng thái"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="all">Tất cả</Option>
            <Option value="active">Đang sử dụng</Option>
            <Option value="inactive">Ngừng sử dụng</Option>
          </Select>
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Space>
          <Button
            onClick={() =>
              setFilters({
                search: "",
                type: [],
                manufacturer: [],
                status: "all",
              })
            }
          >
            Xóa bộ lọc
          </Button>
          <Button type="primary" icon={<FilterOutlined />}>
            Áp dụng
          </Button>
        </Space>
      </Row>
    </div>
  );

  // Handlers
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingMedicine) {
        // Update logic
        const updatedMedicines = medicines.map((medicine) =>
          medicine.id === editingMedicine.id
            ? { ...values, id: medicine.id }
            : medicine
        );
        setMedicines(updatedMedicines);
        message.success("Cập nhật thuốc thành công");
      } else {
        // Create logic
        const newMedicine = {
          ...values,
          id: medicines.length + 1,
          status: "active",
        };
        setMedicines([...medicines, newMedicine]);
        message.success("Thêm thuốc mới thành công");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      setEditingMedicine(null);
    }
  };

  const handleView = (record) => {
    Modal.info({
      title: "Chi tiết thuốc",
      width: 600,
      content: (
        <div style={{ padding: "20px 0" }}>
          <p>
            <strong>Tên thuốc:</strong> {record.name}
          </p>
          <p>
            <strong>Loại:</strong> {record.type}
          </p>
          <p>
            <strong>Đơn vị:</strong> {record.unit}
          </p>
          <p>
            <strong>Số lượng:</strong> {record.quantity}
          </p>
          <p>
            <strong>Nhà sản xuất:</strong> {record.manufacturer}
          </p>
          <p>
            <strong>Hạn sử dụng:</strong>{" "}
            {new Date(record.expiryDate).toLocaleDateString("vi-VN")}
          </p>
          <p>
            <strong>Mô tả:</strong> {record.description}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {record.status === "active" ? "Đang sử dụng" : "Ngừng sử dụng"}
          </p>
        </div>
      ),
    });
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMedicines(fakeMedicines);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thuốc
            </Title>
            <Button
              type="text"
              icon={<FilterOutlined rotate={showFilter ? 180 : 0} />}
              onClick={() => setShowFilter(!showFilter)}
            >
              {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMedicine(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm thuốc mới
          </Button>
        </div>

        <div
          style={{
            transition: "all 0.3s ease",
            height: showFilter ? "auto" : 0,
            opacity: showFilter ? 1 : 0,
            overflow: "hidden",
            marginBottom: showFilter ? 20 : 0,
          }}
        >
          <FilterSection />
        </div>

        <Table
          columns={columns}
          dataSource={medicines}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} mục`,
          }}
        />
      </Card>

      <Modal
        title={editingMedicine ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingMedicine(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên thuốc"
            rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại thuốc"
            rules={[{ required: true, message: "Vui lòng nhập loại thuốc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="manufacturer"
            label="Nhà sản xuất"
            rules={[{ required: true, message: "Vui lòng nhập nhà sản xuất" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
            rules={[{ required: true, message: "Vui lòng nhập hạn sử dụng" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng nhập trạng thái" }]}
          >
            <Select>
              <Option value="active">Đang sử dụng</Option>
              <Option value="inactive">Ngừng sử dụng</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingMedicine ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicinesPage;
