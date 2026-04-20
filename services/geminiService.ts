
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

// Safer check for process.env in browser environments
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

const API_KEY = getApiKey();

export const generateGeminiResponse = async (
  messages: Message[],
  systemPrompt: string = "You are Zephyr, a helpful, intelligent, and creative AI assistant. Provide concise and accurate answers."
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  if (!API_KEY) {
    console.error("Zephyr Error: GEMINI_API_KEY is missing.");
    throw new Error("Missing API Key. Please provide GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't generate a response.";
    
    const sources: Array<{ title: string; uri: string }> = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.title && chunk.web.uri) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error: any) {
    console.error("Zephyr API Error:", error);
    throw error;
  }
};
