import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Modal,
  Descriptions,
  Divider,
  Input,
  InputNumber,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;

// Tạo axios instance
const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const FoodImport = () => {
  // States
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [days, setDays] = useState(7);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const [allSelectedFoods, setAllSelectedFoods] = useState([]);
  const [note, setNote] = useState("");

  // Fetch areas on component mount
  useEffect(() => {
    getAreas();
  }, []);

  // API Calls
  const getAreas = async () => {
    try {
      const response = await axiosClient.get("/api/v1/Areas", {});
      setAreas(response.data.data.items);

      // Set default values
      if (response.data.data.length > 0) {
        form.setFieldsValue({
          area: response.data.data[0].id,
          days: days,
        });
        getFoodsByArea(response.data.data[0].id);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách khu vực");
    }
  };

  const calculateExpectedAmount = (food, days) => {
    try {
      // Đảm bảo các giá trị là số
      const quantityPerMeal = Number(food.quantityPerMeal) || 0;
      const mealsPerDay = Number(food.mealsPerDay) || 0;
      const currentStock = Number(food.quantityInStock) || 0;

      // Tính toán
      const dailyUsage = quantityPerMeal * mealsPerDay;
      const totalNeeded = dailyUsage * days;
      const expectedAmount = Math.max(0, totalNeeded - currentStock);

      // Làm tròn kết quả
      return Math.ceil(expectedAmount);
    } catch (error) {
      console.error("Lỗi tính toán:", error);
      return 0;
    }
  };

  const getFoodsByArea = async (areaId) => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/Food", {
        params: {
          areaId: areaId,
          status: "active",
        },
      });
      console.log(response.data.data.items);

      // Transform data với số ngày hiện tại
      const formattedFoods = response.data.data.items.map((food) => ({
        id: food.id,
        name: food.name,
        category: food.foodTypeName,
        currentStock: food.quantityInStock || 0,
        description: food.description,
        quantityPerMeal: food.quantityPerMeal || 0,
        mealsPerDay: food.mealsPerDay || 0,
        dailyUsage: (food.quantityPerMeal || 0) * (food.mealsPerDay || 0),
        isOutOfStock: (food.quantityInStock || 0) === 0,
        expectedAmount: calculateExpectedAmount(
          {
            quantityPerMeal: food.quantityPerMeal || 0,
            mealsPerDay: food.mealsPerDay || 0,
            quantityInStock: food.quantityInStock || 0,
          },
          days
        ),
        areaId: areaId,
        areaName: areas.find((a) => a.id === areaId)?.name || "",
      }));
      console.log(formattedFoods);

      setFoods(formattedFoods);
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi tải danh sách thức ăn");
    }
    setLoading(false);
  };

  // Event Handlers
  const handleAreaChange = (areaId) => {
    getFoodsByArea(areaId);
  };

  const handleShowDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

  const handleDaysChange = (value) => {
    setDays(value);
    // Cập nhật lại expectedAmount cho tất cả foods
    const updatedFoods = foods.map((food) => ({
      ...food,
      expectedAmount: calculateExpectedAmount(food, value),
    }));
    setFoods(updatedFoods);

    // Cập nhật lại expectedAmount cho các món đã chọn
    const updatedSelectedFoods = allSelectedFoods.map((food) => ({
      ...food,
      expectedAmount: calculateExpectedAmount(food, value),
    }));
    setAllSelectedFoods(updatedSelectedFoods);
  };

  const handleProductSelect = (record) => {
    const isSelected = allSelectedFoods.some((food) => food.id === record.id);

    if (isSelected) {
      // Xóa khỏi danh sách đã chọn
      setAllSelectedFoods((prev) =>
        prev.filter((food) => food.id !== record.id)
      );
    } else {
      // Thêm vào danh sách đã chọn
      setAllSelectedFoods((prev) => [...prev, record]);
    }
    setShowBill(true);
  };

  // Table columns
  const columns = [
    {
      title: "Thông tin",
      children: [
        {
          title: "Tên thức ăn",
          dataIndex: "name",
          key: "name",
          width: 200,
          render: (text) => <Text strong>{text}</Text>,
        },
        {
          title: "Danh mục",
          dataIndex: "category",
          key: "category",
          width: 150,
        },
      ],
    },
    {
      title: "Tồn kho",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 150,
      render: (value, record) => (
        <Space>
          <Text>{value.toLocaleString()} kg</Text>
          {record.isOutOfStock ? (
            <Tag color="error">Hết hàng</Tag>
          ) : (
            record.currentStock < 1000 && <Tag color="warning">Sắp hết</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Định mức",
      children: [
        {
          title: "Số lượng/bữa",
          dataIndex: "quantityPerMeal",
          key: "quantityPerMeal",
          width: 120,
          render: (value) => <Text>{value.toLocaleString()} kg</Text>,
        },
        {
          title: "Số bữa/ngày",
          dataIndex: "mealsPerDay",
          key: "mealsPerDay",
          width: 120,
          render: (value) => <Text>{value} bữa</Text>,
        },
        {
          title: "Sử dụng/ngày",
          dataIndex: "dailyUsage",
          key: "dailyUsage",
          width: 150,
          render: (value) => <Text>{value.toLocaleString()} kg/ngày</Text>,
        },
      ],
    },
    {
      title: `Dự kiến nhập (${days} ngày)`,
      dataIndex: "expectedAmount",
      key: "expectedAmount",
      width: 200,
      render: (value) => (
        <Text type="success" strong>
          {value.toLocaleString()} kg
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type={
              allSelectedFoods.some((food) => food.id === record.id)
                ? "default"
                : "primary"
            }
            size="small"
            onClick={() => handleProductSelect(record)}
          >
            {allSelectedFoods.some((food) => food.id === record.id)
              ? "Đã chọn"
              : "Chọn"}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleShowDetail(record)}
          />
        </Space>
      ),
    },
  ];

  // Thêm hàm createImportRequest
  const createImportRequest = async () => {
    try {
      const requestData = {
        note: note || `Đề xuất nhập thức ăn cho ${days} ngày`,
        details: allSelectedFoods.map((food) => ({
          foodId: food.id,
          expectedQuantity: food.expectedAmount,
        })),
      };

      const response = await axiosClient.post(
        "/api/FoodImportRequest",
        requestData
      );

      if (response.status === 200) {
        message.success("Tạo phiếu nhập thành công!");
        // Reset form
        setAllSelectedFoods([]);
        setShowBill(false);
        setNote("");
      } else {
        message.error(response.data.message || "Lỗi khi tạo phiếu nhập");
      }
    } catch (error) {
      console.error("Lỗi tạo phiếu nhập:", error);
      message.error("Lỗi khi tạo phiếu nhập");
    }
  };

  return (
    <div className="food-import-page">
      <Row gutter={[16, 16]}>
        <Col span={showBill && allSelectedFoods.length > 0 ? 18 : 24}>
          <Card title="Danh sách thức ăn theo khu vực">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="area"
                        label="Khu vực"
                        rules={[
                          { required: true, message: "Vui lòng chọn khu vực" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn khu vực"
                          onChange={handleAreaChange}
                          style={{ width: "100%" }}
                        >
                          {areas.map((area) => (
                            <Option key={area.id} value={area.id}>
                              {area.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="days"
                        label="Số ngày dự kiến"
                        initialValue={7}
                        rules={[
                          { required: true, message: "Vui lòng nhập số ngày" },
                        ]}
                      >
                        <Select
                          onChange={handleDaysChange}
                          style={{ width: "100%" }}
                        >
                          {[7, 14, 30, 60, 90].map((d) => (
                            <Option key={d} value={d}>
                              {d} ngày
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Col>

              <Col span={24}>
                <Table
                  columns={columns}
                  dataSource={foods}
                  loading={loading}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} mục`,
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {showBill && allSelectedFoods.length > 0 && (
          <Col span={6}>
            <Card
              title="Danh sách đã chọn"
              extra={
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    setAllSelectedFoods([]);
                    setShowBill(false);
                    setNote("");
                  }}
                >
                  Xóa tất cả
                </Button>
              }
            >
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {allSelectedFoods.map((food) => (
                  <div
                    key={food.id}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{food.name}</Text>
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleProductSelect(food)}
                      >
                        Xóa
                      </Button>
                    </div>
                    <div>
                      <Text type="secondary">Khu vực: {food.areaName}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <Text type="secondary" style={{ marginRight: "8px" }}>
                        Dự kiến nhập:
                      </Text>
                      <InputNumber
                        min={0}
                        defaultValue={food.expectedAmount}
                        onChange={(value) => {
                          setAllSelectedFoods((prev) =>
                            prev.map((item) =>
                              item.id === food.id
                                ? { ...item, expectedAmount: value || 0 }
                                : item
                            )
                          );
                        }}
                        style={{ width: "120px" }}
                        addonAfter="kg"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Divider />
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Text strong>Tổng số món: </Text>
                <Text type="success" strong>
                  {allSelectedFoods.length}
                </Text>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Ghi chú:</Text>
                <Input.TextArea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú cho phiếu nhập..."
                  style={{ marginTop: "8px" }}
                  rows={3}
                />
              </div>
              <Button
                type="primary"
                block
                onClick={createImportRequest}
                disabled={allSelectedFoods.length === 0}
              >
                Tạo phiếu nhập
              </Button>
            </Card>
          </Col>
        )}
      </Row>

      {/* Food Detail Modal */}
      <Modal
        title="Chi tiết thức ăn"
        open={showFoodDetail}
        onCancel={() => setShowFoodDetail(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên thức ăn" span={2}>
            {selectedFood?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mã thức ăn">
            {selectedFood?.id}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {selectedFood?.category}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {selectedFood?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho hiện tại">
            <Space>
              {selectedFood?.currentStock.toLocaleString()} kg
              {selectedFood?.isOutOfStock ? (
                <Tag color="error">Hết hàng</Tag>
              ) : (
                selectedFood?.currentStock < 1000 && (
                  <Tag color="warning">Sắp hết</Tag>
                )
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Định mức sử dụng">
            {selectedFood?.dailyUsage.toLocaleString()} kg/ngày
          </Descriptions.Item>
          <Descriptions.Item label="Dự kiến nhập">
            {selectedFood?.expectedAmount.toLocaleString()} kg
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default FoodImport;
