# 🌦️ Havadurumuck - Premium Hava Durumu Uygulaması

<div align="center">
  <h3>Gelişmiş Hava Tahmini, Tahminler ve Gerçek Zamanlı Takip</h3>
  <p>
    <strong>React 19</strong> • <strong>TypeScript</strong> • <strong>Vite</strong> • <strong>Tailwind CSS</strong> • <strong>PWA</strong>
  </p>
  <p>
    <a href="https://havadurumuck.vercel.app" target="_blank">🌐 Canlı Demo</a> •
    <a href="#özellikler">✨ Özellikler</a> •
    <a href="#kurulum">⚙️ Kurulum</a> •
    <a href="#api">🔌 API'lar</a>
  </p>
</div>

---

## 🎯 Hakkında

**Havadurumuck** (Türkçe: "Hava nasıl?") gerçek zamanlı hava durumu verileri, 16 günlük tahminler, hava kalitesi takibi ve entegre spor tahmin araçları sağlayan son teknoloji hava durumu uygulamasıdır. Modern web teknolojileri ile oluşturulmuş ve mobil cihazlara tam olarak uyarlanmıştır.

### Temel Özellikler
- 🎨 **Modern Tasarım**: Cam morfoloji UI ile yumuşak animasyonlar
- 📱 **Mobil Uyumlu**: Tüm cihazlarda tamamen responsive
- ♿ **Erişilebilir**: WCAG 2.1 AA uyumluluk
- 🚀 **Yüksek Performans**: 60fps animasyonlar, optimize edilmiş paketler
- 🔒 **Gizlilik Odaklı**: Kullanıcı takibi yok, yerel depolama
- ⚽ **Multi-Özellik**: Hava durumu + Futbol tahminleri entegrasyonu

---

## ✨ Özellikler

### Temel Hava Durumu Özellikleri
- **Güncel Hava Durumu**: Gerçek zamanlı koşullar ile detaylı metrikler
- **16 Günlük Tahmin**: Her gün için detaylı tahminler ve yağış olasılığı
- **Saatlik Tahmin**: Sonraki 48 saat için saatlik tahminler
- **Hava Kalitesi**: AQI indeksi, kirleticiler (PM2.5, PM10, O3, NO2)
- **Hava Uyarıları**: Gerçek zamanlı şiddetli hava uyarıları
- **Konum Arama**: Küresel konum araması otomatik tamamlama ile
- **Favori Konumlar**: Birden fazla konum kaydet ve yönet

### Gelişmiş İçgörüler
- **Golden Hour Hesaplaması**: Mükemmel fotoğrafçılık zamanları
- **Tatil Takvimi**: Gelecek tatiller (30+ ülke)
- **Aktivite Puanı**: Kişiselleştirilmiş aktivite önerileri
- **Hava Tavsiyeleri**: Yapay zeka tahminli hava içgörüleri
- **Astronomi**: Günlük NASA APOD (Astronomy Picture of the Day)
- **Spotify Entegrasyonu**: Havaya göre playlista önerileri

### Teknik Özellikler
- **Progressive Web App**: Herhangi bir cihaza kurulabilir
- **Çevrimdışı Destek**: Service Worker ile çok stratejili caching
- **Karanlık Mod**: Otomatik ışık/karanlık mod değişimi
- **Erişilebilirlik**: Tam klavye navigasyonu, ekran okuyucu desteği
- **Responsive Tasarım**: Mobil, tablet ve masaüstünde mükemmel
- **Performans**: Optimize edilmiş animasyonlar, lazy loading, kod bölündü

### Spor Entegrasyonu
- **⚽ Futbol Tahminleri**: futbol-tahmin-mvp uygulamasına direkt erişim
- **Bir Tıkla Erişim**: Spor tahmin uygulamasına kolay navigasyon
- **Haptik Geri Bildirim**: Mobil cihazlarda titreşim geri bildirimi

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js** 18+
- **npm** veya **pnpm**
- **Gemini API Anahtarı** (opsiyonel, AI özellikleri için)

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/kalkanci/havadurumuck.git
cd havadurumuck

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
# .env.local.example'ı .env.local'a kopyala
cp .env.local.example .env.local

