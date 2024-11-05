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
} from "@ant-design/icons";
import axios from "axios";
import { debounce } from "lodash";

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

  // Fetch Foods Data
  const fetchFoods = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL}/api/v1/feeds?`;

      // Thêm các params từ filters
      if (filters.search) {
        url += `&search=${filters.search}`;
      }
      if (filters.feedType) {
        url += `&feedTypeId=${filters.feedType}`;
      }
      if (filters.area) {
        url += `&areasId=${filters.area}`;
      }
      if (filters.quantitySort) {
        url += `&feedQuantitySort=${filters.quantitySort}`;
      }

      const response = await axios({
        url: url,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response);
      if (response.status === 200) {
        setFoods(response.data.data.items);
      } else {
        message.error("Không thể tải danh sách thức ăn");
      }
    } catch (error) {
      console.error("Error fetching feeds:", error);
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
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/feeds`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: values,
      });
      console.log(response);
      if (response.status === 201) {
        message.success("Thêm thức ăn thành công");
        setIsModalVisible(false);
        form.resetFields();
        fetchFoods(); // Refresh data
      } else {
        message.error("Không thể thêm thức ăn");
      }
    } catch (error) {
      console.error("Error adding feed:", error);
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
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/feeds`,
        params: {
          id: editingFood.id,
        },
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: values,
      });

      if (response.status === 200) {
        message.success("Cập nhật thức ăn thành công");
        setIsModalVisible(false);
        setEditingFood(null);
        form.resetFields();
        fetchFoods(); // Refresh data
      } else {
        message.error("Không thể cập nhật thức ăn");
      }
    } catch (error) {
      console.error("Error updating feed:", error);
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
        url: `${import.meta.env.VITE_API_URL}/api/v1/feeds`,
        method: "DELETE",
        params: {
          id: id,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        message.success("Xóa thức ăn thành công");
        fetchFoods(); // Refresh data
      } else {
        message.error("Không thể xóa thức ăn");
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
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
      console.log("Editing record:", record);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/feeds/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const feedDetail = response.data.data;

        if (feedTypes.length === 0) await fetchFeedTypes();
        if (areas.length === 0) await fetchAreas();

        const feedType = feedTypes.find(
          (type) => type.feedTypeName === feedDetail.feedTypeName
        );
        const areaObj = areas.find((a) => a.name === feedDetail.area);

        setEditingFood(feedDetail);
        form.setFieldsValue({
          feedName: feedDetail.feedName,
          feedTypeId: feedType?.id,
          areasId: areaObj?.id,
          feedPerPig: feedDetail.feedPerPig,
          feedQuantity: feedDetail.feedQuantity,
        });
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Error in handleEdit:", error);
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
      dataIndex: "feedName",
      key: "feedName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Loại thức ăn",
      dataIndex: "feedTypeName",
      key: "feedTypeName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Số lượng (kg)",
      dataIndex: "feedQuantity",
      key: "feedQuantity",
      render: (amount) => amount?.toFixed(2),
    },
    {
      title: "Định lượng/Heo (kg)",
      dataIndex: "feedPerPig",
      key: "feedPerPig",
      render: (amount) => amount?.toFixed(2),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
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

    // Cập nhật filters cho cột feedTypes
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

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thức ăn
            </Title>
            <Button
              type="text"
              icon={<FilterOutlined rotate={showFilter ? 180 : 0} />}
              onClick={() => setShowFilter(!showFilter)}
              style={{ marginLeft: 8 }}
            >
              {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingFood(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            size="large"
          >
            Thêm thức ăn mới
          </Button>
        </div>

        <div
          style={{
            transition: "all 0.3s ease",
            height: showFilter ? "auto" : 0,
            opacity: showFilter ? 1 : 0,
            overflow: "hidden",
            marginBottom: showFilter ? 20 : 0,
          }}
        >
          <FilterSection />
        </div>

        <Table
          columns={columns}
          dataSource={foods}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} mục`,
          }}
          onChange={(pagination, filters, sorter) => {
            // Handle table change
            console.log("Table Change:", { pagination, filters, sorter });
          }}
        />
      </Card>

      <Modal
        title={editingFood ? "Cập nhật thức ăn" : "Thêm thức ăn mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingFood(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            feedName: editingFood?.feedName,
            feedTypeId: editingFood?.feedTypeId,
            areasId: editingFood?.areasId,
            feedPerPig: editingFood?.feedPerPig,
            feedQuantity: editingFood?.feedQuantity,
          }}
        >
          <Form.Item
            name="feedName"
            label="Tên thức ăn"
            rules={[{ required: true, message: "Vui lòng nhập tên thức ăn" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="feedTypeId"
            label="Loại thức ăn"
            rules={[{ required: true, message: "Vui lòng chọn loại thức ăn" }]}
          >
            <Select>
              {feedTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.feedTypeName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="areasId"
            label="Khu vực"
            rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
          >
            <Select>
              {areas.map((area) => (
                <Select.Option key={area.id} value={area.id}>
                  {area.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {editingFood && (
            <Form.Item name="feedQuantity" label="Số lượng hiện tại (kg)">
              <InputNumber disabled style={{ width: "100%" }} precision={2} />
            </Form.Item>
          )}

          <Form.Item
            name="feedPerPig"
            label="Định lượng/Heo (kg)"
            rules={[{ required: true, message: "Vui lòng nhập định lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} precision={2} />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingFood(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingFood ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FoodsPage;
