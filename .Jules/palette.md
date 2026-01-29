## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2025-10-26 - Input Overlay Patterns
**Learning:** Absolute icons placed before inputs were obscured by the input's background. Also, overlay icons blocked clicks to the input.
**Action:** Always place overlay icons *after* the input in DOM and use `pointer-events-none` for non-interactive decorative icons.
