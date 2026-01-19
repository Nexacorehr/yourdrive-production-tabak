export const lightTheme = {
  // Backgrounds
  background: "#f8f9fa",
  card: "#ffffff",
  inputBg: "#ffffff",
  buttonBg: "#ffffff",
  iconBg: "#f3f4f6",
  hover: "#f9fafb",
  progressBg: "#f3f4f6",
  infoBg: "#eff6ff",

  // Primary Colors
  primary: "#7c3aed",
  primaryHover: "#6d28d9",
  primaryBg: "#f3f4f6",
  primaryShadow: "rgba(124, 58, 237, 0.1)",

  // Text Colors
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",

  // Borders
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  infoBorder: "#dbeafe",

  // Danger Colors
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  dangerBgHover: "#fecaca",
  dangerBgLight: "rgba(254, 226, 226, 0.3)",
  dangerBorder: "#fee2e2",

  // Toggle
  toggleBg: "#e5e7eb",

  // Shadow
  shadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

export const darkTheme = {
  // Backgrounds
  background: "#0f0f0f",
  card: "#1a1a1a",
  inputBg: "#0f0f0f",
  buttonBg: "#242424",
  iconBg: "#242424",
  hover: "#242424",
  progressBg: "#242424",
  infoBg: "#1e293b",

  // Primary Colors
  primary: "#7c3aed",
  primaryHover: "#6d28d9",
  primaryBg: "#7c3aed",
  primaryShadow: "rgba(124, 58, 237, 0.2)",

  // Text Colors
  text: "#e0e0e0",
  textSecondary: "#a0a0a0",
  textTertiary: "#737373",

  // Borders
  border: "#333333",
  borderLight: "#242424",
  infoBorder: "#1e3a5f",

  // Danger Colors
  danger: "#fca5a5",
  dangerBg: "#991b1b",
  dangerBgHover: "#7f1d1d",
  dangerBgLight: "rgba(153, 27, 27, 0.1)",
  dangerBorder: "#991b1b",

  // Toggle
  toggleBg: "#333333",

  // Shadow
  shadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
};

export type Theme = typeof lightTheme;
