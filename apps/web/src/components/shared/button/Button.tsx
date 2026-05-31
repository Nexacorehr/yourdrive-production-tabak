import React, { forwardRef, useEffect } from "react";
import { T } from "../../../theme/tokens";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    children,
    style,
    className,
    disabled,
    type = "button",
    ...rest
  } = props;

  const sizeStyles: Record<Size, React.CSSProperties> = {
    sm: { padding: "4px 10px", fontSize: 12 },
    md: { padding: "8px 14px", fontSize: 14 },
    lg: { padding: "12px 20px", fontSize: 16 },
  };

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: T.accent,
      color: T.textInvert,
      border: `1px solid ${T.borderFaint}`,
    },
    secondary: {
      backgroundColor: T.bgHover,
      color: T.textPrimary,
      border: `1px solid ${T.borderSubtle}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: T.accent,
      border: "1px solid transparent",
    },
  };

  const combinedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: T.fontUI,
    fontWeight: 500,
    borderRadius: T.rMd,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: `background ${T.tFast}, border-color ${T.tFast}, color ${T.tFast}`,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG_MODE === "true") {
      console.log(`Button mounted with variant: ${variant} and size: ${size}`);
    }
  }, [variant, size]);

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={combinedStyle}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
