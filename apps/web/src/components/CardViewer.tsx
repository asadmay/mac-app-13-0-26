// apps/web/src/components/CardViewer.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { Card, Deck, SpreadPosition } from '../types';

type Step = 'draw' | 'view' | 'note';

interface CardViewerProps {
  position: SpreadPosition;
  deck: Deck;
  usedCardIds: Set<string>;
  onClose: () => void;
  onSave: (data: { cardId: string; imageUrl: string; keywords: string[]; note: string }) => void;
  initialCard?: Card | null;
}

export default function CardViewer({
  position,
  deck,
  usedCardIds,
  onClose,
  onSave,
  initialCard = null,
}: CardViewerProps) {
  const [step, setStep] = useState<Step>(initialCard ? 'view' : 'draw');
  const [card, setCard] = useState<Card | null>(initialCard);
  const [note, setNote] = useState('');
  const [flipped, setFlipped] = useState(Boolean(initialCard));
  const [isDrawing, setIsDrawing] = useState(false);

  const availableCards = useMemo(() => {
    const filtered = deck.cards.filter((c) => !usedCardIds.has(c.id));
    return filtered.length > 0 ? filtered : deck.cards;
  }, [deck.cards, usedCardIds]);

  const draw = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    
    const random = availableCards[Math.floor(Math.random() * availableCards.length)];
    setCard(random);
    setFlipped(false);
    setStep('view');
    setNote('');
    
    // Анимация переворота
    setTimeout(() => {
      setFlipped(true);
      setIsDrawing(false);
    }, 300);
  }, [availableCards, isDrawing]);

  const redraw = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      draw();
    }, 300);
  }, [draw]);

  const save = useCallback(() => {
    if (!card) return;
    onSave({
      cardId: card.id,
      imageUrl: card.imageUrl,
      keywords: card.keywords ?? [],
      note: note.trim(),
    });
  }, [card, note, onSave]);

  const handleFlip = useCallback(() => {
    setFlipped((v) => !v);
  }, []);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
      <div className="viewerHead">
        <div className="viewerTitle" id="viewer-title">
          <div className="viewerLabel">{position.label}</div>
          <div className="viewerQuestion">{position.question}</div>
        </div>
        <button 
          className="iconBtn" 
          onClick={onClose} 
          type="button"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>

      {step === 'draw' && (
        <div className="viewerBody">
          <div className="cardBack" role="img" aria-label="Рубашка карты">🃏</div>
          <div className="hint">Сфокусируйся на вопросе и вытягивай карту.</div>
          <Button onClick={draw} disabled={isDrawing}>
            {isDrawing ? '⏳ Тянем...' : '✨ Вытянуть'}
          </Button>
        </div>
      )}

      {step === 'view' && card && (
        <div className="viewerBody">
          <div className={`flip ${flipped ? 'flipped' : ''}`} aria-live="polite">
            <div className="front" role="img" aria-label="Рубашка карты">🃏</div>
            <div className="back">
              <img 
                className="cardImg" 
                src={card.imageUrl} 
                alt={`Карта: ${card.keywords?.slice(0, 3).join(', ') || 'Ассоциативная карта'}`}
                loading="lazy"
              />
              <div className="tags" aria-label="Ключевые слова">
                {(card.keywords ?? []).slice(0, 6).map((k) => (
                  <span key={k} className="tag">#{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <Button mode="outline" onClick={handleFlip} aria-label="Перевернуть карту">
              🔄 Перевернуть
            </Button>
            <Button mode="outline" onClick={redraw} aria-label="Вытянуть другую карту">
              🎴 Другая карта
            </Button>
            <Button onClick={() => setStep('note')} aria-label="Продолжить к заметке">
              Дальше →
            </Button>
          </div>
        </div>
      )}

      {step === 'note' && card && (
        <div className="viewerBody">
          <img 
            className="thumb" 
            src={card.imageUrl} 
            alt={`Миниатюра: ${card.keywords?.slice(0, 3).join(', ') || 'Карта'}`}
            loading="lazy"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Что ты чувствуешь/думаешь? Какие ассоциации?"
            className="textarea"
            aria-label="Заметка к карте"
            maxLength={2000}
          />
          <div className="row">
            <Button onClick={save} disabled={!card}>💾 Сохранить</Button>
            <Button mode="outline" onClick={() => setStep('view')}>← Назад</Button>
          </div>
        </div>
      )}
    </div>
  );
}