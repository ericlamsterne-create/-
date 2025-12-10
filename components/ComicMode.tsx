import React, { useState } from 'react';
import { generateComicScript, generateVisual } from '../services/geminiService';
import { ComicPanel } from '../types';

const ComicMode: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const startStory = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setPanels([]);
    setImages({});
    setActiveWord(null);

    try {
      const script = await generateComicScript(topic);
      setPanels(script);

      // Generate images for panels in parallel
      script.forEach(async (panel) => {
        const url = await generateVisual(panel.visualPrompt + ", comic book style, outlines, pastel colors, morandi palette");
        setImages(prev => ({ ...prev, [panel.panelNumber]: url }));
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#EAE8E4] p-4">
       <header className="mb-6 sticky top-0 bg-[#EAE8E4]/95 z-10 py-2">
         <h1 className="text-2xl font-bold text-morandi-charcoal mb-4">Comic Stories</h1>
         
         <div className="flex gap-2">
           <input 
             type="text" 
             value={topic}
             onChange={(e) => setTopic(e.target.value)}
             placeholder="Enter a topic (e.g., Coffee Shop, Airport)"
             className="flex-1 px-4 py-2 rounded-xl border border-morandi-stone focus:outline-none focus:border-morandi-sage bg-white"
           />
           <button 
             onClick={startStory}
             disabled={loading}
             className="bg-morandi-sage text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50"
           >
             {loading ? '...' : 'Create'}
           </button>
         </div>
       </header>

       <div className="flex flex-col gap-6 pb-20">
         {panels.length === 0 && !loading && (
           <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <div className="w-32 h-32 border-4 border-dashed border-morandi-stone rounded-lg mb-4 flex items-center justify-center">
               <span className="text-4xl">✏️</span>
             </div>
             <p>Enter a topic to generate a vocab comic.</p>
           </div>
         )}

         {panels.map((panel) => (
           <div key={panel.panelNumber} className="bg-white p-3 rounded-sm shadow-sm border border-gray-200 relative group">
             {/* Panel Number */}
             <div className="absolute top-2 left-2 w-6 h-6 bg-black text-white text-xs flex items-center justify-center font-bold z-10">
               {panel.panelNumber}
             </div>

             {/* Image Area */}
             <div className="aspect-[4/3] bg-gray-100 mb-3 overflow-hidden relative">
               {images[panel.panelNumber] ? (
                 <img src={images[panel.panelNumber]} alt="Comic Panel" className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
                   Drawing...
                 </div>
               )}
               
               {/* Interactive Hotspot Hint */}
               {images[panel.panelNumber] && (
                   <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs font-bold text-morandi-charcoal">
                      Click text
                   </div>
               )}
             </div>

             {/* Dialogue / Text Bubble */}
             <div 
                onClick={() => setActiveWord(activeWord === panel.relatedWord ? null : panel.relatedWord)}
                className={`bg-white border-2 border-black rounded-2xl p-3 relative cursor-pointer hover:bg-yellow-50 transition-colors ${activeWord === panel.relatedWord ? 'ring-4 ring-morandi-sage ring-opacity-50' : ''}`}
             >
                {/* Speech Bubble Arrow */}
                <div className="absolute -top-3 left-8 w-4 h-4 bg-white border-t-2 border-l-2 border-black transform rotate-45"></div>
                
                <p className="font-comic text-morandi-charcoal font-medium">
                  {panel.dialogue.split(' ').map((word, i) => {
                     // Simple check to highlight the related word (imperfect matching for demo)
                     const isTarget = word.toLowerCase().includes(panel.relatedWord.toLowerCase());
                     return isTarget ? (
                       <span key={i} className="text-morandi-clay font-bold underline decoration-wavy decoration-morandi-sage">{word} </span>
                     ) : (
                       <span key={i}>{word} </span>
                     )
                  })}
                </p>
             </div>

             {/* Word Reveal */}
             {activeWord === panel.relatedWord && (
               <div className="mt-2 p-3 bg-morandi-sage/10 rounded-lg animate-fade-in border border-morandi-sage/30">
                 <p className="text-xs text-morandi-sage font-bold uppercase tracking-wider">Vocabulary</p>
                 <p className="text-lg font-bold text-morandi-charcoal">{panel.relatedWord}</p>
                 <p className="text-sm text-gray-600">{panel.description}</p>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};

export default ComicMode;