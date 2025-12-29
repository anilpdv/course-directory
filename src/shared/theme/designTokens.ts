// Shadow presets for consistent elevation across the app
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
} as const;

// Animation duration presets (in milliseconds)
export const durations = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  emphasis: 700,
} as const;

// Spring animation configs
export const easings = {
  spring: {
    damping: 15,
    stiffness: 150,
  },
  springBouncy: {
    damping: 10,
    stiffness: 180,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
  },
} as const;

// Opacity presets for disabled/medium/high states
export const opacity = {
  disabled: 0.38,
  medium: 0.6,
  high: 0.87,
  full: 1,
} as const;

// Icon size presets
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 22,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Progress bar height presets
export const progressBarHeights = {
  thin: 3, // VideoItem, PlaylistItem
  medium: 4, // SectionAccordion
  thick: 6, // ProgressBar (player)
} as const;

// Control button size presets
export const buttonSizes = {
  small: { width: 48, height: 48, borderRadius: 24 },
  normal: { width: 64, height: 64, borderRadius: 32 },
  large: { width: 80, height: 80, borderRadius: 40 },
} as const;

// Video aspect ratio presets
export const aspectRatios = {
  standard: 16 / 9,
  tablet: 2.5,
} as const;

// Font weight presets
export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export type Shadows = typeof shadows;
export type Durations = typeof durations;
export type Easings = typeof easings;
export type Opacity = typeof opacity;
export type IconSizes = typeof iconSizes;
export type ProgressBarHeights = typeof progressBarHeights;
export type ButtonSizes = typeof buttonSizes;
export type AspectRatios = typeof aspectRatios;
export type FontWeights = typeof fontWeights;
