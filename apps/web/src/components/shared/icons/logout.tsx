import { type JSX } from "react";

const LogOutIcon = ({ color = "#CAE7FD" }: { color?: string }): JSX.Element => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.0827 15.8334H4.74935C3.8749 15.8334 3.16602 15.1246 3.16602 14.2501V4.75008C3.16602 3.87563 3.8749 3.16675 4.74935 3.16675H11.0827M7.91602 9.50008H16.6243M16.6243 9.50008L14.2493 11.8751M16.6243 9.50008L14.2493 7.12508"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default LogOutIcon;
