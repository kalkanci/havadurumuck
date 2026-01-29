# 🎨 Havadurumuck - Design System & UX Guidelines

## 📐 Design Principles

### 1. **Weather-First Design**
- Clear, prominent weather display
- Hierarchy: Current conditions → Hourly → Daily
- Immediate visibility of alerts and warnings

### 2. **Clarity & Accuracy**
- High contrast text (WCAG AA+)
- Precise weather icons
- Accurate, source-attributed data

### 3. **Responsive & Mobile-First**
- Touch-friendly: 48x48px minimum targets
- Adaptive layouts for all screen sizes
- Landscape mode support

### 4. **Performance & Speed**
- Smooth 60fps animations
- Fast load times
- Offline capability via Service Worker

---

## 🎨 Color System

### Semantic Colors

```
Sunny/Clear:        #FFD700 (Gold)
Cloudy:             #A0AEC0 (Gray-Blue)
Rainy:              #3B82F6 (Blue)
Severe Weather:     #EF4444 (Red)
Warning:            #F59E0B (Amber)
```

### Base Colors

```
Background:         #020617 (Slate-950)
Secondary BG:       #0f172a (Slate-900)
Text:               #ffffff (White)
Text Secondary:     #cbd5e1 (Slate-300)
Text Muted:         #94a3b8 (Slate-400)
```

### Glass Effect

```
Glass Primary:      rgba(30, 41, 59, 0.5) + blur(24px)
Glass Light:        rgba(255, 255, 255, 0.1) + blur(28px)
Inset Light:        rgba(255, 255, 255, 0.05)
```

---

## 🔤 Typography System

### Font Stack
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, 
Ubuntu, Cantarell, sans-serif
```

### Sizes (Mobile-First)

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| H1 | 3rem (48px) | 700 | 1.25 |
| H2 | 2.25rem (36px) | 700 | 1.25 |
| H3 | 1.875rem (30px) | 700 | 1.25 |
| H4 | 1.5rem (24px) | 700 | 1.25 |
| H5 | 1.25rem (20px) | 600 | 1.5 |
| H6 | 1.125rem (18px) | 600 | 1.5 |
| Body | 1rem (16px) | 400 | 1.5 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Xs | 0.75rem (12px) | 400 | 1.5 |

---

## 📏 Spacing System

```
XS:  0.25rem (4px)
SM:  0.5rem (8px)
MD:  1rem (16px)
LG:  1.5rem (24px)
XL:  2rem (32px)
2XL: 3rem (48px)
```

### Application
- **Cards**: `var(--space-lg)` padding
- **Lists**: `var(--space-md)` gap
- **Buttons**: `var(--space-md)` vertical, `var(--space-lg)` horizontal
- **Sections**: `var(--space-xl)` margin

---

## 🎯 Component States

### Buttons
```css
Default:   background: rgba(10, 132, 255, 0.9)
Hover:     background: rgba(10, 132, 255, 1) + translateY(-2px)
Active:    transform: scale(0.95)
Focus:     outline: 2px solid #0A84FF
Disabled:  opacity: 0.5, cursor: not-allowed
```

### Cards
```css
Default:   rgba(30, 41, 59, 0.5) + blur(24px)
Hover:     rgba(30, 41, 59, 0.6) + enhanced shadow
Active:    scale(0.98)
```

### Inputs
```css
Default:   rgba(30, 41, 59, 0.6) + border rgba(255,255,255,0.15)
Focus:     rgba(30, 41, 59, 0.8) + blue border + glow
```

---

## ⚡ Animation Timings

```
Fast:      150ms cubic-bezier(0.4, 0, 0.2, 1)
Base:      300ms cubic-bezier(0.4, 0, 0.2, 1)
Slow:      500ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Available Animations

| Name | Duration | Use Case |
|------|----------|----------|
| slideInUp | 300ms | Card entrance |
| slideInDown | 300ms | Header entrance |
| fadeInScale | 300ms | Weather data |
| pulseGlow | 3s infinite | Alert emphasis |
| weatherSlideRight | 300ms | Icon reveal |

---

## 📱 Responsive Breakpoints

```
Mobile:        < 640px
Tablet:        641px - 1024px
Desktop:       1025px+
Large:         > 1280px
```

