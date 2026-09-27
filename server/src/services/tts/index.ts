import { synthesizeElevenLabs, ELEVENLABS_VOICES, TTSGenerationOptions } from './elevenLabsService.js';
import { synthesizeAzureSpeech, AZURE_VOICES } from './azureSpeechService.js';

export interface GenerateSpeechParams extends TTSGenerationOptions {
  provider?: 'elevenlabs' | 'azure';
}

export interface VoiceDescriptor {
  id: string;
  name: string;
  label: string;
  provider: 'elevenlabs' | 'azure';
}

export function getAvailableVoices(): VoiceDescriptor[] {
  const list: VoiceDescriptor[] = [];
  
  for (const voice of Object.values(ELEVENLABS_VOICES)) {
    list.push({ ...voice, provider: 'elevenlabs' });
  }

  for (const voice of Object.values(AZURE_VOICES)) {
    list.push({ ...voice, provider: 'azure' });
  }

  return list;
}

export async function generateSpeech(params: GenerateSpeechParams): Promise<Buffer> {
  const provider = params.provider || (process.env.TTS_PROVIDER as 'elevenlabs' | 'azure') || 'elevenlabs';

  if (provider === 'azure') {
    try {
      return await synthesizeAzureSpeech(params);
    } catch (azureErr) {
      console.warn(`[TTS] Azure speech failed (${(azureErr as Error).message}), attempting ElevenLabs fallback...`);
      if (process.env.ELEVEN_LABS_API_KEY) {
        return await synthesizeElevenLabs(params);
      }
      throw azureErr;
    }
  }

  // Default: ElevenLabs
  try {
    return await synthesizeElevenLabs(params);
  } catch (err) {
    console.warn(`[TTS] ElevenLabs speech failed (${(err as Error).message})`);
    if (process.env.MICROSOFT_AZURE_API_KEY) {
      console.info('[TTS] Attempting Azure Speech fallback...');
      return await synthesizeAzureSpeech(params);
    }
    throw err;
  }
}
