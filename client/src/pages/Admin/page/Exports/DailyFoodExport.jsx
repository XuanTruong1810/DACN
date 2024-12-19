/* eslint-disable react-hooks/exhaustive-deps */
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
  Result,
  Badge,
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
  });
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [exportedData, setExportedData] = useState(null);

  // Sửa lại useEffect khởi tạo
  useEffect(() => {
    const fetchInitialData = async () => {
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

        // Chỉ set khu vực mặc định khi lần đầu load
        if (response.data.data.items.length > 0 && !selectedArea) {
          const firstArea = response.data.data.items[0];
          setSelectedArea(firstArea.id);
          form.setFieldsValue({
            area: firstArea.id,
            date: moment(),
          });

          // Fetch initial data for first area
          await fetchAreaData(firstArea.id);
        }
      } catch (error) {
        message.error("Không thể tải danh sách khu vực");
      }
    };

    fetchInitialData();
  }, []); // Chỉ chạy một lần khi component mount

  // Sửa lại hàm tính toán thức ăn tự động
  const calculateAutoFoodDistribution = (foodList, totalPigs) => {
    if (!foodList || !totalPigs) return [];

    const distributedFoods = [];

    foodList.forEach((food) => {
      // Chỉ tính toán cho những thức ăn còn trong kho
      if (food.quantityInStock > 0) {
        const foodPerDayPerPig = food.quantityPerMeal;
        const totalFoodNeeded = parseFloat(
          (totalPigs * foodPerDayPerPig).toFixed(1)
        );

        // Chỉ thêm vào danh sách nếu còn đủ trong kho
        distributedFoods.push({
          foodId: food.id,
          foodName: food.name,
          quantity: totalFoodNeeded,
          pigsCount: totalPigs,
          note: `Phân bổ cho ${totalPigs} con (${foodPerDayPerPig} kg/con)`,
        });
      }
    });

    return distributedFoods;
  };

  // Sửa lại hàm fetchAreaData để sử dụng logic mới
  const fetchAreaData = async (areaId) => {
    try {
      // Lấy thông tin heo trong khu vực
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
        totalPigs: totalPigs,
      });

      // Fetch thức ăn cho khu vực được chọn
      const foodResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Food?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const foodList = foodResponse.data.data.items || [];
      setFoodList(foodList);

      // Tự động tính toán và phân bổ thức ăn cho tất cả heo
      const distributedFoods = calculateAutoFoodDistribution(
        foodList,
        totalPigs
      );
      setSelectedFoods(distributedFoods);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    }
  };

  // Sửa lại hàm handleAreaChange
  const handleAreaChange = async (areaId) => {
    setSelectedArea(areaId);
    setSelectedFoods([]); // Reset selected foods
    await fetchAreaData(areaId);
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

    const remainingPigs = pigStats.totalPigs - pigsCanFeed;
    const remainingFoodNeeded = remainingPigs * mealsPerPig;

    setPigStats((prev) => ({
      ...prev,
      totalPigs: remainingPigs,
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

      setIsConfirmModalVisible(true);
    } catch (error) {
      console.error("Error:", error);
      message.error("Vui lòng kiểm tra l���i thông tin!");
    }
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const formValues = await form.validateFields();

      const exportData = {
        exportDate: formValues.date.toISOString(),
        areaId: selectedArea,
        note: `Phiếu xuất thức ăn ngày ${formValues.date.format("DD/MM/YYYY")}`,
        details: selectedFoods.map((food) => ({
          foodId: food.foodId,
          quantity: food.quantity,
        })),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/FoodExport`,
        exportData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setExportedData(response.data.data);
        setIsConfirmModalVisible(false);
        message.success("Tạo phiếu xuất thành công!");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {text}
          {record.quantityInStock <= 0 ? (
            <Badge status="error" text="Hết hàng" />
          ) : (
            <Badge status="success" text="Còn hàng" />
          )}
        </Space>
      ),
    },
    {
      title: "Số lượng tồn",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      render: (quantity) => (
        <Text type={quantity <= 0 ? "danger" : undefined}>{quantity} kg</Text>
      ),
    },
    {
      title: "Số bữa/ngày",
      dataIndex: "mealsPerDay",
      key: "mealsPerDay",
      render: (meals) => (
        <Badge
          count={`${meals} bữa`}
          style={{
            backgroundColor: "#108ee9",
            fontSize: "12px",
            padding: "0 8px",
          }}
        />
      ),
    },
    {
      title: "Định mức/bữa",
      dataIndex: "quantityPerMeal",
      key: "quantityPerMeal",
      render: (quantity, record) => (
        <Badge
          count={`${(quantity / record.mealsPerDay).toFixed(1)} kg`}
          style={{
            backgroundColor: "#87d068",
            fontSize: "12px",
            padding: "0 8px",
          }}
        />
      ),
    },
    {
      title: "Tổng định mức/ngày",
      key: "totalPerDay",
      render: (_, record) => (
        <Badge
          count={`${record.quantityPerMeal.toFixed(1)} kg`}
          style={{
            backgroundColor: "#722ed1",
            fontSize: "12px",
            padding: "0 8px",
          }}
        />
      ),
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
                    `Lượng th��c ăn ${parseFloat(
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
                `Lư���ng thức ăn ${modalData.warning.current}kg không đủ cho số con nguyên. ` +
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

  const renderSelectedFoodsTable = () => (
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
          title: "SL (kg)",
          dataIndex: "quantity",
          key: "quantity",
          render: (value) => `${parseFloat(value.toFixed(2))} kg`,
        },
      ]}
      summary={(pageData) => (
        <Table.Summary.Row>
          <Table.Summary.Cell>
            <strong>Tổng cộng</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <strong>
              {parseFloat(
                pageData
                  .reduce((sum, food) => sum + food.quantity, 0)
                  .toFixed(2)
              )}{" "}
              kg
            </strong>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
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

  // Sa lại Modal xác nhận
  const renderConfirmModal = () => {
    return (
      <Modal
        title="Xác nhận tạo phiếu xuất thức ăn"
        open={isConfirmModalVisible}
        footer={[
          <Button key="print" icon={<FileTextOutlined />} onClick={handlePrint}>
            In phiếu
          </Button>,
          <Button key="cancel" onClick={() => setIsConfirmModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>,
        ]}
        width={600}
      >
        <div>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card>
                <Statistic
                  title={<Text strong>Tổng số heo</Text>}
                  value={pigStats.totalPigs}
                  suffix="con"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

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
                render: (quantity) => `${quantity} kg`,
              },
            ]}
            summary={(pageData) => (
              <Table.Summary.Row>
                <Table.Summary.Cell>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong>
                    {parseFloat(
                      pageData
                        .reduce((sum, food) => sum + food.quantity, 0)
                        .toFixed(1)
                    )}{" "}
                    kg
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      </Modal>
    );
  };

  // Thêm hàm handlePrint
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Phiếu Xuất Thức Ăn</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 24px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 20px 0;
              text-align: center;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              min-width: 150px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f8f8f8;
            }
            .footer {
              margin-top: 50px;
              text-align: right;
            }
            .signature-section {
              display: inline-block;
              text-align: center;
              margin-left: 50px;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 60px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">TRANG TRẠI CHĂN NUÔI NTNPIGFARM</div>
              <div>Địa chỉ: Số 2, đường N1, khu dân cư phục vụ tái định cư, khu phố Nhị Hòa, phường Hiệp Hòa, thành phố Biên Hòa, tỉnh Đồng Nai</div>
              <div>Điện thoại: 0971758902 - Email: truongtamcobra@gmail.com</div>
            </div>

            <div class="document-title">PHIẾU XUẤT THỨC ĂN</div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Ngày xuất:</span>
                <span>${moment().format("DD/MM/YYYY")}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Khu vực:</span>
                <span>${areas.find((a) => a.id === selectedArea)?.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tổng số heo:</span>
                <span>${pigStats.totalPigs} con</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">STT</th>
                  <th>Tên thức ăn</th>
                  <th style="width: 120px;">Số lượng (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${selectedFoods
                  .map(
                    (food, index) => `
                  <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${food.foodName}</td>
                    <td style="text-align: right;">${food.quantity.toFixed(
                      1
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">Tổng cộng:</td>
                  <td style="text-align: right;">${parseFloat(
                    selectedFoods
                      .reduce((sum, food) => sum + food.quantity, 0)
                      .toFixed(1)
                  )}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <div class="signature-section">
                <div class="signature-title">Người lập phiếu</div>
                <div>(Ký và ghi rõ họ tên)</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Sửa lại renderSuccessModal để sử dụng hàm handlePrint mới
  const renderSuccessModal = () => {
    return (
      <Modal
        title="Tạo phiếu xuất thành công"
        open={isSuccessModalVisible}
        footer={[
          <Button
            key="print"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handlePrint}
          >
            In phiếu xuất
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setIsSuccessModalVisible(false);
              form.resetFields(["date"]);
              setSelectedFoods([]);
              fetchAreaData(selectedArea);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <Result
          status="success"
          title="Tạo phiếu xuất thành công!"
          subTitle={`Mã phiếu xuất: ${exportedData?.id}`}
        />
      </Modal>
    );
  };

  // Thêm useEffect để theo dõi selectedFoods
  useEffect(() => {
    console.log("selectedFoods changed:", selectedFoods);
  }, [selectedFoods]);

  // Kiểm tra render của bảng thức ăn đã chọn
  console.log("Rendering selected foods table:", selectedFoods);

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
                      placeholder="Ch���n khu vực"
                      style={{ width: "100%" }}
                      onChange={handleAreaChange}
                      value={selectedArea}
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
                <Col span={24}>
                  <Card>
                    <Statistic
                      title={<Text strong>Tổng số heo</Text>}
                      value={pigStats.totalPigs}
                      suffix="con"
                      valueStyle={{ color: "#1890ff" }}
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
            title="Danh sách thức ăn để xuất"
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
                  ]}
                />
                <Divider />
                <div style={{ textAlign: "right" }}>
                  <Text strong>Tổng số loại: </Text>
                  <Text>{selectedFoods.length}</Text>
                  <br />
                  <Text strong>Tổng khối lượng: </Text>
                  <Text>
                    {parseFloat(
                      selectedFoods
                        .reduce((sum, food) => sum + food.quantity, 0)
                        .toFixed(2)
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
