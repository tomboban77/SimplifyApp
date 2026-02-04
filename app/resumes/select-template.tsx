import { View, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { Appbar, Card, Text, Button, Surface, TextInput, Dialog, Portal, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { useTemplateStore } from '@/store/templateStore';
import { TemplatePreview } from '@/components/resume/TemplatePreview';

const { width } = Dimensions.get('window');
const cardWidth = width - 24; // Wider cards with less margin

export default function SelectTemplateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ industry?: string; role?: string }>();
  const { addResume } = useResumeStore();
  const { templates, loadTemplates, isLoading } = useTemplateStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates based on questionnaire answers
  const { recommendedTemplates, otherTemplates, allTemplates } = useMemo(() => {
    if (!params.industry && !params.role) {
      // No filters - show all templates
      return { recommendedTemplates: templates, otherTemplates: [], allTemplates: templates };
    }

    const recommended: TemplateMetadata[] = [];
    const other: TemplateMetadata[] = [];

    templates.forEach((template) => {
      const matchesIndustry = !params.industry || template.industries.some(
        ind => ind.toLowerCase() === params.industry!.toLowerCase()
      );
      const matchesRole = !params.role || template.roles.some(
        r => r.toLowerCase() === params.role!.toLowerCase()
      );

      if (matchesIndustry && matchesRole) {
        recommended.push(template);
      } else if (matchesIndustry || matchesRole) {
        other.push(template);
      } else {
        other.push(template);
      }
    });

    return { 
      recommendedTemplates: recommended, 
      otherTemplates: other,
      allTemplates: [...recommended, ...other]
    };
  }, [params.industry, params.role, templates]);

  const handleContinue = () => {
    if (selectedTemplate) {
      const defaultName = allTemplates.find(t => t.id === selectedTemplate)?.name || 'Resume';
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
        title: resumeName.trim() || `My Resume - ${allTemplates.find(t => t.id === selectedTemplate)?.name}`,
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading templates...</Text>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text variant="titleLarge" style={styles.emptyTitle}>No Templates Available</Text>
          <Text style={styles.emptyText}>
            Templates need to be configured in Firebase.{'\n'}
            Please ensure Firebase is properly configured and templates are seeded.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            {params.industry || params.role ? 'Recommended Templates' : 'Select a Template'}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {params.industry || params.role 
              ? `Templates best suited for ${params.role ? params.role : ''}${params.industry && params.role ? ' in ' : ''}${params.industry ? params.industry : ''}`
              : 'All templates are ATS-friendly and professionally designed'
            }
          </Text>

        {(!params.industry && !params.role) && (
          <View style={styles.templatesList}>
            {allTemplates.map((template) => (
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
        )}

        {(params.industry || params.role) && recommendedTemplates.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Recommended for You
              </Text>
              <Chip icon="star" style={styles.recommendedChip} textStyle={styles.recommendedChipText}>
                {recommendedTemplates.length} {recommendedTemplates.length === 1 ? 'template' : 'templates'}
              </Chip>
            </View>
            <View style={styles.templatesList}>
              {recommendedTemplates.map((template) => (
                <Card
                  key={template.id}
                  style={[
                    styles.templateCard,
                    { width: cardWidth },
                    selectedTemplate === template.id && styles.selectedCard,
                    styles.recommendedCard,
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
                          <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedBadgeText}>Recommended</Text>
                          </View>
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
          </>
        )}

        {otherTemplates.length > 0 && (
          <>
            {(params.industry || params.role) && (
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Other Templates
                </Text>
              </View>
            )}
            <View style={styles.templatesList}>
              {otherTemplates.map((template) => (
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
          </>
        )}
        </ScrollView>
      )}

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
            ? `Continue with ${allTemplates.find(t => t.id === selectedTemplate)?.name || 'Template'}`
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
    fontSize: 16,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  recommendedChip: {
    backgroundColor: '#fff3e0',
    height: 28,
  },
  recommendedChipText: {
    color: '#e65100',
    fontSize: 11,
    fontWeight: '600',
  },
  recommendedCard: {
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  recommendedBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});