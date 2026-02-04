import { View, StyleSheet, FlatList, Pressable, Animated, Platform } from 'react-native';
import {
  Text,
  Searchbar,
  IconButton,
  Menu,
  Snackbar,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useResumeStore } from '@/store/resumeStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useOffline } from '@/hooks/useOffline';
import { DocumentSkeleton } from '@/components/SkeletonLoader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, typography } from '@/theme';

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
  type: 'document' | 'resume';
  route: string;
};

/**
 * Type configuration for document types
 */
const getTypeConfig = (type: DocumentItem['type']) => {
  switch (type) {
    case 'resume':
      return {
        label: 'Resume',
        icon: 'file-account-outline' as const,
        color: colors.primary.main,
        bgColor: colors.primary.muted,
      };
    default:
      return {
        label: 'Document',
        icon: 'file-document-outline' as const,
        color: colors.secondary.main,
        bgColor: colors.secondary.muted,
      };
  }
};

/**
 * Document Card Component
 */
interface DocumentCardProps {
  item: DocumentItem;
  onPress: () => void;
  onDelete: () => void;
  menuVisible: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
}

function DocumentCard({
  item,
  onPress,
  onDelete,
  menuVisible,
  onMenuOpen,
  onMenuClose,
}: DocumentCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const typeConfig = getTypeConfig(item.type);

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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          { borderLeftColor: typeConfig.color },
          pressed && styles.cardPressed,
        ]}
      >
        {/* Icon */}
        <View style={[styles.cardIcon, { backgroundColor: typeConfig.bgColor }]}>
          <MaterialCommunityIcons
            name={typeConfig.icon}
            size={24}
            color={typeConfig.color}
          />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
              <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
                {typeConfig.label}
              </Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.dateText}>{formatDateSafe(item.updatedAt)}</Text>
          </View>
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
              onPress();
            }}
            title="Open"
            leadingIcon="open-in-new"
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
      </Pressable>
    </Animated.View>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="folder-open-outline"
          size={48}
          color={colors.text.tertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Documents Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first document to get started
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.emptyButton,
          pressed && styles.emptyButtonPressed,
        ]}
        onPress={() => router.push('/(tabs)/create')}
      >
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={colors.text.inverse}
        />
        <Text style={styles.emptyButtonText}>Create Document</Text>
      </Pressable>
    </View>
  );
}

/**
 * DocumentsScreen - Main documents list
 */
export default function DocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { documents, loadDocuments, deleteDocument } = useDocumentStore();
  const { resumes, loadResumes, deleteResume } = useResumeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const handleError = useErrorHandler({ showAlert: false });
  const isOffline = useOffline();

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await Promise.all([loadDocuments(), loadResumes()]);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Combine all documents into a single list
  const allDocuments = useMemo<DocumentItem[]>(() => {
    const items: DocumentItem[] = [
      ...documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt,
        type: 'document' as const,
        route: `/editor/${doc.id}`,
      })),
      ...resumes.map((resume) => ({
        id: resume.id,
        title: resume.title,
        updatedAt: resume.updatedAt,
        type: 'resume' as const,
        route: `/resumes/${resume.id}`,
      })),
    ];

    // Sort by updated date (newest first)
    return items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documents, resumes]);

  const filteredDocuments = allDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (item: DocumentItem) => {
    try {
      if (item.type === 'resume') {
        await deleteResume(item.id);
      } else {
        await deleteDocument(item.id);
      }
      setSnackbarMessage(
        `${getTypeConfig(item.type).label} deleted successfully`
      );
      setSnackbarVisible(true);
    } catch (error) {
      handleError(
        error,
        `Failed to delete ${getTypeConfig(item.type).label.toLowerCase()}. Please try again.`
      );
    }
  };

  const renderDocument = useCallback(
    ({ item }: { item: DocumentItem }) => (
      <DocumentCard
        item={item}
        onPress={() => router.push(item.route)}
        onDelete={() => handleDelete(item)}
        menuVisible={menuVisible === `${item.type}-${item.id}`}
        onMenuOpen={() => setMenuVisible(`${item.type}-${item.id}`)}
        onMenuClose={() => setMenuVisible(null)}
      />
    ),
    [menuVisible]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Documents</Text>
          <Text style={styles.headerSubtitle}>
            {allDocuments.length > 0
              ? `${allDocuments.length} item${allDocuments.length > 1 ? 's' : ''}`
              : 'All your files in one place'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.settingsButtonPressed,
          ]}
          onPress={() => router.push('/settings')}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={22}
            color={colors.text.secondary}
          />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search documents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={colors.text.tertiary}
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <DocumentSkeleton key={i} />
          ))}
        </View>
      ) : filteredDocuments.length === 0 && searchQuery === '' ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderDocument}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons
                name="file-search-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text style={styles.noResultsText}>
                No documents match "{searchQuery}"
              </Text>
            </View>
          }
        />
      )}

      {/* Offline Snackbar */}
      {isOffline && (
        <Snackbar
          visible={isOffline}
          onDismiss={() => {}}
          duration={Number.MAX_SAFE_INTEGER}
          style={styles.offlineSnackbar}
        >
          You're offline. Changes will sync when you're back online.
        </Snackbar>
      )}

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create')}
        color={colors.text.inverse}
        customSize={56}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.background.sunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonPressed: {
    backgroundColor: colors.border.light,
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchbar: {
    borderRadius: radius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.light,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },

  // List
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  cardPressed: {
    backgroundColor: colors.interactive.hover,
    borderColor: colors.primary.muted,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    ...typography.labelSmall,
    fontSize: 10,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.text.tertiary,
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

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: colors.background.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.primary,
  },
  emptyButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  emptyButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  noResultsText: {
    ...typography.bodyMedium,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
  },

  // Snackbars
  offlineSnackbar: {
    backgroundColor: colors.warning.main,
  },
  snackbar: {
    backgroundColor: colors.neutral[800],
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: Platform.OS === 'ios' ? 75 : 70, // Position above tab bar
    backgroundColor: colors.primary.main,
    borderRadius: radius.xl,
    zIndex: 1000,
    elevation: 8,
    ...shadows.primary,
  },
});