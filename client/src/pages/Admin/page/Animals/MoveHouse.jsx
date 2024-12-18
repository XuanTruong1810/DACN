/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
  Badge,
  Tooltip,
  message,
  Row,
  Col,
  DatePicker,
  Descriptions,
  Statistic,
  Progress,
  Checkbox,
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
  CalendarOutlined,
  UserOutlined,
  DashboardOutlined,
  CloudOutlined,
  WarningOutlined,
  SearchOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { WiThermometer, WiHumidity } from "react-icons/wi";
import ReactDOMServer from "react-dom/server";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [selectedStableInfo, setSelectedStableInfo] = useState(null);
  const [selectedTargetStableInfo, setSelectedTargetStableInfo] =
    useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedMoveDetail, setSelectedMoveDetail] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [dateRange, setDateRange] = useState([]);

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
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mã phiếu"
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
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Xóa
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.id.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Ngày chuyển",
      dataIndex: "moveDate",
      key: "moveDate",
      width: 200,
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setSelectedKeys(dates ? [dates] : []);
              }}
              style={{ width: "100%" }}
            />
            <Space wrap style={{ width: "100%" }}>
              <Button
                size="small"
                onClick={() => {
                  const today = moment();
                  setDateRange([today.startOf("day"), today.endOf("day")]);
                  setSelectedKeys([[today.startOf("day"), today.endOf("day")]]);
                }}
              >
                Hôm nay
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const yesterday = moment().subtract(1, "days");
                  setDateRange([
                    yesterday.startOf("day"),
                    yesterday.endOf("day"),
                  ]);
                  setSelectedKeys([
                    [yesterday.startOf("day"), yesterday.endOf("day")],
                  ]);
                }}
              >
                Hôm qua
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const sevenDaysAgo = moment().subtract(7, "days");
                  setDateRange([sevenDaysAgo, moment()]);
                  setSelectedKeys([[sevenDaysAgo, moment()]]);
                }}
              >
                7 ngày qua
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const thirtyDaysAgo = moment().subtract(30, "days");
                  setDateRange([thirtyDaysAgo, moment()]);
                  setSelectedKeys([[thirtyDaysAgo, moment()]]);
                }}
              >
                30 ngày qua
              </Button>
            </Space>
            <Divider style={{ margin: "8px 0" }} />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Lọc
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  setDateRange([]);
                }}
                size="small"
                style={{ width: 90 }}
              >
                Xóa
              </Button>
            </Space>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value || value.length !== 2) return true;
        const recordDate = moment(record.moveDate);
        return recordDate.isBetween(value[0], value[1], "day", "[]");
      },
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người chuyển",
      dataIndex: "createdByName",
      key: "createdByName",
      width: 150,
      render: (name) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: "Từ khu",
      dataIndex: "fromArea",
      key: "fromArea",
      width: 100,
      render: (area) => <Tag color="blue">{area}</Tag>,
    },
    {
      title: "Đến khu",
      dataIndex: "toArea",
      key: "toArea",
      width: 100,
      render: (area) => <Tag color="green">{area}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "totalPigs",
      key: "totalPigs",
      width: 100,
      render: (total) => (
        <Badge
          count={total}
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
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{
                fontSize: "16px",
                color: "#1890ff",
                cursor: "pointer",
              }}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="In phiếu">
            <PrinterOutlined
              style={{
                fontSize: "16px",
                color: "#52c41a",
                cursor: "pointer",
              }}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pigColumns = [
    {
      title: "",
      dataIndex: "select",
      width: 60,
      render: (_, record) => {
        const targetArea = form.getFieldValue("targetArea");
        const targetHouse = form.getFieldValue("targetHouse");

        // Kiểm tra xem đã chọn chuồng đích chưa
        if (!targetArea || !targetHouse) {
          return (
            <Tooltip title="Vui lòng chọn chuồng đích trước">
              <Checkbox disabled />
            </Tooltip>
          );
        }

        // Kiểm tra sức chứa còn lại của chuồng đích
        const remainingCapacity =
          selectedTargetStableInfo.capacity -
          selectedTargetStableInfo.currentOccupancy;
        const wouldExceedCapacity = selectedPigs.length + 1 > remainingCapacity;

        // Nếu đang được chọn rồi thì vẫn cho phép bỏ chọn
        const isSelected = selectedRowKeys.includes(record.id);

        return (
          <Tooltip
            title={
              wouldExceedCapacity && !isSelected
                ? `Chuồng đích chỉ còn trống ${remainingCapacity} chỗ`
                : null
            }
          >
            <Checkbox
              checked={isSelected}
              disabled={
                !checkPigEligibility(record, targetArea) ||
                (!isSelected && wouldExceedCapacity)
              }
              onChange={(e) => {
                if (e.target.checked) {
                  // Kiểm tra lại một lần nữa trước khi thêm
                  if (selectedPigs.length + 1 > remainingCapacity) {
                    message.error(
                      `Không thể chọn thêm! Chuồng đích chỉ còn trống ${remainingCapacity} chỗ`
                    );
                    return;
                  }
                  setSelectedRowKeys([...selectedRowKeys, record.id]);
                  setSelectedPigs([...selectedPigs, record]);
                } else {
                  setSelectedRowKeys(
                    selectedRowKeys.filter((key) => key !== record.id)
                  );
                  setSelectedPigs(
                    selectedPigs.filter((pig) => pig.id !== record.id)
                  );
                }
              }}
            />
          </Tooltip>
        );
      },
    },
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

  const handleViewDetail = async (record) => {
    setSelectedMoveDetail(record);
    setIsViewModalVisible(true);
  };

  const fetchMoveRecords = async () => {
    try {
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
      setMoveRecords(moveResponse.data.data);
    } catch (error) {
      console.error("Error fetching move records:", error);
      message.error("Không thể tải danh sách phiếu chuyển!");
    }
  };

  const handleMove = async (values) => {
    try {
      setLoading(true);

      // Tạo payload theo đúng format DTO từ backend
      const payload = {
        moveDate: moment(values.date).format("YYYY-MM-DDTHH:mm:ss"), // Format ISO datetime
        fromArea: values.sourceArea,
        toArea: values.targetArea,
        note: values.note || "", // Thêm empty string nếu không có ghi chú
        movePigDetails: selectedPigs.map((pig) => ({
          pigId: pig.id,
          fromStable: values.sourceHouse || pig.stableId, // Sử dụng chuồng được chọn hoặc chuồng hiện tại của heo
          toStable: values.targetHouse,
        })),
      };

      console.log("Payload being sent:", payload); // Log để debug

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/MovePig`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Tạo phiếu chuyển chuồng thành công!");

        // Reset form và state
        setIsModalVisible(false);
        form.resetFields();
        setSelectedPigs([]);
        setSelectedRowKeys([]);

        // Gọi API để cập nhật lại danh sách phiếu
        await fetchMoveRecords();
      }
    } catch (error) {
      console.error("Error creating move record:", error);
      message.error("Có lỗi xảy ra khi tạo phiếu chuyển!");
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
      console.log("All Pigs:", allPigs);
      const qualifiedPigs = allPigs.filter((pig) => {
        const isHealthy = pig.healthStatus === "good";
        const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
        const isWeightQualified = checkWeightQualified(pig.weight, areaId);
        return isVaccinated && isWeightQualified && isHealthy;
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

      // Nếu không chọn chuồng, hiển thị tất cả heo trong khu vực
      if (!houseId) {
        const pigsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/Pigs/vaccination`,
          {
            params: {
              areaId: selectedSourceArea,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const allPigs = pigsResponse.data.data;
        const qualifiedPigs = allPigs.filter((pig) => {
          const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
          const isWeightQualified = checkWeightQualified(
            pig.weight,
            selectedSourceArea
          );
          const isHealthy = pig.status === "Healthy";
          return isVaccinated && isWeightQualified && isHealthy;
        });
        setFilteredPigs(qualifiedPigs);
        return;
      }

      // Fetch pigs theo chuồng
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/vaccination`,
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
      const allPigs = response.data.data;
      const qualifiedPigs = allPigs.filter((pig) => {
        const isVaccinated = pig.vaccinationStatus === "Đã tiêm";
        const isWeightQualified = checkWeightQualified(
          pig.weight,
          selectedSourceArea
        );
        const isHealthy = pig.status === "Healthy";
        return isVaccinated && isWeightQualified && isHealthy;
      });

      console.log("Pigs in selected stable:", qualifiedPigs);
      setFilteredPigs(qualifiedPigs);
      setSelectedPigs([]);

      // Tìm và set thông tin chi tiết của chuồng được chọn
      const selectedHouse = houses[selectedSourceArea]?.find(
        (house) => house.id === houseId
      );
      setSelectedStableInfo(selectedHouse);
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải danh sách heo!");
    }
  };

  const handleTargetAreaChange = async (areaId) => {
    try {
      form.setFieldsValue({ targetHouse: undefined });
      setSelectedTargetStableInfo(null);
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

      const housesData = housesResponse.data.data.items.map((house) => ({
        id: house.id,
        name: house.name,
        capacity: house.capacity,
        currentOccupancy: house.currentOccupancy,
        humidity: house.humidity,
        temperature: house.temperature,
        status: house.status,
        remainingCapacity: house.capacity - house.currentOccupancy,
      }));

      setHouses((prev) => ({
        ...prev,
        [areaId]: housesData,
      }));
      console.log("Houses state:", houses);
    } catch (error) {
      console.error("Error fetching target houses:", error);
      message.error("Không thể tải danh sách chuồng!");
    }
  };

  const handleTargetHouseChange = async (houseId) => {
    try {
      // Tìm thông tin chuồng được chọn
      const selectedHouse = houses[form.getFieldValue("targetArea")]?.find(
        (house) => house.id === houseId
      );

      if (selectedHouse) {
        setSelectedTargetStableInfo(selectedHouse);
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
      <Row gutter={[24, 24]} justify="space-around" align="middle">
        <Col span={4}>
          <Card className="area-guide-card">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
              <Badge status="processing" text={<Text strong>Khu A</Text>} />
              <Text type="secondary">20kg - 30kg</Text>
              <Tag color="blue">Khu khởi đầu</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
              <Badge status="processing" text={<Text strong>Khu B</Text>} />
              <Text type="secondary">30kg - 80kg</Text>
              <Tag color="cyan">Yêu cầu tiêm đủ</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
              <Badge status="processing" text={<Text strong>Khu C</Text>} />
              <Text type="secondary">80kg - 105kg</Text>
              <Tag color="cyan">Yêu cầu tiêm đủ</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
              <Badge status="processing" text={<Text strong>Khu D</Text>} />
              <Text type="secondary">105kg</Text>
              <Tag color="green">Xuất chuồng</Tag>
            </Space>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="area-guide-card">
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%" }}
            >
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
    <div className="stable-option" style={{ padding: "4px 0" }}>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Space>
          <HomeOutlined />
          <Text strong>{house.name}</Text>
          <Divider type="vertical" />
          <Text type="secondary">
            Sức chứa: {house.currentQuantity}/{house.capacity}
          </Text>
        </Space>
        <Space split={<Divider type="vertical" />}>
          <Space>
            <WiThermometer />
            <Text type="secondary">{house.temperature}°C</Text>
          </Space>
          <Space>
            <WiHumidity />
            <Text type="secondary">{house.humidity}%</Text>
          </Space>
          <Badge
            status={house.status === "Active" ? "success" : "error"}
            text={
              house.status === "Active" ? "Đang hoạt động" : "Ngưng hoạt động"
            }
          />
        </Space>
      </Space>
    </div>
  );

  const showModal = () => {
    form.setFieldsValue({
      date: moment().local(), // Set ngày hiện tại
    });
    setIsModalVisible(true);
  };

  // Thêm component mới để hiển thị tiêu chuẩn chuyển chuồng
  const TransferStandards = ({ targetArea }) => {
    const getStandardInfo = () => {
      switch (targetArea) {
        case "AREA0002": // Khu B
          return {
            weight: "30kg - 80kg",
            requirements: ["Đã tiêm đủ vaccine", "Sức khỏe tốt"],
            color: "cyan",
          };
        case "AREA0003": // Khu C
          return {
            weight: "80kg - 105kg",
            requirements: ["Đã tiêm đủ vaccine", "Sức khỏe tốt"],
            color: "blue",
          };
        case "AREA0004": // Khu D
          return {
            weight: "Trên 105kg",
            requirements: ["Đã tiêm đủ vaccine", "Sức khỏe tốt"],
            color: "green",
          };
        case "AREA0005": // Khu F (Cách ly)
          return {
            weight: "Không giới hạn",
            requirements: ["Heo có vấn đề sức khỏe"],
            color: "red",
          };
        default:
          return null;
      }
    };

    const standards = getStandardInfo();

    if (!standards) return null;

    return (
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <div>
            <Text strong>Tiêu chuẩn chuyển chuồng:</Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical">
                <Space>
                  <Tag color={standards.color}>
                    Cân nặng: {standards.weight}
                  </Tag>
                  {standards.requirements.map((req, index) => (
                    <Tag key={index} color={standards.color}>
                      <CheckCircleOutlined /> {req}
                    </Tag>
                  ))}
                </Space>
                <Text type="secondary">
                  <InfoCircleOutlined /> Chỉ những heo đáp ứng đủ tiêu chuẩn mới
                  có thể được chọn để chuyển
                </Text>
              </Space>
            </div>
          </div>
        }
      />
    );
  };

  const ViewDetailModal = ({ visible, record, onClose }) => {
    return (
      <Modal
        title="Chi tiết phiếu chuyển chuồng"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        {record && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu">
                {record.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chuyển">
                {moment(record.moveDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Từ khu">
                <Tag color="blue">{record.fromArea}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đến khu">
                <Tag color="green">{record.toArea}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng heo" span={2}>
                <Badge
                  count={record.totalPigs}
                  showZero
                  style={{
                    backgroundColor: "#52c41a",
                    fontSize: "14px",
                    minWidth: "45px",
                    height: "22px",
                    lineHeight: "22px",
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {record.note || "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Chi tiết heo chuyển</Divider>

            <Table
              dataSource={record.movePigDetails}
              columns={[
                {
                  title: "Mã heo",
                  dataIndex: "pigId",
                  key: "pigId",
                },
                {
                  title: "Từ chuồng",
                  dataIndex: "fromStable",
                  key: "fromStable",
                },
                {
                  title: "Đến chuồng",
                  dataIndex: "toStable",
                  key: "toStable",
                },
              ]}
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>
    );
  };

  // Thêm component Statistics
  const MoveStatistics = ({ moveRecords }) => {
    // Tính toán thống kê
    const stats = {
      total: moveRecords.length,
      todayMoves: moveRecords.filter((record) =>
        moment(record.moveDate).isSame(moment(), "day")
      ).length,
      totalPigs: moveRecords.reduce((sum, record) => sum + record.totalPigs, 0),
    };

    return (
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} justify="space-around">
          <Col span={8}>
            <Card
              className="stat-card"
              style={{
                backgroundColor: "#e6f7ff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#0050b3" }}>
                    <Space>
                      <FileTextOutlined />
                      Tổng số phiếu
                    </Space>
                  </Text>
                }
                value={stats.total}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={<UnorderedListOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="stat-card"
              style={{
                backgroundColor: "#f6ffed",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#389e0d" }}>
                    <Space>
                      <CalendarOutlined />
                      Phiếu chuyển hôm nay
                    </Space>
                  </Text>
                }
                value={stats.todayMoves}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="stat-card"
              style={{
                backgroundColor: "#f9f0ff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: "16px", color: "#531dab" }}>
                    <Space>
                      <DashboardOutlined />
                      Tổng số heo đã chuyển
                    </Space>
                  </Text>
                }
                value={stats.totalPigs}
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
                prefix={<CloudOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  // Thêm CSS cho hiệu ứng hover
  const styles = `
    .stat-card {
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
  `;

  // Hàm handle thay đổi bộ lọc và sắp xếp
  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Hàm reset bộ lọc
  const clearFilters = () => {
    setFilteredInfo({});
  };

  const handlePrint = (record) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Phiếu chuyển chuồng</title>"
    );
    printWindow.document.write(`<style>${printStyles}</style></head><body>`);
    printWindow.document.write('<div class="print-only">');
    printWindow.document.write(
      ReactDOMServer.renderToString(<PrintableMove record={record} />)
    );
    printWindow.document.write("</div></body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Thêm component PrintableMove
  const PrintableMove = ({ record }) => {
    return (
      <div
        style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
        className="print-only"
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: "0" }}>PHIẾU CHUYỂN CHUỒNG</h2>
          <p style={{ margin: "5px 0" }}>Mã phiếu: {record.id}</p>
          <p style={{ margin: "5px 0" }}>
            Ngày chuyển: {moment(record.moveDate).format("DD/MM/YYYY")}
          </p>
        </div>

        {/* Thông tin chuyển chuồng */}
        <div style={{ marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    width: "30%",
                  }}
                >
                  <strong>Từ khu:</strong>
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {record.fromArea}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <strong>Đến khu:</strong>
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {record.toArea}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <strong>Tổng số heo:</strong>
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {record.totalPigs} con
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <strong>Ghi chú:</strong>
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {record.note || "Không có"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chi tiết heo chuyển */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Chi tiết heo chuyển:</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  STT
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Mã heo
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Từ chuồng
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Đến chuồng
                </th>
              </tr>
            </thead>
            <tbody>
              {record.movePigDetails.map((detail, index) => (
                <tr key={index}>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {detail.pigId}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {detail.fromStable}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {detail.toStable}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Chữ ký */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ textAlign: "center", width: "200px" }}>
            <p>
              <strong>Người lập phiếu</strong>
            </p>
            <p style={{ fontStyle: "italic" }}>(Ký và ghi rõ họ tên)</p>
            <div style={{ marginTop: "60px" }}>{record.createdByName}</div>
          </div>
        </div>
      </div>
    );
  };

  // Thêm CSS cho in ấn
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-only, .print-only * {
        visibility: visible;
      }
      .print-only {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      @page {
        size: A4;
        margin: 20mm;
      }
    }
  `;

  return (
    <div style={{ padding: "24px" }}>
      <style>{styles}</style>
      <style>{printStyles}</style>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Title level={3}>Quản lý chuyển chuồng</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Tạo phiếu chuyển
            </Button>
          </Space>

          <MoveStatistics moveRecords={moveRecords} />

          <Table
            columns={moveRecordColumns}
            dataSource={moveRecords}
            onChange={handleChange}
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
                    initialValue={moment()}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày chuyển"
                      showTime={false}
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
                      onChange={(value) => {
                        handleSourceHouseChange(value);
                        // Tìm và set thông tin chi tiết của chuồng được chọn
                        const selectedHouse = houses[selectedSourceArea]?.find(
                          (house) => house.id === value
                        );
                        setSelectedStableInfo(selectedHouse);
                      }}
                      disabled={!selectedSourceArea}
                      showSearch
                      optionFilterProp="children"
                    >
                      {houses[selectedSourceArea]?.map((house) => (
                        <Option key={house.id} value={house.id}>
                          {house.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {selectedStableInfo && (
                    <Card
                      size="small"
                      className="mt-2"
                      title="Thông tin chuồng"
                      style={{ marginTop: "16px" }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Tên chuồng">
                          {selectedStableInfo.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Badge
                            status={
                              selectedStableInfo.status === "Available"
                                ? "success"
                                : "error"
                            }
                            text={
                              selectedStableInfo.status === "Available"
                                ? "Khả dụng"
                                : "Không khả dụng"
                            }
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức chứa">
                          <Progress
                            percent={
                              (selectedStableInfo.currentOccupancy /
                                selectedStableInfo.capacity) *
                              100
                            }
                            size="small"
                            format={() =>
                              `${selectedStableInfo.currentOccupancy}/${selectedStableInfo.capacity}`
                            }
                            status={
                              selectedStableInfo.currentOccupancy >=
                              selectedStableInfo.capacity
                                ? "exception"
                                : "active"
                            }
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhiệt độ">
                          <Space>
                            <WiThermometer />
                            {selectedStableInfo.temperature}°C
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Độ ẩm">
                          <Space>
                            <WiHumidity />
                            {selectedStableInfo.humidity}%
                          </Space>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  )}

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
                      {houses[form.getFieldValue("targetArea")]
                        ?.filter(
                          (house) => house.currentOccupancy < house.capacity
                        )
                        .map((house) => (
                          <Select.Option key={house.id} value={house.id}>
                            {house.name}{" "}
                            <Badge
                              count={`${house.currentOccupancy}/${house.capacity} chỗ`}
                              style={{ backgroundColor: "#52c41a" }}
                            />
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>

                  {selectedTargetStableInfo && (
                    <Card
                      size="small"
                      className="mt-2"
                      title="Thông tin chuồng đích"
                      style={{ marginTop: "16px" }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Tên chuồng">
                          {selectedTargetStableInfo.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Badge
                            status={
                              selectedTargetStableInfo.status === "Available"
                                ? "success"
                                : "error"
                            }
                            text={
                              selectedTargetStableInfo.status === "Available"
                                ? "Khả dụng"
                                : "Không khả dụng"
                            }
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức chứa">
                          <Progress
                            percent={
                              (selectedTargetStableInfo.currentOccupancy /
                                selectedTargetStableInfo.capacity) *
                              100
                            }
                            size="small"
                            format={() =>
                              `${selectedTargetStableInfo.currentOccupancy}/${selectedTargetStableInfo.capacity}`
                            }
                            status={
                              selectedTargetStableInfo.currentOccupancy >=
                              selectedTargetStableInfo.capacity
                                ? "exception"
                                : "active"
                            }
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Còn trống">
                          <Badge
                            count={`${
                              selectedTargetStableInfo.capacity -
                              selectedTargetStableInfo.currentOccupancy
                            } chỗ`}
                            style={{ backgroundColor: "#52c41a" }}
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhiệt độ">
                          <Space>
                            <WiThermometer />
                            {selectedTargetStableInfo.temperature}°C
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Độ ẩm">
                          <Space>
                            <WiHumidity />
                            {selectedTargetStableInfo.humidity}%
                          </Space>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  )}

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
                  <GuidelineCard />
                  <TransferStandards
                    targetArea={form.getFieldValue("targetArea")}
                  />

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
                    columns={pigColumns}
                    dataSource={filteredPigs}
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

                  {selectedPigs.length > 0 && selectedTargetStableInfo && (
                    <Alert
                      message={
                        <Space>
                          <InfoCircleOutlined />
                          <Text>
                            Đã chọn <Text strong>{selectedPigs.length}</Text>{" "}
                            heo, còn trống{" "}
                            <Text strong>
                              {selectedTargetStableInfo.capacity -
                                selectedTargetStableInfo.currentOccupancy}
                            </Text>{" "}
                            chỗ trong chuồng đích
                          </Text>
                        </Space>
                      }
                      type={
                        selectedPigs.length >
                        selectedTargetStableInfo.capacity -
                          selectedTargetStableInfo.currentOccupancy
                          ? "error"
                          : "info"
                      }
                      showIcon
                      className="mt-4"
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Form>
        </Modal>

        <ViewDetailModal
          visible={isViewModalVisible}
          record={selectedMoveDetail}
          onClose={() => {
            setIsViewModalVisible(false);
            setSelectedMoveDetail(null);
          }}
        />
      </Card>
    </div>
  );
};

export default MoveHouse;
