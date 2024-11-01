import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";
import { BsSun, BsMoon } from "react-icons/bs";

const SwitchContainer = styled(motion.button)`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${(props) => (props.isDarkMode ? "#fff" : "#1890ff")};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(24,144,255,0.1)"};
  }

  svg {
    font-size: 20px;
  }
`;

const IconWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <SwitchContainer
      isDarkMode={isDarkMode}
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <IconWrapper
        initial={{ rotate: 0 }}
        animate={{ rotate: isDarkMode ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {isDarkMode ? <BsMoon /> : <BsSun />}
      </IconWrapper>
    </SwitchContainer>
  );
};

export default ThemeSwitcher;
