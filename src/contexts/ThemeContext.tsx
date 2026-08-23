import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'lain-theme-v2';
type Theme = 'dark' | 'light';

/** Reads the attribute the anti-flash inline script (in index.astro) already set on <html>
 *  before this ever runs, instead of re-deriving it from localStorage independently — avoids
 *  a mismatch flash and keeps theme detection in one place. Throws under SSR (no `document`
 *  in Node), same as the localStorage read it replaces, hence the try/catch. */
function detectInitialTheme(): Theme {
  try {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Dark is always the brand default — no system-preference listener, matching the original design. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(detectInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
