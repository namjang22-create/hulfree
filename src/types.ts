export type StressMode = 'thought' | 'bubble' | 'neon';

export type DestroyMethod = 'shatter' | 'burn' | 'fart' | 'janggu' | 'foghorn' | 'laugh' | 'bowling' | 'lantern';

export interface SoundState {
  rain: boolean;
  rainVol: number;
  ocean: boolean;
  oceanVol: number;
  fire: boolean;
  fireVol: number;
  bowl: boolean;
  bowlVol: number;
  wind: boolean;
  windVol: number;
  masterVol: number;
  isMuted: boolean;
}

export interface StressTip {
  id: string;
  category: 'physical' | 'cognitive' | 'instant' | 'lifestyle';
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  steps: string[];
  iconName: string;
  tag: string;
}

export interface DestroyHistoryItem {
  id: string;
  textSnippet: string;
  method: DestroyMethod;
  timestamp: string;
}
