import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  InfoIcon as Info,
  AlertTriangleIcon as AlertTriangle,
  XIcon as X,
} from "../shared/icons/index";
import { T } from "../../theme/tokens";

export interface ToastProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
        return <Info size={20} />;
    }
  };

  return (
    <ToastContainer $type={type} $isExiting={isExiting}>
      <IconWrapper $type={type}>{getIcon()}</IconWrapper>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose} aria-label="Dismiss">
        <X size={16} />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast;

const slideIn = keyframes`
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
`;

const toastAccent = (type: ToastProps["type"]) =>
  ({
    success: T.successText,
    error: T.dangerText,
    warning: T.warningText,
    info: T.accent,
  })[type];

const ToastContainer = styled.div<{
  $type: ToastProps["type"];
  $isExiting: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: min(420px, calc(100vw - 32px));
  min-width: 0;
  padding: 14px 16px;
  box-sizing: border-box;
  background: ${T.bgSurface};
  border-radius: ${T.rLg};
  border: 1px solid ${T.borderSubtle};
  box-shadow: ${T.shadowElevated};
  font-family: ${T.fontUI};
  animation: ${({ $isExiting }) => ($isExiting ? slideOut : slideIn)} 0.3s
    cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const IconWrapper = styled.div<{ $type: ToastProps["type"] }>`
  color: ${({ $type }) => toastAccent($type)};
  display: flex;
  align-items: center;
`;

const Message = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${T.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${T.textMuted};
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: ${T.rSm};
  transition: background ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.textPrimary};
  }
`;
