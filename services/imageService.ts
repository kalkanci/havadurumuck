
// Wikipedia API kullanarak şehrin ana görselini bulur
export const getCityImage = async (cityName: string): Promise<string | null> => {
  try {
    // 1. Wikipedia Arama
    // Şehir ismini kullanarak Wikipedia'da arama yapıyoruz ve "pageimages" (sayfa görselleri) özelliğini istiyoruz.
    // 'pithumbsize=1080' ile yüksek çözünürlük hedefliyoruz.
    const endpoint = `https://tr.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(cityName)}&origin=*`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    // API yanıtını parse et
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null; // Sayfa bulunamadı

    const page = pages[pageId];
    if (page.original && page.original.source) {
      return page.original.source;
    }

    // Eğer Türkçe Wikipedia'da görsel yoksa İngilizce'yi dene
    const enEndpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(cityName)}&origin=*`;
    const enRes = await fetch(enEndpoint);
    const enData = await enRes.json();
    const enPages = enData.query?.pages;
    if (enPages) {
        const enPageId = Object.keys(enPages)[0];
        if (enPageId !== '-1' && enPages[enPageId].original) {
            return enPages[enPageId].original.source;
        }
    }

    return null;
  } catch (error) {
    console.error("Wikipedia Image Fetch Error:", error);
    return null;
  }
};
