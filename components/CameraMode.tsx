import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeImageForWord } from '../services/geminiService';
import { IeltsWord } from '../types';
import WordCard from './WordCard';

const CameraMode: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IeltsWord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulated Crop State
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 }); // Percentages

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access camera. Please allow permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw full frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Crop Logic: Extract the area defined by 'crop' state
    const cropX = (crop.x / 100) * canvas.width;
    const cropY = (crop.y / 100) * canvas.height;
    const cropW = (crop.w / 100) * canvas.width;
    const cropH = (crop.h / 100) * canvas.height;

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      
      const base64 = tempCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      setCapturedImage(tempCanvas.toDataURL('image/jpeg'));
      setIsAnalyzing(true);
      setError(null);

      try {
        const data = await analyzeImageForWord(base64);
        setResult(data);
      } catch (e) {
        setError("Failed to analyze image. Try again.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [crop]);

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-morandi-charcoal">
      {/* Viewport Area */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Overlay UI for cropping */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-morandi-charcoal/50 z-10">
               {/* Simulating the Focus Area - Centered for simplicity in this demo, but logic supports coords */}
               <div 
                  className="absolute border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.w}%`,
                    height: `${crop.h}%`
                  }}
               >
                 <div className="absolute top-2 left-2 text-xs text-white/80 uppercase tracking-widest font-bold">IELTS Lens</div>
                 <div className="absolute bottom-2 right-2 text-xs text-white/50">Subject</div>
               </div>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls / Result Panel */}
      <div className="bg-morandi-bg p-6 rounded-t-3xl -mt-6 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] min-h-[30vh]">
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        {!result && !isAnalyzing && !capturedImage && (
           <div className="flex flex-col items-center gap-4">
             <p className="text-morandi-charcoal text-center mb-2">Align object within the frame</p>
             <button 
                onClick={captureAndAnalyze}
                className="w-20 h-20 rounded-full bg-morandi-sage border-4 border-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
             >
                <div className="w-16 h-16 rounded-full border-2 border-white/50" />
             </button>
           </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morandi-sage mb-4"></div>
            <p className="text-morandi-charcoal animate-pulse">AI is extracting object...</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in-up">
            <WordCard data={result} />
            <button 
              onClick={reset}
              className="mt-6 w-full py-3 bg-morandi-charcoal text-white rounded-xl font-medium shadow-md active:bg-black transition-colors"
            >
              Scan Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraMode;