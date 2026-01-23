## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2025-02-20 - Icon-Only Buttons in Modals
**Learning:** Found that close buttons and destructive actions in modals (trash icons) consistently lacked accessible labels, similar to the header pattern.
**Action:** When implementing or reviewing modals, explicitly check for `aria-label` on the close "X" button and any icon-only action buttons.
