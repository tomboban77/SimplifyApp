/**
 * Template Schema Definitions
 * 
 * These schemas define the structure and styling for each template.
 * These will be stored in Firebase and used by TemplateRenderer.
 */

import { TemplateSchema } from '@/types/templateSchema';

/**
 * Template 1: Classic Professional
 * Clean, traditional black & white design
 */
export const template1Schema: TemplateSchema = {
  layout: {
    type: 'single-column',
  },
  colors: {
    primary: '#000000',
    text: '#000000',
    textSecondary: '#333333',
    background: '#ffffff',
    divider: '#000000',
  },
  typography: {
    nameSize: 24,
    nameWeight: 'bold',
    sectionTitleSize: 12,
    sectionTitleWeight: 'bold',
    bodySize: 11,
    bodyWeight: 'normal',
    // Template1 exact styles: entryTitle fontSize 10, fontWeight '700', projectDescription fontSize 9
    entryTitleSize: 10,
    entryTitleWeight: '700',
    projectNameSize: 10,
    projectNameWeight: '700',
    projectDescSize: 9,
    projectDescLineHeight: 13,
    projectDescMarginTop: 2,
  },
  spacing: {
    section: 16,
    item: 12,
    bullet: 8,
  },
  header: {
    nameAlign: 'center',
    contactAlign: 'center',
    showLinkedIn: true,
    showWebsite: true,
    style: 'default',
  },
  sections: [
    { type: 'summary', show: true, order: 1 },
    { type: 'experience', show: true, order: 2 },
    { type: 'education', show: true, order: 3 },
    { type: 'skills', show: true, order: 4 },
    { type: 'projects', show: true, order: 5 },
    { type: 'certifications', show: true, order: 6 },
    { type: 'languages', show: true, order: 7 },
    { type: 'custom-sections', show: true, order: 8 },
  ],
};

/**
 * Template 2: Modern Executive
 * Sophisticated navy blue design
 */
export const template2Schema: TemplateSchema = {
  layout: {
    type: 'single-column',
  },
  colors: {
    primary: '#1a237e',
    secondary: '#283593',
    text: '#1a1a1a',
    textSecondary: '#424242',
    background: '#ffffff',
    divider: '#1a237e',
  },
  typography: {
    nameSize: 26,
    nameWeight: 'bold',
    sectionTitleSize: 13,
    sectionTitleWeight: 'bold',
    bodySize: 11,
    bodyWeight: 'normal',
  },
  spacing: {
    section: 18,
    item: 14,
    bullet: 8,
  },
  header: {
    nameAlign: 'center',
    contactAlign: 'center',
    showLinkedIn: true,
    showWebsite: true,
    style: 'bold',
  },
  sections: [
    { type: 'summary', show: true, order: 1 },
    { type: 'experience', show: true, order: 2 },
    { type: 'education', show: true, order: 3 },
    { type: 'skills', show: true, order: 4 },
    { type: 'projects', show: true, order: 5 },
    { type: 'certifications', show: true, order: 6 },
    { type: 'languages', show: true, order: 7 },
    { type: 'custom-sections', show: true, order: 8 },
  ],
};

/**
 * Template 3: Minimalist
 * Ultra-clean design with elegant whitespace
 */
export const template3Schema: TemplateSchema = {
  layout: {
    type: 'single-column',
  },
  colors: {
    primary: '#212121',
    text: '#212121',
    textSecondary: '#616161',
    background: '#ffffff',
    divider: '#e0e0e0',
  },
  typography: {
    nameSize: 22,
    nameWeight: '600',
    sectionTitleSize: 11,
    sectionTitleWeight: '600',
    bodySize: 11,
    bodyWeight: 'normal',
    // Template3 exact styles: projectName fontSize 10, fontWeight '600', projectDescription fontSize 8
    entryTitleSize: 10,
    entryTitleWeight: '600',
    projectNameSize: 10,
    projectNameWeight: '600',
    projectDescSize: 8,
    projectDescLineHeight: 13,
    projectDescMarginTop: 0,
  },
  spacing: {
    section: 20,
    item: 14,
    bullet: 10,
  },
  header: {
    nameAlign: 'left',
    contactAlign: 'left',
    showLinkedIn: true,
    showWebsite: true,
    style: 'minimal',
  },
  sections: [
    { type: 'summary', show: true, order: 1 },
    { type: 'experience', show: true, order: 2 },
    { type: 'education', show: true, order: 3 },
    { type: 'skills', show: true, order: 4 },
    { type: 'projects', show: true, order: 5 },
    { type: 'certifications', show: true, order: 6 },
    { type: 'languages', show: true, order: 7 },
    { type: 'custom-sections', show: true, order: 8 },
  ],
};

