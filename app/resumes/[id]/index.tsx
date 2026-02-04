import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Text, Menu, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { PaginatedResume } from '@/components/resume/PaginatedResume';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, typography } from '@/theme';

export default function ViewResumeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResume, deleteResume } = useResumeStore();
  const [menuVisible, setMenuVisible] = useState(false);

  const resume = getResume(id || '');

  const handleBack = useCallback(() => {
    // Always navigate to resumes tab to avoid going back to questionnaire/select-template
    router.replace('/(tabs)/resumes');
  }, [router]);

  if (!resume) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={handleBack}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Resume Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={48}
              color={colors.text.tertiary}
            />
          </View>
          <Text style={styles.notFoundTitle}>Resume Not Found</Text>
          <Text style={styles.notFoundText}>
            The resume you're looking for doesn't exist or has been deleted.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.goBackButton,
              pressed && styles.goBackButtonPressed,
            ]}
            onPress={handleBack}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </Pressable>
        </View>
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


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBack}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {resume.title}
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Pressable
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
              onPress={() => setMenuVisible(true)}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={handleEdit}
            title="Edit"
            leadingIcon="pencil-outline"
            titleStyle={styles.menuItemText}
          />
          <Menu.Item
            onPress={handleDelete}
            title="Delete"
            leadingIcon="trash-can-outline"
            titleStyle={[styles.menuItemText, styles.menuItemDanger]}
          />
        </Menu>
      </View>

      {/* Resume Preview */}
      <View style={styles.content}>
        <PaginatedResume templateId={resume.templateId} data={resume.data} />
      </View>

      {/* Floating Edit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={handleEdit}
      >
        <MaterialCommunityIcons
          name="pencil"
          size={24}
          color={colors.text.inverse}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.sunken,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonPressed: {
    backgroundColor: colors.interactive.hover,
  },
  menuContent: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    ...shadows.lg,
  },
  menuItemText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  menuItemDanger: {
    color: colors.error.main,
  },

  // Content
  content: {
    flex: 1,
  },

  // Not Found
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  notFoundIcon: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  notFoundTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  notFoundText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  goBackButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary.main,
  },
  goBackButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  goBackButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  fabPressed: {
    backgroundColor: colors.primary.dark,
  },
});