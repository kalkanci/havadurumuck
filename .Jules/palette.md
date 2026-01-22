## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2025-02-17 - Search Component Accessibility
**Learning:** Interactive search results implemented as clickable `<li>` or `<div>` elements are not keyboard accessible by default.
**Action:** Wrap list item content in a full-width `<button>` element inside the `<li>` to ensure native keyboard focus and interaction (Enter/Space) without custom handlers.
