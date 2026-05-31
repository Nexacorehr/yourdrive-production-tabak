import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useSidebarStore } from "../../../../store/sidebarStore";
import { T } from "../../../../theme/tokens";

const SidebarToggle: React.FC = () => {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <ToggleButton
      data-tour="tour-sidebar-toggle"
      onClick={toggle}
      transition={{ duration: 0.2 }}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        initial={false}
        animate={{
          scaleX: isOpen ? 1 : -1,
        }}
        transition={{
          duration: 0.28,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <g clipPath="url(#clip0_sidebar_toggle)">
          <path
            d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.96997 2V22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.97 9.43945L12.41 11.9995L14.97 14.5595"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_sidebar_toggle">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </motion.svg>
    </ToggleButton>
  );
};

export default SidebarToggle;

const ToggleButton = styled(motion.button)`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: ${T.rMd};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${T.textPrimary};
  transition: background ${T.tFast}, border-color ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgActive};
    border-color: ${T.borderStrong};
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 2px solid ${T.accent};
    outline-offset: 2px;
  }

  svg {
    display: block;
  }
`;
