import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { THEME, LIGHT_THEME, DARK_THEME } from '../constants/theme';

export function useAppTheme() {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => (mode === 'light' ? LIGHT_THEME : DARK_THEME), [mode]);
  return { theme, mode } as const;
}


