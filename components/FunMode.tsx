import React, { useState } from 'react';
import { generateMemeConcept, generateVisual } from '../services/geminiService';
import { MemeContent } from '../types';

const FunMode: React.FC = () => {
  const [meme, setMeme] = useState<MemeContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setShowDetails(false);
    setMeme(null);
    setImageUrl(null);

    try {
      // 1. Get Text Concept
      const memeData = await generateMemeConcept();
      setMeme(memeData);

      // 2. Generate Visual
      const url = await generateVisual(memeData.visualPrompt + ", funny, meme style, cartoon, expressive");
      setImageUrl(url);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-morandi-bg p-6 flex flex-col items-center">
      <header className="w-full mb-8">
        <h1 className="text-3xl font-bold text-morandi-charcoal mb-2">Fun Learning</h1>
        <p className="text-morandi-sage">Memes, cats, and reddit humor.</p>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center min-h-[400px]">
        {!meme && !loading && (
          <div className="text-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-morandi-stone">
            <span className="text-6xl mb-4 block">😹</span>
            <p className="text-lg text-morandi-charcoal mb-6">Ready for a laugh?</p>
            <button 
              onClick={handleGenerate}
              className="px-8 py-3 bg-morandi-clay text-white rounded-full font-bold shadow-lg hover:bg-morandi-sage transition-all"
            >
              Generate Meme
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-morandi-stone/20 rounded-xl animate-pulse flex items-center justify-center">
               <span className="text-4xl animate-bounce">🤔</span>
            </div>
            <p className="mt-4 text-morandi-sage font-medium">Cooking up a joke...</p>
          </div>
        )}

        {meme && imageUrl && (
          <div className="w-full perspective-1000">
             {/* Meme Card */}
             <div 
               className="relative bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
               onClick={() => setShowDetails(!showDetails)}
             >
                <div className="relative aspect-square w-full bg-gray-100">
                  <img src={imageUrl} alt="Meme" className="w-full h-full object-cover" />
                  
                  {/* Text Overlay - Meme Style */}
                  <div className="absolute top-4 left-0 w-full text-center px-4">
                     <span className="text-white font-black text-2xl uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                        {meme.word}
                     </span>
                  </div>
                  <div className="absolute bottom-6 left-0 w-full text-center px-4">
                     <span className="text-white font-bold text-lg leading-tight drop-shadow-md bg-black/50 px-2 py-1 rounded box-decoration-clone">
                        {meme.caption}
                     </span>
                  </div>
                </div>

                {/* Details Fold-out */}
                {showDetails && (
                  <div className="p-6 bg-morandi-stone/10 border-t border-morandi-stone/20 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-morandi-charcoal">{meme.word}</h3>
                      <button className="text-xs bg-morandi-blue text-white px-2 py-1 rounded">Audio 🔊</button>
                    </div>
                    <p className="text-morandi-charcoal mb-2 font-medium">Why is this funny?</p>
                    <p className="text-sm text-gray-600 italic">{meme.context}</p>
                  </div>
                )}
             </div>

             <div className="mt-6 flex justify-center gap-4">
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-morandi-sage text-white rounded-xl shadow-md font-medium"
                >
                  Next Meme ➡️
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunMode;