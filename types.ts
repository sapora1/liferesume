
export type Mood = 'calm' | 'stressed' | 'confused' | 'optimistic';
export type RoastLevel = 'light' | 'medium' | 'brutal but kind';
export type Language = 'English' | 'Hinglish';

export interface Skill {
  name: string;
  percentage: number;
}

export interface Experience {
  role: string;
  period: string;
}

export interface FailureAndLesson {
  failure: string;
  lesson: string;
}

export interface LifeResume {
  name: string;
  summary: string[];
  achievements: string[];
  skills: Skill[];
  experience: Experience[];
  strengths: string[];
  weaknesses: string[];
  failuresAndLessons: FailureAndLesson[];
  caricatureUrl?: string;
  visualPrompt?: string;
  accentColor?: string;
  language?: Language;
}

export interface UserInput {
  name: string;
  language: Language;
  age: string;
  profession: string;
  mood: Mood;
  roastLevel: RoastLevel;
  hobby: string;
  lastPurchase: string;
  petPeeve: string;
  uselessSkill: string;
  procrastinatedGoal: string;
}
