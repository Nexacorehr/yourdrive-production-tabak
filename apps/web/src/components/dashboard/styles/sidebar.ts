import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { T } from "../../../theme/tokens";
import { DASHBOARD_NAV_HEIGHT_PX } from "./application";

const MOBILE_DRAWER_WIDTH = "min(280px, 88vw)";

export interface SidebarWrapperProps {
  $isOpen: boolean;
  $isMobile: boolean;
}

export const SidebarWrapper = styled(motion.aside).attrs<SidebarWrapperProps>(
  ({ $isMobile }) => {
    if ($isMobile) {
      return {
        initial: { x: "-100%" },
        animate: { x: 0 },
        transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
      };
    }
    return {
      initial: { width: 0, opacity: 0, marginRight: 0 },
      animate: {
        width: "200px",
        opacity: 1,
        marginRight: "16px",
      },
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
    };
  },
)<SidebarWrapperProps>`
  box-sizing: border-box;
  pointer-events: auto;
  z-index: 30;
  overflow: hidden;

  ${({ $isMobile }) =>
    $isMobile
      ? css`
          position: fixed;
          top: ${DASHBOARD_NAV_HEIGHT_PX}px;
          left: 0;
          bottom: 0;
          width: ${MOBILE_DRAWER_WIDTH};
          min-width: 0;
          max-width: 100%;
          height: calc(100dvh - ${DASHBOARD_NAV_HEIGHT_PX}px);
          max-height: calc(100dvh - ${DASHBOARD_NAV_HEIGHT_PX}px);
          margin-right: 0;
          padding: 16px 14px max(20px, env(safe-area-inset-bottom, 0px));
          background: ${T.bgSurface};
          border-right: 1px solid ${T.borderSubtle};
          box-shadow: ${T.shadowElevated};
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        `
      : css`
          position: relative;
          min-width: 0;
          height: 100%;
          background: transparent;
        `}

  & > *:not(button) {
    opacity: 1;
    transition: opacity 0.2s ease;
  }
`;

export const UserName = styled.h1`
  font-size: 28px;
  font-weight: 500;
  line-height: 32px;
  margin-top: 0px;
  margin-bottom: 6px;
  color: ${T.textPrimary};
  font-family: ${T.fontUI};
`;

export const UserDevice = styled.h3`
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  color: ${T.textSecondary};
  margin-top: 0px;
  font-family: ${T.fontUI};
`;

export const Navigation = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 100%;
  margin-top: 18px;
  margin-bottom: 18px;
`;

export const NavItem = styled.li<{ isActive: boolean }>`
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: ${T.rMd};
  background: ${({ isActive }) => (isActive ? T.accent : "transparent")};
  transition: background ${T.tFast}, color ${T.tFast};

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: ${({ isActive }) => (isActive ? T.textInvert : T.textSecondary)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 13px;
    font-weight: ${({ isActive }) => (isActive ? 500 : 400)};
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ${T.fontUI};
  }

  ${({ isActive }) =>
    !isActive
      ? `
    &:hover {
      background: ${T.bgHover};
    }
    &:hover a {
      color: ${T.textPrimary};
    }
  `
      : `
    &:hover {
      background: ${T.accentHover};
    }
    &:hover a {
      color: ${T.textInvert};
    }
  `}
`;

export const UpgradeWrapper = styled.div`
  max-width: 190px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ProgressBar = styled.div`
  height: 5px;
  background: ${T.borderSubtle};
  border-radius: ${T.rSm};
  overflow: hidden;
  width: inherit;
`;

export const ProgressFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => `${percentage * 100}%`};
  height: inherit;
  background: ${T.accent};
  transition: width 0.3s ease;
`;

export const UsageText = styled.div`
  font-size: 12px;
  color: ${T.textPrimary};
  font-family: ${T.fontUI};

  span {
    color: ${T.accent};
    cursor: pointer;
  }
`;

export const UpgradeButton = styled.button`
  margin-top: 4px;
  padding: 10px 0;
  width: 100%;
  border-radius: ${T.rFull};
  border: 1px solid ${T.borderStrong};
  background: transparent;
  font-size: 13px;
  font-family: ${T.fontUI};
  cursor: pointer;
  transition: background ${T.tFast}, color ${T.tFast};
  color: ${T.textSecondary};

  &:hover {
    background: ${T.textPrimary};
    color: ${T.textInvert};
    border-color: ${T.textPrimary};
  }
`;
