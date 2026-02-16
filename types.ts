
export enum Language {
  ENGLISH = '英语',
  JAPANESE = '日语',
  FRENCH = '法语',
  KOREAN = '韩语',
  CHINESE = '中文'
}

export type Gender = 'male' | 'female' | 'secret';

export interface Agent {
  id: string;
  name: string;
  gender: Gender;
  signature: string;
  personality: string;
  avatarUrl: string;
  bgUrl: string;
  voiceDescription: string;
  voiceName: string;
  description: string;
  tag: string;
}

export interface UserProfile {
  nickname: string;
  avatarUrl: string;
  likes?: string;
  dislikes?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  correction?: string;
  userTranscription?: string; // For user voice messages
  audioUrl?: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  authorId: string; // 'user' or agent.id
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  authorId: string; // 'user' or agent.id
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  isLiked: boolean; // tracked locally for the user
  comments: Comment[];
  timestamp: Date;
}

export interface ChatState {
  currentAgent: Agent;
  messages: Message[];
  isTyping: boolean;
  targetLanguage: Language;
}

// Dictionary Types
export interface DictionaryDefinition {
  pos: string;
  meaning: string;
}

export interface DictionaryExample {
  original: string;
  translation: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  translation: string;
  definitions: DictionaryDefinition[];
  inflections?: Record<string, string>;
  examples: DictionaryExample[];
  synonyms?: string[];
  antonyms?: string[];
  etymology?: string;
}
