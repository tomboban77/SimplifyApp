import { ResumeData } from '@/types';
import { useTemplateStore } from '@/store/templateStore';
import { View, Text, StyleSheet } from 'react-native';
import { getTemplateComponent } from './templateRegistry';

interface ResumeTemplateProps {
  templateId: string;
  data: ResumeData;
}

/**
 * ResumeTemplate Component
 * 
 * Renders resume templates by mapping templateId to actual component files.
 * Templates are stored as component files, not schemas, ensuring exact style matching.
 * 
 * To add new templates:
 * 1. Create Template6.tsx, Template7.tsx, etc. in this directory
 * 2. Add them to templateRegistry.tsx
 * 3. Seed metadata to Firebase (no UI code needed)
 */
export function ResumeTemplate({ templateId, data }: ResumeTemplateProps) {
  const { getTemplate } = useTemplateStore();
  const template = getTemplate(templateId);
  
  // Check if template exists in Firebase metadata
  if (!template) {
    console.warn(`Template "${templateId}" not found in store.`);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Template not found: {templateId}</Text>
      </View>
    );
  }
  
  // Get the actual component from registry
  const TemplateComponent = getTemplateComponent(templateId);
  
  if (!TemplateComponent) {
    console.warn(`Template component "${templateId}" not found in registry.`);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Template component not available: {templateId}</Text>
        <Text style={styles.errorHint}>Please ensure the template component file exists.</Text>
      </View>
    );
  }
  
  // Render the actual component directly
  return <TemplateComponent data={data} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 40,
    minHeight: 842,
    width: 595,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
  },
  errorHint: {
    color: '#666666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

