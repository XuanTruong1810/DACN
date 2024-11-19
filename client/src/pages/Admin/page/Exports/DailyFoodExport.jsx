import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Typography,
  message,
  DatePicker,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Tooltip,
  InputNumber,
  Divider,
  Statistic,
  Alert,
  Input,
} from "antd";
import {
  SaveOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const DailyFoodExport = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaPigs, setAreaPigs] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalData, setModalData] = useState({
    quantity: 0,
    note: "",
  });

  // Fetch danh sách khu vực
  const fetchAreas = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Areas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAreas(response.data.data.items);
    } catch (error) {
      message.error("Không thể tải danh sách khu vực");
    }
  };

  // Fetch số lượng heo theo khu vực
  const fetchPigsByArea = async (areaId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data.length;
    } catch (error) {
      message.error("Không thể tải thông tin heo");
      return 0;
    }
  };

  // Fetch danh sách thức ăn theo khu vực
  const fetchFoodsByArea = async (areaId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Food?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFoodList(response.data.data.items);
    } catch (error) {
      message.error("Không thể tải danh sách thức ăn");
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleAreaChange = async (areaId) => {
    setSelectedArea(areaId);
    try {
      // Fetch thông tin heo
      const pigsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/area/${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Đảm bảo data là array trước khi đếm
      const pigsData = Array.isArray(pigsResponse.data.data)
        ? pigsResponse.data.data
        : [];
      setAreaPigs((prev) => ({
        ...prev,
        [areaId]: pigsData.length,
      }));

      // Fetch danh sách thức ăn
      const foodResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Food?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Đảm bảo data là array
      const foodData = foodResponse.data.data.items || [];
      setFoodList(foodData);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    }
  };

  const handleOpenModal = (food) => {
    const totalPigs = areaPigs[selectedArea] || 0;
    const recommendedTotal = Number(
      (food.quantityPerMeal * food.mealsPerDay * totalPigs).toFixed(2)
    );
    setSelectedFood(food);
    setModalData({
      recommendedQuantity: recommendedTotal,
      quantity: recommendedTotal,
      note: "",
    });
    setIsModalVisible(true);
  };

  const handleSaveExport = async () => {
    try {
      const formValues = await form.validateFields();

      if (!formValues.date || !selectedArea || !selectedFood) {
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      setSubmitting(true);

      const exportData = {
        exportDate: formValues.date.format("YYYY-MM-DD"),
        areaId: selectedArea,
        note: modalData.note.trim(),
        details: [
          {
            foodId: selectedFood.id,
            quantity: modalData.quantity,
          },
        ],
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/FoodExport`,
        exportData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Tạo phiếu xuất thành công!");
      navigate("/admin/exports");
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo phiếu xuất!");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "foodTypeName",
      key: "type",
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "stock",
      render: (value) => (
        <Tag color={value > 100 ? "green" : "red"}>{value} kg</Tag>
      ),
    },
    {
      title: "Định mức/con",
      dataIndex: "quantityPerMeal",
      key: "recommendedPerPig",
      render: (value) => `${value} kg/con`,
    },
    {
      title: "Số bữa/ngày",
      dataIndex: "mealsPerDay",
      key: "mealsPerDay",
      render: (value) => `${value} bữa`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenModal(record)}>
          Chọn xuất
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="date"
                label="Ngày xuất"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày xuất!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày xuất"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="area"
                label="Khu vực"
                rules={[{ required: true, message: "Vui lòng chọn khu vực!" }]}
              >
                <Select
                  placeholder="Chọn khu vực"
                  onChange={handleAreaChange}
                  allowClear
                >
                  {Array.isArray(areas) &&
                    areas.map((area) => (
                      <Option key={area.id} value={area.id}>
                        {area.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {selectedArea && Array.isArray(foodList) && (
          <Table
            columns={columns}
            dataSource={foodList}
            rowKey="id"
            pagination={false}
          />
        )}

        <Modal
          title="Xác nhận xuất thức ăn"
          open={isModalVisible}
          width={800}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSaveExport}
              loading={submitting}
              disabled={!form.getFieldValue("date")}
            >
              Lưu phiếu xuất
            </Button>,
          ]}
        >
          {selectedFood && (
            <div>
              <Title level={5}>{selectedFood.name}</Title>
              <p>{selectedFood.description}</p>
              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Số heo trong khu vực"
                    value={areaPigs[selectedArea] || 0}
                    suffix="con"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tồn kho"
                    value={selectedFood.quantityInStock}
                    suffix="kg"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Định mức/con/bữa"
                    value={selectedFood.quantityPerMeal}
                    suffix="kg"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Số bữa/ngày"
                    value={selectedFood.mealsPerDay}
                    suffix="bữa"
                  />
                </Col>
              </Row>

              <Divider />

              <Form.Item label="Số lượng dự kiến">
                <InputNumber
                  value={modalData.recommendedQuantity}
                  disabled
                  addonAfter="kg"
                  style={{ width: "100%" }}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Số lượng xuất"
                required
                help="Số lượng xuất không được nhỏ hơn số lượng dự kiến"
              >
                <InputNumber
                  min={modalData.recommendedQuantity}
                  max={selectedFood.quantityInStock}
                  value={modalData.quantity}
                  onChange={(value) => {
                    const roundedValue = value
                      ? Number(value.toFixed(2))
                      : value;
                    setModalData((prev) => ({
                      ...prev,
                      quantity: roundedValue,
                    }));
                  }}
                  addonAfter="kg"
                  style={{ width: "100%" }}
                  precision={2}
                />
              </Form.Item>

              <Form.Item label="Ghi chú">
                <Input.TextArea
                  value={modalData.note}
                  onChange={(e) =>
                    setModalData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Nhập ghi chú cho phiếu xuất..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default DailyFoodExport;
