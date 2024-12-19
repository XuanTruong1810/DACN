/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
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
  Tag,
  Tooltip,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  SaveOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import axios from "axios";
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
    foodTypeId: undefined,
    areaId: undefined,
  });
  const [foodTypes, setFoodTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [filteredFoods, setFilteredFoods] = useState([]);

  // Fetch Foods Data
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/Food`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      });

      if (response.status === 200 && response.data?.data) {
        const { items = [], totalCount = 0 } = response.data.data;
        setFoods(items);
        setFilteredFoods(items);
        setPagination((prev) => ({
          ...prev,
          total: totalCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      message.error("Có lỗi xảy ra khi tải danh sách thức ăn");
    } finally {
      setLoading(false);
    }
  };

  // Fetch FeedTypes
  const fetchFoodTypes = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/FoodType`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("response: ", response.data.data);
      if (response.status === 200 && response.data?.data) {
        setFoodTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching food types:", error);
      message.error("Không thể tải danh sách loại thức ăn");
    }
  };

  // Fetch Areas
  const fetchAreas = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/api/v1/Areas`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data.data.items);
      if (response.status === 200 && response.data?.data) {
        const { items = [] } = response.data.data;
        setAreas(items);
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

      if (response.status == 201) {
        message.success("Thêm thức ăn thành công");
        setIsModalVisible(false);
        form.resetFields();
        fetchFoods();
      }
    } catch (error) {
      console.error("Error adding food:", error);
      console.log(error.response?.data.message);
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
        message.success("Xóa thức ăn thành công");
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
    fetchFoodTypes();
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

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Tên thức ăn",
      dataIndex: "name",
      key: "name",
      filterSearch: true,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm kiếm tên thức ăn"
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
              onClick={() => {
                confirm();
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Loại thức ăn",
      dataIndex: "foodTypeName",
      key: "foodTypeName",
      filters: foodTypes.map((type) => ({ text: type.name, value: type.id })),
      onFilter: (value, record) => record.foodTypesId === value,
    },
    {
      title: "Khu vực",
      dataIndex: "areasName",
      key: "areasName",
      filters: areas.map((area) => ({ text: area.name, value: area.id })),
      onFilter: (value, record) => record.areasId === value,
    },
    {
      title: "Số bữa/ngày",
      dataIndex: "mealsPerDay",
      key: "mealsPerDay",
      sorter: (a, b) => a.mealsPerDay - b.mealsPerDay,
    },
    {
      title: "Định lượng/ngày",
      dataIndex: "quantityPerMeal",
      key: "quantityPerMeal",
      render: (value) => `${value} kg`,
      sorter: (a, b) => a.quantityPerMeal - b.quantityPerMeal,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Đang sử dụng" : "Ngừng sử dụng"}
        </Tag>
      ),
      filters: [
        { text: "Đang sử dụng", value: "active" },
        { text: "Ngừng sử dụng", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedFood(record);
                setIsDetailModalVisible(true);
              }}
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
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Thêm state cho columns
  const [tableColumns, setColumns] = useState(columns);

  // Thêm useEffect để load feedTypes và areas nếu chưa có
  useEffect(() => {
    const loadFormData = async () => {
      if (isModalVisible) {
        // Đảm bảo feedTypes và areas đã được load
        if (foodTypes.length === 0) {
          await fetchFoodTypes();
        }
        if (areas.length === 0) {
          await fetchAreas();
        }
      }
    };

    loadFormData();
  }, [isModalVisible]);

  // Hàm xử lý hiển thị chi tiết

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
            <Descriptions.Item label="Định lượng/ngày">
              {selectedFood.quantityPerMeal?.toFixed(2)} kg
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
              pagination={false}
              columns={[
                {
                  title: "Tên nhà cung cấp",
                  dataIndex: "supplierName",
                  key: "supplierName",
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
    // Function to get available suppliers (excluding already selected ones)
    const getAvailableSuppliers = (currentFieldName) => {
      const allSuppliers = suppliers || [];
      const formValues = form.getFieldValue("foodSuppliers") || [];
      const selectedSupplierIds = formValues
        .map((item, index) =>
          index !== currentFieldName ? item?.supplierId : null
        )
        .filter((id) => id !== null);

      return allSuppliers.filter(
        (supplier) => !selectedSupplierIds.includes(supplier.id)
      );
    };

    // Handle supplier removal with confirmation
    const handleRemoveSupplier = (name) => {
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa nhà cung cấp này?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => {
          form.setFieldsValue({
            foodSuppliers: form
              .getFieldValue("foodSuppliers")
              .filter((_, index) => index !== name),
          });
        },
      });
    };

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
        }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên thức ăn"
              rules={[{ required: true, message: "Vui lòng nhập tên thức ăn" }]}
            >
              <Input placeholder="Nhập tên thức ăn" size="large" />
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
                size="large"
              >
                {foodTypes.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.foodTypeName}
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
                size="large"
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
            <Form.Item name="mealsPerDay" label="Số bữa/ngày" initialValue={3}>
              <InputNumber
                disabled
                value={3}
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="quantityPerMeal"
              label="Định lượng/ngày (kg)"
              rules={[
                { required: true, message: "Vui lòng nhập định lượng/ngày" },
              ]}
            >
              <InputNumber
                min={0}
                step={0.1}
                placeholder="Nhập định lượng/ngày"
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả thức ăn"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
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
                {(fields, { add }) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {fields.map(({ key, name, ...restField }) => {
                      const availableSuppliers = getAvailableSuppliers(name);
                      const currentValue = form.getFieldValue([
                        "foodSuppliers",
                        name,
                        "supplierId",
                      ]);
                      if (currentValue) {
                        const currentSupplier = suppliers.find(
                          (s) => s.id === currentValue
                        );
                        if (currentSupplier) {
                          availableSuppliers.push(currentSupplier);
                        }
                      }

                      return (
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
                            onClick={() => handleRemoveSupplier(name)}
                            icon={<DeleteOutlined />}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                            }}
                          />

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
                            style={{ margin: 0 }}
                          >
                            <Select
                              placeholder="Chọn nhà cung cấp"
                              showSearch
                              optionFilterProp="children"
                              size="large"
                              style={{ width: "100%" }}
                            >
                              {availableSuppliers.map((supplier) => (
                                <Option
                                  key={supplier.id}
                                  value={supplier.id}
                                  disabled={form
                                    .getFieldValue("foodSuppliers")
                                    ?.some(
                                      (item, index) =>
                                        index !== name &&
                                        item?.supplierId === supplier.id
                                    )}
                                >
                                  {supplier.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Card>
                      );
                    })}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                      style={{
                        borderRadius: "8px",
                        height: "45px",
                      }}
                      disabled={fields.length >= suppliers.length}
                    >
                      Thêm nhà cung cấp
                    </Button>
                  </div>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: 24 }}>
          <Space>
            <Button size="large" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              {editingFood ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Space>
        </Row>
      </Form>
    );
  };

  // Modal wrapper
  const FoodModal = ({ visible, onCancel }) => {
    return (
      <Modal
        open={visible}
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
        styles={{
          body: {
            maxHeight: "80vh",
            overflow: "auto",
            padding: "24px",
            position: "relative",
          },
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
        url: `${import.meta.env.VITE_API_URL}/api/v1/Suppliers`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          typeSuppliers: "food",
        },
      });

      console.log("response suppliers", response);
      if (response.status === 200 && response.data?.data) {
        const { items = [] } = response.data.data;
        const activeSuppliers = items.filter(
          (supplier) => supplier.status === "active"
        );
        setSuppliers(activeSuppliers);
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
          fetchFoodTypes(),
          fetchAreas(),
          fetchSuppliers(),
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

  // Add useEffect to handle client-side filtering
  useEffect(() => {
    let result = [...foods];

    // Filter by food type
    if (filters.foodTypeId) {
      result = result.filter((food) => food.foodTypesId === filters.foodTypeId);
    }

    // Filter by search term - case insensitive and more flexible search
    if (filters.search) {
      const searchTerms = filters.search
        .toLowerCase()
        .split(" ")
        .filter((term) => term);
      result = result.filter((food) => {
        const foodName = food.name?.toLowerCase() || "";
        const foodType = food.foodTypeName?.toLowerCase() || "";
        const area = food.areasName?.toLowerCase() || "";

        return searchTerms.every(
          (term) =>
            foodName.includes(term) ||
            foodType.includes(term) ||
            area.includes(term)
        );
      });
    }

    // Filter by area
    if (filters.areaId) {
      result = result.filter((food) => food.areasId === filters.areaId);
    }

    setFilteredFoods(result);
  }, [foods, filters]);

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
        <Table
          columns={columns}
          dataSource={foods}
          rowKey="id"
          loading={loading}
          pagination={{
            total: foods.length,
            pageSize: pagination.pageSize,
            current: pagination.current,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize,
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
