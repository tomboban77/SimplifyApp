import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput } from 'react-native';
import { TextInput, Appbar, Button, Portal, Dialog } from 'react-native-paper';

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  showHeader?: boolean;
}

export function RichTextEditor({ initialContent, onSave, showHeader = true }: RichTextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (text: string) => {
    setContent(text);
    onSave(text);
  };

  const applyFormat = (format: string) => {
    const { start, end } = selection;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    setShowFormatDialog(false);
    onSave(newContent);
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <Appbar.Header style={styles.toolbar}>
          <Appbar.Action
            icon="format-bold"
            onPress={() => setShowFormatDialog(true)}
          />
          <Appbar.Content title="Editor" />
          <Appbar.Action
            icon="content-save"
            onPress={() => onSave(content)}
          />
        </Appbar.Header>
      )}

      <ScrollView style={styles.scrollView}>
        <TextInput
          ref={inputRef}
          value={content}
          onChangeText={handleContentChange}
          onSelectionChange={(e) => {
            setSelection({
              start: e.nativeEvent.selection.start,
              end: e.nativeEvent.selection.end,
            });
          }}
          multiline
          mode="flat"
          style={styles.input}
          placeholder="Start typing..."
        />
      </ScrollView>

      <Portal>
        <Dialog
          visible={showFormatDialog}
          onDismiss={() => setShowFormatDialog(false)}
        >
          <Dialog.Title>Format Text</Dialog.Title>
          <Dialog.Content>
            <View style={styles.formatButtons}>
              <Button
                mode="outlined"
                onPress={() => applyFormat('bold')}
                style={styles.formatButton}
              >
                Bold
              </Button>
              <Button
                mode="outlined"
                onPress={() => applyFormat('italic')}
                style={styles.formatButton}
              >
                Italic
              </Button>
              <Button
                mode="outlined"
                onPress={() => applyFormat('heading1')}
                style={styles.formatButton}
              >
                Heading 1
              </Button>
              <Button
                mode="outlined"
                onPress={() => applyFormat('heading2')}
                style={styles.formatButton}
              >
                Heading 2
              </Button>
              <Button
                mode="outlined"
                onPress={() => applyFormat('heading3')}
                style={styles.formatButton}
              >
                Heading 3
              </Button>
              <Button
                mode="outlined"
                onPress={() => applyFormat('list')}
                style={styles.formatButton}
              >
                List
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFormatDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  toolbar: {
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  input: {
    minHeight: 400,
    padding: 20,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  formatButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formatButton: {
    margin: 4,
  },
});

