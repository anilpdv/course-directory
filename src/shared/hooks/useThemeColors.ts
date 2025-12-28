import { useTheme } from 'react-native-paper';
import { colors } from '../theme/colors';

export function useThemeColors() {
  const theme = useTheme();

  return {
    // Paper theme colors
    ...theme.colors,
    // Extended colors not in Paper theme
    controlsOverlay: colors.controlsOverlay,
    playerBackground: colors.playerBackground,
    controlButton: colors.controlButton,
    seekButton: colors.seekButton,
    progressTrack: colors.progressTrack,
    success: colors.success,
    warning: colors.warning,
    divider: colors.divider,
  };
}

export type AppColors = ReturnType<typeof useThemeColors>;
