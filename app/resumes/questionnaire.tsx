import { View, StyleSheet, ScrollView, Pressable, Animated, Dimensions } from 'react-native';
import { Text, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/theme/palette';

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

/**
 * Animated chip with spring press + gradient fill
 */
function SelectChip({
  label,
  selected,
  accentColor,
  accentGradient,
  onPress,
}: {
  label: string;
  selected: boolean;
  accentColor: string;
  accentGradient: [string, string];
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
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
        style={[styles.chip, selected && { borderColor: accentColor + '40' }]}
      >
        {selected && (
          <LinearGradient
            colors={accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
        )}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
        {selected && (
          <MaterialCommunityIcons name="check" size={14} color="#fff" />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function QuestionnaireScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);

  // Staggered entrance + progress bar animation
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;
  const s1Fade = useRef(new Animated.Value(0)).current;
  const s1Slide = useRef(new Animated.Value(20)).current;
  const s2Fade = useRef(new Animated.Value(0)).current;
  const s2Slide = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = (fade: Animated.Value, slide: Animated.Value, delay: number) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
      ]).start();
    };
    run(heroFade, heroSlide, 0);
    run(s1Fade, s1Slide, 120);
    run(s2Fade, s2Slide, 240);
  }, []);

  // Animate progress bar based on current step
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: currentStep / 2,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [currentStep]);

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

  const handleNext = () => {
    if (currentStep === 1 && selectedIndustry) {
      // Fade out current step
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(s1Fade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setCurrentStep(2);
        // Reset positions and fade in next step
        heroSlide.setValue(20);
        s2Slide.setValue(20);
        Animated.parallel([
          Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(heroSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
          Animated.timing(s2Fade, { toValue: 1, duration: 400, delay: 120, useNativeDriver: true }),
          Animated.timing(s2Slide, { toValue: 0, duration: 450, delay: 120, useNativeDriver: true }),
        ]).start();
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      // Fade out current step
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(s2Fade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setCurrentStep(1);
        // Reset positions and fade in previous step
        heroSlide.setValue(20);
        s1Slide.setValue(20);
        Animated.parallel([
          Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(heroSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
          Animated.timing(s1Fade, { toValue: 1, duration: 400, delay: 120, useNativeDriver: true }),
          Animated.timing(s1Slide, { toValue: 0, duration: 450, delay: 120, useNativeDriver: true }),
        ]).start();
      });
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/resumes/select-template',
      params: { industry: selectedIndustry || null, role: selectedRole || null },
    });
  };

  const handleSkip = () => {
    router.push('/resumes/select-template');
  };

  const canProceed = 
    (currentStep === 1 && selectedIndustry) || 
    (currentStep === 2 && selectedRole);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Enhanced header with gradient accent */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={handleBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={palette.textDark} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerStep}>
              Step {currentStep} of 2
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Animated progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={[palette.indigo, palette.indigoLight, palette.coral]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}
        >
          <Text style={styles.heroEmoji}>{currentStep === 1 ? '🎯' : '⭐'}</Text>
          <Text style={styles.heroTitle}>
            {currentStep === 1 
              ? "Let's find the right\ntemplate for you"
              : "Almost there!"
            }
          </Text>
          <Text style={styles.heroSub}>
            {currentStep === 1
              ? "First, tell us about your industry"
              : "Now, tell us about your experience level"
            }
          </Text>
        </Animated.View>

        {/* Q1 — Industry Card */}
        {currentStep === 1 && (
          <Animated.View
            style={[
              styles.questionCard,
              { opacity: s1Fade, transform: [{ translateY: s1Slide }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.qRow}>
                <View style={styles.qBadge}>
                  <MaterialCommunityIcons name="briefcase-outline" size={16} color="#fff" />
                </View>
                <View style={styles.qTextContainer}>
                  <Text style={styles.qLabel}>Question 1</Text>
                  <Text style={styles.qText}>What's your industry?</Text>
                </View>
              </View>
              {selectedIndustry && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={palette.indigo} />
                </View>
              )}
            </View>

            <View style={styles.chipWrap}>
              {industries.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  selected={selectedIndustry === item}
                  accentColor={palette.indigo}
                  accentGradient={[palette.indigo, palette.indigoLight]}
                  onPress={() => handleIndustrySelect(item)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Q2 — Role Card */}
        {currentStep === 2 && (
          <Animated.View
            style={[
              styles.questionCard,
              { opacity: s2Fade, transform: [{ translateY: s2Slide }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.qRow}>
                <View style={[styles.qBadge, { backgroundColor: palette.coral }]}>
                  <MaterialCommunityIcons name="account-star-outline" size={16} color="#fff" />
                </View>
                <View style={styles.qTextContainer}>
                  <Text style={styles.qLabel}>Question 2</Text>
                  <Text style={styles.qText}>What's your experience level?</Text>
                </View>
              </View>
              {selectedRole && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={palette.coral} />
                </View>
              )}
            </View>

            <View style={styles.chipWrap}>
              {roles.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  selected={selectedRole === item}
                  accentColor={palette.coral}
                  accentGradient={[palette.coral, '#F97316']}
                  onPress={() => handleRoleSelect(item)}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {canProceed ? (
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
            onPress={currentStep === 1 ? handleNext : handleContinue}
          >
            <LinearGradient
              colors={currentStep === 1 
                ? [palette.indigo, palette.indigoLight]
                : [palette.coral, '#F97316']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>
                {currentStep === 1 ? 'Next' : 'Find My Templates'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.ctaBtn, styles.ctaBtnDisabled]}>
            <Text style={styles.ctaTextDisabled}>
              {currentStep === 1 ? 'Select an industry' : 'Select experience level'}
            </Text>
          </View>
        )}
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
              outlineColor={palette.border}
              activeOutlineColor={palette.indigo}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setShowCustomIndustry(false)} textColor={palette.textMedium}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCustomIndustrySave}
              disabled={!customIndustry.trim()}
              buttonColor={palette.indigo}
              style={styles.dialogSaveBtn}
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
              outlineColor={palette.border}
              activeOutlineColor={palette.indigo}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setShowCustomRole(false)} textColor={palette.textMedium}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCustomRoleSave}
              disabled={!customRole.trim()}
              buttonColor={palette.indigo}
              style={styles.dialogSaveBtn}
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
    backgroundColor: palette.pageBg,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerStep: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnPressed: {
    backgroundColor: palette.surfaceMuted,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: palette.cardBg,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textMedium,
  },
  progressBarContainer: {
    paddingHorizontal: 0,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: palette.border + '40',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 4,
    paddingHorizontal: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textDark,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 15,
    color: palette.textLight,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },

  // ── Question Card ──
  questionCard: {
    backgroundColor: palette.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: palette.border + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  qRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  qBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qTextContainer: {
    flex: 1,
  },
  qLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  qText: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.textDark,
    letterSpacing: -0.3,
  },
  checkmark: {
    marginLeft: 8,
  },

  // ── Chips ──
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 28,
    backgroundColor: palette.pageBg,
    borderWidth: 1.5,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textMedium,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: palette.pageBg,
    borderTopWidth: 1,
    borderTopColor: palette.border + '40',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 58,
    borderRadius: 18,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnDisabled: {
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1.5,
    borderColor: palette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  ctaTextDisabled: {
    color: palette.textLight,
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Dialog ──
  dialog: {
    backgroundColor: palette.cardBg,
    borderRadius: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textDark,
    letterSpacing: -0.3,
  },
  dialogInput: {
    backgroundColor: palette.cardBg,
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  dialogSaveBtn: {
    borderRadius: 14,
  },
});