// apps/web/src/pages/HistoryPage.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Placeholder, Section, Snackbar } from '@telegram-apps/telegram-ui';
import { useSessions } from '@/hooks/useSessions';
import { Page } from '@/ui/components/Page';

type Status = { message: string; type: 'success' | 'error' } | null;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function HistoryPage() {
  const { exportJson, importJson, clear, sessions, freeCards } = useSessions();

  const [buffer, setBuffer] = useState('');
  const [status, setStatus] = useState<Status>(null);

  const subtitle = useMemo(
    () => `Сессий: ${sessions.length} · Свободных карт: ${freeCards.length}`,
    [sessions.length, freeCards.length],
  );

  const setOk = useCallback((message: string) => setStatus({ message, type: 'success' }), []);
  const setErr = useCallback((message: string) => setStatus({ message, type: 'error' }), []);

  const doExport = useCallback(() => {
    try {
      const data = exportJson();
      setBuffer(data);
      setOk('Экспорт готов. Можно скопировать или скачать файл.');
    } catch (e) {
      setErr(`Ошибка экспорта: ${e instanceof Error ? e.message : 'неизвестно'}`);
    }
  }, [exportJson, setOk, setErr]);

  const copyToClipboard = useCallback(async () => {
    try {
      const data = buffer?.trim() ? buffer : exportJson();
      await navigator.clipboard.writeText(data);
      if (!buffer?.trim()) setBuffer(data);
      setOk('Скопировано в буфер обмена.');
    } catch (e) {
      setErr(`Не удалось скопировать: ${e instanceof Error ? e.message : 'неизвестно'}`);
    }
  }, [buffer, exportJson, setOk, setErr]);

  const downloadExport = useCallback(() => {
    try {
      const data = buffer?.trim() ? buffer : exportJson();
      if (!buffer?.trim()) setBuffer(data);

      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `mak-backup-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      setOk('Файл скачан.');
    } catch (e) {
      setErr(`Ошибка скачивания: ${e instanceof Error ? e.message : 'неизвестно'}`);
    }
  }, [buffer, exportJson, setOk, setErr]);

  const doImport = useCallback(() => {
    const text = buffer.trim();
    if (!text) {
      setErr('Вставь JSON в поле ниже и нажми «Импорт».');
      return;
    }

    try {
      const result = importJson(text);
      setOk(`Импорт выполнен. Загружено сессий: ${result.count || 0}.`);
      setBuffer('');
    } catch (e) {
      setErr(`${e instanceof Error ? e.message : 'Ошибка импорта'}`);
    }
  }, [buffer, importJson, setOk, setErr]);

  const doClear = useCallback(() => {
    const confirmed = window.confirm(
      'Удалить все локальные данные приложения на этом устройстве?\n\nДействие необратимо.',
    );
    if (!confirmed) return;

    try {
      clear();
      setOk('Данные очищены.');
      setBuffer('');
    } catch (e) {
      setErr(`Ошибка очистки: ${e instanceof Error ? e.message : 'неизвестно'}`);
    }
  }, [clear, setOk, setErr]);

  return (
    <Page title="История и данные" subtitle={subtitle}>
      <div className="pageContent">
        <Section
          header="🗂️ Управление данными"
          footer="Совет: регулярно делай резервные копии. JSON можно хранить в заметках или на диске."
        >
          <div className="rowWrap" style={{ marginBottom: 12 }}>
            <Button mode="outline" onClick={doExport}>
              Сформировать экспорт
            </Button>
            <Button onClick={copyToClipboard}>Скопировать</Button>
            <Button onClick={downloadExport}>Скачать файл</Button>
            <Button mode="outline" onClick={doImport}>
              Импорт
            </Button>
            <Button mode="outline" onClick={doClear}>
              Очистить
            </Button>
          </div>

          {!buffer.trim() ? (
            <Placeholder
              header="Экспорт / импорт"
              description="Нажми «Сформировать экспорт» или вставь JSON для импорта."
            />
          ) : null}

          <textarea
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            placeholder="Тут будет экспорт или сюда вставь JSON для импорта…"
            className="textarea textareaMono"
            aria-label="JSON для экспорта/импорта"
          />
        </Section>

        {status && (
          <Snackbar
            onClose={() => setStatus(null)}
            duration={4500}
            description={status.message}
          />
        )}
      </div>
    </Page>
  );
}
