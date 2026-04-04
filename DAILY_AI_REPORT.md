# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.

### Günlük Optimizasyon ve Özellik Geliştirme (PWA Yükleme Düğmesi)
- **SettingsModal** bileşenine isteğe bağlı bir `onInstall` prop'u eklendi ve PWA kurulumunu desteklemek için `Download` ikonu kullanılarak bir düğme arayüzü eklendi.
- **App.tsx** dosyası, `handleInstallClick` fonksiyonunu `deferredPrompt` değişkeninin mevcudiyetine göre `SettingsModal` bileşenine aktaracak şekilde güncellendi.
- **Test ve Doğrulama**: Yeni eklenen prop ve UI değişikliklerinin doğru render edildiğinden ve tıklandığında ilgili callback'in çağrıldığından emin olmak için `SettingsModal.test.tsx` adlı unit test eklendi ve tüm testlerin geçmesi sağlandı.
