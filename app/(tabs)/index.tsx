import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import { Text, Menu, Snackbar } from 'react-native-paper';
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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
  type: 'document' | 'resume';
  route: string;
};

// ─── Palette ────────────────────────────────────────────
// Warm sand base + deep navy header + rich accents
const palette = {
  // Backgrounds
  pageBg: '#F6F4F0',          // Warm ivory/sand
  headerBg: '#1B1F3B',        // Deep navy for header contrast
  headerBgEnd: '#2A2F52',
  cardBg: '#FFFFFF',
  cardBgPressed: '#FAFAF8',
  surfaceMuted: '#EFEДЕ9',     // Subtle warm grey

  // Borders
  border: 'rgba(0, 0, 0, 0.06)',
  borderMedium: 'rgba(0, 0, 0, 0.10)',
  borderOnDark: 'rgba(255, 255, 255, 0.12)',

  // Accent colors
  indigo: '#4F46E5',
  indigoLight: '#6366F1',
  indigoMuted: 'rgba(79, 70, 229, 0.08)',
  indigoBg: 'rgba(79, 70, 229, 0.06)',

  teal: '#0D9488',
  tealLight: '#14B8A6',
  tealMuted: 'rgba(13, 148, 136, 0.08)',
  tealBg: 'rgba(13, 148, 136, 0.06)',

  coral: '#E87461',
  coralMuted: 'rgba(232, 116, 97, 0.08)',

  amber: '#D97706',
  amberMuted: 'rgba(217, 119, 6, 0.08)',

  // Text
  textDark: '#1A1D2E',
  textMedium: '#4A4D5E',
  textLight: '#8B8E9F',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255, 255, 255, 0.7)',

  // Utility
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.08)',
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
        color: palette.indigo,
        accentGradient: [palette.indigo, palette.indigoLight] as [string, string],
        useGradientIcon: true,
      };
    default:
      return {
        label: 'Document',
        icon: 'file-document-outline' as const,
        color: palette.coral,
        accentGradient: [palette.coral, '#F97316'] as [string, string],
        useGradientIcon: true,
      };
  }
};

// ─── Document Card ───────────────────────────────────────
interface DocumentCardProps {
  item: DocumentItem;
  index: number;
  onPress: () => void;
  onDelete: () => void;
  menuVisible: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
}

