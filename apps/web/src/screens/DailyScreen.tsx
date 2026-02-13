// apps/web/src/screen/DailyScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/ui/components/Page';

type DailyCard = {
  id: string;
  title: string;
  prompt: string;
  image?: string;
};

type DailyEntry = {
  id: string;
  kind: 'daily';
  createdAt: number;
  dateISO: string;
  card: DailyCard;
  a1: string;
  a2: string;
  a3: string;
  microStep: string;
  summary: string;
};

const JOURNAL_KEY = 'mak:journal:v1';
const DECK_KEY = 'mak:deck:v1';

const COMMON_PROMPT = 'Какая ассоциация приходит первой?';

function readJournal(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as DailyEntry[];
  } catch {
    return [];
  }
}

function writeJournal(entries: DailyEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

function hashToIndex(input: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_CARDS: DailyCard[] = [
  { id: 'c1', title: 'Фокус', prompt: 'Что мне важно помнить сегодня?' },
  { id: 'c2', title: 'Ресурс', prompt: 'Где моя опора прямо сейчас?' },
  { id: 'c3', title: 'Границы', prompt: 'Что стоит делать мягче, а что — чётче?' },
  { id: 'c4', title: 'Движение', prompt: 'Какой самый маленький шаг я могу сделать?' },
  { id: 'c5', title: 'Отпустить', prompt: 'Что я держу по инерции?' },
  { id: 'c6', title: 'Смелость', prompt: 'Где я могу быть чуть смелее?' },
  { id: 'c7', title: 'Ясность', prompt: 'Что прояснится, если я перестану спешить?' },
  { id: 'c8', title: 'Забота', prompt: 'Как я могу поддержать себя сегодня?' }
];

type DeckIndex = {
  decks: Array<{
    id: string;
    title: string;
    description?: string;
    cards: Array<{ id: string; image: string }>;
  }>;
};

function readDeckId(): string | null {
  try {
    const v = localStorage.getItem(DECK_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

function writeDeckId(deckId: string) {
  try {
    localStorage.setItem(DECK_KEY, deckId);
  } catch {
    // ignore
  }
}

function cardNumberFromId(id: string): number {
  // "c22" -> 22
  const m = String(id).match(/(\d+)/);
  return m ? Number(m[1]) : Number.NaN;
}

async function loadDeckIndex(): Promise<DeckIndex | null> {
  const res = await fetch(`/decks/index.json?v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as DeckIndex;
}

async function loadDeckCards(index: DeckIndex, deckId: string): Promise<DailyCard[] | null> {
  const deck = index.decks?.find((d) => d.id === deckId);
  if (!deck || !deck.cards?.length) return null;

  const sorted = [...deck.cards].sort((a, b) => {
    const na = cardNumberFromId(a.id);
    const nb = cardNumberFromId(b.id);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a.id).localeCompare(String(b.id));
  });

  return sorted.map((c, i) => ({
    id: c.id,
    title: `Карта ${i + 1}`,
    prompt: COMMON_PROMPT,
    image: c.image
  }));
}

type Step = 'intro' | 'draw' | 'assoc' | 'micro' | 'summary' | 'done';

export function DailyScreen() {
  const nav = useNavigate();

  const dateISO = useMemo(() => todayISO(), []);

  const [deckIndex, setDeckIndex] = useState<DeckIndex | null>(null);
  const [deckId, setDeckId] = useState<string>(readDeckId() ?? 'base');

  const [cards, setCards] = useState<DailyCard[]>(DEFAULT_CARDS);

  const [step, setStep] = useState<Step>('intro');
  const [drawn, setDrawn] = useState(false);

  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [microStep, setMicroStep] = useState('');
  const [summary, setSummary] = useState('');

  // 1) грузим список колод
  useEffect(() => {
    loadDeckIndex()
      .then((idx) => {
        if (!idx?.decks?.length) return;

        setDeckIndex(idx);

        // если выбранной колоды нет — ставим первую
        const exists = idx.decks.some((d) => d.id === deckId);
        const nextDeckId = exists ? deckId : idx.decks[0].id;

        setDeckId(nextDeckId);
        writeDeckId(nextDeckId);
      })
      .catch(() => {
        // ignore, останется DEFAULT_CARDS
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) при смене deckId — грузим карты этой колоды и сбрасываем процесс
  useEffect(() => {
    writeDeckId(deckId);

    if (!deckIndex?.decks?.length) {
      setCards(DEFAULT_CARDS);
      return;
    }

    loadDeckCards(deckIndex, deckId)
      .then((next) => setCards(next && next.length ? next : DEFAULT_CARDS))
      .catch(() => setCards(DEFAULT_CARDS));

    // сброс состояния, чтобы не было "вытянул карту" от прошлой колоды
    setStep('intro');
    setDrawn(false);
    setA1('');
    setA2('');
    setA3('');
    setMicroStep('');
    setSummary('');
  }, [deckId, deckIndex]);

  const dailyCard = useMemo(() => {
    const list = cards.length ? cards : DEFAULT_CARDS;
    const idx = hashToIndex(`${dateISO}:${deckId}`, list.length);
    return list[idx] ?? list[0];
  }, [dateISO, deckId, cards]);

  const deckTitle = useMemo(() => {
    const d = deckIndex?.decks?.find((x) => x.id === deckId);
    return d?.title ?? 'Колода';
  }, [deckIndex, deckId]);

  function next() {
    setStep((s) => {
      if (s === 'intro') return 'draw';
      if (s === 'draw') return 'assoc';
      if (s === 'assoc') return 'micro';
      if (s === 'micro') return 'summary';
      if (s === 'summary') return 'done';
      return s;
    });
  }

  function back() {
    setStep((s) => {
      if (s === 'draw') return 'intro';
      if (s === 'assoc') return 'draw';
      if (s === 'micro') return 'assoc';
      if (s === 'summary') return 'micro';
      if (s === 'done') return 'summary';
      return s;
    });
  }

  function canContinue(): boolean {
    if (step === 'intro') return true;
    if (step === 'draw') return drawn;
    if (step === 'assoc') return Boolean(a1.trim() || a2.trim() || a3.trim());
    if (step === 'micro') return microStep.trim().length >= 2;
    if (step === 'summary') return summary.trim().length >= 2;
    return false;
  }

  function saveToJournal() {
    const entry: DailyEntry = {
      id: `daily_${dateISO}_${Date.now()}`,
      kind: 'daily',
      createdAt: Date.now(),
      dateISO,
      card: dailyCard,
      a1: a1.trim(),
      a2: a2.trim(),
      a3: a3.trim(),
      microStep: microStep.trim(),
      summary: summary.trim()
    };

    const journal = readJournal();
    writeJournal([entry, ...journal]);
  }

  return (
    <Page title="Карта дня" subtitle="Быстрый фокус: карта → ассоциации → микрошаг.">
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => (step === 'intro' ? nav('/') : back())}
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer'
          }}
        >
          Назад
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.6, alignSelf: 'center' }}>
          {dateISO}
        </div>
      </div>

      {step === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.4 }}>
            Сделай 1 спокойный вдох. Затем нажми «Начать» — и мы пройдём 4 шага.
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              background: 'var(--app-secondary-bg)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Колода</div>

            {deckIndex?.decks?.length ? (
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '10px 12px',
                  background: 'white',
                  color: '#111',
                  outline: 'none'
                }}
              >
                {deckIndex.decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>
                Колоды не загрузились — использую дефолтные карточки.
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
              Текущая: {deckTitle}
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              background: 'var(--app-secondary-bg)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>Вопрос дня</div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8, lineHeight: 1.4 }}>
              {dailyCard.prompt}
            </div>
          </div>
        </div>
      )}

      {step === 'draw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              width: '100%',
              borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.10)',
              background: drawn
                ? 'var(--app-secondary-bg)'
                : 'linear-gradient(135deg, rgba(51,144,236,0.25), rgba(147,51,234,0.18))',
              padding: 16,
              minHeight: 160,
              boxSizing: 'border-box'
            }}
          >
            {!drawn ? (
              <div style={{ opacity: 0.85, lineHeight: 1.4 }}>
                Сфокусируйся на вопросе и вытягивай карту ({deckTitle}).
              </div>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{dailyCard.title}</div>

                {dailyCard.image ? (
                  <img
                    src={dailyCard.image}
                    alt={dailyCard.title}
                    style={{
                      width: '100%',
                      marginTop: 12,
                      borderRadius: 16,
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
                    Нет изображения у карты (проверь /decks/index.json и файлы).
                  </div>
                )}

                <div style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.4 }}>
                  Посмотри на карту и отметь, что замечаешь первым.
                </div>
              </>
            )}
          </div>

          {!drawn && (
            <button
              type="button"
              onClick={() => setDrawn(true)}
              style={{
                width: '100%',
                border: 'none',
                background: 'var(--app-button)',
                color: 'var(--app-button-text)',
                borderRadius: 14,
                padding: '12px 14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Вытянуть карту
            </button>
          )}

          {drawn && (
            <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>
              Теперь назови 3 слова, которые приходят первыми.
            </div>
          )}
        </div>
      )}

      {step === 'assoc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>3 ассоциации</div>

          {[
            { v: a1, set: setA1, ph: 'Слово 1' },
            { v: a2, set: setA2, ph: 'Слово 2' },
            { v: a3, set: setA3, ph: 'Слово 3' }
          ].map((x, i) => (
            <input
              key={i}
              value={x.v}
              onChange={(e) => x.set(e.target.value)}
              placeholder={x.ph}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 14,
                border: '1px solid rgba(0,0,0,0.12)',
                padding: '12px 12px',
                background: 'var(--app-secondary-bg)',
                color: 'var(--app-text)',
                outline: 'none'
              }}
            />
          ))}

          <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>
            Не анализируй — просто фиксируй первое.
          </div>
        </div>
      )}

      {step === 'micro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Микрошаг</div>
          <textarea
            value={microStep}
            onChange={(e) => setMicroStep(e.target.value)}
            placeholder="Какой самый маленький шаг я сделаю сегодня?"
            rows={4}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '12px 12px',
              background: 'var(--app-secondary-bg)',
              color: 'var(--app-text)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.4
            }}
          />
        </div>
      )}

      {step === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Итог одной фразой</div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Например: «Я выбираю маленький шаг и делаю его сегодня»"
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '12px 12px',
              background: 'var(--app-secondary-bg)',
              color: 'var(--app-text)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.4
            }}
          />
          <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>
            Это фраза, которую ты берёшь с собой на сегодня.
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Готово</div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              background: 'var(--app-secondary-bg)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.75 }}>Твой итог</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.4 }}>{summary}</div>
          </div>

          <button
            type="button"
            onClick={() => {
              saveToJournal();
              nav('/journal');
            }}
            style={{
              width: '100%',
              border: 'none',
              background: 'var(--app-button)',
              color: 'var(--app-button-text)',
              borderRadius: 14,
              padding: '12px 14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Сохранить в журнал
          </button>
        </div>
      )}

      <div style={{ height: 14 }} />

      {step !== 'done' && (
        <button
          type="button"
          onClick={next}
          disabled={!canContinue()}
          style={{
            width: '100%',
            border: 'none',
            background: canContinue() ? 'var(--app-button)' : 'rgba(0,0,0,0.18)',
            color: canContinue() ? 'var(--app-button-text)' : 'rgba(255,255,255,0.9)',
            borderRadius: 14,
            padding: '12px 14px',
            fontWeight: 700,
            cursor: canContinue() ? 'pointer' : 'not-allowed'
          }}
        >
          {step === 'intro'
            ? 'Начать'
            : step === 'draw'
              ? 'Дальше'
              : step === 'assoc'
                ? 'Дальше'
                : step === 'micro'
                  ? 'Дальше'
                  : step === 'summary'
                    ? 'Готово'
                    : 'Дальше'}
        </button>
      )}
    </Page>
  );
}
