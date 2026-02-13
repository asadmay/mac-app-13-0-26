import { useEffect, useMemo, useState, useCallback } from 'react';
import { Session, FreeCard } from '@/types';
import { storageGetJson, storageSetJson, validateSessions, validateFreeCard, STORAGE_KEYS } from '@/lib/storage';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [freeCards, setFreeCards] = useState<FreeCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedSessions = storageGetJson<unknown>(STORAGE_KEYS.SESSIONS, []);
    const storedFreeCards = storageGetJson<unknown>(STORAGE_KEYS.FREE_CARDS, []);
    
    setSessions(validateSessions(storedSessions));
    
    if (Array.isArray(storedFreeCards)) {
      setFreeCards(storedFreeCards.filter(validateFreeCard));
    }
    
    setIsLoaded(true);
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.createdAt - a.createdAt),
    [sessions],
  );

  const sortedFreeCards = useMemo(
    () => [...freeCards].sort((a, b) => b.createdAt - a.createdAt),
    [freeCards],
  );

  const saveSessions = useCallback((next: Session[]) => {
    setSessions(next);
    storageSetJson(STORAGE_KEYS.SESSIONS, next);
  }, []);

  const saveFreeCards = useCallback((next: FreeCard[]) => {
    setFreeCards(next);
    storageSetJson(STORAGE_KEYS.FREE_CARDS, next);
  }, []);

  const addSession = useCallback((s: Session) => {
    saveSessions([s, ...sessions]);
  }, [sessions, saveSessions]);

  const removeSession = useCallback((id: string) => {
    saveSessions(sessions.filter((s) => s.id !== id));
  }, [sessions, saveSessions]);

  const addFreeCard = useCallback((card: Omit<FreeCard, 'id' | 'createdAt'>) => {
    const newCard: FreeCard = {
      ...card,
      id: `free-${Date.now()}`,
      createdAt: Date.now(),
    };
    saveFreeCards([newCard, ...freeCards]);
  }, [freeCards, saveFreeCards]);

  const removeFreeCard = useCallback((id: string) => {
    saveFreeCards(freeCards.filter((c) => c.id !== id));
  }, [freeCards, saveFreeCards]);

  const clear = useCallback(() => {
    if (confirm('Точно очистить все данные? Это действие нельзя отменить.')) {
      saveSessions([]);
      saveFreeCards([]);
    }
  }, [saveSessions, saveFreeCards]);

  const exportJson = useCallback(() => {
    const data = {
      sessions: sortedSessions,
      freeCards: sortedFreeCards,
      exportedAt: Date.now(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  }, [sortedSessions, sortedFreeCards]);

  const importJson = useCallback((raw: string) => {
    try {
      const parsed = storageGetJson<unknown>(raw, null);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Неверный формат данных');
      }

      const data = parsed as Record<string, unknown>;
      
      if (data.sessions && Array.isArray(data.sessions)) {
        const validSessions = validateSessions(data.sessions);
        saveSessions(validSessions);
      }

      if (data.freeCards && Array.isArray(data.freeCards)) {
        const validFreeCards = data.freeCards.filter(validateFreeCard);
        saveFreeCards(validFreeCards);
      }

      return { success: true, count: (data.sessions as unknown[])?.length ?? 0 };
    } catch (e) {
      throw new Error(`Ошибка импорта: ${e instanceof Error ? e.message : 'неизвестно'}`);
    }
  }, [saveSessions, saveFreeCards]);

  return {
    sessions: sortedSessions,
    freeCards: sortedFreeCards,
    isLoaded,
    addSession,
    removeSession,
    addFreeCard,
    removeFreeCard,
    clear,
    exportJson,
    importJson,
  };
}