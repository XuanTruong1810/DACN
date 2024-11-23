import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Space,
  Divider,
  Alert,
  Typography,
  Steps,
  Badge,
  Tooltip,
  message,
  Row,
  Col,
  DatePicker,
  Descriptions,
  Statistic,
  Progress,
} from "antd";
import {
  SwapOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  DashboardOutlined,
  CloudOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { WiThermometer, WiHumidity } from "react-icons/wi";

const { Title, Text } = Typography;
const { Option } = Select;

const MoveHouse = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSourceArea, setSelectedSourceArea] = useState(null);
  const [selectedPigs, setSelectedPigs] = useState([]);
  const [filteredPigs, setFilteredPigs] = useState([]);
  const [targetHouseInfo, setTargetHouseInfo] = useState(null);
  const [capacityError, setCapacityError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moveRecords, setMoveRecords] = useState([]);
  const [areas, setAreas] = useState([]);
  const [houses, setHouses] = useState({});
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const areasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/Areas`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Areas:", areasResponse.data.data);
        setAreas(areasResponse.data.data.items);

        const housesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Houses:", housesResponse.data.data);
        const housesData = housesResponse.data.data.items.reduce(
          (acc, house) => {
            if (!acc[house.areaId]) {
              acc[house.areaId] = [];
            }
            acc[house.areaId].push({
              id: house.id,
              name: house.name,
              capacity: house.capacity,
              currentQuantity: house.currentQuantity,
            });
            return acc;
          },
          {}
        );
        setHouses(housesData);

        const moveResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/MovePig`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              page: 1,
              pageSize: 10,
            },
          }
        );
        console.log("Move records:", moveResponse.data.data);
        setMoveRecords(moveResponse.data.data);
      } catch (error) {
        console.log("Error:", error);
        // message.error("Không thể tải dữ liệu ban đầu!");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const moveRecordColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Ngày chuyển",
      dataIndex: "moveDate",
      key: "moveDate",
      width: 120,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Từ khu",
      dataIndex: "fromArea",
      key: "fromArea",
      width: 100,
      render: (area) => <Tag color="blue">Khu {area}</Tag>,
    },
    {
      title: "Đến khu",
      dataIndex: "toArea",
      key: "toArea",
      width: 100,
      render: (area) => <Tag color="green">Khu {area}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "totalPigs",
      key: "totalPigs",
      width: 100,
      render: (totalPigs) => (
        <Badge
          count={totalPigs}
          showZero
          style={{
            backgroundColor: "#52c41a",
            fontSize: "14px",
            minWidth: "45px",
            height: "22px",
            lineHeight: "22px",
          }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;

        switch (status?.toLowerCase()) {
          case "completed":
            color = "success";
            text = "Hoàn thành";
            break;
          case "pending":
            color = "processing";
            text = "Đang xử lý";
            break;
          case "cancelled":
            color = "error";
            text = "Đã hủy";
            break;
          default:
            break;
        }

        return <Badge status={color} text={text} />;
      },
    },

    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <Tooltip title="Hủy phiếu">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleCancelMove(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const pigColumns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
      width: 120,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      width: 120,
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      width: 120,
      render: (weight) => <Tag color="blue">{weight} kg</Tag>,
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;

        switch (status?.toLowerCase()) {
          case "good":
            color = "success";
            text = "Khỏe mạnh";
            break;
          case "normal":
            color = "processing";
            text = "Bình thường";
            break;
          case "sick":
            color = "error";
            text = "Bệnh";
            break;
          default:
            break;
        }

        return <Badge status={color} text={text} />;
      },
    },
    {
      title: "Tình trạng tiêm",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      width: 120,
      render: (status) => (
        <Tag color={status === "Đã tiêm" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (record) => {
        const isVaccinated = record.vaccinationStatus === "Đã tiêm";
        const isWeightQualified = checkWeightQualified(
          record.weight,
          record.areaId
        );

        return (
          <Space direction="vertical" size={0}>
            {isVaccinated && isWeightQualified ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đạt chuẩn
              </Tag>
            ) : (
              <Tag color="warning" icon={<WarningOutlined />}>
                Chưa đạt
              </Tag>
            )}
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {!isVaccinated && "Chưa tiêm đủ"}
              {!isWeightQualified && "Chưa đủ cân nặng"}
            </Text>
          </Space>
        );
      },
    },
  ];

  const checkPigEligibility = (pig, targetArea) => {
    if (!targetArea) return false;

    const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
    const weight = pig.weight;
    console.log("Weight:", weight);

    switch (targetArea) {
      case "AREA0002": // Khu B
        if (!isVaccinated) {
          pig.ineligibleReason = "Chưa tiêm đủ vaccine";
          return false;
        }
        if (weight < 30 || weight >= 80) {
          pig.ineligibleReason = "Cân nặng không phù hợp (yêu cầu: 30-80kg)";
          return false;
        }

        return true;

      case "AREA0003": // Khu C
        if (!isVaccinated) {
          pig.ineligibleReason = "Chưa tiêm đủ vaccine";
          return false;
        }
        if (weight < 80 || weight >= 105) {
          pig.ineligibleReason = "Cân nặng không phù hợp (yêu cầu: 80-105kg)";
          return false;
        }
        return true;

      case "AREA0004": // Khu D
        if (!isVaccinated) {
          pig.ineligibleReason = "Chưa tiêm đủ vaccine";
          return false;
        }
        if (weight < 105) {
          pig.ineligibleReason = "Cân nặng chưa đạt (yêu cầu: >105kg)";
          return false;
        }
        return true;

      case "AREA0005": // Khu F (Cách ly)
        return true;

      default:
        return false;
    }
  };

  const checkWeightQualified = (weight, areaId) => {
    // Log để debug
    console.log("Checking weight:", weight, "for area:", areaId);

    if (areaId === "AREA0005") {
      return true;
    }
    if (areaId === "AREA0001") {
      return weight >= 30 && weight <= 80;
    }
    if (areaId === "AREA0002") {
      return weight >= 80 && weight <= 105;
    }
    if (areaId === "AREA0003") {
      return weight >= 105;
    }
    return false;
  };

  const handleViewDetail = async (recordId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/MovePig/${recordId}`
      );
      console.log("Move record detail:", response.data.data);
    } catch (error) {
      message.error("Không thể tải thông tin chi tiết!");
    }
  };

  const handleCancelMove = async (recordId) => {
    try {
      Modal.confirm({
        title: "Xác nhận hủy phiếu",
        content: "Bạn có chắc chắn muốn hủy phiếu chuyển chuồng này?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/v1/MovePig/${recordId}/cancel`
          );
          message.success("Đã hủy phiếu chuyển chuồng!");
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/v1/MovePig`
          );
          setMoveRecords(response.data.data.items);
        },
      });
    } catch (error) {
      message.error("Không thể hủy phiếu chuyển!");
    }
  };

  const handleMove = async (values) => {
    try {
      setLoading(true);

      // Tạo payload theo đúng format API
      const payload = {
        moveDate: values.date.toISOString(), // Chuyển sang ISO format
        fromArea: values.sourceArea,
        toArea: values.targetArea,
        note: values.note,
        movePigDetails: selectedPigs.map((pig) => ({
          pigId: pig.id,
          fromStable: values.sourceHouse || pig.stableId, // Nếu không chọn chuồng nguồn thì lấy stableId của heo
          toStable: values.targetHouse,
        })),
      };

      console.log("Payload:", payload); // Log để kiểm tra

      // Gọi API tạo phiếu
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/MovePig`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Response:", response);
      if (response.status === 200) {
        message.success("Tạo phiếu chuyển chuồng thành công!");
        setIsModalVisible(false);
        form.resetFields();
        setSelectedPigs([]);
        setSelectedRowKeys([]);
        fetchMoveRecords();
      }
    } catch (error) {
      console.error("Error creating move record:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    if (selectedPigs.length === 0) {
      message.error("Vui lòng chọn ít nhất 1 heo để chuyển!");
      return;
    }

    // Kiểm tra sức chứa chuồng đích
    const targetHouse = houses[values.targetArea]?.find(
      (h) => h.id === values.targetHouse
    );
    if (targetHouse) {
      const remainingCapacity =
        targetHouse.capacity - targetHouse.currentQuantity;
      if (selectedPigs.length > remainingCapacity) {
        message.error(`Chuồng đích chỉ còn trống ${remainingCapacity} chỗ!`);
        return;
      }
    }

    // Gọi API tạo phiếu
    handleMove(values);
  };

  const getAvailableTargetAreas = (sourceAreaId) => {
    const sourceArea = areas.find((area) => area.id === sourceAreaId);
    if (!sourceArea) return [];

    return areas.filter((area) => {
      if (area.name.toLowerCase().includes("cách ly")) return true;

      return area.id > sourceAreaId;
    });
  };

  const handleSourceAreaChange = async (areaId) => {
    try {
      setSelectedSourceArea(areaId);
      form.setFieldsValue({
        sourceHouse: undefined,
        targetArea: undefined,
        targetHouse: undefined,
      });
      setSelectedRowKeys([]);
      setSelectedPigs([]);

      // Fetch pigs theo khu vực
      const pigsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/vaccination`,
        {
          params: {
            areaId: areaId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Lọc chỉ hiển thị những heo đạt chuẩn
      const allPigs = pigsResponse.data.data;
      const qualifiedPigs = allPigs.filter((pig) => {
        const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
        const isWeightQualified = checkWeightQualified(pig.weight, areaId);
        return isVaccinated && isWeightQualified;
      });

      console.log("Qualified Pigs:", qualifiedPigs);
      setFilteredPigs(qualifiedPigs);
      setSelectedPigs([]);

      // Fetch houses cho khu vực
      const housesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
        {
          params: {
            areaId: areaId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setHouses((prev) => ({
        ...prev,
        [areaId]: housesResponse.data.data.items,
      }));
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải dữ liệu!");
    }
  };

  const handleSourceHouseChange = async (houseId) => {
    try {
      setSelectedRowKeys([]);
      setSelectedPigs([]);

      // Fetch pigs theo chuồng
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs`,
        {
          params: {
            stableId: houseId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Lọc chỉ hiển thị những heo đạt chuẩn
      const allPigs = response.data.data.items;
      const qualifiedPigs = allPigs.filter((pig) => {
        const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
        const isWeightQualified = checkWeightQualified(
          pig.weight,
          selectedSourceArea
        );
        return isVaccinated && isWeightQualified;
      });

      console.log("Qualified Pigs:", qualifiedPigs);
      setFilteredPigs(qualifiedPigs);
      setSelectedPigs([]);
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải danh sách heo!");
    }
  };

  const handlePigSelection = (selectedKeys, selectedRows) => {
    setSelectedRowKeys(selectedKeys);
    setSelectedPigs(selectedRows);
  };

  const handleTargetAreaChange = async (areaId) => {
    try {
      form.setFieldsValue({ targetHouse: undefined });
      setTargetHouseInfo(null);

      const housesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
        {
          params: {
            areaId: areaId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Target Area Houses:", housesResponse.data.data.items);

      setHouses((prev) => ({
        ...prev,
        [areaId]: housesResponse.data.data.items.map((house) => ({
          id: house.id,
          name: house.name,
          capacity: house.capacity,
          currentOccupancy: house.currentOccupancy,
          humidity: house.humidity,
          temperature: house.temperature,
          status: house.status,
          remainingCapacity: house.capacity - house.currentOccupancy,
        })),
      }));
      console.log("Houses state:", houses);
    } catch (error) {
      console.error("Error fetching target houses:", error);
      message.error("Không thể tải danh sách chuồng!");
    }
  };

  const handleTargetHouseChange = async (houseId) => {
    try {
      const selectedHouse = houses[form.getFieldValue("targetArea")]?.find(
        (house) => house.id === houseId
      );

      if (selectedHouse) {
        setTargetHouseInfo({
          capacity: selectedHouse.capacity,
          currentQuantity: selectedHouse.currentQuantity,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải thông tin chuồng!");
    }
  };

  const GuidelineCard = () => (
    <Card
      className="custom-card"
      style={{ marginBottom: 24 }}
      title={
        <Space>
          <InfoCircleOutlined />
          <Text strong>Hướng dẫn chuyển chuồng</Text>
        </Space>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space direction="vertical">
              <Badge status="processing" text={<Text strong>Khu A</Text>} />
              <Text type="secondary">20kg - 30kg</Text>
              <Tag color="blue">Khu khởi đầu</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space direction="vertical">
              <Badge status="processing" text={<Text strong>Khu B</Text>} />
              <Text type="secondary">30kg - 80kg</Text>
              <Tag color="cyan">Yêu cầu tiêm đủ</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space direction="vertical">
              <Badge status="processing" text={<Text strong>Khu C</Text>} />
              <Text type="secondary">80kg - 105kg</Text>
              <Tag color="cyan">Yêu cầu tiêm đủ</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space direction="vertical">
              <Badge status="processing" text={<Text strong>Khu D</Text>} />
              <Text type="secondary">>105kg</Text>
              <Tag color="green">Xuất chuồng</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space direction="vertical">
              <Badge status="error" text={<Text strong>Khu F</Text>} />
              <Text type="secondary">Khu cách ly</Text>
              <Tag color="red">Heo bệnh</Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const StableOption = ({ house }) => (
    <div className="stable-option">
      <div className="stable-header">
        <Space>
          <HomeOutlined style={{ fontSize: "18px" }} />
          <Text strong>{house.name}</Text>
          <Badge
            status={house.status === "Available" ? "success" : "error"}
            text={house.status === "Available" ? "Khả dụng" : "Không khả dụng"}
          />
        </Space>
      </div>

      <div className="stable-stats">
        <Row gutter={16}>
          <Col span={12}>
            <Tooltip title="Số lượng/Sức chứa">
              <Progress
                percent={house.currentOccupancy}
                size="small"
                format={() => `${house.currentOccupancy}/${house.capacity}`}
                status={
                  house.currentOccupancy >= house.capacity
                    ? "exception"
                    : "active"
                }
              />
            </Tooltip>
          </Col>
          <Col span={6}>
            <Statistic
              value={house.temperature}
              suffix="°C"
              prefix={<WiThermometer />}
              valueStyle={{ fontSize: "14px" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              value={house.humidity}
              suffix="%"
              prefix={<WiHumidity />}
              valueStyle={{ fontSize: "14px" }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Title level={3}>Quản lý chuyển chuồng</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Tạo phiếu chuyển
            </Button>
          </Space>

          <Table
            columns={moveRecordColumns}
            dataSource={moveRecords}
            rowKey={(record) => record.id}
            loading={loading}
            scroll={{ x: 1300 }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} phiếu`,
            }}
          />
        </Space>

        <Modal
          title={
            <Space>
              <SwapOutlined />
              <Text strong>Tạo phiếu chuyển chuồng</Text>
            </Space>
          }
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={1600}
          footer={null}
          style={{ top: 20 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={24}>
              <Col span={6}>
                <Card
                  title={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>Thông tin chuyển</Text>
                    </Space>
                  }
                  bordered={false}
                  className="custom-card"
                >
                  <Form.Item
                    name="date"
                    label={
                      <Space>
                        <CalendarOutlined />
                        <span>Ngày chuyển</span>
                      </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày chuyển"
                    />
                  </Form.Item>

                  <Form.Item
                    name="sourceArea"
                    label={
                      <Space>
                        <HomeOutlined />
                        <span>Khu vực nguồn</span>
                      </Space>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn khu vực nguồn!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn khu vực nguồn"
                      onChange={handleSourceAreaChange}
                      showSearch
                      optionFilterProp="children"
                    >
                      {areas.map((area) => (
                        <Option key={area.id} value={area.id}>
                          <Space>
                            <Badge
                              status={
                                area.name.toLowerCase().includes("cách ly")
                                  ? "warning"
                                  : "processing"
                              }
                              text={area.name}
                            />
                            <Tooltip title={area.description}>
                              <InfoCircleOutlined
                                style={{ color: "#1890ff" }}
                              />
                            </Tooltip>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="sourceHouse"
                    label={
                      <Space>
                        <HomeOutlined />
                        <span>Chuồng nguồn</span>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Chọn chuồng nguồn"
                      onChange={handleSourceHouseChange}
                      disabled={!selectedSourceArea}
                      showSearch
                      optionFilterProp="children"
                    >
                      {houses[selectedSourceArea]?.map((house) => (
                        <Option key={house.id} value={house.id}>
                          <StableOption house={house} />
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Divider>Thông tin đích</Divider>

                  <Form.Item
                    name="targetArea"
                    label={
                      <Space>
                        <HomeOutlined />
                        <span>Khu vực đích</span>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng chọn khu vực!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn khu vực đích"
                      onChange={handleTargetAreaChange}
                      disabled={!selectedSourceArea}
                      showSearch
                      optionFilterProp="children"
                    >
                      {selectedSourceArea &&
                        getAvailableTargetAreas(selectedSourceArea).map(
                          (area) => (
                            <Option key={area.id} value={area.id}>
                              <Space>
                                <Badge
                                  status={
                                    area.name.toLowerCase().includes("cách ly")
                                      ? "warning"
                                      : "processing"
                                  }
                                  text={area.name}
                                />
                                <Tooltip title={area.description}>
                                  <InfoCircleOutlined
                                    style={{ color: "#1890ff" }}
                                  />
                                </Tooltip>
                              </Space>
                            </Option>
                          )
                        )}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="targetHouse"
                    label={
                      <Space>
                        <HomeOutlined />
                        <span>Chuồng đích</span>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng chọn chuồng!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn chuồng đích"
                      onChange={handleTargetHouseChange}
                      disabled={!form.getFieldValue("targetArea")}
                      showSearch
                      optionFilterProp="children"
                    >
                      {houses[form.getFieldValue("targetArea")]?.map(
                        (house) => (
                          <Option key={house.id} value={house.id}>
                            <StableOption house={house} />
                          </Option>
                        )
                      )}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="note"
                    label={
                      <Space>
                        <FileTextOutlined />
                        <span>Ghi chú</span>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập ghi chú!" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Nhập ghi chú"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    icon={<CheckCircleOutlined />}
                  >
                    Tạo phiếu chuyển
                  </Button>
                </Card>
              </Col>

              <Col span={18}>
                <Card
                  title={
                    <Space>
                      <UnorderedListOutlined />
                      <Text strong>Danh sách heo</Text>
                    </Space>
                  }
                  bordered={false}
                  className="custom-card"
                >
                  {capacityError && (
                    <Alert
                      message="Lỗi sức chứa"
                      description={capacityError}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  <Table
                    columns={[
                      ...pigColumns,
                      {
                        title: "Trạng thái đạt chuẩn",
                        key: "eligibility",
                        width: 150,
                        render: (_, record) => {
                          const isEligible = checkPigEligibility(
                            record,
                            form.getFieldValue("targetArea")
                          );
                          return (
                            <Tooltip
                              title={
                                !isEligible
                                  ? record.ineligibleReason
                                  : "Đủ điều kiện chuyển"
                              }
                            >
                              <Tag
                                icon={
                                  isEligible ? (
                                    <CheckCircleOutlined />
                                  ) : (
                                    <CloseCircleOutlined />
                                  )
                                }
                                color={isEligible ? "success" : "error"}
                                className={`${!isEligible ? "opacity-50" : ""}`}
                              >
                                {isEligible ? "Đạt chuẩn" : "Không đạt"}
                              </Tag>
                            </Tooltip>
                          );
                        },
                      },
                    ]}
                    dataSource={filteredPigs}
                    rowSelection={{
                      type: "checkbox",
                      selectedRowKeys: selectedRowKeys,
                      onChange: handlePigSelection,
                      getCheckboxProps: (record) => ({
                        disabled: !checkPigEligibility(
                          record,
                          form.getFieldValue("targetArea")
                        ),
                      }),
                    }}
                    rowClassName={(record) => {
                      const isEligible = checkPigEligibility(
                        record,
                        form.getFieldValue("targetArea")
                      );
                      return !isEligible ? "bg-red-50 opacity-75" : "";
                    }}
                    className="overflow-hidden shadow-sm rounded-lg"
                    scroll={{ y: 400 }}
                    loading={loading}
                    size="middle"
                    pagination={{
                      defaultPageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng số: ${total} con`,
                    }}
                  />

                  {selectedPigs.length > 0 && targetHouseInfo && (
                    <Alert
                      message={
                        <Space>
                          <InfoCircleOutlined />
                          <Text>
                            Đã chọn <Text strong>{selectedPigs.length}</Text>{" "}
                            heo, còn trống{" "}
                            <Text strong>
                              {targetHouseInfo.capacity -
                                targetHouseInfo.currentOccupancy}
                            </Text>{" "}
                            chỗ
                          </Text>
                        </Space>
                      }
                      type="info"
                      showIcon
                      className="mt-4"
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default MoveHouse;
