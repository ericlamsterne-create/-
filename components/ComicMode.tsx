import React, { useState } from 'react';
import { generateComicScript, generateVisual } from '../services/geminiService';
import { ComicPanel, IeltsWord } from '../types';
import WordCard from './WordCard';
import { speak } from '../utils/speech';

interface ComicModeProps {
  favorites: IeltsWord[];
  onToggleFavorite: (word: IeltsWord) => void;
}

const ComicMode: React.FC<ComicModeProps> = ({ favorites, onToggleFavorite }) => {
  const [topic, setTopic] = useState('');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null);

  const startStory = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setPanels([]);
    setImages({});
    setActivePanelIndex(null);

    try {
      const script = await generateComicScript(topic);
      setPanels(script);
      script.forEach(async (panel) => {
        const url = await generateVisual(panel.visualPrompt + ", comic book style, graphic novel, noir, dramatic lighting, ink lines");
        setImages(prev => ({ ...prev, [panel.panelNumber]: url }));
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 relative z-10">
       
       <header className="mb-8 sticky top-0 bg-midnight-bg/95 backdrop-blur-xl z-20 py-4 -mx-4 px-4 border-b border-midnight-border/50 shadow-lg">
         <h1 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
           <span className="text-midnight-secondary">❖</span> NOIR COMICS
         </h1>
         <div className="flex gap-2">
           <input 
             type="text" 
             value={topic}
             onChange={(e) => setTopic(e.target.value)}
             placeholder="Enter theme (e.g. Detective)"
             className="flex-1 px-4 py-2 rounded-lg border border-midnight-border bg-midnight-card text-white focus:outline-none focus:border-midnight-accent placeholder-gray-600 shadow-inner"
           />
           <button 
             onClick={startStory}
             disabled={loading}
             className="bg-midnight-secondary text-white px-5 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-500 transition-colors shadow-lg"
           >
             GO
           </button>
         </div>
       </header>

       <div className="flex flex-col gap-10 pb-28">
         {panels.length === 0 && !loading && (
           <div className="flex flex-col items-center justify-center py-20 opacity-40">
             <span className="text-7xl mb-4 grayscale">🕵️‍♂️</span>
             <p className="text-midnight-muted font-mono text-center">AWAITING CASE FILE...<br/><span className="text-xs opacity-50">Enter a topic to generate a story</span></p>
           </div>
         )}

         {panels.map((panel, idx) => {
           const isFav = favorites.some(f => f.word === panel.wordData.word);
           
           return (
             <div key={panel.panelNumber} className="relative group">
               {/* Panel Number Badge */}
               <div className="absolute -top-3 -left-2 w-10 h-10 bg-black border-2 border-white text-white font-black flex items-center justify-center rounded-full shadow-xl z-20">
                 {panel.panelNumber}
               </div>

               {/* Visual Container */}
               <div className="aspect-square bg-midnight-card rounded-lg overflow-hidden border-4 border-white shadow-[5px_5px_0px_rgba(255,255,255,0.1)] relative">
                 {images[panel.panelNumber] ? (
                   <img src={images[panel.panelNumber]} alt="Comic Panel" className="w-full h-full object-cover filter contrast-125" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-midnight-muted bg-gray-900">
                     <div className="w-8 h-8 border-2 border-midnight-secondary border-t-transparent rounded-full animate-spin mb-2"></div>
                     <span className="font-mono text-[10px] tracking-widest">INKING PANEL...</span>
                   </div>
                 )}
               </div>

               {/* Speech Bubble - Click text to Speak */}
               <div className="relative -mt-8 ml-4 mr-2 z-10">
                 <div 
                    onClick={() => speak(panel.dialogue)}
                    className="bg-white text-black p-5 rounded-3xl rounded-tl-none shadow-2xl cursor-pointer transform transition-transform active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] border-2 border-black"
                 >
                    <p className="font-bold text-base leading-snug">
                      {panel.dialogue.split(' ').map((w, i) => {
                         const cleanW = w.replace(/[^a-zA-Z]/g, '');
                         const isKey = cleanW.toLowerCase() === panel.wordData.word.toLowerCase();
                         return isKey ? (
                           <span key={i} className="text-indigo-700 underline decoration-2 decoration-indigo-400">{w} </span>
                         ) : (
                           <span key={i}>{w} </span>
                         )
                      })}
                      <span className="inline-block ml-2 text-indigo-500 opacity-70 text-sm">🔊</span>
                    </p>
                 </div>
                 
                 {/* Decode / Details Button */}
                 <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => setActivePanelIndex(activePanelIndex === idx ? null : idx)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${activePanelIndex === idx ? 'bg-midnight-accent text-black border-midnight-accent' : 'bg-black/50 text-white border-white/30 hover:bg-black/80'}`}
                    >
                      {activePanelIndex === idx ? 'CLOSE DATA' : 'DECODE VOCAB 🔍'}
                    </button>
                 </div>
               </div>

               {/* Result Card */}
               {activePanelIndex === idx && (
                 <div className="mt-4 animate-fade-in-up px-2">
                   <WordCard 
                     data={panel.wordData} 
                     isFavorite={isFav} 
                     onToggleFavorite={onToggleFavorite}
                     autoPlay={false} // Manual play preferred in story mode
                   />
                 </div>
               )}
             </div>
           );
         })}
       </div>
    </div>
  );
};

export default ComicMode;