import { View, StyleSheet, Pressable, Alert, Animated } from 'react-native';
import { Text, Menu, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { PaginatedResume } from '@/components/resume/PaginatedResume';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '@/theme';

// Enhanced palette matching the tabs
const palette = {
  // Backgrounds
  pageBg: '#F6F4F0',
  headerBg: '#1B1F3B',
  headerBgEnd: '#2A2F52',
  cardBg: '#FFFFFF',
  
  // Accent colors
  indigo: '#4F46E5',
  indigoLight: '#6366F1',
  
  // Text
  textDark: '#1A1D2E',
  textMedium: '#4A4D5E',
  textLight: '#8B8E9F',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255, 255, 255, 0.7)',
  
  // Utility
  danger: '#EF4444',
};

export default function ViewResumeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResume, deleteResume } = useResumeStore();
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Header animation
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const resume = getResume(id || '');

  const handleBack = useCallback(() => {
    // Always navigate to resumes tab to avoid going back to questionnaire/select-template
    router.replace('/(tabs)/resumes');
  }, [router]);

  if (!resume) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[palette.headerBg, palette.headerBgEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
        >
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
          
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
                color={palette.textOnDark}
              />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Resume Not Found</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>
        
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={48}
              color={palette.textLight}
            />
          </View>
          <Text style={styles.notFoundTitle}>Resume Not Found</Text>
          <Text style={styles.notFoundText}>
            The resume you're looking for doesn't exist or has been deleted.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.goBackButton,
              pressed && { opacity: 0.88 },
            ]}
            onPress={handleBack}
          >
            <LinearGradient
              colors={[palette.indigo, palette.indigoLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.goBackButtonGradient}
            >
              <Text style={styles.goBackButtonText}>Go Back</Text>
            </LinearGradient>
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
    <View style={styles.container}>
      {/* Enhanced Gradient Header */}
      <LinearGradient
        colors={[palette.headerBg, palette.headerBgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        {/* Decorative shapes */}
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <Animated.View style={[styles.header, { opacity: headerFade }]}>
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
              color={palette.textOnDark}
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
                  color={palette.textOnDark}
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
        </Animated.View>
      </LinearGradient>

      {/* Resume Preview */}
      <View style={styles.content}>
        <PaginatedResume templateId={resume.templateId} data={resume.data} />
      </View>

      {/* Floating Edit Button with Gradient */}
      <Pressable
        style={({ pressed }) => [
          styles.fabContainer,
          pressed && { opacity: 0.88, transform: [{ scale: 0.92 }] },
        ]}
        onPress={handleEdit}
      >
        <LinearGradient
          colors={[palette.indigo, palette.indigoLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={24}
            color="#fff"
          />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },

  // Enhanced Gradient Header
  headerGradient: {
    paddingBottom: 20,
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
    bottom: 10,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textOnDark,
    textAlign: 'center',
  },
  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
  },
  resumeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.indigo,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 42,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuContent: {
    backgroundColor: palette.cardBg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: palette.textDark,
  },
  menuItemDanger: {
    color: palette.danger,
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
    paddingHorizontal: 40,
    backgroundColor: palette.pageBg,
  },
  notFoundIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: palette.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  notFoundText: {
    fontSize: 15,
    color: palette.textMedium,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  goBackButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  goBackButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Enhanced FAB with Gradient
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});