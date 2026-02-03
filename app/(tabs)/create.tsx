import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Button, Text, TextInput, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useAIService } from '@/services/aiService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function CreateScreen() {
  const router = useRouter();
  const { createDocument } = useDocumentStore();
  const { generateDocument } = useAIService();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const handleError = useErrorHandler({ showAlert: false });

  const extractTitle = (prompt: string): string => {
    // Try to extract a title from the prompt
    const lines = prompt.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // If first line is short and looks like a title, use it
      if (firstLine.length < 60 && !firstLine.includes('.')) {
        return firstLine;
      }
    }
    // Otherwise, use first few words of prompt
    const words = prompt.trim().split(/\s+/).slice(0, 5).join(' ');
    return words.length > 0 ? words : 'New Document';
  };

  const handleCreateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const content = await generateDocument(prompt);
      const title = extractTitle(prompt);
      const doc = await createDocument({
        title,
        content,
      });
      router.push(`/editor/${doc.id}`);
    } catch (error) {
      handleError(error);
      setSnackbarMessage('Failed to create document. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateName: string, templatePrompt: string) => {
    setLoadingTemplate(templateName);
    try {
      // For Meeting Notes, go to dedicated screen
      if (templateName === 'Meeting Notes') {
        router.push('/create/meeting-notes');
        return;
      }
      
      const content = await generateDocument(templatePrompt);
      const doc = await createDocument({
        title: templateName,
        content,
      });
      router.push(`/editor/${doc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setLoadingTemplate(null);
    }
  };

  const templates = [
    { name: 'Meeting Notes', prompt: 'Create a professional meeting notes template' },
    { name: 'Business Letter', prompt: 'Create a formal business letter template' },
    { name: 'Resume', prompt: 'Create a professional resume template' },
    { name: 'Blog Post', prompt: 'Create a blog post template' },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Document" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              AI Prompt
            </Text>
            <TextInput
              label="Describe what you want to create"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleCreateFromPrompt}
              loading={loading}
              disabled={loading || !prompt.trim()}
              style={styles.button}
            >
              Generate Document
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Templates
            </Text>
            {templates.map((template) => (
              <Button
                key={template.name}
                mode="outlined"
                onPress={() => handleCreateFromTemplate(template.name, template.prompt)}
                loading={loadingTemplate === template.name}
                disabled={loadingTemplate !== null}
                style={styles.templateButton}
              >
                {template.name}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Voice Input
            </Text>
            <Button
              mode="outlined"
              icon="microphone"
              onPress={() => router.push('/create/voice')}
              style={styles.button}
            >
              Start Recording
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  templateButton: {
    marginBottom: 8,
  },
});

