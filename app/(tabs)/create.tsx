import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { usePDFStore } from '@/store/pdfStore';

export default function GeneralScreen() {
  const router = useRouter();
  const { addPDF } = usePDFStore();
  const [uploading, setUploading] = useState(false);

  const handleCreateResume = () => {
    router.push('/resumes/questionnaire');
  };

  const handleCreateCoverLetter = () => {
    // No action for now - placeholder
    // TODO: Implement cover letter creation
  };

  const handleCreateMeetingNotes = () => {
    router.push('/create/meeting-notes');
  };

  const handleUploadPDF = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const pdf = await addPDF({
          name: result.assets[0].name,
          uri: result.assets[0].uri,
        });
        // Navigate to the uploaded PDF
        router.push(`/pdf/${pdf.id}`);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
    } finally {
      setUploading(false);
    }
  };

  const options = [
    {
      id: 'resume',
      title: 'Resume',
      description: 'Create a professional resume with customizable templates',
      icon: 'file-account',
      color: '#1976d2',
      onPress: handleCreateResume,
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      description: 'Coming soon - Create professional cover letters',
      icon: 'file-document-edit',
      color: '#2e7d32',
      onPress: handleCreateCoverLetter,
      disabled: true,
    },
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      description: 'Create structured meeting notes with action items',
      icon: 'calendar-text',
      color: '#ed6c02',
      onPress: handleCreateMeetingNotes,
    },
    {
      id: 'pdf',
      title: 'Upload PDF',
      description: 'Upload and annotate PDF documents',
      icon: 'file-pdf-box',
      color: '#d32f2f',
      onPress: handleUploadPDF,
    },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="General" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.title}>
          Create New
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose what you'd like to create
        </Text>

        {options.map((option) => (
          <Card
            key={option.id}
            style={[
              styles.optionCard,
              option.disabled && styles.optionCardDisabled,
            ]}
            onPress={option.disabled ? undefined : option.onPress}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${option.color}15` }]}>
                <Text style={[styles.icon, { color: option.color }]}>
                  {option.id === 'resume' && '📄'}
                  {option.id === 'cover-letter' && '✉️'}
                  {option.id === 'meeting-notes' && '📝'}
                  {option.id === 'pdf' && '📑'}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={styles.optionTitle}>
                  {option.title}
                </Text>
                <Text variant="bodySmall" style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {option.disabled && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
              {option.id === 'pdf' && uploading && (
                <View style={styles.uploadingBadge}>
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
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
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#757575',
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#757575',
    lineHeight: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  comingSoonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  uploadingBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});
