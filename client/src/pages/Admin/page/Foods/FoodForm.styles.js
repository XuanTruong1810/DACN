export const formStyles = `
  .ant-input,
  .ant-select .ant-select-selector,
  .ant-input-number {
    border-radius: 6px !important;
  }

  .ant-input:hover,
  .ant-select:hover .ant-select-selector,
  .ant-input-number:hover {
    border-color: #40a9ff !important;
  }

  .ant-input:focus,
  .ant-select-focused .ant-select-selector,
  .ant-input-number-focused {
    border-color: #40a9ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  }

  .ant-input-number {
    width: 100% !important;
  }

  .ant-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  .ant-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }

  .custom-add-button {
    border-radius: 6px;
    height: 40px;
    font-weight: 500;
  }
`; 