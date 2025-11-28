import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Bot, MessageSquareQuote, Compass, Activity } from 'lucide-react';
import { WeatherData, AdviceResponse } from '../types';
import { getGeminiAdvice } from '../services/geminiService';
import { generateFallbackAdvice } from '../utils/helpers';

interface AdviceCardProps {
  weather: WeatherData;
  cityName: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ weather, cityName }) => {
  const [data, setData] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAiAnalysis, setIsAiAnalysis] = useState<boolean>(false);

  useEffect(() => {
    // Varsayılan veriyi yükle
    const fallback = generateFallbackAdvice(weather.current);
    setData(fallback);
    setIsAiAnalysis(false);
    setLoading(false);
  }, [weather, cityName]);

  const handleAiAnalysis = async () => {
    setLoading(true);
    try {
      const aiResponse = await getGeminiAdvice(weather, cityName);
      if (aiResponse) {
        setData(aiResponse);
        setIsAiAnalysis(true);
      }
    } catch (error) {
      console.error("AI tavsiyesi alınamadı", error);
      // Hata olsa bile mevcut data (fallback) kalır, sadece uyarı verilebilir
      // Ancak kullanıcıya hata olduğunu hissettirmek için basit bir alert veya toast kullanılabilir
      // Şimdilik sessizce logluyoruz.
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <div className={`glass-card rounded-2xl p-5 my-5 flex flex-col relative group overflow-hidden border transition-all duration-500 ${isAiAnalysis ? 'border-indigo-500/50 shadow-indigo-500/10' : 'border-slate-700/50'} shadow-lg`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110">
        <Sparkles size={80} className="text-white" />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full shadow-lg flex-shrink-0 transition-colors duration-500 ${isAiAnalysis ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-700'}`}>
            {loading ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : isAiAnalysis ? (
              <Sparkles size={18} className="text-white" />
            ) : (
              <MessageSquareQuote size={18} className="text-slate-300" />
            )}
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isAiAnalysis ? 'Atmosfer AI' : 'Hava Durumu Özeti'}
            </h3>
            <p className={`text-sm font-bold transition-colors duration-300 ${isAiAnalysis ? 'text-indigo-300' : 'text-slate-200'}`}>
              {data.mood}
            </p>
          </div>
        </div>

        {!isAiAnalysis && !loading && (
          <button 
            onClick={handleAiAnalysis}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-indigo-500/25 animate-pulse-slow"
          >
            <Bot size={14} />
            AI Analiz
          </button>
        )}
      </div>
      
      {/* Content Section */}
      <div className="relative z-10 space-y-4">
        {/* Advice Text */}
        <p className={`text-slate-100 text-sm leading-relaxed font-medium transition-all duration-500 ${loading ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}`}>
          {data.advice}
        </p>

        {/* Activities Tags */}
        {data.activities && data.activities.length > 0 && (
          <div className={`flex flex-wrap gap-2 pt-2 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {data.activities.map((act, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-blue-200 border border-white/5 hover:bg-white/20 transition-colors cursor-default"
              >
                <Activity size={10} className="mr-1.5 opacity-70" />
                {act}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdviceCard;