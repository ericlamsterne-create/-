import React, { useEffect } from 'react';
import { IeltsWord } from '../types';
import { speak } from '../utils/speech';

interface WordCardProps {
  data: IeltsWord;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (word: IeltsWord) => void;
  autoPlay?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ 
  data, 
  className = '', 
  isFavorite = false, 
  onToggleFavorite,
  autoPlay = true
}) => {
  
  useEffect(() => {
    if (autoPlay && data.word) {
      const timer = setTimeout(() => speak(data.word), 500);
      return () => clearTimeout(timer);
    }
  }, [data.word, autoPlay]);

  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden group border border-midnight-border/50 ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-midnight-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-midnight-accent/20 transition-colors duration-500"></div>

      {/* Header */}
      <div className="flex flex-col items-start mb-5 border-b border-midnight-border pb-4 relative z-10">
        <div className="flex w-full justify-between items-start">
           <div className="flex flex-col">
             <h2 
               className="text-4xl font-black text-white tracking-tight cursor-pointer hover:text-midnight-accent transition-colors drop-shadow-lg"
               onClick={(e) => { e.stopPropagation(); speak(data.word); }}
             >
               {data.word}
             </h2>
             <button 
               onClick={(e) => { e.stopPropagation(); speak(data.word); }}
               className="flex items-center gap-2 mt-2 text-midnight-secondary font-mono text-sm hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md"
             >
               <span>/{data.pronunciation}/</span>
               <span>🔊</span>
             </button>
           </div>

           {/* Favorite Button */}
           {onToggleFavorite && (
             <button 
               onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
               className="p-3 rounded-full hover:bg-white/10 transition-all active:scale-90"
             >
               <span className={`text-2xl filter drop-shadow-md ${isFavorite ? 'text-red-500' : 'text-gray-600 grayscale'}`}>
                 ❤️
               </span>
             </button>
           )}
        </div>
        <p className="text-xl text-gray-200 font-semibold mt-3 tracking-wide">{data.meaning}</p>
      </div>
      
      {/* Interactive Sentence */}
      <div 
        onClick={(e) => { e.stopPropagation(); speak(data.sentence); }}
        className="bg-black/40 hover:bg-black/60 rounded-xl p-5 border border-midnight-border cursor-pointer transition-all hover:border-midnight-accent/50 group/sentence relative overflow-hidden"
      >
         {/* Active Indicator line */}
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-midnight-accent opacity-50 group-hover/sentence:opacity-100 transition-opacity"></div>
         
         <div className="flex justify-between items-start gap-4">
           <p className="text-gray-100 text-lg italic leading-relaxed font-serif">
             "{data.sentence}"
           </p>
           <span className="text-midnight-accent opacity-0 group-hover/sentence:opacity-100 transition-opacity text-xl">🔊</span>
         </div>
         
         <p className="text-sm text-midnight-muted font-medium border-t border-midnight-border/30 pt-3 mt-3">
           {data.translation}
         </p>
      </div>
    </div>
  );
};

export default WordCard;