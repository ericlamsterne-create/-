let voicesLoaded = false;

// Preload voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
    }
  };
  
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export const speak = (text: string) => {
  if (!text) return;
  // Cancel any currently playing audio
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for better clarity
  utterance.pitch = 1.0;
  
  // Try to select a better voice if available (e.g., Google US English)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Google US English') || 
    v.name.includes('Samantha') || 
    (v.lang === 'en-US' && v.name.includes('Enhanced'))
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};