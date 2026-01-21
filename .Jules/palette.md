## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2026-01-21 - Search & List Accessibility
**Learning:** Interactive list items (like search results) implemented as `li` with `onClick` are inaccessible to keyboard users.
**Action:** Refactor interactive lists to wrap content in full-width `<button>` elements to ensure focus and activation support without custom key handlers.
