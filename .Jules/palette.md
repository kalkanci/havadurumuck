## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2026-01-18 - Search Results Accessibility
**Learning:** Dropdown lists implemented as `<ul>` with `onClick` on `<li>` are invisible to keyboard users.
**Action:** Always wrap list items in `<button>` elements with `w-full text-left` to maintain layout while gaining free keyboard support and focus states.