function DocumentCard({
  item,
  index,
  onPress,
  onDelete,
  menuVisible,
  onMenuOpen,
  onMenuClose,
}: DocumentCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(16)).current;
  const typeConfig = getTypeConfig(item.type);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 420,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
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
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
        opacity: fadeAnim,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Left accent bar */}
        <LinearGradient
          colors={typeConfig.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardAccent}
        />

        <View style={styles.cardBody}>
          {/* Gradient icon — matches Create screen */}
          <LinearGradient
            colors={typeConfig.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardIconGradient}
          >
            <MaterialCommunityIcons
              name={typeConfig.icon}
              size={22}
              color="#fff"
            />
          </LinearGradient>

          {/* Text */}
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.cardMeta}>
              <View style={[styles.typePill]}>
                <View style={[styles.typeDot, { backgroundColor: typeConfig.color }]} />
                <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
                  {typeConfig.label}
                </Text>
              </View>
              <View style={styles.dateSeparator} />
              <Text style={styles.cardDate}>{formatDateSafe(item.updatedAt)}</Text>
            </View>
          </View>

          {/* Menu */}
          <Menu
            visible={menuVisible}
            onDismiss={onMenuClose}
            anchor={
              <Pressable onPress={onMenuOpen} style={styles.menuBtn} hitSlop={8}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={18}
                  color={palette.textLight}
                />
              </Pressable>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => { onMenuClose(); onPress(); }}
              title="Open"
              leadingIcon="open-in-new"
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => { onMenuClose(); onDelete(); }}
              title="Delete"
              leadingIcon="trash-can-outline"
              titleStyle={[styles.menuItemText, { color: palette.danger }]}
            />
          </Menu>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState() {
  const router = useRouter();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={[styles.emptyIconWrap, { transform: [{ translateY: bounceAnim }] }]}>
        <View style={styles.emptyIconInner}>
          <MaterialCommunityIcons
            name="text-box-plus-outline"
            size={44}
            color={palette.indigo}
          />
        </View>
      </Animated.View>

      <Text style={styles.emptyTitle}>Your workspace awaits</Text>
      <Text style={styles.emptySubtitle}>
        Create your first document or resume{'\n'}to get started
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.emptyBtn,
          pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        ]}
        onPress={() => router.push('/(tabs)/create')}
      >
        <LinearGradient
          colors={[palette.indigo, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyBtnInner}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.emptyBtnText}>Create New</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────
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
  const [searchFocused, setSearchFocused] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

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
    Animated.timing(headerFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

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
    return items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documents, resumes]);

  const filteredDocuments = allDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resumeCount = filteredDocuments.filter((d) => d.type === 'resume').length;
  const docCount = filteredDocuments.filter((d) => d.type === 'document').length;

  const handleDelete = async (item: DocumentItem) => {
    try {
      if (item.type === 'resume') {
        await deleteResume(item.id);
      } else {
        await deleteDocument(item.id);
      }
      setSnackbarMessage(`${getTypeConfig(item.type).label} deleted`);
      setSnackbarVisible(true);
    } catch (error) {
      handleError(error, `Failed to delete ${getTypeConfig(item.type).label.toLowerCase()}`);
    }
  };

  const renderDocument = useCallback(
    ({ item, index }: { item: DocumentItem; index: number }) => (
      <DocumentCard
        item={item}
        index={index}
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
    <View style={styles.container}>
      {/* ── Dark Header Section ── */}
      <LinearGradient
        colors={[palette.headerBg, palette.headerBgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        {/* Decorative shapes */}
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <Animated.View style={[styles.headerInner, { opacity: headerFade }]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Workspace</Text>
              {allDocuments.length > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{allDocuments.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSubtitle}>
              {allDocuments.length > 0
                ? `${resumeCount} resume${resumeCount !== 1 ? 's' : ''} · ${docCount} document${docCount !== 1 ? 's' : ''}`
                : 'Start building something great'}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.settingsBtn,
              pressed && styles.settingsBtnPressed,
            ]}
            onPress={() => router.push('/settings')}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color={palette.textOnDarkSub} />
          </Pressable>
        </Animated.View>

        {/* Search overlapping the boundary */}
        <View style={styles.searchOuter}>
          <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={searchFocused ? palette.indigo : palette.textLight}
            />
            <TextInput
              placeholder="Search documents..."
              placeholderTextColor={palette.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.searchInput}
              selectionColor={palette.indigo}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color={palette.textLight} />
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ── Light Content Section ── */}
      <View style={styles.contentArea}>
        {/* Quick filter chips */}
        {!loading && allDocuments.length > 0 && (
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: palette.indigo }]} />
              <Text style={styles.chipText}>{resumeCount} Resume{resumeCount !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: palette.coral }]} />
              <Text style={styles.chipText}>{docCount} Document{docCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        )}

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
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <View style={styles.noResultsIcon}>
                  <MaterialCommunityIcons name="file-search-outline" size={36} color={palette.textLight} />
                </View>
                <Text style={styles.noResultsTitle}>No matches for "{searchQuery}"</Text>
                <Text style={styles.noResultsHint}>Try a different search term</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Offline */}
      {isOffline && (
        <View style={[styles.offlineBanner, { bottom: Platform.OS === 'ios' ? 100 : 90 }]}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={palette.amber} />
          <Text style={styles.offlineText}>You're offline — changes will sync later</Text>
        </View>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fabWrap,
          { bottom: Platform.OS === 'ios' ? 90 : 80 },
          pressed && { opacity: 0.88, transform: [{ scale: 0.92 }] },
        ]}
        onPress={() => router.push('/(tabs)/create')}
      >
        <LinearGradient
          colors={[palette.indigo, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#fff" />
        </LinearGradient>
        <View style={styles.fabShadow} />
      </Pressable>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },

  // ── Header (Dark) ──
  headerGradient: {
    paddingBottom: 44,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerDecor1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: 20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: palette.textOnDark,
    letterSpacing: -0.8,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.textOnDarkSub,
    letterSpacing: 0.1,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsBtnPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },

  // ── Search (overlaps header/content boundary) ──
  searchOuter: {
    paddingHorizontal: 24,
    marginBottom: -28, // Pull into content area
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  searchBoxFocused: {
    borderColor: palette.indigo + '35',
    shadowColor: palette.indigo,
    shadowOpacity: 0.12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.textDark,
    paddingVertical: 0,
  },

  // ── Content Area (Light) ──
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMedium,
  },

  // List
  list: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 140,
  },

  // ── Card ──
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    zIndex: 1,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 10,
  },
  cardIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.textLight,
    opacity: 0.5,
  },
  cardDate: {
    fontSize: 12,
    color: palette.textLight,
  },
  menuBtn: {
    padding: 8,
  },

  // Menu
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: palette.textDark,
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    marginBottom: 24,
  },
  emptyIconInner: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: palette.indigoMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.indigo + '15',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: palette.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // ── No Results ──
  noResults: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  noResultsIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
    marginBottom: 4,
  },
  noResultsHint: {
    fontSize: 14,
    color: palette.textLight,
  },

  // ── Offline ──
  offlineBanner: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  offlineText: {
    fontSize: 13,
    color: palette.amber,
    fontWeight: '500',
  },

  // Snackbar
  snackbar: {
    backgroundColor: palette.headerBg,
    borderRadius: 14,
  },

  // ── FAB ──
  fabWrap: {
    position: 'absolute',
    right: 24,
    zIndex: 1000,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: palette.indigo,
    opacity: 0.2,
    zIndex: -1,
  },
});