import { useState, useEffect } from "react";
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
  //   DatePicker,
  Dropdown,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  StopOutlined,
  CheckOutlined,
} from "@ant-design/icons";
// import styled from "styled-components";

const { Title } = Typography;
// const { RangePicker } = DatePicker;
const { Option } = Select;

// const StyledCard = styled(Card)`
//   margin-bottom: 20px;
//   border-radius: 8px;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
// `;

// const StyledTable = styled(Table)`
//   .ant-table-thead > tr > th {
//     background: #f0f5ff;
//   }
// `;

const FoodsPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
    type: [],
    manufacturer: [],
    quantityRange: null,
  });
  const [showFilter, setShowFilter] = useState(false);

  // Fake Data
  const fakeData = [
    {
      id: 1,
      name: "Cám hỗn hợp cao cấp",
      quantity: 100,
      description: "Thức ăn hỗn hợp giàu dinh dưỡng cho heo",
      type: "Thức ăn khô",
      manufacturer: "Công ty TNHH Thức ăn chăn nuôi A",
    },
    {
      id: 2,
      name: "Bắp xay",
      quantity: 150,
      description: "Bắp xay nhuyễn dùng để trộn thức ăn",
      type: "Nguyên liệu",
      manufacturer: "Công ty TNHH B",
    },
    {
      id: 3,
      name: "Cám con cai sữa",
      quantity: 80,
      description: "Thức ăn đặc biệt cho heo con cai sữa",
      type: "Thức ăn khô",
      manufacturer: "Công ty TNHH C",
    },
  ];

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setFoods(fakeData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Thức ăn khô", value: "Thức ăn khô" },
        { text: "Nguyên liệu", value: "Nguyên liệu" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Số lượng (kg)",
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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
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
            overlayStyle={{ width: "180px" }}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="action-btn"
              style={{
                fontSize: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "6px",
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingFood) {
        // Giả lập cập nhật
        const updatedFoods = foods.map((food) =>
          food.id === editingFood.id ? { ...values, id: food.id } : food
        );
        setFoods(updatedFoods);
        message.success("Cập nhật thức ăn thành công");
      } else {
        // Giả lập thêm mới
        const newFood = {
          ...values,
          id: foods.length + 1,
        };
        setFoods([...foods, newFood]);
        message.success("Thêm thức ăn mới thành công");
      }
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      setEditingFood(null);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    form.setFieldsValue(food);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thức ăn này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // Giả lập API call
          setFoods(foods.filter((food) => food.id !== id));
          message.success("Xóa thức ăn thành công");
        } catch (error) {
          console.log(error);
          message.error("Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  const handleView = (record) => {
    // Hiển thị modal xem chi tiết
    Modal.info({
      title: "Chi tiết thức ăn",
      width: 600,
      content: (
        <div style={{ padding: "20px 0" }}>
          <p>
            <strong>Tên thức ăn:</strong> {record.name}
          </p>
          <p>
            <strong>Loại:</strong> {record.type}
          </p>
          <p>
            <strong>Số lượng:</strong> {record.quantity} kg
          </p>
          <p>
            <strong>Nhà sản xuất:</strong> {record.manufacturer}
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
      okText: "Đóng",
    });
  };

  const handleToggleStatus = (record) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    const statusText = newStatus === "active" ? "kích hoạt" : "ngừng sử dụng";

    Modal.confirm({
      title: `Xác nhận ${statusText}`,
      content: `Bạn có chắc chắn muốn ${statusText} thức ăn "${record.name}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Giả lập API call
          const updatedFoods = foods.map((food) =>
            food.id === record.id ? { ...food, status: newStatus } : food
          );
          setFoods(updatedFoods);
          message.success(
            `${
              statusText.charAt(0).toUpperCase() + statusText.slice(1)
            } thành công`
          );
        } catch (error) {
          console.log(error);
          message.error("Có lỗi xảy ra");
        }
      },
    });
  };

  // Thêm các options cho filters
  const typeOptions = ["Thức ăn khô", "Nguyên liệu", "Thức ăn tươi", "Vitamin"];
  const manufacturerOptions = [
    "Công ty TNHH A",
    "Công ty TNHH B",
    "Công ty TNHH C",
  ];
  const quantityRanges = [
    { label: "0-50 kg", value: [0, 50] },
    { label: "51-100 kg", value: [51, 100] },
    { label: "101-200 kg", value: [101, 200] },
    { label: ">200 kg", value: [201, Infinity] },
  ];

  // Hàm lọc dữ liệu
  const getFilteredData = () => {
    return foods.filter((food) => {
      const matchSearch =
        food.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        food.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchType =
        filters.type.length === 0 || filters.type.includes(food.type);

      const matchManufacturer =
        filters.manufacturer.length === 0 ||
        filters.manufacturer.includes(food.manufacturer);

      const matchQuantity =
        !filters.quantityRange ||
        (food.quantity >= filters.quantityRange[0] &&
          food.quantity <= filters.quantityRange[1]);

      return matchSearch && matchType && matchManufacturer && matchQuantity;
    });
  };

  // Thêm phần Filter Component
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
            placeholder="Tìm kiếm theo tên hoặc mô tả"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Lọc theo loại thức ăn"
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
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Lọc theo nhà sản xuất"
            value={filters.manufacturer}
            onChange={(value) =>
              setFilters({ ...filters, manufacturer: value })
            }
            allowClear
          >
            {manufacturerOptions.map((manu) => (
              <Option key={manu} value={manu}>
                {manu}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Lọc theo số lượng"
            onChange={(value) =>
              setFilters({ ...filters, quantityRange: value })
            }
            allowClear
          >
            {quantityRanges.map((range) => (
              <Option key={range.label} value={range.value}>
                {range.label}
              </Option>
            ))}
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
                quantityRange: null,
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

  // Thêm CSS cho nút action
  const styles = `
    .action-btn:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .ant-dropdown-menu-item {
      padding: 8px 12px !important;
    }
    
    .ant-dropdown-menu-item .anticon {
      margin-right: 8px;
    }
  `;

  // Thêm style vào component
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
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
              Quản lý thức ăn
            </Title>
            <Button
              type="text"
              icon={<FilterOutlined rotate={showFilter ? 180 : 0} />}
              onClick={() => setShowFilter(!showFilter)}
              style={{ marginLeft: 8 }}
            >
              {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingFood(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            size="large"
          >
            Thêm thức ăn mới
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
          dataSource={getFilteredData()}
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
        title={editingFood ? "Sửa thông tin thức ăn" : "Thêm thức ăn mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingFood(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên thức ăn"
            rules={[{ required: true, message: "Vui lòng nhập tên thức ăn" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại thức ăn"
            rules={[{ required: true, message: "Vui lòng chọn loại thức ăn" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng (kg)"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="Nhà sản xuất"
            rules={[{ required: true, message: "Vui lòng nhập nhà sản xuất" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingFood(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingFood ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FoodsPage;
