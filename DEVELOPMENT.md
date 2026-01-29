# 🚀 Havadurumuck - Geliştirme Rehberi

## 📦 Kurulum

```bash
# Klonlama
git clone https://github.com/kalkanci/havadurumuck.git
cd havadurumuck

# Bağımlılıkları yükleme
npm install

# Geliştirme sunucusu başlatma
npm run dev

# Production build
npm run build

# Ön izleme
npm run preview
```

## 🏗️ Proje Yapısı

```
havadurumuck/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   ├── icon-192.png           # PWA icon (192x192)
│   └── icon-512.png           # PWA icon (512x512)
├── src/
│   ├── components/            # React bileşenleri (21+)
│   ├── services/              # API entegrasyonları
│   │   ├── weatherService.ts
│   │   ├── astronomyService.ts
│   │   ├── imageService.ts
│   │   └── translationService.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── performance.ts     # ✨ YENİ - Performans utilities
│   ├── styles/
│   │   └── responsive.css     # ✨ YENİ - Mobil responsive
│   ├── App.tsx                # Ana bileşen
│   ├── index.tsx              # Entry point
│   ├── types.ts               # TypeScript interfaces
│   ├── constants.tsx          # WMO hava kodu sabitleri
│   └── index.css              # Global stiller
├── index.html                 # ✨ İYİLEŞTİRİLDİ - PWA meta taglar
├── vite.config.ts             # ✨ İYİLEŞTİRİLDİ - Build optimizasyonu
├── tsconfig.json
├── package.json
├── .env.local                 # ✨ YENİ - Ortam değişkenleri
├── OPTIMIZATION_REPORT.md     # ✨ YENİ - Detaylı rapor
└── DEVELOPMENT.md             # ✨ YENİ - Bu dosya
```

## 🎨 Tasarım Sistem

### Renk Paletini

```typescript
// Dark Mode (Varsayılan)
#020617  → Arka plan
#1e293b  → Cam kartlar
#ffffff  → Metni
#0A84FF  → Vurgu (iOS Blue)

// Responsive CSS Variables
--color-bg, --color-glass, --color-text
--spacing-*: xs, sm, md, lg, xl, 2xl
--radius-*: sm, md, lg, xl
```

### Responsive Breakpoints

```css
📱 Mobile:    < 640px
📦 Tablet:    641px - 1024px
🖥️ Desktop:   1025px+
🔀 Landscape: max-height 500px
```

### Glass Card Komponenti

```tsx
<div className="glass-card p-4 rounded-lg">
  <h2 className="heading-mobile">Title</h2>
  <p className="text-sm">Content</p>
</div>
```

## 🔧 Bileşen Geliştirme

### Yeni Bir Bileşen Oluşturma

```tsx
// src/components/MyComponent.tsx
import React, { memo } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = memo(({ title, onAction }) => {
  return (
    <div className="glass-card p-4 rounded-lg">
      <h2 className="heading-mobile">{title}</h2>
      <button 
        className="btn-mobile"
        onClick={onAction}
      >
        Action
      </button>
    </div>
  );
});

MyComponent.displayName = 'MyComponent';
export default MyComponent;
```

### Performance Best Practices

```typescript
✅ Yapılması gerekenler:
  • React.memo() kullan (prop stabilitesi için)
  • useCallback() - event handlers ve callbacks
  • useMemo() - expensive calculations
  • Lazy loading - büyük bileşenler (React.lazy)
  • useRef - DOM erişimi

❌ Kaçınılması gerekenler:
  • Inline object / array props
  • Arrow functions in render
  • Unnecessary state
  • Global mutation
```

## 🔌 API Entegrasyonları

### Hava Durumu Verisi

```typescript
import { fetchWeather } from './services/weatherService';

const data = await fetchWeather(latitude, longitude);
// Dönüş: CurrentWeather + HourlyForecast + DailyForecast + AirQuality
```

### Konumu Arama

```typescript
import { searchCity } from './services/weatherService';

const results = await searchCity('İstanbul');
// Dönüş: GeoLocation[]
```

### Astronomy Verisi

```typescript
import { fetchAstronomyPicture } from './services/astronomyService';

const data = await fetchAstronomyPicture();
// Dönüş: { url, title, explanation }
```

## 🚀 Performans Utilities

### Debounce Kullanımı

```typescript
import { useDebounce } from './utils/performance';

const [searchTerm, setSearchTerm] = useState('');
const debouncedTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedTerm) {
    searchCity(debouncedTerm);
  }
}, [debouncedTerm]);
```

