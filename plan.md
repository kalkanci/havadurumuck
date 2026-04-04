1. **Understand the Goal**: The user asked to act as a Senior Software Engineer and perform daily code review, optimization, and feature additions, strictly following instructions.
2. **Review Code**:
   - `SettingsModal` doesn't implement the memory instruction: "The `SettingsModal` component accepts an optional `onInstall` prop to display a PWA install button utilizing the `Download` icon."
   - Check if `lucide-react` is installed and the `Download` icon is available. Yes, it is.
   - PWA support seems largely implemented, but the `onInstall` inside `SettingsModal` is missing.
3. **Plan**:
   - Refactor `src/components/SettingsModal.tsx` to include an optional `onInstall` prop.
   - Add a button for "Uygulamayı Yükle" (Install App) that calls `onInstall` when provided.
   - Use `Download` icon from `lucide-react`.
   - Update `src/App.tsx` to pass the `handleInstallClick` to `SettingsModal`.
4. **Testing**:
   - Make sure no regressions are introduced. The project has Vitest, run unit tests if any exist (found none in package.json, so maybe Playwright/manual check).
   - The memory states: "Run unit tests using `npx vitest run` and build the project using `npm run build`."
   - Will verify tests and build.
