## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Interactive Lists Accessibility
**Learning:** Search results were implemented as `<li>` elements with `onClick`, rendering them inaccessible to keyboard users (no focus, no Enter key support).
**Action:** Always wrap interactive list content in `<button className="w-full text-left ...">` to ensure native focus and keyboard support.
