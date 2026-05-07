# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **Wind Speed Unit Support:** Implemented km/h vs mph toggle.
    - Added `windSpeedUnit` to `AppSettings` type.
    - Added toggle switch to `SettingsModal`.
    - Implemented `convertWindSpeed` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to pass and display wind speed in the selected unit.
    - Corrected the static metric unit from `km/s` to `km/h` in helper functions (`checkWeatherAlerts`).

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` and `convertWindSpeed` helpers using `vitest`.

## 2026-05-07
- **Geliştirme:** `generateSmartAdvice` ve `checkWeatherAlerts` fonksiyonları, kullanıcı ayarlarındaki sıcaklık birimine (`celsius` veya `fahrenheit`) uygun olarak güncellendi.
- **Teknik Detay:** `App.tsx` içerisine, sıcaklık birimi değiştiğinde uyarıları yeniden hesaplayan bir `useEffect` hook'u eklendi. Uyarı metinlerindeki sıcaklıklar, birime göre formatlanacak şekilde düzeltildi, ancak temel mantık kontrolleri her zaman Celsius üzerinden yapılarak hataların önüne geçildi.
- **Test:** Sıcaklık dönüşümleri ve yeni uyarı mantığı için `helpers.test.ts` dosyasına yeni birim testleri eklendi ve tüm testlerin başarılı olduğu doğrulandı.
