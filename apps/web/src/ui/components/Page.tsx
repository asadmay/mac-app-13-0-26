// apps/web/src/ui/components/Page.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTgCssVarsFallback } from '@/ui/theme/theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;

  homePath?: string;
  hideNav?: boolean;
};

type TgBackButton = {
  show?: () => void;
  hide?: () => void;
  onClick?: (cb: () => void) => void;
  offClick?: (cb: () => void) => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton?: TgBackButton;
      };
    };
  }
}

export function Page({ title, subtitle, children, homePath = '/', hideNav }: Props) {
  const cssVars = getTgCssVarsFallback();
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname || '/';

  const isHome = useMemo(() => {
    // HashRouter: /#/journal -> pathname "/journal", home -> "/"
    return pathname === homePath || pathname === '' || pathname === '/';
  }, [pathname, homePath]);

  const goHome = useCallback(() => {
    navigate(homePath);
  }, [navigate, homePath]);

  const goBack = useCallback(() => {
    if (window.history.length <= 1) {
      navigate(homePath, { replace: true });
      return;
    }
    navigate(-1);
  }, [navigate, homePath]);

  // Telegram native BackButton (в шапке Telegram)
  useEffect(() => {
    const bb = window.Telegram?.WebApp?.BackButton;
    if (!bb?.show || !bb?.hide || !bb?.onClick || !bb?.offClick) return;

    const handler = () => goBack();

    // show/hide + onClick/offClick — ожидаемая модель BackButton. [web:188][web:187]
    if (isHome) {
      bb.offClick(handler);
      bb.hide();
      return;
    }

    bb.show();
    bb.onClick(handler);

    return () => {
      bb.offClick(handler);
    };
  }, [isHome, goBack]);

  return (
    <div
      style={{
        height: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        margin: 0,

        background: 'var(--app-secondary-bg)',
        color: 'var(--app-text)',

        paddingTop: 'calc(14px + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom: 'calc(18px + var(--tg-content-safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(14px + var(--tg-content-safe-area-inset-left, 0px))',
        paddingRight: 'calc(14px + var(--tg-content-safe-area-inset-right, 0px))',

        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',

        ...cssVars,
      }}
    >
      {/* Локальный стиль только для навигационных кнопок */}
      <style>
        {`
          .pageNav {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }
          /* Убираем "лишнее" потемнение именно у этих кнопок на desktop */
          @media (hover: hover) and (pointer: fine) {
            .pageNav .pageNavBtn:hover {
              filter: none !important;
              opacity: 0.96;
            }
          }
        `}
      </style>

      {!hideNav && !isHome && (
        <div className="pageNav">
          <Button
            className="pageNavBtn"
            mode="outline"
            size="s"
            onClick={goBack}
            aria-label="Назад"
          >
            ← Назад
          </Button>

          <Button
            className="pageNavBtn"
            mode="filled"
            size="s"
            onClick={goHome}
            aria-label="На главную"
          >
            ⌂ На главную
          </Button>
        </div>
      )}

      {(title || subtitle) && (
        <div style={{ marginBottom: 14 }}>
          {title ? (
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
          ) : null}

          {subtitle ? (
            <div className="smallText" style={{ marginTop: 6, lineHeight: 1.35 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      )}

      {children}
    </div>
  );
}
