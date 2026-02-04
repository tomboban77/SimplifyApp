/**
 * Template Registry
 * 
 * Maps template IDs to their actual component files.
 * This allows us to scale to 30+ templates by simply adding new entries here.
 */

import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';
import { Template4 } from './Template4';
import { Template5 } from './Template5';
import { ResumeData } from '@/types';

// Template component type
type TemplateComponent = React.ComponentType<{ data: ResumeData }>;

// Registry mapping templateId to component
const templateRegistry: Record<string, TemplateComponent> = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  // Add more templates here as you create them:
  // template6: Template6,
  // template7: Template7,
  // ... up to template30+
};

/**
 * Get template component by ID
 */
export function getTemplateComponent(templateId: string): TemplateComponent | null {
  return templateRegistry[templateId] || null;
}

/**
 * Check if template exists in registry
 */
export function hasTemplate(templateId: string): boolean {
  return templateId in templateRegistry;
}

/**
 * Get all registered template IDs
 */
export function getAllTemplateIds(): string[] {
  return Object.keys(templateRegistry);
}

