import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { resolveAmbienceTrack } from '../config/ambienceCatalog.js';

const execFileAsync = promisify(execFile);

export class AudioMixerError extends Error {
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AudioMixerError';
    this.code = code;
  }
}

export interface MixSessionAudioOptions {
  sessionId: string;
  voiceAudioPath: string;
  musicAudioPath?: string;
  ambienceTrackId?: string;
  frequencyHz?: number;
  durationMinutes: number;
  intensity: 'subtle' | 'balanced' | 'prominent';
  outputDirectory: string;
}

export interface MixResult {
  outputPath: string;
  relativeUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  sha256: string;
}

export class AudioMixerService {
  /**
   * Measures actual audio file duration using ffprobe
   */
  public async getAudioDuration(filePath: string): Promise<number> {
    try {
      const { stdout } = await execFileAsync(ffprobeInstaller.path, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ]);
      const duration = parseFloat(stdout.trim());
      return isNaN(duration) ? 0 : Math.round(duration * 100) / 100;
    } catch {
      return 0;
    }
  }

  /**
   * Mixes Azure-generated speech narration + ElevenLabs music / verified ambience + optional Solfeggio frequency harmonic.
   * Enforces intelligible voice, controlled headroom, fade-in/fade-out, and accurate target duration.
   */
  async mixSessionAudio(options: MixSessionAudioOptions): Promise<MixResult> {
    const {
      sessionId,
      voiceAudioPath,
      musicAudioPath,
      ambienceTrackId,
      frequencyHz,
      durationMinutes,
      intensity,
      outputDirectory
    } = options;

    if (!fs.existsSync(voiceAudioPath)) {
      throw new AudioMixerError(
        'AUDIO_VALIDATION_FAILED',
        `Voice audio file not found at: ${voiceAudioPath}`
      );
    }

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const targetDurationSeconds = Math.max(30, Math.round(durationMinutes * 60));
    const outputFileName = `session_${sessionId}.mp3`;
    const outputPath = path.join(outputDirectory, outputFileName);

    // Resolve music audio source
    let resolvedMusicPath = musicAudioPath;
    let isSyntheticNoise = false;
    let syntheticNoiseType = 'brown';

    if (!resolvedMusicPath || !fs.existsSync(resolvedMusicPath)) {
      const ambience = resolveAmbienceTrack(ambienceTrackId);
      if (ambience.filePath && fs.existsSync(ambience.filePath)) {
        resolvedMusicPath = ambience.filePath;
      } else {
        isSyntheticNoise = true;
        syntheticNoiseType = ambience.noiseType || 'brown';
      }
    }

    // Configurable gains for intelligibility and headroom
    let voiceVol = 0.28;
    let musicVol = 0.78;
    if (intensity === 'balanced') {
      voiceVol = 0.45;
      musicVol = 0.62;
    } else if (intensity === 'prominent') {
      voiceVol = 0.68;
      musicVol = 0.50;
    }

    const freqVol = 0.035; // subtle background harmonic (non-intrusive)
    const args: string[] = ['-y'];

    // Input 0: Spoken voice narration (looped if needed with seamless transition)
    args.push('-stream_loop', '-1', '-i', voiceAudioPath);

    // Input 1: Instrumental music / ambience (looped seamlessly)
    if (!isSyntheticNoise && resolvedMusicPath) {
      args.push('-stream_loop', '-1', '-i', resolvedMusicPath);
    } else {
      args.push('-f', 'lavfi', '-i', `anoisesrc=c=${syntheticNoiseType}:r=44100:d=${targetDurationSeconds}`);
    }

    // Input 2: Optional Frequency Harmonic (only if frequencyHz is specified and > 0)
    const hasFrequency = Boolean(frequencyHz && frequencyHz > 0);
    if (hasFrequency) {
      args.push('-f', 'lavfi', '-i', `aevalsrc=sin(${frequencyHz}*2*PI*t):s=44100:d=${targetDurationSeconds}`);
    }

    // Build FFmpeg filter complex
    const filterParts: string[] = [];
    filterParts.push(`[0:a]volume=${voiceVol}[v]`);
    filterParts.push(`[1:a]volume=${musicVol}[m]`);

    let mixInputs = 2;
    let mixTag = '[v][m]';

    if (hasFrequency) {
      filterParts.push(`[2:a]volume=${freqVol}[f]`);
      mixInputs = 3;
      mixTag = '[v][m][f]';
    }

    const fadeInSec = 3;
    const fadeOutSec = 5;
    const fadeOutStart = Math.max(0, targetDurationSeconds - fadeOutSec);

    // amix + limiter (to avoid any digital clipping) + smooth fades
    filterParts.push(
      `${mixTag}amix=inputs=${mixInputs}:duration=first:dropout_transition=3,alimiter=limit=0.95:attack=5:release=50,afade=t=in:ss=0:d=${fadeInSec},afade=t=out:st=${fadeOutStart}:d=${fadeOutSec}[out]`
    );

    args.push(
      '-filter_complex', filterParts.join(';'),
      '-map', '[out]',
      '-t', `${targetDurationSeconds}`,
      '-c:a', 'libmp3lame',
      '-b:a', '256k',
      outputPath
    );

    console.log(`[AudioMixer] Assembling ${targetDurationSeconds}s session for ${sessionId}...`);
    try {
      await execFileAsync('ffmpeg', args);
    } catch (ffmpegErr: any) {
      throw new AudioMixerError(
        'AUDIO_MIXING_FAILED',
        `FFmpeg audio mixing process failed: ${ffmpegErr.message}`
      );
    }

    if (!fs.existsSync(outputPath)) {
      throw new AudioMixerError(
        'AUDIO_VALIDATION_FAILED',
        `Mixed output file was not created at ${outputPath}`
      );
    }

    const stats = fs.statSync(outputPath);
    if (stats.size < 1024) {
      throw new AudioMixerError(
        'AUDIO_VALIDATION_FAILED',
        `Mixed output audio file is empty or corrupted (${stats.size} bytes).`
      );
    }

    const actualDuration = await this.getAudioDuration(outputPath);
    const fileBuffer = fs.readFileSync(outputPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    console.log(`[AudioMixer] ✓ Mixed MP3 verified: ${stats.size} bytes, ${actualDuration}s duration`);

    return {
      outputPath,
      relativeUrl: `/media/sessions/${outputFileName}`,
      durationSeconds: actualDuration || targetDurationSeconds,
      fileSizeBytes: stats.size,
      sha256
    };
  }
}

export const audioMixerService = new AudioMixerService();
