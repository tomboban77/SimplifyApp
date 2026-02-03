import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Alert, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import { ActivityIndicator, Button, Portal, Dialog, TextInput, Menu } from 'react-native-paper';
import { PDFAnnotation } from '@/types';

interface PDFViewerProps {
  uri: string;
  annotations?: PDFAnnotation[];
  onAnnotationAdd?: (annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) => void;
  onAnnotationUpdate?: (annotationId: string, updates: Partial<PDFAnnotation>) => void;
  onAnnotationDelete?: (annotationId: string) => void;
}

type AnnotationMode = 'none' | 'text' | 'highlight' | 'signature';

export function PDFViewerNative({ 
  uri, 
  annotations = [],
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>('none');
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [signatureInput, setSignatureInput] = useState('');
  const [selectedAnnotation, setSelectedAnnotation] = useState<PDFAnnotation | null>(null);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [highlightStart, setHighlightStart] = useState<{ x: number; y: number } | null>(null);
  const [highlightEnd, setHighlightEnd] = useState<{ x: number; y: number } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const pdfRef = useRef<Pdf>(null);
  const containerRef = useRef<View>(null);

  // Pan responder for drawing highlights
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => annotationMode === 'highlight',
      onMoveShouldSetPanResponder: () => annotationMode === 'highlight',
      onPanResponderGrant: (evt) => {
        if (annotationMode === 'highlight') {
          const { pageX, pageY } = evt.nativeEvent;
          setHighlightStart({ x: pageX, y: pageY });
          setHighlightEnd({ x: pageX, y: pageY });
        }
      },
      onPanResponderMove: (evt) => {
        if (annotationMode === 'highlight' && highlightStart) {
          const { pageX, pageY } = evt.nativeEvent;
          setHighlightEnd({ x: pageX, y: pageY });
        }
      },
      onPanResponderRelease: () => {
        if (annotationMode === 'highlight' && highlightStart && highlightEnd) {
          setShowHighlightDialog(true);
        }
      },
    })
  ).current;

  const handleTap = (evt: any) => {
    const { pageX, pageY } = evt.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    if (annotationMode === 'text') {
      setShowTextDialog(true);
    } else if (annotationMode === 'none') {
      // Check if tapping on an existing annotation
      const tappedAnnotation = annotations.find(ann => {
        const { x, y, width = 100, height = 30 } = ann;
        return (
          pageX >= x && pageX <= x + width &&
          pageY >= y && pageY <= y + height
        );
      });

      if (tappedAnnotation) {
        setSelectedAnnotation(tappedAnnotation);
        setMenuPosition({ x: pageX, y: pageY });
        setMenuVisible(true);
      }
    }
  };

  const saveTextAnnotation = () => {
    if (textInput.trim() && onAnnotationAdd) {
      onAnnotationAdd({
        type: 'text',
        x: tapPosition.x,
        y: tapPosition.y,
        width: 150,
        height: 30,
        content: textInput,
        color: '#000000',
        page: page,
      });
      setTextInput('');
      setShowTextDialog(false);
      setAnnotationMode('none');
    }
  };

  const saveHighlightAnnotation = () => {
    if (highlightStart && highlightEnd && onAnnotationAdd) {
      const x = Math.min(highlightStart.x, highlightEnd.x);
      const y = Math.min(highlightStart.y, highlightEnd.y);
      const width = Math.abs(highlightEnd.x - highlightStart.x);
      const height = Math.abs(highlightEnd.y - highlightStart.y);

      onAnnotationAdd({
        type: 'highlight',
        x,
        y,
        width,
        height,
        content: highlightText,
        color: '#FFFF00',
        page: page,
      });
      setHighlightText('');
      setShowHighlightDialog(false);
      setHighlightStart(null);
      setHighlightEnd(null);
      setAnnotationMode('none');
    }
  };

  const handleSignature = () => {
    setShowSignatureDialog(true);
  };

  const saveSignatureAnnotation = () => {
    if (signatureInput.trim() && onAnnotationAdd) {
      onAnnotationAdd({
        type: 'signature',
        x: tapPosition.x,
        y: tapPosition.y,
        width: 200,
        height: 50,
        content: signatureInput,
        color: '#000000',
        page: page,
      });
      setSignatureInput('');
      setShowSignatureDialog(false);
      setAnnotationMode('none');
    }
  };

  const handleDeleteAnnotation = () => {
    if (selectedAnnotation && onAnnotationDelete) {
      Alert.alert(
        'Delete Annotation',
        'Are you sure you want to delete this annotation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onAnnotationDelete(selectedAnnotation.id);
              setSelectedAnnotation(null);
              setMenuVisible(false);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container} ref={containerRef} {...panResponder.panHandlers}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading PDF...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => {
            setError('');
            setLoading(true);
          }}>
            Retry
          </Button>
        </View>
      ) : (
        <Pdf
          ref={pdfRef}
          source={{ uri }}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
            setLoading(false);
            setError('');
          }}
          onPageChanged={(page, numberOfPages) => {
            setPage(page);
            setTotalPages(numberOfPages);
          }}
          onError={(error) => {
            console.error('PDF Error:', error);
            setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
            setLoading(false);
          }}
          onLoadProgress={(percent) => {
            if (percent === 1) {
              setLoading(false);
            }
          }}
          style={styles.pdf}
          enablePaging={true}
          horizontal={false}
          spacing={10}
          enableAnnotationRendering={true}
          fitPolicy={0}
          singlePage={false}
        />
      )}
      
      {/* Tap capture overlay - only active when in annotation mode */}
      {annotationMode !== 'none' && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={StyleSheet.absoluteFill}
          disabled={annotationMode === 'highlight'}
        />
      )}

      {/* Annotation Overlays */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {annotations
          .filter(ann => ann.page === page)
          .map((annotation) => (
            <TouchableOpacity
              key={annotation.id}
              style={[
                styles.annotationOverlay,
                {
                  left: annotation.x,
                  top: annotation.y,
                  width: annotation.width || 100,
                  height: annotation.height || 30,
                },
                annotation.type === 'highlight' && {
                  backgroundColor: annotation.color || '#FFFF0080',
                },
              ]}
              onPress={() => {
                setSelectedAnnotation(annotation);
                setMenuPosition({ x: annotation.x, y: annotation.y });
                setMenuVisible(true);
              }}
            >
              {annotation.type === 'text' && (
                <View style={styles.textAnnotation}>
                  <Text style={styles.annotationText}>{annotation.content}</Text>
                </View>
              )}
              {annotation.type === 'signature' && (
                <View style={styles.signatureAnnotation}>
                  <Text style={styles.signatureText}>{annotation.content}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

        {/* Highlight drawing preview */}
        {annotationMode === 'highlight' && highlightStart && highlightEnd && (
          <View
            style={[
              styles.highlightPreview,
              {
                left: Math.min(highlightStart.x, highlightEnd.x),
                top: Math.min(highlightStart.y, highlightEnd.y),
                width: Math.abs(highlightEnd.x - highlightStart.x),
                height: Math.abs(highlightEnd.y - highlightStart.y),
              },
            ]}
          />
        )}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Button
          icon="text"
          mode={annotationMode === 'text' ? 'contained' : 'outlined'}
          onPress={() => {
            setAnnotationMode(annotationMode === 'text' ? 'none' : 'text');
          }}
          style={styles.toolbarButton}
        >
          Text
        </Button>
        <Button
          icon="format-color-highlight"
          mode={annotationMode === 'highlight' ? 'contained' : 'outlined'}
          onPress={() => {
            setAnnotationMode(annotationMode === 'highlight' ? 'none' : 'highlight');
          }}
          style={styles.toolbarButton}
        >
          Highlight
        </Button>
        <Button
          icon="draw"
          mode={annotationMode === 'signature' ? 'contained' : 'outlined'}
          onPress={() => {
            if (annotationMode === 'signature') {
              setAnnotationMode('none');
            } else {
              setAnnotationMode('signature');
              handleSignature();
            }
          }}
          style={styles.toolbarButton}
        >
          Sign
        </Button>
        {annotationMode !== 'none' && (
          <Button
            icon="close"
            mode="text"
            onPress={() => setAnnotationMode('none')}
            style={styles.toolbarButton}
          >
            Cancel
          </Button>
        )}
        {totalPages > 0 && (
          <Text style={styles.pageInfo}>
            {page} / {totalPages}
          </Text>
        )}
      </View>

      {/* Text Annotation Dialog */}
      <Portal>
        <Dialog
          visible={showTextDialog}
          onDismiss={() => {
            setShowTextDialog(false);
            setTextInput('');
            setAnnotationMode('none');
          }}
        >
          <Dialog.Title>Add Text Annotation</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Text"
              value={textInput}
              onChangeText={setTextInput}
              multiline
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowTextDialog(false);
              setTextInput('');
              setAnnotationMode('none');
            }}>
              Cancel
            </Button>
            <Button onPress={saveTextAnnotation} disabled={!textInput.trim()}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Highlight Dialog */}
        <Dialog
          visible={showHighlightDialog}
          onDismiss={() => {
            setShowHighlightDialog(false);
            setHighlightText('');
            setHighlightStart(null);
            setHighlightEnd(null);
            setAnnotationMode('none');
          }}
        >
          <Dialog.Title>Add Highlight</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Note (optional)"
              value={highlightText}
              onChangeText={setHighlightText}
              multiline
              mode="outlined"
              placeholder="Add a note about this highlight..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowHighlightDialog(false);
              setHighlightText('');
              setHighlightStart(null);
              setHighlightEnd(null);
              setAnnotationMode('none');
            }}>
              Cancel
            </Button>
            <Button onPress={saveHighlightAnnotation}>
              Add Highlight
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Signature Dialog */}
        <Dialog
          visible={showSignatureDialog}
          onDismiss={() => {
            setShowSignatureDialog(false);
            setSignatureInput('');
            setAnnotationMode('none');
          }}
        >
          <Dialog.Title>Add Signature</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Signature Text"
              value={signatureInput}
              onChangeText={setSignatureInput}
              mode="outlined"
              autoFocus
              placeholder="Enter your signature..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowSignatureDialog(false);
              setSignatureInput('');
              setAnnotationMode('none');
            }}>
              Cancel
            </Button>
            <Button onPress={saveSignatureAnnotation} disabled={!signatureInput.trim()}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Annotation Menu */}
        {selectedAnnotation && (
          <Menu
            visible={menuVisible}
            onDismiss={() => {
              setMenuVisible(false);
              setSelectedAnnotation(null);
            }}
            anchor={{ x: menuPosition.x, y: menuPosition.y }}
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDeleteAnnotation();
              }}
              title="Delete"
              leadingIcon="delete"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setSelectedAnnotation(null);
              }}
              title="Close"
            />
          </Menu>
        )}
      </Portal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
  pdf: {
    flex: 1,
    width,
    height,
    backgroundColor: '#525252',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toolbarButton: {
    marginHorizontal: 4,
  },
  pageInfo: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  annotationOverlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#00000040',
    borderRadius: 4,
  },
  textAnnotation: {
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  annotationText: {
    fontSize: 12,
    color: '#000000',
  },
  signatureAnnotation: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  signatureText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#000000',
  },
  highlightPreview: {
    position: 'absolute',
    backgroundColor: '#FFFF0080',
    borderWidth: 1,
    borderColor: '#FFFF00',
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
});

