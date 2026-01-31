
// Ücretsiz MyMemory Translation API kullanarak metinleri Türkçeye çevirir.
// Not: Günlük limitleri vardır, prodüksiyon için Google Translate API veya benzeri önerilir.

export const translateToTurkish = async (text: string): Promise<string> => {
  if (!text) return "";
  
  try {
    // API genellikle 500 karakter sınırına sahiptir, bu yüzden metni kısaltıyoruz veya bölüyoruz.
    // Şimdilik özet (ilk 500 karakter) çevirisi yapıyoruz.
    const textToTranslate = text.length > 500 ? text.substring(0, 497) + "..." : text;
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|tr`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Fallback: Çeviri başarısızsa orijinali döndür
    return text;
  } catch (error) {
    console.warn("Translation failed:", error);
    return text;
  }
};
