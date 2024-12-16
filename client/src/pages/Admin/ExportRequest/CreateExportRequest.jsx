import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  message,
  Typography,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
} from "antd";
import {
  ExportOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const CreateExportRequest = () => {
  const [selectedPigs, setSelectedPigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eligiblePigs, setEligiblePigs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEligiblePigs();
  }, []);

  const fetchEligiblePigs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/Pigs/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      const pigs = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      // Lọc chỉ lấy những con heo có sức khỏe tốt
      const healthyPigs = pigs.filter((pig) => pig.healthStatus === "good");
      setEligiblePigs(healthyPigs);
    } catch (error) {
      console.error("Error fetching eligible pigs:", error);
      message.error("Không thể tải danh sách heo đủ điều kiện xuất");
    }
  };

  const handleSubmit = () => {
    if (selectedPigs.length === 0) {
      message.warning("Vui lòng chọn ít nhất một con heo để xuất");
      return;
    }
    setIsModalVisible(true);
  };

  const handleConfirmExport = async () => {
    setLoading(true);
    try {
      const exportRequest = {
        details: selectedPigs.map((pig) => ({
          pigId: pig.id,
          currentWeight: pig.weight,
          healthStatus: pig.healthStatus,
          note: pig.note || "",
        })),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/pigExport/request`,
        exportRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      message.success("Tạo đề xuất vật nuôi thành công");
      setIsModalVisible(false);
      navigate("/admin/exports/animals/request/list");
    } catch (error) {
      console.error("Error creating export request:", error);
      message.error("Không thể tạo đề xuất vật nuôi");
    } finally {
      setLoading(false);
    }
  };

  const modalColumns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      render: (weight) => (
        <span style={{ fontWeight: 500 }}>{weight.toFixed(1)} kg</span>
      ),
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (status) => (
        <Tag
          icon={
            status === "good" ? <CheckCircleOutlined /> : <WarningOutlined />
          }
          color={status === "good" ? "success" : "error"}
        >
          {status === "good" ? "Tốt" : "Xấu"}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <span style={{ color: "#666", fontStyle: "italic" }}>
          {note || "-"}
        </span>
      ),
    },
  ];

  const columns = [
    {
      title: "Mã heo",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      sorter: (a, b) => a.weight - b.weight,
      render: (weight) => (
        <span style={{ fontWeight: 500 }}>{weight.toFixed(1)} kg</span>
      ),
    },
    {
      title: "Chuồng",
      dataIndex: "stableName",
      key: "stableName",
      render: (stableName) => <Tag color="cyan">{stableName}</Tag>,
    },
    {
      title: "Khu",
      dataIndex: "areaName",
      key: "areaName",
      render: (areaName) => <Tag color="purple">{areaName}</Tag>,
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (status) => (
        <Tag
          icon={
            status === "good" ? <CheckCircleOutlined /> : <WarningOutlined />
          }
          color={status === "good" ? "success" : "error"}
        >
          {status === "good" ? "Tốt" : "Xấu"}
        </Tag>
      ),
    },
    {
      title: "Tiêm vaccine",
      dataIndex: "isVaccinationComplete",
      key: "isVaccinationComplete",
      render: (vaccinated) => (
        <Tag
          icon={vaccinated ? <CheckCircleOutlined /> : <WarningOutlined />}
          color={vaccinated ? "success" : "error"}
        >
          {vaccinated ? "Đã tiêm đủ" : "Chưa tiêm đủ"}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <span style={{ color: "#666", fontStyle: "italic" }}>
          {note || "-"}
        </span>
      ),
    },
  ];

  const rowSelection = {
    onChange: (_, selectedRows) => {
      setSelectedPigs(selectedRows);
    },
  };

  const totalWeight = selectedPigs.reduce((sum, pig) => sum + pig.weight, 0);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <ExportOutlined /> Tạo đề xuất xuất vật nuôi
          </Title>
        }
        className="custom-card"
        style={{ marginBottom: 24, borderRadius: 8 }}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Tổng số heo đủ điều kiện"
                value={eligiblePigs.length}
                suffix="con"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Số heo đã chọn"
                value={selectedPigs.length}
                suffix="con"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Tổng khối lượng đã chọn"
                value={totalWeight}
                precision={1}
                suffix="kg"
              />
            </Card>
          </Col>
        </Row>

        <Table
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          dataSource={eligiblePigs}
          rowKey="id"
          bordered
          scroll={{ x: true }}
          style={{ marginBottom: 16 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} con heo`,
          }}
        />

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<ExportOutlined />}
            size="large"
            style={{
              borderRadius: 6,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            Tạo đề xuất xuất
          </Button>
        </div>
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ExportOutlined />
            <span>Xác nhận đề xuất xuất vật nuôi</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleConfirmExport}
            icon={<ExportOutlined />}
          >
            Xác nhận xuất
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card bordered={false}>
                <Statistic
                  title="Tổng số lượng"
                  value={selectedPigs.length}
                  suffix="con"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Statistic
                  title="Tổng khối lượng"
                  value={totalWeight}
                  precision={1}
                  suffix="kg"
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Table
          columns={modalColumns}
          dataSource={selectedPigs}
          pagination={false}
          bordered
          size="small"
          summary={() => {
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    <strong>{totalWeight.toFixed(1)} kg</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />

        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Typography.Text type="secondary">
            * Vui lòng kiểm tra kỹ thông tin trước khi xác nhận xuất
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
};

export default CreateExportRequest;
