import React, { useState, useEffect } from "react";
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
  Input,
  Space,
  Divider,
  Badge,
  Tooltip,
  Radio,
  Modal,
  Descriptions,
} from "antd";
import {
  SaveOutlined,
  PrinterOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  TeamOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const DailyFoodExport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    save: false,
    print: false,
  });
  const [areas, setAreas] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFoodsByArea, setSelectedFoodsByArea] = useState({
    // area1: [foodId1, foodId2],
    // area2: [foodId3, foodId4],
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data cho 3 khu vực
  useEffect(() => {
    setAreas([
      {
        id: 1,
        name: "Khu A - Khu vực chăn nuôi heo mới nhập chuồng",
        totalPigs: 95,
        foodList: [
          {
            id: 1,
            name: "Thức ăn heo con tập ăn",
            type: "Heo con",
            unit: "kg",
            stock: 1000,
            recommendedPerPig: 0.5,
            totalRequired: 47.5, // 95 con * 0.5kg
            status: "active",
          },
          {
            id: 2,
            name: "Thức ăn heo con cai sữa",
            type: "Heo con",
            unit: "kg",
            stock: 800,
            recommendedPerPig: 0.8,
            totalRequired: 76, // 95 con * 0.8kg
            status: "active",
          },
          {
            id: 3,
            name: "Thức ăn heo con phát triển",
            type: "Heo con",
            unit: "kg",
            stock: 500,
            recommendedPerPig: 1.0,
            totalRequired: 95, // 95 con * 1.0kg
            status: "active",
          },
        ],
      },
      {
        id: 2,
        name: "Khu B - Khu vực chăn nuôi heo từ 20 đến 30kg",
        totalPigs: 150,
        foodList: [
          {
            id: 4,
            name: "Thức ăn heo thịt tăng trọng",
            type: "Heo thịt",
            unit: "kg",
            stock: 2000,
            recommendedPerPig: 2.2,
            totalRequired: 330, // 150 con * 2.2kg
            status: "active",
          },
          {
            id: 5,
            name: "Thức ăn heo thịt hoàn thiện",
            type: "Heo thịt",
            unit: "kg",
            stock: 1500,
            recommendedPerPig: 2.5,
            totalRequired: 375, // 150 con * 2.5kg
            status: "active",
          },
          {
            id: 6,
            name: "Thức ăn heo thịt cao đạm",
            type: "Heo thịt",
            unit: "kg",
            stock: 1200,
            recommendedPerPig: 2.3,
            totalRequired: 345, // 150 con * 2.3kg
            status: "active",
          },
        ],
      },
      {
        id: 3,
        name: "Khu C - Khu vực chăn nuôi heo từ 30 đến 70kg",
        totalPigs: 200,
        foodList: [
          {
            id: 7,
            name: "Thức ăn heo thịt tăng trọng",
            type: "Heo thịt",
            unit: "kg",
            stock: 800,
            recommendedPerPig: 0.5,
            totalRequired: 100, // 200 con * 0.5kg
            status: "active",
          },
          {
            id: 8,
            name: "Thức ăn heo thịt tăng trọng cao cấp",
            type: "Heo thịt",
            unit: "kg",
            stock: 1000,
            recommendedPerPig: 0.8,
            totalRequired: 160, // 200 con * 0.8kg
            status: "active",
          },
          {
            id: 9,
            name: "Thức ăn heo thịt cao cấp",
            type: "Heo thịt",
            unit: "kg",
            stock: 900,
            recommendedPerPig: 1.0,
            totalRequired: 200, // 200 con * 1.0kg
            status: "active",
          },
        ],
      },
    ]);
  }, []);

  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
    const area = areas.find((a) => a.id === areaId);
    if (area) {
      setFoodList(area.foodList);
    }
  };

  const handleFoodSelect = (foodId, selected) => {
    setSelectedFoodsByArea((prev) => ({
      ...prev,
      [selectedArea]: selected
        ? [...(prev[selectedArea] || []), foodId]
        : (prev[selectedArea] || []).filter((id) => id !== foodId),
    }));
  };

  const isFoodSelected = (foodId) => {
    return selectedFoodsByArea[selectedArea]?.includes(foodId) || false;
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
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
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
      width: "25%",
      filterable: true,
      ...getColumnSearchProps("name"),
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: "15%",
      filters: [
        { text: "Heo nái mang thai", value: "Heo nái mang thai" },
        { text: "Heo nái nuôi con", value: "Heo nái nuôi con" },
        { text: "Heo thịt", value: "Heo thịt" },
        { text: "Heo con", value: "Heo con" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const colors = {
          "Heo nái mang thai": "magenta",
          "Heo nái nuôi con": "purple",
          "Heo thịt": "blue",
          "Heo con": "green",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "Định mức/con",
      dataIndex: "recommendedPerPig",
      key: "recommendedPerPig",
      width: "15%",
      sorter: (a, b) => a.recommendedPerPig - b.recommendedPerPig,
      render: (value, record) => (
        <Tooltip title="Định mức khuyến nghị cho mỗi con/ngày">
          <Tag color="blue">
            {value} {record.unit}/con
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: "15%",
      filters: [
        { text: "Đủ hàng", value: "sufficient" },
        { text: "Sắp hết", value: "low" },
        { text: "Hết hàng", value: "out" },
      ],
      onFilter: (value, record) => {
        if (value === "sufficient") return record.stock >= record.totalRequired;
        if (value === "low")
          return record.stock < record.totalRequired && record.stock > 0;
        if (value === "out") return record.stock === 0;
      },
      render: (value, record) => {
        const status =
          value >= record.totalRequired
            ? "success"
            : value > 0
            ? "warning"
            : "error";
        const statusText = {
          success: "Đủ",
          warning: "Sắp hết",
          error: "Hết hàng",
        };
        return (
          <Space>
            <Badge status={status} text={`${value} ${record.unit}`} />
            <Tag
              color={
                status === "success"
                  ? "green"
                  : status === "warning"
                  ? "orange"
                  : "red"
              }
            >
              {statusText[status]}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Số lượng xuất",
      dataIndex: "totalRequired",
      key: "totalRequired",
      width: "15%",
      sorter: (a, b) => a.totalRequired - b.totalRequired,
      render: (value, record) => (
        <Tag color="cyan" style={{ fontSize: "14px" }}>
          {value} {record.unit}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => {
        const isSelected = isFoodSelected(record.id);
        return (
          <Space>
            <Tooltip title={isSelected ? "Bỏ chọn" : "Chọn thức ăn này"}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  type={isSelected ? "primary" : "default"}
                  onClick={() => handleFoodSelect(record.id, !isSelected)}
                  icon={
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isSelected ? "check" : "plus"}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isSelected ? <CheckOutlined /> : <PlusOutlined />}
                      </motion.div>
                    </AnimatePresence>
                  }
                  style={{
                    background: isSelected
                      ? "linear-gradient(45deg, #1890ff, #40a9ff)"
                      : "#fff",
                    border: "none",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(24,144,255,0.3)"
                      : "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <motion.span
                    key={isSelected ? "selected" : "select"}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSelected ? "Đã chọn" : "Chọn"}
                  </motion.span>
                </Button>
              </motion.div>
            </Tooltip>

            <Tooltip title="Xem chi tiết">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 360,
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={() => {
                    message.info(`Xem chi tiết ${record.name}`);
                  }}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8c8c8c",
                  }}
                />
              </motion.div>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const summaryColumns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      width: "20%",
    },
    {
      title: "Số lượng heo",
      dataIndex: "pigCount",
      key: "pigCount",
      width: "15%",
      render: (count) => `${count} con`,
    },
    {
      title: "Thức ăn",
      dataIndex: "foodName",
      key: "foodName",
      width: "25%",
    },
    {
      title: "Định mức/con",
      dataIndex: "recommendedPerPig",
      key: "recommendedPerPig",
      width: "15%",
      render: (value, record) => `${value} ${record.unit}/con`,
    },
    {
      title: "Tổng xuất",
      dataIndex: "totalRequired",
      key: "totalRequired",
      width: "15%",
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => {
            setSelectedFoodsByArea((prev) => ({
              ...prev,
              [record.areaId]: prev[record.areaId].filter(
                (id) => id !== record.foodId
              ),
            }));
          }}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const getSummaryData = () => {
    const summaryData = [];

    Object.entries(selectedFoodsByArea).forEach(([areaId, foodIds]) => {
      const area = areas.find((a) => a.id === Number(areaId));
      if (area) {
        foodIds.forEach((foodId) => {
          const food = area.foodList.find((f) => f.id === foodId);
          if (food) {
            summaryData.push({
              key: `${areaId}-${foodId}`,
              foodId: food.id,
              areaId: Number(areaId),
              areaName: area.name,
              pigCount: area.totalPigs,
              foodName: food.name,
              recommendedPerPig: food.recommendedPerPig,
              unit: food.unit,
              totalRequired: food.totalRequired,
            });
          }
        });
      }
    });

    return summaryData;
  };

  const FilterSection = () => (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc tìm kiếm</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input.Search
            placeholder="Tìm kiếm theo tên thức ăn"
            allowClear
            enterButton
            onSearch={(value) => setSearchText(value)}
            style={{ width: "100%" }}
          />
        </Col>

        <Col span={12}>
          <Card size="small" title="Loại thức ăn">
            <Radio.Group
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio.Button
                  value="all"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <span>Tất cả</span>
                    <Tag>{foodList.length}</Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="nai"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <span>Heo nái</span>
                    <Tag color="magenta">
                      {
                        foodList.filter((f) => f.type.includes("Heo nái"))
                          .length
                      }
                    </Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="thit"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <span>Heo thịt</span>
                    <Tag color="blue">
                      {foodList.filter((f) => f.type === "Heo thịt").length}
                    </Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="con"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <span>Heo con</span>
                    <Tag color="green">
                      {foodList.filter((f) => f.type === "Heo con").length}
                    </Tag>
                  </Space>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Tình trạng tồn kho">
            <Radio.Group
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio.Button
                  value="all"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <span>Tất cả</span>
                    <Tag>{foodList.length}</Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="available"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <Badge status="success" />
                    <span>Còn hàng</span>
                    <Tag color="green">
                      {
                        foodList.filter((f) => f.stock >= f.totalRequired)
                          .length
                      }
                    </Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="low"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <Badge status="warning" />
                    <span>Sắp hết</span>
                    <Tag color="orange">
                      {
                        foodList.filter(
                          (f) => f.stock < f.totalRequired && f.stock > 0
                        ).length
                      }
                    </Tag>
                  </Space>
                </Radio.Button>
                <Radio.Button
                  value="out"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <Space>
                    <Badge status="error" />
                    <span>Hết hàng</span>
                    <Tag color="red">
                      {foodList.filter((f) => f.stock === 0).length}
                    </Tag>
                  </Space>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Card>
        </Col>
      </Row>

      {/* Hiển thị đã chọn */}
      {Object.keys(selectedFoodsByArea).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Divider orientation="left">Đã chọn</Divider>
          <Row gutter={[16, 16]}>
            {Object.entries(selectedFoodsByArea).map(([areaId, foodIds]) => {
              const area = areas.find((a) => a.id === Number(areaId));
              if (!area || !foodIds.length) return null;

              return (
                <Col span={8} key={areaId}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        {area.name}
                        <Tag color="blue">{area.totalPigs} con</Tag>
                      </Space>
                    }
                  >
                    {foodIds.map((foodId) => {
                      const food = area.foodList.find((f) => f.id === foodId);
                      if (!food) return null;

                      return (
                        <div key={foodId} style={{ marginBottom: 8 }}>
                          <Space>
                            <Tag color="processing">{food.name}</Tag>
                            <Tag>
                              {food.totalRequired} {food.unit}
                            </Tag>
                            <Button
                              type="link"
                              danger
                              size="small"
                              onClick={() => handleFoodSelect(foodId, false)}
                            >
                              Xóa
                            </Button>
                          </Space>
                        </div>
                      );
                    })}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </Card>
  );

  const getFilteredData = () => {
    return foodList.filter((food) => {
      // Filter theo tìm kiếm
      const matchSearch =
        food.name.toLowerCase().includes(searchText.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchText.toLowerCase());

      // Filter theo loại thức ăn
      const matchType =
        foodTypeFilter === "all"
          ? true
          : (foodTypeFilter === "nai" && food.type.includes("Heo nái")) ||
            (foodTypeFilter === "thit" && food.type === "Heo thịt") ||
            (foodTypeFilter === "con" && food.type === "Heo con");

      // Filter theo tồn kho
      const matchStock =
        stockFilter === "all"
          ? true
          : (stockFilter === "available" && food.stock >= food.totalRequired) ||
            (stockFilter === "low" &&
              food.stock < food.totalRequired &&
              food.stock > 0) ||
            (stockFilter === "out" && food.stock === 0);

      return matchSearch && matchType && matchStock;
    });
  };

  // Columns cho bảng trong modal
  const exportModalColumns = [
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      width: "20%",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Tag color="blue">{record.pigCount} con</Tag>
        </Space>
      ),
    },
    {
      title: "Thức ăn",
      dataIndex: "foodName",
      key: "foodName",
      width: "25%",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          <Tag color="cyan">{record.type}</Tag>
        </Space>
      ),
    },
    {
      title: "Định mức/con",
      dataIndex: "recommendedPerPig",
      key: "recommendedPerPig",
      width: "15%",
      render: (value, record) => `${value} ${record.unit}/con`,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: "15%",
      render: (value, record) => (
        <Tag color={value >= record.totalRequired ? "green" : "red"}>
          {value} {record.unit}
        </Tag>
      ),
    },
    {
      title: "Số lượng xuất",
      dataIndex: "totalRequired",
      key: "totalRequired",
      width: "15%",
      render: (value, record) => (
        <Text strong>
          {value} {record.unit}
        </Text>
      ),
    },
  ];

  // Modal hiển thị phiếu xuất
  const ExportModal = () => {
    const summaryData = getSummaryData();
    const totalAmount = summaryData.reduce(
      (sum, item) => sum + item.totalRequired,
      0
    );
    const exportDate = form.getFieldValue("date")?.format("DD/MM/YYYY");

    return (
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Phiếu xuất thức ăn</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              message.success("Đã gửi lệnh in phiếu xuất!");
            }}
          >
            In phiếu xuất
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Ngày xuất" span={1.5}>
              {exportDate || "Chưa chọn ngày"}
            </Descriptions.Item>
            <Descriptions.Item label="Số khu vực" span={1.5}>
              {Object.keys(selectedFoodsByArea).length} khu vực
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số lượng xuất" span={3}>
              <Text strong>{totalAmount} kg</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Table
          columns={exportModalColumns}
          dataSource={summaryData}
          pagination={false}
          bordered
          size="small"
          summary={(pageData) => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>{totalAmount} kg</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>
    );
  };

  // Hàm xử lý lưu phiếu xuất
  const handleSave = async () => {
    if (Object.keys(selectedFoodsByArea).length === 0) {
      message.warning("Vui lòng chọn ít nhất một loại thức ăn!");
      return;
    }

    const formValues = form.getFieldsValue();
    if (!formValues.date || !formValues.area) {
      message.warning("Vui lòng chọn đầy đủ ngày xuất và khu vực!");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, save: true }));

      // Chuẩn bị dữ liệu để lưu
      const exportData = {
        date: formValues.date.format("YYYY-MM-DD"),
        areaId: formValues.area,
        foods: Object.entries(selectedFoodsByArea)
          .map(([areaId, foodIds]) => {
            const area = areas.find((a) => a.id === Number(areaId));
            return foodIds.map((foodId) => {
              const food = area.foodList.find((f) => f.id === foodId);
              return {
                foodId,
                quantity: food.totalRequired,
                unit: food.unit,
              };
            });
          })
          .flat(),
      };

      // TODO: Gọi API lưu dữ liệu
      console.log("Dữ liệu xuất:", exportData);

      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Đã lưu phiếu xuất thành công!");

      // Có thể thêm logic reset form hoặc chuyển trang ở đây
    } catch (error) {
      console.error("Lỗi khi lưu phiếu xuất:", error);
      message.error("Có lỗi xảy ra khi lưu phiếu xuất!");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Hàm xử lý in phiếu xuất
  const handlePrint = async () => {
    try {
      setLoading((prev) => ({ ...prev, print: true }));

      // Giả lập quá trình in
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Đã gửi lệnh in phiếu xuất!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi in phiếu!");
    } finally {
      setLoading((prev) => ({ ...prev, print: false }));
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: "16px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, marginBottom: "4px" }}>
                <Space>
                  <FileTextOutlined style={{ color: "#1890ff" }} />
                  Xuất thức ăn hằng ngày
                </Space>
              </Title>
              <Text type="secondary">
                Quản lý xuất thức ăn theo khu vực và định mức cho từng loại heo
              </Text>
            </Col>
          </Row>
        </div>

        {/* Form Section */}
        <Card
          bordered={false}
          style={{
            background: "#fafafa",
            borderRadius: "8px",
            marginBottom: "16px",
            padding: "16px",
          }}
        >
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="date"
                  label={
                    <Space>
                      <CalendarOutlined />
                      <span>Ngày xuất</span>
                    </Space>
                  }
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
              <Col span={10}>
                <Form.Item
                  name="area"
                  label={
                    <Space>
                      <ApartmentOutlined />
                      <span>Khu vực</span>
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn khu vực!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn khu vực"
                    onChange={handleAreaChange}
                    allowClear
                    style={{ width: "100%" }}
                  >
                    {areas.map((area) => (
                      <Option key={area.id} value={area.id}>
                        <Space>
                          <span>{area.name}</span>
                          <Tag color="blue">{area.totalPigs} con</Tag>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Table Section */}
        {selectedArea && (
          <div style={{ marginBottom: "16px" }}>
            <Table
              columns={columns}
              dataSource={foodList}
              pagination={false}
              rowKey="id"
              bordered
              style={{
                background: "white",
                borderRadius: "8px",
                overflow: "hidden",
              }}
              title={() => (
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    background: "#fafafa",
                  }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space size="large">
                        <Text strong style={{ fontSize: "16px" }}>
                          Danh sách thức ăn cho:{" "}
                          {areas.find((a) => a.id === selectedArea)?.name}
                        </Text>
                        <Tag color="blue" style={{ padding: "4px 12px" }}>
                          <Space>
                            <TeamOutlined />
                            {
                              areas.find((a) => a.id === selectedArea)
                                ?.totalPigs
                            }{" "}
                            con
                          </Space>
                        </Tag>
                      </Space>
                    </Col>
                  </Row>
                </div>
              )}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            marginTop: "16px",
            textAlign: "right",
            padding: "12px 0 0",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Space size="middle">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setIsModalVisible(true)}
              disabled={Object.keys(selectedFoodsByArea).length === 0}
              loading={loading.print}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "6px",
              }}
            >
              Xem phiếu xuất
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={Object.keys(selectedFoodsByArea).length === 0}
              loading={loading.save}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "6px",
              }}
            >
              Lưu phiếu xuất
            </Button>
          </Space>
        </div>

        {/* Modal Component */}
        <ExportModal />
      </Card>
    </div>
  );
};

// Thêm CSS toàn cục
const GlobalStyle = createGlobalStyle`
  .ant-select-selector {
    border-radius: 6px !important;
  }
  
  .ant-picker {
    border-radius: 6px !important;
  }

  .ant-table {
    border-radius: 8px;
  }

  .ant-table-title {
    border-radius: 8px 8px 0 0;
  }

  .ant-table-container {
    border-radius: 8px;
  }

  .ant-card {
    border-radius: 8px;
  }

  .ant-btn {
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
  }

  .ant-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .ant-btn-primary {
    background: linear-gradient(to right, #1890ff, #40a9ff);
  }

  .ant-btn-primary:hover {
    background: linear-gradient(to right, #40a9ff, #69c0ff);
  }

  .ant-tag {
    border-radius: 4px;
  }

  .ant-tooltip {
    font-size: 12px;
  }

  .action-button {
    position: relative;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s ease-out, height 0.6s ease-out;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      &::before {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }

    &:active {
      transform: translateY(1px);
    }

    &.selected {
      background: linear-gradient(45deg, #1890ff, #40a9ff);
      border: none;
      color: white;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
        animation: shine 2s infinite;
      }
    }
  }

  .info-button {
    position: relative;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    overflow: hidden;
    color: #8c8c8c;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.04);
      transform: scale(0);
      border-radius: 50%;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover {
      color: #1890ff;
      transform: rotate(360deg);
      
      &::before {
        transform: scale(1);
      }
    }

    &:active {
      transform: rotate(360deg) scale(0.95);
    }
  }

  @keyframes shine {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }
`;

export default DailyFoodExport;
