import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Card, FAB, Text, Searchbar, IconButton, Menu, Chip, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useResumeStore } from '@/store/resumeStore';
import { usePDFStore } from '@/store/pdfStore';
import { formatDateSafe } from '@/utils/dateUtils';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useOffline } from '@/hooks/useOffline';
import { DocumentSkeleton } from '@/components/SkeletonLoader';

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
  type: 'document' | 'resume' | 'pdf';
  route: string;
};

export default function DocumentsScreen() {
  const router = useRouter();
  const { documents, loadDocuments, deleteDocument } = useDocumentStore();
  const { resumes, loadResumes, deleteResume } = useResumeStore();
  const { pdfs, loadPDFs, deletePDF } = usePDFStore();
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
        await Promise.all([
          loadDocuments(),
          loadResumes(),
          loadPDFs(),
        ]);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Combine all documents into a single list
  const allDocuments = useMemo<DocumentItem[]>(() => {
    const items: DocumentItem[] = [
      ...documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt,
        type: 'document' as const,
        route: `/editor/${doc.id}`,
      })),
      ...resumes.map(resume => ({
        id: resume.id,
        title: resume.title,
        updatedAt: resume.updatedAt,
        type: 'resume' as const,
        route: `/resumes/${resume.id}`,
      })),
      ...pdfs.map(pdf => ({
        id: pdf.id,
        title: pdf.name,
        updatedAt: pdf.updatedAt,
        type: 'pdf' as const,
        route: `/pdf/${pdf.id}`,
      })),
    ];

    // Sort by updated date (newest first)
    return items.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documents, resumes, pdfs]);

  const filteredDocuments = allDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeConfig = (type: DocumentItem['type']) => {
    switch (type) {
      case 'resume':
        return { label: 'Resume', icon: 'file-account', color: '#1976d2' };
      case 'pdf':
        return { label: 'PDF', icon: 'file-pdf-box', color: '#d32f2f' };
      default:
        return { label: 'Document', icon: 'file-document', color: '#757575' };
    }
  };

  const handleDelete = async (item: DocumentItem) => {
    setMenuVisible(null);
    try {
      if (item.type === 'resume') {
        await deleteResume(item.id);
      } else if (item.type === 'pdf') {
        await deletePDF(item.id);
      } else {
        await deleteDocument(item.id);
      }
      setSnackbarMessage(`${getTypeConfig(item.type).label} deleted successfully`);
      setSnackbarVisible(true);
    } catch (error) {
      handleError(error, `Failed to delete ${getTypeConfig(item.type).label.toLowerCase()}. Please try again.`);
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
          keyExtractor={(item) => `${item.type}-${item.id}`}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No documents yet. Create one to get started!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const typeConfig = getTypeConfig(item.type);
            return (
              <Card
                style={styles.card}
                onPress={() => router.push(item.route)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardText}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {item.title}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Chip
                        icon={typeConfig.icon}
                        style={[styles.typeChip, { backgroundColor: `${typeConfig.color}20` }]}
                        textStyle={[styles.typeChipText, { color: typeConfig.color }]}
                        mode="flat"
                      >
                        {typeConfig.label}
                      </Chip>
                      <Text variant="bodySmall" style={styles.date}>
                        {formatDateSafe(item.updatedAt)}
                      </Text>
                    </View>
                  </View>
                  <Menu
                    visible={menuVisible === `${item.type}-${item.id}`}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => setMenuVisible(`${item.type}-${item.id}`)}
                        style={styles.menuButton}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(null);
                        router.push(item.route);
                      }}
                      title="Open"
                      leadingIcon="pencil"
                    />
                    <Menu.Item
                      onPress={() => handleDelete(item)}
                      title="Delete"
                      leadingIcon="delete"
                      titleStyle={styles.deleteText}
                    />
                  </Menu>
                </Card.Content>
              </Card>
            );
          }}
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
        onPress={() => router.push('/(tabs)/create')}
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
  cardTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeChip: {
    height: 28,
    paddingHorizontal: 4,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
