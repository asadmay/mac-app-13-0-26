// apps/web/src/screen/JournalScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/ui/components/Page';

type DailyCard = {
  id: string;
  title: string;
  prompt: string;
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

function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(ts);
  }
}

type EntryCardProps = {
  entry: DailyEntry;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

function EntryCard({ entry, isOpen, onToggle, onDelete }: EntryCardProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--app-secondary-bg)',
        borderRadius: 16,
        padding: 14
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          border: 'none',
          background: 'transparent',
          color: 'var(--app-text)',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            {entry.summary || 'Без итога'}
          </div>
          <div style={{ opacity: 0.45, fontSize: 18, lineHeight: '18px' }}>{isOpen ? '˄' : '˅'}</div>
        </div>

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65, lineHeight: 1.35 }}>
          {entry.dateISO} · {fmtDateTime(entry.createdAt)}
        </div>

        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8, lineHeight: 1.35 }}>
          Карта: <strong>{entry.card.title}</strong>
        </div>
      </button>

      {isOpen && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>{entry.card.prompt}</div>

          <div
            style={{
              borderRadius: 14,
              padding: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Ассоциации</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[entry.a1, entry.a2, entry.a3]
                .filter(Boolean)
                .map((x, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(0,0,0,0.10)',
                      background: 'rgba(0,0,0,0.03)',
                      fontSize: 12
                    }}
                  >
                    {x}
                  </span>
                ))}
              {[entry.a1, entry.a2, entry.a3].filter(Boolean).length === 0 && (
                <span style={{ fontSize: 12, opacity: 0.6 }}>—</span>
              )}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              padding: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Микрошаг</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.4 }}>
              {entry.microStep || <span style={{ opacity: 0.6 }}>—</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onDelete}
              style={{
                border: '1px solid rgba(255,0,0,0.25)',
                background: 'transparent',
                color: 'var(--app-text)',
                borderRadius: 12,
                padding: '10px 12px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function JournalScreen() {
  const nav = useNavigate();

  const [items, setItems] = useState<DailyEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setItems(readJournal());
  }, []);

  const count = useMemo(() => items.length, [items]);

  function reload() {
    setItems(readJournal());
  }

  function clearAll() {
    const ok = window.confirm('Точно очистить весь журнал?');
    if (!ok) return;
    writeJournal([]);
    setOpenId(null);
    reload();
  }

  function deleteOne(id: string) {
    const next = items.filter((x) => x.id !== id);
    writeJournal(next);
    setOpenId((cur) => (cur === id ? null : cur));
    setItems(next);
  }

  return (
    <Page title="Журнал" subtitle={count ? `Сохранено: ${count}` : 'Пока пусто. Сохрани первую практику.'}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => nav('/')}
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer'
          }}
        >
          На главную
        </button>

        <button
          type="button"
          onClick={() => nav('/daily')}
          style={{
            border: 'none',
            background: 'var(--app-button)',
            color: 'var(--app-button-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Карта дня
        </button>

        <button
          type="button"
          onClick={clearAll}
          disabled={!items.length}
          style={{
            marginLeft: 'auto',
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: items.length ? 'pointer' : 'not-allowed',
            opacity: items.length ? 1 : 0.5
          }}
        >
          Очистить
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            isOpen={openId === entry.id}
            onToggle={() => setOpenId((cur) => (cur === entry.id ? null : entry.id))}
            onDelete={() => deleteOne(entry.id)}
          />
        ))}
      </div>
    </Page>
  );
}
