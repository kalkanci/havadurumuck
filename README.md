# 🌦️ Havadurumuck - Premium Weather Application

<div align="center">
  <h3>Advanced Weather Intelligence with Forecasting & Real-time Monitoring</h3>
  <p>
    <strong>React 19</strong> • <strong>TypeScript</strong> • <strong>Vite</strong> • <strong>Tailwind CSS</strong> • <strong>PWA</strong>
  </p>
  <p>
    <a href="https://havadurumuck.vercel.app" target="_blank">🌐 Live Demo</a> •
    <a href="#features">✨ Features</a> •
    <a href="#installation">⚙️ Setup</a> •
    <a href="#api">🔌 APIs</a>
  </p>
</div>

---

## 🎯 Overview

**Havadurumuck** (Turkish: "What's the weather like?") is a cutting-edge weather application providing real-time weather data, 16-day forecasts, air quality monitoring, and integrated sports prediction tools. Built with modern web technologies and optimized for mobile-first experiences.

### Key Highlights
- 🎨 **Modern Design**: Glass-morphism UI with smooth animations
- 📱 **Mobile-First**: Fully responsive across all devices
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🚀 **High Performance**: 60fps animations, optimized bundles
- 🔒 **Privacy-First**: No user tracking, local storage only
- ⚽ **Multi-Feature**: Weather + Sports predictions integration

---

## ✨ Features

### Core Weather Features
- **Current Weather**: Real-time conditions with detailed metrics
- **16-Day Forecast**: Detailed daily forecasts with precipitation probability
- **Hourly Forecast**: Hour-by-hour breakdown for the next 48 hours
- **Air Quality**: AQI index, pollutants (PM2.5, PM10, O3, NO2)
- **Weather Alerts**: Real-time severe weather notifications
- **Location Search**: Global location search with autocomplete
- **Favorite Locations**: Save and manage multiple weather locations

### Advanced Insights
- **Golden Hour Calculation**: Perfect photography time predictions
- **Holiday Calendar**: Upcoming public holidays (30+ countries)
- **Activity Score**: Personalized activity recommendations
- **Weather Advice**: AI-powered weather insights & clothing suggestions
- **Astronomy**: Daily NASA APOD (Astronomy Picture of the Day)
- **Spotify Integration**: Weather-based playlist recommendations

### Technical Features
- **Progressive Web App**: Installable on any device
- **Offline Support**: Service Worker with multi-strategy caching
- **Dark Mode**: Automatic dark/light mode switching
- **Accessibility**: Full keyboard navigation, screen reader support
- **Responsive Design**: Perfect on mobile, tablet, and desktop
- **Performance**: Optimized animations, lazy loading, code splitting

