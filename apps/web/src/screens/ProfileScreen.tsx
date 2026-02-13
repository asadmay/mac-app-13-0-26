// apps/web/src/screen/ProfileScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/ui/components/Page';

type DailyMode = 'short' | 'standard' | 'deep';

type SettingsV1 = {
  dailyMode: DailyMode;
};

const SETTINGS_KEY = 'mak:settings:v1';

function readSettings(): SettingsV1 {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { dailyMode: 'standard' };
    const s = JSON.parse(raw) as Partial<SettingsV1>;
    return {
      dailyMode: s.dailyMode === 'short' || s.dailyMode === 'deep' || s.dailyMode === 'standard'
        ? s.dailyMode
        : 'standard'
    };
  } catch {
    return { dailyMode: 'standard' };
  }
}

function writeSettings(next: SettingsV1) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function getStartParam(): string | null {
  // 1) Нативно из WebApp.start_param (если доступно)
  const w = window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string } } } };
  const fromUnsafe = w.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (typeof fromUnsafe === 'string' && fromUnsafe.trim()) return fromUnsafe.trim();

  // 2) Из query параметра tgWebAppStartParam (на вебе/в некоторых режимах)
  try {
    const url = new URL(window.location.href);
    const p = url.searchParams.get('tgWebAppStartParam');
    if (p && p.trim()) return p.trim();
  } catch {
    // ignore
  }

  return null;
}

export function ProfileScreen() {
  const nav = useNavigate();

  const [settings, setSettings] = useState<SettingsV1>(() => readSettings());
  const startParam = useMemo(() => getStartParam(), []);

  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  const dailyModeLabel: Record<DailyMode, string> = {
    short: 'Короткий',
    standard: 'Стандарт',
    deep: 'Глубокий'
  };

  return (
    <Page title="Профиль" subtitle="Настройки, Premium и сервисные функции.">
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
          onClick={() => nav('/paywall')}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'var(--app-button)',
            color: 'var(--app-button-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Premium
        </button>
      </div>

      {/* Настройки "Карты дня" */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'var(--app-secondary-bg)',
          borderRadius: 16,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800 }}>Карта дня</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
          Выбери глубину сценария. (Позже мы будем также переключать это из админки.)
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['short', 'standard', 'deep'] as DailyMode[]).map((m) => {
            const active = settings.dailyMode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, dailyMode: m }))}
                style={{
                  border: active ? '1px solid rgba(0,0,0,0.22)' : '1px solid rgba(0,0,0,0.10)',
                  background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
                  color: 'var(--app-text)',
                  borderRadius: 999,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontWeight: active ? 800 : 600
                }}
              >
                {dailyModeLabel[m]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Premium / лимиты журнала (пока заглушка) */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'var(--app-secondary-bg)',
          borderRadius: 16,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800 }}>Premium</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
          Премиум-колоды, видео‑карты, экспорт PNG/PDF, безлимит журнал, пакеты раскладов и методологии автора.
        </div>

        <div style={{ height: 12 }} />

        <button
          type="button"
          onClick={() => nav('/paywall')}
          style={{
            width: '100%',
            border: 'none',
            background: 'var(--app-button)',
            color: 'var(--app-button-text)',
            borderRadius: 14,
            padding: '12px 14px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Открыть Premium
        </button>
      </div>

      <div style={{ height: 12 }} />

      {/* Рефералы / startapp (для проверки, MVP) */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'var(--app-secondary-bg)',
          borderRadius: 16,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800 }}>Рефералы (MVP)</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
          Параметр входа <span style={{ fontFamily: 'monospace' }}>startapp</span> (если открыли по реферальной ссылке).
        </div>

        <div style={{ height: 10 }} />

        <div
          style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 12,
            padding: 12,
            background: 'rgba(0,0,0,0.02)',
            fontFamily: 'monospace',
            fontSize: 12,
            wordBreak: 'break-word'
          }}
        >
          {startParam ?? '—'}
        </div>

        <div style={{ height: 10 }} />

        <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
          Позже: начисление бонусов будет происходить после “квалифицирующего действия” (например, сохранения первой практики).
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Служебные кнопки */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => nav('/share')}
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer'
          }}
        >
          Экспорт/Share
        </button>

        <button
          type="button"
          onClick={() => nav('/journal')}
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            color: 'var(--app-text)',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer'
          }}
        >
          Открыть журнал
        </button>
      </div>
    </Page>
  );
}
