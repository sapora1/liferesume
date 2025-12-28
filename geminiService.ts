
import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, LifeResume } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLifeResume = async (input: UserInput): Promise<LifeResume> => {
  const { name, language, age, profession, mood, roastLevel, hobby, lastPurchase, petPeeve, uselessSkill, procrastinatedGoal } = input;

  const hinglishInstruction = language === 'Hinglish' 
    ? "The output MUST be in Hinglish (a mix of Hindi and English). Use urban Indian slang (e.g., words like 'zindagi', 'kaafi', 'vibe', 'jugaad', 'scene set hai', 'tension mat lo'). Keep it witty and relatable for a Gen-Z/Millennial Indian audience."
    : "The output MUST be in clear, witty English.";

  const prompt = `
    You are a witty, kind, and self-aware humor writer who uses metaphors to describe human nature.
    Your task is to create a humorous but relatable "Life Resume" for ${name}.

    IMPORTANT: Assign them an "Existential Spirit Animal" that captures their specific brand of chaos. 
    THE VIBE MUST BE FUNNY AND ABSURD. 
    Examples: 
    - A pigeon trying to use a touch-screen with its beak.
    - A raccoon in a business suit holding a 'world's best dad' mug filled with trash.
    - A very stressed sloth wearing a 'Fast & Furious' headband.
    - A capybara in a bubble bath surrounded by burning candles and spreadsheets.

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
    - Create a "visualPrompt" specifically for this Spirit Animal. Describe it in a HILARIOUS, EXAGGERATED, and ABSURD situation related to the person's details. Think 'meme-worthy' and 'highly expressive'.

    Structure the output in JSON format with exactly these fields:
    - name: string (the input name)
    - summary: Array of 2 strings
    - achievements: Array of 5 strings
    - skills: Array of 5 objects with { name: string, percentage: number }
    - experience: Array of 3 objects with { role: string, period: string }
    - strengths: Array of 3 strings
    - weaknesses: Array of 3 strings
    - failuresAndLessons: Array of 3 objects with { failure: string, lesson: string }
    - visualPrompt: string (Description of the funny animal character)
    - accentColor: string (HEX)
  `;

  try {
    const response = await ai.models.generateContent({
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
          required: ["name", "summary", "achievements", "skills", "experience", "strengths", "weaknesses", "failuresAndLessons", "visualPrompt", "accentColor"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}") as LifeResume;
    
    try {
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A hilarious and absurd character caricature. Subject: ${data.visualPrompt}. The character should have extremely expressive facial expressions (wide eyes, funny grimaces, silly smiles). Style: Vibrant 3D digital art, Pixar-like high-end production quality, rich saturated colors, cinematic lighting, very detailed textures. The situation should look comical and slightly chaotic. Isolated on a clean, soft studio background.` }
          ]
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

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
