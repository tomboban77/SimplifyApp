import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Card, Text, Button, Switch, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { testFirebaseConnection } from '@/services/firebaseService';
import { useDocumentStore } from '@/store/documentStore';
import { useResumeStore } from '@/store/resumeStore';
import { useTemplateStore } from '@/store/templateStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const { isFirebaseEnabled, enableFirebase, disableFirebase } = useDocumentStore();
  const { enableFirebase: enableResumeFirebase, disableFirebase: disableResumeFirebase } = useResumeStore();
  const { enableFirebase: enableTemplateFirebase, disableFirebase: disableTemplateFirebase } = useTemplateStore();
  const { user, logout, isLoading: authLoading } = useAuthStore();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testFirebaseConnection();
      if (success) {
        Alert.alert(
          '✅ Connection Successful!',
          'Firebase is properly configured and connected!\n\nYou can now use Firebase in your app.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Connection Failed',
          'Firebase connection test failed. Check the console for details.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        '❌ Error',
        error?.message || 'Failed to test connection. Check console for details.',
        [{ text: 'OK' }]
      );
    } finally {
      setTesting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        {user && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Account
              </Text>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text variant="titleMedium" style={styles.userName}>
                    {user.displayName || 'User'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.userEmail}>
                    {user.email}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <Button
                mode="outlined"
                onPress={handleLogout}
                loading={authLoading}
                disabled={authLoading}
                style={styles.logoutButton}
                textColor={colors.error.main}
                icon="logout"
              >
                Sign Out
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Real-time Sync
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Enable Firebase to sync your documents, resumes, and templates to the cloud. Your data will be backed up and synced across devices.
            </Text>
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Enable Firebase Sync</Text>
              <Switch
                value={isFirebaseEnabled}
                onValueChange={(enabled) => {
                  if (enabled) {
                    enableFirebase();
                    enableResumeFirebase();
                    enableTemplateFirebase();
                    Alert.alert('✅ Enabled', 'Firebase sync is now active. Your documents, resumes, and templates will be saved to the cloud.');
                  } else {
                    disableFirebase();
                    disableResumeFirebase();
                    disableTemplateFirebase();
                    Alert.alert('ℹ️ Disabled', 'Firebase sync disabled. Using local storage only.');
                  }
                }}
              />
            </View>
            {isFirebaseEnabled && (
              <Text variant="bodySmall" style={styles.statusText}>
                ✓ Real-time sync is active
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Test Connection
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Test your Firebase connection to make sure everything is working.
            </Text>
            <Button
              mode="contained"
              onPress={handleTestConnection}
              loading={testing}
              disabled={testing}
              style={styles.button}
              icon="connection"
            >
              {testing ? 'Testing...' : 'Test Firebase Connection'}
            </Button>
            <Text variant="bodySmall" style={styles.helpText}>
              This will create a test document in Firestore to verify the connection.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    color: '#757575',
  },
  helpText: {
    marginTop: 8,
    color: '#757575',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    marginTop: 8,
    color: '#4caf50',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary.contrast,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    color: colors.text.secondary,
  },
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: colors.error.main,
  },
});
