'use client';

/**
 * ThemeProvider — React Context for dark/light theming.
 * [design §6.2] [spec 6.4] [spec 6.8]
 *
 * Initial theme priority (matches the inline no-flash script in
 * [locale]/layout.tsx): localStorage → prefers-color-scheme → 'dark'.
 *
 * Re-applies theme class on every render via useLayoutEffect — required
 * because <html> lives inside [locale]/layout.tsx and React strips the
 * imperative `dark`/`light` class on locale-change re-renders (the JSX
 * className only carries font CSS variables, no theme).
 * [bugfix sdd/portfolio-v1/locale-toggle-theme-bug]
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Read persisted theme — same priority chain as the inline no-flash script.
 * [spec 6.8] localStorage → prefers-color-scheme → 'dark'
 */
function readPersistedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable (private browsing) — fall through
  }
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

// useLayoutEffect on client; useEffect on server (no-op during SSR — avoids React warning).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readPersistedTheme);

  const setTheme = useCallback((next: Theme) => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(next);
    html.style.colorScheme = next;

    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // private browsing — silent
    }

    setThemeState(next);
  }, []);

  // Re-apply theme class on every commit. Necessary because [locale]/layout.tsx
  // re-renders on navigation (e.g. locale change), and React's declarative
  // className on <html> (`${fontVars}`) overwrites imperative classList changes.
  // useLayoutEffect runs synchronously before browser paints — prevents flash.
  // Idempotent: only touches DOM if the class is missing.
  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains(theme)) {
      html.classList.remove('dark', 'light');
      html.classList.add(theme);
      html.style.colorScheme = theme;
    }
  });

  // Sync state if theme is changed externally (e.g. OS preference change),
  // but only when the user has no localStorage preference.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = () => {
      try {
        if (!window.localStorage.getItem('theme')) {
          setTheme(mq.matches ? 'light' : 'dark');
        }
      } catch {
        // ignore
      }
    };
    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  }, [setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
