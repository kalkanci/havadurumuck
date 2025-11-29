
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, AdviceResponse } from "../types";
import { getWeatherLabel } from "../constants";

// Vite/Vercel ortamında API anahtarını güvenli bir şekilde alma
const getApiKey = (): string | undefined => {
  try {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  } catch (e) {
    return undefined;
  }
};

const apiKey = getApiKey();
// Eğer API key yoksa null dönüyoruz, uygulama çökmesin
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiAdvice = async (weather: WeatherData, locationName: string): Promise<AdviceResponse> => {
  if (!ai) {
    throw new Error("API Key Eksik");
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
    const timeOfDay = isDay ? "daytime" : "night";
    
    // Nano Banana Pro Prompt Mühendisliği
    const prompt = `
      A hyper-realistic, 4K wide-angle vertical photograph of the most iconic landmark in ${city}. 
      The weather is ${condition} and it is ${timeOfDay}. 
      Cinematic lighting, high detailed texture, architectural photography style. 
      Do not use blur, ensure sharp focus.
      
      Weather Details:
      - If rain: Wet pavement reflections, overcast dramatic sky.
      - If snow: Crisp white snow, visible snowflakes.
      - If clear: Deep blue sky, high contrast sun/moon.
    `;

    // Gemini 3 Pro Image (Nano Banana Pro) kullanımı
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // Nano Banana modelleri için özel imageConfig
        imageConfig: {
          aspectRatio: "9:16", // Mobil öncelikli dikey format
          imageSize: "1K" // Hız ve kalite dengesi için 1K (Preview modellerde bazen 4K kısıtlı olabilir)
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
    console.error("Gemini Nano Banana Image Gen Error:", error);
    return null;
  }
};
