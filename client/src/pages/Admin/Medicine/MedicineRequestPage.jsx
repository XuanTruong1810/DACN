/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Modal,
  Descriptions,
  Divider,
  Input,
  InputNumber,
} from "antd";
import {
  InfoCircleOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const MedicineRequestPage = () => {
  // States
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineDetail, setShowMedicineDetail] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBill, setShowBill] = useState(true);
  const [allSelectedMedicines, setAllSelectedMedicines] = useState([]);
  const [note, setNote] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    type: "all", // all, medicine, vaccine
    stock: "all", // all, outOfStock, lowStock, inStock
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/Medicine`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const formattedMedicines = response.data.data.map((med) => ({
        ...med,
        expectedAmount: 1,
        isOutOfStock: med.quantityInStock === 0,
      }));

      setMedicines(formattedMedicines);
    } catch (error) {
      message.error("Lỗi khi tải danh sách thuốc");
    }
    setLoading(false);
  };

  const handleProductSelect = (medicine) => {
    const exists = allSelectedMedicines.find((m) => m.id === medicine.id);
    if (exists) {
      setAllSelectedMedicines((prev) =>
        prev.filter((m) => m.id !== medicine.id)
      );
    } else {
      setAllSelectedMedicines((prev) => [
        ...prev,
        {
          ...medicine,
          expectedAmount: medicine.quantityRequired || 40,
        },
      ]);
    }
  };

  const createImportRequest = async () => {
    const invalidMedicines = allSelectedMedicines.filter(
      (med) =>
        !med.expectedAmount || med.expectedAmount < (med.quantityRequired || 40)
    );

    if (invalidMedicines.length > 0) {
      message.error("Vui lòng nhập số lượng hợp lệ cho tất cả thuốc");
      return;
    }

    try {
      const requestData = {
        note: note || "Yêu cầu nhập thuốc",
        details: allSelectedMedicines.map((med) => ({
          medicineId: med.id,
          quantity: med.expectedAmount,
          note: `Yêu cầu nhập ${med.expectedAmount} ${med.unit} ${med.medicineName}`,
        })),
      };

      await axios.post(`${API_URL}/api/MedicineRequest`, requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      message.success("Tạo phiếu yêu cầu thành công");
      setAllSelectedMedicines([]);
      setNote("");
    } catch (error) {
      console.error("Error creating request:", error);
      message.error("Lỗi khi tạo phiếu yêu cầu");
    }
  };

  const checkQuantityStatus = (medicine) => {
    if (medicine.quantityInStock === 0) {
      return {
        status: "error",
        text: "Hết hàng",
      };
    }

    const threshold = 500;
    if (medicine.quantityInStock < threshold) {
      return {
        status: "warning",
        text: "Cần nhập thêm",
      };
    }

    return null;
  };

  const getFilteredMedicines = () => {
    return medicines.filter((med) => {
      // Filter by search text
      if (
        searchText &&
        !med.medicineName.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }

      // Filter by type
      if (filters.type !== "all") {
        if (filters.type === "vaccine" && !med.isVaccine) return false;
        if (filters.type === "medicine" && med.isVaccine) return false;
      }

      // Filter by stock status
      if (filters.stock !== "all") {
        if (filters.stock === "outOfStock" && med.quantityInStock > 0)
          return false;
        if (
          filters.stock === "lowStock" &&
          (med.quantityInStock === 0 || med.quantityInStock >= 500)
        )
          return false;
        if (filters.stock === "inStock" && med.quantityInStock < 500)
          return false;
      }

      return true;
    });
  };

  const handleQuantityChange = (medicineId, value) => {
    if (value === null || value < 40) {
      message.warning("Số lượng tối thiểu phải là 40");
      return;
    }

    setMedicines((prev) =>
      prev.map((med) =>
        med.id === medicineId ? { ...med, quantityRequired: value } : med
      )
    );
  };

  const columns = [
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Loại",
      dataIndex: "isVaccine",
      key: "isVaccine",
      render: (isVaccine) => (
        <Tag color={isVaccine ? "blue" : "green"}>
          {isVaccine ? "Vaccine" : "Thuốc"}
        </Tag>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      render: (stock, record) => {
        const status = checkQuantityStatus(record);
        return (
          <Space>
            {stock} {record.unit}
            {status && <Tag color={status.status}>{status.text}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Số lượng tối thiểu nên nhập",
      dataIndex: "quantityRequired",
      key: "quantityRequired",
      width: 200,
      render: (quantityRequired, record) => (
        <Text>
          {quantityRequired || 0} {record.unit}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => {
              setSelectedMedicine(record);
              setShowMedicineDetail(true);
            }}
          />
          <Button
            type={
              allSelectedMedicines.find((m) => m.id === record.id)
                ? "primary"
                : "default"
            }
            onClick={() => handleProductSelect(record)}
          >
            {allSelectedMedicines.find((m) => m.id === record.id)
              ? "Đã chọn"
              : "Chọn"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3}>Yêu cầu nhập thuốc</Typography.Title>
        <Typography.Text type="secondary">
          Tạo phiếu yêu cầu nhập thuốc và vaccine cho trang trại
        </Typography.Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={showBill ? 16 : 24}>
          <Card
            title={
              <Space>
                <MedicineBoxOutlined />
                <span>Danh sách thuốc</span>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Input.Search
                    placeholder="Tìm kiếm theo tên thuốc..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col span={8}>
                  <Select
                    style={{ width: "100%" }}
                    value={filters.type}
                    onChange={(value) =>
                      setFilters((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <Option value="all">Tất cả loại</Option>
                    <Option value="medicine">Thuốc</Option>
                    <Option value="vaccine">Vaccine</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    style={{ width: "100%" }}
                    value={filters.stock}
                    onChange={(value) =>
                      setFilters((prev) => ({ ...prev, stock: value }))
                    }
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="outOfStock">Hết hàng</Option>
                    <Option value="lowStock">Sắp hết hàng {"<"} 500</Option>
                    <Option value="inStock">Còn hàng</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={columns}
              dataSource={getFilteredMedicines()}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
              }}
            />
          </Card>
        </Col>

        {showBill && (
          <Col span={8}>
            <Card
              title={
                <Space>
                  <FileDoneOutlined />
                  <span>Phiếu yêu cầu nhập thuốc</span>
                </Space>
              }
              className="request-bill"
              style={{ position: "sticky", top: 24 }}
            >
              <div
                style={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}
              >
                {allSelectedMedicines.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    style={{
                      padding: "16px",
                      background: index % 2 === 0 ? "#fafafa" : "#fff",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                      },
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ fontSize: "16px" }}>
                          {medicine.medicineName}
                        </Text>
                        <Tag color={medicine.isVaccine ? "blue" : "green"}>
                          {medicine.isVaccine ? "Vaccine" : "Thuốc"}
                        </Tag>
                      </div>
                      <div
                        style={{
                          color: "#666",
                          fontSize: "13px",
                          marginTop: "4px",
                        }}
                      >
                        Tồn kho: {medicine.quantityInStock} {medicine.unit}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text type="secondary">Số lượng yêu cầu:</Text>
                        <InputNumber
                          min={medicine.quantityRequired || 40}
                          defaultValue={medicine.expectedAmount}
                          onChange={(value) => {
                            if (
                              value === null ||
                              value < (medicine.quantityRequired || 40)
                            ) {
                              message.warning(
                                `Số lượng tối thiểu phải là ${
                                  medicine.quantityRequired || 40
                                } ${medicine.unit}`
                              );
                              return;
                            }
                            setAllSelectedMedicines((prev) =>
                              prev.map((item) =>
                                item.id === medicine.id
                                  ? { ...item, expectedAmount: value }
                                  : item
                              )
                            );
                          }}
                          style={{ width: "120px", marginLeft: "8px" }}
                          addonAfter={medicine.unit}
                        />
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleProductSelect(medicine)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              <div style={{ padding: "0 8px 16px" }}>
                <Text strong>Ghi chú:</Text>
                <Input.TextArea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú cho phiếu yêu cầu..."
                  style={{ marginTop: "8px" }}
                  rows={3}
                />
              </div>

              <Button
                type="primary"
                block
                size="large"
                onClick={createImportRequest}
                disabled={allSelectedMedicines.length === 0}
              >
                Tạo phiếu yêu cầu ({allSelectedMedicines.length} thuốc)
              </Button>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title={
          <Space>
            <MedicineBoxOutlined />
            <span>Chi tiết thuốc</span>
          </Space>
        }
        open={showMedicineDetail}
        onCancel={() => setShowMedicineDetail(false)}
        footer={
          <Button
            type="primary"
            onClick={() => {
              handleProductSelect(selectedMedicine);
              setShowMedicineDetail(false);
            }}
          >
            {allSelectedMedicines.find((m) => m.id === selectedMedicine?.id)
              ? "Xóa khỏi phiếu"
              : "Thêm vào phiếu"}
          </Button>
        }
        width={700}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên thuốc" span={2}>
            {selectedMedicine?.medicineName}
          </Descriptions.Item>
          <Descriptions.Item label="Loại">
            {selectedMedicine?.isVaccine ? "Vaccine" : "Thuốc"}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị">
            {selectedMedicine?.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {selectedMedicine?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho">
            <Space>
              {selectedMedicine?.quantityInStock} {selectedMedicine?.unit}
              {selectedMedicine?.isOutOfStock ? (
                <Tag color="error">Hết hàng</Tag>
              ) : (
                selectedMedicine?.quantityInStock < 100 && (
                  <Tag color="warning">Sắp hết</Tag>
                )
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Cách dùng">
            {selectedMedicine?.usage}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default MedicineRequestPage;
