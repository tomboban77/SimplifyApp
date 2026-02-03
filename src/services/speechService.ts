import * as FileSystem from 'expo-file-system';

interface SpeechToTextOptions {
  apiKey?: string;
}

class SpeechToTextService {
  private apiKey: string | null = null;

  constructor(options?: SpeechToTextOptions) {
    this.apiKey = options?.apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   * @param audioUri - URI of the audio file to transcribe
   * @returns Transcribed text
   */
  async transcribeAudio(audioUri: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY or provide apiKey in options.');
    }

    try {
      // Read the audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get file extension
      const fileExtension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
      const mimeType = this.getMimeType(fileExtension);

      // Convert base64 to blob format for OpenAI
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: mimeType,
        name: `audio.${fileExtension}`,
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw error;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'mp4': 'audio/mp4',
      'webm': 'audio/webm',
      'ogg': 'audio/ogg',
    };
    return mimeTypes[extension] || 'audio/mp4';
  }

  /**
   * Manual transcription fallback - returns empty string to allow user input
   */
  async manualTranscription(): Promise<string> {
    return '';
  }
}

export const useSpeechToText = (apiKey?: string) => {
  const service = new SpeechToTextService({ apiKey });
  return {
    transcribeAudio: (audioUri: string) => service.transcribeAudio(audioUri),
    manualTranscription: () => service.manualTranscription(),
  };
};

