export interface MindLogData {
  totalThoughtsDestroyed: number;
  totalBubblesPopped: number;
  totalZenMinutes: number;
  currentMoodBefore: number; // 1-10
  currentMoodAfter: number; // 1-10
  destroyedHistory: Array<{
    id: string;
    text: string;
    method: string;
    timestamp: string;
  }>;
}

const STORAGE_KEY = 'maum_bium_mind_log';

export const getMindLog = (): MindLogData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load mind log', e);
  }
  return {
    totalThoughtsDestroyed: 0,
    totalBubblesPopped: 0,
    totalZenMinutes: 0,
    currentMoodBefore: 7,
    currentMoodAfter: 3,
    destroyedHistory: [],
  };
};

export const saveMindLog = (data: MindLogData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save mind log', e);
  }
};

export const recordDestroyedThought = (text: string, method: string) => {
  const log = getMindLog();
  log.totalThoughtsDestroyed += 1;
  log.destroyedHistory.unshift({
    id: Date.now().toString(),
    text: text.trim().slice(0, 40) || '익명의 고민',
    method,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  });
  // Keep max 30 history items
  if (log.destroyedHistory.length > 30) {
    log.destroyedHistory = log.destroyedHistory.slice(0, 30);
  }
  saveMindLog(log);
};

export const recordPoppedBubble = (count: number = 1) => {
  const log = getMindLog();
  log.totalBubblesPopped += count;
  saveMindLog(log);
};

export const recordZenSession = (minutes: number = 1) => {
  const log = getMindLog();
  log.totalZenMinutes += minutes;
  saveMindLog(log);
};

export const updateMoodScore = (before: number, after: number) => {
  const log = getMindLog();
  log.currentMoodBefore = before;
  log.currentMoodAfter = after;
  saveMindLog(log);
};
