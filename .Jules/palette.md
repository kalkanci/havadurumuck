## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Interactive Lists
**Learning:** Detected a pattern of using `div` or `li` with `onClick` for interactive lists (Favorites, Search Results), which breaks keyboard accessibility.
**Action:** Refactor these into `<button>` elements with `text-left` and `w-full` utility classes to maintain layout while gaining native focus and keyboard support.
