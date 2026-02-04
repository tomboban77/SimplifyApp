import { View, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '@/theme';

/**
 * Option Card Component
 * Premium interactive card with micro-animations
 */
interface OptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: readonly string[] | string[];
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: string;
}

function OptionCard({
  id,
  title,
  description,
  icon,
  gradient,
  onPress,
  disabled,
  loading,
  badge,
}: OptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    if (disabled) return;
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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.optionCard,
          disabled && styles.optionCardDisabled,
          pressed && !disabled && styles.optionCardPressed,
        ]}
      >
        {/* Gradient Icon Container */}
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} size={28} />
          ) : (
            <MaterialCommunityIcons
              name={icon}
              size={28}
              color={colors.text.inverse}
            />
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Arrow indicator */}
        {!disabled && !loading && (
          <View style={styles.arrowContainer}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.text.tertiary}
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Section Header Component
 */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * GeneralScreen - Premium Create Hub
 */
export default function GeneralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCreateResume = () => {
    router.push('/resumes/questionnaire');
  };

  const handleCreateCoverLetter = () => {
    // Coming soon
  };

  const handleCreateMeetingNotes = () => {
    router.push('/create/meeting-notes');
  };

  const primaryOptions = [
    {
      id: 'resume',
      title: 'Resume',
      description: 'Create a professional resume with beautiful, customizable templates',
      icon: 'file-account-outline' as const,
      gradient: colors.gradients.primary,
      onPress: handleCreateResume,
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      description: 'Craft compelling cover letters that complement your resume',
      icon: 'email-edit-outline' as const,
      gradient: colors.gradients.secondary,
      onPress: handleCreateCoverLetter,
      disabled: true,
      badge: 'Soon',
    },
  ];

  const secondaryOptions = [
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      description: 'Create structured meeting notes with action items and follow-ups',
      icon: 'calendar-check-outline' as const,
      gradient: colors.gradients.sunrise,
      onPress: handleCreateMeetingNotes,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create</Text>
        <Text style={styles.headerSubtitle}>
          Build professional documents effortlessly
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary.muted, colors.background.default]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={32}
                  color={colors.primary.main}
                />
              </View>
              <Text style={styles.heroTitle}>Quick Start</Text>
              <Text style={styles.heroDescription}>
                Choose a document type to get started. Your work is automatically saved.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Primary Options */}
        <SectionHeader
          title="Documents"
          subtitle="Professional career documents"
        />
        <View style={styles.optionsGrid}>
          {primaryOptions.map((option) => (
            <OptionCard key={option.id} {...option} />
          ))}
        </View>

        {/* Secondary Options */}
        <SectionHeader
          title="Productivity"
          subtitle="Tools to stay organized"
        />
        <View style={styles.optionsGrid}>
          {secondaryOptions.map((option) => (
            <OptionCard key={option.id} {...option} />
          ))}
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.default,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: spacing['2xl'],
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  heroDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  
  // Section Headers
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  
  // Options Grid
  optionsGrid: {
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  
  // Option Card
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  optionCardPressed: {
    backgroundColor: colors.interactive.hover,
    borderColor: colors.primary.muted,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  
  // Icon Gradient
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Card Content
  cardContent: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  
  // Badge
  badge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.text.inverse,
    fontSize: 10,
  },
  
  // Arrow
  arrowContainer: {
    marginLeft: spacing.sm,
    opacity: 0.5,
  },
});