import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IeltsWord, MemeContent, ComicPanel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Reusable property definition for a word to ensure consistency
const wordProperties = {
  word: { type: Type.STRING, description: "The IELTS vocabulary word (English)" },
  pronunciation: { type: Type.STRING, description: "IPA pronunciation" },
  meaning: { type: Type.STRING, description: "Chinese definition of the word" },
  sentence: { type: Type.STRING, description: "One simple English example sentence" },
  translation: { type: Type.STRING, description: "Chinese translation of the sentence" },
};

const wordSchema: Schema = {
  type: Type.OBJECT,
  properties: wordProperties,
  required: ["word", "pronunciation", "meaning", "sentence", "translation"],
};

const memeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ...wordProperties, // Include word details directly in the meme object
    caption: { type: Type.STRING, description: "Short, punchy meme text (English)" },
    context: { type: Type.STRING, description: "Explanation of the humor in Chinese" },
    visualPrompt: { type: Type.STRING, description: "Prompt for meme background image" },
  },
  required: ["word", "pronunciation", "meaning", "sentence", "translation", "caption", "context", "visualPrompt"],
};

const comicSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      panelNumber: { type: Type.INTEGER },
      description: { type: Type.STRING },
      dialogue: { type: Type.STRING },
      visualPrompt: { type: Type.STRING },
      wordData: {
        type: Type.OBJECT,
        properties: wordProperties,
        required: ["word", "pronunciation", "meaning", "sentence", "translation"]
      }
    },
    required: ["panelNumber", "description", "dialogue", "visualPrompt", "wordData"],
  },
};

export const analyzeImageForWord = async (base64Image: string): Promise<IeltsWord> => {
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify the main object. Return a high-frequency IELTS word (Band 7+) for it." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: wordSchema,
      systemInstruction: "You are an IELTS tutor. Return strict JSON."
    }
  });
  return JSON.parse(response.text || "{}") as IeltsWord;
};

export const generateMemeConcept = async (topic?: string): Promise<MemeContent> => {
  const prompt = topic 
    ? `Funny meme concept about: ${topic}` 
    : "Pick a random IELTS word and create a meme concept.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: memeSchema,
      systemInstruction: "Creative meme generator. Include full word definition details."
    }
  });
  return JSON.parse(response.text || "{}") as MemeContent;
};

export const generateComicScript = async (theme: string): Promise<ComicPanel[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `4-panel comic strip about: ${theme}. Each panel teaches one IELTS word.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: comicSchema,
      systemInstruction: "Comic writer. Include full word data for the key vocabulary in each panel."
    }
  });
  return JSON.parse(response.text || "[]") as ComicPanel[];
};

export const generateVisual = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt + ", dark theme, neon accents, cyberpunk aesthetic, high quality, vector style",
      config: { numberOfImages: 1, aspectRatio: '1:1' },
    });
    const base64 = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/500/500`;
  }
};
