import { View, StyleSheet } from 'react-native';
import { Appbar, Menu, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { usePDFStore } from '@/store/pdfStore';
import { PDFViewerNative } from '@/components/PDFViewerNative';
import { useAIService } from '@/services/aiService';

export default function PDFScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pdfs, addAnnotation, updateAnnotation, deleteAnnotation } = usePDFStore();
  const { summarizePDF, explainPDF } = useAIService();
  const [menuVisible, setMenuVisible] = useState(false);
  const [aiDialogVisible, setAiDialogVisible] = useState(false);
  const [aiAction, setAiAction] = useState<'summarize' | 'explain' | null>(null);
  const [aiResult, setAiResult] = useState('');

  const pdf = pdfs.find(p => p.id === id);

  if (!pdf) {
    return null;
  }

  const handleAnnotationAdd = async (annotation: any) => {
    if (id) {
      await addAnnotation(id, annotation);
    }
  };

  const handleAnnotationUpdate = async (annotationId: string, updates: any) => {
    if (id) {
      await updateAnnotation(id, annotationId, updates);
    }
  };

  const handleAnnotationDelete = async (annotationId: string) => {
    if (id) {
      await deleteAnnotation(id, annotationId);
    }
  };

  const handleSummarize = async () => {
    setAiAction('summarize');
    setAiDialogVisible(true);
    try {
      const result = await summarizePDF(pdf.uri);
      setAiResult(result);
    } catch (error) {
      console.error('Error summarizing PDF:', error);
      setAiResult('Error summarizing PDF. Please try again.');
    }
  };

  const handleExplain = async () => {
    setAiAction('explain');
    setAiDialogVisible(true);
    try {
      const result = await explainPDF(pdf.uri);
      setAiResult(result);
    } catch (error) {
      console.error('Error explaining PDF:', error);
      setAiResult('Error explaining PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={pdf.name} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={handleSummarize} title="AI Summarize" />
          <Menu.Item onPress={handleExplain} title="AI Explain" />
        </Menu>
      </Appbar.Header>

      <PDFViewerNative 
        uri={pdf.uri} 
        annotations={pdf.annotations || []}
        onAnnotationAdd={handleAnnotationAdd}
        onAnnotationUpdate={handleAnnotationUpdate}
        onAnnotationDelete={handleAnnotationDelete}
      />

      <Portal>
        <Dialog
          visible={aiDialogVisible}
          onDismiss={() => {
            setAiDialogVisible(false);
            setAiResult('');
            setAiAction(null);
          }}
        >
          <Dialog.Title>
            {aiAction === 'summarize' ? 'PDF Summary' : 'PDF Explanation'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={aiResult}
              multiline
              numberOfLines={10}
              editable={false}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setAiDialogVisible(false);
              setAiResult('');
              setAiAction(null);
            }}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

