import { View, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import {
  Text,
  IconButton,
  Menu,
  Portal,
  Dialog,
  TextInput,
  Button,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { Resume } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '@/theme';

/**
 * Template color mapping for visual distinction
 */
const templateColors: Record<string, readonly string[] | string[]> = {
  template1: colors.gradients.primary,
  template2: colors.gradients.secondary,
  template3: colors.gradients.accent,
  template4: colors.gradients.ocean,
  template5: colors.gradients.sunrise,
};

const getTemplateGradient = (templateId: string): readonly string[] | string[] => {
  return templateColors[templateId] || colors.gradients.primary;
};

/**
 * Empty State Component
 */
function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[colors.primary.ghost, 'transparent']}
        style={styles.emptyGradient}
      >
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={48}
            color={colors.primary.main}
          />
        </View>
        <Text style={styles.emptyTitle}>No Resumes Yet</Text>
        <Text style={styles.emptyDescription}>
          Create your first professional resume and stand out from the crowd.
        </Text>
        <Pressable style={styles.emptyButton} onPress={onCreatePress}>
          <LinearGradient
            colors={[...colors.gradients.primary] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyButtonGradient}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={colors.text.inverse}
            />
            <Text style={styles.emptyButtonText}>Create Resume</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

/**
 * Resume Card Component
 */
interface ResumeCardProps {
  resume: Resume;
  onPress: () => void;
  onEdit: () => void;
  onEditTitle: () => void;
  onDelete: () => void;
  menuVisible: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
}

function ResumeCard({
  resume,
  onPress,
  onEdit,
  onEditTitle,
  onDelete,
  menuVisible,
  onMenuOpen,
  onMenuClose,
}: ResumeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradient = getTemplateGradient(resume.templateId);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const templateNumber = resume.templateId.replace('template', '');

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.resumeCard,
          pressed && styles.resumeCardPressed,
        ]}
      >
        {/* Left Gradient Accent */}
        <LinearGradient
          colors={[...gradient] as [string, string, ...string[]]}
          style={styles.cardAccent}
        />

        {/* Card Content */}
        <View style={styles.cardBody}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.templateBadge}>
                <LinearGradient
                  colors={[...gradient] as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.templateBadgeGradient}
                >
                  <Text style={styles.templateBadgeText}>T{templateNumber}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {resume.title}
              </Text>
            </View>

            {/* Menu */}
            <Menu
              visible={menuVisible}
              onDismiss={onMenuClose}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={onMenuOpen}
                  iconColor={colors.text.tertiary}
                  style={styles.menuButton}
                />
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item
                onPress={() => {
                  onMenuClose();
                  onEditTitle();
                }}
                title="Rename"
                leadingIcon="rename-box"
                titleStyle={styles.menuItemText}
              />
              <Menu.Item
                onPress={() => {
                  onMenuClose();
                  onEdit();
                }}
                title="Edit Content"
                leadingIcon="pencil-outline"
                titleStyle={styles.menuItemText}
              />
              <Menu.Item
                onPress={() => {
                  onMenuClose();
                  onDelete();
                }}
                title="Delete"
                leadingIcon="trash-can-outline"
                titleStyle={[styles.menuItemText, styles.menuItemDanger]}
              />
            </Menu>
          </View>

          {/* Meta Info */}
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={colors.text.tertiary}
              />
              <Text style={styles.metaText}>
                Updated {formatDateSafe(resume.updatedAt)}
              </Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="palette-outline"
                size={14}
                color={colors.text.tertiary}
              />
              <Text style={styles.metaText}>Template {templateNumber}</Text>
            </View>
          </View>

          {/* Quick Preview */}
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Click to preview & edit</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color={colors.primary.main}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * ResumesScreen - Premium Resume Management
 */
export default function ResumesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resumes, loadResumes, deleteResume, updateResume } = useResumeStore();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editTitleDialogVisible, setEditTitleDialogVisible] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await loadResumes();
      setLoading(false);
    };
    load();
  }, []);

  const handleCreateResume = () => {
    router.push('/resumes/questionnaire');
  };

  const handleResumePress = (resume: Resume) => {
    router.push(`/resumes/${resume.id}`);
  };

  const handleEditResume = (resume: Resume) => {
    router.push(`/resumes/${resume.id}/edit`);
  };

  const handleEditTitle = (resume: Resume) => {
    setEditingResume(resume);
    setNewTitle(resume.title);
    setEditTitleDialogVisible(true);
  };

  const handleSaveTitle = async () => {
    if (!editingResume || !newTitle.trim()) return;

    try {
      await updateResume(editingResume.id, { title: newTitle.trim() });
      setEditTitleDialogVisible(false);
      setEditingResume(null);
      setNewTitle('');
    } catch (error) {
      console.error('Error updating resume title:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResume(id);
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const renderResume = useCallback(
    ({ item }: { item: Resume }) => (
      <ResumeCard
        resume={item}
        onPress={() => handleResumePress(item)}
        onEdit={() => handleEditResume(item)}
        onEditTitle={() => handleEditTitle(item)}
        onDelete={() => handleDelete(item.id)}
        menuVisible={menuVisible === item.id}
        onMenuOpen={() => setMenuVisible(item.id)}
        onMenuClose={() => setMenuVisible(null)}
      />
    ),
    [menuVisible]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Resumes</Text>
          <Text style={styles.headerSubtitle}>
            {resumes.length > 0
              ? `${resumes.length} document${resumes.length > 1 ? 's' : ''}`
              : 'Your professional documents'}
          </Text>
        </View>
        {resumes.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={handleCreateResume}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={colors.primary.main}
            />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {resumes.length === 0 ? (
        <EmptyState onCreatePress={handleCreateResume} />
      ) : (
        <FlatList
          data={resumes}
          renderItem={renderResume}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}

      {/* FAB for quick access when scrolled */}
      {resumes.length > 3 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateResume}
          color={colors.text.inverse}
          customSize={56}
        />
      )}

      {/* Edit Title Dialog */}
      <Portal>
        <Dialog
          visible={editTitleDialogVisible}
          onDismiss={() => setEditTitleDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Rename Resume</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Resume Title"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              autoFocus
              placeholder="Enter a memorable name"
              outlineColor={colors.border.light}
              activeOutlineColor={colors.primary.main}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => {
                setEditTitleDialogVisible(false);
                setEditingResume(null);
                setNewTitle('');
              }}
              textColor={colors.text.secondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveTitle}
              disabled={!newTitle.trim()}
              buttonColor={colors.primary.main}
              style={styles.dialogSaveButton}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.default,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: colors.primary.muted,
  },

  // List
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },

  // Resume Card
  resumeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  resumeCardPressed: {
    backgroundColor: colors.interactive.hover,
    borderColor: colors.primary.muted,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateBadge: {
    marginRight: spacing.sm,
  },
  templateBadgeGradient: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBadgeText: {
    ...typography.labelSmall,
    color: colors.text.inverse,
    fontSize: 10,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  menuButton: {
    margin: -spacing.sm,
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

  // Meta Info
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: spacing.sm,
  },

  // Preview Row
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  previewLabel: {
    ...typography.labelMedium,
    color: colors.primary.main,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    padding: spacing.xl,
  },
  emptyGradient: {
    flex: 1,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    maxWidth: 280,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.primary,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.primary.main,
    borderRadius: radius.xl,
    ...shadows.primary,
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
  dialogInput: {
    backgroundColor: colors.background.paper,
  },
  dialogActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  dialogSaveButton: {
    borderRadius: radius.lg,
  },
});