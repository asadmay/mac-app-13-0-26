// apps/web/src/components/SessionModal.tsx
import React from 'react';
import { Button, Section } from '@telegram-apps/telegram-ui';
import { Session } from '../types';

export default function SessionModal({
  session,
  onClose,
  onDelete,
}: {
  session: Session;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="modalOverlay" onClick={onClose} role="presentation">
      <div className="modalSheet modalSheetWide" onClick={(e) => e.stopPropagation()}>
        <div className="viewerHead">
          <div className="viewerTitle">
            <div className="viewerLabel">{session.spreadName}</div>
            <div className="viewerQuestion">
              {new Date(session.createdAt).toLocaleString('ru-RU')} · {session.deckName}
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} type="button">✕</button>
        </div>

        {session.question?.trim() && (
          <Section header="Вопрос">
            <div className="textBlock">{session.question.trim()}</div>
          </Section>
        )}

        {session.takeaway?.trim() && (
          <Section header="Итог">
            <div className="textBlock">{session.takeaway.trim()}</div>
          </Section>
        )}

        <Section header="Карты и заметки">
          <div className="cardsList">
            {session.cards.map((c) => (
              <div key={c.positionId} className="sessionCard">
                <img className="sessionImg" src={c.imageUrl} alt="card" loading="lazy" />
                <div className="sessionInfo">
                  <div className="sessionPos">{c.label}</div>
                  <div className="sessionQ">{c.question}</div>
                  {c.note ? (
                    <div className="sessionNote">{c.note}</div>
                  ) : (
                    <div className="sessionNote muted">Без заметки</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="row">
          <Button mode="outline" onClick={onDelete}>Удалить</Button>
          <Button mode="outline" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}
