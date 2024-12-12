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
  InputNumber,
  Divider,
} from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SaveOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const VaccinationForm = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pigData, setPigData] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);

  const vaccineId = searchParams.get("vaccineId");
  const date = searchParams.get("date");

  useEffect(() => {
    fetchPigSchedule();
    fetchMedicines();
  }, [vaccineId, date]);

  const fetchPigSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/VaccinationPlan/pigs`,
        {
          params: {
            vaccineId,
            date,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const pigs = response.data.data.map((pig) => ({
          ...pig,
          isHealthy: "healthy",
          diagnosis: "Khỏe mạnh",
          healthNote: "",
          treatmentMethod: "Tiêm vaccine",
        }));
        setPigData(pigs);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách heo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setMedicineLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Medicine`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            isVaccine: true,
          },
        }
      );

      if (response.status === 200) {
        setMedicines(response.data.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách thuốc: " + error.message);
    } finally {
      setMedicineLoading(false);
    }
  };

  const handleHealthStatusChange = (record, value) => {
    const newData = pigData.map((item) => {
      if (item.pigId === record.pigId) {
        return {
          ...item,
          isHealthy: value,
          diagnosis: value === "healthy" ? null : "",
          treatmentMethod: value === "healthy" ? null : "",
          healthNote: value === "healthy" ? null : "",
          nextVaccinationDate: value === "healthy" ? null : null,
          medicines: value === "healthy" ? [] : item.medicines || [],
        };
      }
      return item;
    });
    setPigData(newData);
    updateHealthCounts(newData);
  };

  const updateHealthCounts = (data) => {
    const healthy = data.filter((pig) => pig.isHealthy === "healthy").length;
    const sick = data.filter((pig) => pig.isHealthy === "sick").length;
    setHealthyCount(healthy);
    setSickCount(sick);
  };

  const handleSubmit = async () => {
    try {
      const invalidPigs = pigData.filter((pig) => {
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

      const payload = {
        examinationDate: dayjs(date)
          .startOf("day")
          .add(7, "hour")
          .toISOString(),
        examinationNote: form.getFieldValue("examinationNote"),
        examinationType: "vaccination",
        medicineId: vaccineId,
        vaccinationInsertDetails: pigData.map((pig) => ({
          pigId: pig.pigId,
          isHealthy: pig.isHealthy === "healthy",
          diagnosis: pig.isHealthy === "sick" ? pig.diagnosis : null,
          treatmentMethod:
            pig.isHealthy === "sick" ? pig.treatmentMethod : null,
          vaccineName: vaccineId,
          lastModifiedTime: dayjs(pig.nextVaccinationDate)
            .startOf("day")
            .add(7, "hour")
            .toISOString(),
          vaccinationInsertMedicationDetails:
            pig.isHealthy === "sick" && pig.medicines
              ? pig.medicines
                  .filter((med) => med.medicineId && med.quantity)
                  .map((med) => ({
                    medicineId: med.medicineId,
                    quantity: med.quantity,
                  }))
              : [],
        })),
      };
      console.log(payload);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/VaccinationPlan`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Ghi nhận tiêm chủng thành công");
        navigate(-1);
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error submitting vaccination:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi ghi nhận tiêm chủng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = (record) => {
    const newData = [...pigData];
    const index = newData.findIndex((item) => item.pigId === record.pigId);

    if (!newData[index].medicines) {
      newData[index].medicines = [];
    }

    newData[index].medicines.push({
      medicineId: undefined,
      quantity: 1,
      key: Date.now(),
    });

    setPigData(newData);
  };

  const handleRemoveMedicine = (record, medicineIndex) => {
    const newData = [...pigData];
    const index = newData.findIndex((item) => item.pigId === record.pigId);

    newData[index].medicines.splice(medicineIndex, 1);

    setPigData(newData);
  };

  const handleMedicineChange = (record, medicineIndex, field, value) => {
    const newData = [...pigData];
    const index = newData.findIndex((item) => item.pigId === record.pigId);

    newData[index].medicines[medicineIndex][field] = value;

    if (field === "medicineId") {
      newData[index].medicines[medicineIndex].quantity = 1;
    }

    setPigData(newData);
  };

  const hasMedicines = (record) => {
    return (
      record.medicines &&
      record.medicines.length > 0 &&
      record.medicines.some((med) => med.medicineId && med.quantity)
    );
  };

  const canShowButton = () => {
    const today = dayjs().startOf("day");
    const selectedDate = dayjs(date).startOf("day");
    return !selectedDate.isAfter(today); // true nếu selectedDate <= today
  };

  const columns = [
    {
      title: "Thông tin cơ bản",
      children: [
        {
          title: "Mã heo",
          dataIndex: "pigId",
          width: 100,
          fixed: "left",
          render: (id) => <Tag color="blue">{id}</Tag>,
        },
        {
          title: "Chuồng",
          dataIndex: "stableName",
          width: 100,
        },
        {
          title: "Tình trạng",
          width: 120,
          render: (_, record) => (
            <Select
              style={{ width: "100%" }}
              value={record.isHealthy}
              onChange={(value) => handleHealthStatusChange(record, value)}
              size="small"
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
      ],
    },
    {
      title: "Thông tin khám bệnh",
      children: [
        {
          title: "Chẩn đoán",
          width: 180,
          render: (_, record) =>
            record.isHealthy === "sick" && (
              <TextArea
                placeholder="Nhập chẩn đoán..."
                value={record.diagnosis}
                onChange={(e) => {
                  const newData = [...pigData];
                  const index = newData.findIndex(
                    (item) => item.pigId === record.pigId
                  );
                  newData[index] = {
                    ...newData[index],
                    diagnosis: e.target.value,
                  };
                  setPigData(newData);
                }}
                rows={2}
                size="small"
              />
            ),
        },
        {
          title: "Phương pháp điều trị",
          width: 180,
          render: (_, record) =>
            record.isHealthy === "sick" && (
              <TextArea
                placeholder="Nhập phương pháp..."
                value={record.treatmentMethod}
                onChange={(e) => {
                  const newData = [...pigData];
                  const index = newData.findIndex(
                    (item) => item.pigId === record.pigId
                  );
                  newData[index] = {
                    ...newData[index],
                    treatmentMethod: e.target.value,
                  };
                  setPigData(newData);
                }}
                rows={2}
                size="small"
              />
            ),
        },
      ],
    },
    {
      title: "Thuốc điều trị",
      width: 250,
      render: (_, record) =>
        record.isHealthy === "sick" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {record.medicines?.map((medicine, index) => (
              <div
                key={medicine.key}
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <Select
                  style={{ width: 120 }}
                  placeholder="Chọn thuốc"
                  value={medicine.medicineId}
                  onChange={(value) =>
                    handleMedicineChange(record, index, "medicineId", value)
                  }
                  loading={medicineLoading}
                  size="small"
                >
                  {medicines.map((med) => (
                    <Select.Option key={med.id} value={med.id}>
                      {med.medicineName}
                    </Select.Option>
                  ))}
                </Select>
                <InputNumber
                  style={{ width: 70 }}
                  min={0}
                  placeholder="Liều"
                  value={medicine.quantity}
                  onChange={(value) =>
                    handleMedicineChange(record, index, "quantity", value)
                  }
                  addonAfter="ml"
                  size="small"
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveMedicine(record, index)}
                />
              </div>
            ))}
            <Button
              type="link"
              onClick={() => handleAddMedicine(record)}
              size="small"
              icon={<PlusOutlined />}
              style={{ width: "fit-content", padding: "0" }}
            >
              Thêm
            </Button>
          </div>
        ),
    },
    {
      title: "Ngày tiêm lại",
      width: 120,
      render: (_, record) =>
        record.isHealthy === "sick" && (
          <DatePicker
            style={{ width: "100%" }}
            value={
              record.nextVaccinationDate
                ? dayjs(record.nextVaccinationDate)
                : null
            }
            onChange={(date) => {
              const newData = [...pigData];
              const index = newData.findIndex(
                (item) => item.pigId === record.pigId
              );
              newData[index] = { ...newData[index], nextVaccinationDate: date };
              setPigData(newData);
            }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
            size="small"
          />
        ),
    },
  ];

  return (
    <Layout className="fade-in">
      <Layout style={{ padding: "24px", minHeight: "calc(100vh - 64px)" }}>
        <Card className="custom-card">
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Thông tin tiêm chủng">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Ngày tiêm:</Text>{" "}
                      <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>
                    </div>
                    <div>
                      <Text strong>Mã vaccine:</Text> <Text>{vaccineId}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thống kê">
                  <Space wrap>
                    <Statistic
                      title="Tổng số heo"
                      value={pigData.length}
                      suffix="con"
                    />
                    <Divider type="vertical" />
                    <Tag color="success">
                      Khỏe mạnh:{" "}
                      {pigData.filter((p) => p.isHealthy === "healthy").length}
                    </Tag>
                    <Tag color="error">
                      Không khỏe:{" "}
                      {pigData.filter((p) => p.isHealthy === "sick").length}
                    </Tag>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Form form={form} layout="vertical">
              <Form.Item name="examinationNote" label="Ghi chú chung">
                <TextArea rows={4} placeholder="Nhập ghi chú chung..." />
              </Form.Item>
            </Form>

            <Table
              columns={columns}
              dataSource={pigData}
              rowKey="pigId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng số: ${total} con`,
              }}
              bordered
              size="small"
              scroll={{ y: 500 }}
            />

            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={() => navigate(-1)}>Hủy</Button>
                {canShowButton() && (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<SaveOutlined />}
                    disabled={pigData.length === 0}
                  >
                    Lưu phiếu tiêm ({pigData.length} con)
                  </Button>
                )}
              </Space>
            </div>
          </Space>
        </Card>
      </Layout>
    </Layout>
  );
};

export default VaccinationForm;
