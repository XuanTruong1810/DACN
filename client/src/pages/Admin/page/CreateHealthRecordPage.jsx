import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  InputNumber,
  Table,
  Tag,
  DatePicker,
  Statistic,
  Alert,
  Checkbox,
  Typography,
  Layout,
  Spin,
} from "antd";
import {
  SearchOutlined,
  SaveOutlined,
  HomeOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import moment from "moment";
const { TextArea } = Input;
// Fake Data
const AREAS = [
  {
    id: 1,
    name: "Khu A",
    houses: [
      { id: "A1", name: "Chuồng A1", type: "Chuồng heo thịt A1", capacity: 20 },
      { id: "A2", name: "Chuồng A2", type: "Chuồng heo thịt A2", capacity: 30 },
    ],
  },
  {
    id: 2,
    name: "Khu B",
    houses: [
      { id: "B1", name: "Chuồng B1", type: "Chuồng heo thịt B1", capacity: 25 },
      { id: "B2", name: "Chuồng B2", type: "Chuồng heo thịt B2", capacity: 35 },
    ],
  },
];

const VACCINES = [
  {
    id: 1,
    name: "Vaccine PRRS - MLV",
    disease: "Hội chứng rối loạn hô hấp và sinh sản",
    manufacturer: "MSD Animal Health",
    dosage: "2ml/con",
    price: 150000,
    note: "Tiêm bắp, dùng cho heo từ 3 tuần tuổi",
  },
  {
    id: 2,
    name: "Vaccine Dịch tả",
    disease: "Dịch tả lợn cổ điển",
    manufacturer: "Navetco",
    dosage: "1ml/con",
    price: 80000,
    note: "Tiêm bắp, dùng cho heo từ 45 ngày tuổi",
  },
  // thêm các vaccine khác...
];

// const DISEASES = [
//   {
//     id: 1,
//     name: "Viêm phổi",
//     symptoms: "Ho, sốt, thở nhanh, bỏ ăn",
//     treatments: [1, 2], // ID của các thuốc điều trị phù hợp
//     note: "Cách ly, điều trị kháng sinh",
//   },
//   {
//     id: 2,
//     name: "Tiêu chảy",
//     symptoms: "Phân lỏng, mất nước, bỏ ăn",
//     treatments: [3, 4],
//     note: "Bổ sung nước và điện giải",
//   },
//   // thêm các bệnh khác...
// ];

const MEDICINES = [
  {
    id: 1,
    name: "Amoxicillin 20%",
    type: "Kháng sinh",
    usage: "Điều trị nhiễm khuẩn đường hô hấp",
    dosageGuide: "2ml/10kg thể trọng/ngày",
    duration: "5-7 ngày",
    note: "Tiêm bắp sâu",
  },
  {
    id: 2,
    name: "Tylosin 20%",
    type: "Kháng sinh",
    usage: "Điều trị viêm phổi, viêm khớp",
    dosageGuide: "1ml/10kg thể trọng/ngày",
    duration: "3-5 ngày",
    note: "Tiêm bắp",
  },
  // thêm các thuốc khác...
];

// Generate fake pigs data
const generatePigsForHouse = (houseId) => {
  const pigs = [];
  const house = AREAS.flatMap((a) => a.houses).find((h) => h.id === houseId);
  const pigCount =
    Math.floor(Math.random() * (house.capacity * 0.3)) + house.capacity * 0.7;

  for (let i = 1; i <= pigCount; i++) {
    pigs.push({
      id: `${houseId}-${i.toString().padStart(3, "0")}`,
      weight: parseFloat((Math.random() * (120 - 20) + 20).toFixed(1)),
      age: Math.floor(Math.random() * 12) + 1,
      gender: Math.random() > 0.5 ? "Đực" : "Cái",
      breed: ["Duroc", "Landrace", "Yorkshire", "PiDu"][
        Math.floor(Math.random() * 4)
      ],
      status: "active",
      lastVaccine:
        Math.random() > 0.7
          ? {
              date: moment().subtract(Math.floor(Math.random() * 30), "days"),
              vaccineId:
                VACCINES[Math.floor(Math.random() * VACCINES.length)].id,
            }
          : null,
    });
  }

  return pigs;
};

// Generate all pigs data
const ALL_PIGS = {};
AREAS.forEach((area) => {
  area.houses.forEach((house) => {
    ALL_PIGS[house.id] = generatePigsForHouse(house.id);
  });
});

// Component Navigation

const LoadingScreen = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "#fff9f0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 40,
              color: "#d35400",
            }}
            spin
          />
        }
      />
      <div
        style={{
          color: "#8b4513",
          fontSize: "16px",
          marginTop: "8px",
        }}
      >
        Đang tải dữ liệu...
      </div>
    </div>
  </div>
);

