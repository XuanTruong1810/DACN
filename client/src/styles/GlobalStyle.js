import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 100vh;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(
      135deg,
      rgba(24, 144, 255, 0.8) 0%,
      rgba(64, 169, 255, 0.9) 100%
    );
    border-radius: 100vh;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: all 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      135deg,
      rgba(24, 144, 255, 0.9) 0%,
      rgba(64, 169, 255, 1) 50%,
      rgba(85, 178, 255, 1) 100%
    );
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
  }

  ::-webkit-scrollbar-thumb:active {
    background: linear-gradient(
      135deg,
      rgba(9, 109, 217, 1) 0%,
      rgba(24, 144, 255, 1) 100%
    );
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-track {
      background: #141414;
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(
        135deg,
        rgba(24, 144, 255, 0.7) 0%,
        rgba(64, 169, 255, 0.8) 100%
      );
    }
  }

  html {
    scroll-behavior: smooth;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(24, 144, 255, 0.8) #f0f0f0;
  }

  body {
    overflow-y: overlay;
    -webkit-overflow-scrolling: touch;
    transition: all 0.3s ease;
  }

  body.dark {
    background-color: #141414;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Custom scrollbar for dark mode */
  body.dark::-webkit-scrollbar-track {
    background: #1f1f1f;
  }

  body.dark::-webkit-scrollbar-thumb {
    background: linear-gradient(
      135deg,
      rgba(24, 144, 255, 0.7) 0%,
      rgba(64, 169, 255, 0.8) 100%
    );
  }

  /* Card styles for dark mode */
  body.dark .ant-card {
    background-color: #1f1f1f;
  }

  /* Table styles for dark mode */
  body.dark .ant-table {
    background-color: #1f1f1f;
  }

  /* Input styles for dark mode */
  body.dark .ant-input {
    background-color: #141414;
  }

  /* Add more dark mode styles as needed */

  /* Animation xuất hiện */
  ::-webkit-scrollbar-thumb {
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  *:hover::-webkit-scrollbar-thumb {
    opacity: 1;
  }

  body {
    transition: all 0.3s ease;
  }

  body.dark {
    background-color: #141414;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Dark mode styles for Ant Design components */
  body.dark {
    .ant-layout {
      background: #141414;
    }

    .ant-layout-sider {
      background: #1f1f1f;
    }

    .ant-menu.ant-menu-dark {
      background: #1f1f1f;
    }

    .ant-card {
      background: #1f1f1f;
    }

    .ant-table {
      background: #1f1f1f;
    }

    .ant-input {
      background: #141414;
    }

    .ant-select-dropdown {
      background: #1f1f1f;
    }
  }
`;

export default GlobalStyle; 