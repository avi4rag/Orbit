import fs from 'fs';
import path from 'path';

export interface TTSGenerationOptions {
  text: string;
  voiceId?: string;
  voiceStyle?: string;
  intensity?: 'subtle' | 'balanced' | 'prominent';
  outputPath?: string;
}

// Pre-tested core ElevenLabs voices available on all tiers
export const ELEVENLABS_VOICES = {
  adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', label: 'Deep & Grounded' },
  bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', label: 'Soft & Gentle' },
  antoni: { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', label: 'Warm & Calm' },
  arnold: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', label: 'Strong & Focused' }
};

export async function synthesizeElevenLabs(options: TTSGenerationOptions): Promise<Buffer> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVEN_LABS_API_KEY is not configured in server environment.');
  }

  // Map requested voice or fallback to Bella (soft) or Antoni (warm)
  let voiceId = options.voiceId;
  if (!voiceId || !Object.values(ELEVENLABS_VOICES).some(v => v.id === voiceId)) {
    // If voiceId matches a key name like "adam", "bella", etc.
    const key = (voiceId || 'bella').toLowerCase() as keyof typeof ELEVENLABS_VOICES;
    voiceId = ELEVENLABS_VOICES[key]?.id || ELEVENLABS_VOICES.bella.id;
  }

  const stability = options.intensity === 'subtle' ? 0.75 : options.intensity === 'prominent' ? 0.45 : 0.6;
  const similarity_boost = 0.8;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: options.text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability,
        similarity_boost,
        style: 0.1,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs TTS failed [HTTP ${response.status}]: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.outputPath, buffer);
  }

  return buffer;
}
