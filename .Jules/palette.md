## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Search Result Accessibility
**Learning:** Converting clickable `li` elements to `li > button` significantly improves keyboard navigation (Tab + Enter) without altering visual design if `w-full text-left` is applied.
**Action:** Always refactor interactive list items (like search results or dropdowns) to use internal buttons instead of `onClick` on the container.
