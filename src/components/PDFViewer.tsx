import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { ActivityIndicator, Button, Portal, Dialog, TextInput, IconButton } from 'react-native-paper';
import { PDFAnnotation } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import { SignatureCanvas } from './SignatureCanvas';

interface PDFViewerProps {
  uri: string;
  annotations?: PDFAnnotation[];
  onAnnotationAdd?: (annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) => void;
  onAnnotationUpdate?: (annotationId: string, updates: Partial<PDFAnnotation>) => void;
  onAnnotationDelete?: (annotationId: string) => void;
}

type AnnotationMode = 'none' | 'text' | 'signature';

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
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedAnnotation, setSelectedAnnotation] = useState<PDFAnnotation | null>(null);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [draggingAnnotation, setDraggingAnnotation] = useState<PDFAnnotation | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [textFontSize, setTextFontSize] = useState(14);
  const webViewRef = useRef<WebView>(null);
  const containerRef = useRef<View>(null);

  // Convert PDF URI to HTML with embedded PDF.js
  useEffect(() => {
    const preparePDF = async () => {
      try {
        setLoading(true);
        setError('');
        setPdfHtml('');

        if (uri.startsWith('file://') || uri.startsWith('content://')) {
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: 'base64' as any,
            });
            
            if (!base64 || base64.length === 0) {
              setError('PDF file is empty or could not be read');
              setLoading(false);
              return;
            }
            
            const htmlContent = createPDFViewerHTMLFromBase64(base64);
            setPdfHtml(htmlContent);
          } catch (readError: any) {
            setError(`Failed to read PDF file: ${readError.message || 'Unknown error'}`);
            setLoading(false);
            return;
          }
          
        } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
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
          setError('Unsupported PDF URI format');
          setLoading(false);
        }
      } catch (err: any) {
        setError(`Failed to load PDF: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    preparePDF();
  }, [uri]);

  // Create PDF viewer HTML with embedded base64 PDF
  const createPDFViewerHTMLFromBase64 = (base64: string): string => {
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
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const base64Data = '${escapedBase64}';
        if (!base64Data || base64Data.length === 0) {
          throw new Error('PDF data is empty');
        }
        
        const pdfData = atob(base64Data);
        const uint8Array = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          uint8Array[i] = pdfData.charCodeAt(i);
        }
        
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pdfLoaded',
            totalPages: pdf.numPages
          }));
        }
        
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.remove();
        
        const container = document.getElementById('pdf-container');
        if (!container) return;
        
        const renderPage = async function(pageNum) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const maxWidth = window.innerWidth - 20;
          const scale = Math.min(maxWidth / viewport.width, 2.0);
          const scaledViewport = page.getViewport({ scale: scale });
          
          const pageContainer = document.createElement('div');
          pageContainer.style.textAlign = 'center';
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          pageContainer.appendChild(canvas);
          container.appendChild(pageContainer);
          
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;
        };
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            await renderPage(pageNum);
          } catch (err) {
            console.error('Error rendering page', pageNum, ':', err);
          }
        }
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

  // Pan responder for dragging annotations - created once and reused
  const dragPanResponderRef = useRef<Map<string, any>>(new Map());

  const getDragPanResponder = (annotation: PDFAnnotation) => {
    if (!dragPanResponderRef.current.has(annotation.id)) {
      const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => annotationMode === 'none',
        onMoveShouldSetPanResponder: () => annotationMode === 'none',
        onPanResponderGrant: (evt) => {
          const { pageX, pageY } = evt.nativeEvent;
          setDraggingAnnotation(annotation);
          setDragOffset({
            x: pageX - annotation.x,
            y: pageY - annotation.y,
          });
        },
        onPanResponderMove: (evt) => {
          if (draggingAnnotation && draggingAnnotation.id === annotation.id) {
            const { pageX, pageY } = evt.nativeEvent;
            const newX = Math.max(0, pageX - dragOffset.x);
            const newY = Math.max(0, pageY - dragOffset.y);
            
            if (onAnnotationUpdate) {
              onAnnotationUpdate(annotation.id, { x: newX, y: newY });
            }
          }
        },
        onPanResponderRelease: () => {
          setDraggingAnnotation(null);
          setDragOffset({ x: 0, y: 0 });
        },
      });
      dragPanResponderRef.current.set(annotation.id, panResponder);
    }
    return dragPanResponderRef.current.get(annotation.id);
  };

  const handleTap = (evt: any) => {
    const { pageX, pageY } = evt.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    if (annotationMode === 'text') {
      setShowTextDialog(true);
    } else if (annotationMode === 'signature') {
      setShowSignatureDialog(true);
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
        Alert.alert(
          'Annotation',
          'What would you like to do?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                if (onAnnotationDelete) {
                  onAnnotationDelete(tappedAnnotation.id);
                }
                setSelectedAnnotation(null);
              },
            },
          ]
        );
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
        height: textFontSize + 10,
        content: textInput,
        color: '#000000',
        fontSize: textFontSize,
        page: 1,
      });
      setTextInput('');
      setShowTextDialog(false);
      setAnnotationMode('none');
    }
  };

  const saveSignatureAnnotation = (imageData: string) => {
    if (onAnnotationAdd) {
      onAnnotationAdd({
        type: 'signature',
        x: tapPosition.x,
        y: tapPosition.y,
        width: 200,
        height: 50,
        imageData: imageData,
        color: '#000000',
        page: 1,
      });
      setShowSignatureDialog(false);
      setAnnotationMode('none');
    }
  };

  const handleRetry = () => {
    setError('');
    setPdfHtml('');
    setLoading(true);
  };

  return (
    <View style={styles.container} ref={containerRef}>
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
            baseUrl: 'https://cdnjs.cloudflare.com'
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={(error: any) => {
            const nativeEvent = error.nativeEvent || {};
            const errorDesc = nativeEvent.description || 'Unknown error';
            setError(`WebView error: ${errorDesc}`);
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
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'pdfLoaded') {
                // PDF loaded successfully
              }
            } catch (error) {
              // Ignore parse errors
            }
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      ) : null}
      
      {/* Tap capture overlay */}
      {annotationMode !== 'none' && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Annotation Overlays with drag support */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {annotations.map((annotation) => {
          const dragPanResponder = getDragPanResponder(annotation);
          return (
            <View
              key={annotation.id}
              style={[
                styles.annotationOverlay,
                {
                  left: annotation.x,
                  top: annotation.y,
                  width: annotation.width || 100,
                  height: annotation.height || 30,
                },
              ]}
              {...dragPanResponder.panHandlers}
            >
              {annotation.type === 'text' && (
                <View style={styles.textAnnotation}>
                  <Text style={[styles.annotationText, { fontSize: annotation.fontSize || 14 }]}>
                    {annotation.content}
                  </Text>
                </View>
              )}
              {annotation.type === 'signature' && (
                <View style={styles.signatureAnnotation}>
                  {annotation.imageData ? (
                    <View style={styles.signatureImageContainer}>
                      {/* Note: For SVG images, we'd need react-native-svg, for now show placeholder */}
                      <Text style={styles.signaturePlaceholder}>Signature</Text>
                    </View>
                  ) : (
                    <Text style={styles.signatureText}>{annotation.content || 'Signature'}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Simple Toolbar */}
      <View style={styles.toolbar}>
        <Button
          icon="text"
          mode={annotationMode === 'text' ? 'contained' : 'outlined'}
          onPress={() => {
            setAnnotationMode(annotationMode === 'text' ? 'none' : 'text');
          }}
          style={styles.toolbarButton}
        >
          Add Text
        </Button>
        <Button
          icon="draw"
          mode={annotationMode === 'signature' ? 'contained' : 'outlined'}
          onPress={() => {
            if (annotationMode === 'signature') {
              setAnnotationMode('none');
            } else {
              setAnnotationMode('signature');
              setShowSignatureDialog(true);
            }
          }}
          style={styles.toolbarButton}
        >
          Add Signature
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
          <Dialog.Title>Add Text</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Text"
              value={textInput}
              onChangeText={setTextInput}
              multiline
              mode="outlined"
              autoFocus
              style={{ marginBottom: 10 }}
            />
            <View style={styles.controlsRow}>
              <Text style={styles.controlLabel}>Font Size:</Text>
              <View style={styles.fontSizeControls}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => setTextFontSize(prev => Math.max(10, prev - 2))}
                />
                <Text style={styles.fontSizeText}>{textFontSize}</Text>
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => setTextFontSize(prev => Math.min(48, prev + 2))}
                />
              </View>
            </View>
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

        {/* Signature Dialog */}
        <Dialog
          visible={showSignatureDialog}
          onDismiss={() => {
            setShowSignatureDialog(false);
            setAnnotationMode('none');
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Add Signature</Dialog.Title>
          <Dialog.Content>
            <SignatureCanvas
              onSave={saveSignatureAnnotation}
              onCancel={() => {
                setShowSignatureDialog(false);
                setAnnotationMode('none');
              }}
            />
          </Dialog.Content>
        </Dialog>
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
    minHeight: 20,
  },
  annotationText: {
    color: '#000000',
  },
  signatureAnnotation: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#000000',
  },
  signatureImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholder: {
    fontSize: 12,
    color: '#666',
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
  dialog: {
    maxHeight: '80%',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  controlLabel: {
    fontSize: 14,
    marginRight: 10,
    minWidth: 80,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
});
