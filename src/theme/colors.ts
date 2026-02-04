/**
 * Premium Color Palette
 * 
 * A sophisticated, world-class color system inspired by:
 * - Editorial design principles
 * - Premium app aesthetics (Linear, Notion, Arc)
 * - High contrast accessibility standards
 * 
 * Design Philosophy: Refined restraint with bold accents
 */

export const colors = {
  // Primary Brand - Deep Indigo with warmth
  primary: {
    main: '#4F46E5',        // Indigo 600 - Confident, trustworthy
    light: '#818CF8',       // Indigo 400 - Soft variant
    dark: '#3730A3',        // Indigo 800 - Deep variant
    contrast: '#FFFFFF',
    muted: '#E0E7FF',       // Indigo 100 - Subtle backgrounds
    ghost: 'rgba(79, 70, 229, 0.08)', // For hover states
  },

  // Secondary - Warm Coral for energy
  secondary: {
    main: '#F97316',        // Orange 500 - Energetic, action-oriented
    light: '#FB923C',       // Orange 400
    dark: '#EA580C',        // Orange 600
    contrast: '#FFFFFF',
    muted: '#FFF7ED',       // Orange 50
    ghost: 'rgba(249, 115, 22, 0.08)',
  },

  // Accent - Electric Teal for highlights
  accent: {
    main: '#14B8A6',        // Teal 500 - Fresh, modern
    light: '#2DD4BF',       // Teal 400
    dark: '#0D9488',        // Teal 600
    contrast: '#FFFFFF',
    muted: '#CCFBF1',       // Teal 100
  },

  // Neutrals - Warm grays for approachability
  neutral: {
    50: '#FAFAF9',          // Stone 50 - Lightest
    100: '#F5F5F4',         // Stone 100
    200: '#E7E5E4',         // Stone 200
    300: '#D6D3D1',         // Stone 300
    400: '#A8A29E',         // Stone 400
    500: '#78716C',         // Stone 500
    600: '#57534E',         // Stone 600
    700: '#44403C',         // Stone 700
    800: '#292524',         // Stone 800
    900: '#1C1917',         // Stone 900 - Darkest
  },

  // Background System
  background: {
    default: '#FAFAF9',     // Warm off-white
    paper: '#FFFFFF',       // Pure white for cards
    elevated: '#FFFFFF',    // Elevated surfaces
    sunken: '#F5F5F4',      // Recessed areas
    overlay: 'rgba(28, 25, 23, 0.6)', // Modal overlays
    glass: 'rgba(255, 255, 255, 0.85)', // Glassmorphism
  },

  // Text Hierarchy
  text: {
    primary: '#1C1917',     // Near black - High contrast
    secondary: '#57534E',   // Medium gray - Supporting text
    tertiary: '#78716C',    // Light gray - Captions
    disabled: '#A8A29E',    // Disabled state
    inverse: '#FFFFFF',     // On dark backgrounds
    link: '#4F46E5',        // Links
  },

  // Semantic Colors
  success: {
    main: '#059669',        // Emerald 600
    light: '#10B981',       // Emerald 500
    dark: '#047857',        // Emerald 700
    bg: '#ECFDF5',          // Emerald 50
    border: '#A7F3D0',      // Emerald 200
  },

  error: {
    main: '#DC2626',        // Red 600
    light: '#EF4444',       // Red 500
    dark: '#B91C1C',        // Red 700
    bg: '#FEF2F2',          // Red 50
    border: '#FECACA',      // Red 200
  },

  warning: {
    main: '#D97706',        // Amber 600
    light: '#F59E0B',       // Amber 500
    dark: '#B45309',        // Amber 700
    bg: '#FFFBEB',          // Amber 50
    border: '#FDE68A',      // Amber 200
  },

  info: {
    main: '#2563EB',        // Blue 600
    light: '#3B82F6',       // Blue 500
    dark: '#1D4ED8',        // Blue 700
    bg: '#EFF6FF',          // Blue 50
    border: '#BFDBFE',      // Blue 200
  },

  // Borders
  border: {
    light: '#E7E5E4',       // Subtle borders
    main: '#D6D3D1',        // Standard borders
    dark: '#A8A29E',        // Emphasized borders
    focus: '#4F46E5',       // Focus rings
  },

  // Shadows (for StyleSheet)
  shadow: {
    color: '#1C1917',
    xs: 'rgba(28, 25, 23, 0.03)',
    sm: 'rgba(28, 25, 23, 0.05)',
    md: 'rgba(28, 25, 23, 0.08)',
    lg: 'rgba(28, 25, 23, 0.12)',
    xl: 'rgba(28, 25, 23, 0.16)',
    colored: 'rgba(79, 70, 229, 0.25)', // Primary shadow
  },

  // Feature-specific colors
  resume: {
    accent1: '#4F46E5',     // Primary indigo
    accent2: '#F97316',     // Coral
    accent3: '#14B8A6',     // Teal
    accent4: '#8B5CF6',     // Violet
    accent5: '#EC4899',     // Pink
  },

  // Premium Gradients (mutable arrays for LinearGradient compatibility)
  gradients: {
    primary: ['#4F46E5', '#7C3AED'] as string[],      // Indigo to Violet
    secondary: ['#F97316', '#FB7185'] as string[],    // Coral to Rose
    accent: ['#14B8A6', '#06B6D4'] as string[],       // Teal to Cyan
    subtle: ['#FAFAF9', '#F5F5F4'] as string[],       // Soft neutral
    premium: ['#1C1917', '#44403C'] as string[],      // Dark sophisticated
    sunrise: ['#F97316', '#FBBF24'] as string[],      // Orange to Amber
    ocean: ['#2563EB', '#14B8A6'] as string[],        // Blue to Teal
  },

  // Interactive states
  interactive: {
    hover: 'rgba(79, 70, 229, 0.04)',
    pressed: 'rgba(79, 70, 229, 0.08)',
    selected: 'rgba(79, 70, 229, 0.12)',
  },
} as const;

export type ColorPalette = typeof colors;