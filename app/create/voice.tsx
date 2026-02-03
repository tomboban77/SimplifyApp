import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, Card, Text, TextInput, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useDocumentStore } from '@/store/documentStore';
import { useAIService } from '@/services/aiService';
import { useSpeechToText } from '@/services/speechService';

export default function VoiceInputScreen() {
  const router = useRouter();
  const { createDocument } = useDocumentStore();
  const { generateDocument } = useAIService();
  const { transcribeAudio } = useSpeechToText();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setTranscribing(true);
    
    try {
      const status = await recording.getStatusAsync();
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        try {
          // Try to transcribe using OpenAI Whisper
          const transcribedText = await transcribeAudio(uri);
          setTranscript(transcribedText || '');
        } catch (error: any) {
          console.error('Transcription error:', error);
          // If API key not set or error, show manual input option
          if (error.message?.includes('API key')) {
            Alert.alert(
              'Transcription Service',
              'OpenAI API key not configured. You can manually enter the transcript or set EXPO_PUBLIC_OPENAI_API_KEY in your environment.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Enter Manually', onPress: () => setShowManualInput(true) },
              ]
            );
          } else {
            Alert.alert(
              'Transcription Error',
              'Could not transcribe audio. You can manually enter the transcript.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Enter Manually', onPress: () => setShowManualInput(true) },
              ]
            );
          }
        }
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    } finally {
      setTranscribing(false);
      setRecording(null);
    }
  };

  const handleCreateDocument = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      const content = await generateDocument(transcript);
      const doc = await createDocument({
        title: 'Voice Document',
        content,
      });
      router.push(`/editor/${doc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Voice Input" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Voice Recording
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {isRecording
                ? 'Recording in progress...'
                : 'Tap the button below to start recording'}
            </Text>

            <View style={styles.recordingContainer}>
              <Button
                mode={isRecording ? 'contained' : 'outlined'}
                icon={isRecording ? 'stop' : 'microphone'}
                onPress={isRecording ? stopRecording : startRecording}
                style={styles.recordButton}
                buttonColor={isRecording ? '#f44336' : undefined}
                disabled={transcribing}
                loading={transcribing}
              >
                {transcribing 
                  ? 'Transcribing...' 
                  : isRecording 
                    ? 'Stop Recording' 
                    : 'Start Recording'}
              </Button>
              
              {!isRecording && !transcribing && (
                <Button
                  mode="text"
                  icon="keyboard"
                  onPress={() => setShowManualInput(true)}
                  style={styles.manualButton}
                >
                  Or Type Manually
                </Button>
              )}
            </View>

            {transcript ? (
              <View style={styles.transcriptContainer}>
                <Text variant="titleSmall" style={styles.transcriptLabel}>
                  Transcript:
                </Text>
                <Text variant="bodyMedium" style={styles.transcript}>
                  {transcript}
                </Text>
                <Button
                  mode="contained"
                  onPress={handleCreateDocument}
                  loading={loading}
                  disabled={loading}
                  style={styles.createButton}
                >
                  Create Document
                </Button>
              </View>
            ) : null}
          </Card.Content>
        </Card>
      </View>

      <Portal>
        <Dialog
          visible={showManualInput}
          onDismiss={() => {
            setShowManualInput(false);
            setManualTranscript('');
          }}
        >
          <Dialog.Title>Enter Transcript</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="What did you say?"
              value={manualTranscript}
              onChangeText={setManualTranscript}
              multiline
              numberOfLines={6}
              mode="outlined"
              placeholder="Type or paste your transcript here..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowManualInput(false);
              setManualTranscript('');
            }}>
              Cancel
            </Button>
            <Button 
              onPress={() => {
                setTranscript(manualTranscript);
                setShowManualInput(false);
                setManualTranscript('');
              }}
              disabled={!manualTranscript.trim()}
            >
              Use This
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#757575',
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  recordButton: {
    minWidth: 200,
  },
  transcriptContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  transcriptLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  transcript: {
    marginBottom: 16,
    color: '#424242',
  },
  createButton: {
    marginTop: 8,
  },
  manualButton: {
    marginTop: 16,
  },
});

