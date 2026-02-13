// apps/web/src/components/CardViewerModal.tsx
import React, { useEffect } from 'react';
import { Deck, SpreadPosition } from '../types';
import CardViewer from './CardViewer';

interface CardViewerModalProps {
  position: SpreadPosition;
  deck: Deck;
  usedCardIds: Set<string>;
  onClose: () => void;
  onSave: (data: { cardId: string; imageUrl: string; keywords: string[]; note: string }) => void;
  initialCard?: Card | null;
}

export default function CardViewerModal({
  position,
  deck,
  usedCardIds,
  onClose,
  onSave,
  initialCard,
}: CardViewerModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Блокировка скролла body
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div 
      className="modalOverlay" 
      onClick={onClose} 
      role="presentation"
      aria-hidden="true"
    >
      <div 
        className="modalSheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="visually-hidden">
          Просмотр карты: {position.label}
        </h2>
        <CardViewer
          position={position}
          deck={deck}
          usedCardIds={usedCardIds}
          onClose={onClose}
          onSave={onSave}
          initialCard={initialCard}
        />
      </div>
    </div>
  );
}