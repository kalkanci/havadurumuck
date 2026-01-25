## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2026-01-25 - Search Navigation Accessibility
**Learning:** Search result dropdowns often use `li` elements with `onClick` handlers, rendering them completely inaccessible to keyboard users.
**Action:** Always refactor interactive list items into `<button>` elements wrapped in `<li>` to ensure native tab navigation and screen reader support without breaking the visual layout.
