## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Search Results Accessibility
**Learning:** Search results were implemented as `<li>` elements with `onClick` handlers, making them inaccessible to keyboard users who can't tab to them.
**Action:** Wrap interactive list items in full-width `<button>` elements inside the `<li>` to ensure native keyboard focus and activation.
