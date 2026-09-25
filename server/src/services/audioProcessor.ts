import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
// @ts-ignore
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { SubliminalRepository, SubliminalModel } from '../models/Subliminal.js';
import { isDbConnected } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Media storage path: server/media/subliminals
const MEDIA_DIR = path.resolve(__dirname, '../../media/subliminals');
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const WORKER_SCRIPT = path.resolve(__dirname, '../workers/audio_processor.py');
const FFMPEG_BIN = ffmpegInstaller.path;
const FFPROBE_BIN = ffprobeInstaller.path;

export interface AudioProcessResult {
  success: boolean;
  videoId: string;
  filename?: string;
  filePath?: string;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  audioFileHash?: string;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  reusedExisting?: boolean;
  error?: string;
  errorCode?: string;
}

export class AudioProcessorService {
  private processingQueue: Map<string, Promise<AudioProcessResult>> = new Map();

  public getMediaDir(): string {
    return MEDIA_DIR;
  }

  public getMediaFilePath(filename: string): string {
    return path.join(MEDIA_DIR, filename);
  }

  public hasMediaFile(filename: string): boolean {
    const fullPath = this.getMediaFilePath(filename);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).size > 1024;
  }

  /**
   * Process a single video's audio using the Python + FFmpeg worker.
   */
  public async processVideo(videoId: string, expectedDuration?: number): Promise<AudioProcessResult> {
    if (!videoId) {
      return { success: false, videoId, error: 'Missing videoId', errorCode: 'INVALID_VIDEO_ID' };
    }

    // Deduplicate in-flight jobs for the same videoId
    if (this.processingQueue.has(videoId)) {
      return this.processingQueue.get(videoId)!;
    }

    const jobPromise = new Promise<AudioProcessResult>((resolve) => {
      const pythonBin = process.env.PYTHON_PATH || 'python';
      const args = [
        WORKER_SCRIPT,
        '--video-id', videoId,
        '--output-dir', MEDIA_DIR,
        '--ffmpeg-bin', FFMPEG_BIN,
        '--ffprobe-bin', FFPROBE_BIN,
      ];

      if (expectedDuration && expectedDuration > 0) {
        args.push('--expected-duration', String(expectedDuration));
      }

      console.log(`[AudioProcessor] Spawning worker for video ${videoId}...`);
      const child = spawn(pythonBin, args);

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      child.on('close', (code) => {
        this.processingQueue.delete(videoId);

        try {
          // Parse stdout as JSON (worker prints json on the last line)
          const lines = stdoutData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine) as AudioProcessResult;

          if (code === 0 && parsed.success) {
            console.log(`[AudioProcessor] Successfully processed ${videoId}: ${parsed.audioUrl} (duration: ${parsed.duration}s, hash: ${parsed.audioFileHash?.substring(0, 12)}...)`);
            resolve(parsed);
          } else {
            console.error(`[AudioProcessor] Failed processing ${videoId}: ${parsed.error || stderrData}`);
            resolve({
              success: false,
              videoId,
              error: parsed.error || stderrData || `Worker exited with code ${code}`,
              errorCode: parsed.errorCode || 'WORKER_ERROR',
            });
          }
        } catch (e: any) {
          console.error(`[AudioProcessor] Failed to parse worker output for ${videoId}:`, stdoutData, stderrData);
          resolve({
            success: false,
            videoId,
            error: stderrData || e.message || 'Worker execution failed',
            errorCode: 'WORKER_PARSE_FAILED',
          });
        }
      });

      child.on('error', (err) => {
        this.processingQueue.delete(videoId);
        console.error(`[AudioProcessor] Failed to spawn worker process:`, err);
        resolve({
          success: false,
          videoId,
          error: err.message,
          errorCode: 'SPAWN_ERROR',
        });
      });
    });

    this.processingQueue.set(videoId, jobPromise);
    return jobPromise;
  }

  /**
   * Process and update a Subliminal record in database.
   */
  public async processSubliminal(subliminalId: string): Promise<AudioProcessResult> {
    const session: any = await SubliminalRepository.findById(subliminalId);
    if (!session) {
      return { success: false, videoId: '', error: 'Subliminal session not found' };
    }

    const videoId = session.source?.videoId;
    if (!videoId) {
      return { success: false, videoId: '', error: 'Session has no source YouTube video ID' };
    }

    // Set status to processing
    await this.updateRecordStatus(subliminalId, { processingStatus: 'processing' });

    const result = await this.processVideo(videoId, session.duration);

    if (result.success && result.audioUrl) {
      await this.updateRecordStatus(subliminalId, {
        audioUrl: result.audioUrl,
        duration: result.duration || session.duration,
        audioFileHash: result.audioFileHash,
        processingStatus: 'COMPLETED',
        processingError: undefined,
      });
    } else {
      await this.updateRecordStatus(subliminalId, {
        processingStatus: 'FAILED',
        processingError: result.error || 'Audio processing failed',
      });
    }

    return result;
  }

  private async updateRecordStatus(id: string, updates: any) {
    if (isDbConnected()) {
      await SubliminalModel.findByIdAndUpdate(id, { $set: updates });
    }
    // Also update in-memory
    const memItem = await SubliminalRepository.findById(id);
    if (memItem) {
      Object.assign(memItem, updates);
    }
  }
}

export const audioProcessorService = new AudioProcessorService();