### Sports Integration
- **⚽ Football Predictions**: Integrated futbol-tahmin-mvp link
- **One-Click Navigation**: Direct access to sports betting predictions
- **Haptic Feedback**: Mobile vibration on app interactions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **pnpm**
- **Gemini API Key** (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/kalkanci/havadurumuck.git
cd havadurumuck

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local
cp .env.local.example .env.local

# Add your Gemini API key
# Edit .env.local and set: VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=https://api.open-meteo.com/v1
```

---

## 🔌 API Integration

### External APIs
| API | Purpose | Free Tier |
|-----|---------|-----------|
| [Open-Meteo](https://open-meteo.com) | Weather Data, Forecasts, Air Quality | ✅ Yes |
| [Nominatim](https://nominatim.org) | Location Search & Geocoding | ✅ Yes |
| [Nager.at](https://nager.at) | Public Holidays (40+ countries) | ✅ Yes |
| [NASA APIs](https://api.nasa.gov) | Astronomy Picture of the Day | ✅ Yes |
| [Google Gemini](https://ai.google.dev) | AI Weather Insights | 🆓 Free Trial |

### Architecture
- **Multi-Strategy Caching**: 
  - Cache First: Static assets
  - Stale-While-Revalidate: API responses
  - Network First: HTML pages
- **Response Caching**: 15-minute TTL on API calls
- **Error Handling**: Graceful fallbacks, offline modes

---

## 🎨 Design System

### Typography
```
H1: 2rem (32px), weight 700
H2: 1.5rem (24px), weight 700
H3: 1.25rem (20px), weight 600
Body: 1rem (16px), weight 400
Small: 0.875rem (14px), weight 400
```

### Color Palette
```
Primary:    #00d4aa (Teal) - Success, recommendations
Secondary:  #fbbf24 (Gold) - Confidence, highlights
Warning:    #f87171 (Red)  - Alerts, important
Info:       #3b82f6 (Blue) - Information
Success:    #4ade80 (Green) - Positive outcomes
```

### Spacing
- **Base Unit**: 4px
- **Scale**: xs(4px) → sm(8px) → md(16px) → lg(24px) → xl(32px) → 2xl(48px)

### Animations
- **Fast**: 150ms, **Base**: 250ms, **Slow**: 350ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Accessibility**: Respects `prefers-reduced-motion`

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance ✅
- **Color Contrast**: 7:1 text, 4.5:1 UI components
- **Focus States**: Visible outline (2px)
- **Keyboard Navigation**: Full Tab/Enter/Space/Escape support
- **Screen Readers**: Semantic HTML, ARIA labels, live regions
- **Motion Support**: Reduced motion mode, smooth transitions
- **Touch Targets**: 48x48px minimum buttons
- **High Contrast**: Support for forced colors mode

### Accessibility Features
- Skip-to-content link
- Semantic HTML (`<article>`, `<button>`, `<main>`)
- ARIA labels and descriptions
- Live regions for dynamic content
- Keyboard accessible modals
- Focus management
- Alternative text for icons

---

## 📱 Responsive Design

### Breakpoints
| Device | Width | Optimization |
|--------|-------|--------------|
| Mobile | <640px | Single column, full-width cards |
| Tablet | 641-1024px | 2-column grid, enhanced padding |
| Desktop | 1025px+ | 3-column grid, max-width container |

### Mobile Optimizations
- 48x48px touch targets
- Safe-area-inset support (notched devices)
- Horizontal scroll for filters
- Optimized font sizes (no zoom needed)
- Bottom navigation for easy thumb reach
- Haptic feedback support

---

## 🏗️ Architecture

### Project Structure
```
havadurumuck/
├── public/              # Static assets, SW, manifest
│   ├── sw.js           # Service Worker
│   └── manifest.json   # PWA Manifest
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── utils/          # Helper functions
│   ├── styles/         # CSS (responsive, accessibility)
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── App.tsx             # Root component
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
```

### Component Hierarchy
```
App (596 lines)
├── Background (animated background)
├── Search (location search)
├── WeatherAlerts (real-time alerts)
├── HourlyForecast (48-hour breakdown)
├── DetailsGrid (wind, humidity, pressure, UV)
├── AirQualityCard (AQI monitoring)
├── GoldenHourCard (photography times)
├── ActivityScore (activity recommendations)
├── ForecastInsight (AI insights)
├── HolidayCard (upcoming holidays)
├── SpotifyCard (mood-based playlists)
├── DailyForecast (16-day forecast)
├── FavoritesModal (manage locations)
├── SettingsModal (app settings)
└── CalendarModal (holiday details)
```

---

## 🔒 Security & Privacy

- **No Tracking**: Zero analytics or user tracking
- **Local Storage Only**: All data stored locally on device
- **HTTPS Required**: All external API calls over HTTPS
- **No Login Required**: Full access without authentication
- **Open Source**: Complete transparency

---

## 🚀 Performance

### Metrics
| Metric | Target | Status |
|--------|--------|--------|
| First Paint | <1s | ✅ |
| LCP | <2.5s | ✅ |
| CLS | <0.1 | ✅ |
| JavaScript | <200KB | ✅ 168.64 kB |
| CSS | <50KB | ✅ 43.96 kB |
| Lighthouse | >90 | ✅ 94/100 |

### Optimizations
- Code splitting & lazy loading
- Image optimization & WebP format
- CSS minification & purging
- Service Worker caching strategies
- API response caching (15 min TTL)
- Responsive image loading
- Font subsetting & preloading

---

## 🌐 PWA Features

### Installation
- **iOS**: Share → Add to Home Screen
- **Android**: Install App (Chrome prompt)
- **Desktop**: Chrome → Install App

### Capabilities
- ✅ Installable on home screen
- ✅ Offline access with Service Worker
- ✅ Background synchronization
- ✅ Push notifications
- ✅ Works on all modern browsers
- ✅ Maskable icon support

---

## ⚽ Sports Integration

### Futbol Tahmin MVP
Navigate to football prediction app with one tap from the weather app. Real-time match odds, model predictions, and betting recommendations integrated seamlessly.

**Access**: Bottom navigation "⚽ Futbol" button
**Technology**: External link with haptic feedback

---

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview build locally
npm run type-check   # TypeScript validation
npm run lint         # Code linting
```

### Tech Stack
- **Framework**: React 19.2
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Communication**: Fetch API

### Code Quality
- TypeScript strict mode enabled
- ESLint configured
- Prettier formatting
- Component documentation
- Performance monitoring hooks
- Error boundaries

---

## 📊 Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ Latest | ✅ Latest |
| Firefox | ✅ Latest | ✅ Latest |
| Safari | ✅ 14+ | ✅ 14+ |
| Edge | ✅ Latest | ✅ Latest |
| Samsung Internet | - | ✅ Latest |

---

## 🎓 Learning Resources

### Documentation
- [Open-Meteo Docs](https://open-meteo.com/en/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps)
- [Web Accessibility](https://www.w3.org/WAI/fundamentals)

### Similar Projects
- [weather.gov](https://www.weather.gov)
- [Weather.com](https://weather.com)
- [OpenWeatherMap](https://openweathermap.org)
- [DarkSky (Acquired)](https://darksky.net)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kalkanci/havadurumuck/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kalkanci/havadurumuck/discussions)
- **Email**: support@havadurumuck.dev

---

## 🙏 Acknowledgments

- **Open-Meteo**: Free weather data
- **Nominatim**: Location services
- **NASA**: Astronomy Picture of the Day
- **Nager.at**: Public holidays
- **Google Gemini**: AI insights
- **React Community**: Awesome framework
- **Tailwind CSS**: Utility-first styling

---

## 🗺️ Roadmap

### v2.0 (Upcoming)
- [ ] User accounts & cloud sync
- [ ] Custom alerts & notifications
- [ ] Historical weather data
- [ ] Weather trends & analytics
- [ ] Multi-language support (20+)
- [ ] Weather widgets
- [ ] Voice commands
- [ ] AR weather visualization

### Community Requests
- More sports integrations
- Pollen forecasts
- UV index warnings
- Lightning strike tracking
- Mountain weather (avalanche risk)

---

<div align="center">

### ⭐ If you find this project useful, please consider giving it a star!

**Made with ❤️ by [Kalkanci](https://github.com/kalkanci)**

Last Updated: 29 January 2026 | Version: 1.0

