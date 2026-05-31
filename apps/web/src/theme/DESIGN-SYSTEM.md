# YourDrive Design System

North star: **Command Palette** (Ctrl+K on Your Files). All surfaces should feel like that component — restrained navy/white palette, Poppins UI type, subtle borders, 8–12px radii, no purple gradients.

## Token usage

```tsx
import { T } from "@/theme/tokens"; // or "../../theme/tokens"

const Card = styled.div`
  background: ${T.bgSurface};
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  box-shadow: ${T.shadowCard};
  color: ${T.textPrimary};
  font-family: ${T.fontUI};
`;
```

CSS variables (`--ed-*`) are set on `<html data-app-theme="light|dark">` at boot and when the user changes theme in Settings. Styled-components `ThemeProvider` mirrors the same tokens via `theme/theme.ts`.

## Token reference

| Token | Purpose |
|-------|---------|
| `bgShell` | App/page background |
| `bgSurface` | Cards, modals, tables |
| `bgElevated` | Headers, icon wells |
| `bgHover` / `bgActive` | Interactive states |
| `textPrimary/Secondary/Muted` | Type hierarchy |
| `accent` / `accentFaint` | Brand blue, selection tint |
| `borderFaint/Subtle/Strong` | 1px borders |
| `rSm–rXl` | 5 / 8 / 12 / 16px radii |
| `shadowCard/Elevated` | Command-palette elevation |

Marketing pages may use `--app-marketing-hero-bg` and Forma DJR Display for hero headlines; accent still uses `--ed-accent`.

## Audit (pre-migration)

| Area | Issue |
|------|-------|
| Sidebar nav | Hardcoded `#0F85FF`, `#2d9cff`, mixed grays |
| Navbar buttons | Purple/blue gradient pills |
| Shared `Button` | GitHub-blue `#0366d6`, inline styles |
| Tables/modals | Mix of `#202124`, `#e0e0e0`, `#dadce0`, random 16px radius |
| Login | Slate palette `#64748b`, gray page bg `#a3b0bd` |
| Landing hero | `#1f9afe`, `#dde2ee` disconnected from dashboard |
| Toasts | Side-stripe borders, pure `#fff` |
| Settings | 77 hardcoded hex values in styles file |
| File preview | Per-preview dark themes, not tokenized |

## Anti-patterns (do not use)

- Heavy purple/blue gradients on buttons
- `#000` / `#fff` without token
- Side-stripe toast borders
- Random border-radius (stick to `rSm`–`rLg`)
- System font stacks without Poppins on product UI

## Theme switching

`userUiPreferencesStore` calls `applyThemeCssVars()` when theme resolves. Editor/command palette subtrees can still use `getThemeVars(theme)` for isolated shells.
