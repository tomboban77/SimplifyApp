import { ResumeData } from '@/types';
import { TemplateRenderer } from './TemplateRenderer';
import { useTemplateStore } from '@/store/templateStore';
import { View, Text, StyleSheet } from 'react-native';
// Fallback to old templates if schema is missing (temporary during migration)
import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';
import { Template4 } from './Template4';
import { Template5 } from './Template5';

interface ResumeTemplateProps {
  templateId: string;
  data: ResumeData;
}

/**
 * ResumeTemplate Component
 * 
 * Dynamically renders resume templates based on schema from Firebase.
 * Falls back to old templates if schema is missing (during migration period).
 */
export function ResumeTemplate({ templateId, data }: ResumeTemplateProps) {
  const { getTemplate } = useTemplateStore();
  const template = getTemplate(templateId);
  
  // If template not found, show error
  if (!template) {
    console.warn(`Template "${templateId}" not found in store.`);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Template not found: {templateId}</Text>
      </View>
    );
  }
  
  // If schema exists, use new TemplateRenderer
  if (template.schema) {
    return <TemplateRenderer schema={template.schema} data={data} />;
  }
  
  // Fallback to old templates if schema is missing (temporary during migration)
  console.warn(`Template "${templateId}" has no schema. Using fallback template.`);
  switch (templateId) {
    case 'template1':
      return <Template1 data={data} />;
    case 'template2':
      return <Template2 data={data} />;
    case 'template3':
      return <Template3 data={data} />;
    case 'template4':
      return <Template4 data={data} />;
    case 'template5':
      return <Template5 data={data} />;
    default:
      return <Template1 data={data} />;
  }
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
  },
});

