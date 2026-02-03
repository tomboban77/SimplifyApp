import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Card, FAB, Text, IconButton, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { Resume } from '@/types';

export default function ResumesScreen() {
  const router = useRouter();
  const { resumes, loadResumes, deleteResume } = useResumeStore();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCreateResume = () => {
    router.push('/resumes/select-template');
  };

  const handleResumePress = (resume: Resume) => {
    router.push(`/resumes/${resume.id}`);
  };

  const handleDelete = async (id: string) => {
    setMenuVisible(null);
    try {
      await deleteResume(id);
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const renderResume = ({ item }: { item: Resume }) => (
    <Card
      style={styles.card}
      onPress={() => handleResumePress(item)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>
              Template {item.templateId.replace('template', '')}
            </Text>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleResumePress(item);
              }}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => handleDelete(item.id)}
              title="Delete"
              leadingIcon="delete"
              titleStyle={{ color: '#d32f2f' }}
            />
          </Menu>
        </View>
        <Text variant="bodySmall" style={styles.cardDate}>
          Updated {formatDateSafe(item.updatedAt)}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Resumes" />
      </Appbar.Header>

      {resumes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Resumes Yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your first professional resume by selecting a template
          </Text>
        </View>
      ) : (
        <FlatList
          data={resumes}
          renderItem={renderResume}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateResume}
        label="Create Resume"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#757575',
  },
  cardDate: {
    color: '#9e9e9e',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

