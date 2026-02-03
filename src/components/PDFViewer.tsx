import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Alert, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ActivityIndicator, Button, Portal, Dialog, TextInput, Menu, IconButton } from 'react-native-paper';
import { PDFAnnotation } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';

interface PDFViewerProps {
  uri: string;
  annotations?: PDFAnnotation[];
  onAnnotationAdd?: (annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) => void;
  onAnnotationUpdate?: (annotationId: string, updates: Partial<PDFAnnotation>) => void;
  onAnnotationDelete?: (annotationId: string) => void;
}

type AnnotationMode = 'none' | 'text' | 'highlight' | 'signature';

export function PDFViewer({ 
  uri, 
  annotations = [],
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [pdfHtml, setPdfHtml] = useState<string>('');
  const [error, setError] = useState<string>('');
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
  const webViewRef = useRef<WebView>(null);
  const containerRef = useRef<View>(null);

  // Convert PDF URI to HTML with embedded PDF.js
  useEffect(() => {
    const preparePDF = async () => {
      try {
        setLoading(true);
        setError('');
        setPdfHtml('');

        console.log('📄 Preparing PDF from URI:', uri);

        // Handle local files (file:// or content://)
        if (uri.startsWith('file://') || uri.startsWith('content://')) {
          console.log('📖 Reading PDF file from:', uri);
          
          try {
            // Read file as base64 using FileSystem
            // expo-file-system v19 uses string literal for encoding
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: 'base64' as any,
            });
            
            if (!base64 || base64.length === 0) {
              console.error('❌ PDF file is empty');
              setError('PDF file is empty or could not be read');
              setLoading(false);
              return;
            }
            
            console.log(`✅ PDF loaded successfully (${Math.round(base64.length / 1024)}KB)`);
            
            // Verify base64 doesn't contain file URI (safety check)
            if (base64.includes('file://') || base64.includes('content://')) {
              throw new Error('Base64 data contains file URI - this should not happen');
            }
            
            // Create HTML with embedded PDF.js using base64
            const htmlContent = createPDFViewerHTMLFromBase64(base64);
            
            // Verify HTML doesn't contain file URI
            if (htmlContent.includes(uri) || htmlContent.includes('file://') || htmlContent.includes('content://')) {
              console.error('❌ HTML contains file URI - this is a bug!');
              throw new Error('Generated HTML contains file URI reference');
            }
            
            setPdfHtml(htmlContent);
          } catch (readError: any) {
            console.error('❌ Error reading PDF file:', readError);
            setError(`Failed to read PDF file: ${readError.message || 'Unknown error'}. Please try selecting the file again.`);
            setLoading(false);
            return;
          }
          
        } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
          // For remote URLs, use Google Docs Viewer
          console.log('🌐 Loading remote PDF via Google Docs Viewer');
          const encodedUri = encodeURIComponent(uri);
          const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    body, html { height: 100%; width: 100%; overflow: hidden; }
    iframe { border: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <iframe src="https://docs.google.com/viewer?url=${encodedUri}&embedded=true"></iframe>
</body>
</html>`;
          setPdfHtml(viewerHtml);
          
        } else {
          console.error('❌ Unsupported URI format:', uri);
          setError('Unsupported PDF URI format');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Error preparing PDF:', err);
        setError(`Failed to load PDF: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    preparePDF();
  }, [uri]);

  // Create PDF viewer HTML with embedded base64 PDF
  const createPDFViewerHTMLFromBase64 = (base64: string): string => {
    // Escape base64 for use in JavaScript string
    // Replace backslashes and quotes to prevent script injection
    const escapedBase64 = base64.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body {
      margin: 0;
      padding: 0;
      overflow: auto;
      background: #525252;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }
    #pdf-container {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      gap: 10px;
    }
    canvas {
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      max-width: 100%;
      height: auto;
      background: white;
    }
    #loading {
      color: white;
      font-size: 18px;
      margin-top: 20px;
      text-align: center;
    }
    #error {
      color: #ff6b6b;
      font-size: 16px;
      margin-top: 20px;
      text-align: center;
      padding: 20px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      max-width: 90%;
    }
    .page-number {
      color: white;
      font-size: 12px;
      margin-top: 5px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div id="pdf-container">
    <div id="loading">Loading PDF...</div>
  </div>
  <script>
    (async function() {
      try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        
        if (!pdfjsLib) {
          throw new Error('PDF.js library failed to load');
        }
        
        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const base64Data = '${escapedBase64}';
        console.log('Decoding PDF data...');
        
        if (!base64Data || base64Data.length === 0) {
          throw new Error('PDF data is empty');
        }
        
        // Decode base64 to binary
        const pdfData = atob(base64Data);
        const uint8Array = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          uint8Array[i] = pdfData.charCodeAt(i);
        }
        
        console.log('Loading PDF document...');
        
        // Load PDF from binary data
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        console.log('PDF loaded successfully. Pages:', pdf.numPages);
        
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.remove();
        
        const container = document.getElementById('pdf-container');
        if (!container) return;
        
        // Render each page
        const renderPage = async function(pageNum) {
          const page = await pdf.getPage(pageNum);
          console.log('Rendering page', pageNum);
          
          const viewport = page.getViewport({ scale: 1 });
          
          // Calculate scale to fit screen width with padding
          const maxWidth = window.innerWidth - 20;
          const scale = Math.min(maxWidth / viewport.width, 2.0);
          const scaledViewport = page.getViewport({ scale: scale });
          
          // Create page container
          const pageContainer = document.createElement('div');
          pageContainer.style.textAlign = 'center';
          
          // Add page number
          const pageLabel = document.createElement('div');
          pageLabel.className = 'page-number';
          pageLabel.textContent = 'Page ' + pageNum + ' of ' + pdf.numPages;
          pageContainer.appendChild(pageLabel);
          
          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          pageContainer.appendChild(canvas);
          container.appendChild(pageContainer);
          
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;
        };
        
        // Render all pages sequentially
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            await renderPage(pageNum);
          } catch (err) {
            console.error('Error rendering page', pageNum, ':', err);
          }
        }
        console.log('All pages rendered successfully');
        
      } catch (err) {
        console.error('Fatal error:', err);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
          loadingEl.innerHTML = '<div id="error">Error: ' + (err.message || 'Unknown error') + '</div>';
        }
      }
    })();
  </script>
