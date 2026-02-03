import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Appbar, Card, FAB, Text, Searchbar, IconButton, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePDFStore } from '@/store/pdfStore';
import { useEffect, useState } from 'react';
import { formatDateSafe } from '@/utils/dateUtils';
import * as DocumentPicker from 'expo-document-picker';

export default function PDFsScreen() {
  const router = useRouter();
  const { pdfs, loadPDFs, addPDF, deletePDF } = usePDFStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadPDFs();
  }, []);

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await addPDF({
          name: result.assets[0].name,
          uri: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
    }
  };

  const filteredPDFs = pdfs.filter(pdf =>
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePDF(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete PDF. Please try again.');
            }
          },
        },
      ]
    );
    setMenuVisible(null);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="PDFs" />
      </Appbar.Header>

      <Searchbar
        placeholder="Search PDFs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredPDFs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/pdf/${item.id}`)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text variant="titleMedium">{item.name}</Text>
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
                  onPress={() => router.push(`/pdf/${item.id}`)}
                  title="Open"
                  leadingIcon="file-pdf-box"
                />
                <Menu.Item
                  onPress={() => handleDelete(item.id, item.name)}
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

      <FAB
        icon="file-upload"
        style={styles.fab}
        onPress={handlePickPDF}
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
});

