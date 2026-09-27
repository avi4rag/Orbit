import fs from 'fs';
import path from 'path';
import { TTSGenerationOptions } from './elevenLabsService.js';

export const AZURE_VOICES = {
  jenny: { id: 'en-US-JennyNeural', name: 'Jenny', label: 'Warm & Natural' },
  guy: { id: 'en-US-GuyNeural', name: 'Guy', label: 'Calm & Grounded' },
  aria: { id: 'en-US-AriaNeural', name: 'Aria', label: 'Deep & Reflective' },
  davis: { id: 'en-US-DavisNeural', name: 'Davis', label: 'Soothing & Steady' }
};

export async function synthesizeAzureSpeech(options: TTSGenerationOptions): Promise<Buffer> {
  const apiKey = process.env.MICROSOFT_AZURE_API_KEY;
  const region = process.env.MICROSOFT_AZURE_REGION || 'southeastasia';

  if (!apiKey) {
    throw new Error('MICROSOFT_AZURE_API_KEY is not configured in server environment.');
  }

  let voiceName = options.voiceId;
  if (!voiceName || !Object.values(AZURE_VOICES).some(v => v.id === voiceName)) {
    const key = (voiceName || 'jenny').toLowerCase() as keyof typeof AZURE_VOICES;
    voiceName = AZURE_VOICES[key]?.id || AZURE_VOICES.jenny.id;
  }

  // Adjust rate and pitch based on subliminal intensity
  const rate = options.intensity === 'subtle' ? '-5%' : '-2%';
  const pitch = '-2%';

  // SSML formatted for calm, rhythmic delivery
  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${options.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </prosody>
  </voice>
</speak>`.trim();

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'User-Agent': 'OrbitManifestation/1.0'
    },
    body: ssml
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Speech synthesis failed [HTTP ${response.status}]: ${errorText}`);
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
