import { synthesizeAzureSpeech, AZURE_VOICES, AzureTTSOptions, AzureTTSResult, AzureSpeechError } from './azureSpeechService.js';

export { AzureSpeechError, AzureTTSResult, AzureTTSOptions };

export interface VoiceDescriptor {
  id: string;
  name: string;
  label: string;
  provider: 'azure';
}

export function getAvailableVoices(): VoiceDescriptor[] {
  return Object.values(AZURE_VOICES).map(voice => ({
    ...voice,
    provider: 'azure' as const
  }));
}

/**
 * Generates spoken affirmations using Microsoft Azure Text-to-Speech.
 * Strictly dedicated to speech; never used for music generation.
 * Handles failures explicitly without silent fallbacks.
 */
export async function generateAzureSpeech(options: AzureTTSOptions): Promise<AzureTTSResult> {
  return await synthesizeAzureSpeech(options);
}
