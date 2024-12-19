/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  message,
  Space,
  Button,
  Tag,
  Form,
  Input,
  Select,
  Layout,
  Row,
  Col,
  Statistic,
  DatePicker,
  Empty,
  Spin,
  Checkbox,
  InputNumber,
} from "antd";
import {
  SaveOutlined,
  MedicineBoxOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";
import moment from "moment";

const { Title } = Typography;
const { TextArea } = Input;

const pageStyles = {
  layout: {
    padding: "24px",
    background: "#f0f2f5",
    minHeight: "100vh",
  },
  mainCard: {
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
    borderRadius: "8px",
  },
  headerIcon: {
    fontSize: 24,
    color: "#1890ff",
  },
  headerTitle: {
    margin: 0,
  },
  searchCard: {
    background: "#fafafa",
    borderRadius: "6px",
  },
  statsCard: {
    background: "#fafafa",
    borderRadius: "6px",
  },
  table: {
    background: "white",
    borderRadius: "6px",
  },
  emptyState: {
    padding: "48px 0",
    textAlign: "center",
  },
};

const CreateHealthRecordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [houses, setHouses] = useState([]);
  const [pigData, setPigData] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [examDate, setExamDate] = useState(dayjs());
  const [selectedPigs, setSelectedPigs] = useState(new Set());
  const [searchText, setSearchText] = useState("");

  // Fetch danh sách khu
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
      console.log(response.data.data.items);
      setAreas(response.data.data.items);
    } catch (error) {
      message.error("Lỗi khi tải danh sách khu: " + error.message);
    }
  };

  // Fetch danh sách chuồng theo khu
  const fetchHouses = async (areaId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Stables`,
        {
          params: {
            areaId: areaId,
            pageIndex: 1,
            pageSize: 100,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setHouses(response.data.data.items);
    } catch (error) {
      message.error("Lỗi khi tải danh sách chuồng: " + error.message);
    }
  };

  // Fetch danh sách heo theo chuồng
  const fetchPigsByHouse = async (houseId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/house/${houseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const pigs = response.data.data.map((pig) => ({
        ...pig,
        key: pig.id,
        isHealthy: "healthy",
        diagnosis: "Khỏe mạnh",
        healthNote: "",
        treatmentMethod: "",
        medicines: [],
        symptoms: "",
      }));
      setPigData(pigs);
      setSelectedPigs(new Set());
    } catch (error) {
      message.error("Lỗi khi tải danh sách heo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách thuốc và lọc
  const fetchMedicines = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Medicine`,
        {
          params: {
            isVaccine: false, // Thêm param để lọc từ server
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Lọc ra những thuốc không có daysAfterImport
      const filteredMedicines = response.data.data.filter(
        (med) => !med.daysAfterImport
      );
      setMedicines(filteredMedicines);
    } catch (error) {
      message.error("Lỗi khi tải danh sách thuốc: " + error.message);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchMedicines();
  }, []);

  // Xử lý khi chọn khu
  const handleAreaChange = (value) => {
    setSelectedArea(value);
    setSelectedHouse(null);
    setPigData([]);
    fetchHouses(value);
  };

  // Xử lý khi chọn chuồng
  const handleHouseChange = (value) => {
    setSelectedHouse(value);
    fetchPigsByHouse(value);
  };

  // Xử lý chọn tất cả
  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelected = new Set(pigData.map((pig) => pig.id));
      setSelectedPigs(newSelected);
    } else {
      setSelectedPigs(new Set());
    }
  };

  // Xử lý chọn từng item
  const handleSelect = (e, pigId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt

    setSelectedPigs((prev) => {
      const newSelected = new Set(prev);
      if (e.target.checked) {
        newSelected.add(pigId);
      } else {
        newSelected.delete(pigId);
      }
      return newSelected;
    });
  };

  // Sửa lại hàm handleHealthStatusChange
  const handleHealthStatusChange = (record, value) => {
    setPigData((prevData) => {
      return prevData.map((pig) => {
        if (pig.id === record.id) {
          return {
            ...pig,
            isHealthy: value,
            ...(value === "healthy"
              ? {
                  diagnosis: "Khỏe mạnh",
                  treatmentMethod: "",
                  medicines: [],
                  healthNote: "",
                  symptoms: "",
                }
              : {
                  diagnosis: "",
                  treatmentMethod: "",
                  medicines: [],
                  healthNote: "",
                  symptoms: "",
                }),
          };
        }
        return pig;
      });
    });
  };

  // X lý thêm thuốc
  const handleAddMedicine = (record) => {
    setPigData((prevData) => {
      return prevData.map((pig) => {
        if (pig.id === record.id) {
          return {
            ...pig,
            medicines: [
              ...(pig.medicines || []),
              {
                medicineId: undefined,
                medicineName: "",
                quantity: 1,
                unit: "",
                key: Date.now(),
              },
            ],
          };
        }
        return pig;
      });
    });
  };

  // Thêm hàm xử lý xóa thuốc
  const handleRemoveMedicine = (record, medicineIndex) => {
    setPigData((prevData) => {
      return prevData.map((pig) => {
        if (pig.id === record.id) {
          const updatedMedicines = [...pig.medicines];
          updatedMedicines.splice(medicineIndex, 1);
          return {
            ...pig,
            medicines: updatedMedicines,
          };
        }
        return pig;
      });
    });
  };

  // Thêm hàm xử lý thay đổi thuốc
  const handleMedicineChange = (record, medicineIndex, newValues) => {
    setPigData((prevData) => {
      return prevData.map((pig) => {
        if (pig.id === record.id) {
          const updatedMedicines = [...(pig.medicines || [])];
          updatedMedicines[medicineIndex] = {
            ...updatedMedicines[medicineIndex],
            ...newValues,
          };
          return {
            ...pig,
            medicines: updatedMedicines,
          };
        }
        return pig;
      });
    });
  };

  // Định nghĩa columns cho bảng
  const columns = [
    {
      title: () => (
        <Checkbox
          checked={pigData.length > 0 && selectedPigs.size === pigData.length}
          indeterminate={
            selectedPigs.size > 0 && selectedPigs.size < pigData.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      width: 50,
      fixed: "left",
      render: (_, record) => (
        <Checkbox
          checked={selectedPigs.has(record.id)}
          onChange={(e) => handleSelect(e, record.id)}
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: "auto" }}
        />
      ),
    },
    {
      title: "Mã heo",
      dataIndex: "id",
      width: 120,
      fixed: "left",
      render: (id) => <Tag color="blue">{id}</Tag>,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mã heo"
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
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Xóa
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Tình trạng",
      width: 150,
      render: (_, record) => (
        <Select
          style={{ width: "100%" }}
          value={record.isHealthy}
          onChange={(value) => handleHealthStatusChange(record, value)}
          onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện n��i bọt
        >
          <Select.Option value="healthy">
            <Tag color="success">Khỏe mạnh</Tag>
          </Select.Option>
          <Select.Option value="sick">
            <Tag color="error">Không khỏe</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Triệu chứng",
      width: 200,
      render: (_, record) =>
        record.isHealthy === "sick" && (
          <Input.TextArea
            placeholder="Nhập triệu chứng"
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={record.symptoms}
            onChange={(e) => {
              setPigData((prevData) =>
                prevData.map((pig) =>
                  pig.id === record.id
                    ? { ...pig, symptoms: e.target.value }
                    : pig
                )
              );
            }}
          />
        ),
    },
    {
      title: "Chẩn đoán",
      width: 200,
      render: (_, record) =>
        record.isHealthy === "sick" && (
          <Input.TextArea
            placeholder="Nhập chẩn đoán"
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={record.diagnosis}
            onChange={(e) => {
              setPigData((prevData) =>
                prevData.map((pig) =>
                  pig.id === record.id
                    ? { ...pig, diagnosis: e.target.value }
                    : pig
                )
              );
            }}
          />
        ),
    },
    {
      title: "Phương pháp điều trị",
      width: 200,
      render: (_, record) =>
        record.isHealthy === "sick" && (
          <TextArea
            placeholder="Nhập phương pháp điều trị..."
            value={record.treatmentMethod}
            onChange={(e) => {
              const newData = [...pigData];
              const index = newData.findIndex((item) => item.id === record.id);
              newData[index].treatmentMethod = e.target.value;
              setPigData(newData);
            }}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        ),
    },
    {
      title: "Thuốc điều trị",
      width: 450,
      render: (_, record) => {
        console.log("Rendering medicines for pig:", record.id); // Debug

        return (
          record.isHealthy === "sick" && (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {record.medicines?.map((med, index) => (
                <Card
                  key={`${record.id}-${med.key}`} // Thêm id vào key
                  size="small"
                  style={{ marginBottom: 8 }}
                  bodyStyle={{ padding: "8px" }}
                >
                  <Row gutter={[8, 8]} align="middle">
                    <Col span={10}>
                      <Form.Item
                        label="Tên thuốc"
                        style={{ marginBottom: 0 }}
                        required
                      >
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Chọn thuốc"
                          value={med.medicineId}
                          onChange={(value) => {
                            const selectedMedicine = medicines.find(
                              (m) => m.id === value
                            );
                            handleMedicineChange(record, index, {
                              medicineId: value,
                              medicineName: selectedMedicine?.medicineName,
                              unit: selectedMedicine?.unit,
                            });
                          }}
                          options={medicines.map((m) => ({
                            value: m.id,
                            label: m.medicineName,
                            disabled: record.medicines?.some(
                              (existingMed) =>
                                existingMed.medicineId === m.id &&
                                existingMed.key !== med.key
                            ),
                          }))}
                          optionFilterProp="children"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Số lượng"
                        style={{ marginBottom: 0 }}
                        required
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          placeholder="Số lượng"
                          value={med.quantity}
                          onChange={(value) =>
                            handleMedicineChange(record, index, {
                              quantity: value,
                            })
                          }
                          addonAfter={med.unit || "Đơn vị"}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMedicine(record, index)}
                      />
                    </Col>
                  </Row>
                  {med.medicineName && (
                    <div
                      style={{ marginTop: 4, fontSize: "12px", color: "#666" }}
                    >
                      Thuốc đã chọn: {med.medicineName}
                    </div>
                  )}
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => handleAddMedicine(record)}
                icon={<PlusOutlined />}
                size="small"
                style={{ width: "100%" }}
              >
                Thêm thuốc
              </Button>
            </Space>
          )
        );
      },
    },
  ];

  const handleSubmit = async () => {
    try {
      const selectedPigData = pigData.filter((pig) => selectedPigs.has(pig.id));
      const invalidPigs = selectedPigData.filter((pig) => {
        if (pig.isHealthy === "sick") {
          return !pig.diagnosis || !pig.treatmentMethod;
        }
        return false;
      });

      if (invalidPigs.length > 0) {
        message.error(
          "Vui lòng nhập đầy đủ thông tin chẩn đoán và phương pháp điều trị cho các heo không khỏe"
        );
        return;
      }

      setLoading(true);

      // Chuẩn bị payload theo VaccinationInsertDTO
      const payload = {
        examinationDate: dayjs(examDate).format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"),
        examinationNote: form.getFieldValue("examinationNote"),
        examinationType: "Regular",
        medicineId: null,
        vaccinationInsertDetails: selectedPigData.map((pig) => ({
          pigId: pig.id,
          isHealthy: pig.isHealthy === "healthy",
          diagnosis: pig.diagnosis,
          treatmentMethod: pig.treatmentMethod,
          healthNote: pig.symptoms,
          vaccineName: null,
          lastModifiedTime: dayjs().toISOString(),
          vaccinationInsertMedicationDetails:
            pig.medicines
              ?.filter((med) => med.medicineId && med.quantity)
              .map((med) => ({
                medicineId: med.medicineId,
                quantity: med.quantity,
              })) || [],
        })),
      };

      // Gọi API
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/VaccinationPlan`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Lưu phiếu khám bệnh thành công");
        navigate("/veterinarian/health/medical-history");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data);
      message.error(
        "Lỗi khi lưu phiếu khám bệnh: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Selected pigs updated:", selectedPigs);
  }, [selectedPigs]);

  // Thêm useEffect để debug
  useEffect(() => {
    console.log("PigData updated:", pigData);
  }, [pigData]);

  // Thêm CSS để style cho các hàng bị disable
  const styles = `
    .disabled-row {
      opacity: 0.5;
    }
    
    .disabled-row input:not([type="checkbox"]),
    .disabled-row select,
    .disabled-row textarea,
    .disabled-row .ant-select,
    .disabled-row .ant-picker {
      pointer-events: none !important;
      background-color: #f5f5f5 !important;
    }
    
    .disabled-row .ant-checkbox-wrapper {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    
    .ant-table-row:not(.disabled-row):hover {
      cursor: pointer;
    }
  `;

  // Thêm lọc dữ liệu theo tìm kiếm
  const filteredPigData = pigData.filter((pig) =>
    pig.id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Layout style={pageStyles.layout}>
        <Card bordered={false} style={pageStyles.mainCard}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header */}
            <Row justify="space-between" align="middle">
              <Col>
                <Space align="center">
                  <MedicineBoxOutlined style={pageStyles.headerIcon} />
                  <Title level={3} style={pageStyles.headerTitle}>
                    Tạo phiếu khám bệnh
                  </Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() =>
                      navigate("/veterinarian/health/medical-history")
                    }
                  >
                    Lịch sử khám bệnh
                  </Button>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<SaveOutlined />}
                    disabled={selectedPigs.size === 0}
                  >
                    Lưu phiếu ({selectedPigs.size} con)
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Form tìm kiếm */}
            <Card
              size="small"
              style={pageStyles.searchCard}
              title={
                <Space>
                  <SearchOutlined />
                  <span>Thông tin tìm kiếm</span>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Khu vực"
                    required
                    tooltip="Vui lòng chọn khu vực"
                  >
                    <Select
                      placeholder="Chọn khu"
                      value={selectedArea}
                      onChange={handleAreaChange}
                      style={{ width: "100%" }}
                    >
                      {areas.map((area) => (
                        <Select.Option key={area.id} value={area.id}>
                          {area.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Chuồng"
                    required
                    tooltip="Vui lòng chọn chuồng"
                  >
                    <Select
                      placeholder="Chọn chuồng"
                      value={selectedHouse}
                      onChange={handleHouseChange}
                      style={{ width: "100%" }}
                      disabled={!selectedArea}
                    >
                      {houses.map((house) => (
                        <Select.Option key={house.id} value={house.id}>
                          {house.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Ngày khám"
                    required
                    tooltip="Chọn ngày khám bệnh"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={examDate}
                      onChange={setExamDate}
                      format="DD/MM/YYYY"
                      locale={locale}
                      disabledDate={(current) =>
                        current &&
                        (current < moment().startOf("day") ||
                          current > moment().endOf("day"))
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Kết quả tìm kiếm */}
            {pigData.length > 0 ? (
              <>
                <Card style={pageStyles.statsCard}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="Tổng số heo"
                        value={pigData.length}
                        suffix="con"
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Đã chọn"
                        value={selectedPigs.size}
                        suffix="con"
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Heo khỏe mạnh"
                        value={
                          pigData.filter(
                            (pig) =>
                              selectedPigs.has(pig.id) &&
                              pig.isHealthy === "healthy"
                          ).length
                        }
                        valueStyle={{ color: "#52c41a" }}
                        prefix={<Tag color="success">✓</Tag>}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Heo không khỏe"
                        value={
                          pigData.filter(
                            (pig) =>
                              selectedPigs.has(pig.id) &&
                              pig.isHealthy === "sick"
                          ).length
                        }
                        valueStyle={{ color: "#ff4d4f" }}
                        prefix={<Tag color="error">!</Tag>}
                      />
                    </Col>
                  </Row>
                </Card>

                <Form form={form} layout="vertical">
                  <Form.Item
                    name="examinationNote"
                    label="Ghi chú chung"
                    tooltip="Nhập ghi chú chung cho phiếu khám"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập ghi chú chung..."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Form>

                <Table
                  columns={columns}
                  dataSource={pigData}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  bordered
                  size="middle"
                  scroll={{ x: 1300, y: 500 }}
                  style={pageStyles.table}
                  rowClassName={(record) =>
                    !selectedPigs.has(record.id) ? "disabled-row" : ""
                  }
                />
              </>
            ) : selectedHouse ? (
              <div style={pageStyles.emptyState}>
                <Spin spinning={loading}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy heo trong chuồng này"
                  />
                </Spin>
              </div>
            ) : null}
          </Space>
        </Card>
      </Layout>
      <style>{styles}</style>
    </div>
  );
};

export default CreateHealthRecordPage;