### Mobile Optimizations
- **Touch targets**: Minimum 48x48px
- **Padding**: Increased to `var(--space-lg)`
- **Typography**: Readable without zoom
- **Safe Area**: Support for notched devices
- **Scrolling**: Smooth, optimized

---

## ♿ Accessibility (WCAG 2.1 AA)

### Color Contrast
- Text on background: 7:1 ratio minimum
- UI components: 4.5:1 ratio minimum

### Focus Management
- All interactive elements focusable
- Visible focus indicator (2px outline)
- Logical tab order

### Screen Readers
```html
<button aria-label="Search for location">
<div role="alert" aria-live="polite"></div>
<input aria-describedby="error-msg" />
```

### Reduced Motion
- Respects `prefers-reduced-motion`
- Animations duration: 0.01ms when reduced motion enabled

### Touch & Keyboard
- All features keyboard accessible
- Touch-friendly spacing
- No hover-only interactions

---

## 🎬 Micro-Interactions

### Pull to Refresh
```
Trigger: Swipe down when at scroll top
Visual: Scale and rotate icon
Feedback: Haptic vibration + success animation
```

### Weather Data Update
```
Entry: fadeInScale animation
Stagger: Each item delayed 50ms
Exit: slideOutDown animation (if updating)
```

### Location Search
```
Focus: Input glows with blue border
Results: Slide in from bottom
Selection: Scale down, haptic feedback
```

### Alert Display
```
Trigger: Automatic on mount
Animation: pulseGlow continuous
Action: Dismissible swipe left
```

---

## 🎨 Weather Icon Guidelines

### Clear/Sunny
- Bright yellow (#FFD700)
- Simple sun shape
- No shadow/overlay

### Cloudy
- Gray-blue (#A0AEC0)
- Layered cloud shapes
- Subtle shadow

### Rainy
- Blue (#3B82F6)
- Drops below clouds
- Motion feeling

### Severe
- Red (#EF4444)
- Bold outline
- Animation: pulse/glow

---

## 📐 Layout Grid

### Mobile (< 640px)
```
1 column, full width
Padding: 1.5rem (safe area adjusted)
Gap: 1rem
Card width: 100%
```

### Tablet (641px - 1024px)
```
2 columns
Padding: 2rem
Gap: 1.5rem
Card width: calc(50% - 0.75rem)
```

### Desktop (1025px+)
```
3 columns
Padding: 3rem
Gap: 2rem
Card width: calc(33.333% - 1.33rem)
```

---

## 🚀 Performance Targets

- **First Paint**: < 1s
- **Largest Contentful Paint**: < 2.5s
- **Interaction to Paint**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### Optimization Techniques
- Code splitting (lazy loading)
- Service Worker caching
- Image optimization
- CSS minification
- Font subsetting

---

## 📋 Component Checklist

When building new components:

- [ ] Responsive design (mobile-first)
- [ ] Touch-friendly targets (48x48px)
- [ ] Smooth animations (300ms base)
- [ ] Accessible (WCAG AA)
- [ ] Focus states visible
- [ ] Dark mode support
- [ ] Reduced motion support
- [ ] TypeScript types
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Haptic feedback (where appropriate)
- [ ] Documentation/comments

---

## 🎯 Best Practices

### Do's ✅
- Use semantic HTML (`<button>`, `<main>`, `<nav>`)
- Test with keyboard navigation
- Provide visual feedback for all interactions
- Use high contrast colors
- Keep animations under 500ms
- Support offline mode
- Cache API responses
- Optimize for slow networks

### Don'ts ❌
- No hover-only interactions
- No auto-play media without user consent
- No flashing content > 3 Hz
- No text smaller than 12px
- No missing alt text for icons
- No color-only information
- No infinite loading states
- No blocking main thread (long tasks)

---

## 🔧 Development Tools

### Testing
- Chrome DevTools (Lighthouse, Mobile Emulation)
- Accessibility Inspector
- Network Throttling (Slow 3G)
- Screen Readers (NVDA, JAWS)

### Performance
- Web Vitals monitoring
- Bundle analyzer
- Lighthouse CI
- Performance Observer API

---

**Version:** 1.0  
**Last Updated:** 29 January 2026  
**Status:** Active
