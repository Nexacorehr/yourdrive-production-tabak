/**
 * Styled-components theme — references design tokens via CSS custom properties.
 * Colours resolve at runtime through `--ed-*` vars set on `<html>`.
 */
import { T } from "./tokens";

export const theme = {
  colors: {
    primary: T.accent,
    primaryHover: T.accentHover,
    secondary: T.bgElevated,
    secondaryHover: T.bgHover,
    danger: T.danger,
    dangerHover: T.dangerText,
    success: T.success,
    successHover: T.successText,
    text: {
      primary: T.textPrimary,
      secondary: T.textSecondary,
      muted: T.textMuted,
    },
    background: {
      primary: T.bgSurface,
      secondary: T.bgElevated,
      tertiary: T.bgShell,
      hover: T.bgHover,
      active: T.bgActive,
      input: T.bgInput,
      overlay: T.bgOverlay,
    },
    border: {
      faint: T.borderFaint,
      subtle: T.borderSubtle,
      strong: T.borderStrong,
      accent: T.borderAccent,
    },
    accent: {
      base: T.accent,
      hover: T.accentHover,
      faint: T.accentFaint,
      glow: T.accentGlow,
    },
    semantic: {
      success: T.success,
      successFaint: T.successFaint,
      successText: T.successText,
      danger: T.danger,
      dangerFaint: T.dangerFaint,
      dangerText: T.dangerText,
      warning: T.warning,
      warningFaint: T.warningFaint,
      warningText: T.warningText,
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "2.5rem",
    "3xl": "3rem",
  },
  fontSize: {
    xs: "0.8125rem",
    sm: "0.9375rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontFamily: {
    ui: T.fontUI,
    mono: T.fontMono,
  },
  borderRadius: {
    sm: T.rSm,
    md: T.rMd,
    lg: T.rLg,
    xl: T.rXl,
    full: T.rFull,
  },
  shadows: {
    sm: T.shadowSm,
    card: T.shadowCard,
    elevated: T.shadowElevated,
  },
  transitions: {
    fast: T.tFast,
    base: T.tBase,
    slow: T.tSlow,
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  zIndex: {
    dropdown: T.zDropdown,
    modal: T.zModal,
    toast: T.zToast,
  },
} as const;

export type Theme = typeof theme;
