import fs from 'fs';
import path from 'path';
import { measureAudioDuration } from './tts/azureSpeechService.js';
import { resolveAmbienceTrack, AmbienceTrack } from '../config/ambienceCatalog.js';

export class ElevenLabsMusicError extends Error {
  public code: string;
  public status?: number;
  public details?: any;

  constructor(code: string, message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ElevenLabsMusicError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface MusicGenerationOptions {
  prompt?: string;
  sessionTitle?: string;
  category?: string;
  usageContext?: 'sleep' | 'focus' | 'meditation' | 'walking' | 'morning';
  ambienceStyle?: string;
  targetDurationSeconds?: number;
  outputPath?: string;
  allowAmbienceFallback?: boolean;
}

export interface GeneratedMusicResult {
  outputPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  promptUsed: string;
  isInstrumental: boolean;
  provider: 'elevenlabs' | 'verified_ambience';
  fallbackReason?: string;
}

export class ElevenLabsMusicService {
  private getApiKey(): string {
    const key = (process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY || '').trim();
    return key;
  }

  /**
   * Constructs a tailored, high-fidelity instrumental ambient prompt from session context
   */
  public buildMusicPrompt(options: {
    sessionTitle?: string;
    category?: string;
    usageContext?: string;
    ambienceStyle?: string;
  }): string {
    const context = options.usageContext || 'meditation';
    const title = options.sessionTitle || 'Inner Alignment';

    let moodStyle = 'soft evolving warm analog pads, gentle tonal resonance, restrained dynamics';
    if (context === 'sleep') {
      moodStyle = 'ultra-gentle drifting ethereal warm pads, deep slow-moving harmonic resonance, zero beats, perfectly calm lullaby stillness';
    } else if (context === 'focus') {
      moodStyle = 'continuous focused atmospheric ambient texture, warm subtle sub-frequencies, gently undulating pads, steady non-intrusive clarity';
    } else if (context === 'morning') {
      moodStyle = 'luminous dawn atmosphere, soft warm organic pads, uplifting serene harmonic textures, gentle waking clarity';
    } else if (context === 'walking') {
      moodStyle = 'serene flowing ambient soundscape, gentle grounded pads, continuous peaceful warmth';
    }

    return (
      `Continuous atmospheric ambient instrumental soundtrack for "${title}". ` +
      `${moodStyle}, no vocals, no lyrics, no sudden transitions, no harsh drums, no dramatic percussion, pure relaxing instrumental soundbed.`
    ).trim();
  }

  /**
   * Diagnostic check to verify whether the ElevenLabs account supports the Music Generation API
   */
  public async checkMusicAvailability(): Promise<{
    supported: boolean;
    tier?: string;
    code?: string;
    reason?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        supported: false,
        code: 'ELEVENLABS_AUTH_ERROR',
        reason: 'ELEVENLABS_API_KEY is not configured in environment.'
      };
    }

    try {
      const res = await fetch('https://api.elevenlabs.io/v1/music/stream', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'gentle ambient pads, no vocals',
          music_length_ms: 5000,
          force_instrumental: true
        })
      });

      if (res.ok) {
        return { supported: true };
      }

      const errJson = await res.json().catch(() => ({}));
      const detail = errJson.detail || {};

      if (res.status === 401) {
        return {
          supported: false,
          code: 'ELEVENLABS_AUTH_ERROR',
          reason: detail.message || 'Invalid ElevenLabs API key.'
        };
      }

      if (res.status === 402 || detail.code === 'paid_plan_required' || detail.status === 'limited_access') {
        return {
          supported: false,
          code: 'ELEVENLABS_MUSIC_UNAVAILABLE',
          reason: detail.message || 'Music API is not available on this account tier (paid plan required).'
        };
      }

      return {
        supported: false,
        code: 'ELEVENLABS_MUSIC_GENERATION_FAILED',
        reason: detail.message || `Music check returned status ${res.status}`
      };
    } catch (err: any) {
      return {
        supported: false,
        code: 'ELEVENLABS_NETWORK_ERROR',
        reason: err.message
      };
    }
  }

  /**
   * Real ElevenLabs Music generation call.
   * Generates instrumental ambient soundtrack using ElevenLabs Music API endpoints.
   */
  public async generateMusic(options: MusicGenerationOptions): Promise<GeneratedMusicResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ElevenLabsMusicError(
        'ELEVENLABS_AUTH_ERROR',
        'ELEVENLABS_API_KEY is not configured in server environment.'
      );
    }

    const prompt = options.prompt || this.buildMusicPrompt({
      sessionTitle: options.sessionTitle,
      category: options.category,
      usageContext: options.usageContext,
      ambienceStyle: options.ambienceStyle
    });

    const targetSec = options.targetDurationSeconds || 30;
    // ElevenLabs music duration is clamped to supported single-generation limits (5s to 60s)
    const musicLengthMs = Math.min(60000, Math.max(5000, Math.round(targetSec * 1000)));

    console.log(`[ElevenLabsMusic] Initiating music generation for "${options.sessionTitle || 'Session'}"...`);
    console.log(`[ElevenLabsMusic] Prompt: "${prompt}"`);
    console.log(`[ElevenLabsMusic] Requested duration: ${musicLengthMs}ms, force_instrumental: true`);

    const endpoint = 'https://api.elevenlabs.io/v1/music/stream';

    let res: globalThis.Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          prompt,
          music_length_ms: musicLengthMs,
          force_instrumental: true
        })
      });
    } catch (netErr: any) {
      throw new ElevenLabsMusicError(
        'ELEVENLABS_MUSIC_GENERATION_FAILED',
        `Network error during ElevenLabs music request: ${netErr.message}`
      );
    }

    if (!res.ok) {
      let errBody: any;
      try {
        errBody = await res.json();
      } catch {
        errBody = { message: await res.text().catch(() => '') };
      }
      const detail = errBody.detail || errBody;
      const errorMsg = detail.message || JSON.stringify(errBody);

      if (res.status === 401) {
        throw new ElevenLabsMusicError(
          'ELEVENLABS_AUTH_ERROR',
          `ElevenLabs authentication failed [HTTP 401]: ${errorMsg}`,
          res.status,
          detail
        );
      }

      if (res.status === 402 || detail.code === 'paid_plan_required' || detail.status === 'limited_access') {
        throw new ElevenLabsMusicError(
          'ELEVENLABS_MUSIC_UNAVAILABLE',
          `ElevenLabs Music API is unavailable for this account [HTTP 402]: ${errorMsg}`,
          res.status,
          detail
        );
      }

      throw new ElevenLabsMusicError(
        'ELEVENLABS_MUSIC_GENERATION_FAILED',
        `ElevenLabs music generation failed [HTTP ${res.status}]: ${errorMsg}`,
        res.status,
        detail
      );
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (!buffer || buffer.byteLength < 1024) {
      throw new ElevenLabsMusicError(
        'AUDIO_VALIDATION_FAILED',
        `ElevenLabs music API returned empty or corrupted audio (${buffer ? buffer.byteLength : 0} bytes).`
      );
    }

    const outputFilePath =
      options.outputPath ||
      path.resolve(__dirname, `../../media/temp/elevenlabs_music_${Date.now()}.mp3`);

    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, buffer);

    const durationSeconds = await measureAudioDuration(outputFilePath);

    console.log(`[ElevenLabsMusic] ✓ Audio received successfully! Bytes: ${buffer.byteLength}, Duration: ${durationSeconds}s`);

    return {
      outputPath: outputFilePath,
      durationSeconds: durationSeconds || Math.round(musicLengthMs / 1000),
      fileSizeBytes: buffer.byteLength,
      promptUsed: prompt,
      isInstrumental: true,
      provider: 'elevenlabs'
    };
  }

  /**
   * Resolves the music/ambience track for the session.
   * If ElevenLabs is configured, it attempts real music generation.
   * If the account lacks music generation capability and the user configuration allows verified ambience fallback,
   * it returns the verified licensed ambience asset with explicit metadata.
   */
  public async resolveSessionMusicTrack(options: MusicGenerationOptions & {
    musicProvider?: 'elevenlabs' | 'ambience_catalog';
  }): Promise<GeneratedMusicResult> {
    const provider = options.musicProvider || (process.env.MUSIC_PROVIDER as 'elevenlabs' | 'ambience_catalog') || 'elevenlabs';

    if (provider === 'elevenlabs') {
      try {
        return await this.generateMusic(options);
      } catch (err: any) {
        if (err instanceof ElevenLabsMusicError && err.code === 'ELEVENLABS_MUSIC_UNAVAILABLE') {
          if (options.allowAmbienceFallback) {
            console.warn(`[MusicResolver] ElevenLabs music unavailable (${err.message}). Using verified licensed ambience asset fallback.`);
            const verifiedAmbience = resolveAmbienceTrack(options.ambienceStyle || 'rain-light');
            const fallbackPath = verifiedAmbience.filePath || '';
            const duration = fs.existsSync(fallbackPath) ? await measureAudioDuration(fallbackPath) : 60;
            const size = fs.existsSync(fallbackPath) ? fs.statSync(fallbackPath).size : 0;

            return {
              outputPath: fallbackPath,
              durationSeconds: duration,
              fileSizeBytes: size,
              promptUsed: `Verified ambience: ${verifiedAmbience.name} (${verifiedAmbience.category})`,
              isInstrumental: true,
              provider: 'verified_ambience',
              fallbackReason: err.message
            };
          }
        }
        // If not allowed to fallback or different error, rethrow
        throw err;
      }
    }

    // Direct verified ambience asset
    const verifiedAmbience = resolveAmbienceTrack(options.ambienceStyle || 'rain-light');
    const fallbackPath = verifiedAmbience.filePath || '';
    const duration = fs.existsSync(fallbackPath) ? await measureAudioDuration(fallbackPath) : 60;
    const size = fs.existsSync(fallbackPath) ? fs.statSync(fallbackPath).size : 0;

    return {
      outputPath: fallbackPath,
      durationSeconds: duration,
      fileSizeBytes: size,
      promptUsed: `Verified ambience: ${verifiedAmbience.name} (${verifiedAmbience.category})`,
      isInstrumental: true,
      provider: 'verified_ambience'
    };
  }
}

export const elevenLabsMusicService = new ElevenLabsMusicService();