# Gemini API anahtarını ekle
# .env.local'ı düzenle ve ayarla: VITE_GEMINI_API_KEY=senin_anahtarın

# Geliştirme sunucusunu başlat
npm run dev

# Üretim için build et
npm run build

# Üretim build'i önizle
npm run preview
```

### Ortam Değişkenleri

```env
VITE_GEMINI_API_KEY=gemini_api_anahtarın
VITE_API_BASE_URL=https://api.open-meteo.com/v1
```

---

## 🔌 API Entegrasyonu

### Harici API'lar
| API | Amaç | Ücretsiz |
|-----|------|---------|
| [Open-Meteo](https://open-meteo.com) | Hava Verileri, Tahminler, Hava Kalitesi | ✅ Evet |
| [Nominatim](https://nominatim.org) | Konum Arama & Jeolokasyon | ✅ Evet |
| [Nager.at](https://nager.at) | Kamu Tatilleri (40+ ülke) | ✅ Evet |
| [NASA API'ları](https://api.nasa.gov) | Günün Astronomi Fotoğrafı | ✅ Evet |
| [Google Gemini](https://ai.google.dev) | Yapay Zeka Hava İçgörüleri | 🆓 Deneme |

### Mimari
- **Çok Stratejili Caching**:
  - Cache First: Statik varlıklar
  - Stale-While-Revalidate: API yanıtları
  - Network First: HTML sayfaları
- **Yanıt Caching**: API çağrılarında 15 dakikalık TTL
- **Hata Yönetimi**: Zarif fallback'ler, çevrimdışı modlar

---

## 🎨 Tasarım Sistemi

### Tipografi
```
H1: 2rem (32px), ağırlık 700
H2: 1.5rem (24px), ağırlık 700
H3: 1.25rem (20px), ağırlık 600
Body: 1rem (16px), ağırlık 400
Small: 0.875rem (14px), ağırlık 400
```

### Renk Paleti
```
Birincil:    #00d4aa (Turkuaz) - Başarı, öneriler
İkincil:     #fbbf24 (Altın) - Güven, vurgular
Uyarı:       #f87171 (Kırmızı) - Uyarılar, önemli
Bilgi:       #3b82f6 (Mavi) - Bilgi
Başarı:      #4ade80 (Yeşil) - Pozitif sonuçlar
```

### Aralık
- **Temel Birim**: 4px
- **Ölçek**: xs(4px) → sm(8px) → md(16px) → lg(24px) → xl(32px) → 2xl(48px)

### Animasyonlar
- **Hızlı**: 150ms, **Standart**: 250ms, **Yavaş**: 350ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Erişilebilirlik**: `prefers-reduced-motion` desteği

---

## ♿ Erişilebilirlik

### WCAG 2.1 AA Uyumluluk ✅
- **Renk Kontrastı**: 7:1 metin, 4.5:1 UI bileşenleri
- **Odak Durumları**: Görünür outline (2px)
- **Klavye Navigasyonu**: Tam Tab/Enter/Boşluk/Escape desteği
- **Ekran Okuyucu**: Semantik HTML, ARIA etiketleri, canlı bölgeler
- **Hareket Desteği**: Azaltılmış hareket modu, yumuşak geçişler
- **Dokunma Hedefleri**: Minimum 48x48px düğmeler
- **Yüksek Kontrast**: Zorunlu renkler modu desteği

### Erişilebilirlik Özellikleri
- İçeriğe atla bağlantısı
- Semantik HTML (`<article>`, `<button>`, `<main>`)
- ARIA etiketleri ve açıklamalar
- Dinamik içerik için canlı bölgeler
- Erişilebilir modallar
- Odak yönetimi
- İkonlar için alternatif metin

---

## 📱 Responsive Tasarım

### Kırılma Noktaları
| Cihaz | Genişlik | Optimizasyon |
|--------|---------|--------------|
| Mobil | <640px | Tek sütun, tam genişlikli kartlar |
| Tablet | 641-1024px | 2 sütun grid, geliştirilmiş padding |
| Masaüstü | 1025px+ | 3 sütun grid, max-width konteyner |

### Mobil Optimizasyonları
- 48x48px dokunma hedefleri
- Safe-area-inset desteği (çentiği olan cihazlar)
- Filtreler için yatay kaydırma
- Optimize edilmiş yazı boyutları (zoom gerekli değil)
- Alt navigasyon kolay erişim için
- Haptik geri bildirim desteği

---

## 🏗️ Mimari

### Proje Yapısı
```
havadurumuck/
├── public/              # Statik varlıklar, SW, manifest
│   ├── sw.js           # Service Worker
│   └── manifest.json   # PWA Manifestosu
├── src/
│   ├── components/     # React bileşenleri
│   ├── services/       # API servisleri
│   ├── utils/          # Yardımcı fonksiyonlar
│   ├── styles/         # CSS (responsive, accessibility)
│   ├── App.tsx         # Ana app bileşeni
│   └── main.tsx        # Giriş noktası
├── App.tsx             # Kök bileşeni
├── vite.config.ts      # Vite konfigürasyonu
├── tsconfig.json       # TypeScript konfigürasyonu
└── package.json        # Bağımlılıklar
```

### Bileşen Hiyerarşisi
```
App (611 satır)
├── Background (animasyonlu arka plan)
├── Search (konum arama)
├── WeatherAlerts (gerçek zamanlı uyarılar)
├── HourlyForecast (48 saatlik tahmin)
├── DetailsGrid (rüzgar, nem, basınç, UV)
├── AirQualityCard (AQI takibi)
├── GoldenHourCard (fotoğrafçılık zamanları)
├── ActivityScore (aktivite önerileri)
├── ForecastInsight (Yapay zeka içgörüleri)
├── HolidayCard (yaklaşan tatiller)
├── SpotifyCard (tema bazlı playlista)
├── DailyForecast (16 günlük tahmin)
├── FavoritesModal (konumları yönet)
├── SettingsModal (uygulama ayarları)
└── CalendarModal (tatil detayları)
```

---

## 🔒 Güvenlik & Gizlilik

- **Takı Yok**: Sıfır analitik veya kullanıcı takiği
- **Yerel Depolama**: Tüm veriler yerel cihazda saklanır
- **HTTPS Gerekli**: Tüm harici API çağrıları HTTPS üzerinden
- **Giriş Yok**: Kimlik doğrulama olmadan tam erişim
- **Açık Kaynak**: Tam şeffaflık

---

## 🚀 Performans

### Metrikler
| Metrik | Hedef | Durum |
|--------|--------|--------|
| First Paint | <1s | ✅ |
| LCP | <2.5s | ✅ |
| CLS | <0.1 | ✅ |
| JavaScript | <200KB | ✅ 168.64 kB |
| CSS | <50KB | ✅ 43.96 kB |
| Lighthouse | >90 | ✅ 94/100 |

### Optimizasyonlar
- Kod bölündü & lazy loading
- Resim optimizasyonu & WebP format
- CSS minifikasyonu & temizliği
- Service Worker caching stratejileri
- API yanıt caching (15 dk TTL)
- Responsive resim yükleme
- Font subsetting & preloading

---

## 🌐 PWA Özellikleri

### Kurulum
- **iOS**: Paylaş → Ana Ekrana Ekle
- **Android**: Yükle Uyarısı (Chrome)
- **Masaüstü**: Chrome → Uygulamayı Yükle

### Yetenekler
- ✅ Ana ekrana kurulabilir
- ✅ Service Worker ile çevrimdışı erişim
- ✅ Arka plan senkronizasyonu
- ✅ Push bildirimleri
- ✅ Tüm modern tarayıcılarda çalışır
- ✅ Maskeli ikon desteği

---

## ⚽ Spor Entegrasyonu

### Futbol Tahmin MVP
Hava uygulamasından futbol tahmin uygulamasına bir tıkla erişin. Gerçek zamanlı maç oranları, model tahminleri ve bahis önerileri entegre edilmiştir.

**Erişim**: Dip navigasyon "⚽ Futbol" düğmesi
**Bağlantı**: Ayrı sekmedeki futbol-tahmin-mvp.vercel.app

---

## 🛠️ Geliştirme

### Mevcut Betikler
```bash
npm run dev          # Dev sunucusu başlat (http://localhost:5173)
npm run build        # Üretim build'i
npm run preview      # Build'i yerel olarak önizle
npm run type-check   # TypeScript doğrulaması
npm run lint         # Kod linting
```

### Tech Stack
- **Framework**: React 19.2
- **Dil**: TypeScript 5.8
- **Build Aracı**: Vite 6.2
- **Stil**: Tailwind CSS + Custom CSS
- **İkonlar**: Lucide React
- **Durum Yönetimi**: React Hooks
- **API İletişimi**: Fetch API

### Kod Kalitesi
- TypeScript strict modu
- ESLint yapılandırılı
- Prettier formatting
- Bileşen dokümantasyonu
- Performans monitoring hooks
- Error boundaries

---

## 📊 Tarayıcı Desteği

| Tarayıcı | Masaüstü | Mobil |
|----------|----------|--------|
| Chrome | ✅ En son | ✅ En son |
| Firefox | ✅ En son | ✅ En son |
| Safari | ✅ 14+ | ✅ 14+ |
| Edge | ✅ En son | ✅ En son |
| Samsung Internet | - | ✅ En son |

---

## 🎓 Öğrenme Kaynakları

### Dokümantasyon
- [Open-Meteo Belgeleri](https://open-meteo.com/en/docs)
- [React Dokümantasyonu](https://react.dev)
- [Vite Rehberi](https://vitejs.dev)
- [TypeScript El Kitabı](https://www.typescriptlang.org/docs)
- [PWA Dokümantasyonu](https://web.dev/progressive-web-apps)
- [Web Erişilebilirliği](https://www.w3.org/WAI/fundamentals)

### Benzer Projeler
- [weather.gov](https://www.weather.gov)
- [Weather.com](https://weather.com)
- [OpenWeatherMap](https://openweathermap.org)
- [DarkSky (Satın alındı)](https://darksky.net)

---

## 📄 Lisans

Bu proje açık kaynak olarak sunulmaktadır ve [MIT Lisansı](LICENSE) altında mevcuttur.

---

## 🤝 Katkıda Bulunma

Katkılar hoş geldindir! Lütfen Pull Request gönderme konusunda çekinmeyin.

### Nasıl Katkıda Bulunabilirsiniz
1. Repoyu fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/YeniBözellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik ekle'`)
4. Branch'a push edin (`git push origin feature/YeniBözellik`)
5. Pull Request açın

