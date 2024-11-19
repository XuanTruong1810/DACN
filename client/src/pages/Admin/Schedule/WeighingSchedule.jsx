import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Typography,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const WeighingSchedule = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weighingHistories, setWeighingHistories] = useState([]);
  const [stables, setStables] = useState([]); // Cần fetch danh sách chuồng
  const [areas, setAreas] = useState([]); // Danh sách khu vực
  const [selectedArea, setSelectedArea] = useState(null); // Khu vực được chọn
  const [pigs, setPigs] = useState([]); // Danh sách heo trong khu vực

  // Fetch danh sách phiếu cân
  const fetchWeighingHistories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/WeighingHistory`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setWeighingHistories(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách phiếu cân");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm fetch danh sách khu vực
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

  // Thêm hàm fetch danh sách heo theo khu vực
  const fetchPigsByArea = async (areaId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs?AreaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data.items);
      setPigs(response.data.data.items);
    } catch (error) {
      message.error("Không thể tải danh sách heo");
    }
  };

  // Xử lý khi chọn khu vực
  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
    fetchPigsByArea(areaId);
  };

  useEffect(() => {
    fetchWeighingHistories();
    fetchAreas();
  }, []);

  // Columns cho bảng chính
  const columns = [
    {
      title: "Mã phiếu cân",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Ngày cân",
      dataIndex: "weighingDate",
      key: "weighingDate",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng số heo",
      dataIndex: "totalPigs",
      key: "totalPigs",
      width: 120,
      render: (value) => `${value} con`,
    },
    {
      title: "Trọng lượng TB",
      dataIndex: "averageWeight",
      key: "averageWeight",
      width: 150,
      render: (value) => `${value} kg`,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
  ];

  // Columns cho chi tiết
  const expandedRowRender = (record) => {
    const detailColumns = [
      {
        title: "Mã chuồng",
        dataIndex: "stableId",
        key: "stableId",
      },
      {
        title: "Số lượng heo",
        dataIndex: "numberOfPigs",
        key: "numberOfPigs",
        render: (value) => `${value} con`,
      },
      {
        title: "Trọng lượng",
        dataIndex: "weight",
        key: "weight",
        render: (value) => `${value} kg`,
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.details}
        pagination={false}
        rowKey="stableId"
      />
    );
  };

  // Cập nhật Modal tạo phiếu cân
  const WeighingModal = () => (
    <Modal
      title="Tạo phiếu cân mới"
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
        setPigs([]);
        setSelectedArea(null);
      }}
      width={800}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Chọn khu vực */}
        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
        >
          <Select
            placeholder="Chọn khu vực"
            onChange={handleAreaChange}
            options={areas.map((area) => ({
              label: area.name,
              value: area.id,
            }))}
          />
        </Form.Item>

        {/* Danh sách heo và trọng lượng */}
        {selectedArea && (
          <Card title="Danh sách heo cần cân">
            <Form.List name="pigWeights">
              {(fields) => (
                <div style={{ maxHeight: "400px", overflow: "auto" }}>
                  {pigs.map((pig) => (
                    <Row key={pig.id} gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <div>Mã heo: {pig.id}</div>
                        <div>Chuồng: {pig.stableName}</div>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={["pigWeights", pig.id]}
                          label="Cân nặng (kg)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập cân nặng",
                            },
                            {
                              type: "number",
                              transform: (value) => Number(value),
                              message: "Vui lòng nhập số hợp lệ",
                            },
                          ]}
                        >
                          <Input type="number" step="0.1" min={0} />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Card>
        )}

        <Form.Item name="note" label="Ghi chú" style={{ marginTop: 16 }}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Space style={{ float: "right" }}>
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!selectedArea || pigs.length === 0}
            >
              Tạo phiếu cân
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Cập nhật hàm submit
  const handleSubmit = async (values) => {
    try {
      // Format lại dữ liệu từ form
      const weighingData = {
        areaId: values.areaId,
        note: values.note,
        weighingDetails: Object.entries(values.pigWeights.pigWeights || {}).map(
          ([pigId, weight]) => ({
            pigId,
            weight: Number(weight).toFixed(2),
          })
        ),
      };

      console.log("Data sending to server:", weighingData); // Để debug

      // Kiểm tra dữ liệu hợp lệ
      if (weighingData.weighingDetails.length === 0) {
        message.error("Vui lòng nhập ít nhất một cân nặng");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/WeighingHistory`,
        weighingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Tạo phiếu cân thành công");
      setIsModalVisible(false);
      form.resetFields();
      setPigs([]);
      setSelectedArea(null);
      fetchWeighingHistories();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Có lỗi xảy ra khi tạo phiếu cân");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Title level={3}>Danh sách phiếu cân heo</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Tạo phiếu cân
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={weighingHistories}
          rowKey="id"
          loading={loading}
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 10 }}
        />

        <WeighingModal />
      </Card>
    </div>
  );
};

export default WeighingSchedule;