const CreateHealthRecordPage = () => {
  const [searchForm] = Form.useForm();
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [filteredPigs, setFilteredPigs] = useState([]);
  const [selectedPigs, setSelectedPigs] = useState([]);
  const [pigHealthData, setPigHealthData] = useState({});
  const [filters, setFilters] = useState({
    pigId: "",
    weightRange: [],
    ageRange: [],
    gender: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .fade-in {
        animation: fadeIn 0.5s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Xử lý tìm kiếm và lọc
  const handleSearch = () => {
    if (!selectedHouse) return;

    let pigs = ALL_PIGS[selectedHouse] || [];

    // Lọc theo các điều kiện
    pigs = pigs.filter((pig) => {
      let match = true;

      if (filters.pigId) {
        match =
          match && pig.id.toLowerCase().includes(filters.pigId.toLowerCase());
      }

      if (filters.weightRange.length === 2) {
        match =
          match &&
          pig.weight >= filters.weightRange[0] &&
          pig.weight <= filters.weightRange[1];
      }

      if (filters.ageRange.length === 2) {
        match =
          match &&
          pig.age >= filters.ageRange[0] &&
          pig.age <= filters.ageRange[1];
      }

      if (filters.gender) {
        match = match && pig.gender === filters.gender;
      }

      return match;
    });

    setFilteredPigs(pigs);
  };

  // Reset form
  const handleReset = () => {
    searchForm.resetFields();
    setFilters({
      pigId: "",
      weightRange: [],
      ageRange: [],
      gender: null,
    });
    if (selectedHouse) {
      setFilteredPigs(ALL_PIGS[selectedHouse] || []);
    }
  };

  // Render form tìm kiếm
  const renderSearchForm = () => (
    <Card
      type="inner"
      title={
        <Space>
          <SearchOutlined />
          Tìm kiếm và lọc
        </Space>
      }
    >
      <Form form={searchForm} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Khu vực" required>
              <Select
                placeholder="Chọn khu vực"
                value={selectedArea}
                onChange={(value) => {
                  setSelectedArea(value);
                  setSelectedHouse(null);
                  setFilteredPigs([]);
                  setSelectedPigs([]);
                }}
                options={AREAS.map((area) => ({
                  value: area.id,
                  label: area.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Chuồng" required>
              <Select
                placeholder={
                  selectedArea ? "Chọn chuồng" : "Vui lòng chọn khu vực trước"
                }
                value={selectedHouse}
                onChange={(value) => {
                  setSelectedHouse(value);
                  setFilteredPigs(ALL_PIGS[value] || []);
                }}
                disabled={!selectedArea}
              >
                {selectedArea &&
                  AREAS.find((a) => a.id === selectedArea)?.houses.map(
                    (house) => (
                      <Select.Option key={house.id} value={house.id}>
                        {house.name}
                      </Select.Option>
                    )
                  )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ngày khám" required>
              <DatePicker
                style={{ width: "100%" }}
                value={examDate}
                onChange={setExamDate}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Vaccine (nếu cần tiêm)">
              <Select
                placeholder="Chọn vaccine cần tiêm"
                value={selectedVaccine}
                onChange={setSelectedVaccine}
                allowClear
                style={{ width: "100%" }}
              >
                {VACCINES.map((vaccine) => (
                  <Select.Option key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">Bộ lọc thêm</Typography.Text>
        </div>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Mã heo">
              <Input
                placeholder="Nhập mã heo"
                value={filters.pigId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, pigId: e.target.value }))
                }
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Cân nặng (kg)">
              <Space>
                <InputNumber
                  placeholder="Từ"
                  value={filters.weightRange[0]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      weightRange: [value, prev.weightRange[1]],
                    }))
                  }
                />
                <Input style={{ width: 30 }} placeholder="~" disabled />
                <InputNumber
                  placeholder="Đến"
                  value={filters.weightRange[1]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      weightRange: [prev.weightRange[0], value],
                    }))
                  }
                />
              </Space>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Tuổi (tháng)">
              <Space>
                <InputNumber
                  placeholder="Từ"
                  value={filters.ageRange[0]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: [value, prev.ageRange[1]],
                    }))
                  }
                />
                <Input style={{ width: 30 }} placeholder="~" disabled />
                <InputNumber
                  placeholder="Đến"
                  value={filters.ageRange[1]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: [prev.ageRange[0], value],
                    }))
                  }
                />
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleReset}>Đặt lại</Button>
              <Button type="primary" onClick={handleSearch}>
                Tìm kiếm
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const handlePigSelection = (pigId, checked) => {
    setSelectedPigs((prev) => {
      if (checked) return [...prev, pigId];
      return prev.filter((id) => id !== pigId);
    });
  };

  const handleHealthDataChange = (pigId, field, value) => {
    setPigHealthData((prev) => ({
      ...prev,
      [pigId]: {
        ...prev[pigId],
        [field]: value,
      },
    }));
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedPigs.length === filteredPigs.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedPigs(filteredPigs.map((pig) => pig.id));
            } else {
              setSelectedPigs([]);
            }
          }}
        />
      ),
      dataIndex: "select",
      width: 50,
      fixed: "left",
      render: (_, record) => (
        <Checkbox
          checked={selectedPigs.includes(record.id)}
          onChange={(e) => handlePigSelection(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Mã heo",
      dataIndex: "id",
      width: 120,
      fixed: "left",
    },
    {
      title: "Thông tin cơ bản",
      children: [
        {
          title: "Cân nặng (kg)",
          dataIndex: "weight",
          width: 120,
          render: (_, record) => (
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={1}
              value={pigHealthData[record.id]?.weight ?? record.weight}
              onChange={(value) =>
                handleHealthDataChange(record.id, "weight", value)
              }
              addonAfter="kg"
            />
          ),
        },
        {
          title: "Tuổi (tháng)",
          dataIndex: "age",
          width: 100,
        },
      ],
    },
    {
      title: "Khám sức khỏe",
      children: [
        {
          title: "Trạng thái",
          dataIndex: "status",
          width: 150,
          render: (_, record) => {
            if (!selectedPigs.includes(record.id)) {
              return <Tag>Chưa chọn khám</Tag>;
            }
            return (
              <Select
                style={{ width: "100%" }}
                value={pigHealthData[record.id]?.status || "healthy"}
                onChange={(value) =>
                  handleHealthDataChange(record.id, "status", value)
                }
              >
                <Select.Option value="healthy">
                  <Tag color="success">Khỏe mạnh</Tag>
                </Select.Option>
                <Select.Option value="needTreatment">
                  <Tag color="error">Cần điều trị</Tag>
                </Select.Option>
              </Select>
            );
          },
        },
        {
          title: "Bệnh",
          dataIndex: "disease",
          width: 200,
          render: (_, record) => {
            if (
              !selectedPigs.includes(record.id) ||
              pigHealthData[record.id]?.status !== "needTreatment"
            ) {
              return null;
            }
            return (
              <Input.TextArea
                placeholder="Nhập tên bệnh..."
                value={pigHealthData[record.id]?.disease}
                onChange={(e) =>
                  handleHealthDataChange(record.id, "disease", e.target.value)
                }
                rows={2}
              />
            );
          },
        },
        {
          title: "Triệu chứng",
          dataIndex: "symptoms",
          width: 200,
          render: (_, record) => {
            if (
              !selectedPigs.includes(record.id) ||
              pigHealthData[record.id]?.status !== "needTreatment"
            ) {
              return null;
            }
            return (
              <TextArea
                placeholder="Mô tả triệu chứng cụ thể..."
                value={pigHealthData[record.id]?.symptoms}
                onChange={(e) =>
                  handleHealthDataChange(record.id, "symptoms", e.target.value)
                }
                rows={2}
              />
            );
          },
        },
        {
          title: "Thuốc điều trị",
          dataIndex: "medicine",
          width: 300,
          render: (_, record) => {
            if (
              !selectedPigs.includes(record.id) ||
              pigHealthData[record.id]?.status !== "needTreatment"
            ) {
              return null;
            }
            return (
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn thuốc điều trị"
                value={pigHealthData[record.id]?.medicine}
                onChange={(value) =>
                  handleHealthDataChange(record.id, "medicine", value)
                }
                mode="multiple"
              >
                {MEDICINES.map((medicine) => (
                  <Select.Option key={medicine.id} value={medicine.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{medicine.name}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {medicine.usage} • {medicine.dosageGuide}
                        <br />
                        Thời gian điều trị: {medicine.duration}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            );
          },
        },
      ],
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      width: 200,
      render: (_, record) => {
        if (!selectedPigs.includes(record.id)) return null;
        return (
          <TextArea
            placeholder="Ghi chú thêm..."
            value={pigHealthData[record.id]?.note}
            onChange={(e) =>
              handleHealthDataChange(record.id, "note", e.target.value)
            }
            rows={2}
          />
        );
      },
    },
  ];

  const getSummary = () => {
    const totalPigs = filteredPigs.length;
    const selectedCount = selectedPigs.length;
    const healthyCount = selectedPigs.filter(
      (id) => pigHealthData[id]?.status === "healthy"
    ).length;
    const sickCount = selectedPigs.filter(
      (id) => pigHealthData[id]?.status === "needTreatment"
    ).length;
    const unselectedCount = totalPigs - selectedCount;
    const vaccineCount = selectedVaccine
      ? selectedPigs.filter((id) => pigHealthData[id]?.status === "healthy")
          .length
      : 0;

    // Lấy thông tin khu vực và chuồng
    const area = AREAS.find((a) => a.id === selectedArea);
    const house = area?.houses.find((h) => h.id === selectedHouse);

    // Cập nhật phần hiển thị chi tiết bệnh
    const diseases = {};
    selectedPigs.forEach((pigId) => {
      const disease = pigHealthData[pigId]?.disease;
      if (disease && pigHealthData[pigId]?.status === "needTreatment") {
        diseases[disease] = (diseases[disease] || 0) + 1;
      }
    });

    return (
      <Card>
        <Row gutter={[32, 16]}>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{ fontWeight: 500, fontSize: "16px", marginBottom: 8 }}
              >
                Thông tin khu vực
              </div>
              <div>
                <HomeOutlined /> Khu vực: {area?.name}
              </div>
              <div style={{ marginTop: 4 }}>
                <HomeOutlined /> Chuồng: {house?.name}
                <div
                  style={{ fontSize: "12px", color: "#666", marginLeft: 16 }}
                >
                  {house?.type} • Sức chứa: {house?.capacity} con
                </div>
              </div>
            </div>
            <Statistic title="Tổng số heo" value={totalPigs} suffix="con" />
          </Col>

          <Col span={6}>
            <Statistic
              title="Đã khám"
              value={selectedCount}
              suffix={`con (${((selectedCount / totalPigs) * 100).toFixed(
                1
              )}%)`}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8, fontSize: "13px" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Tag color="success">Khỏe mạnh:</Tag>
                  <span style={{ fontWeight: 500 }}>
                    {healthyCount} con (
                    {((healthyCount / selectedCount) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <Tag color="error">Cần điều tr:</Tag>
                  <span style={{ fontWeight: 500 }}>
                    {sickCount} con (
                    {((sickCount / selectedCount) * 100).toFixed(1)}%)
                  </span>
                </div>
                {selectedVaccine && (
                  <div>
                    <Tag color="processing">Tiêm vaccine:</Tag>
                    <span style={{ fontWeight: 500 }}>
                      {vaccineCount} con (
                      {((vaccineCount / selectedCount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </Space>
            </div>
          </Col>

          <Col span={6}>
            <Statistic
              title="Chưa khám"
              value={unselectedCount}
              suffix={`con (${((unselectedCount / totalPigs) * 100).toFixed(
                1
              )}%)`}
              valueStyle={{ color: "#faad14" }}
            />
          </Col>

          <Col span={6}>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <CalendarOutlined /> Ngày khám:{" "}
                <span style={{ fontWeight: 500 }}>
                  {moment(examDate).format("DD/MM/YYYY")}
                </span>
              </div>
              {selectedVaccine && (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Vaccine được chọn:
                  </div>
                  <div>
                    {VACCINES.find((v) => v.id === selectedVaccine)?.name}
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "#666", marginTop: 4 }}
                  >
                    {VACCINES.find((v) => v.id === selectedVaccine)?.note}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {Object.keys(diseases).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Typography.Title level={5}>Chi tiết bệnh:</Typography.Title>
            {Object.entries(diseases).map(([disease, count]) => (
              <div key={disease} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{disease}:</span> {count} con
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <Layout className="fade-in">
      <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
        <div style={{ padding: "24px" }}>
          <Typography.Title level={2}>Khám sức khỏe heo</Typography.Title>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {renderSearchForm()}

            <Alert
              message="Hướng dẫn"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 16 }}>
                  <li>Chọn khu vực và chuồng cần khám</li>
                  <li>Chọn ngày khám và vaccine (nếu cần tiêm)</li>
                  <li>Tích chọn những heo cần khám</li>
                  <li>Với heo khỏe mạnh có thể tiêm vaccine</li>
                  <li>
                    Với heo cần điều trị, vui lòng chọn bệnh và nhập đầy đủ
                    thông tin điều trị
                  </li>
                </ul>
              }
              type="info"
              showIcon
            />

            <Table
              columns={columns}
              dataSource={filteredPigs}
              bordered
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={{
                total: filteredPigs.length,
                pageSize: 10,
                showTotal: (total) => `Tổng số: ${total} heo`,
              }}
              rowKey="id"
              footer={getSummary}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px",
              }}
            >
              <Button type="default" size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                disabled={!examDate || selectedPigs.length === 0}
              >
                Lưu phiếu khám
              </Button>
            </div>
          </Space>
        </div>
      </Layout>
    </Layout>
  );
};

export default CreateHealthRecordPage;
