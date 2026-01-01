
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StageData, TrustAnalysis } from "../types";

// Initialize the client using the correct pattern with a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStageWithGemini = async (
  stageName: string,
  data: StageData
): Promise<TrustAnalysis> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock analysis.");
    return {
      trustScore: 85,
      anomalies: ["API Key missing - running in simulation mode."],
      suggestions: ["Configure valid API Key for real-time AI audit."],
      isVerified: true
    };
  }

  const prompt = `
    You are GreenTrust AI, a supply chain auditor. 
    Analyze the following data input from a ${stageName}.
    Check for logical inconsistencies (e.g., impossible distances, wrong moisture levels).
    
    Data: ${JSON.stringify(data)}

    Return a JSON response with:
    - trustScore (0-100 integer)
    - anomalies (array of strings explaining issues)
    - suggestions (array of strings for improvement)
    - isVerified (boolean, true if score > 70)
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trustScore: { type: Type.INTEGER },
            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            isVerified: { type: Type.BOOLEAN }
          },
          required: ["trustScore", "anomalies", "suggestions", "isVerified"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TrustAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      trustScore: 50,
      anomalies: ["AI Service Unavailable"],
      suggestions: ["Check network connection"],
      isVerified: false
    };
  }
};

export const askChatbot = async (
  userMessage: string,
  history: { role: 'user' | 'model'; text: string }[],
  context: { role: string; category: string }
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm currently in offline mode because the API key is missing. EcoChain is a blockchain-based platform for sustainability tracking across different industries like Thermal Processing, Mixing, and more.";
  }

  const systemInstruction = `
    You are EcoAssistant, the official AI guide for EcoChain.
    EcoChain is a blockchain-based supply chain transparency platform that tracks sustainability, carbon emissions (CO2e), and data integrity.
    
    Current User Context:
    - Role: ${context.role}
    - Category: ${context.category}

    Platform Features:
    1. Blockchain Ledger: Immutable recording of every manufacturing step.
    2. Carbon Intelligence: Automatic CO2 calculation based on energy, distance, and materials.
    3. AI Verification (GreenTrust AI): Every block submitted is audited by AI for anomalies.
    4. Categories: Supports Thermal Processing, Mixing, Fermentation, Extraction, and Assembly.
    5. Analytics: Real-time visualization of total carbon footprint and trust scores.
    6. Certification: Generates a tamper-proof Carbon Integrity Certificate with QR code verification.

    Guidelines:
    - Be helpful, professional, and concise.
    - If it's the user's first login, explain their specific role in the ${context.category} workflow.
    - Encourage sustainable practices and explain how the trust score works.
    - If asked about technical details, mention SHA-256 hashing and the immutable nature of the ledger.
  `;

  try {
    const chatHistory = history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chatbot Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again in a moment!";
  }
};
