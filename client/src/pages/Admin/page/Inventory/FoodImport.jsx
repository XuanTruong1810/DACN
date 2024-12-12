/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
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
  Empty,
  Statistic,
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
  const [allSelectedFoods, setAllSelectedFoods] = useState([]);
  const [note, setNote] = useState("");
  const [areaPigInfo, setAreaPigInfo] = useState({
    totalPigs: 0,
    activePigs: 0,
  });

  // Fetch areas on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const response = await axiosClient.get("/api/v1/Areas", {});
        const areasData = response.data.data.items;
        setAreas(areasData);

        if (areasData && areasData.length > 0) {
          const firstArea = areasData[0];
          const initialDays = 7;

          form.setFieldsValue({
            area: firstArea.id,
            days: initialDays,
          });

          // Khởi tạo cả thông tin thức ăn và số heo
          await Promise.all([
            getFoodsByArea(firstArea.id, initialDays),
            getPigsByArea(firstArea.id),
          ]);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
        message.error("Lỗi khi tải danh sách khu vực");
      }
    };

    initializeData();
  }, []);

  // API Calls
  const getAreas = async () => {
    try {
      const response = await axiosClient.get("/api/v1/Areas", {});
      setAreas(response.data.data.items);
    } catch (error) {
      message.error("Lỗi khi tải danh sách khu vực");
    }
  };

  const calculateExpectedAmount = (food, currentDays, numberOfPigs) => {
    try {
      const quantityPerMeal = Number(food.quantityPerMeal) || 0;
      const mealsPerDay = Number(food.mealsPerDay) || 0;
      const currentStock = Number(food.quantityInStock) || 0;

      // Tính theo số heo
      const dailyUsagePerPig = quantityPerMeal * mealsPerDay;
      const totalDailyUsage = dailyUsagePerPig * numberOfPigs;
      const totalNeeded = totalDailyUsage * currentDays;
      const expectedAmount = Math.max(0, totalNeeded - currentStock);

      return Math.ceil(expectedAmount);
    } catch (error) {
      console.error("Lỗi tính toán:", error);
      return 0;
    }
  };

  const getFoodsByArea = async (areaId, currentDays) => {
    setLoading(true);
    try {
      const [foodResponse, pigResponse] = await Promise.all([
        axiosClient.get("/api/Food", {
          params: {
            areaId: areaId,
            status: "active",
          },
        }),
        axiosClient.get(`/api/v1/Pigs/area/${areaId}`),
      ]);

      const currentArea = areas.find((a) => a.id === areaId);
      const areaName = currentArea ? currentArea.name : "";

      console.log("Current Area Info:", { areaId, areaName, currentArea });

      const activePigs = pigResponse.data.data.filter(
        (pig) => pig.status === "alive"
      ).length;

      const formattedFoods = foodResponse.data.data.items.map((food) => {
        const formatted = {
          id: food.id,
          name: food.name,
          category: food.foodTypeName,
          currentStock: food.quantityInStock || 0,
          description: food.description,
          quantityPerMeal: food.quantityPerMeal || 0,
          mealsPerDay: food.mealsPerDay || 0,
          dailyUsage:
            (food.quantityPerMeal || 0) * (food.mealsPerDay || 0) * activePigs,
          isOutOfStock: (food.quantityInStock || 0) === 0,
          expectedAmount: calculateExpectedAmount(
            {
              quantityPerMeal: food.quantityPerMeal || 0,
              mealsPerDay: food.mealsPerDay || 0,
              quantityInStock: food.quantityInStock || 0,
            },
            currentDays,
            activePigs
          ),
          areaId: areaId,
          areaName: areaName,
        };
        console.log("Formatted Food Item:", formatted);
        return formatted;
      });

      setFoods(formattedFoods);
      setAreaPigInfo({ activePigs });
    } catch (error) {
      console.error("Lỗi khi tải danh sách thức ăn:", error);
      message.error("Lỗi khi tải danh sách thức ăn");
    }
    setLoading(false);
  };

  const getPigsByArea = async (areaId) => {
    try {
      const response = await axiosClient.get(`/api/v1/Pigs/area/${areaId}`);
      const pigData = response.data.data;

      // Tính toán số lượng heo từ danh sách trả về
      const totalPigs = pigData.length;
      const activePigs = pigData.filter((pig) => pig.status === "alive").length;

      setAreaPigInfo({
        totalPigs: totalPigs,
        activePigs: activePigs,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin heo:", error);
      message.error("Lỗi khi lấy thông tin số lượng heo");
      setAreaPigInfo({
        totalPigs: 0,
        activePigs: 0,
      });
    }
  };

  // Event Handlers
  const handleAreaChange = async (areaId) => {
    try {
      const currentDays = form.getFieldValue("days") || days;

      form.setFieldsValue({
        area: areaId,
        days: currentDays,
      });

      // Gọi song song cả 2 API để tối ưu thời gian
      await Promise.all([
        getFoodsByArea(areaId, currentDays),
        getPigsByArea(areaId),
      ]);
    } catch (error) {
      console.error("Lỗi khi thay đổi khu vực:", error);
      message.error("Lỗi khi thay đổi khu vực");
    }
  };

  const handleShowDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

  const handleDaysChange = (value) => {
    setDays(value);

    // Cập nhật foods hiện tại
    const updatedFoods = foods.map((food) => ({
      ...food,
      expectedAmount: calculateExpectedAmount(food, value),
    }));
    setFoods(updatedFoods);

    // Cập nhật selected foods
    const updatedSelectedFoods = allSelectedFoods.map((food) => ({
      ...food,
      expectedAmount: calculateExpectedAmount(food, value),
    }));
    setAllSelectedFoods(updatedSelectedFoods);
  };

  const handleProductSelect = (record) => {
    console.log("Selected Record:", record);
    const isSelected = allSelectedFoods.some((food) => food.id === record.id);

    if (isSelected) {
      setAllSelectedFoods((prev) =>
        prev.filter((food) => food.id !== record.id)
      );
    } else {
      const newFood = {
        ...record,
        areaId: record.areaId,
        areaName: record.areaName,
      };
      console.log("New Food to Add:", newFood);
      setAllSelectedFoods((prev) => [...prev, newFood]);
    }
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
        <Col span={18}>
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

        <Col span={6}>
          <Card
            title="Danh sách đã chọn"
            extra={
              allSelectedFoods.length > 0 && (
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    setAllSelectedFoods([]);
                    setNote("");
                  }}
                >
                  Xóa tất cả
                </Button>
              )
            }
          >
            {allSelectedFoods.length > 0 ? (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {allSelectedFoods.map((food) => {
                  console.log("Rendering Selected Food:", food);
                  return (
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
                      <div>
                        <Text type="secondary">
                          Sử dụng/ngày: {food.dailyUsage.toLocaleString()} kg
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "8px",
                        }}
                      >
                        <Text type="secondary" style={{ marginRight: "8px" }}>
                          Dự kiến nhập ({days} ngày):
                        </Text>
                        <InputNumber
                          min={0}
                          value={food.expectedAmount}
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
                  );
                })}
              </div>
            ) : (
              <Empty
                description="Chưa có thức ăn được chọn"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}

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