### Network Status Kontrol

```typescript
import { useNetworkStatus } from './utils/performance';

const { online, effectiveType } = useNetworkStatus();

if (!online) {
  return <div>Offline Mode</div>;
}

if (effectiveType === 'slow-2g' || effectiveType === '2g') {
  return <div>Low Bandwidth Mode</div>;
}
```

### API Cache Kullanımı

```typescript
import { apiCache } from './utils/performance';

const cacheKey = `weather-${lat}-${lon}`;
if (apiCache.has(cacheKey)) {
  return apiCache.get(cacheKey);
}

const data = await fetchWeather(lat, lon);
apiCache.set(cacheKey, data);
return data;
```

### Lazy Loading (Görünürlük)

```typescript
import { useIntersectionObserver } from './utils/performance';

const ref = useRef<HTMLDivElement>(null);
const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

return (
  <div ref={ref}>
    {isVisible && <ExpensiveComponent />}
  </div>
);
```

## 📱 PWA Özellikleri

### Service Worker Etkinleştirme

```typescript
// index.html'de otomatik yapılır
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Kurulum İstemi

```typescript
const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  const handleBeforeInstall = (e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstall);
}, []);

// Button tıklandığında
const handleInstall = async () => {
  deferredPrompt?.prompt();
  await deferredPrompt?.userChoice;
};
```

### Offline Fallback

```typescript
// Service Worker otomatik olarak cache'den sunar
// API başarısız → Cached data kullanılır
// Network geri geldi → Fresh data alınır
```

## 🧪 Test Komutları

### Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse
# Performance, Accessibility, Best Practices, SEO

# Online: https://pagespeed.web.dev/
```

### Service Worker Debug

```javascript
// Console'de:
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
caches.keys().then(keys => console.log(keys));
caches.open('atmosfer-ai-v2').then(cache => cache.keys().then(k => console.log(k)));
```

### Network Simulation

```
DevTools → Network → Throttling:
  ☐ Slow 3G
  ☐ 4G
  ☐ Offline
```

### Mobile Emulation

```
DevTools → Device Emulation:
  ☐ iPhone 12 Pro
  ☐ Pixel 5
  ☐ iPad Air
  ☐ Custom (500x800)
```

## 🐛 Debugging Tips

### React DevTools

```bash
npm install -D @react-devtools/shell-extension
# Chrome DevTools → React tabtı
```

### Performance Profiler

```typescript
import { markPerformance, measurePerformance } from './utils/performance';

markPerformance('weather-fetch');
const data = await fetchWeather(lat, lon);
const duration = measurePerformance('weather-fetch');
console.log(`Fetched in ${duration}ms`);
```

### Console Logging

```typescript
// Development mode
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG]', data);
}

// Production mode: console.log kaldırılır (terser)
```

## 📋 Checklist - Yeni Feature Eklemek

- [ ] Bileşen oluş (React.memo ile)
- [ ] Props interface tanımla (TypeScript)
- [ ] Responsive CSS ekle (mobile-first)
- [ ] Performance optimize et (useCallback, useMemo)
- [ ] Accessibility kontrol et (ARIA labels, focus)
- [ ] Teste tabi tut (console, DevTools)
- [ ] Lighthouse score kontrol et (> 80)
- [ ] Service Worker cache stratejisini güncelle
- [ ] README/docs güncelle
- [ ] Commit et ve PR aç

## 🚢 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

### Static Server (Express)

```javascript
const express = require('express');
const app = express();

app.use(express.static('dist'));
app.use((req, res) => {
  res.sendFile('dist/index.html');
});

app.listen(3000);
```

### Environment Variables

```
.env.local:
  GEMINI_API_KEY=...
  VITE_DEPLOY_URL=https://yourdomain.com
```

## 📚 Faydalı Linkler

- [Vite Docs](https://vitejs.dev/)
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Web.dev Guides](https://web.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 💡 Tips & Tricks

### Bundle Size Kontrol

```bash
npm run build
# dist/ klasöründe file size'ları kontrol et

# Detaylı analiz için:
npm install -D rollup-plugin-visualizer
```

### Hot Module Replacement (HMR)

```
DevTools'ta değişiklikler otomatik yüklenir
Sayfayı yenilemeye gerek yok
State korunur
```

### TypeScript Strict Mode

```
tsconfig.json'de "strict": true
Tüm type errors'u düzelt
```

---

**Son Güncellenme:** 29 Ocak 2026  
**Versiyon:** 2.0 (Optimization Release)
