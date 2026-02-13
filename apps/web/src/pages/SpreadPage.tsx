// apps/web/src/pages/SpreadPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Placeholder, Section, Snackbar } from '@telegram-apps/telegram-ui';
import { useDecks } from '@/hooks/useDecks';
import { SPREADS } from '@/data/spreads';
import { Deck, PracticePreset, Spread, Card } from '@/types';
import DeckSelector from '@/components/DeckSelector';
import SpreadSelector from '@/components/SpreadSelector';
import SpreadBoard from '@/components/SpreadBoard';
import CardViewerModal from '@/components/CardViewerModal';
import { useSessions } from '@/hooks/useSessions';
import { Page } from '@/ui/components/Page';

type Mode = 'quick' | 'guided' | 'free';
type Step = 'start' | 'question' | 'deck' | 'spread' | 'board' | 'free';

const LAST_KEY = 'mak:last:v3';

interface LastSettings {
  deckId?: string;
  spreadId?: string;
  mode?: Mode;
  question?: string;
}

function loadLast(): LastSettings {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLast(payload: LastSettings) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

interface SpreadPageProps {
  practicePreset: PracticePreset | null;
  onPresetConsumed: () => void;
}

export default function SpreadPage({ practicePreset, onPresetConsumed }: SpreadPageProps) {
  const { decks, loading, error } = useDecks();
  const { addFreeCard } = useSessions();

  const spreads = useMemo(() => SPREADS, []);
  const last = useMemo(() => loadLast(), []);

  const [mode, setMode] = useState<Mode>(last.mode ?? 'guided');
  const [step, setStep] = useState<Step>('start');

  const [question, setQuestion] = useState(last.question ?? '');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [spread, setSpread] = useState<Spread | null>(null);

  const [freeOpen, setFreeOpen] = useState(false);
  const [freeCards, setFreeCards] = useState<Array<{ card: Card; note: string }>>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const freePosition = useMemo(
    () => ({
      id: 'free',
      label: 'Свободная карта',
      question: 'Что сейчас важно увидеть?',
    }),
    [],
  );

  // Apply practice preset (auto-open board)
  useEffect(() => {
    if (!practicePreset) return;
    if (loading) return;

    const deckCandidate =
      decks.find((d) => d.id === practicePreset.deckId) ??
      decks.find((d) => d.id === 'ihavemyself') ??
      decks[0] ??
      null;

    const spreadCandidate = spreads.find((s) => s.id === practicePreset.spreadId) ?? spreads[0] ?? null;

    setMode('guided');
    setQuestion(practicePreset.question);
    setDeck(deckCandidate);
    setSpread(spreadCandidate);
    setStep(deckCandidate && spreadCandidate ? 'board' : 'deck');

    saveLast({
      ...loadLast(),
      mode: 'guided',
      deckId: deckCandidate?.id,
      spreadId: spreadCandidate?.id,
      question: practicePreset.question,
    });

    onPresetConsumed();
  }, [practicePreset, loading, decks, spreads, onPresetConsumed]);

  const decksToShow = useMemo(() => {
    if (!practicePreset?.allowedDeckIds?.length) return decks;
    return decks.filter((d) => practicePreset.allowedDeckIds!.includes(d.id));
  }, [decks, practicePreset]);

  const setModeAndPersist = useCallback((m: Mode) => {
    setMode(m);
    saveLast({ ...loadLast(), mode: m });
  }, []);

  const back = useCallback(() => {
    if (step === 'question') setStep('start');
    else if (step === 'deck') setStep(mode === 'guided' ? 'question' : 'start');
    else if (step === 'spread') setStep('deck');
    else if (step === 'board') setStep('spread');
    else if (step === 'free') setStep('deck');
  }, [step, mode]);

  const pickDeck = useCallback(
    (d: Deck) => {
      setDeck(d);
      saveLast({ ...loadLast(), deckId: d.id, mode, question });

      if (mode === 'free') {
        setStep('free');
        return;
      }

      if (mode === 'quick') {
        const single = spreads.find((s) => s.id === 'single') ?? spreads[0];
        setSpread(single ?? null);
        saveLast({ ...loadLast(), deckId: d.id, spreadId: single?.id, mode, question });
        setStep('board');
        return;
      }

      setStep('spread');
    },
    [mode, spreads, question],
  );

  const pickSpread = useCallback(
    (s: Spread) => {
      setSpread(s);
      saveLast({ ...loadLast(), spreadId: s.id, mode, question });
      setStep('board');
    },
    [mode, question],
  );

  const handleFreeSave = useCallback(
    (data: { cardId: string; imageUrl: string; keywords: string[]; note: string }) => {
      const card = deck?.cards.find((c) => c.id === data.cardId);
      if (!card) return;

      addFreeCard({
        cardId: data.cardId,
        imageUrl: data.imageUrl,
        keywords: data.keywords,
        note: data.note,
      });

      setFreeCards((prev) => [...prev, { card, note: data.note }]);
      setFreeOpen(false);
      setSnackbar('Карта сохранена в журнал');
    },
    [deck, addFreeCard],
  );

  if (loading) {
    return (
      <Page title="Загрузка..." subtitle="Подготавливаю колоды.">
        <div className="pageContent">
          <Placeholder header="Загрузка" description="Подождите пару секунд…" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Ошибка" subtitle="Не удалось загрузить данные.">
        <div className="pageContent">
          <Section header="Что произошло">
            <div className="smallText" style={{ color: 'var(--tgui--destructive_text_color)' }}>
              ❌ {error}
            </div>
          </Section>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Расклад карт" subtitle="Выбери формат и начни работу с картами.">
      <div className="pageContent">
        {step !== 'start' && (
          <div style={{ marginBottom: 10 }}>
            <Button onClick={back} mode="outline" aria-label="Назад">
              ← Назад
            </Button>
          </div>
        )}

        {step === 'start' && (
          <Section
            header="Выбери формат"
            footer="Можно начать быстро, выбрать расклад вручную или тянуть карты свободно."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="cardButton"
                onClick={() => {
                  setModeAndPersist('quick');
                  setQuestion('');
                  setSpread(null);
                  setDeck(null);

                  const l = loadLast();
                  const preferredDeck = decks.find((d) => d.id === l.deckId) ?? decks[0] ?? null;
                  if (preferredDeck) pickDeck(preferredDeck);
                  else setStep('deck');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'color-mix(in srgb, var(--app-button-bg) 12%, var(--surface))',
                      fontSize: 18,
                    }}
                  >
                    ⚡
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Быстро</div>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                  Одна карта, чтобы увидеть главный акцент прямо сейчас.
                </div>
                <div className="smallText" style={{ marginTop: 10 }}>
                  Без вопроса · Можно начать сразу
                </div>
              </button>

              <button
                type="button"
                className="cardButton"
                onClick={() => {
                  setModeAndPersist('guided');
                  setDeck(null);
                  setSpread(null);
                  setStep('question');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'color-mix(in srgb, var(--app-button-bg) 12%, var(--surface))',
                      fontSize: 18,
                    }}
                  >
                    🧭
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Выбор вручную</div>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                  Введи тему, выбери колоду и расклад — для глубокой работы.
                </div>
                <div className="smallText" style={{ marginTop: 10 }}>
                  Вопрос → Колода → Расклад
                </div>
              </button>

              <button
                type="button"
                className="cardButton"
                onClick={() => {
                  setModeAndPersist('free');
                  setQuestion('');
                  setSpread(null);
                  setDeck(null);
                  setStep('deck');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'color-mix(in srgb, var(--app-button-bg) 12%, var(--surface))',
                      fontSize: 18,
                    }}
                  >
                    🎴
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Свободно</div>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                  Тяни карты и записывай ассоциации — без позиций и схем.
                </div>
                <div className="smallText" style={{ marginTop: 10 }}>
                  Отлично для вдохновения
                </div>
              </button>
            </div>
          </Section>
        )}

        {step === 'question' && (
          <Section header="🧩 Тема / вопрос" footer="Хочешь — оставь пустым и просто выбери колоду и расклад.">
            <textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                saveLast({ ...loadLast(), question: e.target.value, mode });
              }}
              placeholder="Например: «Что мне важно понять про эту ситуацию?»"
              className="textarea"
              aria-label="Ваш вопрос или тема"
              maxLength={500}
            />

            <div className="rowWrap" style={{ marginTop: 10 }}>
              <Button
                onClick={() => {
                  saveLast({ ...loadLast(), question, mode });
                  setStep('deck');
                }}
                aria-label="Продолжить к выбору колоды"
              >
                Дальше →
              </Button>
              <Button
                mode="outline"
                onClick={() => {
                  setQuestion('');
                  saveLast({ ...loadLast(), question: '', mode });
                }}
              >
                Очистить
              </Button>
            </div>
          </Section>
        )}

        {step === 'deck' && (
          <Section header={mode === 'free' ? '🎨 Выбери колоду (свободно)' : '🎨 Выбери колоду'}>
            <DeckSelector decks={decksToShow} onSelect={pickDeck} />
          </Section>
        )}

        {step === 'spread' && deck && (
          <Section header="📐 Выбери расклад" footer={`Колода: ${deck.emoji} ${deck.name}`}>
            <SpreadSelector spreads={spreads} onSelect={pickSpread} />
          </Section>
        )}

        {step === 'board' && deck && spread && (
          <SpreadBoard
            deck={deck}
            spread={spread}
            question={question}
            autoOpenFirst={mode === 'quick'}
            practice={
              practicePreset
                ? {
                    id: practicePreset.practiceId,
                    title: `${practicePreset.practiceEmoji} ${practicePreset.practiceTitle}`,
                    mode: practicePreset.practiceMode,
                  }
                : null
            }
          />
        )}

        {step === 'free' && deck && (
          <>
            <Section header={`🎴 Свободное вытягивание · ${deck.emoji} ${deck.name}`}>
              {freeCards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {freeCards.map((fc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        padding: 12,
                        background: 'var(--surface)',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img
                        src={fc.card.imageUrl}
                        alt={`Карта ${idx + 1}`}
                        style={{ width: 80, height: 107, objectFit: 'cover', borderRadius: 8 }}
                        loading="lazy"
                      />
                      <div style={{ flex: 1 }}>
                        {fc.note ? <div style={{ fontSize: 14, lineHeight: 1.35 }}>{fc.note}</div> : null}
                        <div className="smallText" style={{ marginTop: 6 }}>
                          {fc.card.title ?? 'Карта'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Placeholder
                  header="Начни с первой карты"
                  description="Нажми «Вытянуть карту», добавь заметку и сохрани в журнал."
                />
              )}

              <div className="rowWrap">
                <Button onClick={() => setFreeOpen(true)} aria-label="Вытянуть карту">
                  ✨ Вытянуть карту
                </Button>
                <Button
                  mode="outline"
                  onClick={() => {
                    setFreeCards([]);
                    setSnackbar('Список очищен');
                  }}
                >
                  Очистить список
                </Button>
              </div>
            </Section>

            {freeOpen && (
              <CardViewerModal
                position={freePosition}
                deck={deck}
                usedCardIds={new Set()}
                onClose={() => setFreeOpen(false)}
                onSave={handleFreeSave}
              />
            )}
          </>
        )}

        {snackbar && (
          <Snackbar onClose={() => setSnackbar(null)} duration={3000} description={snackbar} />
        )}
      </div>
    </Page>
  );
}
