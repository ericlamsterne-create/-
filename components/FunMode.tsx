import React, { useState } from 'react';
import { generateMemeConcept, generateVisual } from '../services/geminiService';
import { MemeContent, IeltsWord } from '../types';
import WordCard from './WordCard';
import { speak } from '../utils/speech';

interface FunModeProps {
  favorites: IeltsWord[];
  onToggleFavorite: (word: IeltsWord) => void;
}

const FunMode: React.FC<FunModeProps> = ({ favorites, onToggleFavorite }) => {
  const [meme, setMeme] = useState<MemeContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Check favorite status
  const isFav = meme ? favorites.some(f => f.word === meme.word) : false;

  const handleGenerate = async () => {
    setLoading(true);
    setMeme(null);
    setImageUrl(null);
    setShowCard(false);

    try {
      const memeData = await generateMemeConcept();
      setMeme(memeData);
      const url = await generateVisual(memeData.visualPrompt + ", funny, vibrant colors, pop art style, digital art, high contrast");
      setImageUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-6 flex flex-col items-center relative z-10">
      
      <header className="w-full mb-6 z-10 flex flex-col items-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-midnight-accent to-purple-400 drop-shadow-sm mb-2">
          MEME GEN
        </h1>
        <div className="h-1 w-20 bg-midnight-accent rounded-full"></div>
      </header>

      <div className="w-full max-w-md flex-1 flex flex-col items-center z-10 pb-24">
        {!meme && !loading && (
          <div className="mt-10 text-center p-10 glass-panel rounded-3xl border-dashed border-2 border-midnight-border/50 flex flex-col items-center gap-6 transform hover:scale-105 transition-transform duration-300">
            <div className="text-7xl animate-bounce">👾</div>
            <p className="text-midnight-muted">Ready to learn with humor?</p>
            <button 
              onClick={handleGenerate}
              className="px-10 py-4 bg-gradient-to-r from-midnight-accent to-blue-600 text-white rounded-full font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95 transition-all"
            >
              GENERATE MEME
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-midnight-card"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-midnight-accent border-r-transparent animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-midnight-card/50 backdrop-blur-sm flex items-center justify-center text-3xl">🤔</div>
            </div>
            <p className="mt-6 text-midnight-accent font-mono animate-pulse tracking-widest">COOKING MEME...</p>
          </div>
        )}

        {meme && imageUrl && (
          <div className="w-full animate-fade-in-up">
             {/* Holographic Card Container */}
             <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-midnight-border group transition-all duration-500 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                
                {/* Image Area */}
                <div className="relative aspect-square w-full bg-black">
                  <img src={imageUrl} alt="Meme" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Word Overlay */}
                  <div className="absolute top-4 left-0 w-full text-center px-4 z-20">
                     <span 
                       onClick={(e) => { e.stopPropagation(); setShowCard(!showCard); }}
                       className="text-white font-black text-4xl uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] cursor-pointer hover:text-midnight-accent transition-colors"
                       style={{ textShadow: '0 0 20px rgba(0,0,0,0.8), 2px 2px 0px #000' }}
                     >
                        {meme.word}
                     </span>
                  </div>

                  {/* Caption Overlay - Click to Speak */}
                  <div 
                    onClick={() => speak(meme.caption)}
                    className="absolute bottom-6 left-0 w-full text-center px-4 z-20 cursor-pointer transition-transform active:scale-95"
                  >
                     <span className="inline-block text-white font-bold text-xl leading-tight bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10 shadow-xl hover:bg-black/80 hover:border-midnight-accent/50 transition-all">
                        {meme.caption} 🔊
                     </span>
                  </div>
                </div>
                
                {/* Context Footer */}
                <div className="p-5 bg-gradient-to-b from-gray-900 to-gray-950 border-t border-white/5">
                   <p className="text-gray-400 text-sm italic border-l-2 border-midnight-accent pl-3">
                     "{meme.context}"
                   </p>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowCard(!showCard)}
                  className={`flex-1 py-3 rounded-xl font-bold border border-midnight-border transition-colors ${showCard ? 'bg-midnight-accent text-black' : 'bg-midnight-card text-white hover:bg-white/5'}`}
                >
                  {showCard ? 'HIDE DETAILS' : 'WHAT DOES IT MEAN?'}
                </button>
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-midnight-surface text-white rounded-xl border border-midnight-border hover:bg-midnight-card text-2xl"
                  title="Next Meme"
                >
                  ➡️
                </button>
             </div>

             {/* Popup Detail Card */}
             {showCard && (
               <div className="mt-6 animate-fade-in-up">
                 <WordCard 
                    data={meme} 
                    isFavorite={isFav} 
                    onToggleFavorite={onToggleFavorite} 
                    autoPlay={false} // Don't auto-play here since user likely clicked caption already
                 />
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunMode;