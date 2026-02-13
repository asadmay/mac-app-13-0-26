// apps/web/src/components/SpreadBoard.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Section, Snackbar } from '@telegram-apps/telegram-ui';
import { Deck, Session, SessionCard, Spread, SpreadPosition, PracticeMode } from '../types';
import { useSessions } from '../hooks/useSessions';
import CardViewerModal from './CardViewerModal';

type CellData = { cardId: string; imageUrl: string; keywords: string[]; note: string };

interface SpreadBoardProps {
  deck: Deck;
  spread: Spread;
  question: string;
  autoOpenFirst?: boolean;
  practice: null | { id: string; title: string; mode: PracticeMode };
}

export default function SpreadBoard({
  deck,
  spread,
  question,
  autoOpenFirst = false,
  practice,
}: SpreadBoardProps) {
  const { addSession } = useSessions();

  const [data, setData] = useState<Record<string, CellData>>({});
  const [activePositionId, setActivePositionId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [takeaway, setTakeaway] = useState('');
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const usedCardIds = useMemo(
    () => new Set(Object.values(data).map((x) => x.cardId)),
    [data],
  );

  const activePosition: SpreadPosition | null = useMemo(() => {
    if (!activePositionId) return null;
    return spread.positions.find((p) => p.id === activePositionId) ?? null;
  }, [activePositionId, spread.positions]);

  const filledCount = useMemo(() => Object.keys(data).length, [data]);
  const totalCount = spread.positions.length;
  const isComplete = filledCount === totalCount;

  useEffect(() => {
    if (!autoOpenFirst) return;
    if (activePositionId) return;
    if (spread.positions.length === 0) return;
    setActivePositionId(spread.positions[0].id);
  }, [autoOpenFirst, spread.positions]);

  const handleSave = useCallback((positionId: string, payload: CellData) => {
    setData((prev) => ({ ...prev, [positionId]: payload }));
    setActivePositionId(null);
    setSnackbar({ message: 'Карта сохранена', type: 'success' });
  }, []);

  const doSave = useCallback(() => {
    const cards: SessionCard[] = spread.positions
      .filter((p) => data[p.id])
      .map((p) => ({
        positionId: p.id,
        label: p.label,
        question: p.question,
        cardId: data[p.id].cardId,
        imageUrl: data[p.id].imageUrl,
        keywords: data[p.id].keywords,
        note: data[p.id].note,
      }));

    const session: Session = {
      id: String(Date.now()),
      createdAt: Date.now(),
      question: question.trim(),
      takeaway: takeaway.trim(),
      deckId: deck.id,
      deckName: `${deck.emoji} ${deck.name}`,
      spreadId: spread.id,
      spreadName: `${spread.icon} ${spread.name}`,
      practiceId: practice?.id,
      practiceTitle: practice?.title,
      practiceMode: practice?.mode,
      cards,
    };

    addSession(session);
    setSaveOpen(false);
    setTakeaway('');
    setData({});
    setSnackbar({ message: '✅ Сохранено в журнал', type: 'success' });
  }, [data, spread.positions, spread.id, spread.name, question, takeaway, deck, practice, addSession]);

  const progressText = `${filledCount} из ${totalCount}`;

  return (
    <div className="board">
      <Section
        header={`🧩 ${spread.icon} ${spread.name}`}
        footer={
          practice
            ? `Практика: ${practice.title} · режим: ${practice.mode === 'self' ? 'я сам(а)' : 'с клиентом'} · ${progressText}`
            : `${question.trim() ? `Вопрос: ${question.trim()}` : 'Вопрос не задан'} · ${progressText}`
        }
      >
        <div className="grid" role="list" aria-label="Позиции расклада">
          {spread.positions.map((p) => {
            const filled = Boolean(data[p.id]);
            return (
              <button
                key={p.id}
                className={`slot ${filled ? 'filled' : ''}`}
                onClick={() => setActivePositionId(p.id)}
                type="button"
                role="listitem"
                aria-label={`${p.label}: ${p.question}${filled ? ' (заполнено)' : ''}`}
              >
                <div className="slotLabel">{p.label}</div>
                <div className="slotQuestion">{p.question}</div>
                {filled ? (
                  <div className="ok">✓ выбрана</div>
                ) : (
                  <div className="tap">Нажми</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="row">
          <Button 
            onClick={() => setSaveOpen(true)} 
            disabled={filledCount === 0}
            aria-label="Сохранить расклад"
          >
            💾 Сохранить расклад {isComplete && '(готово)'}
          </Button>
        </div>
      </Section>

      {activePositionId && activePosition && (
        <CardViewerModal
          position={activePosition}
          deck={deck}
          usedCardIds={usedCardIds}
          onClose={() => setActivePositionId(null)}
          onSave={(payload) => handleSave(activePositionId, payload)}
        />
      )}

      {saveOpen && (
        <div 
          className="modalOverlay" 
          onClick={() => setSaveOpen(false)} 
          role="presentation"
        >
          <div 
            className="modalSheet" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-title"
          >
            <div className="viewerHead">
              <div className="viewerTitle">
                <div className="viewerLabel" id="save-title">Итог</div>
                <div className="viewerQuestion">Одна фраза: что ты берёшь с собой?</div>
              </div>
              <button 
                className="iconBtn" 
                onClick={() => setSaveOpen(false)} 
                type="button"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <textarea
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              placeholder="Например: «Я выбираю маленький шаг и делаю его сегодня»"
              className="textarea"
              aria-label="Итоговая мысль"
              maxLength={500}
            />

            <div className="row">
              <Button onClick={doSave} disabled={filledCount === 0}>Сохранить</Button>
              <Button mode="outline" onClick={() => setSaveOpen(false)}>Отмена</Button>
            </div>
          </div>
        </div>
      )}

      {snackbar && (
        <Snackbar
          onClose={() => setSnackbar(null)}
          duration={3000}
          description={snackbar.message}
        />
      )}
    </div>
  );
}