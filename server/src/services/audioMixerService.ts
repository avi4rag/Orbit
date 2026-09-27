import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { resolveAmbienceTrack, AmbienceTrack } from '../config/ambienceCatalog.js';

const execFileAsync = promisify(execFile);

export interface MixSessionAudioOptions {
  sessionId: string;
  voiceAudioPath: string;
  ambienceTrackId: string;
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
  async mixSessionAudio(options: MixSessionAudioOptions): Promise<MixResult> {
    const {
      sessionId,
      voiceAudioPath,
      ambienceTrackId,
      frequencyHz,
      durationMinutes,
      intensity,
      outputDirectory
    } = options;

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const targetDurationSeconds = Math.max(30, Math.round(durationMinutes * 60));
    const outputFileName = `session_${sessionId}.mp3`;
    const outputPath = path.join(outputDirectory, outputFileName);

    const ambience = resolveAmbienceTrack(ambienceTrackId);

    // Intensity weighting
    let voiceVol = 0.22;
    let ambVol = 0.82;
    if (intensity === 'balanced') {
      voiceVol = 0.40;
      ambVol = 0.72;
    } else if (intensity === 'prominent') {
      voiceVol = 0.65;
      ambVol = 0.58;
    }

    const freqVol = 0.04; // subtle harmonic background
    const args: string[] = ['-y'];

    // Input 0: Voice audio looped
    args.push('-stream_loop', '-1', '-i', voiceAudioPath);

    // Input 1: Ambience
    let hasAmbienceFile = false;
    if (ambience.filePath && fs.existsSync(ambience.filePath)) {
      hasAmbienceFile = true;
      args.push('-stream_loop', '-1', '-i', ambience.filePath);
    } else {
      // Synthesized noise
      const noiseColor = ambience.noiseType || 'brown';
      args.push('-f', 'lavfi', '-i', `anoisesrc=c=${noiseColor}:r=44100:d=${targetDurationSeconds}`);
    }

    // Input 2: Optional Frequency
    const hasFrequency = Boolean(frequencyHz && frequencyHz > 0);
    if (hasFrequency) {
      args.push('-f', 'lavfi', '-i', `aevalsrc=sin(${frequencyHz}*2*PI*t):s=44100:d=${targetDurationSeconds}`);
    }

    // Build filter complex
    const filterParts: string[] = [];
    filterParts.push(`[0:a]volume=${voiceVol}[v]`);
    filterParts.push(`[1:a]volume=${ambVol}[amb]`);

    let mixInputs = 2;
    let mixTag = '[v][amb]';

    if (hasFrequency) {
      filterParts.push(`[2:a]volume=${freqVol}[freq]`);
      mixInputs = 3;
      mixTag = '[v][amb][freq]';
    }

    const fadeInSec = 3;
    const fadeOutSec = 4;
    const fadeOutStart = Math.max(0, targetDurationSeconds - fadeOutSec);

    filterParts.push(
      `${mixTag}amix=inputs=${mixInputs}:duration=longest:dropout_transition=2,afade=t=in:ss=0:d=${fadeInSec},afade=t=out:st=${fadeOutStart}:d=${fadeOutSec}[out]`
    );

    args.push(
      '-filter_complex', filterParts.join(';'),
      '-map', '[out]',
      '-t', `${targetDurationSeconds}`,
      '-c:a', 'libmp3lame',
      '-b:a', '256k',
      outputPath
    );

    console.log(`[AudioMixer] Generating ${targetDurationSeconds}s session for ${sessionId}...`);
    await execFileAsync('ffmpeg', args);

    const stats = fs.statSync(outputPath);
    const fileBuffer = fs.readFileSync(outputPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    return {
      outputPath,
      relativeUrl: `/media/sessions/${outputFileName}`,
      durationSeconds: targetDurationSeconds,
      fileSizeBytes: stats.size,
      sha256
    };
  }
}
