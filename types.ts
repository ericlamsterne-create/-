export interface IeltsWord {
  word: string;
  pronunciation: string;
  meaning: string; // Chinese meaning
  sentence: string; // Simple 1st person sentence
  translation: string; // Sentence translation
}

export interface MemeContent {
  word: string;
  caption: string; // The text on the meme
  context: string; // Explanation of the joke
  visualPrompt: string; // Prompt to generate the image
}

export interface ComicPanel {
  panelNumber: number;
  description: string;
  dialogue: string;
  relatedWord: string;
  visualPrompt: string;
}

export enum AppMode {
  CAMERA = 'camera',
  FUN = 'fun',
  COMIC = 'comic'
}

export interface GeneratedImage {
  url: string;
  alt: string;
}