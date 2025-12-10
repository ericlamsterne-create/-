import React, { useState, useEffect } from 'react';
import CameraMode from './components/CameraMode';
import FunMode from './components/FunMode';
import ComicMode from './components/ComicMode';
import WordCard from './components/WordCard';
import { AppMode, IeltsWord } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);
  const [favorites, setFavorites] = useState<IeltsWord[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ielts_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (word: IeltsWord) => {
    setFavorites(prev => {
      const exists = prev.find(w => w.word === word.word);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(w => w.word !== word.word);
      } else {
        newFavs = [{ ...word, timestamp: Date.now() }, ...prev];
      }
      localStorage.setItem('ielts_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const renderContent = () => {
    const commonProps = { favorites, onToggleFavorite: toggleFavorite };
    switch (mode) {
      case AppMode.CAMERA: return <CameraMode {...commonProps} />;
      case AppMode.FUN: return <FunMode {...commonProps} />;
      case AppMode.COMIC: return <ComicMode {...commonProps} />;
      default: return <CameraMode {...commonProps} />;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-midnight-bg text-white overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="bg-cyber-grid"></div>

      {/* Top Header & Favorites Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowFavorites(true)}
          className="w-10 h-10 rounded-full bg-midnight-card/80 backdrop-blur border border-midnight-border flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:border-midnight-accent"
        >
          ❤️
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-24 bg-midnight-card/90 backdrop-blur-xl border-t border-midnight-border flex justify-around items-center px-6 pb-4 z-40 relative">
        <NavButton active={mode === AppMode.CAMERA} onClick={() => setMode(AppMode.CAMERA)} icon="◉" label="SCAN" />
        <NavButton active={mode === AppMode.FUN} onClick={() => setMode(AppMode.FUN)} icon="⚡" label="FUN" />
        <NavButton active={mode === AppMode.COMIC} onClick={() => setMode(AppMode.COMIC)} icon="❖" label="COMIC" />
      </nav>

      {/* Favorites Sidebar Overlay */}
      {showFavorites && (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md h-full bg-midnight-bg border-l border-midnight-border flex flex-col shadow-2xl transform transition-transform">
             <div className="p-6 border-b border-midnight-border flex justify-between items-center bg-midnight-card">
               <h2 className="text-xl font-bold tracking-widest text-white flex items-center gap-2">
                 FAVORITES <span className="text-midnight-accent text-sm font-mono px-2 py-0.5 rounded bg-midnight-accent/10">{favorites.length}</span>
               </h2>
               <button onClick={() => setShowFavorites(false)} className="text-2xl text-midnight-muted hover:text-white transition-colors">✕</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {favorites.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-midnight-muted opacity-50">
                   <span className="text-5xl mb-4 grayscale">💔</span>
                   <p className="font-mono text-sm">ARCHIVE EMPTY</p>
                 </div>
               ) : (
                 favorites.map((word, idx) => (
                   <WordCard 
                     key={idx} 
                     data={word} 
                     isFavorite={true} 
                     onToggleFavorite={toggleFavorite} 
                     autoPlay={false}
                     className="scale-95 hover:scale-100 transition-transform"
                   />
                 ))
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 group ${active ? 'text-midnight-accent' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <div className={`text-2xl transition-all duration-300 ${active ? 'scale-125 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold tracking-widest ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;