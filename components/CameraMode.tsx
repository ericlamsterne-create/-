import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeImageForWord } from '../services/geminiService';
import { IeltsWord } from '../types';
import WordCard from './WordCard';

interface CameraModeProps {
  favorites: IeltsWord[];
  onToggleFavorite: (word: IeltsWord) => void;
}

const CameraMode: React.FC<CameraModeProps> = ({ favorites, onToggleFavorite }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IeltsWord | null>(null);
  
  // Checking if current result is favorite
  const isFav = result ? favorites.some(f => f.word === result.word) : false;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup tracks if needed
    };
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      setIsAnalyzing(true);
      
      try {
        const data = await analyzeImageForWord(base64);
        setResult(data);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, []);

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-midnight-bg relative">
      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-midnight-accent/50 rounded-lg relative shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-midnight-accent shadow-[0_0_15px_#38BDF8] animate-[scan_2s_infinite_linear]"></div>
                <div className="absolute -bottom-8 w-full text-center text-midnight-accent font-mono text-xs tracking-widest uppercase">Target Lock</div>
              </div>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain opacity-80" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Panel */}
      <div className="bg-midnight-card/90 backdrop-blur-xl border-t border-midnight-border p-6 rounded-t-3xl -mt-8 z-20 min-h-[300px] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {!result && !isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
             <button 
               onClick={capture}
               className="w-20 h-20 rounded-full bg-midnight-accent shadow-[0_0_30px_rgba(56,189,248,0.4)] border-4 border-white/20 flex items-center justify-center active:scale-90 transition-transform"
             >
               <div className="w-16 h-16 rounded-full border-2 border-white/80" />
             </button>
             <p className="text-midnight-muted text-sm font-mono">TAP TO SCAN</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-midnight-accent rounded-full animate-spin mb-4"></div>
            <p className="text-midnight-accent font-mono animate-pulse">ANALYZING BIOMETRICS...</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in-up flex-1 flex flex-col justify-between gap-4">
            <WordCard 
              data={result} 
              isFavorite={isFav}
              onToggleFavorite={onToggleFavorite}
            />
            <button onClick={reset} className="w-full py-3 bg-midnight-surface hover:bg-midnight-surface/80 text-white rounded-xl font-bold tracking-wide transition-colors border border-midnight-border">
              SCAN NEW TARGET
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraMode;