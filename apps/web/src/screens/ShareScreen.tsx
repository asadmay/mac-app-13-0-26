// apps/web/src/screen/ShareScreen.tsx
import React, { useMemo, useState } from 'react';
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

// TODO: позже вынесем в конфиг и будем подставлять из API
const BOT_USERNAME = 'YOUR_BOT_USERNAME';
const STARTAPP_PAYLOAD = 'from_share';

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

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return '';
  }
}

function tgShowAlert(message: string) {
  const w = window as unknown as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } };
  const fn = w.Telegram?.WebApp?.showAlert;
  if (fn) fn(message);
  else alert(message);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    tgShowAlert('Скопировано.');
  } catch {
    // fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      tgShowAlert('Скопировано.');
    } catch {
      tgShowAlert('Не удалось скопировать. Выдели текст и скопируй вручную.');
    }
  }
}

function shareToStory(mediaUrl: string, text?: string) {
  const w = window as unknown as {
    Telegram?: {
      WebApp?: {
        shareToStory?: (media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => void;
      };
    };
  };

  const fn = w.Telegram?.WebApp?.shareToStory;
  if (!fn) {
    tgShowAlert('shareToStory недоступен: открой Mini App внутри Telegram (и проверь версию).');
    return;
  }

  fn(mediaUrl, {
    text: text?.slice(0, 180) ?? '',
    widget_link: {
      url: `https://t.me/${BOT_USERNAME}?startapp=${encodeURIComponent(STARTAPP_PAYLOAD)}`,
      name: 'Открыть МАК'
    }
  });
}

function shareMessage(msgId: string) {
  const w = window as unknown as {
    Telegram?: {
      WebApp?: {
        shareMessage?: (msg_id: string, cb?: (sent: boolean) => void) => void;
      };
    };
  };

  const fn = w.Telegram?.WebApp?.shareMessage;
  if (!fn) {
    tgShowAlert('shareMessage недоступен: открой Mini App внутри Telegram (и проверь версию).');
    return;
  }

  fn(msgId, (sent) => {
    tgShowAlert(sent ? 'Сообщение отправлено.' : 'Отменено.');
  });
}

export function ShareScreen() {
  const nav = useNavigate();

  const last = useMemo(() => {
    const items = readJournal();
    return items[0] ?? null;
  }, []);

  const deepLink = useMemo(() => {
    if (!BOT_USERNAME || BOT_USERNAME === 'YOUR_BOT_USERNAME') return 'https://t.me/your_bot?startapp=from_share';
    return `https://t.me/${BOT_USERNAME}?startapp=${encodeURIComponent(STARTAPP_PAYLOAD)}`;
  }, []);

  const exportText = useMemo(() => {
    if (!last) {
      return [
        'МАК Практика',
        '',
        'Пока нет сохранённых записей.',
        'Сделай “Карту дня” и сохрани результат — затем вернись сюда.',
        '',
        `Открыть Mini App: ${deepLink}`
      ].join('\n');
    }

    const assoc = [last.a1, last.a2, last.a3].filter(Boolean).join(', ') || '—';

    return [
      'МАК Практика — Карта дня',
      `Дата: ${last.dateISO} (${fmtDate(last.createdAt)})`,
      '',
      `Карта: ${last.card.title}`,
      `Вопрос: ${last.card.prompt}`,
      '',
      `Ассоциации: ${assoc}`,
      '',
      `Микрошаг: ${last.microStep || '—'}`,
      '',
      `Итог: ${last.summary || '—'}`,
      '',
      `Открыть Mini App: ${deepLink}`
    ].join('\n');
  }, [deepLink, last]);

  const [msgId, setMsgId] = useState(''); // для shareMessage тестом

  // Для story нужен HTTPS media_url.
  // Пока нет реального рендера картинки — используем тестовую заглушку.
  const demoStoryMediaUrl = 'https://picsum.photos/720/1280';

  return (
    <Page title="Экспорт и шеринг" subtitle="Скопируй текст или поделись в Telegram.">
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
          Журнал
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
            fontWeight: 800
          }}
        >
          Premium
        </button>
      </div>

      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'var(--app-secondary-bg)',
          borderRadius: 16,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 900 }}>Текстовый экспорт</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
          Подходит для пересылки в чат/заметки. PNG/PDF подключим позже (Premium).
        </div>

        <div style={{ height: 10 }} />

        <textarea
          value={exportText}
          readOnly
          rows={14}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '12px 12px',
            background: 'rgba(0,0,0,0.02)',
            color: 'var(--app-text)',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.35,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12
          }}
        />

        <div style={{ height: 10 }} />

        <button
          type="button"
          onClick={() => copyToClipboard(exportText)}
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
          Скопировать текст
        </button>
      </div>

      <div style={{ height: 12 }} />

      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'var(--app-secondary-bg)',
          borderRadius: 16,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 900 }}>Поделиться в Telegram</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
          Это MVP‑кнопки. Для сторис нужен URL изображения (HTTPS), а для shareMessage — msg_id от бота.
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => shareToStory(demoStoryMediaUrl, last?.summary || 'Мой итог дня')}
            style={{
              width: '100%',
              border: '1px solid rgba(0,0,0,0.12)',
              background: 'transparent',
              color: 'var(--app-text)',
              borderRadius: 14,
              padding: '12px 14px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Поделиться в сторис (demo)
          </button>

          <div
            style={{
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 14,
              padding: 12,
              background: 'rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              shareMessage: вставь msg_id (мы начнём генерировать его ботом на следующем этапе).
            </div>

            <div style={{ height: 8 }} />

            <input
              value={msgId}
              onChange={(e) => setMsgId(e.target.value)}
              placeholder="msg_id"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                padding: '10px 12px',
                background: 'var(--app-secondary-bg)',
                color: 'var(--app-text)',
                outline: 'none'
              }}
            />

            <div style={{ height: 10 }} />

            <button
              type="button"
              onClick={() => {
                if (!msgId.trim()) {
                  tgShowAlert('Сначала вставь msg_id.');
                  return;
                }
                shareMessage(msgId.trim());
              }}
              style={{
                width: '100%',
                border: 'none',
                background: 'var(--app-button)',
                color: 'var(--app-button-text)',
                borderRadius: 12,
                padding: '10px 12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Поделиться сообщением (msg_id)
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
        Важно: методы Telegram для открытия ссылок/шеринга должны вызываться по действию пользователя (клик по кнопке).
      </div>
    </Page>
  );
}
