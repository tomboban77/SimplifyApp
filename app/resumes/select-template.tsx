import { View, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { Appbar, Card, Text, Button, Surface, TextInput, Dialog, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { TemplatePreview } from '@/components/resume/TemplatePreview';

const { width } = Dimensions.get('window');
const cardWidth = width - 24; // Wider cards with less margin

const templates = [
  {
    id: 'template1',
    name: 'Classic Professional',
    description: 'Traditional single-column layout trusted by Fortune 500 recruiters. Clean black typography, ATS-optimized.',
    badge: 'Most Popular',
  },
  {
    id: 'template2',
    name: 'Modern Executive',
    description: 'Sophisticated navy blue design for senior professionals. Bold header with elegant section styling.',
    badge: 'Executive',
  },
  {
    id: 'template3',
    name: 'Minimalist',
    description: 'Ultra-clean design with elegant whitespace. Perfect for letting your content speak for itself.',
    badge: null,
  },
  {
    id: 'template4',
    name: 'Corporate',
    description: 'Classic authoritative layout ideal for law, finance, consulting, and corporate positions.',
    badge: null,
  },
  {
    id: 'template5',
    name: 'Bold Professional',
    description: 'Eye-catching design with red accent header. Modern section styling with subtle backgrounds.',
    badge: 'Creative',
  },
];

export default function SelectTemplateScreen() {
  const router = useRouter();
  const { addResume } = useResumeStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [resumeName, setResumeName] = useState('');

  const handleContinue = () => {
    if (selectedTemplate) {
      const defaultName = templates.find(t => t.id === selectedTemplate)?.name || 'Resume';
      setResumeName(`My Resume - ${defaultName}`);
      setNameDialogVisible(true);
    }
  };

  const handleCreateResume = async () => {
    if (!selectedTemplate) return;
    
    setNameDialogVisible(false);
    setLoading(true);
    try {
      const newResume = await addResume({
        title: resumeName.trim() || `My Resume - ${templates.find(t => t.id === selectedTemplate)?.name}`,
        templateId: selectedTemplate,
        data: {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
          customSections: [],
        },
      });
      router.replace(`/resumes/${newResume.id}/edit`);
    } catch (error) {
      console.error('Error creating resume:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Choose Template" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Select a Template
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          All templates are ATS-friendly and professionally designed
        </Text>

        <View style={styles.templatesList}>
          {templates.map((template) => (
            <Card
              key={template.id}
              style={[
                styles.templateCard,
                { width: cardWidth },
                selectedTemplate === template.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedTemplate(template.id)}
              mode="outlined"
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.nameRow}>
                      <Text variant="titleLarge" style={styles.templateName}>
                        {template.name}
                      </Text>
                      {template.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{template.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text variant="bodyMedium" style={styles.templateDescription}>
                      {template.description}
                    </Text>
                  </View>
                  {selectedTemplate === template.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.previewContainer}>
                  <TemplatePreview templateId={template.id} />
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedTemplate || loading}
          loading={loading}
          style={styles.continueButton}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          {selectedTemplate 
            ? `Continue with ${templates.find(t => t.id === selectedTemplate)?.name}`
            : 'Select a Template'
          }
        </Button>
      </View>

      {/* Name Dialog */}
      <Portal>
        <Dialog visible={nameDialogVisible} onDismiss={() => setNameDialogVisible(false)}>
          <Dialog.Title>Name Your Resume</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Resume Name"
              value={resumeName}
              onChangeText={setResumeName}
              mode="outlined"
              autoFocus
              placeholder="Enter resume name"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNameDialogVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleCreateResume}
              disabled={!resumeName.trim()}
            >
              Create
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 100, // Space for sticky footer
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 13,
  },
  templatesList: {
    marginBottom: 16,
  },
  templateCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    elevation: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  templateName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1e3a5f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  templateDescription: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 430,
    width: '100%',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    paddingVertical: 16,
    // Subtle inner shadow effect
    borderWidth: 1,
    borderColor: '#e4e6e9',
  },
  // Sticky Footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  continueButtonContent: {
    paddingVertical: 6,
  },
  continueButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});