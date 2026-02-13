import { useEffect, useState } from 'react';
import { Deck, DeckIndexItem } from '@/types';

type DeckIndex = { decks: DeckIndexItem[] };

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const indexRes = await fetch('/decks/index.json', { cache: 'no-store' });
        if (!indexRes.ok) throw new Error('Не удалось загрузить index.json');
        const index = (await indexRes.json()) as DeckIndex;

        const deckPromises = index.decks.map(async (meta) => {
          const deckRes = await fetch(meta.file, { cache: 'no-store' });
          if (!deckRes.ok) throw new Error(`Не удалось загрузить колоду ${meta.id}`);
          const deckData = (await deckRes.json()) as Deck;

          return {
            ...deckData,
            description: meta.description,
            isPremium: meta.isPremium,
          } satisfies Deck;
        });

        const loaded = await Promise.all(deckPromises);
        if (alive) setDecks(loaded);
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Ошибка загрузки колод');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return { decks, loading, error };
}