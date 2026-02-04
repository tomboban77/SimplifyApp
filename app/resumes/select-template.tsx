import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Text, Button, TextInput, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { useTemplateStore } from '@/store/templateStore';
import { TemplatePreview } from '@/components/resume/TemplatePreview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, typography } from '@/theme';

const { width } = Dimensions.get('window');
const cardWidth = width - spacing.xl * 2;

export default function SelectTemplateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      return { recommendedTemplates: templates, otherTemplates: [], allTemplates: templates };
    }

    const recommended: typeof templates = [];
    const other: typeof templates = [];

    templates.forEach((template) => {
      const matchesIndustry = !params.industry || template.industries.some(
        ind => ind.toLowerCase() === params.industry!.toLowerCase()
      );
      const matchesRole = !params.role || template.roles.some(
        r => r.toLowerCase() === params.role!.toLowerCase()
      );

      if (matchesIndustry && matchesRole) {
        recommended.push(template);
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

  const renderTemplateCard = (template: typeof templates[0], isRecommended = false) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <Pressable
        key={template.id}
        style={({ pressed }) => [
          styles.templateCard,
          isSelected && styles.templateCardSelected,
          isRecommended && styles.templateCardRecommended,
          pressed && styles.templateCardPressed,
        ]}
        onPress={() => setSelectedTemplate(template.id)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.nameRow}>
              <Text style={styles.templateName}>{template.name}</Text>
              {template.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{template.badge}</Text>
                </View>
              )}
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color={colors.text.inverse}
                  />
                  <Text style={styles.recommendedBadgeText}>Recommended</Text>
                </View>
              )}
            </View>
            <Text style={styles.templateDescription} numberOfLines={2}>
              {template.description}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={colors.text.inverse}
              />
            </View>
          )}
        </View>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <TemplatePreview templateId={template.id} />
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading templates...</Text>
      </View>
    );
  }

  if (templates.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Choose Template</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={48}
              color={colors.text.tertiary}
            />
          </View>
          <Text style={styles.emptyTitle}>No Templates Available</Text>
          <Text style={styles.emptyText}>
            Templates need to be configured in Firebase.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Template</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {params.industry || params.role ? 'Recommended Templates' : 'Select a Template'}
          </Text>
          <Text style={styles.subtitle}>
            {params.industry || params.role 
              ? `Templates best suited for ${params.role ? params.role : ''}${params.industry && params.role ? ' in ' : ''}${params.industry ? params.industry : ''}`
              : 'All templates are ATS-friendly and professionally designed'
            }
          </Text>
        </View>

        {/* All Templates (no filters) */}
        {(!params.industry && !params.role) && (
          <View style={styles.templatesList}>
            {allTemplates.map((template) => renderTemplateCard(template))}
          </View>
        )}

        {/* Recommended Templates */}
        {(params.industry || params.role) && recommendedTemplates.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <MaterialCommunityIcons
                  name="star"
                  size={20}
                  color={colors.secondary.main}
                />
                <Text style={styles.sectionTitle}>Recommended for You</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {recommendedTemplates.length}
                </Text>
              </View>
            </View>
            <View style={styles.templatesList}>
              {recommendedTemplates.map((template) => renderTemplateCard(template, true))}
            </View>
          </>
        )}

        {/* Other Templates */}
        {otherTemplates.length > 0 && (
          <>
            {(params.industry || params.role) && (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <MaterialCommunityIcons
                    name="file-document-multiple-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.sectionTitle}>Other Templates</Text>
                </View>
              </View>
            )}
            <View style={styles.templatesList}>
              {otherTemplates.map((template) => renderTemplateCard(template))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !selectedTemplate && styles.continueButtonDisabled,
            pressed && selectedTemplate && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!selectedTemplate || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <>
              <Text
                style={[
                  styles.continueButtonText,
                  !selectedTemplate && styles.continueButtonTextDisabled,
                ]}
              >
                {selectedTemplate 
                  ? `Continue with ${allTemplates.find(t => t.id === selectedTemplate)?.name || 'Template'}`
                  : 'Select a Template'
                }
              </Text>
              {selectedTemplate && (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={colors.text.inverse}
                />
              )}
            </>
          )}
        </Pressable>
      </View>

      {/* Name Dialog */}
      <Portal>
        <Dialog
          visible={nameDialogVisible}
          onDismiss={() => setNameDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Name Your Resume</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Resume Name"
              value={resumeName}
              onChangeText={setResumeName}
              mode="outlined"
              autoFocus
              placeholder="Enter resume name"
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setNameDialogVisible(false)}
              textColor={colors.text.secondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateResume}
              disabled={!resumeName.trim()}
              buttonColor={colors.primary.main}
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
    backgroundColor: colors.background.default,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.paper,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.interactive.hover,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 120,
  },

  // Title Section
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.secondary.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  countBadgeText: {
    ...typography.labelSmall,
    color: colors.secondary.dark,
  },

  // Templates List
  templatesList: {
    gap: spacing.lg,
  },

  // Template Card
  templateCard: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  templateCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    ...shadows.md,
  },
  templateCardRecommended: {
    borderColor: colors.secondary.main,
  },
  templateCardPressed: {
    backgroundColor: colors.interactive.hover,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  templateName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.info.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.info.dark,
    fontSize: 9,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  recommendedBadgeText: {
    ...typography.labelSmall,
    color: colors.text.inverse,
    fontSize: 9,
  },
  templateDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 430,
    backgroundColor: colors.background.sunken,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: spacing.lg,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary.main,
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
  continueButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  continueButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },
  continueButtonTextDisabled: {
    color: colors.text.disabled,
  },

  // Loading
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },

  // Empty
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: colors.background.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Dialog
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: radius['2xl'],
  },
  dialogTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  dialogActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});