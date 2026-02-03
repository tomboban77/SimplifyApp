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
  type: 'text' | 'highlight' | 'signature';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  page?: number;
  createdAt: string;
}

