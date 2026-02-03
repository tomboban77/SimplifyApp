import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Menu, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';
import { usePDFStore } from '@/store/pdfStore';
import { PDFViewer } from '@/components/PDFViewer';
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

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/pdfs');
    }
  }, [router]);

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

  const handleSavePDF = () => {
    if (!pdf.annotations || pdf.annotations.length === 0) {
      Alert.alert('No Annotations', 'There are no annotations to save.');
      setMenuVisible(false);
      return;
    }

    Alert.alert(
      'Annotations Saved',
      `Your ${pdf.annotations.length} annotation(s) have been saved with this PDF. They will be preserved when you open this PDF again.`,
      [{ text: 'OK', onPress: () => setMenuVisible(false) }]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
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
          <Menu.Item 
            onPress={handleSavePDF} 
            title="Save Annotations" 
            leadingIcon="content-save"
            disabled={!pdf.annotations || pdf.annotations.length === 0}
          />
        </Menu>
      </Appbar.Header>

      <PDFViewer 
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

