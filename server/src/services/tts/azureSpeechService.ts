import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const execFileAsync = promisify(execFile);

export class AzureSpeechError extends Error {
  public code: string;
  public status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'AzureSpeechError';
    this.code = code;
    this.status = status;
  }
}

export interface AzureTTSOptions {
  text: string;
  voiceId?: string;
  intensity?: 'subtle' | 'balanced' | 'prominent';
  outputPath?: string;
}

export interface AzureTTSResult {
  buffer: Buffer;
  durationSeconds: number;
  fileSizeBytes: number;
  voiceId: string;
  outputPath?: string;
}

export const AZURE_VOICES = {
  jenny: { id: 'en-US-JennyNeural', name: 'Jenny', label: 'Warm & Natural' },
  guy: { id: 'en-US-GuyNeural', name: 'Guy', label: 'Calm & Grounded' },
  aria: { id: 'en-US-AriaNeural', name: 'Aria', label: 'Deep & Reflective' },
  davis: { id: 'en-US-DavisNeural', name: 'Davis', label: 'Soothing & Steady' },
  jane: { id: 'en-US-JaneNeural', name: 'Jane', label: 'Clear & Present' },
  jason: { id: 'en-US-JasonNeural', name: 'Jason', label: 'Confident & Warm' }
};

export async function measureAudioDuration(filePath: string): Promise<number> {
  try {
    const ffprobePath = ffprobeInstaller.path;
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const duration = parseFloat(stdout.trim());
    return isNaN(duration) ? 0 : Math.round(duration * 100) / 100;
  } catch (err) {
    console.warn(`[AudioMeasure] Could not read duration for ${filePath}:`, (err as Error).message);
    return 0;
  }
}

export async function synthesizeAzureSpeech(options: AzureTTSOptions): Promise<AzureTTSResult> {
  const apiKey = (process.env.AZURE_SPEECH_KEY || process.env.MICROSOFT_AZURE_API_KEY || '').trim();
  const region = (process.env.AZURE_SPEECH_REGION || process.env.MICROSOFT_AZURE_REGION || 'southeastasia').trim();

  if (!apiKey) {
    throw new AzureSpeechError(
      'AZURE_AUTH_ERROR',
      'Microsoft Azure Speech credentials are missing. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in server environment.'
    );
  }

  // Resolve voice ID
  let voiceName = options.voiceId;
  const knownVoiceIds = Object.values(AZURE_VOICES).map(v => v.id);
  if (!voiceName || !knownVoiceIds.includes(voiceName)) {
    const key = (voiceName || 'jenny').toLowerCase() as keyof typeof AZURE_VOICES;
    voiceName = AZURE_VOICES[key]?.id || AZURE_VOICES.jenny.id;
  }

  // Adjust rate and pitch based on subliminal intensity
  const rate = options.intensity === 'subtle' ? '-6%' : options.intensity === 'prominent' ? '0%' : '-3%';
  const pitch = '-2%';

  // Escape XML special characters
  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Split into segments around pause delimiters and insert SSML break tags
  const segments = options.text
    .split(/\s*\.\.\.\s*\.\.\.\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  const innerSsml = segments
    .map(seg => `    <s>${escapeXml(seg)}</s>\n    <break time="800ms"/>`)
    .join('\n');

  // SSML formatted for calm, rhythmic delivery with pauses
  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitch}">
${innerSsml}
    </prosody>
  </voice>
</speak>`.trim();

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  let response: globalThis.Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
        'User-Agent': 'OrbitManifestation/1.0'
      },
      body: ssml
    });
  } catch (netErr: any) {
    throw new AzureSpeechError(
      'AZURE_SPEECH_SYNTHESIS_FAILED',
      `Azure Speech network connection failed: ${netErr.message}`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new AzureSpeechError(
        'AZURE_AUTH_ERROR',
        `Azure Speech authentication failed [HTTP ${response.status}]: Invalid API key or region mismatch for region "${region}". ${errorText}`,
        response.status
      );
    }
    if (response.status === 429) {
      throw new AzureSpeechError(
        'AZURE_QUOTA_EXCEEDED',
        `Azure Speech quota or rate limit exceeded [HTTP 429]: ${errorText}`,
        response.status
      );
    }
    if (response.status === 400) {
      throw new AzureSpeechError(
        'AZURE_SSML_INVALID',
        `Azure Speech rejected SSML request [HTTP 400]: ${errorText}`,
        response.status
      );
    }
    throw new AzureSpeechError(
      'AZURE_SPEECH_SYNTHESIS_FAILED',
      `Azure Speech synthesis failed [HTTP ${response.status}]: ${errorText}`,
      response.status
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate that the buffer is non-empty and has plausible audio size
  if (!buffer || buffer.byteLength < 1024) {
    throw new AzureSpeechError(
      'AUDIO_VALIDATION_FAILED',
      `Azure Speech returned an empty or invalid audio payload (${buffer ? buffer.byteLength : 0} bytes).`
    );
  }

  let durationSeconds = 0;
  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.outputPath, buffer);

    // Measure exact audio duration
    durationSeconds = await measureAudioDuration(options.outputPath);
  }

  return {
    buffer,
    durationSeconds,
    fileSizeBytes: buffer.byteLength,
    voiceId: voiceName,
    outputPath: options.outputPath
  };
}
