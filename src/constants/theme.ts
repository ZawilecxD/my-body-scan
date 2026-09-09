/**
 * Somatic Journal tokens from Stitch DESIGN.md / HTML Tailwind config.
 * Legacy keys (`text`, `backgroundElement`, …) stay so existing screens keep compiling
 * until later phases restyle them onto the new names.
 */

import '@/global.css';

export const Colors = {
  light: {
    // Legacy aliases (existing call sites)
    text: '#0b1c30',
    textSecondary: '#565e74',
    background: '#f8f9ff',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e5eeff',

    // Stitch / Material 3 surfaces
    surface: '#f8f9ff',
    surfaceDim: '#cbdbf5',
    surfaceBright: '#f8f9ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#eff4ff',
    surfaceContainer: '#e5eeff',
    surfaceContainerHigh: '#dce9ff',
    surfaceContainerHighest: '#d3e4fe',
    surfaceVariant: '#d3e4fe',
    onSurface: '#0b1c30',
    onSurfaceVariant: '#3e4947',
    onBackground: '#0b1c30',
    inverseSurface: '#213145',
    inverseOnSurface: '#eaf1ff',

    outline: '#6e7977',
    outlineVariant: '#bdc9c6',
    surfaceTint: '#006a63',

    primary: '#005c55',
    onPrimary: '#ffffff',
    primaryContainer: '#0f766e',
    onPrimaryContainer: '#a3faef',
    inversePrimary: '#80d5cb',
    primaryFixed: '#9cf2e8',
    primaryFixedDim: '#80d5cb',

    secondary: '#565e74',
    onSecondary: '#ffffff',
    secondaryContainer: '#dae2fd',
    onSecondaryContainer: '#5c647a',
    secondaryFixed: '#dae2fd',
    secondaryFixedDim: '#bec6e0',

    tertiary: '#893a00',
    onTertiary: '#ffffff',
    tertiaryContainer: '#af4c00',
    onTertiaryContainer: '#ffe6da',
    tertiaryFixed: '#ffdbca',
    tertiaryFixedDim: '#ffb690',

    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
  },
  dark: {
    // Legacy aliases
    text: '#eaf1ff',
    textSecondary: '#bec6e0',
    background: '#0b1c30',
    backgroundElement: '#213145',
    backgroundSelected: '#2a3f56',

    surface: '#0b1c30',
    surfaceDim: '#0b1c30',
    surfaceBright: '#31465c',
    surfaceContainerLowest: '#061220',
    surfaceContainerLow: '#142538',
    surfaceContainer: '#1a2c40',
    surfaceContainerHigh: '#25374b',
    surfaceContainerHighest: '#304257',
    surfaceVariant: '#3e4947',
    onSurface: '#eaf1ff',
    onSurfaceVariant: '#bdc9c6',
    onBackground: '#eaf1ff',
    inverseSurface: '#d3e4fe',
    inverseOnSurface: '#213145',

    outline: '#879390',
    outlineVariant: '#3e4947',
    surfaceTint: '#80d5cb',

    primary: '#80d5cb',
    onPrimary: '#003732',
    primaryContainer: '#0f766e',
    onPrimaryContainer: '#a3faef',
    inversePrimary: '#006a63',
    primaryFixed: '#9cf2e8',
    primaryFixedDim: '#80d5cb',

    secondary: '#bec6e0',
    onSecondary: '#283044',
    secondaryContainer: '#3f465c',
    onSecondaryContainer: '#dae2fd',
    secondaryFixed: '#dae2fd',
    secondaryFixedDim: '#bec6e0',

    tertiary: '#ffb690',
    onTertiary: '#542100',
    tertiaryContainer: '#af4c00',
    onTertiaryContainer: '#ffe6da',
    tertiaryFixed: '#ffdbca',
    tertiaryFixedDim: '#ffb690',

    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Loaded @expo-google-fonts family names (see root layout useFonts). */
export const Fonts = {
  display: 'Manrope_600SemiBold',
  displayBold: 'Manrope_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoSemiBold: 'JetBrainsMono_600SemiBold',
} as const;

export const TypeRoles = {
  displayLg: {
    fontFamily: Fonts.displayBold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.64,
  },
  headlineLg: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.36,
  },
  headlineMd: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  titleMd: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.08,
  },
  bodyLg: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelMd: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  dataLg: {
    fontFamily: Fonts.monoSemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.32,
  },
  dataSm: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.24,
  },
} as const;

export type TypeRole = keyof typeof TypeRoles;

/** Legacy Spacing keys kept for current screens. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  /** Stitch aliases (px) */
  space2xs: 4,
  spaceXs: 8,
  spaceSm: 12,
  spaceMd: 16,
  spaceLg: 20,
  spaceXl: 24,
  space2xl: 32,
  space3xl: 48,
  gutterMobile: 16,
  marginMobile: 16,
} as const;

export const Radii = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
