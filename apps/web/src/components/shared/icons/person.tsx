import { type JSX } from "react";

const PersonIcon = ({
  color = "#CAE7FD",
  width = "9",
  height = "11",
}: {
  color?: string;
  width?: string;
  height?: string;
}): JSX.Element => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 11 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.02377 4.96943C6.25796 4.96943 7.25847 3.96891 7.25847 2.73471C7.25847 1.50052 6.25796 0.5 5.02377 0.5C3.78957 0.5 2.78906 1.50052 2.78906 2.73471C2.78906 3.96891 3.78957 4.96943 5.02377 4.96943Z"
      stroke={color}
    />
    <path
      d="M9.54714 10.4999C9.54714 9.30018 9.07055 8.14959 8.22222 7.30125C7.37388 6.45291 6.22329 5.97632 5.02357 5.97632C3.82384 5.97632 2.67326 6.45291 1.82492 7.30125C0.976589 8.14959 0.5 9.30018 0.5 10.4999H9.54714Z"
      stroke={color}
    />
  </svg>
);

export default PersonIcon;
