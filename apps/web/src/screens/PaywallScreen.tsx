// apps/web/src/screen/PaywallScreen.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/ui/components/Page';

type Tab = 'sub' | 'oneoff';

type Plan = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  primary?: boolean;
  kind: 'sub' | 'oneoff';
};

function tryOpenInvoice(url: string) {
  const w = window as unknown as {
    Telegram?: {
      WebApp?: {
        openInvoice?: (url: string, cb?: (status: string) => void) => void;
        showAlert?: (message: string) => void;
      };
    };
  };

  const openInvoice = w.Telegram?.WebApp?.openInvoice;
  if (openInvoice) {
    openInvoice(url, (status) => {
      // status может быть: paid/cancelled/failed/pending (зависит от провайдера)
      w.Telegram?.WebApp?.showAlert?.(`Инвойс закрыт. Статус: ${status}`);
    });
    return;
  }

  alert('openInvoice недоступен: открой Mini App внутри Telegram.');
}

function Card({
  title,
  subtitle,
  right,
  onClick,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? 'button' : undefined}
      onClick={onClick}
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--app-secondary-bg)',
        borderRadius: 16,
        padding: 14,
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.2 }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
            {subtitle}
          </div>
        </div>
        {right ? <div style={{ alignSelf: 'center' }}>{right}</div> : null}
      </div>
    </div>
  );
}

export function PaywallScreen() {
  const nav = useNavigate();

  const [tab, setTab] = useState<Tab>('sub');

  const benefits = useMemo(
    () => [
      'Премиум‑колоды (включая авторские).',
      'Видео‑карты (6 секунд) — “карты оживают”.',
      'Экспорт в картинку и PDF.',
      'Безлимитный журнал и история.',
      'Пакеты раскладов и уникальные методологии автора.',
    ],
    [],
  );

  const plans: Plan[] = useMemo(
    () => [
      {
        id: 'sub_month',
        kind: 'sub',
        title: 'Premium — месяц',
        subtitle: 'Все функции Premium, обновления и новые колоды.',
        priceLabel: '299 ₽/мес',
      },
      {
        id: 'sub_year',
        kind: 'sub',
        title: 'Premium — год',
        subtitle: 'Лучший выбор для практики: все функции Premium на год.',
        priceLabel: '1990 ₽/год',
        primary: true,
      },
      {
        id: 'deck_author_1',
        kind: 'oneoff',
        title: 'Колода «Авторская #1»',
        subtitle: 'Купить навсегда. Входит в Premium.',
        priceLabel: '490 ₽',
      },
      {
        id: 'method_pack_1',
        kind: 'oneoff',
        title: 'Методология автора: «Решения»',
        subtitle: 'Пакет раскладов + сценарии вопросов. Купить навсегда. Входит в Premium.',
        priceLabel: '590 ₽',
      },
      {
        id: 'spread_bundle_1',
        kind: 'oneoff',
        title: 'Пакет раскладов: «7 дней ясности»',
        subtitle: 'Недельная практика “Карта дня” с прогрессом. Купить навсегда. Входит в Premium.',
        priceLabel: '390 ₽',
      },
    ],
    [],
  );

  const visiblePlans = plans.filter((p) => p.kind === tab);

  return (
    <Page
      title="Premium"
      subtitle="Глубокая практика: колоды, видео‑карты, экспорт, журнал, методологии."
    >
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
            cursor: 'pointer',
          }}
        >
          На главную
        </button>

        <button
          type="button"
          onClick={() => nav('/profile')}
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer',
          }}
        >
          Профиль
        </button>
      </div>

      <Card
        title="Что входит в Premium"
        subtitle=""
        right={<div style={{ opacity: 0.55, fontSize: 12 }}>5 пунктов</div>}
      />

      <div style={{ height: 10 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {benefits.map((b, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ marginTop: 2, opacity: 0.7 }}>•</div>
            <div style={{ fontSize: 13, lineHeight: 1.35, opacity: 0.85 }}>{b}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 14 }} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => setTab('sub')}
          style={{
            flex: 1,
            border: tab === 'sub' ? '1px solid rgba(0,0,0,0.22)' : '1px solid rgba(0,0,0,0.12)',
            background: tab === 'sub' ? 'rgba(0,0,0,0.06)' : 'transparent',
            color: 'var(--app-text)',
            borderRadius: 999,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: tab === 'sub' ? 900 : 700,
          }}
        >
          Подписка
        </button>

        <button
          type="button"
          onClick={() => setTab('oneoff')}
          style={{
            flex: 1,
            border:
              tab === 'oneoff' ? '1px solid rgba(0,0,0,0.22)' : '1px solid rgba(0,0,0,0.12)',
            background: tab === 'oneoff' ? 'rgba(0,0,0,0.06)' : 'transparent',
            color: 'var(--app-text)',
            borderRadius: 999,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: tab === 'oneoff' ? 900 : 700,
          }}
        >
          Купить навсегда
        </button>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visiblePlans.map((p) => {
          const price = (
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 999,
                border: p.primary ? 'none' : '1px solid rgba(0,0,0,0.10)',
                background: p.primary ? 'var(--app-button)' : 'rgba(0,0,0,0.03)',
                color: p.primary ? 'var(--app-button-text)' : 'var(--app-text)',
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {p.priceLabel}
            </div>
          );

          return (
            <Card
              key={p.id}
              title={p.title}
              subtitle={p.subtitle}
              right={price}
              onClick={() => {
                // Пока вместо реальных ссылок: заглушка.
                // Дальше свяжем с API/bot: получить invoice link и открыть через openInvoice.
                const fakeInvoiceUrl = 'https://example.com/invoice';
                tryOpenInvoice(fakeInvoiceUrl);
              }}
            />
          );
        })}
      </div>

      <div style={{ height: 12 }} />

      <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
        Оплата будет открываться внутри Telegram через инвойс, а статус покупки мы будем получать после
        закрытия инвойса. [web:55]
      </div>
    </Page>
  );
}