/**
 * Template 4: Corporate
 * Classic authoritative layout
 */
export const template4Schema: TemplateSchema = {
  layout: {
    type: 'single-column',
  },
  colors: {
    primary: '#000000',
    text: '#000000',
    textSecondary: '#333333',
    background: '#ffffff',
    divider: '#000000',
  },
  typography: {
    nameSize: 23,
    nameWeight: 'bold',
    sectionTitleSize: 12,
    sectionTitleWeight: 'bold',
    bodySize: 11,
    bodyWeight: 'normal',
    // Template4 exact styles: projectName fontSize 9, fontWeight '700', projectDescription fontSize 8
    entryTitleSize: 9,
    entryTitleWeight: '700',
    projectNameSize: 9,
    projectNameWeight: '700',
    projectDescSize: 8,
    projectDescLineHeight: 12,
    projectDescMarginTop: 0,
  },
  spacing: {
    section: 16,
    item: 12,
    bullet: 8,
  },
  header: {
    nameAlign: 'left',
    contactAlign: 'left',
    showLinkedIn: true,
    showWebsite: true,
    style: 'default',
  },
  sections: [
    { type: 'summary', show: true, order: 1 },
    { type: 'experience', show: true, order: 2 },
    { type: 'education', show: true, order: 3 },
    { type: 'skills', show: true, order: 4 },
    { type: 'projects', show: true, order: 5 },
    { type: 'certifications', show: true, order: 6 },
    { type: 'languages', show: true, order: 7 },
    { type: 'custom-sections', show: true, order: 8 },
  ],
};

/**
 * Template 5: Bold Professional
 * Eye-catching design with red accent
 */
export const template5Schema: TemplateSchema = {
  layout: {
    type: 'single-column',
  },
  colors: {
    primary: '#c62828',
    accent: '#c62828',
    text: '#1a1a1a',
    textSecondary: '#424242',
    background: '#ffffff',
    divider: '#c62828',
  },
  typography: {
    nameSize: 25,
    nameWeight: 'bold',
    sectionTitleSize: 12,
    sectionTitleWeight: 'bold',
    bodySize: 11,
    bodyWeight: 'normal',
    // Template5 exact styles: projectName fontSize 10, fontWeight '700', projectDescription fontSize 8
    entryTitleSize: 10,
    entryTitleWeight: '700',
    projectNameSize: 10,
    projectNameWeight: '700',
    projectDescSize: 8,
    projectDescLineHeight: 12,
    projectDescMarginTop: 0,
  },
  spacing: {
    section: 17,
    item: 13,
    bullet: 8,
  },
  header: {
    nameAlign: 'center',
    contactAlign: 'center',
    showLinkedIn: true,
    showWebsite: true,
    style: 'bold',
  },
  sections: [
    { type: 'summary', show: true, order: 1 },
    { type: 'experience', show: true, order: 2 },
    { type: 'education', show: true, order: 3 },
    { type: 'skills', show: true, order: 4 },
    { type: 'projects', show: true, order: 5 },
    { type: 'certifications', show: true, order: 6 },
    { type: 'languages', show: true, order: 7 },
    { type: 'custom-sections', show: true, order: 8 },
  ],
};

// Export all schemas as a map for easy lookup
export const templateSchemas = {
  template1: template1Schema,
  template2: template2Schema,
  template3: template3Schema,
  template4: template4Schema,
  template5: template5Schema,
};

