import { View, StyleSheet } from 'react-native';
import { Appbar, Menu, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { PaginatedResume } from '@/components/resume/PaginatedResume';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export default function ViewResumeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResume, deleteResume } = useResumeStore();
  const [menuVisible, setMenuVisible] = useState(false);

  const resume = getResume(id || '');

  if (!resume) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Resume Not Found" />
        </Appbar.Header>
      </View>
    );
  }

  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/resumes/${resume.id}/edit`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${resume.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteResume(resume.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
        </head>
        <body>
          <h1>${resume.title}</h1>
          <p>Resume export feature coming soon.</p>
        </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export resume');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={resume.title} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
          <Menu.Item onPress={handleExport} title="Export" leadingIcon="download" />
          <Menu.Item
            onPress={handleDelete}
            title="Delete"
            leadingIcon="delete"
            titleStyle={{ color: '#d32f2f' }}
          />
        </Menu>
      </Appbar.Header>

      <PaginatedResume templateId={resume.templateId} data={resume.data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

