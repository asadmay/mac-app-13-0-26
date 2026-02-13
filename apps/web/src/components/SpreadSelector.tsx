// apps/web/src/components/SpreadSelector.tsx
import React, { useState } from 'react';
import { Cell, List } from '@telegram-apps/telegram-ui';
import { Spread } from '../types';

const difficultyLabel: Record<string, string> = {
  easy: '🟢 легко',
  medium: '🟡 средне',
  hard: '🔴 сложно',
};

export default function SpreadSelector({
  spreads,
  onSelect,
}: {
  spreads: Spread[];
  onSelect: (spread: Spread) => void;
}) {
  const [activeId, setActiveId] = useState(spreads[0]?.id ?? '');

  return (
    <List>
      {spreads.map((s) => (
        <Cell
          key={s.id}
          onClick={() => {
            setActiveId(s.id);
            onSelect(s);
          }}
          subtitle={s.description}
        >
          <div className={`cellRow ${activeId === s.id ? 'active' : ''}`}>
            <span className="emojiBig">{s.icon}</span>
            <div className="grow">
              <div className="titleLine">
                <span className="title">{s.name}</span>
                <span className="pill">{difficultyLabel[s.difficulty]}</span>
              </div>
              <div className="meta">{s.positions.length} карт</div>
            </div>
          </div>
        </Cell>
      ))}
    </List>
  );
}