</body>
</html>`;
  };

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
        page: 1,
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
        page: 1,
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
        page: 1,
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

  const handleRetry = () => {
    setError('');
    setPdfHtml('');
    setLoading(true);
  };

  return (
    <View style={styles.container} ref={containerRef} {...panResponder.panHandlers}>
      {loading && !pdfHtml && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading PDF...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={handleRetry}>
            Retry
          </Button>
        </View>
      ) : pdfHtml && !pdfHtml.includes(uri) && !pdfHtml.includes('file://') && !pdfHtml.includes('content://') ? (
        <WebView
          key={`pdf-${Date.now()}`}
          ref={webViewRef}
          source={{ 
            html: pdfHtml,
            baseUrl: 'https://cdnjs.cloudflare.com' // Set base URL to prevent file URI resolution
          }}
          onLoadEnd={() => {
            console.log('✅ WebView loaded successfully');
            setLoading(false);
          }}
          onError={(error: any) => {
            const nativeEvent = error.nativeEvent || {};
            const errorUrl = nativeEvent.url || '';
            const errorDesc = nativeEvent.description || 'Unknown error';
            
            console.error('❌ WebView error:', {
              description: errorDesc,
              url: errorUrl,
              code: nativeEvent.code,
              fullError: nativeEvent
            });
            
            // If error is about file access, provide specific message
            if (errorUrl.includes('file://') || errorUrl.includes('content://') || errorDesc.includes('ACCESS_DENIED')) {
              setError('Cannot access PDF file. The file may have been moved or deleted. Please try selecting it again.');
            } else {
              setError(`WebView error: ${errorDesc}`);
            }
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ HTTP error:', nativeEvent);
            setError(`HTTP error: ${nativeEvent.statusCode || 'Unknown'}`);
            setLoading(false);
          }}
          style={styles.webview}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['*', 'data:', 'https:', 'http:']}
          mixedContentMode="always"
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          onMessage={(event) => {
            console.log('WebView message:', event.nativeEvent.data);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      ) : null}
      
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
        {annotations.map((annotation) => (
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
  webview: {
    flex: 1,
    width,
    height,
    backgroundColor: '#525252',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toolbarButton: {
    marginHorizontal: 4,
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