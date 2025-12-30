import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, LifeResume } from "./types";

/**
 * Load API keys
 */
const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY1,
  process.env.API_KEY2
].filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error("No API keys provided");
}

/**
 * Round-robin index (in-memory)
 */
let currentKeyIndex = 0;

/**
 * Get next API key in round-robin fashion
 */
const getNextAIClient = () => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Execute a request with round-robin + retry
 */
const executeWithRoundRobin = async <T>(
  fn: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  let lastError;

  for (let i = 0; i < API_KEYS.length; i++) {
    const ai = getNextAIClient();
    try {
      return await fn(ai);
    } catch (err) {
      lastError = err;
      console.warn("API key failed, switching to next key...");
    }
  }

  throw lastError;
};

export const generateLifeResume = async (
  input: UserInput
): Promise<LifeResume> => {
  const {
    name,
    language,
    age,
    profession,
    mood,
    roastLevel,
    hobby,
    lastPurchase,
    petPeeve,
    uselessSkill,
    procrastinatedGoal
  } = input;

  const hinglishInstruction =
    language === "Hinglish"
      ? "The output MUST be in Hinglish (a mix of Hindi and English). Use urban Indian slang (e.g., words like 'zindagi', 'kaafi', 'vibe', 'jugaad', 'scene set hai', 'tension mat lo'). Keep it witty and relatable for a Gen-Z/Millennial Indian audience."
      : "The output MUST be in clear, witty English.";

  const prompt = `
You are a witty, kind, and self-aware humor writer who uses metaphors to describe human nature.
Your task is to create a humorous but relatable "Life Resume" for ${name}.

IMPORTANT: Assign them an "Existential Spirit Animal" that captures their specific brand of chaos.
THE VIBE MUST BE FUNNY AND ABSURD.

Language Requirement: ${hinglishInstruction}

Person Details:
- Name: ${name}
- Age: ${age}
- Profession: ${profession}
- Expensive hobby: ${hobby}
- Questionable purchase: ${lastPurchase}
- Irritant: ${petPeeve}
- Useless Skill: ${uselessSkill}
- Procrastinated Goal: ${procrastinatedGoal}
- Current Mood: ${mood}
- Roast Level: ${roastLevel}

Output Requirements:
- Use short, punchy lines.
- Self-roasting, universally relatable.
- No emojis, no profanity.
- The summary MUST reference the person's name ${name} and their assigned spirit animal wittily.
- Provide an "accentColor" as a HEX string that matches the animal's vibe.
- Create a "visualPrompt" specifically for this Spirit Animal.

Structure the output in JSON format with exactly these fields.
`;

  try {
    /**
     * TEXT GENERATION (Round-robin)
     */
    const response = await executeWithRoundRobin((ai) =>
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              summary: { type: Type.ARRAY, items: { type: Type.STRING } },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    percentage: { type: Type.NUMBER }
                  },
                  required: ["name", "percentage"]
                }
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    period: { type: Type.STRING }
                  },
                  required: ["role", "period"]
                }
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              failuresAndLessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    failure: { type: Type.STRING },
                    lesson: { type: Type.STRING }
                  },
                  required: ["failure", "lesson"]
                }
              },
              visualPrompt: { type: Type.STRING },
              accentColor: { type: Type.STRING }
            },
            required: [
              "name",
              "summary",
              "achievements",
              "skills",
              "experience",
              "strengths",
              "weaknesses",
              "failuresAndLessons",
              "visualPrompt",
              "accentColor"
            ]
          }
        }
      })
    );

    const data = JSON.parse(response.text || "{}") as LifeResume;

    /**
     * IMAGE GENERATION (Round-robin)
     */
    try {
      const imageResponse = await executeWithRoundRobin((ai) =>
        ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [
              {
                text: `A hilarious and absurd character caricature. Subject: ${data.visualPrompt}. Extremely expressive face, meme-worthy chaos. Pixar-like 3D style, vibrant colors, cinematic lighting, clean studio background.`
              }
            ]
          },
          config: { imageConfig: { aspectRatio: "1:1" } }
        })
      );

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          data.caricatureUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgErr) {
      console.warn("Image generation failed", imgErr);
    }

    return data;
  } catch (error) {
    console.error("Error generating resume:", error);
    throw error;
  }
};
