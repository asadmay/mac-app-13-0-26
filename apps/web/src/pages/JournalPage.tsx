// apps/web/src/pages/JournalPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Cell, List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { useSessions } from '@/hooks/useSessions';
import { Session } from '@/types';
import SessionModal from '@/components/SessionModal';
import { Page } from '@/ui/components/Page';
import { storageGetJson } from '@/lib/storage';

type TabId = 'spreads' | 'free' | 'daily';

type DailyEntry = {
  id: string;
  kind: 'daily';
  createdAt: number;
  dateISO: string;
  card: { title: string };
  summary: string;
};

const DAILY_JOURNAL_KEY = 'mak:journal:v1';

function formatRuDateTime(ts: number) {
  return new Date(ts).toLocaleString('ru-RU');
}

export default function JournalPage() {
  const { sessions, freeCards, removeSession, removeFreeCard } = useSessions();

  const [activeTab, setActiveTab] = useState<TabId>('spreads');
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const loadDailyEntries = useCallback(
    () => storageGetJson<DailyEntry[]>(DAILY_JOURNAL_KEY, []),
    [],
  );

  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>(() => loadDailyEntries());

  // Мягкое обновление списка “карт дня” при переключении вкладки.
  useEffect(() => {
    if (activeTab === 'daily') {
      setDailyEntries(loadDailyEntries());
    }
  }, [activeTab, loadDailyEntries]);

  const tabs = useMemo(
    () =>
      [
        { id: 'spreads' as const, label: `🧩 Расклады (${sessions.length})` },
        { id: 'daily' as const, label: `☀️ Карты дня (${dailyEntries.length})` },
        { id: 'free' as const, label: `🎴 Свободные (${freeCards.length})` },
      ] satisfies Array<{ id: TabId; label: string }>,
    [sessions.length, dailyEntries.length, freeCards.length],
  );

  const emptySessions = sessions.length === 0;
  const emptyFreeCards = freeCards.length === 0;
  const emptyDaily = dailyEntries.length === 0;

  return (
    <Page title="Журнал" subtitle="Все сохранённые расклады, карты и практики.">
      <div className="pageContent">
        {/* Tabs */}
        <div className="segmented" role="tablist" aria-label="Разделы журнала">
          {tabs.map((t) => {
            const selected = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`segmentedBtn ${selected ? 'segmentedBtnActive' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Spreads */}
        {activeTab === 'spreads' && (
          <List>
            <Section
              header="📝 Журнал раскладов"
              footer={emptySessions ? undefined : 'Нажми на сессию, чтобы посмотреть детали.'}
            >
              {emptySessions ? (
                <Placeholder
                  header="Пока пусто"
                  description="Сохрани первый расклад — и он появится здесь."
                />
              ) : (
                sessions.map((s) => (
                  <Cell
                    key={s.id}
                    onClick={() => setActiveSession(s)}
                    subtitle={formatRuDateTime(s.createdAt)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{s.deckName}</span>
                      <span>·</span>
                      <span>{s.spreadName}</span>
                      {s.practiceTitle ? (
                        <span className="badge">{s.practiceTitle}</span>
                      ) : null}
                    </div>
                  </Cell>
                ))
              )}
            </Section>
          </List>
        )}

        {/* Daily */}
        {activeTab === 'daily' && (
          <List>
            <Section
              header="☀️ Карты дня"
              footer={
                emptyDaily
                  ? undefined
                  : 'Если ты добавил(а) новую карту дня — нажми «Обновить».'
              }
            >
              <div className="rowWrap" style={{ margin: '0 0 10px' }}>
                <Button
                  mode="outline"
                  size="s"
                  onClick={() => setDailyEntries(loadDailyEntries())}
                >
                  Обновить
                </Button>
              </div>

              {emptyDaily ? (
                <Placeholder
                  header="Нет записей"
                  description="Перейди в раздел «Карта дня» и сохрани результат."
                />
              ) : (
                dailyEntries
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((entry) => (
                    <Cell
                      key={entry.id}
                      subtitle={formatRuDateTime(entry.createdAt)}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{entry.card.title}</div>
                        <div className="smallText">
                          {entry.summary?.trim() ? entry.summary : 'Без итога'}
                        </div>
                      </div>
                    </Cell>
                  ))
              )}
            </Section>
          </List>
        )}

        {/* Free */}
        {activeTab === 'free' && (
          <Section
            header="🎴 Свободные карты"
            footer={
              emptyFreeCards
                ? undefined
                : 'Совет: удаляй карточки, которые больше не актуальны, чтобы журнал оставался чистым.'
            }
          >
            {emptyFreeCards ? (
              <Placeholder
                header="Пока нет свободных карт"
                description="Перейди в «Расклад» → «Свободно», вытяни карту и сохрани заметку."
              />
            ) : (
              <div className="freeGrid">
                {freeCards
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((card) => (
                    <div key={card.id} className="freeCard">
                      <img
                        src={card.imageUrl}
                        alt={`Карта: ${card.keywords.slice(0, 3).join(', ')}`}
                        style={{
                          width: '100%',
                          aspectRatio: '3/4',
                          objectFit: 'cover',
                          borderRadius: 12,
                        }}
                        loading="lazy"
                      />

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {card.keywords.slice(0, 6).map((k) => (
                          <span key={k} className="freeKeyword">
                            #{k}
                          </span>
                        ))}
                      </div>

                      {card.note ? <div style={{ fontSize: 13 }}>{card.note}</div> : null}

                      <div className="smallText">{formatRuDateTime(card.createdAt)}</div>

                      <Button
                        mode="outline"
                        size="s"
                        onClick={() => removeFreeCard(card.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </Section>
        )}

        {/* Modal */}
        {activeSession && (
          <SessionModal
            session={activeSession}
            onClose={() => setActiveSession(null)}
            onDelete={() => {
              removeSession(activeSession.id);
              setActiveSession(null);
            }}
          />
        )}
      </div>
    </Page>
  );
}
