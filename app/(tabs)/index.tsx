import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Card, FAB, Text, Searchbar, IconButton, Menu, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useOffline } from '@/hooks/useOffline';
import { DocumentSkeleton } from '@/components/SkeletonLoader';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function DocumentsScreen() {
  const router = useRouter();
  const { documents, loadDocuments, deleteDocument } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const handleError = useErrorHandler({ showAlert: false });
  const isOffline = useOffline();

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await loadDocuments();
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    setMenuVisible(null);
    try {
      await deleteDocument(id);
      setSnackbarMessage('Document deleted successfully');
      setSnackbarVisible(true);
    } catch (error) {
      handleError(error, 'Failed to delete document. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Documents" />
        <Appbar.Action
          icon="cog"
          onPress={() => router.push('/settings')}
        />
      </Appbar.Header>

      <Searchbar
        placeholder="Search documents..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => (
            <DocumentSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No documents yet. Create one to get started!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/editor/${item.id}`)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDateSafe(item.updatedAt)}
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
                    style={styles.menuButton}
                  />
                }
              >
                <Menu.Item
                  onPress={() => router.push(`/editor/${item.id}`)}
                  title="Open"
                  leadingIcon="pencil"
                />
                <Menu.Item
                  onPress={() => {
                    // Show confirmation dialog
                    const confirmDelete = () => {
                      handleDelete(item.id, item.title);
                    };
                    // For now, directly delete (you can add Alert.alert here if needed)
                    confirmDelete();
                  }}
                  title="Delete"
                  leadingIcon="delete"
                  titleStyle={styles.deleteText}
                />
              </Menu>
            </Card.Content>
          </Card>
        )}
          contentContainerStyle={styles.list}
        />
      )}

      {isOffline && (
        <Snackbar
          visible={isOffline}
          onDismiss={() => {}}
          duration={Snackbar.DURATION_INDEFINITE}
          style={styles.offlineSnackbar}
        >
          You're offline. Changes will sync when you're back online.
        </Snackbar>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  date: {
    color: '#757575',
    marginTop: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 1,
  },
  menuButton: {
    margin: 0,
  },
  deleteText: {
    color: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  offlineSnackbar: {
    backgroundColor: '#ff9800',
  },
});

