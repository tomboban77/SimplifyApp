/**
 * Template Schema Types
 * 
 * Defines the structure for dynamic template rendering.
 * Templates are stored in Firebase with these schemas.
 */

export type LayoutType = 'single-column' | 'two-column' | 'sidebar';

export type SectionType = 
  | 'personal-info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom-sections';

export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold' | '600' | '700';
export type SectionStyle = 'default' | 'compact' | 'spacious' | 'minimal';

export interface ColorScheme {
  primary: string;
  secondary?: string;
  accent?: string;
  text: string;
  textSecondary?: string;
  background: string;
  divider?: string;
}

export interface Typography {
  fontFamily?: string;
  nameSize: number;
  nameWeight: FontWeight;
  sectionTitleSize: number;
  sectionTitleWeight: FontWeight;
  bodySize: number;
  bodyWeight: FontWeight;
  // Project-specific typography (matching exact styles from Template1-5)
  projectNameSize?: number;
  projectNameWeight?: FontWeight;
  projectDescSize?: number;
  projectDescLineHeight?: number;
  projectDescMarginTop?: number;
  // Entry title (for experience, education, projects)
  entryTitleSize?: number;
  entryTitleWeight?: FontWeight;
}

export interface Spacing {
  section: number;
  item: number;
  bullet: number;
}

export interface SectionConfig {
  type: SectionType;
  title?: string; // Custom title override
  show: boolean;
  style?: SectionStyle;
  order: number;
  // For two-column layouts
  column?: 'left' | 'right' | 'full';
}

export interface HeaderConfig {
  nameAlign: TextAlign;
  contactAlign: TextAlign;
  showLinkedIn: boolean;
  showWebsite: boolean;
  style: 'default' | 'bold' | 'minimal';
}

export interface TemplateSchema {
  layout: {
    type: LayoutType;
    // For two-column layouts
    leftColumnWidth?: number; // Percentage (0-100)
    rightColumnWidth?: number; // Percentage (0-100)
  };
  colors: ColorScheme;
  typography: Typography;
  spacing: Spacing;
  header: HeaderConfig;
  sections: SectionConfig[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  badge: string | null;
  industries: string[];
  roles: string[];
  isActive: boolean;
  order: number;
  // No schema - templates are actual component files
  createdAt: string;
  updatedAt: string;
}

