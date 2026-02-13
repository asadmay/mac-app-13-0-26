// apps/web/src/pages/PracticesPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Section } from '@telegram-apps/telegram-ui'; // Telegram UI usage pattern (Section/Button) follows official getting started examples. [web:14]
import { PRACTICES } from '@/data/practices';
import { Practice, PracticeMode, PracticePreset } from '@/types';
import { Page } from '@/ui/components/Page';

interface PracticesPageProps {
  onStart: (preset: PracticePreset) => void;
}

export default function PracticesPage({ onStart }: PracticesPageProps) {
  const practices = useMemo(() => PRACTICES, []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode>('self');

  const active: Practice | null = useMemo(
    () => practices.find((p) => p.id === openId) ?? null,
    [openId, practices],
  );

  const close = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, close]);

  const start = useCallback(
    (p: Practice) => {
      onStart({
        practiceId: p.id,
        practiceTitle: p.title,
        practiceEmoji: p.emoji,
        practiceMode: mode,
        deckId: p.defaultDeckId,
        allowedDeckIds: p.allowedDeckIds,
        spreadId: p.recommendedSpreadId,
        question: p.defaultQuestion,
      });
    },
    [mode, onStart],
  );

  return (
    <Page title="Практики" subtitle="Выбери сценарий — приложение поведёт по шагам.">
      <div className="pageContent">
        <Section
          header="🧠 Практики"
          footer="Нажми на практику, чтобы открыть описание и выбрать режим."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {practices.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                type="button"
                className="cardButton"
                aria-label={`Открыть практику: ${p.title}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{p.emoji}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.15 }}>
                      {p.title}
                    </div>
                    <div className="smallText" style={{ marginTop: 4 }}>
                      ⏱ {p.durationMin} мин · 🎯 {p.goal}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.35, opacity: 0.95 }}>
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {active && (
          <div
            className="modalOverlay"
            onClick={close}
            role="presentation"
          >
            <div
              className="modalSheet"
              role="dialog"
              aria-modal="true"
              aria-label={`Практика: ${active.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, lineHeight: 1.2 }}>
                    <span style={{ fontSize: 18 }}>{active.emoji}</span>{' '}
                    {active.title}
                  </div>
                  <div className="smallText" style={{ marginTop: 4 }}>
                    {active.goal} · ⏱ {active.durationMin} мин
                  </div>
                </div>

                <Button mode="outline" size="s" onClick={close} aria-label="Закрыть">
                  ✕
                </Button>
              </div>

              {/* Mode */}
              <div className="segmented" role="tablist" aria-label="Режим практики">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'self'}
                  className={`segmentedBtn ${mode === 'self' ? 'segmentedBtnActive' : ''}`}
                  onClick={() => setMode('self')}
                >
                  Я сам(а)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'pro'}
                  className={`segmentedBtn ${mode === 'pro' ? 'segmentedBtnActive' : ''}`}
                  onClick={() => setMode('pro')}
                >
                  С клиентом
                </button>
              </div>

              <Section header="Как делать">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {active.steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 18, textAlign: 'center', opacity: 0.7 }}>•</div>
                      <div style={{ flex: 1, lineHeight: 1.35 }}>{s}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section header={mode === 'self' ? 'Вопросы для себя' : 'Вопросы ведущего'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(mode === 'self' ? active.selfPrompts : active.proPrompts).map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 18, textAlign: 'center', opacity: 0.7 }}>•</div>
                      <div style={{ flex: 1, lineHeight: 1.35 }}>{q}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="rowWrap" style={{ marginTop: 12 }}>
                <Button onClick={() => start(active)} aria-label="Начать практику">
                  Начать
                </Button>
                <Button mode="outline" onClick={close} aria-label="Закрыть окно практики">
                  Закрыть
                </Button>
              </div>

              <div className="smallText" style={{ textAlign: 'center', marginTop: 12 }}>
                По умолчанию: колода «Я есть». Расклад и вопрос подставятся автоматически.
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
