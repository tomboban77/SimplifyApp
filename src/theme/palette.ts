/**
 * Shared Design Palette
 * 
 * Warm sand base + deep navy header + rich accents
 * Used consistently across all tabs for a cohesive experience
 */

export const palette = {
  // Backgrounds
  pageBg: '#F6F4F0',          // Warm ivory/sand
  headerBg: '#1B1F3B',        // Deep navy for header contrast
  headerBgEnd: '#2A2F52',
  cardBg: '#FFFFFF',
  cardBgPressed: '#FAFAF8',
  surfaceMuted: '#EFEDE9',     // Subtle warm grey

  // Borders
  border: 'rgba(0, 0, 0, 0.06)',
  borderMedium: 'rgba(0, 0, 0, 0.10)',
  borderOnDark: 'rgba(255, 255, 255, 0.12)',

  // Accent colors
  indigo: '#4F46E5',
  indigoLight: '#6366F1',
  indigoMuted: 'rgba(79, 70, 229, 0.08)',
  indigoBg: 'rgba(79, 70, 229, 0.06)',

  teal: '#0D9488',
  tealLight: '#14B8A6',
  tealMuted: 'rgba(13, 148, 136, 0.08)',
  tealBg: 'rgba(13, 148, 136, 0.06)',

  coral: '#E87461',
  coralMuted: 'rgba(232, 116, 97, 0.08)',

  amber: '#D97706',
  amberMuted: 'rgba(217, 119, 6, 0.08)',

  // Text
  textDark: '#1A1D2E',
  textMedium: '#4A4D5E',
  textLight: '#8B8E9F',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255, 255, 255, 0.7)',

  // Utility
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.08)',
} as const;

