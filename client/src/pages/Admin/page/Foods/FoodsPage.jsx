import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  InputNumber,
  Card,
  Typography,
  Row,
  Col,
  Select,
  Dropdown,
  Tag,
  Tooltip,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  StopOutlined,
  CheckOutlined,
  CoffeeOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  InboxOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { debounce } from "lodash";
import { formStyles } from "./FoodForm.styles";

const { Title } = Typography;
const { Option } = Select;

const FoodsPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
    feedType: [],
    area: [],
    quantityRange: null,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [feedTypes, setFeedTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedFeedType, setSelectedFeedType] = useState("all");
  const [originalData, setOriginalData] = useState([]);
  const [tempFilters, setTempFilters] = useState({
    search: "",
    feedType: undefined,
    area: undefined,
    quantitySort: undefined,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    fetchFoods(newPagination.current, newPagination.pageSize);
  };
  // Fetch Foods Data
  const fetchFoods = async () => {
    console.log("pagination: ");
    console.log(pagination);
    try {
      setLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          search: filters.search || undefined,
          supplierId: filters.supplierId || undefined,
          areaId: filters.area || undefined,
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      });

      console.log("Response from API:", response.data);

      if (response.status == 200) {
        const { items, totalCount, pageSize, currentPage } = response.data.data;
        setFoods(items);
        setPagination((prev) => ({
          ...prev,
          total: totalCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách thức ăn"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch FeedTypes
  const fetchFeedTypes = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/feedtypes`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(response.data.data.items);
      if (response.status == 200) {
        setFeedTypes(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching feed types:", error);
      message.error("Không thể tải danh sách loại thức ăn");
    }
  };

  // Fetch Areas
  const fetchAreas = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/areas`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data.data.items);
      if (response.status == 200) {
        setAreas(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      message.error("Không thể tải danh sách khu vực");
    }
  };

  // Add new feed
  const handleAdd = async (values) => {
    try {
      setLoading(true);
      const formData = {
        name: values.name,
        description: values.description,
        foodTypesId: values.foodTypesId,
        quantityInStock: values.quantityInStock || 0,
        status: "active",
        areasId: values.areasId,
        quantityPerMeal: values.quantityPerMeal,
        mealsPerDay: values.mealsPerDay,
        foodSuppliers: values.foodSuppliers.map((supplier) => ({
          suppliersId: supplier.supplierId,
          quantityPerMeal: supplier.quantityInStock,
          status: supplier.status,
        })),
      };

      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: formData,
      });

      if (response.status == 200) {
        message.success("Thêm thức ăn thành công");
        setIsModalVisible(false);
        form.resetFields();
        fetchFoods();
      }
    } catch (error) {
      console.error("Error adding food:", error);
      console.log(error.response?.data.errors.Description[0]);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm thức ăn"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update feed
  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const formData = {
        name: values.name,
        description: values.description,
        foodTypesId: values.foodTypesId,
        areasId: values.areasId,
        quantityPerMeal: values.quantityPerMeal,
        mealsPerDay: values.mealsPerDay,
        foodSuppliers: values.foodSuppliers.map((supplier) => ({
          suppliersId: supplier.supplierId,
          quantityInStock: supplier.quantityInStock,
          status: supplier.status,
        })),
      };
      console.log(formData);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food/${editingFood.id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: formData,
      });

      if (response.status === 200) {
        message.success("Cập nhật thức ăn thành công");
        setIsModalVisible(false);
        setEditingFood(null);
        form.resetFields();
        fetchFoods();
      }
    } catch (error) {
      console.error("Error updating food:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thức ăn"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete feed
  const handleDelete = async (id) => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status == 200) {
        message.success(response.data.data);
        fetchFoods();
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa thức ăn"
      );
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFoods();
    fetchFeedTypes();
    fetchAreas();
  }, []);

  // Handle form submit
  const handleSubmit = (values) => {
    if (editingFood) {
      handleUpdate(values);
    } else {
      handleAdd(values);
    }
  };

  // Handle edit button click
  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food/${record.id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        const foodDetail = response.data.data;
        setEditingFood(foodDetail);

        form.setFieldsValue({
          name: foodDetail.name,
          foodTypesId: foodDetail.foodTypesId,
          areasId: foodDetail.areasId,
          description: foodDetail.description,
          mealsPerDay: foodDetail.mealsPerDay,
          quantityPerMeal: foodDetail.quantityPerMeal,
          foodSuppliers: foodDetail.foodSupplierModelView?.map((supplier) => ({
            supplierId: supplier.supplierId,
            quantityInStock: supplier.quantityInStock,
            status: supplier.status,
          })),
        });

        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching food detail:", error);
      message.error("Không thể tải thông tin thức ăn");
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleView = (record) => {
    Modal.info({
      title: "Chi tiết thức ăn",
      width: 600,
      content: (
        <div>
          <p>
            <strong>Tên thức ăn:</strong> {record.feedName}
          </p>
          <p>
            <strong>Loại thức ăn:</strong> {record.feedTypeName}
          </p>
          <p>
            <strong>Khu vực:</strong> {record.area}
          </p>
          <p>
            <strong>Số lượng:</strong> {record.feedQuantity?.toFixed(2)} kg
          </p>
          <p>
            <strong>Định lượng/Heo:</strong> {record.feedPerPig?.toFixed(2)} kg
          </p>
        </div>
      ),
    });
  };

  const handleToggleStatus = (record) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    const statusText = newStatus === "active" ? "kích hoạt" : "ngừng sử dụng";

    Modal.confirm({
      title: `Xác nhận ${statusText}`,
      content: `Bạn có chắc chắn muốn ${statusText} thức ăn "${record.name}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Giả lập API call
          const updatedFoods = foods.map((food) =>
            food.id === record.id ? { ...food, status: newStatus } : food
          );
          setFoods(updatedFoods);
          message.success(
            `${
              statusText.charAt(0).toUpperCase() + statusText.slice(1)
            } thành công`
          );
        } catch (error) {
          console.log(error);
          message.error("Có lỗi xảy ra");
        }
      },
    });
  };

  const FilterSection = () => {
    const handleApplyFilters = () => {
      setFilters(tempFilters);
    };

    const handleResetFilters = () => {
      setTempFilters({
        search: "",
        feedType: undefined,
        area: undefined,
        quantitySort: undefined,
      });
      setFilters({
        search: "",
        feedType: undefined,
        area: undefined,
        quantitySort: undefined,
      });
      form.resetFields(["search", "feedType", "area", "quantitySort"]);
    };

    const debouncedSearch = debounce((value) => {
      setTempFilters((prev) => ({
        ...prev,
        search: value,
      }));
    }, 300);

    return (
      <Form form={form}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Tìm kiếm theo tên" name="search">
              <Input
                placeholder="Nhập tên thức ăn..."
                prefix={<SearchOutlined />}
                onChange={(e) => {
                  const { value } = e.target;
                  debouncedSearch(value);
                }}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Loại thức ăn" name="feedType">
              <Select
                placeholder="Chọn loại thức ăn"
                allowClear
                onChange={(value) => {
                  setTempFilters((prev) => ({
                    ...prev,
                    feedType: value,
                  }));
                }}
              >
                {feedTypes.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.feedTypeName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Khu vực" name="area">
              <Select
                placeholder="Chọn khu vực"
                allowClear
                onChange={(value) => {
                  setTempFilters((prev) => ({
                    ...prev,
                    area: value,
                  }));
                }}
              >
                {areas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Sắp xếp theo số lượng" name="quantitySort">
              <Select
                placeholder="Sắp xếp theo số lượng"
                allowClear
                onChange={(value) => {
                  setTempFilters((prev) => ({
                    ...prev,
                    quantitySort: value,
                  }));
                }}
              >
                <Select.Option value="asc">Tăng dần</Select.Option>
                <Select.Option value="desc">Giảm dần</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleResetFilters}>Đặt lại</Button>
              <Button type="primary" onClick={handleApplyFilters}>
                Áp dụng
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    );
  };

  const styles = `
    .action-btn:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .ant-dropdown-menu-item {
      padding: 8px 12px !important;
    }
    
    .ant-dropdown-menu-item .anticon {
      margin-right: 8px;
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Thêm useEffect để theo dõi thay đổi của filters
  useEffect(() => {
    fetchFoods();
  }, [filters]);

  // Cập nhật useEffect để fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch feeds
        const feedsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/feeds`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (feedsResponse.data.isSuccess) {
          // Đảm bảo data là một mảng
          const feedsData = feedsResponse.data.data.items || [];
          setFoods(feedsData);
          setOriginalData(feedsData);
        }

        // Fetch areas
        const areasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/areas`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (areasResponse.data.isSuccess) {
          const areasData = areasResponse.data.data.items || [];
          setAreas(areasData);
        }

        // Fetch feed types
        const feedTypesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/feedtypes`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (feedTypesResponse.data.isSuccess) {
          const feedTypesData = feedTypesResponse.data.data.items || [];
          setFeedTypes(feedTypesData);
        }
      } catch (error) {
        message.error("Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Khu vực",
      dataIndex: "areasName",
      key: "areasName",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Định lượng/bữa (kg)",
      dataIndex: "quantityPerMeal",
      key: "quantityPerMeal",
      render: (value) => value?.toFixed(2),
    },
    {
      title: "Số lượng tổng (kg)",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      render: (value) => value?.toFixed(2),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận xóa",
                  content: "Bạn có chắc chắn muốn xóa thức ăn này?",
                  okText: "Xóa",
                  okType: "danger",
                  cancelText: "Hủy",
                  onOk: () => handleDelete(record.id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cập nhật useEffect để tạo filters cho columns khi feedTypes và areas thay đổi
  useEffect(() => {
    const updatedColumns = [...columns];

    // Cp nhật filters cho cột feedTypes
    if (feedTypes.length > 0) {
      const feedTypeColumn = updatedColumns.find(
        (col) => col.key === "feedTypes"
      );
      if (feedTypeColumn) {
        feedTypeColumn.filters = feedTypes.map((type) => ({
          text: type.feedTypeName,
          value: type.id,
        }));
      }
    }

    // Cập nhật filters cho cột areas
    if (areas.length > 0) {
      const areaColumn = updatedColumns.find((col) => col.key === "areas");
      if (areaColumn) {
        areaColumn.filters = areas.map((area) => ({
          text: area.areaName,
          value: area.id,
        }));
      }
    }

    setColumns(updatedColumns);
  }, [feedTypes, areas]);

  // Thêm state cho columns
  const [tableColumns, setColumns] = useState(columns);

  // Thêm hàm để fetch chi tiết feed nếu cần
  const fetchFeedDetail = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/feeds/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.isSuccess) {
        const feedDetail = response.data.data;
        setEditingFood(feedDetail);
        form.setFieldsValue({
          feedName: feedDetail.feedName,
          feedTypeId: feedDetail.feedTypeId,
          areasId: feedDetail.areasId,
          feedPerPig: feedDetail.feedPerPig,
        });
      }
    } catch (error) {
      console.error("Error fetching feed detail:", error);
      message.error("Không thể tải thông tin thức ăn");
    }
  };

  // Thêm useEffect để load feedTypes và areas nếu chưa có
  useEffect(() => {
    const loadFormData = async () => {
      if (isModalVisible) {
        // Đảm bảo feedTypes và areas đã được load
        if (feedTypes.length === 0) {
          await fetchFeedTypes();
        }
        if (areas.length === 0) {
          await fetchAreas();
        }
      }
    };

    loadFormData();
  }, [isModalVisible]);

  // Hàm xử lý hiển thị chi tiết
  const handleViewDetail = (record) => {
    setSelectedFood(record);
    setIsDetailModalVisible(true);
  };

  // Cập nhật modal chi tiết
  const DetailModal = () => (
    <Modal
      title="Chi tiết thức ăn"
      open={isDetailModalVisible}
      onCancel={() => {
        setIsDetailModalVisible(false);
        setSelectedFood(null);
      }}
      footer={[
        <Button
          key="close"
          onClick={() => {
            setIsDetailModalVisible(false);
            setSelectedFood(null);
          }}
        >
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {selectedFood && (
        <>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tên thức ăn" span={2}>
              {selectedFood.name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại thức ăn">
              {selectedFood.foodTypeName}
            </Descriptions.Item>
            <Descriptions.Item label="Khu vực">
              {selectedFood.areasName}
            </Descriptions.Item>
            <Descriptions.Item label="Số bữa/ngày">
              {selectedFood.mealsPerDay}
            </Descriptions.Item>
            <Descriptions.Item label="Định lượng/bữa">
              {selectedFood.quantityPerMeal?.toFixed(2)} kg
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng tổng" span={2}>
              {selectedFood.quantityInStock?.toFixed(2)} kg
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={selectedFood.status === "active" ? "green" : "red"}>
                {selectedFood.status === "active"
                  ? "Đang sử dụng"
                  : "Ngừng sử dụng"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedFood.description}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: "24px" }}>
            <Title level={5}>Thông tin nhà cung cấp</Title>
            <Table
              dataSource={selectedFood.foodSupplierModelView}
              rowKey="supplierId"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} mục`,
              }}
              onChange={handleTableChange}
              columns={[
                {
                  title: "Tên nhà cung cấp",
                  dataIndex: "supplierName",
                  key: "supplierName",
                },
                {
                  title: "Số lượng trong kho",
                  dataIndex: "quantityInStock",
                  key: "quantityInStock",
                  render: (value) => `${value?.toFixed(2)} kg`,
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => (
                    <Tag color={status === "active" ? "green" : "red"}>
                      {status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </Tag>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </Modal>
  );

  // Form thêm/sửa thức ăn
  const FoodForm = ({ form, editingFood, suppliers }) => {
    const handleRemoveSupplier = (supplierId) => {
      const suppliers = form.getFieldValue("foodSuppliers") || [];
      const supplierToRemove = suppliers.find(
        (s) => s.supplierId === supplierId
      );

      if (supplierToRemove && supplierToRemove.quantityInStock > 0) {
        message.error(
          "Không thể xóa nhà cung cấp khi còn hàng tồn kho. Vui lòng đưa số lượng về 0 trước khi xóa!"
        );
        return;
      }

      const newSuppliers = suppliers.filter((s) => s.supplierId !== supplierId);
      form.setFieldValue("foodSuppliers", newSuppliers);
    };

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
          quantityInStock: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên thức ăn"
              rules={[{ required: true, message: "Vui lòng nhập tên thức ăn" }]}
            >
              <Input placeholder="Nhập tên thức ăn" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="foodTypesId"
              label="Loại thức ăn"
              rules={[
                { required: true, message: "Vui lòng chọn loại thức ăn" },
              ]}
            >
              <Select
                placeholder="Chọn loại thức ăn"
                optionFilterProp="children"
                showSearch
              >
                {feedTypes.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="areasId"
              label="Khu vực"
              rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
            >
              <Select
                placeholder="Chọn khu vực"
                optionFilterProp="children"
                showSearch
              >
                {areas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="mealsPerDay"
              label="Số bữa/ngày"
              rules={[{ required: true, message: "Vui lòng nhập số bữa/ngày" }]}
            >
              <InputNumber min={1} placeholder="Nhập số bữa/ngày" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="quantityPerMeal"
              label="Định lượng/bữa (kg)"
              rules={[
                { required: true, message: "Vui lòng nhập định lượng/bữa" },
              ]}
            >
              <InputNumber
                min={0}
                step={0.1}
                placeholder="Nhập định lượng/bữa"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={4} placeholder="Nhập mô tả thức ăn" />
            </Form.Item>
          </Col>

          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: "#1890ff" }} />
                <span>Thông tin nhà cung cấp</span>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Form.List name="foodSuppliers">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      size="small"
                      bordered={false}
                      style={{
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        position: "relative",
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        onClick={() => {
                          const currentSupplier = form.getFieldValue([
                            "foodSuppliers",
                            name,
                          ]);
                          handleRemoveSupplier(currentSupplier.supplierId);
                        }}
                        icon={<DeleteOutlined />}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                          paddingTop: "24px",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "supplierId"]}
                          label="Nhà cung cấp"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn nhà cung cấp",
                            },
                          ]}
                          style={{ margin: 0, minWidth: "250px" }}
                        >
                          <Select
                            placeholder="Chọn nhà cung cấp"
                            showSearch
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                          >
                            {suppliers?.map((supplier) => (
                              <Option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "quantityInStock"]}
                          label="Số lượng (kg)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lượng",
                            },
                          ]}
                          style={{ margin: 0, minWidth: "150px" }}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập số lượng"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "status"]}
                          label="Trạng thái"
                          initialValue="active"
                          style={{ margin: 0, minWidth: "150px" }}
                        >
                          <Select style={{ width: "100%" }}>
                            <Option value="active">
                              <Tag color="success">Đang dùng</Tag>
                            </Option>
                            <Option value="inactive">
                              <Tag color="error">Ngừng dùng</Tag>
                            </Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </Card>
                  ))}

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{
                        height: "40px",
                        borderRadius: "8px",
                      }}
                    >
                      Thêm nhà cung cấp
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>
          </Card>

          <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {editingFood ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Row>
        </Row>
      </Form>
    );
  };

  // Modal wrapper
  const FoodModal = ({ visible, onCancel }) => {
    return (
      <Modal
        visible={visible}
        onCancel={onCancel}
        title={
          <Space>
            {editingFood ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingFood ? "Chỉnh sửa thức ăn" : "Thêm thức ăn mới"}
            </span>
          </Space>
        }
        footer={null}
        width={800}
        bodyStyle={{
          maxHeight: "80vh",
          overflow: "auto",
          padding: "24px",
          position: "relative",
        }}
      >
        <FoodForm form={form} editingFood={editingFood} suppliers={suppliers} />
      </Modal>
    );
  };

  // Thêm useEffect để inject styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = formStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/suppliers`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          typeSuppliers: "feed",
        },
      });

      console.log("Suppliers response:", response.data);
      if (response.status === 200) {
        setSuppliers(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  // Cập nhật useEffect để fetch tất cả data cần thiết
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchFoods(),
          fetchFeedTypes(),
          fetchAreas(),
          fetchSuppliers(), // Thêm fetch suppliers
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thức ăn
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingFood(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm thức ăn mới
            </Button>
          </div>
        }
      >
        <FilterSection />

        <Table
          columns={columns}
          dataSource={foods}
          rowKey="id"
          loading={loading}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.current,
            onChange: (page, pageSize) => {
              setFilters((prev) => ({
                ...prev,
                page,
                pageSize,
              }));
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} mục`,
          }}
        />
      </Card>

      <FoodModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingFood(null);
        }}
      />

      {/* Add Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default FoodsPage;
