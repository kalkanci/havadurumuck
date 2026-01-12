
import React from 'react';
import { Gift, Calendar, PartyPopper } from 'lucide-react';
import { PublicHoliday } from '../types';

interface HolidayCardProps {
  holidays: PublicHoliday[];
}

const HolidayCard: React.FC<HolidayCardProps> = ({ holidays }) => {
  if (!holidays || holidays.length === 0) return null;

  // We only show the first upcoming holiday to keep the UI clean
  const holiday = holidays[0];
  const date = new Date(holiday.date);
  const today = new Date();
  
  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
  const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });

  return (
    <div className="w-full glass-card rounded-2xl p-4 my-4 flex items-center justify-between relative overflow-hidden group border-amber-500/20 transition-transform duration-200 active:scale-95">
       
       {/* Background Glow */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

       <div className="flex items-center gap-4 relative z-10">
           <div className={`p-3 rounded-full shadow-inner ${isToday ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-800 dark:bg-white/10 text-amber-500'}`}>
               {isToday ? <PartyPopper size={24} /> : <Gift size={24} />}
           </div>
           
           <div className="flex flex-col">
               <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isToday ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                   {isToday ? 'Bugün Bayram!' : 'Yaklaşan Tatil'}
               </span>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                   {holiday.localName}
               </h3>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                   {dateStr}
               </p>
           </div>
       </div>

       {!isToday && (
           <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400">
               <Calendar size={18} />
           </div>
       )}
    </div>
  );
};

export default HolidayCard;
