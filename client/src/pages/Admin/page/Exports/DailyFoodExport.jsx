/* eslint-disable no-unused-vars */
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
  Empty,
} from "antd";
import {
  SaveOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

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
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [areaFoodLimits, setAreaFoodLimits] = useState({});
  const [totalFoodNeeded, setTotalFoodNeeded] = useState(0);
  const [remainingFood, setRemainingFood] = useState(0);
  const [pigStats, setPigStats] = useState({
    totalPigs: 0,
    remainingPigs: 0,
  });
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [exportedData, setExportedData] = useState(null);

  // Sử dụng dữ liệu từ API
  const calculateFoodForPigs = (numberOfPigs, food) => {
    const foodPerDayPerPig = parseFloat(
      (food.mealsPerDay * food.quantityPerMeal).toFixed(1)
    );
    return parseFloat((numberOfPigs * foodPerDayPerPig).toFixed(1));
  };

  const calculatePigsFromFood = (foodQuantity, food) => {
    const foodPerDayPerPig = parseFloat(
      (food.mealsPerDay * food.quantityPerMeal).toFixed(1)
    );
    return Math.floor(foodQuantity / foodPerDayPerPig);
  };

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

      // Nếu có khu vực, tự động chọn khu vực đầu tiên
      if (response.data.data.items.length > 0) {
        const firstArea = response.data.data.items[0];
        setSelectedArea(firstArea.id);
        handleAreaChange(firstArea.id); // Tự động load thức ăn của khu vực đầu tiên

        // Set giá trị cho form field area
        form.setFieldsValue({
          area: firstArea.id,
        });
      }
    } catch (error) {
      message.error("Không thể tải danh sách khu vực");
    }
  };

  useEffect(() => {
    fetchAreas();
    // Set ngày mặc định là ngày hiện tại
    form.setFieldsValue({
      date: moment(),
    });
  }, []);

  const handleAreaChange = async (areaId) => {
    setSelectedFoods([]);
    setSelectedArea(areaId);
    try {
      const pigsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/area/${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const pigsData = Array.isArray(pigsResponse.data.data)
        ? pigsResponse.data.data
        : [];

      const totalPigs = pigsData.length;

      setPigStats({
        totalPigs,
        remainingPigs: totalPigs,
      });

      // Fetch và set foodList như cũ
      const foodResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Food?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFoodList(foodResponse.data.data.items || []);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    }
  };

  const handleOpenModal = (food) => {
    const foodPerDayPerPig = parseFloat(
      (food.mealsPerDay * food.quantityPerMeal).toFixed(1)
    );
    const totalFoodNeeded = parseFloat(
      (pigStats.remainingPigs * foodPerDayPerPig).toFixed(1)
    );
    const maxQuantity = Math.min(totalFoodNeeded, food.quantityInStock);

    const possiblePigs = Math.floor(maxQuantity / foodPerDayPerPig);
    const exactFoodNeeded = calculateFoodForPigs(possiblePigs, food);

    setSelectedFood(food);
    setModalData({
      quantity: exactFoodNeeded,
      maxQuantity: parseFloat(maxQuantity.toFixed(1)),
      initialQuantity: parseFloat(maxQuantity.toFixed(1)),
      pigsCount: possiblePigs,
      note: "",
    });
    setIsModalVisible(true);
  };

  const handleAddFood = () => {
    const quantity = modalData.quantity;
    const mealsPerPig = selectedFood.mealsPerDay * selectedFood.quantityPerMeal;
    const pigsCanFeed = Math.floor(quantity / mealsPerPig);

    const newFood = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity: quantity,
      note: modalData.note,
      pigsCount: pigsCanFeed,
    };

    setSelectedFoods([...selectedFoods, newFood]);

    const remainingPigs = pigStats.remainingPigs - pigsCanFeed;
    const remainingFoodNeeded = remainingPigs * mealsPerPig;

    setPigStats((prev) => ({
      ...prev,
      remainingPigs: remainingPigs,
    }));
    setRemainingFood(remainingFoodNeeded);
    setIsModalVisible(false);
  };

  const handleSaveExport = async () => {
    try {
      const formValues = await form.validateFields();

      if (!formValues.date || !selectedArea || selectedFoods.length === 0) {
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Set dữ liệu để hiển thị trong modal xác nhận
      setExportedData({
        area: areas.find((area) => area.id === selectedArea)?.name,
        date: formValues.date.format("DD/MM/YYYY"),
        foods: selectedFoods,
        exportData: {
          exportDate: formValues.date.format("YYYY-MM-DD"),
          areaId: selectedArea,
          note: modalData.note?.trim(),
          details: selectedFoods.map((food) => ({
            foodId: food.foodId,
            quantity: food.quantity,
          })),
        },
      });

      setIsConfirmModalVisible(true);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleConfirmExport = async () => {
    try {
      setSubmitting(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/FoodExport`,
        exportedData.exportData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsConfirmModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.log(error);
      message.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFood = (foodId) => {
    const removedFood = selectedFoods.find((food) => food.foodId === foodId);
    if (removedFood) {
      const updatedRemainingPigs =
        pigStats.remainingPigs + removedFood.pigsCount;
      const updatedRemainingFood =
        updatedRemainingPigs * pigStats.mealsPerDay * pigStats.quantityPerMeal;

      setPigStats((prev) => ({
        ...prev,
        remainingPigs: updatedRemainingPigs,
      }));
      setRemainingFood(updatedRemainingFood);
    }
    setSelectedFoods(selectedFoods.filter((food) => food.foodId !== foodId));
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
        <Tag color={value > 0 ? "green" : "red"}>{value} kg</Tag>
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
      render: (_, record) => {
        const isSelected = selectedFoods.some(
          (food) => food.foodId === record.id
        );
        const hasStock = record.quantityInStock > 0;
        const hasPigs = pigStats.totalPigs > 0;
        const hasRemainingPigs = pigStats.remainingPigs > 0;

        if (!hasRemainingPigs) {
          return null;
        }

        return (
          <Button
            type="primary"
            onClick={() => handleOpenModal(record)}
            disabled={isSelected || !hasStock || !hasPigs}
          >
            {!hasStock ? "Hết hàng" : !hasPigs ? "Không có heo" : "Chọn xuất"}
          </Button>
        );
      },
    },
  ];

  const renderModal = () => (
    <Modal
      title="Xác nhận xuất thức ăn"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleAddFood}
          disabled={!modalData.quantity || modalData.quantity <= 0}
        >
          Thêm vào phiếu xuất
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Số lượng xuất (kg)">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={modalData.initialQuantity}
            value={modalData.quantity}
            onChange={(value) => {
              if (value && selectedFood) {
                if (value > modalData.initialQuantity) {
                  message.error(
                    `Không thể xuất quá ${modalData.initialQuantity}kg`
                  );
                  value = modalData.initialQuantity;
                }

                const foodPerDayPerPig = parseFloat(
                  (
                    selectedFood.mealsPerDay * selectedFood.quantityPerMeal
                  ).toFixed(1)
                );
                const possiblePigs = Math.floor(value / foodPerDayPerPig);
                const requiredFood = parseFloat(
                  (possiblePigs * foodPerDayPerPig).toFixed(1)
                );
                const nextPigFood = parseFloat(
                  ((possiblePigs + 1) * foodPerDayPerPig).toFixed(1)
                );

                if (value !== requiredFood) {
                  message.warning(
                    `Lượng thức ăn ${parseFloat(
                      value.toFixed(1)
                    )}kg không đủ cho số con nguyên. ` +
                      `Hãy nhập ${requiredFood}kg (cho ${possiblePigs} con) hoặc ` +
                      `${nextPigFood}kg (cho ${possiblePigs + 1} con)`
                  );
                }

                setModalData({
                  ...modalData,
                  quantity: value,
                  pigsCount: possiblePigs,
                  warning:
                    value !== requiredFood
                      ? {
                          current: parseFloat(value.toFixed(1)),
                          lower: requiredFood,
                          upper: nextPigFood,
                          lowerPigs: possiblePigs,
                          upperPigs: possiblePigs + 1,
                        }
                      : null,
                });
              } else {
                setModalData({
                  ...modalData,
                  quantity: 0,
                  pigsCount: 0,
                  warning: null,
                });
              }
            }}
          />
          {modalData.warning && (
            <Alert
              style={{ marginTop: 8 }}
              type="warning"
              showIcon
              message={
                `Lượng thức ăn ${modalData.warning.current}kg không đủ cho số con nguyên. ` +
                `Hãy nhập ${modalData.warning.lower}kg (cho ${modalData.warning.lowerPigs} con) hoặc ` +
                `${modalData.warning.upper}kg (cho ${modalData.warning.upperPigs} con)`
              }
            />
          )}
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              Số con heo có thể cho ăn: {modalData.pigsCount} con
            </Text>
            <br />
            {selectedFood && (
              <Text type="secondary">
                Lượng thức ăn mỗi con:{" "}
                {(
                  selectedFood.mealsPerDay * selectedFood.quantityPerMeal
                ).toFixed(1)}{" "}
                kg/ngày ({selectedFood.mealsPerDay} bữa ×{" "}
                {selectedFood.quantityPerMeal} kg/bữa)
              </Text>
            )}
          </div>
        </Form.Item>
        <Form.Item label="Ghi chú">
          <Input.TextArea
            rows={4}
            value={modalData.note}
            onChange={(e) =>
              setModalData({ ...modalData, note: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  const renderSelectedFoodsTable = () =>
    selectedFoods.length > 0 && (
      <Card title="Thức ăn đã chọn" style={{ marginBottom: 16 }}>
        <Table
          dataSource={selectedFoods}
          pagination={false}
          columns={[
            {
              title: "Tên thức ăn",
              dataIndex: "foodName",
              key: "foodName",
            },
            {
              title: "Số lượng (kg)",
              dataIndex: "quantity",
              key: "quantity",
              render: (quantity, record) => (
                <Tooltip
                  title={`Khuyến nghị: ${
                    areaFoodLimits[record.foodId]?.recommendedDaily
                  } kg/ngày`}
                >
                  <span
                    style={{
                      color:
                        quantity >
                        areaFoodLimits[record.foodId]?.recommendedDaily
                          ? "#faad14"
                          : "inherit",
                    }}
                  >
                    {quantity}
                  </span>
                </Tooltip>
              ),
            },
            {
              title: "Tồn kho",
              dataIndex: "foodId",
              key: "stock",
              render: (foodId) =>
                `${areaFoodLimits[foodId]?.maxQuantity || 0} kg`,
            },
            {
              title: "Ghi chú",
              dataIndex: "note",
              key: "note",
            },
            {
              title: "Thao tác",
              key: "action",
              render: (_, record) => (
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveFood(record.foodId)}
                >
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </Card>
    );

  // Thêm style cho chế độ in
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .ant-modal-footer,
      .ant-modal-close {
        display: none;
      }
    }
  `;

  const renderPrintContent = () => (
    <div className="print-content" style={{ padding: 24 }}>
      <style>{printStyles}</style>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        PHIẾU XUẤT THỨC ĂN
      </h2>
      <div style={{ marginBottom: 20 }}>
        <p>
          <strong>Khu vực:</strong> {exportedData?.area}
        </p>
        <p>
          <strong>Ngày xuất:</strong> {exportedData?.date}
        </p>
      </div>
      <Table
        dataSource={exportedData?.foods}
        pagination={false}
        columns={[
          {
            title: "Tên thức ăn",
            dataIndex: "foodName",
            key: "foodName",
          },
          {
            title: "Số lượng (kg)",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity) => `${quantity} kg`,
          },
          {
            title: "Số con heo",
            dataIndex: "pigsCount",
            key: "pigsCount",
            render: (pigsCount) => `${pigsCount} con`,
          },
        ]}
        summary={(pageData) => (
          <Table.Summary.Row>
            <Table.Summary.Cell>
              <strong>Tổng cộng</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <strong>
                {pageData.reduce((sum, food) => sum + food.quantity, 0)} kg
              </strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <strong>
                {pageData.reduce((sum, food) => sum + food.pigsCount, 0)} con
              </strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div
        style={{
          marginTop: 50,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>Người lập phiếu</strong>
          </p>
          <p>(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );

  // Sửa lại Modal xác nhận
  const renderConfirmModal = () => (
    <Modal
      title="Xác nhận tạo phiếu xuất"
      open={isConfirmModalVisible}
      width={800} // Tăng kích thước modal
      footer={[
        <Button
          key="print"
          icon={<FileTextOutlined />}
          onClick={() => {
            window.print();
          }}
        >
          In phiếu
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleConfirmExport}
        >
          Xác nhận
        </Button>,
        <Button key="cancel" onClick={() => setIsConfirmModalVisible(false)}>
          Hủy
        </Button>,
      ]}
      onCancel={() => setIsConfirmModalVisible(false)}
    >
      {renderPrintContent()}
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal
      title="Tạo phiếu xuất thành công"
      open={isSuccessModalVisible}
      footer={[
        <Button
          key="back"
          onClick={() => {
            setIsSuccessModalVisible(false);
          }}
        >
          Đóng
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Khu vực:</strong> {exportedData?.area}
        </p>
        <p>
          <strong>Ngày xuất:</strong> {exportedData?.date}
        </p>
      </div>
      <div>
        <strong>Danh sách thức ăn:</strong>
        <Table
          dataSource={exportedData?.foods}
          pagination={false}
          columns={[
            {
              title: "Tên thức ăn",
              dataIndex: "foodName",
              key: "foodName",
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              render: (quantity) => `${quantity} kg`,
            },
            {
              title: "Số con heo",
              dataIndex: "pigsCount",
              key: "pigsCount",
              render: (pigsCount) => `${pigsCount} con`,
            },
          ]}
          summary={(pageData) => (
            <Table.Summary.Row>
              <Table.Summary.Cell>
                <strong>Tổng cộng</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <strong>
                  {pageData.reduce((sum, food) => sum + food.quantity, 0)} kg
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <strong>
                  {pageData.reduce((sum, food) => sum + food.pigsCount, 0)} con
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Xuất Thức Ăn</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={() => navigate("/feed-manager/exports/daily-food-history")}
          >
            Lịch sử xuất thức ăn
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card>
            <Form form={form} layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
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
                      disabled // Disable để không cho thay đổi ngày
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="area"
                    label="Khu vực"
                    rules={[
                      { required: true, message: "Vui lòng chọn khu vực!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn khu vực"
                      style={{ width: "100%" }}
                      onChange={handleAreaChange}
                    >
                      {areas.map((area) => (
                        <Option key={area.id} value={area.id}>
                          {area.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {/* Thêm thông tin thống kê */}
            {selectedArea && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title={<Text strong>Tổng số heo</Text>}
                      value={pigStats.totalPigs}
                      suffix="con"
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title={<Text strong>Số heo còn lại</Text>}
                      value={pigStats.remainingPigs}
                      suffix="con"
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* Bảng thức ăn */}
            {selectedArea && Array.isArray(foodList) && (
              <Table
                columns={columns}
                dataSource={foodList}
                rowKey="id"
                pagination={false}
              />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="Thức ăn đã chọn"
            extra={
              <Button
                type="primary"
                onClick={handleSaveExport}
                disabled={selectedFoods.length === 0}
                loading={submitting}
              >
                Tạo phiếu xuất
              </Button>
            }
            style={{ position: "sticky", top: 24 }}
          >
            {selectedFoods.length > 0 ? (
              <>
                <Table
                  dataSource={selectedFoods}
                  pagination={false}
                  columns={[
                    {
                      title: "Tên thức ăn",
                      dataIndex: "foodName",
                      key: "foodName",
                      width: "40%",
                    },
                    {
                      title: "SL (kg)",
                      dataIndex: "quantity",
                      key: "quantity",
                      width: "30%",
                      render: (quantity, record) => (
                        <span
                          style={{
                            color:
                              quantity >
                              areaFoodLimits[record.foodId]?.recommendedDaily
                                ? "#faad14"
                                : "inherit",
                          }}
                        >
                          {quantity} kg
                        </span>
                      ),
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: "30%",
                      render: (_, record) => (
                        <Button
                          type="link"
                          danger
                          onClick={() => handleRemoveFood(record.foodId)}
                        >
                          Xóa
                        </Button>
                      ),
                    },
                  ]}
                />
                <Divider />
                <div style={{ textAlign: "right" }}>
                  <Text strong>Tổng số loại: </Text>
                  <Text>{selectedFoods.length}</Text>
                  <br />
                  <Text strong>Tổng khối lượng: </Text>
                  <Text>
                    {selectedFoods.reduce(
                      (sum, food) => sum + food.quantity,
                      0
                    )}{" "}
                    kg
                  </Text>
                </div>
              </>
            ) : (
              <Empty description="Chưa có thức ăn được chọn" />
            )}
          </Card>
        </Col>
      </Row>
      {renderModal()}
      {renderConfirmModal()}
      {renderSuccessModal()}
    </div>
  );
};

export default DailyFoodExport;
