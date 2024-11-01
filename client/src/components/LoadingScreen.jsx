import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const LoadingWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const LoadingCircle = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
`;

const LoadingText = styled(motion.div)`
  color: #1890ff;
  font-size: 16px;
  margin-top: 16px;
  font-weight: 500;
`;

const LoadingScreen = () => {
  return (
    <LoadingWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingCircle
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <LoadingText
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Đang tải...
      </LoadingText>
    </LoadingWrapper>
  );
};

export default LoadingScreen;
