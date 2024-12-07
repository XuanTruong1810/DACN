import { Input, Row, Col, Button } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";

// eslint-disable-next-line react/prop-types
const EmployeeFilter = ({ onFilterChange, onAdd }) => {
  const handleSearchChange = (value) => {
    onFilterChange("search", value);
  };

  return (
    <Row
      gutter={[16, 16]}
      align="middle"
      justify="space-between"
      className="filter-container"
    >
      <Col flex="360px">
        <Input
          placeholder="Tìm kiếm nhân viên..."
          prefix={
            <SearchOutlined
              style={{
                fontSize: "16px",
                color: "rgba(0, 0, 0, 0.25)",
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            />
          }
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          className="search-input"
          style={{
            height: "40px",
            display: "flex",
            alignItems: "center",
          }}
        />
      </Col>
      <Col>
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>
          Thêm nhân viên
        </Button>
      </Col>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .filter-container {
          margin-bottom: 24px;
        }

        :global(.search-input.ant-input-affix-wrapper) {
          padding: 0 11px;
          height: 40px;
        }

        :global(.search-input .ant-input) {
          height: 100%;
          display: flex;
          align-items: center;
          font-size: 14px;
        }

        :global(.search-input .ant-input-prefix) {
          margin-right: 12px;
          height: 100%;
          display: flex;
          align-items: center;
        }

        :global(.search-input) {
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }

        :global(.search-input:hover) {
          border-color: #4096ff;
        }

        :global(.search-input.ant-input-affix-wrapper-focused) {
          border-color: #4096ff;
          box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
        }

        :global(.ant-input-clear-icon) {
          margin-left: 8px;
          color: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </Row>
  );
};

export default EmployeeFilter;
