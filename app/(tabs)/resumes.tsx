import { View, StyleSheet, FlatList, Pressable, Animated, Platform, Alert } from 'react-native';
import {
  Text,
  Menu,
  Portal,
  Dialog,
  TextInput,
  Button,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { Resume } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/theme/palette';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Template color mapping for visual distinction
 */
const templateColors: Record<string, [string, string]> = {
  template1: [palette.indigo, palette.indigoLight],
  template2: [palette.coral, '#F97316'],
  template3: [palette.teal, palette.tealLight],
  template4: ['#2563EB', '#3B82F6'],
  template5: [palette.amber, '#F59E0B'],
};

const getTemplateGradient = (templateId: string): [string, string] => {
  return templateColors[templateId] || [palette.indigo, palette.indigoLight];
};

/**
 * Empty State Component
 */
function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
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
            name="file-account-outline"
            size={44}
            color={palette.indigo}
          />
        </View>
      </Animated.View>

      <Text style={styles.emptyTitle}>Start Building Your Resume</Text>
      <Text style={styles.emptySubtitle}>
        Create your first professional resume{'\n'}and stand out from the crowd
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.emptyBtn,
          pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        ]}
        onPress={onCreatePress}
      >
        <LinearGradient
          colors={[palette.indigo, palette.indigoLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyBtnInner}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.emptyBtnText}>Create Resume</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/**
 * Resume Card Component
 */
interface ResumeCardProps {
  resume: Resume;
  index: number;
  onPress: () => void;
  onEdit: () => void;
  onEditTitle: () => void;
  onDownload: () => void;
  onDelete: () => void;
  menuVisible: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
}

function ResumeCard({
  resume,
  index,
  onPress,
  onEdit,
  onEditTitle,
  onDownload,
  onDelete,
  menuVisible,
  onMenuOpen,
  onMenuClose,
}: ResumeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(16)).current;
  const gradient = getTemplateGradient(resume.templateId);

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
        style={styles.resumeCard}
      >
        {/* Left accent bar */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardAccent}
        />

        <View style={styles.cardBody}>
          {/* Gradient icon */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardIconGradient}
          >
            <MaterialCommunityIcons
              name="file-account-outline"
              size={22}
              color="#fff"
            />
          </LinearGradient>

          {/* Text content */}
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {resume.title}
            </Text>
            <Text style={styles.cardDate}>
              {formatDateSafe(resume.updatedAt)}
            </Text>
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
              onPress={() => { onMenuClose(); onEditTitle(); }}
              title="Rename"
              leadingIcon="rename-box"
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => { onMenuClose(); onEdit(); }}
              title="Edit Content"
              leadingIcon="pencil-outline"
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => { onMenuClose(); onDownload(); }}
              title="Download PDF"
              leadingIcon="download-outline"
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

