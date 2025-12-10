import React, { useState } from 'react';
import CameraMode from './components/CameraMode';
import FunMode from './components/FunMode';
import ComicMode from './components/ComicMode';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);

  const renderContent = () => {
    switch (mode) {
      case AppMode.CAMERA:
        return <CameraMode />;
      case AppMode.FUN:
        return <FunMode />;
      case AppMode.COMIC:
        return <ComicMode />;
      default:
        return <CameraMode />;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-morandi-bg text-morandi-charcoal overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="h-20 bg-white border-t border-morandi-stone/30 flex justify-around items-center px-6 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50">
        <NavButton 
          active={mode === AppMode.CAMERA} 
          onClick={() => setMode(AppMode.CAMERA)}
          icon="📸"
          label="Camera"
        />
        <NavButton 
          active={mode === AppMode.FUN} 
          onClick={() => setMode(AppMode.FUN)}
          icon="🤪"
          label="Fun"
        />
        <NavButton 
          active={mode === AppMode.COMIC} 
          onClick={() => setMode(AppMode.COMIC)}
          icon="💬"
          label="Comic"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-80'}`}
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-colors ${active ? 'bg-morandi-sage text-white shadow-lg' : 'bg-transparent text-gray-500'}`}>
      {icon}
    </div>
    <span className={`text-xs font-medium ${active ? 'text-morandi-sage' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default App;