import { View, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/theme/palette';

/**
 * Option Card Component
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
  index: number;
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
  index,
}: OptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(16)).current;

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
    if (disabled) return;
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
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.optionCard, disabled && styles.optionCardDisabled]}
      >
        {/* Left accent bar */}
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardAccent}
        />

        <View style={styles.cardBody}>
          {/* Icon */}
          <LinearGradient
            colors={gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={22} />
            ) : (
              <MaterialCommunityIcons name={icon} size={22} color="#fff" />
            )}
          </LinearGradient>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, disabled && styles.cardTitleDisabled]}>
                {title}
              </Text>
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.cardDescription, disabled && styles.cardDescDisabled]}
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>

          {/* Arrow */}
          {!disabled && !loading && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={palette.textLight}
              style={styles.arrowIcon}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Section Label
 */
function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionLabelSub}>{subtitle}</Text>}
    </View>
  );
}

/**
 * GeneralScreen - Create Hub
 */
export default function GeneralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

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
      description: 'Build a professional resume with customizable templates',
      icon: 'file-account-outline' as const,
      gradient: [palette.indigo, palette.indigoLight] as [string, string],
      onPress: handleCreateResume,
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      description: 'Craft compelling cover letters that complement your resume',
      icon: 'email-edit-outline' as const,
      gradient: [palette.coral, '#F97316'] as [string, string],
      onPress: handleCreateCoverLetter,
      disabled: true,
      badge: 'Soon',
    },
  ];

  const secondaryOptions = [
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      description: 'Structured notes with action items and follow-ups',
      icon: 'calendar-check-outline' as const,
      gradient: [palette.teal, palette.tealLight] as [string, string],
      onPress: handleCreateMeetingNotes,
    },
  ];

  return (
    <View style={styles.container}>
      {/* ── Compact Header ── */}
      <LinearGradient
        colors={[palette.headerBg, palette.headerBgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <Animated.View style={[styles.headerInner, { opacity: headerFade }]}>
          <Text style={styles.headerTitle}>Create</Text>
          <Text style={styles.headerSubtitle}>
            Build professional documents effortlessly
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Documents Section */}
        <SectionLabel title="Documents" subtitle="Professional career documents" />
        <View style={styles.optionsGroup}>
          {primaryOptions.map((option, i) => (
            <OptionCard key={option.id} {...option} index={i} />
          ))}
        </View>

        {/* Productivity Section */}
        <SectionLabel title="Productivity" subtitle="Tools to stay organized" />
        <View style={styles.optionsGroup}>
          {secondaryOptions.map((option, i) => (
            <OptionCard
              key={option.id}
              {...option}
              index={i + primaryOptions.length}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },

  // ── Header ──
  headerGradient: {
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: 10,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
  },
  headerInner: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    position: 'relative',
    zIndex: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textOnDark,
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.textOnDarkSub,
    letterSpacing: 0.1,
  },

  // ── Content ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },

  // ── Section Label ──
  sectionLabel: {
    marginBottom: 14,
  },
  sectionLabelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textDark,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  sectionLabelSub: {
    fontSize: 13,
    color: palette.textLight,
  },

  // ── Options ──
  optionsGroup: {
    marginBottom: 28,
    gap: 10,
  },

  // ── Card ──
  optionCard: {
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
  optionCardDisabled: {
    opacity: 0.55,
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
    paddingRight: 14,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
    letterSpacing: -0.2,
  },
  cardTitleDisabled: {
    color: palette.textMedium,
  },
  cardDescription: {
    fontSize: 13,
    color: palette.textMedium,
    lineHeight: 18,
  },
  cardDescDisabled: {
    color: palette.textLight,
  },
  badge: {
    backgroundColor: palette.coral,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  arrowIcon: {
    marginLeft: 8,
    opacity: 0.4,
  },
});