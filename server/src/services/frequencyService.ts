import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export interface FrequencyGenerateOptions {
  frequencyHz: number;
  durationSeconds: number;
  volume?: number; // 0.01 to 0.15 for subtle background presence
  outputPath: string;
}

export async function generateSineFrequency(options: FrequencyGenerateOptions): Promise<string> {
  const { frequencyHz, durationSeconds, volume = 0.05, outputPath } = options;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Pure mathematical sine wave via FFmpeg lavfi aevalsrc
  const expr = `sin(${frequencyHz}*2*PI*t)`;
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `aevalsrc=${expr}:s=44100:d=${durationSeconds}`,
    '-af', `volume=${volume},afade=t=in:ss=0:d=2,afade=t=out:st=${Math.max(0, durationSeconds - 2)}:d=2`,
    '-c:a', 'pcm_s16le',
    outputPath
  ];

  await execFileAsync('ffmpeg', args);
  return outputPath;
}
