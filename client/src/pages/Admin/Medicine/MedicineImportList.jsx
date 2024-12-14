/* eslint-disable no-unused-vars */
import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  message,
  Tooltip,
  Tag,
  Statistic,
  Modal,
  Descriptions,
  InputNumber,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const MedicineImportList = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // States
  const [loading, setLoading] = useState(false);
  const [medicineImports, setMedicineImports] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [showViewDetail, setShowViewDetail] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: [],
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(moment());
  const [totalAmount, setTotalAmount] = useState(0);

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 200,
      render: (id) => <Text style={{ fontSize: "14px" }}>{id}</Text>,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Nhập mã phiếu"
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
            >
              Tìm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
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
        record.id.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 200,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm nhà cung cấp"
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
            >
              Tìm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
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
        record.supplierName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <RangePicker
            onChange={(dates) => {
              setSelectedKeys(dates);
            }}
            style={{ marginBottom: 8 }}
          />
          <div>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ marginRight: 8 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
            >
              Xóa
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value || value.length !== 2) return true;
        const recordDate = moment(record.createTime);
        return recordDate.isBetween(value[0], value[1], "day", "[]");
      },
    },
    {
      title: "Người nhận",
      dataIndex: "receivedByName",
      key: "receivedByName",
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusConfig = {
          Pending: { color: "warning", text: "Chờ nhận hàng" },
          Stocked: { color: "success", text: "Đã nhập kho" },
        };
        return (
          <Tag color={statusConfig[status]?.color || "default"}>
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ nhận hàng", value: "Pending" },
        { text: "Đã nhập kho", value: "Stocked" },
      ],
      defaultFilteredValue: ["Pending"],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày nhận dự kiến",
      dataIndex: "expectedDeliveryTime",
      key: "expectedDeliveryTime",
      width: 180,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                getImportDetails(record.id);
                setShowViewDetail(true);
              }}
            />
          </Tooltip>

          {record.status === "Pending" && (
            <>
              <Tooltip title="In phiếu trống">
                <Button
                  type="text"
                  icon={<PrinterOutlined />}
                  onClick={() => {
                    getImportDetails(record.id).then(() => {
                      handlePrintDelivery(record, record.details);
                    });
                  }}
                />
              </Tooltip>
              <Tooltip title="Nhập số liệu">
                <Button
                  type="text"
                  icon={<InboxOutlined />}
                  onClick={() => handleDelivery(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getMedicineImports();
  }, []);

  const getMedicineImports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/MedicineImports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data.data);
      setMedicineImports(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu nhập thuốc");
    }
    setLoading(false);
  };

  const getImportDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/MedicineImports/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSelectedImport(response.data.data);
      setShowViewDetail(true);
    } catch (error) {
      message.error("Lỗi khi tải chi tiết phiếu nhập");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      dateRange: [],
    });
    setSearchText("");
    getMedicineImports();
  };

  const renderDetailModal = () => (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Chi tiết phiếu nhập thuốc</span>
        </Space>
      }
      open={showViewDetail}
      onCancel={() => setShowViewDetail(false)}
      footer={[
        <Button key="close" onClick={() => setShowViewDetail(false)}>
          Đóng
        </Button>,
      ]}
      width={1000}
    >
      {selectedImport && (
        <>
          <Card
            title="Thông tin chung"
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu" span={1}>
                {selectedImport.id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedImport.status === "Pending"
                      ? "warning"
                      : selectedImport.status === "Completed"
                      ? "success"
                      : selectedImport.status === "Stocked"
                      ? "processing"
                      : "default"
                  }
                >
                  {selectedImport.status === "Pending"
                    ? "Chờ nhận hàng"
                    : selectedImport.status === "Completed"
                    ? "Đã nhận hàng"
                    : selectedImport.status === "Stocked"
                    ? "Đã nhập kho"
                    : selectedImport.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Nhà cung cấp">
                {selectedImport.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedImport.receivedByName}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {moment(selectedImport.createTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhận dự kiến">
                {moment(selectedImport.expectedDeliveryTime).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>

              {selectedImport.deliveryTime && (
                <Descriptions.Item label="Ngày nhận thực tế">
                  {moment(selectedImport.deliveryTime).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {selectedImport.stockTime && (
                <Descriptions.Item label="Ngày nhập kho">
                  {moment(selectedImport.stockTime).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card
            title="Thông tin thanh toán"
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8} key="totalPrice">
                <Statistic
                  title={
                    <Text strong>
                      {selectedImport.status === "Pending"
                        ? "Tổng tiền hàng dự kiến"
                        : "Tổng tiền hàng"}
                    </Text>
                  }
                  value={
                    selectedImport.status === "Pending"
                      ? selectedImport.details.reduce(
                          (sum, item) =>
                            sum + item.expectedQuantity * item.unitPrice,
                          0
                        )
                      : selectedImport.totalPrice
                  }
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#cf1322" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Col>
              <Col span={8} key="deposit">
                <Statistic
                  title="Đã đặt cọc"
                  value={selectedImport.deposit}
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#3f8600" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Col>
              <Col span={8} key="remaining">
                <Statistic
                  title="Còn phải trả"
                  value={
                    selectedImport.status === "Pending"
                      ? selectedImport.details.reduce(
                          (sum, item) =>
                            sum + item.expectedQuantity * item.unitPrice,
                          0
                        ) - selectedImport.deposit
                      : selectedImport.totalPrice - selectedImport.deposit
                  }
                  precision={0}
                  suffix="đ"
                  valueStyle={{ color: "#1890ff" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Col>
            </Row>
          </Card>

          <Card title="Chi tiết đơn hàng" bordered={false}>
            <Table
              dataSource={selectedImport.details}
              columns={[
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
                  title: "Đơn vị",
                  dataIndex: "unit",
                  key: "unit",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  render: (price) => `${price.toLocaleString()}đ`,
                },
                {
                  title: "Số lượng yêu cầu",
                  dataIndex: "expectedQuantity",
                  key: "expectedQuantity",
                },
                {
                  title: "Số lượng thực tế",
                  dataIndex: "actualQuantity",
                  key: "actualQuantity",
                },
                {
                  title: "Số lượng từ chối",
                  dataIndex: "rejectQuantity",
                  key: "rejectQuantity",
                  render: (value) => <Text type="danger">{value}</Text>,
                },
                {
                  title: "Số lượng nhận",
                  dataIndex: "receivedQuantity",
                  key: "receivedQuantity",
                  render: (value) => <Text type="success">{value}</Text>,
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  render: (_, record) =>
                    `${(
                      record.actualQuantity * record.unitPrice
                    )?.toLocaleString()}đ`,
                },
              ]}
              pagination={false}
              summary={(pageData) => {
                const totalAmount = pageData.reduce(
                  (sum, item) => sum + item.unitPrice * item.actualQuantity,
                  0
                );
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={8}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{totalAmount.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </>
      )}
    </Modal>
  );

  const calculateTotal = (details) => {
    return details.reduce(
      (sum, item) => sum + item.actualQuantity * item.unitPrice,
      0
    );
  };

  const handleQuantityChange = (index, value, field) => {
    const newDetails = [...deliveryDetails];

    if (field === "receivedQuantity") {
      // Khi thay đổi số lượng giao tới
      newDetails[index].receivedQuantity = value;
      // Tự động cập nhật số lượng chấp nhận bằng với số lượng giao tới
      newDetails[index].actualQuantity = Math.min(
        value, // không vượt quá số lượng giao tới
        newDetails[index].expectedQuantity // và không vượt quá số lượng yêu cầu
      );
    } else if (field === "actualQuantity") {
      // Khi thay đổi số lượng chấp nhận
      // Đảm bảo số lượng chấp nhận không vượt quá số lượng giao tới
      newDetails[index].actualQuantity = Math.min(
        value,
        newDetails[index].receivedQuantity
      );
    }

    setDeliveryDetails(newDetails);
    setTotalAmount(calculateTotal(newDetails));
  };

  const handleDelivery = (record) => {
    setSelectedDelivery(record);
    const initialDetails = record.details.map((detail) => ({
      ...detail,
      actualQuantity: detail.expectedQuantity,
      receivedQuantity: detail.expectedQuantity,
    }));
    setDeliveryDetails(initialDetails);
    setDeliveryDate(moment());
    setTotalAmount(calculateTotal(initialDetails));
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirm = async () => {
    try {
      // 1. Gọi API xác nhận giao hàng
      await axios.post(
        `${API_URL}/api/MedicineImports/${selectedDelivery.id}/delivery`,
        {
          deliveryTime: deliveryDate.toISOString(),
          details: deliveryDetails.map((detail) => ({
            medicineId: detail.medicineId,
            acceptedQuantity: detail.actualQuantity,
            receivedQuantity: detail.receivedQuantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 2. Gọi API nhập kho ngay sau khi giao hàng thành công
      await axios.post(
        `${API_URL}/api/MedicineImports/${selectedDelivery.id}/stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Đã giao hàng và nhập kho thành công");
      setShowDeliveryModal(false);
      getMedicineImports();
    } catch (error) {
      console.error("Lỗi:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Có lỗi xảy ra khi xử lý giao hàng và nhập kho");
      }
    }
  };

  const handleStock = async (id) => {
    try {
      await axios.post(
        `${API_URL}/api/MedicineImports/${id}/stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Nhập kho thành công");
      getMedicineImports();
    } catch (error) {
      message.error("Lỗi khi nhập kho");
    }
  };

  const handlePrintDelivery = useCallback(
    (record, details) => {
      const fileName = `Phieu_Giao_${record.id}_${dayjs().format("DDMMYYYY")}`;
      console.log(record);
      const printWindow = window.open("", fileName);
      printWindow.document.write(`
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
            }
            .info { 
              margin-bottom: 20px;
              line-height: 1.5;
            }
            .total {
              text-align: right;
              margin-top: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHIẾU GIAO THUỐC</h2>
            <p>Ngày in: ${dayjs().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
          
          <div class="info">
            <p><strong>Mã phiếu:</strong> ${record.id}</p>
            <p><strong>Nhà cung cấp:</strong> ${record.supplierName}</p>
            <p><strong>Ngày giao dự kiến:</strong> ${moment(
              deliveryDate
            ).format("DD/MM/YYYY HH:mm")}</p>
            <p><strong>Ngày giao thực tế:</strong>........................</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên thuốc</th>
                <th>Yêu cầu</th>
                <th>Thực tế</th>
                <th>Chấp nhận</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${details
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.medicineName}</td>
                  <td>${
                    item.expectedQuantity
                      ? `${item.expectedQuantity} ${item.unit}`
                      : "..........."
                  }</td>
                  <td>${
                    item.actualQuantity
                      ? `${item.actualQuantity} ${item.unit}`
                      : "..........."
                  }</td>
                  <td>${
                    item.receivedQuantity
                      ? `${item.receivedQuantity} ${item.unit}`
                      : "..........."
                  }</td>
                  <td>${item.unitPrice?.toLocaleString()}đ</td>
                  <td>${(
                    item.receivedQuantity * item.unitPrice
                  )?.toLocaleString()}đ</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total">
            <p>Tổng tiền hàng: ${
              record.totalAmount
                ? record.totalAmount.toLocaleString()
                : "........................"
            }đ</p>
            <p>Đã đặt cọc: ${record.deposit?.toLocaleString()}đ</p>
            <p>Còn phải thanh toán: ${
              record.receivedAmount
                ? record.receivedAmount.toLocaleString()
                : "........................"
            }đ</p>
          </div>

          <div style="margin-top: 50px;">
            <table style="width: 100%; border: none;">
              <tr style="border: none;">
                <td style="width: 33%; border: none; text-align: center;">
                  <p><strong>Người giao hàng</strong></p>
                  <p style="margin-top: 50px; margin-bottom: 0;">Ký tên</p>
                  <p style="margin-top: 40px;">.........................</p>
                  <p style="margin-top: 5px;">(Ghi rõ họ tên)</p>
                </td>
                <td style="width: 33%; border: none; text-align: center;">
                  <p><strong>Người nhận hàng</strong></p>
                  <p style="margin-top: 50px; margin-bottom: 0;">Ký tên</p>
                  <p style="margin-top: 40px;">.........................</p>
                  <p style="margin-top: 5px;">(Ghi rõ họ tên)</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
    },
    [deliveryDate]
  );

  const renderDeliveryModal = () => (
    <Modal
      title="Nhập số liệu giao hàng"
      open={showDeliveryModal}
      onOk={handleDeliveryConfirm}
      onCancel={() => setShowDeliveryModal(false)}
      width={1000}
    >
      <Form layout="vertical">
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={<Text strong>Tiền đã cọc</Text>}
                value={selectedDelivery?.deposit || 0}
                precision={0}
                suffix="đ"
                valueStyle={{ color: "#52c41a" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={<Text strong>Tổng tiền</Text>}
                value={totalAmount}
                precision={0}
                suffix="đ"
                valueStyle={{ color: "#1890ff" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={<Text strong>Còn phải trả</Text>}
                value={totalAmount - (selectedDelivery?.deposit || 0)}
                precision={0}
                suffix="đ"
                valueStyle={{ color: "#ff4d4f" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Card>
          </Col>
        </Row>

        <Form.Item label="Ngày nhận hàng" required>
          <DatePicker
            value={deliveryDate}
            onChange={setDeliveryDate}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Table
          dataSource={deliveryDetails}
          columns={[
            {
              title: "Tên thuốc",
              dataIndex: "medicineName",
              key: "medicineName",
            },
            {
              title: "Số lượng yêu cầu",
              dataIndex: "expectedQuantity",
              key: "expectedQuantity",
            },
            {
              title: "Số lượng giao tới",
              dataIndex: "receivedQuantity",
              key: "receivedQuantity",
              render: (_, record, index) => (
                <InputNumber
                  min={0}
                  value={record.receivedQuantity}
                  onChange={(value) =>
                    handleQuantityChange(index, value, "receivedQuantity")
                  }
                />
              ),
            },
            {
              title: "Số lượng chấp nhận",
              dataIndex: "actualQuantity",
              key: "actualQuantity",
              render: (_, record, index) => (
                <InputNumber
                  min={0}
                  max={record.receivedQuantity}
                  value={record.actualQuantity}
                  onChange={(value) =>
                    handleQuantityChange(index, value, "actualQuantity")
                  }
                />
              ),
            },
            {
              title: "Đơn giá",
              dataIndex: "unitPrice",
              key: "unitPrice",
              render: (price) => `${price?.toLocaleString()}đ`,
            },
            {
              title: "Thành tiền",
              key: "total",
              render: (_, record) =>
                `${(
                  record.actualQuantity * record.unitPrice
                )?.toLocaleString()}đ`,
            },
          ]}
          pagination={false}
          summary={(pageData) => {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{totalAmount.toLocaleString()}đ</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Chờ nhận hàng</Text>}
              value={
                medicineImports.filter((r) => r.status === "Pending").length
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Đã nhập kho</Text>}
              value={
                medicineImports.filter((r) => r.status === "Stocked").length
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng số phiếu</Text>}
              value={medicineImports.length}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng tiền</Text>}
              value={medicineImports.reduce(
                (total, item) => total + (item.totalPrice || 0),
                0
              )}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#eb2f96", fontSize: 24 }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
      </Row>
      <Card className="main-table-card">
        <Title level={4}>Danh sách phiếu nhập thuốc</Title>
        <Table
          columns={columns}
          dataSource={[
            ...medicineImports.filter((item) => item.status === "Pending"),
            ...medicineImports.filter((item) => item.status !== "Pending"),
          ]}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phiếu nhập`,
          }}
        />
      </Card>
      {renderDeliveryModal()}
      {renderDetailModal()}
    </div>
  );
};

export default MedicineImportList;
