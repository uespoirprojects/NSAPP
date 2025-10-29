import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

export function useThemeColors() {
  const { effectiveTheme } = useTheme();
  return Colors[effectiveTheme];
}
