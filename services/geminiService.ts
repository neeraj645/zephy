
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const API_KEY = process.env.API_KEY || '';

export const generateGeminiResponse = async (
  messages: Message[],
  systemPrompt: string = "You are Zephyr, a helpful, intelligent, and creative AI assistant. Provide concise and accurate answers."
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  if (!API_KEY) {
    console.error("Zephyr Error: API_KEY is missing. Please ensure process.env.API_KEY is configured in your environment.");
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Convert our message format to Gemini format
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
    
    // Extract search grounding sources if available
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
    console.error("Zephyr API Error Details:", {
      message: error.message,
      status: error.status,
      details: error
    });
    throw error;
  }
};
