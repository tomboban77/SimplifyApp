export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PDF {
  id: string;
  name: string;
  uri: string;
  annotations?: PDFAnnotation[];
  createdAt: string;
  updatedAt: string;
}

export interface PDFAnnotation {
  id: string;
  type: 'text' | 'signature';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  page?: number;
  createdAt: string;
  // Text annotation properties
  fontSize?: number;
  // Signature as image data (base64)
  imageData?: string;
}

export interface Resume {
  id: string;
  title: string;
  templateId: string; // 'template1' | 'template2' | 'template3' | 'template4' | 'template5'
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

