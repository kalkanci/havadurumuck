## 2024-05-23 - Initial Setup
**Learning:** Found critical navigation buttons (Favorites, Settings) completely lacking accessible labels in a main header area. This is a common pattern in "icon-only" aesthetic designs.
**Action:** Always check header/toolbar areas first for icon-only buttons as they are high-impact accessibility blockers.

## 2024-05-24 - Search Experience
**Learning:** Search inputs with debounce often leave users confused about whether the app is "working" or not. The lack of an immediate "Searching..." state creates a perception of unresponsiveness.
**Action:** Always couple debounced search inputs with an immediate visual feedback (spinner or text) as soon as typing stops or the threshold is met, even before the API responds.
