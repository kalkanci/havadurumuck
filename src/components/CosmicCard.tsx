
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rocket, Info, X, ExternalLink, Sparkles } from 'lucide-react';
import { AstronomyData } from '../types';
import { triggerHapticFeedback } from '../utils/helpers';

interface CosmicCardProps {
  data: AstronomyData | null;
}

const CosmicCard: React.FC<CosmicCardProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!data) return null;

  const handleOpenWithDelay = () => {
    triggerHapticFeedback(15);
    setTimeout(() => {
        setIsOpen(true);
        setIsClosing(false);
    }, 200);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
    }, 200);
  };

  const renderModal = () => {
    if (!isOpen) return null;

    return createPortal(
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={handleClose} />
         
         <div className={`relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
             
             {/* Close Button */}
             <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 z-50 border border-white/10 transition-colors">
                 <X size={20} />
             </button>

             {/* Media Area (Image or Video) */}
             <div className="relative w-full aspect-video bg-black shrink-0">
                {data.media_type === 'image' ? (
                    <img 
                        src={data.hdurl || data.url} 
                        alt={data.title} 
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <iframe
                        src={data.url}
                        title={data.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )}
             </div>

             {/* Content Area */}
             <div className="p-6 overflow-y-auto no-scrollbar">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase rounded-md border border-purple-500/20">
                         NASA APOD
                     </span>
                     <span className="text-xs text-slate-400 font-mono">{data.date}</span>
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{data.title}</h2>
                 
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4 leading-relaxed">
                     <p className="text-sm text-slate-300 font-light">
                         {data.explanation}
                     </p>
                 </div>

                 {data.copyright && (
                     <p className="text-xs text-slate-500 text-center">
                         &copy; {data.copyright}
                     </p>
                 )}
             </div>
         </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <button 
        onClick={handleOpenWithDelay}
        className="w-full glass-card rounded-[1.5rem] p-0 mb-6 relative overflow-hidden group text-left aspect-[21/9] flex items-end shadow-lg transition-all duration-300 transform active:scale-[0.97] active:brightness-90 active:shadow-inner"
      >
        {/* Background Image with Parallax-like feel on hover */}
        {data.media_type === 'image' ? (
            <img 
                src={data.url} 
                alt={data.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-60"
            />
        ) : (
            // Fallback for video thumbnail if API doesn't provide one (NASA APOD usually just gives video URL)
            <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center">
                <Rocket size={48} className="text-purple-500/50" />
            </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Content Preview */}
        <div className="relative z-10 p-5 w-full">
            <div className="flex items-center gap-2 mb-1">
                <Rocket size={14} className="text-purple-400" />
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                    Kozmik Bakış
                </span>
            </div>
            <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
                {data.title}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-slate-400 group-hover:text-white transition-colors">
                <span>Keşfetmek için dokun</span>
                <ExternalLink size={10} />
            </div>
        </div>

        {/* Decorative Sparkles */}
        <Sparkles size={24} className="absolute top-4 right-4 text-purple-200/50 animate-pulse" />
      </button>
      {renderModal()}
    </>
  );
};

export default CosmicCard;
