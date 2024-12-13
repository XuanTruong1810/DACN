/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  message,
  Modal,
  Tag,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Tooltip,
  Divider,
  Select,
  Form,
  Statistic,
  Avatar,
  Input,
  Alert,
} from "antd";
import {
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  SearchOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "./styles/MedicineRequestApproval.css";

const { Text, Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;
const { RangePicker } = DatePicker;

const MedicineRequestApproval = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [requestDetails, setRequestDetails] = useState([]);
  const [approving, setApproving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [deliveryDates, setDeliveryDates] = useState({});
  const [selectedSupplierInfo, setSelectedSupplierInfo] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectDetails, setRejectDetails] = useState({});
  const [showViewDetail, setShowViewDetail] = useState(false);
  const [filters, setFilters] = useState({
    id: "",
    dateRange: [],
    status: null,
  });

  useEffect(() => {
    getRequests();
    getSuppliers();
  }, []);

  const getRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/MedicineRequest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phiếu đề xuất");
    }
    setLoading(false);
  };

  const getSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/Suppliers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          typeSupplier: "medicine",
          status: "active",
        },
      });
      setSuppliers(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhà cung cấp");
    }
  };

  const getRequestDetails = async (requestId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/MedicineRequest/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRequestDetails(response.data.data.details);
      setSelectedRequest(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải chi tiết phiếu đề xuất");
    }
  };

  const getSupplierInfo = async (supplierId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/Suppliers/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSelectedSupplierInfo((prev) => ({
        ...prev,
        [supplierId]: response.data.data,
      }));
    } catch (error) {
      message.error("Lỗi khi tải thông tin nhà cung cấp");
    }
  };

  const handleDetailChange = (medicineId, field, value) => {
    setSelectedDetails((prev) => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        [field]: value,
      },
    }));

    if (field === "supplierId" && value) {
      getSupplierInfo(value);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const groupedDetails = groupDetailsBySupplier();

      // Format accepts - nhóm theo supplier
      const accepts = Object.values(groupedDetails.assigned).map((group) => ({
        expectedDeliveryTime: deliveryDates[group.supplierId],
        deposit: selectedDetails[`group_${group.supplierId}`]?.deposit || 0,
        supplierId: group.supplierId,
        status: "Pending",
        note: "",
        details: group.items.map((item) => ({
          medicineId: item.medicineId,
          unitPrice: selectedDetails[item.medicineId]?.price || 0,
          expectedQuantity: item.quantity,
        })),
      }));

      // Format rejects
      const rejects = groupedDetails.unassigned.map((item) => ({
        medicineId: item.medicineId,
        reason: rejectDetails[item.medicineId] || rejectNote,
      }));

      await axios.post(
        `${API_URL}/api/MedicineRequest/${selectedRequest.id}/approve`,
        {
          accepts,
          rejects,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Phê duyệt phiếu yêu cầu thành công");
      getRequests();
      setShowDetail(false);
      setShowRejectModal(false);
    } catch (error) {
      message.error("Lỗi khi phê duyệt phiếu yêu cầu");
      console.error(error);
    }
    setApproving(false);
  };

  const handleReject = async () => {
    try {
      await axios.post(
        `${API_URL}/api/MedicineRequest/reject/${selectedRequest.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Đã từ chối phiếu yêu cầu");
      getRequests();
      setShowDetail(false);
    } catch (error) {
      message.error("Lỗi khi từ chối phiếu yêu cầu");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getPresetRanges = () => ({
    "Hôm nay": [moment().startOf("day"), moment().endOf("day")],
    "Hôm qua": [
      moment().subtract(1, "days").startOf("day"),
      moment().subtract(1, "days").endOf("day"),
    ],
    "7 ngày qua": [
      moment().subtract(6, "days").startOf("day"),
      moment().endOf("day"),
    ],
    "30 ngày qua": [
      moment().subtract(29, "days").startOf("day"),
      moment().endOf("day"),
    ],
    "Tháng này": [moment().startOf("month"), moment().endOf("month")],
    "Tháng trước": [
      moment().subtract(1, "month").startOf("month"),
      moment().subtract(1, "month").endOf("month"),
    ],
  });

  const requestColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
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
            onPressEnter={() => {
              confirm();
              handleFilterChange("id", selectedKeys[0]);
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm();
                handleFilterChange("id", selectedKeys[0]);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                handleFilterChange("id", "");
              }}
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
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 16, maxWidth: 400 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => {
                setSelectedKeys(dates);
                handleFilterChange("dateRange", dates);
              }}
              style={{ width: "100%" }}
              ranges={getPresetRanges()}
              format="DD/MM/YYYY"
              allowClear
            />
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                }}
                size="small"
              >
                Áp dụng
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  handleFilterChange("dateRange", []);
                }}
                size="small"
              >
                Xóa bộ lọc
              </Button>
            </Space>
            <Divider style={{ margin: "8px 0" }} />
            <Space wrap>
              {Object.entries(getPresetRanges()).map(([label, [startDate]]) => (
                <Tag
                  key={label}
                  color="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const range = getPresetRanges()[label];
                    setSelectedKeys(range);
                    handleFilterChange("dateRange", range);
                    confirm();
                  }}
                >
                  {label}
                </Tag>
              ))}
            </Space>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          Pending: { color: "warning", text: "Chờ duyệt" },
          Completed: { color: "success", text: "Đã duyệt" },
        };
        return (
          <Tag color={statusConfig[status]?.color || "default"}>
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "Pending" },
        { text: "Đã duyệt", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
      filterMultiple: false,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "Không có ghi chú",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "Completed" ? (
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                getRequestDetails(record.id);
                setShowViewDetail(true);
              }}
            >
              Chi tiết
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                getRequestDetails(record.id);
                setShowDetail(true);
              }}
            >
              Duyệt phiếu
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => `${quantity} ${record.unit}`,
    },
    {
      title: "Đơn giá / đơn vị",
      key: "price",
      width: 200,
      render: (_, record) => (
        <Form.Item
          validateStatus={
            !selectedDetails[record.medicineId]?.price ? "error" : ""
          }
          required
        >
          <InputNumber
            className="w-full"
            min={0}
            style={{ marginTop: 28 }}
            value={selectedDetails[record.medicineId]?.price}
            onChange={(value) =>
              handleDetailChange(record.medicineId, "price", value)
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            addonAfter="đ"
          />
        </Form.Item>
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      render: (_, record) => (
        <Text strong>
          {(
            (selectedDetails[record.medicineId]?.price || 0) * record.quantity
          ).toLocaleString()}
          đ
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() =>
            handleDetailChange(record.medicineId, "supplierId", null)
          }
        >
          Xóa
        </Button>
      ),
    },
  ];

  const unassignedColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <Text>
          {quantity.toLocaleString()} {record.unit}
        </Text>
      ),
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      render: (_, record) => (
        <Select
          style={{ width: "100%" }}
          value={selectedDetails[record.medicineId]?.supplierId}
          onChange={(value) =>
            handleDetailChange(record.medicineId, "supplierId", value)
          }
          placeholder="Chọn nhà cung cấp"
          size="large"
        >
          {record.medicine.suppliers.map((sup) => (
            <Select.Option key={sup.id} value={sup.id}>
              {sup.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const groupDetailsBySupplier = () => {
    const grouped = {
      unassigned: [],
      assigned: {},
    };

    requestDetails.forEach((detail) => {
      const selectedSupplier = selectedDetails[detail.medicineId]?.supplierId;
      if (!selectedSupplier) {
        grouped.unassigned.push(detail);
      } else {
        if (!grouped.assigned[selectedSupplier]) {
          const supplier = detail.medicine.suppliers.find(
            (s) => s.id === selectedSupplier
          );
          grouped.assigned[selectedSupplier] = {
            supplierId: selectedSupplier,
            supplierName: supplier?.name || "",
            items: [],
            totalAmount: 0,
          };
        }
        grouped.assigned[selectedSupplier].items.push(detail);
        grouped.assigned[selectedSupplier].totalAmount +=
          (selectedDetails[detail.medicineId]?.price || 0) * detail.quantity;
      }
    });

    return grouped;
  };

  const isAllPricesEntered = (supplierId, items) => {
    return items.every(
      (item) =>
        selectedDetails[item.medicineId]?.price &&
        selectedDetails[item.medicineId]?.price > 0
    );
  };

  const renderSupplierGroup = (supplier, items) => {
    const totalAmount = items.reduce(
      (total, item) =>
        total + (selectedDetails[item.medicineId]?.price || 0) * item.quantity,
      0
    );

    const allPricesEntered = isAllPricesEntered(supplier.supplierId, items);

    const handleGroupDepositChange = (supplierId, value) => {
      const groupItems = items.filter(
        (item) => selectedDetails[item.medicineId]?.supplierId === supplierId
      );

      const groupTotal = groupItems.reduce(
        (total, item) =>
          total +
          (selectedDetails[item.medicineId]?.price || 0) * item.quantity,
        0
      );

      if (value > groupTotal) {
        message.error(
          `Tiền cọc không được vượt quá ${groupTotal.toLocaleString()}đ`
        );
        return;
      }
      if (value <= 0) {
        message.error("Tiền cọc phải lớn hơn 0");
        return;
      }

      setSelectedDetails((prev) => ({
        ...prev,
        [`group_${supplierId}`]: {
          ...prev[`group_${supplierId}`],
          deposit: value,
        },
      }));
    };

    return (
      <Card
        key={supplier.supplierId}
        className="supplier-card"
        title={
          <div className="supplier-header">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <div className="supplier-main-info">
                  <Space size={24} align="start">
                    <Avatar
                      icon={<ShopOutlined />}
                      size={48}
                      style={{
                        backgroundColor: "#1890ff",
                        boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
                      }}
                    />
                    <div className="supplier-info" style={{ width: "100%" }}>
                      <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
                        {supplier.supplierName}
                      </Title>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space align="start">
                            <Text>Tiền cọc: </Text>
                            <Tooltip
                              title={
                                !allPricesEntered
                                  ? "Vui lòng nhập đơn giá cho tất cả sản phẩm trước khi nhập tiền cọc"
                                  : ""
                              }
                            >
                              <div>
                                <Form.Item
                                  style={{ marginBottom: 0 }}
                                  validateStatus={
                                    !selectedDetails[
                                      `group_${supplier.supplierId}`
                                    ]?.deposit
                                      ? "error"
                                      : ""
                                  }
                                  required
                                >
                                  <InputNumber
                                    style={{ width: 200 }}
                                    min={0}
                                    max={totalAmount}
                                    value={
                                      selectedDetails[
                                        `group_${supplier.supplierId}`
                                      ]?.deposit
                                    }
                                    onChange={(value) =>
                                      handleGroupDepositChange(
                                        supplier.supplierId,
                                        value
                                      )
                                    }
                                    formatter={(value) =>
                                      `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                      )
                                    }
                                    parser={(value) =>
                                      value.replace(/\$\s?|(,*)/g, "")
                                    }
                                    addonAfter="đ"
                                    disabled={!allPricesEntered}
                                  />
                                </Form.Item>
                              </div>
                            </Tooltip>
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            <Text>Tổng tiền:</Text>
                            <Text
                              strong
                              style={{ fontSize: 16, color: "#1890ff" }}
                            >
                              {totalAmount.toLocaleString()}đ
                            </Text>
                          </Space>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue">{items.length} sản phẩm</Tag>
                      </div>
                    </div>
                  </Space>
                </div>
              </Col>
              <Col span={24}>
                <Row gutter={32}>
                  <Col span={8}>
                    <Form.Item
                      label={<Text strong>Ngày giao dự kiến</Text>}
                      required
                      validateStatus={
                        !deliveryDates[supplier.supplierId] ? "error" : ""
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <DatePicker
                        className="w-full"
                        format="DD/MM/YYYY"
                        value={deliveryDates[supplier.supplierId]}
                        onChange={(date) => {
                          setDeliveryDates((prev) => ({
                            ...prev,
                            [supplier.supplierId]: date,
                          }));
                        }}
                        placeholder="Chọn ngày giao"
                        disabledDate={(current) => {
                          // Không cho phép chọn ngày trong quá khứ
                          return current && current < moment().startOf("day");
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider orientation="left">
                  <Space>
                    <InfoCircleOutlined />
                    <Text strong>Thông tin nhà cung cấp</Text>
                  </Space>
                </Divider>
                <div className="supplier-info-details">
                  <Row gutter={[32, 16]}>
                    <Col span={24}>
                      <Space>
                        <EnvironmentOutlined />
                        <Text strong>Địa chỉ:</Text>
                        <Text>
                          {selectedSupplierInfo[supplier.supplierId]?.address ||
                            "Chưa có địa chỉ"}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space>
                        <PhoneOutlined />
                        <Text strong>Số điện thoại:</Text>
                        <Text>
                          {selectedSupplierInfo[supplier.supplierId]?.phone ||
                            "Chưa có SĐT"}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space>
                        <MailOutlined />
                        <Text strong>Email:</Text>
                        <Text>
                          {selectedSupplierInfo[supplier.supplierId]?.email ||
                            "Chưa có email"}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        }
      >
        <Table
          columns={detailColumns}
          dataSource={items}
          pagination={false}
          rowKey="medicineId"
          bordered
        />
      </Card>
    );
  };

  const renderDetailModal = () => {
    return (
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết phiếu yêu cầu nhập thuốc</span>
          </Space>
        }
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        width={1000}
        footer={
          selectedRequest?.status === "Pending" && (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  if (groupDetailsBySupplier().unassigned.length > 0) {
                    setShowRejectModal(true);
                  } else {
                    handleApprove();
                  }
                }}
                loading={approving}
              >
                Phê duyệt
              </Button>
            </Space>
          )
        }
      >
        {selectedRequest && (
          <>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Mã phiếu:</Text> {selectedRequest.id}
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>{" "}
                <Tag
                  color={
                    selectedRequest.status === "Pending"
                      ? "warning"
                      : selectedRequest.status === "Approved"
                      ? "success"
                      : "error"
                  }
                >
                  {selectedRequest.status === "Pending"
                    ? "Chờ duyệt"
                    : selectedRequest.status === "Approved"
                    ? "Đã duyệt"
                    : "Đã từ chối"}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Người yêu cầu:</Text> {selectedRequest.createdBy}
              </Col>
              <Col span={12}>
                <Text strong>Ngày tạo:</Text>{" "}
                {moment(selectedRequest.createdTime).format("DD/MM/YYYY HH:mm")}
              </Col>
              <Col span={24}>
                <Text strong>Ghi chú:</Text>{" "}
                {selectedRequest.note || "Không có"}
              </Col>
            </Row>

            <Divider />

            {Object.values(groupDetailsBySupplier().assigned).map((group) =>
              renderSupplierGroup(group, group.items)
            )}

            {groupDetailsBySupplier().unassigned.length > 0 && (
              <div className="unassigned-warning">
                <Space align="start">
                  <WarningOutlined style={{ fontSize: 24, marginTop: 4 }} />
                  <div>
                    <Title level={5} style={{ color: "#faad14", marginTop: 0 }}>
                      Có {groupDetailsBySupplier().unassigned.length} sản phẩm
                      chưa chọn nhà cung cấp
                    </Title>
                    <Text type="warning">
                      Những sản phẩm không được chọn nhà cung cấp sẽ bị từ chối
                      nhập hàng
                    </Text>
                  </div>
                </Space>
                <Table
                  className="mt-4"
                  columns={unassignedColumns}
                  dataSource={groupDetailsBySupplier().unassigned}
                  pagination={false}
                  rowKey="medicineId"
                  bordered
                />
              </div>
            )}
          </>
        )}
      </Modal>
    );
  };

  const renderRejectModal = () => (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: "#faad14" }} />
          <Text>Xác nhận từ chối các sản phẩm chưa chọn</Text>
        </Space>
      }
      open={showRejectModal}
      onCancel={() => setShowRejectModal(false)}
      onOk={handleApprove}
      okText="Xác nhận"
      cancelText="Hủy"
      width={700}
    >
      <Alert
        message={`Có ${
          groupDetailsBySupplier().unassigned.length
        } sản phẩm sẽ bị từ chối`}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form layout="vertical">
        <Form.Item
          label="Ghi chú chung cho các sản phẩm bị từ chối"
          required={!Object.values(rejectDetails).some((note) => note)}
        >
          <Input.TextArea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Nhập lý do từ chối..."
          />
        </Form.Item>

        <Divider>Chi tiết từng sản phẩm</Divider>

        {groupDetailsBySupplier().unassigned.map((item) => (
          <Form.Item
            key={item.medicineId}
            label={`${item.medicineName} (${item.quantity} ${item.unit})`}
          >
            <Input.TextArea
              rows={2}
              value={rejectDetails[item.medicineId]}
              onChange={(e) =>
                setRejectDetails((prev) => ({
                  ...prev,
                  [item.medicineId]: e.target.value,
                }))
              }
              placeholder="Nhập lý do từ chối riêng (không bắt buộc)..."
            />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );

  const renderViewDetailModal = () => (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Chi tiết phiếu yêu cầu nhập thuốc</span>
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
      {selectedRequest && (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Mã phiếu:</Text> {selectedRequest.id}
            </Col>
            <Col span={12}>
              <Text strong>Trạng thái:</Text>{" "}
              <Tag
                color={
                  selectedRequest.status === "Pending"
                    ? "warning"
                    : selectedRequest.status === "Completed"
                    ? "success"
                    : "error"
                }
              >
                {selectedRequest.status === "Pending"
                  ? "Chờ duyệt"
                  : selectedRequest.status === "Completed"
                  ? "Đã duyệt"
                  : "Đã từ chối"}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Người yêu cầu:</Text> {selectedRequest.createdBy}
            </Col>
            <Col span={12}>
              <Text strong>Ngày tạo:</Text>{" "}
              {moment(selectedRequest.createdTime).format("DD/MM/YYYY HH:mm")}
            </Col>
            <Col span={24}>
              <Text strong>Ghi chú:</Text> {selectedRequest.note || "Không có"}
            </Col>
          </Row>

          <Divider>Chi tiết sản phẩm</Divider>

          <Table
            columns={[
              {
                title: "Tên thuốc",
                dataIndex: "medicineName",
                key: "medicineName",
              },
              {
                title: "Loại thuốc",
                key: "isVaccine",
                render: (_, record) =>
                  record.isVaccine ? "Vaccine" : "Thuốc thông thường",
              },
              {
                title: "Số lượng",
                key: "quantity",
                render: (_, record) =>
                  `${record.quantity} ${record.unit || "Đơn vị"}`,
              },
              {
                title: "Nhà cung cấp",
                key: "suppliers",
                render: (_, record) =>
                  record.medicine?.suppliers?.length > 0
                    ? record.medicine.suppliers.map((s) => s.name).join(", ")
                    : "Không có",
              },
              {
                title: "Trạng thái",
                key: "status",
                render: (_, record) => {
                  const isAccepted = record.note === "Chấp nhận yêu cầu";
                  let color = "default";
                  let text = "";

                  isAccepted ? (color = "success") : (color = "error");
                  isAccepted ? (text = "Đã chấp nhận") : (text = "Đã từ chối");

                  return <Tag color={color}>{text}</Tag>;
                },
              },
              {
                title: "Ghi chú",
                dataIndex: "note",
                key: "note",
              },
            ]}
            dataSource={requestDetails}
            pagination={false}
            rowKey="medicineId"
          />
        </>
      )}
    </Modal>
  );

  const getFilteredRequests = () => {
    return requests.filter((request) => {
      // Lọc theo mã phiếu
      if (
        filters.id &&
        !request.id.toLowerCase().includes(filters.id.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo khoảng thời gian
      if (filters.dateRange && filters.dateRange.length === 2) {
        const requestDate = moment(request.createdTime);
        if (
          !requestDate.isBetween(
            filters.dateRange[0],
            filters.dateRange[1],
            "day",
            "[]"
          )
        ) {
          return false;
        }
      }

      // Lọc theo trạng thái
      if (filters.status && request.status !== filters.status) {
        return false;
      }

      return true;
    });
  };

  return (
    <div className="medicine-request-page" style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng số phiếu</Text>}
              value={requests.length}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Đã duyệt</Text>}
              value={requests.filter((r) => r.status === "Completed").length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Chờ duyệt</Text>}
              value={requests.filter((r) => r.status === "Pending").length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title={<Text strong>Tổng sản phẩm</Text>}
              value={requests.reduce(
                (total, request) => total + (request.details?.length || 0),
                0
              )}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#eb2f96", fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>
      <Card className="main-table-card">
        <Title level={4} className="main-table-title">
          Danh sách phiếu yêu cầu nhập thuốc
        </Title>
        <Table
          columns={requestColumns}
          dataSource={getFilteredRequests()}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phiếu yêu cầu`,
          }}
        />
      </Card>
      {renderDetailModal()}
      {renderRejectModal()}
      {renderViewDetailModal()}
    </div>
  );
};

export default MedicineRequestApproval;