/**
 * ResumesScreen
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
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      await loadResumes();
      setLoading(false);
    };
    load();
    Animated.timing(headerFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
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

  const generateResumeHTML = (resume: Resume) => {
    const { personalInfo, experience, education, skills, projects, certifications, languages } = resume.data;
    const templateId = resume.templateId;
    
    // Template-specific configurations
    const templateConfig: Record<string, { primaryColor: string; headerBg?: string; headerTextColor?: string }> = {
      template1: { primaryColor: '#000000' },
      template2: { primaryColor: '#1e3a5f', headerBg: '#1e3a5f', headerTextColor: '#ffffff' },
      template3: { primaryColor: '#0D9488' },
      template4: { primaryColor: '#2563EB' },
      template5: { primaryColor: '#c62828', headerBg: '#c62828', headerTextColor: '#ffffff' },
    };

    const config = templateConfig[templateId] || templateConfig.template1;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #ffffff;
              color: #1a1a1a;
            }
            .container {
              padding: 36px 40px;
            }
            .header {
              ${config.headerBg ? `background-color: ${config.headerBg}; padding: 16px 40px; margin: -36px -40px 24px -40px;` : 'padding-bottom: 16px; margin-bottom: 24px; border-bottom: 1px solid #333;'}
              text-align: center;
            }
            .name {
              font-size: 24px;
              font-weight: 700;
              ${config.headerTextColor ? `color: ${config.headerTextColor};` : 'color: #000000;'}
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .contact-row {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 0 16px;
              ${config.headerTextColor ? `color: ${config.headerTextColor};` : 'color: #333333;'}
              font-size: 11px;
            }
            .contact-item::after {
              content: ' | ';
              margin: 0 8px;
              ${config.headerTextColor ? `color: rgba(255, 255, 255, 0.5);` : 'color: #666;'}
            }
            .contact-item:last-child::after {
              display: none;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: ${config.primaryColor};
              letter-spacing: 1.5px;
              text-transform: uppercase;
              border-bottom: 2px solid ${config.primaryColor};
              padding-bottom: 4px;
              margin-bottom: 12px;
            }
            .summary-text {
              font-size: 11px;
              line-height: 16px;
              color: #333333;
              text-align: justify;
            }
            .entry-item {
              margin-bottom: 14px;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 3px;
            }
            .entry-title {
              font-size: 12px;
              font-weight: 700;
              color: #000000;
            }
            .entry-subtitle {
              font-size: 11px;
              color: #555555;
              font-style: italic;
              margin-bottom: 4px;
            }
            .entry-date {
              font-size: 10px;
              color: #666666;
              font-style: italic;
              white-space: nowrap;
            }
            .bullet-list {
              margin-top: 6px;
              margin-left: 20px;
            }
            .bullet-item {
              font-size: 10px;
              color: #333333;
              line-height: 15px;
              margin-bottom: 3px;
              list-style-type: disc;
            }
            .skills-row {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .skill-tag {
              background-color: #f0f0f0;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 10px;
              color: #333;
              border: 1px solid #e0e0e0;
            }
            .cert-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .cert-name {
              font-size: 11px;
              font-weight: 600;
              color: #000000;
            }
            .cert-details {
              font-size: 10px;
              color: #555555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="name">${personalInfo.fullName || resume.title || 'Untitled Resume'}</div>
              <div class="contact-row">
                ${personalInfo.email ? `<span class="contact-item">${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span class="contact-item">${personalInfo.phone}</span>` : ''}
                ${personalInfo.location ? `<span class="contact-item">${personalInfo.location}</span>` : ''}
                ${personalInfo.linkedIn ? `<span class="contact-item">${personalInfo.linkedIn}</span>` : ''}
                ${personalInfo.website ? `<span class="contact-item">${personalInfo.website}</span>` : ''}
              </div>
            </div>

            <!-- Professional Summary -->
            ${personalInfo.summary ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary-text">${personalInfo.summary}</div>
              </div>
            ` : ''}

            <!-- Professional Experience -->
            ${experience && experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Professional Experience</div>
                ${experience.map(exp => `
                  <div class="entry-item">
                    <div class="entry-header">
                      <div class="entry-title">${exp.jobTitle || 'Position'}</div>
                      <div class="entry-date">${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}</div>
                    </div>
                    <div class="entry-subtitle">${exp.company || 'Company'}${exp.location ? `, ${exp.location}` : ''}</div>
                    ${exp.description && exp.description.length > 0 ? `
                      <ul class="bullet-list">
                        ${exp.description.map(desc => `<li class="bullet-item">${desc}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Education -->
            ${education && education.length > 0 ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${education.map(edu => `
                  <div class="entry-item">
                    <div class="entry-header">
                      <div class="entry-title">${edu.degree || 'Degree'}</div>
                      <div class="entry-date">${edu.startDate || ''} – ${edu.current ? 'Present' : edu.endDate || ''}</div>
                    </div>
                    <div class="entry-subtitle">${edu.school || 'School'}${edu.location ? `, ${edu.location}` : ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Skills -->
            ${skills && skills.length > 0 ? `
              <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills-row">
                  ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Projects -->
            ${projects && projects.length > 0 ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${projects.map(proj => `
                  <div class="entry-item">
                    <div class="entry-title">${proj.name || 'Project'}</div>
                    ${proj.description ? `<div class="summary-text" style="margin-top: 4px;">${proj.description}</div>` : ''}
                    ${proj.technologies ? `<div style="font-size: 10px; color: #666; margin-top: 4px; font-style: italic;">Technologies: ${proj.technologies}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Certifications -->
            ${certifications && certifications.length > 0 ? `
              <div class="section">
                <div class="section-title">Certifications</div>
                ${certifications.map(cert => `
                  <div class="cert-row">
                    <span class="cert-name">${cert.name || ''}</span>
                    <span class="cert-details">${cert.issuer || ''}${cert.date ? `, ${cert.date}` : ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Languages -->
            ${languages && languages.length > 0 ? `
              <div class="section">
                <div class="section-title">Languages</div>
                <div style="font-size: 11px; color: #333;">
                  ${languages.map(lang => `${lang.language} (${lang.proficiency})`).join('  •  ')}
                </div>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadResume = async (resume: Resume) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setSnackbarMessage('Generating PDF...');
      setSnackbarVisible(true);

      // Generate HTML content
      const html = generateResumeHTML(resume);

      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Share/Save the PDF
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save Resume',
          UTI: 'com.adobe.pdf',
        });

        setSnackbarMessage('PDF ready to save! ✓');
      } else {
        setSnackbarMessage('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbarMessage('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setSnackbarVisible(false), 2500);
    }
  };

  const renderResume = useCallback(
    ({ item, index }: { item: Resume; index: number }) => (
      <ResumeCard
        resume={item}
        index={index}
        onPress={() => handleResumePress(item)}
        onEdit={() => handleEditResume(item)}
        onEditTitle={() => handleEditTitle(item)}
        onDownload={() => handleDownloadResume(item)}
        onDelete={() => handleDelete(item.id)}
        menuVisible={menuVisible === item.id}
        onMenuOpen={() => setMenuVisible(item.id)}
        onMenuClose={() => setMenuVisible(null)}
      />
    ),
    [menuVisible, isDownloading]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={palette.indigo} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header — EXACT same structure as working Create screen ── */}
      <LinearGradient
        colors={[palette.headerBg, palette.headerBgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <Animated.View style={[styles.headerInner, { opacity: headerFade }]}>
          <Text style={styles.headerTitle}>Resumes</Text>
          <Text style={styles.headerSubtitle}>
            Manage and craft your professional resumes
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* ── Content ── */}
      <View style={styles.contentArea}>
        {/* Count chip */}
        {resumes.length > 0 && (
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: palette.indigo }]} />
              <Text style={styles.chipText}>
                {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
              </Text>
            </View>
          </View>
        )}

        {resumes.length === 0 ? (
          <EmptyState onCreatePress={handleCreateResume} />
        ) : (
          <FlatList
            data={resumes}
            renderItem={renderResume}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>

      {/* FAB */}
      {resumes.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.fabWrap,
            { bottom: Platform.OS === 'ios' ? 90 : 80 },
            pressed && { opacity: 0.88, transform: [{ scale: 0.92 }] },
          ]}
          onPress={handleCreateResume}
        >
          <LinearGradient
            colors={[palette.indigo, palette.indigoLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <MaterialCommunityIcons name="plus" size={26} color="#fff" />
          </LinearGradient>
          <View style={styles.fabShadow} />
        </Pressable>
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
              outlineColor={palette.border}
              activeOutlineColor={palette.indigo}
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
              textColor={palette.textMedium}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveTitle}
              disabled={!newTitle.trim()}
              buttonColor={palette.indigo}
              style={styles.dialogSaveButton}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

// ─── Styles ── All header values copy-pasted from Create screen ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Header — VALUES IDENTICAL TO CREATE SCREEN ──
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
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },

  // Chip
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 4,
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

  // ── Resume Card ──
  resumeCard: {
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
  cardTextContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: palette.textLight,
  },
  menuBtn: {
    padding: 8,
  },
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
    textAlign: 'center',
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
  dialogSaveButton: {
    borderRadius: 14,
  },

  // ── Snackbar ──
  snackbar: {
    backgroundColor: palette.textDark,
    marginBottom: Platform.OS === 'ios' ? 90 : 80,
  },
});