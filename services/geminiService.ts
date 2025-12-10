import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IeltsWord, MemeContent, ComicPanel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas
const wordSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The IELTS vocabulary word" },
    pronunciation: { type: Type.STRING, description: "IPA pronunciation" },
    meaning: { type: Type.STRING, description: "Chinese definition" },
    sentence: { type: Type.STRING, description: "A very simple first-person English sentence (e.g. 'I see...')" },
    translation: { type: Type.STRING, description: "Chinese translation of the sentence" },
  },
  required: ["word", "pronunciation", "meaning", "sentence", "translation"],
};

const memeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    caption: { type: Type.STRING, description: "Short, punchy meme text (English)" },
    context: { type: Type.STRING, description: "Explanation of the humor/meme in Chinese" },
    visualPrompt: { type: Type.STRING, description: "A prompt to generate the visual background for the meme" },
  },
  required: ["word", "caption", "context", "visualPrompt"],
};

const comicSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      panelNumber: { type: Type.INTEGER },
      description: { type: Type.STRING, description: "Visual description of the scene" },
      dialogue: { type: Type.STRING, description: "Character dialogue containing the IELTS word" },
      relatedWord: { type: Type.STRING, description: "The specific IELTS word used in this panel" },
      visualPrompt: { type: Type.STRING, description: "Prompt for generating the panel image" },
    },
    required: ["panelNumber", "description", "dialogue", "relatedWord", "visualPrompt"],
  },
};

/**
 * Analyzes an image to find an IELTS word.
 */
export const analyzeImageForWord = async (base64Image: string): Promise<IeltsWord> => {
  const model = "gemini-2.5-flash"; // Efficient for multimodal analysis
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify the main object in this image and match it to a relevant IELTS level vocabulary word. Provide the definition and a simple first-person sentence." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: wordSchema,
      systemInstruction: "You are an expert IELTS tutor. Be precise. The sentence must be simple (A1/A2 level) and use the first person 'I'."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as IeltsWord;
};

/**
 * Generates a meme concept for a given word or random IELTS word.
 */
export const generateMemeConcept = async (topic?: string): Promise<MemeContent> => {
  const prompt = topic 
    ? `Create a funny meme concept about the word related to: ${topic}` 
    : "Pick a random, common IELTS vocabulary word and create a funny meme concept using reddit humor or cat meme style.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: memeSchema,
      systemInstruction: "You are a creative meme generator. Use humor, irony, or relatable situations. Output JSON."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as MemeContent;
};

/**
 * Generates a 4-panel comic script based on a theme.
 */
export const generateComicScript = async (theme: string): Promise<ComicPanel[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a 4-panel comic strip script about: ${theme}. Each panel must teach one IELTS word.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: comicSchema,
      systemInstruction: "You are a comic book writer. Keep dialogue short. Ensure visual descriptions are vivid for image generation."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ComicPanel[];
};

/**
 * Generates an image using Imagen.
 */
export const generateVisual = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt + ", flat vector art style, minimalist, morandi colors, high quality",
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });
    
    const base64 = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Image generation failed, falling back to placeholder", error);
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/500/500`;
  }
};
