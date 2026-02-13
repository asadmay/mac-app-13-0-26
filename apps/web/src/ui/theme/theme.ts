export type TgColorScheme = 'light' | 'dark';

export type TgThemeParams = Partial<{
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color: string;
  bottom_bar_bg_color: string;
  accent_text_color: string;
  section_bg_color: string;
  section_header_text_color: string;
  section_separator_color: string;
  subtitle_text_color: string;
  destructive_text_color: string;
}>;

export type SafeAreaInset = Partial<{
  top: number;
  bottom: number;
  left: number;
  right: number;
}>;

type TgWebApp = {
  colorScheme?: TgColorScheme;
  themeParams?: TgThemeParams;
  safeAreaInset?: SafeAreaInset;
  contentSafeAreaInset?: SafeAreaInset;
};

function getWebApp(): TgWebApp | null {
  const w = window as unknown as { Telegram?: { WebApp?: TgWebApp } };
  return w.Telegram?.WebApp ?? null;
}

export function getTgColorScheme(): TgColorScheme {
  return getWebApp()?.colorScheme === 'dark' ? 'dark' : 'light';
}

export function getTgThemeParams(): TgThemeParams {
  return getWebApp()?.themeParams ?? {};
}

/**
 * Safe-area:
 * - safeAreaInset: системные области (вырезы/навигация)
 * - contentSafeAreaInset: области, свободные от UI Telegram
 */
export function getTgSafeAreaInset(): SafeAreaInset {
  return getWebApp()?.safeAreaInset ?? {};
}

export function getTgContentSafeAreaInset(): SafeAreaInset {
  return getWebApp()?.contentSafeAreaInset ?? {};
}

/**
 * Возвращает удобные CSS-переменные Telegram, чтобы использовать их в стилях.
 * Telegram сам выставляет эти переменные, мы просто “подсказываем” значения по умолчанию.
 */
export function getTgCssVarsFallback() {
  const p = getTgThemeParams();

  return {
    '--app-bg': p.bg_color ?? 'var(--tg-theme-bg-color, #ffffff)',
    '--app-text': p.text_color ?? 'var(--tg-theme-text-color, #111111)',
    '--app-hint': p.hint_color ?? 'var(--tg-theme-hint-color, #777777)',
    '--app-button': p.button_color ?? 'var(--tg-theme-button-color, #3390ec)',
    '--app-button-text': p.button_text_color ?? 'var(--tg-theme-button-text-color, #ffffff)',
    '--app-secondary-bg': p.secondary_bg_color ?? 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
  } as const;
}
