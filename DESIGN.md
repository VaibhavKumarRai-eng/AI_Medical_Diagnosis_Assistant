---
name: "Aegis AI Medical Brand System"
version: "1.0.0"
tokens:
  colors:
    primary:
      light: "#5B4CF5" # Safe Clinical Indigo
      dark: "#2563EB" # Vibrant Blue
    secondary:
      light: "#EEF0FF" # Soft light clinical backdrop
      dark: "#14B8A6" # Clean Medical Teal
    accent:
      light: "#6C63FF" # Soft interactive purple
      dark: "#22C55E" # Healthy Green
    background:
      light: "#FFFFFF"
      dark: "#0B1120" # Dark slate navy
    surface:
      light: "rgba(255, 255, 255, 0.7)"
      dark: "rgba(17, 24, 39, 0.7)"
    text:
      light: "#1A1A1A"
      dark: "#CBD5E1"
      muted_light: "#666666"
      muted_dark: "#9CA3AF"
  typography:
    font_family: "'Plus Jakarta Sans', 'Outfit', sans-serif"
    poppins: "'Poppins', sans-serif"
    inter: "'Inter', sans-serif"
  spacing:
    base: "8px"
---

# Aegis AI Medical Brand System

This design system establishes a high-fidelity, professional, and accessible visual interface for our AI-powered medical diagnostics application.

## Core Visual Philosophy

1. **Clinical Trustworthiness:** Deep indigos, blues, and teals provide a secure and clean aesthetic suitable for a medical diagnostic platform.
2. **Glassmorphic Depth:** Subtle gradients, transparency, and background blurs (`backdrop-filter`) are used for panels and cards to present a premium feel.
3. **High Accessibility:** Text contrast must be preserved across both themes. Element headings and body blocks must dynamically adjust colors when switching between light and dark modes.

## Component Implementation Rules

- **Theme-Aware Containers:** Avoid hardcoding `bg-dark-surface` or `bg-[#151e30]`. Use standard theme class suffixes (e.g. `bg-white/70 dark:bg-dark-surface/50`).
- **Interactive States:** Use smooth scale and translation transitions on hover (`transition-all duration-300 hover:-translate-y-1`).
- **Input Controls:** All text areas and text boxes must utilize `glass-input` with appropriate placeholder contrast.
- **Risk Indicators:**
  - *High Risk:* Red borders and tinted red backdrops (`text-red-500 dark:text-red-400 bg-red-500/10`).
  - *Medium Risk:* Yellow/amber tints (`text-yellow-600 dark:text-yellow-400 bg-yellow-500/10`).
  - *Low Risk:* Green tints (`text-green-600 dark:text-green-400 bg-green-500/10`).
