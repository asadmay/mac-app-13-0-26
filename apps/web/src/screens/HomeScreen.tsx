// apps/web/src/screen/HomeScreen.tsx
import { useNavigate } from 'react-router-dom';
import { Page } from '@/ui/components/Page';

type ActionCardProps = {
  title: string;
  subtitle: string;
  emoji: string;
  onClick: () => void;
};

function ActionCard({ title, subtitle, emoji, onClick }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--app-secondary-bg)',
        color: 'var(--app-text)',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        gap: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 28, lineHeight: '28px' }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7, lineHeight: 1.35 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ opacity: 0.35, fontSize: 18, lineHeight: '18px' }}>›</div>
    </button>
  );
}

export function HomeScreen() {
  const nav = useNavigate();

  return (
    <Page
      title="МАК Практика"
      subtitle="Выбери формат — приложение поведёт тебя по шагам."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* v2 - Карта дня */}
        <ActionCard
          emoji="☀️"
          title="Карта дня"
          subtitle="Быстрый фокус дня: карта → ассоциации → микрошаг."
          onClick={() => nav('/daily')}
        />
        
        {/* v1 - Расклады */}
        <ActionCard
          emoji="🎴"
          title="Расклад карт"
          subtitle="Полноценные расклады: выбор колоды, позиций, заметки."
          onClick={() => nav('/spread')}
        />
        
        {/* v1 - Практики */}
        <ActionCard
          emoji="🧠"
          title="Практики"
          subtitle="Готовые сценарии: утренний чек-ин, решения, ясность."
          onClick={() => nav('/practices')}
        />
        
        {/* Общий журнал */}
        <ActionCard
          emoji="📓"
          title="Журнал"
          subtitle="Все сохранённые расклады и карты дня."
          onClick={() => nav('/journal')}
        />
        
        <ActionCard
          emoji="⚙️"
          title="Профиль"
          subtitle="Настройки, Premium, экспорт, рефералы."
          onClick={() => nav('/profile')}
        />
      </div>

      <div style={{ height: 14 }} />
      
      <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.35 }}>
        Подсказка: если ты только начинаешь, открой «Карту дня» — это самый быстрый путь
        получить понятный результат.
      </div>
    </Page>
  );
}