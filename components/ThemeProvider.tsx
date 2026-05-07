'use client';

/**
 * ThemeProvider — React Context for dark/light theming.
 * [design §6.2] [spec 6.4] [spec 6.8]
 *
 * Reads initial theme from document.documentElement.classList
 * (set before first paint by the inline no-flash script in layout.tsx).
 * Writes to localStorage on change.
 * Exposes { theme, setTheme } via ThemeContext.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
 * Reads the current theme from <html> class list.
 * Falls back to 'dark' if neither 'dark' nor 'light' is present.
 * [spec 6.8] priority: localStorage → prefers-color-scheme → 'dark'
 * (localStorage/media-query logic is handled by the inline script;
 *  here we just sync with whatever class is already on <html>.)
 */
function readThemeFromDOM(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialise from DOM class (set by the no-flash inline script) [design §6.1]
  const [theme, setThemeState] = useState<Theme>(readThemeFromDOM);

  const setTheme = useCallback((next: Theme) => {
    // Update DOM class on <html> [spec 6.4]
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(next);
    html.style.colorScheme = next;

    // Persist to localStorage [spec 6.8]
    try {
      localStorage.setItem('theme', next);
    } catch {
      // localStorage unavailable (private browsing, etc.) — silent
    }

    setThemeState(next);
  }, []);

  // Sync state if theme is changed externally (e.g. OS preference change)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = () => {
      // Only react if user has no localStorage preference
      try {
        if (!localStorage.getItem('theme')) {
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
