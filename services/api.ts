import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/** Android emulator: use http://10.0.2.2:8000. Physical device: your PC's LAN IP. Web: http://127.0.0.1:8000 */
export function getApiBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '');
}

const KEYS = {
  personUid: 'buddy_person_uid',
  displayName: 'buddy_display_name',
  sessionId: 'buddy_session_id',
  username: 'buddy_username',
  password: 'buddy_password',
  account: 'buddy_account',
  theme: 'buddy_theme_name',
  appVariant: 'buddy_app_variant',
} as const;

const CHAT_HISTORY_KEY_PREFIX = 'buddy_chat_history_';

export type SavedAccount = {
  username: string;
  password: string;
  personUid: string;
  displayName: string;
};

export type ApiBuddyPersonality = 'calm' | 'friendly' | 'sassy' | 'sarcastic' | 'motivational';

/** Study arm: A = social_action (full app), B = support_only (no events). */
export type AppVariant = 'social_action' | 'support_only';

export function normalizeAppVariant(value: unknown): AppVariant | null {
  return value === 'social_action' || value === 'support_only' ? value : null;
}

/**
 * Study arm baked into this build (each arm is deployed as its own site:
 * /a = social_action, /b = support_only). Null in local dev builds.
 */
export function getBuildVariant(): AppVariant | null {
  const v = (process.env.EXPO_PUBLIC_APP_VARIANT ?? '').toLowerCase();
  if (v === 'a' || v === 'social_action') return 'social_action';
  if (v === 'b' || v === 'support_only') return 'support_only';
  return null;
}

export interface PersonOut {
  id: number;
  person_uid: string;
  display_name: string;
  personality_key: string;
  personality_name: string;
  app_variant: AppVariant | null;
  participant_code: string | null;
}

export interface SessionStartOut {
  session_id: number;
  person_uid: string;
}

export interface ChatMessageOut {
  is_command: boolean;
  session_should_end: boolean;
  output: string;
  reply_saved?: boolean | null;
  user_message_id?: number | null;
  assistant_message_id?: number | null;
}

export interface EventItemOut {
  title?: string | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  category?: string | null;
  url?: string | null;
  starts_at?: string | null;
  event_instance_key?: string | null;
}

export interface EventsListOut {
  items: EventItemOut[];
}

/** Map home/chat UI labels to backend enum */
export function uiPersonalityToApi(uiLabel: string): ApiBuddyPersonality {
  const p = uiLabel.toLowerCase();
  if (p === 'calm') return 'calm';
  if (p === 'sassy') return 'sassy';
  if (p === 'sarcastic') return 'sarcastic';
  if (p === 'motivational') return 'motivational';
  return 'friendly';
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function normalizePersonOut(raw: any): PersonOut {
  return {
    id: raw.id ?? raw.person_id ?? raw.personId ?? 0,
    person_uid: raw.person_uid ?? raw.personUid ?? raw.person_uid ?? '',
    display_name: raw.display_name ?? raw.displayName ?? '',
    personality_key: raw.personality_key ?? raw.personalityKey ?? raw.personality ?? '',
    personality_name: raw.personality_name ?? raw.personalityName ?? '',
    app_variant: normalizeAppVariant(raw.app_variant ?? raw.appVariant),
    participant_code: raw.participant_code ?? raw.participantCode ?? null,
  };
}

function normalizeSessionStartOut(raw: any): SessionStartOut {
  return {
    session_id: raw.session_id ?? raw.sessionId ?? 0,
    person_uid: raw.person_uid ?? raw.personUid ?? '',
  };
}

/**
 * Helper to add timeout to fetch requests (prevents stuck processes)
 */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw err;
    });
}

export async function getStoredPersonUid(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.personUid);
}

export async function getStoredDisplayName(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.displayName);
}

export async function getStoredUsername(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.username);
}

export async function getStoredPassword(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.password);
}

export async function getSavedAccount(): Promise<SavedAccount | null> {
  const raw = await AsyncStorage.getItem(KEYS.account);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SavedAccount;
  } catch {
    return null;
  }
}

export async function saveIdentity(personUid: string, displayName: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.sessionId);
  await AsyncStorage.multiSet([
    [KEYS.personUid, personUid],
    [KEYS.displayName, displayName],
  ]);
}

export async function saveAccount(account: SavedAccount): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.username, account.username],
    [KEYS.password, account.password],
    [KEYS.account, JSON.stringify(account)],
  ]);
}

export function getChatHistoryKey(personUid: string) {
  return `${CHAT_HISTORY_KEY_PREFIX}${personUid}`;
}

