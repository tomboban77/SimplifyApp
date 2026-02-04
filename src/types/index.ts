export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  title: string;
  templateId: string; // Dynamic template ID from Firebase (e.g., 'template1', 'template2', etc.)
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  // Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    website?: string;
    summary?: string;
  };
  
  // Work Experience
  experience: Array<{
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  
  // Education
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description?: string[];
  }>;
  
  // Skills
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
  
  // Projects (optional)
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }>;
  
  // Certifications (optional)
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
  
  // Languages (optional)
  languages?: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
  
  // Custom Sections (optional)
  customSections?: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      description?: string;
      date?: string;
    }>;
  }>;
}

// Import schema types
export type { TemplateSchema, SectionType, LayoutType } from './templateSchema';
import { TemplateSchema } from './templateSchema';

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

