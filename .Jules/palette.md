## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Interactive List Pattern
**Learning:** Search results implemented as `li` elements with click handlers are inaccessible to keyboard users.
**Action:** Wrap content in full-width `<button>` elements within `li` to ensure native focus handling and screen reader support without complex ARIA management.
