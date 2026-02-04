import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

/**
 * Premium Theme Configuration
 * 
 * A world-class theme system built on Material Design 3
 * with sophisticated typography and color choices.
 * 
 * Design Philosophy: Refined luxury with bold accents
 */

// Premium font configuration
// Using system fonts optimized for each platform
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 40,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 48,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Light Theme - Premium and sophisticated
export const lightTheme = {
  ...MD3LightTheme,
  roundness: 12, // Slightly more rounded for modern feel
  colors: {
    ...MD3LightTheme.colors,
    
    // Primary colors
    primary: colors.primary.main,
    onPrimary: colors.primary.contrast,
    primaryContainer: colors.primary.muted,
    onPrimaryContainer: colors.primary.dark,
    
    // Secondary colors
    secondary: colors.secondary.main,
    onSecondary: colors.secondary.contrast,
    secondaryContainer: colors.secondary.muted,
    onSecondaryContainer: colors.secondary.dark,
    
    // Tertiary / Accent
    tertiary: colors.accent.main,
    onTertiary: colors.accent.contrast,
    tertiaryContainer: colors.accent.muted,
    onTertiaryContainer: colors.accent.dark,
    
    // Error states
    error: colors.error.main,
    onError: colors.text.inverse,
    errorContainer: colors.error.bg,
    onErrorContainer: colors.error.dark,
    
    // Backgrounds
    background: colors.background.default,
    onBackground: colors.text.primary,
    
    // Surfaces
    surface: colors.background.paper,
    onSurface: colors.text.primary,
    surfaceVariant: colors.background.sunken,
    onSurfaceVariant: colors.text.secondary,
    surfaceDisabled: colors.neutral[100],
    
    // Outlines
    outline: colors.border.main,
    outlineVariant: colors.border.light,
    
    // Shadows & Overlays
    shadow: colors.shadow.color,
    scrim: colors.background.overlay,
    
    // Inverse colors
    inverseSurface: colors.neutral[900],
    inverseOnSurface: colors.neutral[50],
    inversePrimary: colors.primary.light,
    
    // Elevation tints (subtle color shifts)
    elevation: {
      level0: 'transparent',
      level1: colors.background.paper,
      level2: colors.background.paper,
      level3: colors.background.paper,
      level4: colors.background.paper,
      level5: colors.background.paper,
    },
    
    // Custom additions for UI components
    backdrop: colors.background.overlay,
    disabled: colors.text.disabled,
    placeholder: colors.text.tertiary,
    notification: colors.error.main,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Dark Theme - Elegant and modern
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    
    // Primary colors (lighter variants for dark mode)
    primary: colors.primary.light,
    onPrimary: colors.neutral[900],
    primaryContainer: colors.primary.dark,
    onPrimaryContainer: colors.primary.light,
    
    // Secondary colors
    secondary: colors.secondary.light,
    onSecondary: colors.neutral[900],
    secondaryContainer: colors.secondary.dark,
    onSecondaryContainer: colors.secondary.light,
    
    // Tertiary
    tertiary: colors.accent.light,
    onTertiary: colors.neutral[900],
    tertiaryContainer: colors.accent.dark,
    onTertiaryContainer: colors.accent.light,
    
    // Error states
    error: colors.error.light,
    onError: colors.neutral[900],
    errorContainer: '#3D1A1A',
    onErrorContainer: colors.error.light,
    
    // Backgrounds
    background: colors.neutral[900],
    onBackground: colors.neutral[50],
    
    // Surfaces
    surface: colors.neutral[800],
    onSurface: colors.neutral[50],
    surfaceVariant: colors.neutral[700],
    onSurfaceVariant: colors.neutral[300],
    surfaceDisabled: colors.neutral[800],
    
    // Outlines
    outline: colors.neutral[600],
    outlineVariant: colors.neutral[700],
    
    // Shadows & Overlays
    shadow: '#000000',
    scrim: 'rgba(0, 0, 0, 0.7)',
    
    // Inverse colors
    inverseSurface: colors.neutral[100],
    inverseOnSurface: colors.neutral[900],
    inversePrimary: colors.primary.dark,
    
    // Elevation
    elevation: {
      level0: 'transparent',
      level1: colors.neutral[800],
      level2: colors.neutral[700],
      level3: colors.neutral[700],
      level4: colors.neutral[600],
      level5: colors.neutral[600],
    },
    
    backdrop: 'rgba(0, 0, 0, 0.7)',
    disabled: colors.neutral[600],
    placeholder: colors.neutral[500],
    notification: colors.error.light,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Export default theme
export const theme = lightTheme;

// Re-export colors for direct use
export { colors };