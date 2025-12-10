export interface IeltsWord {
  word: string;
  pronunciation: string;
  meaning: string; 
  sentence: string; 
  translation: string;
  timestamp?: number; // For favorites sorting
}

// Extends IeltsWord so we can easily save it or view it
export interface MemeContent extends IeltsWord {
  caption: string; 
  context: string; 
  visualPrompt: string; 
}

// Extends IeltsWord for the vocabulary found in the panel
export interface ComicPanel {
  panelNumber: number;
  description: string;
  dialogue: string;
  visualPrompt: string;
  
  // The vocabulary word details for this panel
  wordData: IeltsWord;
}

export enum AppMode {
  CAMERA = 'camera',
  FUN = 'fun',
  COMIC = 'comic'
}
