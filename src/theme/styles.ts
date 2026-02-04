/**
 * Premium Style Utilities
 * 
 * A comprehensive design token system for world-class UI
 * Inspired by: Linear, Notion, Arc Browser, Apple HIG
 */

import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors } from './colors';

/**
 * Typography Scale
 * Based on a modular scale with 1.25 ratio
 */
export const typography = {
  // Display - Hero text
  displayLarge: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
  },
  displayMedium: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  displaySmall: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Body text
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },

  // Labels & Captions
  labelLarge: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },

  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Spacing Scale
 * 4px base unit
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
};

/**
 * Border Radius
 */
export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

/**
 * Shadow Presets
 * Platform-aware shadows
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 16,
  },
  // Colored shadows for emphasis
  primary: {
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  // Inner shadow effect (achieved via border)
  inner: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
};

/**
 * Animation Durations
 */
export const animation = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

/**
 * Common Layout Styles
 */
export const layout = StyleSheet.create({
  // Flex utilities
  flex1: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  flexShrink: { flexShrink: 1 },
  
  // Row layouts
  row: { flexDirection: 'row' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowEnd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  
  // Column layouts
  column: { flexDirection: 'column' },
  columnCenter: { flexDirection: 'column', alignItems: 'center' },
  
  // Centering
  center: { justifyContent: 'center', alignItems: 'center' },
  centerVertical: { justifyContent: 'center' },
  centerHorizontal: { alignItems: 'center' },
  
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  
  // Safe area padding
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  
  // Content containers
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  containerWide: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
  },
  
  // Absolute positioning
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

/**
 * Card Styles
 */
export const cards = StyleSheet.create({
  base: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  interactive: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  glass: {
    backgroundColor: colors.background.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.md,
  },
  featured: {
    backgroundColor: colors.background.paper,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.primary.muted,
    ...shadows.lg,
  },
});

/**
 * Button Styles
 */
export const buttons = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  subtle: {
    backgroundColor: colors.primary.ghost,
  },
  // Size variants
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    borderRadius: radius.md,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    minHeight: 56,
    borderRadius: radius.xl,
  },
});

/**
 * Input Styles
 */
export const inputs = StyleSheet.create({
  base: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 52,
  },
  focused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.error.main,
    backgroundColor: colors.error.bg,
  },
});

/**
 * Text Styles with colors
 */
export const text = StyleSheet.create({
  // Headings
  displayLarge: { ...typography.displayLarge, color: colors.text.primary },
  displayMedium: { ...typography.displayMedium, color: colors.text.primary },
  displaySmall: { ...typography.displaySmall, color: colors.text.primary },
  h1: { ...typography.h1, color: colors.text.primary },
  h2: { ...typography.h2, color: colors.text.primary },
  h3: { ...typography.h3, color: colors.text.primary },
  h4: { ...typography.h4, color: colors.text.primary },
  
  // Body
  bodyLarge: { ...typography.bodyLarge, color: colors.text.primary },
  bodyMedium: { ...typography.bodyMedium, color: colors.text.primary },
  bodySmall: { ...typography.bodySmall, color: colors.text.primary },
  
  // Labels
  labelLarge: { ...typography.labelLarge, color: colors.text.primary },
  labelMedium: { ...typography.labelMedium, color: colors.text.secondary },
  labelSmall: { ...typography.labelSmall, color: colors.text.tertiary },
  
  // Utility
  caption: { ...typography.caption, color: colors.text.tertiary },
  overline: { ...typography.overline, color: colors.text.tertiary },
  
  // Color variants
  secondary: { color: colors.text.secondary },
  tertiary: { color: colors.text.tertiary },
  inverse: { color: colors.text.inverse },
  primary: { color: colors.primary.main },
  error: { color: colors.error.main },
  success: { color: colors.success.main },
});

/**
 * Badge/Tag Styles
 */
export const badges = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: colors.primary.muted,
  },
  secondary: {
    backgroundColor: colors.secondary.muted,
  },
  success: {
    backgroundColor: colors.success.bg,
  },
  warning: {
    backgroundColor: colors.warning.bg,
  },
  error: {
    backgroundColor: colors.error.bg,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
});

/**
 * Divider Styles
 */
export const dividers = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  vertical: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  thick: {
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
  },
});

// Export colors for convenience
export { colors };