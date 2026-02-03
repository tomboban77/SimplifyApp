import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Menu, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { exportToPDF } from '@/services/pdfService';
import { isMeetingNotesDocument } from '@/utils/meetingNotesParser';

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documents, updateDocument, deleteDocument } = useDocumentStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isMeetingNotes, setIsMeetingNotes] = useState(false);

  const document = documents.find(d => d.id === id);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  useEffect(() => {
    if (document) {
      setIsMeetingNotes(isMeetingNotesDocument(document.content));
    }
  }, [document]);

  if (!document) {
    return null;
  }

  const handleSave = (content: string) => {
    updateDocument(id, { content });
  };

  const handleTitleEdit = () => {
    setTitleInput(document.title);
    setShowTitleDialog(true);
    setMenuVisible(false);
  };

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      updateDocument(id, { title: titleInput.trim() });
      setShowTitleDialog(false);
      setTitleInput('');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(document);
      setMenuVisible(false);
      Alert.alert('Success', 'PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document. Please try again.');
            }
          },
        },
      ]
    );
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleBack} iconColor="#ffffff" />
        <Appbar.Content title={document.title} titleStyle={styles.headerTitle} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              iconColor="#ffffff"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          {isMeetingNotes && (
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                router.push(`/create/meeting-notes?id=${id}`);
              }} 
              title="Edit Meeting Notes" 
              leadingIcon="calendar-edit"
            />
          )}
          <Menu.Item onPress={handleTitleEdit} title="Edit Title" leadingIcon="pencil" />
          <Menu.Item onPress={handleExportPDF} title="Export to PDF" leadingIcon="file-pdf-box" />
          <Menu.Item 
            onPress={handleDelete} 
            title="Delete Document" 
            leadingIcon="delete"
            titleStyle={{ color: '#d32f2f' }}
          />
        </Menu>
      </Appbar.Header>

      <MarkdownViewer 
        content={document.content} 
        isMeetingNotes={isMeetingNotes}
      />

      <Portal>
        <Dialog
          visible={showTitleDialog}
          onDismiss={() => {
            setShowTitleDialog(false);
            setTitleInput('');
          }}
        >
          <Dialog.Title>Edit Document Title</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={titleInput}
              onChangeText={setTitleInput}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowTitleDialog(false);
              setTitleInput('');
            }}>
              Cancel
            </Button>
            <Button onPress={handleTitleSave} disabled={!titleInput.trim()}>
              Save
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6200ee',
    elevation: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
});

