import React from "react";
import styled from "styled-components";
import Button, { type ButtonProps } from "../../button/Button";
import { T } from "../../../../theme/tokens";

type NavButtonProps = ButtonProps & {
  onClick?: () => void;
};

const StyledNavButton = styled(Button).attrs({
  size: "sm",
})<{ className?: string }>`
  width: 35px;
  height: 35px;
  padding: 0 !important;
  font-size: 16px;
  border-radius: ${T.rMd} !important;
  border: 1px solid ${T.borderFaint} !important;
  cursor: pointer;
  color: ${T.textInvert} !important;
  background: ${T.accent} !important;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  transition:
    background ${T.tFast},
    box-shadow ${T.tFast},
    transform ${T.tFast};
  will-change: transform;

  &:hover {
    background: ${T.accentHover} !important;
    box-shadow: ${T.shadowSm};
  }

  &:active {
    transform: scale(0.97);
  }

  &.desktop-only {
    display: inline-flex !important;
  }

  &.mobile-only {
    display: none !important;
  }

  @media (max-width: 768px) {
    &.desktop-only {
      display: none !important;
    }

    &.mobile-only {
      display: inline-flex !important;
    }
  }
`;

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ onClick, children, className, ...props }, ref) => {
    return (
      <StyledNavButton
        onClick={onClick}
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </StyledNavButton>
    );
  },
);

export default NavButton;
