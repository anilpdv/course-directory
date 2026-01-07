export const colors = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',

  // Primary colors (Deep Navy)
  primary: '#4A6F8A',
  primaryVariant: '#172b3b',
  primaryContainer: '#172b3b',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFFFFF',

  // Secondary/Accent colors (Dark Teal)
  secondary: '#3D6B6B',
  secondaryVariant: '#1D4044',
  secondaryContainer: '#1D4044',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#FFFFFF',

  // Text colors
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#B3B3B3',
  textDisabled: '#666666',

  // Status colors (Dark & Muted)
  success: '#4A8B7A',
  warning: '#8B7355',
  error: '#8B5A5A',
  onError: '#FFFFFF',

  // Other
  border: '#3D3D3D',
  divider: '#2D2D2D',
  overlay: 'rgba(0, 0, 0, 0.5)',
  controlsOverlay: 'rgba(0, 0, 0, 0.4)',

  // Semantic colors for refined minimalist UI
  iconDefault: '#7A8B95',     // Blue-gray tint icons
  iconMuted: '#5A6A72',       // Darker muted icons
  progressFill: '#4A6F8A',    // Slate blue for progress bars
  complete: '#4A8B7A',        // Dark sage for completion states

  // Player specific
  playerBackground: '#000000',
  controlButton: 'rgba(255, 255, 255, 0.2)',
  seekButton: 'rgba(255, 255, 255, 0.15)',
  progressTrack: 'rgba(255, 255, 255, 0.3)',
  playerIcon: '#FFFFFF',
  playerText: '#FFFFFF',
};

export type ThemeColors = typeof colors;

// Tag color palette for user-created tags (dark tones)
export const tagColors = [
  '#4A6F8A', // Slate blue (primary)
  '#3D6B6B', // Teal (secondary)
  '#4A8B7A', // Sage green
  '#8B5A5A', // Muted rose
  '#6A5A8B', // Muted purple
  '#4A7A8B', // Steel teal
  '#8B6A4A', // Bronze
  '#5A7A6A', // Forest
  '#7A6A5A', // Taupe
  '#5A6A7A', // Steel blue
] as const;

export type TagColor = (typeof tagColors)[number];
