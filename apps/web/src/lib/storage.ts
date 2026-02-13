import { DailyEntry, Session, FreeCard } from '@/types';

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [k: string]: JsonValue };

// ===== Базовые функции =====

export function storageGetRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSetRaw(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function storageGetJson<T>(key: string, fallback: T): T {
  const raw = storageGetRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSetJson(key: string, value: unknown): boolean {
  try {
    const raw = JSON.stringify(value);
    return storageSetRaw(key, raw);
  } catch {
    return false;
  }
}

// ===== Валидация для импорта =====

export function validateSession(obj: unknown): obj is Session {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  
  return (
    typeof s.id === 'string' &&
    typeof s.createdAt === 'number' &&
    typeof s.question === 'string' &&
    typeof s.takeaway === 'string' &&
    typeof s.deckId === 'string' &&
    typeof s.deckName === 'string' &&
    typeof s.spreadId === 'string' &&
    typeof s.spreadName === 'string' &&
    Array.isArray(s.cards)
  );
}

export function validateSessions(data: unknown): Session[] {
  if (!Array.isArray(data)) return [];
  return data.filter(validateSession);
}

export function validateFreeCard(obj: unknown): obj is FreeCard {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  
  return (
    typeof c.id === 'string' &&
    typeof c.cardId === 'string' &&
    typeof c.imageUrl === 'string' &&
    Array.isArray(c.keywords) &&
    typeof c.note === 'string' &&
    typeof c.createdAt === 'number'
  );
}

// ===== Константы ключей =====

export const STORAGE_KEYS = {
  SESSIONS: 'mak:sessions:v2',
  FREE_CARDS: 'mak:freecards:v1',
  DAILY_JOURNAL: 'mak:journal:v1',
  DECK_STATE: 'mak:deck:v1',
  LAST_SETTINGS: 'mak:last:v2',
} as const;