export async function getStoredChatHistory(personUid: string): Promise<unknown[]> {
  const raw = await AsyncStorage.getItem(getChatHistoryKey(personUid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

export async function saveChatHistory(personUid: string, messages: unknown[]): Promise<void> {
  await AsyncStorage.setItem(getChatHistoryKey(personUid), JSON.stringify(messages));
}

export async function clearStoredIdentity(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.personUid,
    KEYS.displayName,
    KEYS.sessionId,
  ]);
}

export async function clearSessionId(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.sessionId);
}

export async function createPerson(
  displayName: string,
  personality?: ApiBuddyPersonality
): Promise<PersonOut> {
  const variant = getBuildVariant();
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/people/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      display_name: displayName,
      ...(personality ? { personality } : {}),
      ...(variant ? { variant } : {}),
    }),
  });
  const raw = await parseJsonResponse<any>(res);
  return normalizePersonOut(raw);
}

export async function getPerson(personUid: string): Promise<PersonOut> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/people/${personUid}`);
  const raw = await parseJsonResponse<any>(res);
  return normalizePersonOut(raw);
}

export async function getStoredAppVariant(): Promise<AppVariant | null> {
  return normalizeAppVariant(await AsyncStorage.getItem(KEYS.appVariant));
}

export async function saveAppVariant(variant: AppVariant | null): Promise<void> {
  if (variant) {
    await AsyncStorage.setItem(KEYS.appVariant, variant);
  } else {
    await AsyncStorage.removeItem(KEYS.appVariant);
  }
}

/**
 * Re-reads the study arm from the backend (source of truth) and caches it.
 * Falls back to the cached value when offline. Never throws.
 */
export async function refreshAppVariant(personUid: string): Promise<AppVariant | null> {
  try {
    const person = await getPerson(personUid);
    if (person.app_variant) {
      await saveAppVariant(person.app_variant);
      return person.app_variant;
    }
  } catch {
    // Offline or server unreachable - keep the last known arm.
  }
  return getStoredAppVariant();
}

export async function patchPersonality(personUid: string, personality: ApiBuddyPersonality): Promise<PersonOut> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/people/${personUid}/personality`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personality }),
  });
  return parseJsonResponse<PersonOut>(res);
}

export async function startSession(personUid: string, resumed: boolean): Promise<SessionStartOut> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/sessions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person_uid: personUid, resumed }),
  });
  const raw = await parseJsonResponse<any>(res);
  return normalizeSessionStartOut(raw);
}

export async function sendChatMessage(
  personUid: string,
  sessionId: number,
  message: string,
  includePriorSessions: boolean
): Promise<ChatMessageOut> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person_uid: personUid,
      session_id: sessionId,
      message,
      include_prior_sessions: includePriorSessions,
    }),
  });
  return parseJsonResponse<ChatMessageOut>(res);
}

export async function listEvents(limit: number = 50): Promise<EventItemOut[]> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/events/?limit=${limit}`);
  const data = await parseJsonResponse<EventsListOut>(res);
  return data.items ?? [];
}

/**
 * Ensures a server session id exists (reuses cached id or calls POST /sessions/).
 * Call clearSessionId() if the API returns 400 about invalid session.
 */
export async function ensureChatSession(resumed: boolean = true): Promise<{ personUid: string; sessionId: number }> {
  const personUid = await getStoredPersonUid();
  if (!personUid) {
    throw new Error('No person on this device. Sign up first.');
  }
  const cached = await AsyncStorage.getItem(KEYS.sessionId);
  let sessionId = cached ? parseInt(cached, 10) : NaN;
  if (!Number.isFinite(sessionId)) {
    const out = await startSession(personUid, resumed);
    sessionId = out.session_id;
    await AsyncStorage.setItem(KEYS.sessionId, String(sessionId));
  }
  return { personUid, sessionId };
}

// --- Legacy mock-shaped exports (other screens may still import these) ---

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface MoodEntry {
  id: string;
  mood: string;
  timestamp: Date;
}

export interface ProgressStats {
  checkIns: number;
  stepsCompleted: number;
  streak: number;
}

// Mock service functions - replace with actual API calls when backend is ready

export const chatService = {
  sendMessage: async (message: string): Promise<string> => {
    try {
      const response = await fetch('http://192.168.0.100:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      return data.response || data.reply || data.message || 'No response';
    } catch (error) {
      console.log(error);
      return 'Could not connect to backend';
    }
  },
  getChatHistory: async (): Promise<ChatMessage[]> => {
    return [];
  },
};

export const moodService = {
  saveMood: async (mood: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500));
    console.log(`Mood saved: ${mood}`);
  },
  getMoodHistory: async (): Promise<MoodEntry[]> => [],
};

export const progressService = {
  getStats: async (): Promise<ProgressStats> => ({
    checkIns: 15,
    stepsCompleted: 8,
    streak: 5,
  }),
};
