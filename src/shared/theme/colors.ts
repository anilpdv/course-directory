export const colors = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',

  // Primary colors
  primary: '#BB86FC',
  primaryVariant: '#3700B3',
  primaryContainer: '#4A148C',
  onPrimary: '#000000',
  onPrimaryContainer: '#FFFFFF',

  // Secondary/Accent colors
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  secondaryContainer: '#004D40',
  onSecondary: '#000000',
  onSecondaryContainer: '#FFFFFF',

  // Text colors
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#B3B3B3',
  textDisabled: '#666666',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#CF6679',
  onError: '#000000',

  // Other
  border: '#3D3D3D',
  divider: '#2D2D2D',
  overlay: 'rgba(0, 0, 0, 0.5)',
  controlsOverlay: 'rgba(0, 0, 0, 0.4)',

  // Player specific
  playerBackground: '#000000',
  controlButton: 'rgba(255, 255, 255, 0.2)',
  seekButton: 'rgba(255, 255, 255, 0.15)',
  progressTrack: 'rgba(255, 255, 255, 0.3)',
};

export type ThemeColors = typeof colors;
