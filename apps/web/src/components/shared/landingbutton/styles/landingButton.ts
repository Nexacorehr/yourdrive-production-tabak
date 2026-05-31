import styled, { css } from "styled-components";
import { T } from "../../../../theme/tokens";

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface StyledButtonProps {
  $variant: Variant;
  $size: Size;
  $width?: string;
}

const sizeStyles = {
  sm: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    min-width: 80px;

    @media (max-width: 1024px) {
      font-size: 0.8125rem;
      padding: 0.2rem 0.45rem;
      min-width: 75px;
    }

    @media (max-width: 768px) {
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
      min-width: 70px;
    }

    @media (max-width: 480px) {
      font-size: 0.7rem;
      padding: 0.15rem 0.35rem;
      min-width: 60px;
    }
  `,
  md: css`
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-width: 100px;

    @media (max-width: 1024px) {
      font-size: 0.8125rem;
      padding: 0.45rem 0.7rem;
      min-width: 95px;
    }

    @media (max-width: 768px) {
      font-size: 0.75rem;
      padding: 0.4rem 0.65rem;
      min-width: 90px;
    }

    @media (max-width: 480px) {
      font-size: 0.7rem;
      padding: 0.35rem 0.6rem;
      min-width: 80px;
    }
  `,
  lg: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    min-width: 140px;

    @media (max-width: 1024px) {
      font-size: 1.0625rem;
      padding: 0.7rem 1.35rem;
      min-width: 130px;
    }

    @media (max-width: 768px) {
      font-size: 1rem;
      padding: 0.65rem 1.25rem;
      min-width: 120px;
    }

    @media (max-width: 480px) {
      font-size: 0.9375rem;
      padding: 0.6rem 1rem;
      min-width: 100px;
    }
  `,
};

const variantStyles = {
  primary: css`
    background: ${T.accent};
    color: ${T.textInvert};
    border: 1px solid ${T.borderFaint};

    &:hover:not(:disabled) {
      background: ${T.accentHover};
    }
  `,
  secondary: css`
    background: ${T.accentFaint};
    color: ${T.textPrimary};
    border: 1px solid ${T.borderSubtle};

    &:hover:not(:disabled) {
      background: ${T.bgActive};
    }
  `,
  ghost: css`
    background: var(--app-marketing-muted);
    color: ${T.textInvert};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      opacity: 0.92;
    }
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${T.rMd};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: transform ${T.tBase}, box-shadow ${T.tBase}, background ${T.tFast};
  font-family: ${T.fontUI};
  font-style: normal;
  line-height: 1.5;
  font-weight: 500;
  box-shadow: ${T.shadowSm};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  width: ${({ $width }) => $width || "auto"};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${T.shadowCard};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${T.accent};
    outline-offset: 2px;
  }
`;