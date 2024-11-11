import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Typography,
  Space,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const PigsManagement = () => {
  const [pigs, setPigs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [stables, setStables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPig, setEditingPig] = useState(null);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState({
    pageIndex: 1,
    pageSize: 10,
    search: undefined,
    areaId: undefined,
    stableId: undefined,
  });

  // Columns cho bảng
  const columns = [
    {
      title: "Mã heo",
      dataIndex: "pigId",
      key: "pigId",
      sorter: true,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (text) => new Date(text).toLocaleDateString(),
    },
  ];

  //Fetch dữ liệu
  const fetchPigs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs`,
        {
          params: filter,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.data);
      setPigs(response.data.data.items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch areas và stables
  const fetchAreas = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/areas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      setAreas(response.data.data.items);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách khu vực");
    }
  };

  const fetchStablesByArea = async (areaId) => {
    if (!areaId) {
      setStables([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/stables?areaId=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      setStables(response.data.data.items);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách chuồng");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPigs();
      if (!areas.length) {
        await fetchAreas();
      }
      if (filter.areaId) {
        await fetchStablesByArea(filter.areaId);
      }
    };
    loadData();
  }, [
    filter.pageIndex,
    filter.pageSize,
    filter.search,
    filter.areaId,
    filter.stableId,
  ]);

  // Xử lý thêm/sửa
  const handleSubmit = async (values) => {
    try {
      if (editingPig) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/v1/pigs/${editingPig.id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Cập nhật thông tin heo thành công");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/pigs`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Thêm heo mới thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingPig(null);
      fetchPigs();
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  // Xử lý xóa
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa heo này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/v1/pigs/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          message.success("Xóa heo thành công");
          fetchPigs();
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  // Xử lý sửa
  const handleEdit = (record) => {
    setEditingPig(record);
    form.setFieldsValue({
      ...record,
      importDate: dayjs(record.importDate),
    });
    setIsModalVisible(true);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setFilter({
      ...filter,
      search: value,
      pageIndex: 1, // Reset về trang 1 khi tìm kiếm
    });
  };

  // Xử lý chọn khu vực
  const handleAreaChange = async (value) => {
    setFilter({
      ...filter,
      areaId: value,
      stableId: undefined, // Reset chuồng khi đổi khu vực
      pageIndex: 1,
    });
    await fetchStablesByArea(value);
    await fetchPigs();
  };

  // Xử lý chọn chuồng
  const handleStableChange = async (value) => {
    setFilter({
      ...filter,
      stableId: value,
      pageIndex: 1,
    });
    await fetchPigs();
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
          <Title level={3}>Quản lý heo</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPig(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm heo mới
          </Button>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo mã heo"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Chọn khu vực"
            style={{ width: 200 }}
            onChange={handleAreaChange}
            allowClear
          >
            {areas.map((area) => (
              <Option key={area.id} value={area.id}>
                {area.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn chuồng"
            style={{ width: 200 }}
            onChange={handleStableChange}
            disabled={!filter.areaId}
            allowClear
          >
            {stables.map((stable) => (
              <Option key={stable.id} value={stable.id}>
                {stable.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Thêm mới
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={pigs}
          rowKey="id"
          loading={loading}
          pagination={{
            total: pigs.length,
            pageSize: filter.pageSize,
            onChange: (page) => setFilter({ ...filter, pageIndex: page }),
          }}
        />

        <Modal
          title={editingPig ? "Cập nhật thông tin heo" : "Thêm heo mới"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingPig(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={editingPig}
          >
            <Form.Item
              name="pigId"
              label="Mã heo"
              rules={[{ required: true, message: "Vui lòng nhập mã heo" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="area"
              label="Khu vực"
              rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
            >
              <Select placeholder="Chọn khu vực">
                <Option value="Khu A">Khu A</Option>
                <Option value="Khu B">Khu B</Option>
                <Option value="Khu C">Khu C</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="house"
              label="Chuồng"
              rules={[{ required: true, message: "Vui lòng chọn chuồng" }]}
            >
              <Select placeholder="Chọn chuồng">
                <Option value="Chuồng A">Chuồng A</Option>
                <Option value="Chuồng B">Chuồng B</Option>
                <Option value="Chuồng C">Chuồng C</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="importDate"
              label="Ngày nhập"
              rules={[{ required: true, message: "Vui lòng chọn ngày nhập" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Space style={{ float: "right" }}>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingPig(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingPig ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PigsManagement;
