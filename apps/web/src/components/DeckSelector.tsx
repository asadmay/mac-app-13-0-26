// apps/web/src/components/DeckSelector.tsx
import React, { useState } from 'react';
import { Badge, Cell, List } from '@telegram-apps/telegram-ui';
import { Deck } from '../types';

export default function DeckSelector({
  decks,
  onSelect,
}: {
  decks: Deck[];
  onSelect: (deck: Deck) => void;
}) {
  const [activeId, setActiveId] = useState<string>(decks[0]?.id ?? '');

  return (
    <List>
      {decks.map((d) => (
        <Cell
          key={d.id}
          onClick={() => {
            setActiveId(d.id);
            onSelect(d);
          }}
          subtitle={d.description ?? ''}
        >
          <div className={`cellRow ${activeId === d.id ? 'active' : ''}`}>
            <span className="emojiBig">{d.emoji}</span>
            <div className="grow">
              <div className="titleLine">
                <span className="title">{d.name}</span>
                {d.isPremium && <Badge type="number">Pro</Badge>}
              </div>
              <div className="meta">{d.cardCount} карт</div>
            </div>
          </div>
        </Cell>
      ))}
    </List>
  );
}