---

## 📞 Destek

- **Sorunlar**: [GitHub Issues](https://github.com/kalkanci/havadurumuck/issues)
- **Tartışmalar**: [GitHub Discussions](https://github.com/kalkanci/havadurumuck/discussions)
- **E-posta**: destek@havadurumuck.dev

---

## 🙏 Teşekkürler

- **Open-Meteo**: Ücretsiz hava verileri
- **Nominatim**: Konum hizmetleri
- **NASA**: Astronomi Fotoğrafı
- **Nager.at**: Kamu tatilleri
- **Google Gemini**: Yapay zeka içgörüleri
- **React Topluluğu**: Harika framework
- **Tailwind CSS**: Utility-first stil

---

## 🗺️ Yol Haritası

### v2.0 (Yakında)
- [ ] Kullanıcı hesapları & bulut senkronizasyonu
- [ ] Özel uyarılar & bildirimler
- [ ] Geçmiş hava durumu verileri
- [ ] Hava eğilimleri & analitikleri
- [ ] Çok dilli destek (20+)
- [ ] Hava widget'ları
- [ ] Sesli komutlar
- [ ] AR hava görselleştirmesi

### Topluluk İstekleri
- Daha fazla spor entegrasyonu
- Polen tahminleri
- UV indeks uyarıları
- Yıldırım çakması takibi
- Dağ hava durumu (çığ riski)

---

<div align="center">

### ⭐ Bu projeyi yararlı bulursanız, lütfen bir yıldız verin!

**❤️ ile yapılmıştır [Kalkanci](https://github.com/kalkanci) tarafından**

Son Güncelleme: 29 Ocak 2026 | Sürüm: 1.0

