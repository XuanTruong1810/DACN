import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  message,
  Typography,
  Space,
  Tag,
  Button,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const PigsManagement = () => {
  const [pigs, setPigs] = useState([]);
  const [filteredPigs, setFilteredPigs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [stables, setStables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    pageIndex: 1,
    pageSize: 10,
    search: "",
    areaId: null,
    stableId: null,
  });
  const [sortedInfo, setSortedInfo] = useState({});

  const columns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" && sortedInfo.order,
      render: (id) => <Tag color="purple">{id}</Tag>,
    },
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      render: (areaName) => <Tag color="blue">{areaName}</Tag>,
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
      render: (stableName) => <Tag color="cyan">{stableName}</Tag>,
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      render: (weight) => (
        <Tag color="orange">{weight ? `${weight} kg` : "Chưa cân"}</Tag>
      ),
    },
    {
      title: "Ngày nhập chuồng",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (text) => (
        <Tag color="geekblue">{new Date(text).toLocaleDateString()}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Còn sống", value: "alive" },
        { text: "Đã chết", value: "dead" },
        { text: "Đã bán", value: "sold" },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
      render: (status) => {
        let color = "green";
        let text = "Còn sống";

        switch (status?.toLowerCase()) {
          case "dead":
            color = "red";
            text = "Đã chết";
            break;
          case "sold":
            color = "blue";
            text = "Đã bán";
            break;
          case "alive":
          default:
            color = "green";
            text = "Còn sống";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const expandedRowRender = (record) => {
    const vaccinationColumns = [
      {
        title: "Tên vaccine",
        dataIndex: "medicineName",
        key: "medicineName",
      },
      {
        title: "Ngày dự kiến",
        dataIndex: "scheduleDate",
        key: "scheduleDate",
        render: (text) =>
          text ? new Date(text).toLocaleDateString() : "Chưa lên lịch",
      },
      {
        title: "Ngày tiêm",
        dataIndex: "actualDate",
        key: "actualDate",
        render: (text) =>
          text ? new Date(text).toLocaleDateString() : "Chưa tiêm",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "completed" ? "green" : "red"}>
            {status === "completed" ? "Đã tiêm" : "Chưa tiêm"}
          </Tag>
        ),
      },
    ];

    return (
      <div style={{ padding: "20px" }}>
        <Table
          columns={vaccinationColumns}
          dataSource={record.pigVaccinations || []}
          pagination={false}
          rowKey={(record) => `${record.medicineId}-${record.scheduleDate}`}
        />
      </div>
    );
  };

  const fetchPigs = async () => {
    setLoading(true);
    try {
      const params = {
        pageIndex: filter.pageIndex,
        pageSize: filter.pageSize,
        ...(filter.areaId && { areaId: filter.areaId }),
        ...(filter.stableId && { stableId: filter.stableId }),
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const sortedPigs = response.data.data.sort((a, b) => {
        if (a.status === "alive" && b.status !== "alive") return -1;
        if (a.status !== "alive" && b.status === "alive") return 1;
        return 0;
      });

      setPigs(sortedPigs);
      setFilteredPigs(sortedPigs);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
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
      setStables(response.data.data.items);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách chuồng");
    }
  };

  const fetchPigsByArea = async (areaId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/pigs/area/${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const sortedPigs = response.data.data.sort((a, b) => {
        if (a.status === "alive" && b.status !== "alive") return -1;
        if (a.status !== "alive" && b.status === "alive") return 1;
        return 0;
      });

      setPigs(sortedPigs);
      setFilteredPigs(sortedPigs);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu heo theo khu vực");
    } finally {
      setLoading(false);
    }
  };

  const fetchPigsByStable = async (stableId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/pigs/house/${stableId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const sortedPigs = response.data.data.sort((a, b) => {
        if (a.status === "alive" && b.status !== "alive") return -1;
        if (a.status !== "alive" && b.status === "alive") return 1;
        return 0;
      });

      setPigs(sortedPigs);
      setFilteredPigs(sortedPigs);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu heo theo chuồng");
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = async (value) => {
    setFilter((prev) => ({
      ...prev,
      areaId: value || null,
      stableId: null,
      pageIndex: 1,
    }));

    if (value) {
      await fetchStablesByArea(value);
      await fetchPigsByArea(value);
    } else {
      setStables([]);
      fetchPigs();
    }
  };

  const handleStableChange = async (value) => {
    setFilter((prev) => ({
      ...prev,
      stableId: value || null,
      pageIndex: 1,
    }));

    if (value) {
      await fetchPigsByStable(value);
    } else if (filter.areaId) {
      await fetchPigsByArea(filter.areaId);
    } else {
      fetchPigs();
    }
  };

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
      setAreas(response.data.data.items);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách khu vực");
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchPigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value) => {
    setFilter((prev) => ({
      ...prev,
      search: value,
    }));

    if (!value.trim()) {
      setFilteredPigs(pigs);
      return;
    }

    const filtered = pigs.filter((pig) =>
      pig.id.toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPigs(filtered);
  };

  const handleReset = () => {
    setFilter({
      pageIndex: 1,
      pageSize: 10,
      search: "",
      areaId: null,
      stableId: null,
    });

    const searchInput = document.querySelector(
      'input[placeholder="Tìm theo mã heo"]'
    );
    if (searchInput) {
      searchInput.value = "";
    }

    setFilteredPigs(pigs);
    setStables([]);
    fetchPigs();
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);

    let sortedData = [...filteredPigs];

    if (sorter.columnKey === "id" && sorter.order) {
      sortedData.sort((a, b) => {
        if (sorter.order === "ascend") {
          return a.id - b.id;
        } else {
          return b.id - a.id;
        }
      });
    }

    setFilteredPigs(sortedData);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3}>Quản lý heo</Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo mã heo"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
            value={filter.search}
          />
          <Select
            placeholder="Chọn khu vực"
            style={{ width: 200 }}
            onChange={handleAreaChange}
            allowClear
            value={filter.areaId}
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
            value={filter.stableId}
          >
            {stables.map((stable) => (
              <Option key={stable.id} value={stable.id}>
                {stable.name}
              </Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            type="primary"
          >
            Đặt lại
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredPigs}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          onChange={handleTableChange}
          pagination={{
            total: filteredPigs.length,
            pageSize: filter.pageSize,
            onChange: (page) => setFilter({ ...filter, pageIndex: page }),
          }}
        />
      </Card>
    </div>
  );
};

export default PigsManagement;
