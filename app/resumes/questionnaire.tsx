import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Appbar, Card, Text, Button, Chip, TextInput, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width } = Dimensions.get('window');

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

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);

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

  const handleContinue = () => {
    const filters = {
      industry: selectedIndustry || null,
      role: selectedRole || null,
    };
    router.push({
      pathname: '/resumes/select-template',
      params: filters,
    });
  };

  const handleSkip = () => {
    router.push('/resumes/select-template');
  };

  const canContinue = selectedIndustry && selectedRole;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Tell Us About You" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Let's Find Your Perfect Resume
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Help us recommend the best template for your career goals
          </Text>
        </View>

        {/* Industry Section */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              What Industry?
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Select the industry you're targeting
            </Text>
            <View style={styles.chipContainer}>
              {industries.map((industry) => (
                <Chip
                  key={industry}
                  selected={selectedIndustry === industry}
                  onPress={() => handleIndustrySelect(industry)}
                  style={[
                    styles.chip,
                    selectedIndustry === industry && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedIndustry === industry && styles.chipTextSelected,
                  ]}
                >
                  {industry}
                </Chip>
              ))}
            </View>
            {selectedIndustry && selectedIndustry !== 'Other' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ {selectedIndustry}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Role Section */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              What Role Level?
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Choose your experience level
            </Text>
            <View style={styles.chipContainer}>
              {roles.map((role) => (
                <Chip
                  key={role}
                  selected={selectedRole === role}
                  onPress={() => handleRoleSelect(role)}
                  style={[
                    styles.chip,
                    selectedRole === role && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedRole === role && styles.chipTextSelected,
                  ]}
                >
                  {role}
                </Chip>
              ))}
            </View>
            {selectedRole && selectedRole !== 'Other' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ {selectedRole}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleSkip}
          style={styles.skipButton}
          labelStyle={styles.skipButtonLabel}
        >
          Skip
        </Button>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButton}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          Continue
        </Button>
      </View>

      {/* Custom Industry Dialog */}
      <Portal>
        <Dialog visible={showCustomIndustry} onDismiss={() => setShowCustomIndustry(false)}>
          <Dialog.Title>Custom Industry</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter Industry"
              value={customIndustry}
              onChangeText={setCustomIndustry}
              mode="outlined"
              autoFocus
              placeholder="e.g., Aerospace, Non-profit"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCustomIndustry(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleCustomIndustrySave}
              disabled={!customIndustry.trim()}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Custom Role Dialog */}
      <Portal>
        <Dialog visible={showCustomRole} onDismiss={() => setShowCustomRole(false)}>
          <Dialog.Title>Custom Role</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter Role Level"
              value={customRole}
              onChangeText={setCustomRole}
              mode="outlined"
              autoFocus
              placeholder="e.g., Consultant, Specialist"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCustomRole(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleCustomRoleSave}
              disabled={!customRole.trim()}
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  sectionDescription: {
    color: '#666666',
    marginBottom: 16,
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  chipText: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  skipButton: {
    flex: 1,
    borderColor: '#d0d0d0',
  },
  skipButtonLabel: {
    color: '#666666',
    fontWeight: '600',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#1a1a1a',
  },
  continueButtonContent: {
    paddingVertical: 4,
  },
  continueButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

