import React from "react";
import Button, { type ButtonProps } from "../../button/Button";

type NavButtonProps = ButtonProps & { onClick?: () => void };

const NavButton: React.FC<NavButtonProps> = ({ onClick, ...props }) => {
  return (
    <Button
      {...props}
      style={{
        width: 35,
        height: 35,
        padding: 0,
        borderRadius: 6,
        background:
          "linear-gradient(320deg, rgba(77, 163, 255, 0.9) 4%, rgba(16, 133, 255, 1) 50%)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "none",
        ...props.style,
      }}
      onClick={onClick}
    >
      {props.children}
    </Button>
  );
};

export default NavButton;
