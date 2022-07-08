/**
 * Controls app-wide theme-ing
 */

import { createContext, FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';

export type ThemeColor = 'light' | 'dark';

interface SemanticTheme {
  inverted: boolean;
}

interface Theme {
  color: ThemeColor;
  semantic: SemanticTheme;
  changeTheme: (color: ThemeColor) => void;
}

const themeStorageKey: string = 'built-environment-theme';
export const ThemeContext = createContext<Theme>({
  color: 'light',
  semantic: {
    inverted: false,
  },
  changeTheme: console.log,
});

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [color, setColor] = useState<ThemeColor>('light');
  const [semantic, setSemantic] = useState<SemanticTheme>({ inverted: false });
  const [loaded, setLoaded] = useState(false);

  const changeTheme = useCallback((color: ThemeColor) => {
    setColor(color);
    if (color === 'light') {
      setSemantic({ inverted: false });
    } else {
      setSemantic({ inverted: true });
    }
    localStorage.setItem(themeStorageKey, color);
  }, []);

  useEffect(() => {
    const localColor = localStorage.getItem(themeStorageKey);
    if (localColor) {
      changeTheme(localColor as ThemeColor);
    }
    setLoaded(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ color, semantic, changeTheme }}>
      { loaded ? children : null }
    </ThemeContext.Provider>
  )
}

export default ThemeProvider;
