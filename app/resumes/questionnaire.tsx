import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button, Chip, TextInput, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, typography } from '@/theme';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Sales',
  'Engineering',
  'Design',
  'Consulting',
  'Legal',
  'Real Estate',
  'Hospitality',
  'Manufacturing',
  'Retail',
  'Other',
];

const roles = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Executive',
  'Manager',
  'Director',
  'Intern',
  'Freelancer',
  'Other',
];

export default function QuestionnaireScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);

  const handleIndustrySelect = (industry: string) => {
    if (industry === 'Other') {
      setShowCustomIndustry(true);
      setSelectedIndustry(null);
    } else {
      setSelectedIndustry(industry);
      setShowCustomIndustry(false);
      setCustomIndustry('');
    }
  };

  const handleRoleSelect = (role: string) => {
    if (role === 'Other') {
      setShowCustomRole(true);
      setSelectedRole(null);
    } else {
      setSelectedRole(role);
      setShowCustomRole(false);
      setCustomRole('');
    }
  };

  const handleCustomIndustrySave = () => {
    if (customIndustry.trim()) {
      setSelectedIndustry(customIndustry.trim());
      setShowCustomIndustry(false);
    }
  };

  const handleCustomRoleSave = () => {
    if (customRole.trim()) {
      setSelectedRole(customRole.trim());
      setShowCustomRole(false);
    }
  };

  const handleContinue = () => {
    const filters = {
      industry: selectedIndustry || null,
      role: selectedRole || null,
    };
    router.push({
      pathname: '/resumes/select-template',
      params: filters,
    });
  };

  const handleSkip = () => {
    router.push('/resumes/select-template');
  };

  const canContinue = selectedIndustry && selectedRole;

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
        <Text style={styles.headerTitle}>Tell Us About You</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="compass-outline"
              size={32}
              color={colors.primary.main}
            />
          </View>
          <Text style={styles.heroTitle}>Let's Find Your Perfect Resume</Text>
          <Text style={styles.heroSubtitle}>
            Help us recommend the best template for your career goals
          </Text>
        </View>

        {/* Industry Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="domain"
              size={20}
              color={colors.primary.main}
            />
            <Text style={styles.sectionTitle}>What Industry?</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the industry you're targeting
          </Text>
          <View style={styles.chipContainer}>
            {industries.map((industry) => (
              <Pressable
                key={industry}
                style={({ pressed }) => [
                  styles.chip,
                  selectedIndustry === industry && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => handleIndustrySelect(industry)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedIndustry === industry && styles.chipTextSelected,
                  ]}
                >
                  {industry}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedIndustry && selectedIndustry !== 'Other' && (
            <View style={styles.selectedBadge}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={colors.success.main}
              />
              <Text style={styles.selectedBadgeText}>{selectedIndustry}</Text>
            </View>
          )}
        </View>

        {/* Role Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-tie"
              size={20}
              color={colors.secondary.main}
            />
            <Text style={styles.sectionTitle}>What Role Level?</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose your experience level
          </Text>
          <View style={styles.chipContainer}>
            {roles.map((role) => (
              <Pressable
                key={role}
                style={({ pressed }) => [
                  styles.chip,
                  selectedRole === role && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => handleRoleSelect(role)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedRole === role && styles.chipTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedRole && selectedRole !== 'Other' && (
            <View style={styles.selectedBadge}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={colors.success.main}
              />
              <Text style={styles.selectedBadgeText}>{selectedRole}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
            pressed && canContinue && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={canContinue ? colors.text.inverse : colors.text.disabled}
          />
        </Pressable>
      </View>

      {/* Custom Industry Dialog */}
      <Portal>
        <Dialog
          visible={showCustomIndustry}
          onDismiss={() => setShowCustomIndustry(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Custom Industry</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter Industry"
              value={customIndustry}
              onChangeText={setCustomIndustry}
              mode="outlined"
              autoFocus
              placeholder="e.g., Aerospace, Non-profit"
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setShowCustomIndustry(false)}
              textColor={colors.text.secondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCustomIndustrySave}
              disabled={!customIndustry.trim()}
              buttonColor={colors.primary.main}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Custom Role Dialog */}
      <Portal>
        <Dialog
          visible={showCustomRole}
          onDismiss={() => setShowCustomRole(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Custom Role</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter Role Level"
              value={customRole}
              onChangeText={setCustomRole}
              mode="outlined"
              autoFocus
              placeholder="e.g., Consultant, Specialist"
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setShowCustomRole(false)}
              textColor={colors.text.secondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCustomRoleSave}
              disabled={!customRole.trim()}
              buttonColor={colors.primary.main}
            >
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
    backgroundColor: colors.background.default,
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

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Section
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.sunken,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  chipPressed: {
    backgroundColor: colors.interactive.pressed,
  },
  chipText: {
    ...typography.labelMedium,
    color: colors.text.primary,
  },
  chipTextSelected: {
    color: colors.text.inverse,
  },

  // Selected Badge
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.success.bg,
    borderRadius: radius.lg,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    ...typography.labelMedium,
    color: colors.success.dark,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.lg,
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  skipButtonPressed: {
    backgroundColor: colors.interactive.hover,
  },
  skipButtonText: {
    ...typography.labelLarge,
    color: colors.text.secondary,
  },
  continueButton: {
    flex: 2,
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