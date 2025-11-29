
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, AdviceResponse } from "../types";
import { getWeatherLabel } from "../constants";

// API Anahtarını güvenli bir şekilde alma fonksiyonu
const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  return undefined;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiAdvice = async (weather: WeatherData, locationName: string): Promise<AdviceResponse> => {
  if (!ai) {
    throw new Error("API Key eksik. Lütfen .env dosyasında VITE_API_KEY veya process.env.API_KEY tanımlayın.");
  }

  try {
    const current = weather.current;
    
    const safeGet = (arr: any[] | undefined, index: number, fallback: any = 0) => {
        return (arr && arr[index] !== undefined) ? arr[index] : fallback;
    };

    const nextHoursData = weather.hourly?.time?.slice(0, 6) || [];
    const trendContext = nextHoursData.length > 0 ? nextHoursData.map((t, i) => {
      const date = new Date(t);
      const hourString = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const temp = safeGet(weather.hourly?.temperature_2m, i);
      const code = safeGet(weather.hourly?.weather_code, i);
      return `${hourString}: ${Math.round(temp)}°C (${getWeatherLabel(code)})`;
    }).join(', ') : "";

    const uvIndex = safeGet(weather.daily?.uv_index_max, 0, 0);

    const prompt = `
      Sen bir hava durumu asistanısın. Şu anki veriler:
      Konum: ${locationName}
      Sıcaklık: ${current.temperature_2m}°C (Hissedilen: ${current.apparent_temperature}°C)
      Durum: ${getWeatherLabel(current.weather_code)}
      Rüzgar: ${current.wind_speed_10m} km/s
      Nem: %${current.relative_humidity_2m}
      UV İndeksi: ${uvIndex}
      Saat: ${new Date().toLocaleTimeString('tr-TR')}
      Gelecek 6 Saat Trendi (Bilgi için): ${trendContext}

      Görevin: Bu verilere dayanarak Türkçe bir JSON yanıtı oluştur.
      Yanıt şu formatta OLMALI (başka metin ekleme, sadece JSON):
      {
        "mood": "Kısa, esprili veya motive edici bir başlık (maks 5 kelime)",
        "advice": "Ne giymeli ve neye dikkat etmeli konusunda samimi, arkadaşça bir paragraf. Gelecek saatlerdeki değişimi de hesaba kat.",
        "activities": ["Bu havada ve bu şehirde yapılabilecek spesifik aktivite 1", "Aktivite 2", "Aktivite 3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            advice: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["mood", "advice", "activities"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI boş yanıt döndürdü.");

    const result = JSON.parse(text) as AdviceResponse;
    return result;

  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw error; 
  }
};

export const generateCityImage = async (city: string, weatherCode: number, isDay: boolean): Promise<string | null> => {
  if (!ai) {
    console.warn("API Key missing, skipping image generation.");
    return null;
  }

  try {
    const condition = getWeatherLabel(weatherCode);
    const timeOfDay = isDay ? "daytime with natural sunlight" : "night time with cinematic city lights";
    
    // 2-Step Logic & Improved Prompting
    const prompt = `
      Step 1: Identify the single most famous, globally recognized architectural landmark in ${city} (e.g. Eiffel Tower if Paris, Hagia Sophia if Istanbul, Colosseum if Rome, Burj Khalifa if Dubai). 
      
      Step 2: Generate a breathtaking wide-angle architectural photograph of that specific landmark.
      The shot is taken from a cinematic viewpoint (eye-level or low-angle, looking up at the grandeur).
      The weather is ${condition} and lighting is ${timeOfDay}.
      
      Style: High-end travel photography, 8k resolution, National Geographic style, hyper-realistic, highly detailed textures.
      
      Negative Prompt (Strictly Avoid): No maps, no text, no flags, no blurry objects, no chart, no ui elements, no distorted, no satellite view, no aerial map view, no cartoon, no low quality.
    `;

    // 403 Hatalarını önlemek için 'gemini-2.5-flash-image' modeline geçildi.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16", 
          // imageSize: "1K" // 'flash-image' modeli imageSize parametresini desteklemez, kaldırıldı.
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      // API yanıtındaki inlineData'yı bul (Genelde ilk part olmayabilir, kontrol ediyoruz)
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          if (base64String && base64String.length > 100) {
              return `data:image/png;base64,${base64String}`;
          }
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};
