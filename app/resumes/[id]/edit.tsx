import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Appbar, Text, Button, Portal, Dialog, TextInput, IconButton, Card, Chip, Switch, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { ResumeData } from '@/types';
import { ResumeTemplate } from '@/components/resume/templates';

// Types
type Experience = ResumeData['experience'][0];
type Education = ResumeData['education'][0];
type Skill = ResumeData['skills'][0];
type Project = NonNullable<ResumeData['projects']>[0];
type Certification = NonNullable<ResumeData['certifications']>[0];
type Language = NonNullable<ResumeData['languages']>[0];
type CustomSection = NonNullable<ResumeData['customSections']>[0];
type CustomItem = CustomSection['items'][0];

// Initial data factory
const createInitialData = (): ResumeData => ({
  personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: [],
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function EditResumeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResume, updateResume } = useResumeStore();
  
  const [resume, setResume] = useState(() => getResume(id || ''));
  const [data, setData] = useState<ResumeData>(() => {
    const r = getResume(id || '');
    return r?.data ? { ...r.data, projects: r.data.projects || [], certifications: r.data.certifications || [], languages: r.data.languages || [], customSections: r.data.customSections || [] } : createInitialData();
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Memoized update functions to prevent re-renders
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  }, []);

  const updateSection = useCallback(<T extends keyof ResumeData>(section: T, value: ResumeData[T]) => {
    setData(prev => ({ ...prev, [section]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateResume(id, { data });
      router.replace(`/resumes/${id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save resume');
      setSaving(false);
    }
  }, [id, data, updateResume, router]);

  if (!resume) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Resume Not Found" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Resume not found</Text>
          <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={showPreview ? "Preview" : "Edit Resume"} />
        <Appbar.Action 
          icon={showPreview ? "pencil" : "eye"} 
          onPress={() => setShowPreview(!showPreview)} 
        />
      </Appbar.Header>

      {showPreview ? (
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewWrapper}>
            <ResumeTemplate templateId={resume.templateId} data={data} />
          </View>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <PersonalInfoSection 
              data={data.personalInfo} 
              onUpdate={updatePersonalInfo} 
            />
            <ExperienceSection 
              items={data.experience} 
              onUpdate={(items) => updateSection('experience', items)} 
            />
            <EducationSection 
              items={data.education} 
              onUpdate={(items) => updateSection('education', items)} 
            />
            <SkillsSection 
              items={data.skills} 
              onUpdate={(items) => updateSection('skills', items)} 
            />
            <ProjectsSection 
              items={data.projects || []} 
              onUpdate={(items) => updateSection('projects', items)} 
            />
            <CertificationsSection 
              items={data.certifications || []} 
              onUpdate={(items) => updateSection('certifications', items)} 
            />
            <LanguagesSection 
              items={data.languages || []} 
              onUpdate={(items) => updateSection('languages', items)} 
            />
            <CustomSectionsComponent 
              sections={data.customSections || []} 
              onUpdate={(sections) => updateSection('customSections', sections)} 
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {!showPreview && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
          >
            Save Resume
          </Button>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// SECTION CARD WRAPPER
// ============================================================================
interface SectionCardProps {
  title: string;
  icon: string;
  count?: number;
  onAdd?: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const SectionCard = memo(({ title, icon, count, onAdd, children, defaultExpanded = false }: SectionCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card style={styles.sectionCard} mode="elevated">
      <Card.Content style={styles.sectionCardContent}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <IconButton icon={icon} size={20} style={styles.sectionIcon} />
            <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
            {count !== undefined && count > 0 && (
              <Chip compact style={styles.countChip}>{count}</Chip>
            )}
          </View>
          <View style={styles.sectionHeaderRight}>
            {onAdd && (
              <IconButton 
                icon="plus" 
                size={20} 
                onPress={onAdd}
                mode="contained"
                containerColor="#f0f0f0"
              />
            )}
            <IconButton
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              onPress={() => setExpanded(!expanded)}
            />
          </View>
        </View>
        {expanded && <View style={styles.sectionContent}>{children}</View>}
      </Card.Content>
    </Card>
  );
});

// ============================================================================
// REUSABLE INPUT COMPONENT
// ============================================================================
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  disabled?: boolean;
  style?: any;
}

const FormInput = memo(({ label, value, onChangeText, multiline, numberOfLines, placeholder, keyboardType, disabled, style }: FormInputProps) => (
  <TextInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    mode="outlined"
    multiline={multiline}
    numberOfLines={numberOfLines}
    placeholder={placeholder}
    keyboardType={keyboardType}
    disabled={disabled}
    style={[styles.input, style]}
    outlineStyle={styles.inputOutline}
    dense
  />
));

// ============================================================================
// PERSONAL INFO SECTION
// ============================================================================
interface PersonalInfoSectionProps {
  data: ResumeData['personalInfo'];
  onUpdate: (field: string, value: string) => void;
}

const PersonalInfoSection = memo(({ data, onUpdate }: PersonalInfoSectionProps) => {
  return (
    <SectionCard title="Personal Info" icon="account" defaultExpanded={true}>
      <View style={styles.inputGrid}>
        <FormInput
          label="Full Name"
          value={data.fullName}
          onChangeText={(v) => onUpdate('fullName', v)}
        />
        <View style={styles.row}>
          <FormInput
            label="Email"
            value={data.email}
            onChangeText={(v) => onUpdate('email', v)}
            keyboardType="email-address"
            style={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <FormInput
            label="Phone"
            value={data.phone}
            onChangeText={(v) => onUpdate('phone', v)}
            keyboardType="phone-pad"
            style={[styles.flex, styles.marginRight]}
          />
          <FormInput
            label="Location"
            value={data.location}
            onChangeText={(v) => onUpdate('location', v)}
            style={styles.flex}
          />
        </View>
        <FormInput
          label="LinkedIn"
          value={data.linkedIn || ''}
          onChangeText={(v) => onUpdate('linkedIn', v)}
          placeholder="linkedin.com/in/yourname"
        />
        <FormInput
          label="Website"
          value={data.website || ''}
          onChangeText={(v) => onUpdate('website', v)}
          placeholder="yourwebsite.com"
        />
        <FormInput
          label="Professional Summary"
          value={data.summary || ''}
          onChangeText={(v) => onUpdate('summary', v)}
          multiline
          numberOfLines={4}
          placeholder="Brief overview of your professional background..."
        />
      </View>
    </SectionCard>
  );
});

// ============================================================================
// EXPERIENCE SECTION
// ============================================================================
interface ExperienceSectionProps {
  items: Experience[];
  onUpdate: (items: Experience[]) => void;
}

const ExperienceSection = memo(({ items, onUpdate }: ExperienceSectionProps) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Experience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [],
    };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index);
    setDialogVisible(true);
  }, []);

  const handleSave = useCallback((updated: Experience) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Experience', 'Are you sure you want to delete this experience?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Experience" icon="briefcase" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No experience added yet" onAdd={handleAdd} buttonLabel="Add Experience" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.jobTitle || 'Untitled Position'}
              subtitle={item.company}
              meta={`${item.startDate} - ${item.current ? 'Present' : item.endDate}`}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <ExperienceDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// EXPERIENCE DIALOG
// ============================================================================
interface ExperienceDialogProps {
  visible: boolean;
  item: Experience | null;
  onDismiss: () => void;
  onSave: (item: Experience) => void;
}

const ExperienceDialog = memo(({ visible, item, onDismiss, onSave }: ExperienceDialogProps) => {
  const [form, setForm] = useState<Experience>({
    id: '',
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: [],
  });
  const [descriptionText, setDescriptionText] = useState('');

  useEffect(() => {
    if (item) {
      setForm(item);
      setDescriptionText(item.description.join('\n'));
    } else {
      setForm({
        id: Date.now().toString(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: [],
      });
      setDescriptionText('');
    }
  }, [item, visible]);

  const handleSave = () => {
    onSave({
      ...form,
      description: descriptionText.split('\n').filter(line => line.trim()),
    });
  };

  const updateField = (field: keyof Experience, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {item?.jobTitle ? 'Edit Experience' : 'Add Experience'}
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <FormInput
              label="Job Title *"
              value={form.jobTitle}
              onChangeText={(v) => updateField('jobTitle', v)}
              placeholder="e.g., Senior Software Engineer"
            />
            <FormInput
              label="Company *"
              value={form.company}
              onChangeText={(v) => updateField('company', v)}
              placeholder="e.g., Google"
            />
            <FormInput
              label="Location"
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="e.g., San Francisco, CA"
            />
            <View style={styles.row}>
              <FormInput
                label="Start Date"
                value={form.startDate}
                onChangeText={(v) => updateField('startDate', v)}
                placeholder="MM/YYYY"
                style={[styles.flex, styles.marginRight]}
              />
              <FormInput
                label="End Date"
                value={form.endDate}
                onChangeText={(v) => updateField('endDate', v)}
                placeholder="MM/YYYY"
                disabled={form.current}
                style={styles.flex}
              />
            </View>
            <View style={styles.switchRow}>
              <Text>Currently working here</Text>
              <Switch
                value={form.current}
                onValueChange={(v) => updateField('current', v)}
              />
            </View>
            <Divider style={styles.divider} />
            <Text variant="labelMedium" style={styles.fieldLabel}>
              Description (one achievement per line)
            </Text>
            <TextInput
              value={descriptionText}
              onChangeText={setDescriptionText}
              mode="outlined"
              multiline
              numberOfLines={6}
              placeholder="• Led team of 5 engineers&#10;• Increased performance by 40%&#10;• Implemented new CI/CD pipeline"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// EDUCATION SECTION
// ============================================================================
interface EducationSectionProps {
  items: Education[];
  onUpdate: (items: Education[]) => void;
}

const EducationSection = memo(({ items, onUpdate }: EducationSectionProps) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Education = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
    };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index);
    setDialogVisible(true);
  }, []);

  const handleSave = useCallback((updated: Education) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Education', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Education" icon="school" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No education added yet" onAdd={handleAdd} buttonLabel="Add Education" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.degree || 'Untitled Degree'}
              subtitle={item.school}
              meta={`${item.startDate} - ${item.current ? 'Present' : item.endDate}`}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <EducationDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// EDUCATION DIALOG
// ============================================================================
const EducationDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: Education | null;
  onDismiss: () => void;
  onSave: (item: Education) => void;
}) => {
  const [form, setForm] = useState<Education>({
    id: '', degree: '', school: '', location: '', startDate: '', endDate: '', current: false,
  });

  useEffect(() => {
    if (item) setForm(item);
    else setForm({ id: Date.now().toString(), degree: '', school: '', location: '', startDate: '', endDate: '', current: false });
  }, [item, visible]);

  const updateField = (field: keyof Education, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {item?.degree ? 'Edit Education' : 'Add Education'}
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <FormInput label="Degree *" value={form.degree} onChangeText={(v) => updateField('degree', v)} placeholder="e.g., Bachelor of Science in Computer Science" />
            <FormInput label="School *" value={form.school} onChangeText={(v) => updateField('school', v)} placeholder="e.g., Stanford University" />
            <FormInput label="Location" value={form.location} onChangeText={(v) => updateField('location', v)} placeholder="e.g., Stanford, CA" />
            <View style={styles.row}>
              <FormInput label="Start Date" value={form.startDate} onChangeText={(v) => updateField('startDate', v)} placeholder="YYYY" style={[styles.flex, styles.marginRight]} />
              <FormInput label="End Date" value={form.endDate} onChangeText={(v) => updateField('endDate', v)} placeholder="YYYY" disabled={form.current} style={styles.flex} />
            </View>
            <View style={styles.switchRow}>
              <Text>Currently studying</Text>
              <Switch value={form.current} onValueChange={(v) => updateField('current', v)} />
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={() => onSave(form)}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// SKILLS SECTION
// ============================================================================
interface SkillsSectionProps {
  items: Skill[];
  onUpdate: (items: Skill[]) => void;
}

const SkillsSection = memo(({ items, onUpdate }: SkillsSectionProps) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Skill = { id: Date.now().toString(), category: '', items: [] };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index);
    setDialogVisible(true);
  }, []);

  const handleSave = useCallback((updated: Skill) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Skill Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Skills" icon="star" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No skills added yet" onAdd={handleAdd} buttonLabel="Add Skills" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.category || 'Untitled Category'}
              subtitle={item.items.join(', ')}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <SkillsDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// SKILLS DIALOG
// ============================================================================
const SkillsDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: Skill | null;
  onDismiss: () => void;
  onSave: (item: Skill) => void;
}) => {
  const [form, setForm] = useState<Skill>({ id: '', category: '', items: [] });
  const [skillsText, setSkillsText] = useState('');

  useEffect(() => {
    if (item) {
      setForm(item);
      setSkillsText(item.items.join(', '));
    } else {
      setForm({ id: Date.now().toString(), category: '', items: [] });
      setSkillsText('');
    }
  }, [item, visible]);

  const handleSave = () => {
    onSave({
      ...form,
      items: skillsText.split(',').map(s => s.trim()).filter(s => s),
    });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {item?.category ? 'Edit Skills' : 'Add Skills'}
        </Dialog.Title>
        <Dialog.Content>
          <FormInput
            label="Category *"
            value={form.category}
            onChangeText={(v) => setForm(prev => ({ ...prev, category: v }))}
            placeholder="e.g., Programming Languages"
          />
          <Text variant="labelMedium" style={styles.fieldLabel}>Skills (comma-separated)</Text>
          <TextInput
            value={skillsText}
            onChangeText={setSkillsText}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="e.g., JavaScript, Python, TypeScript"
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// PROJECTS SECTION
// ============================================================================
const ProjectsSection = memo(({ items, onUpdate }: { items: Project[]; onUpdate: (items: Project[]) => void }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Project = { id: Date.now().toString(), name: '', description: '', technologies: [], link: '' };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleSave = useCallback((updated: Project) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Projects" icon="folder" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No projects added yet" onAdd={handleAdd} buttonLabel="Add Project" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.name || 'Untitled Project'}
              subtitle={item.description}
              meta={item.technologies?.join(', ')}
              onEdit={() => { setEditingIndex(index); setDialogVisible(true); }}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <ProjectsDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// PROJECTS DIALOG
// ============================================================================
const ProjectsDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: Project | null;
  onDismiss: () => void;
  onSave: (item: Project) => void;
}) => {
  const [form, setForm] = useState<Project>({ id: '', name: '', description: '', technologies: [], link: '' });
  const [techText, setTechText] = useState('');

  useEffect(() => {
    if (item) {
      setForm(item);
      setTechText(item.technologies?.join(', ') || '');
    } else {
      setForm({ id: Date.now().toString(), name: '', description: '', technologies: [], link: '' });
      setTechText('');
    }
  }, [item, visible]);

  const handleSave = () => {
    onSave({ ...form, technologies: techText.split(',').map(s => s.trim()).filter(s => s) });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>{item?.name ? 'Edit Project' : 'Add Project'}</Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <FormInput label="Project Name *" value={form.name} onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))} placeholder="e.g., E-commerce Platform" />
            <FormInput label="Description *" value={form.description} onChangeText={(v) => setForm(prev => ({ ...prev, description: v }))} multiline numberOfLines={4} placeholder="Brief description of the project..." />
            <Text variant="labelMedium" style={styles.fieldLabel}>Technologies (comma-separated)</Text>
            <TextInput value={techText} onChangeText={setTechText} mode="outlined" placeholder="e.g., React, Node.js, MongoDB" style={styles.input} outlineStyle={styles.inputOutline} />
            <FormInput label="Link (optional)" value={form.link || ''} onChangeText={(v) => setForm(prev => ({ ...prev, link: v }))} placeholder="https://github.com/..." />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// CERTIFICATIONS SECTION
// ============================================================================
const CertificationsSection = memo(({ items, onUpdate }: { items: Certification[]; onUpdate: (items: Certification[]) => void }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Certification = { id: Date.now().toString(), name: '', issuer: '', date: '', link: '' };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleSave = useCallback((updated: Certification) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Certification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Certifications" icon="certificate" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No certifications added yet" onAdd={handleAdd} buttonLabel="Add Certification" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.name || 'Untitled Certification'}
              subtitle={item.issuer}
              meta={item.date}
              onEdit={() => { setEditingIndex(index); setDialogVisible(true); }}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <CertificationsDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// CERTIFICATIONS DIALOG
// ============================================================================
const CertificationsDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: Certification | null;
  onDismiss: () => void;
  onSave: (item: Certification) => void;
}) => {
  const [form, setForm] = useState<Certification>({ id: '', name: '', issuer: '', date: '', link: '' });

  useEffect(() => {
    if (item) setForm(item);
    else setForm({ id: Date.now().toString(), name: '', issuer: '', date: '', link: '' });
  }, [item, visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>{item?.name ? 'Edit Certification' : 'Add Certification'}</Dialog.Title>
        <Dialog.Content>
          <FormInput label="Certification Name *" value={form.name} onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))} placeholder="e.g., AWS Solutions Architect" />
          <FormInput label="Issuer *" value={form.issuer} onChangeText={(v) => setForm(prev => ({ ...prev, issuer: v }))} placeholder="e.g., Amazon Web Services" />
          <FormInput label="Date" value={form.date} onChangeText={(v) => setForm(prev => ({ ...prev, date: v }))} placeholder="MM/YYYY" />
          <FormInput label="Link (optional)" value={form.link || ''} onChangeText={(v) => setForm(prev => ({ ...prev, link: v }))} placeholder="https://..." />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={() => onSave(form)}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// LANGUAGES SECTION
// ============================================================================
const LanguagesSection = memo(({ items, onUpdate }: { items: Language[]; onUpdate: (items: Language[]) => void }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newItem: Language = { id: Date.now().toString(), language: '', proficiency: '' };
    onUpdate([...items, newItem]);
    setEditingIndex(items.length);
    setDialogVisible(true);
  }, [items, onUpdate]);

  const handleSave = useCallback((updated: Language) => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = updated;
      onUpdate(newItems);
    }
    setDialogVisible(false);
    setEditingIndex(null);
  }, [editingIndex, items, onUpdate]);

  const handleDelete = useCallback((index: number) => {
    Alert.alert('Delete Language', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(items.filter((_, i) => i !== index)) },
    ]);
  }, [items, onUpdate]);

  return (
    <>
      <SectionCard title="Languages" icon="translate" count={items.length} onAdd={handleAdd}>
        {items.length === 0 ? (
          <EmptyState message="No languages added yet" onAdd={handleAdd} buttonLabel="Add Language" />
        ) : (
          items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.language || 'Untitled Language'}
              subtitle={item.proficiency}
              onEdit={() => { setEditingIndex(index); setDialogVisible(true); }}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </SectionCard>

      <LanguagesDialog
        visible={dialogVisible}
        item={editingIndex !== null ? items[editingIndex] : null}
        onDismiss={() => { setDialogVisible(false); setEditingIndex(null); }}
        onSave={handleSave}
      />
    </>
  );
});

// ============================================================================
// LANGUAGES DIALOG
// ============================================================================
const LanguagesDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: Language | null;
  onDismiss: () => void;
  onSave: (item: Language) => void;
}) => {
  const [form, setForm] = useState<Language>({ id: '', language: '', proficiency: '' });

  useEffect(() => {
    if (item) setForm(item);
    else setForm({ id: Date.now().toString(), language: '', proficiency: '' });
  }, [item, visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>{item?.language ? 'Edit Language' : 'Add Language'}</Dialog.Title>
        <Dialog.Content>
          <FormInput label="Language *" value={form.language} onChangeText={(v) => setForm(prev => ({ ...prev, language: v }))} placeholder="e.g., Spanish" />
          <FormInput label="Proficiency *" value={form.proficiency} onChangeText={(v) => setForm(prev => ({ ...prev, proficiency: v }))} placeholder="e.g., Native, Fluent, Intermediate" />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={() => onSave(form)}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// CUSTOM SECTIONS
// ============================================================================
const CustomSectionsComponent = memo(({ sections, onUpdate }: { sections: CustomSection[]; onUpdate: (sections: CustomSection[]) => void }) => {
  const [itemDialogVisible, setItemDialogVisible] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const handleAddSection = useCallback(() => {
    const newSection: CustomSection = { id: Date.now().toString(), title: 'New Section', items: [] };
    onUpdate([...sections, newSection]);
  }, [sections, onUpdate]);

  const handleDeleteSection = useCallback((index: number) => {
    Alert.alert('Delete Section', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate(sections.filter((_, i) => i !== index)) },
    ]);
  }, [sections, onUpdate]);

  const handleAddItem = useCallback((sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].items.push({ id: Date.now().toString(), title: '', description: '', date: '' });
    onUpdate(updated);
    setEditingSectionIndex(sectionIndex);
    setEditingItemIndex(updated[sectionIndex].items.length - 1);
    setItemDialogVisible(true);
  }, [sections, onUpdate]);

  const handleSaveItem = useCallback((item: CustomItem) => {
    if (editingSectionIndex !== null && editingItemIndex !== null) {
      const updated = [...sections];
      updated[editingSectionIndex].items[editingItemIndex] = item;
      onUpdate(updated);
    }
    setItemDialogVisible(false);
    setEditingSectionIndex(null);
    setEditingItemIndex(null);
  }, [editingSectionIndex, editingItemIndex, sections, onUpdate]);

  return (
    <>
      <SectionCard title="Custom Sections" icon="view-grid-plus" count={sections.length} onAdd={handleAddSection}>
        {sections.length === 0 ? (
          <EmptyState message="No custom sections yet" onAdd={handleAddSection} buttonLabel="Add Section" />
        ) : (
          sections.map((section, sectionIndex) => (
            <Card key={section.id} style={styles.customSectionCard} mode="outlined">
              <Card.Content>
                <View style={styles.customSectionHeader}>
                  <TextInput
                    value={section.title}
                    onChangeText={(text) => {
                      const updated = [...sections];
                      updated[sectionIndex].title = text;
                      onUpdate(updated);
                    }}
                    mode="outlined"
                    placeholder="Section Title"
                    style={styles.customSectionTitleInput}
                    outlineStyle={styles.inputOutline}
                    dense
                  />
                  <IconButton icon="delete" size={20} onPress={() => handleDeleteSection(sectionIndex)} />
                </View>
                {section.items.map((item, itemIndex) => (
                  <ItemCard
                    key={item.id}
                    title={item.title || 'Untitled'}
                    subtitle={item.description}
                    meta={item.date}
                    onEdit={() => {
                      setEditingSectionIndex(sectionIndex);
                      setEditingItemIndex(itemIndex);
                      setItemDialogVisible(true);
                    }}
                    onDelete={() => {
                      const updated = [...sections];
                      updated[sectionIndex].items = updated[sectionIndex].items.filter((_, i) => i !== itemIndex);
                      onUpdate(updated);
                    }}
                    compact
                  />
                ))}
                <Button mode="text" icon="plus" onPress={() => handleAddItem(sectionIndex)} compact>
                  Add Item
                </Button>
              </Card.Content>
            </Card>
          ))
        )}
      </SectionCard>

      <CustomItemDialog
        visible={itemDialogVisible}
        item={editingSectionIndex !== null && editingItemIndex !== null ? sections[editingSectionIndex]?.items[editingItemIndex] : null}
        onDismiss={() => { setItemDialogVisible(false); setEditingSectionIndex(null); setEditingItemIndex(null); }}
        onSave={handleSaveItem}
      />
    </>
  );
});

// ============================================================================
// CUSTOM ITEM DIALOG
// ============================================================================
const CustomItemDialog = memo(({ visible, item, onDismiss, onSave }: {
  visible: boolean;
  item: CustomItem | null;
  onDismiss: () => void;
  onSave: (item: CustomItem) => void;
}) => {
  const [form, setForm] = useState<CustomItem>({ id: '', title: '', description: '', date: '' });

  useEffect(() => {
    if (item) setForm(item);
    else setForm({ id: Date.now().toString(), title: '', description: '', date: '' });
  }, [item, visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>Edit Item</Dialog.Title>
        <Dialog.Content>
          <FormInput label="Title *" value={form.title} onChangeText={(v) => setForm(prev => ({ ...prev, title: v }))} />
          <FormInput label="Description" value={form.description || ''} onChangeText={(v) => setForm(prev => ({ ...prev, description: v }))} multiline numberOfLines={3} />
          <FormInput label="Date (optional)" value={form.date || ''} onChangeText={(v) => setForm(prev => ({ ...prev, date: v }))} placeholder="MM/YYYY" />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor="#666">Cancel</Button>
          <Button mode="contained" onPress={() => onSave(form)}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================
interface ItemCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

const ItemCard = memo(({ title, subtitle, meta, onEdit, onDelete, compact }: ItemCardProps) => (
  <Card style={[styles.itemCard, compact && styles.itemCardCompact]} mode="outlined">
    <View style={styles.itemCardContent}>
      <View style={styles.itemCardLeft}>
        <Text variant="titleSmall" style={styles.itemTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text variant="bodySmall" style={styles.itemSubtitle} numberOfLines={2}>{subtitle}</Text>}
        {meta && <Text variant="bodySmall" style={styles.itemMeta} numberOfLines={1}>{meta}</Text>}
      </View>
      <View style={styles.itemCardActions}>
        <IconButton icon="pencil-outline" size={18} onPress={onEdit} />
        <IconButton icon="trash-can-outline" size={18} onPress={onDelete} iconColor="#d32f2f" />
      </View>
    </View>
  </Card>
));

interface EmptyStateProps {
  message: string;
  onAdd: () => void;
  buttonLabel: string;
}

const EmptyState = memo(({ message, onAdd, buttonLabel }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
    <Button mode="outlined" onPress={onAdd} style={styles.emptyStateButton}>{buttonLabel}</Button>
  </View>
));

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 8 },
  previewContainer: { flex: 1, backgroundColor: '#e9ecef' },
  previewWrapper: { margin: 16, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 4 },

  // Section Card
  sectionCard: { marginHorizontal: 12, marginVertical: 6, borderRadius: 12, backgroundColor: '#fff' },
  sectionCardContent: { paddingVertical: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { margin: 0, marginRight: 4 },
  sectionTitle: { fontWeight: '600', color: '#1a1a1a' },
  countChip: { marginLeft: 8, height: 22 },
  sectionContent: { marginTop: 12 },

  // Inputs
  input: { marginBottom: 12, backgroundColor: '#fff' },
  inputOutline: { borderRadius: 8 },
  inputGrid: { gap: 4 },
  row: { flexDirection: 'row', gap: 8 },
  marginRight: { marginRight: 8 },

  // Item Card
  itemCard: { marginBottom: 8, borderRadius: 10, backgroundColor: '#fafafa' },
  itemCardCompact: { marginBottom: 6 },
  itemCardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  itemCardLeft: { flex: 1, marginRight: 8 },
  itemCardActions: { flexDirection: 'row' },
  itemTitle: { fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  itemSubtitle: { color: '#666', marginBottom: 2 },
  itemMeta: { color: '#999', fontSize: 12 },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyStateText: { color: '#999', marginBottom: 12 },
  emptyStateButton: { borderRadius: 8 },

  // Custom Section
  customSectionCard: { marginBottom: 12, backgroundColor: '#f5f5f5', borderRadius: 10 },
  customSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  customSectionTitleInput: { flex: 1, backgroundColor: '#fff' },

  // Dialog
  dialog: { borderRadius: 16, backgroundColor: '#fff', maxHeight: '85%' },
  dialogTitle: { fontSize: 20, fontWeight: '600' },
  dialogScrollArea: { paddingHorizontal: 0, maxHeight: 450 },
  dialogScrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  dialogActions: { paddingHorizontal: 16, paddingBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  divider: { marginVertical: 12 },
  fieldLabel: { color: '#666', marginBottom: 8, marginTop: 4 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    elevation: 8,
  },
  saveButton: { borderRadius: 10, backgroundColor: '#1a1a1a' },
  saveButtonContent: { paddingVertical: 6 },
  saveButtonLabel: { fontSize: 16, fontWeight: '600' },
});