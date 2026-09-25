import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
// @ts-ignore
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { SubliminalRepository, SubliminalModel } from '../models/Subliminal.js';
import { storageService } from './storage.js';
import { isDbConnected } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_SCRIPT = path.resolve(__dirname, '../workers/audio_processor.py');
const FFMPEG_BIN = ffmpegInstaller.path;
const FFPROBE_BIN = ffprobeInstaller.path;

export interface AudioProcessResult {
  success: boolean;
  videoId: string;
  title?: string;
  sourceUrl?: string;
  filename?: string;
  filePath?: string;
  audioStorageKey?: string;
  audioUrl?: string;
  duration?: number;
  sourceDuration?: number;
  fileSize?: number;
  audioFileHash?: string;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  processingStatus?: 'COMPLETED' | 'FAILED';
  reusedExisting?: boolean;
  error?: string;
  errorCode?: string;
}

export class AudioProcessorService {
  private processingQueue: Map<string, Promise<AudioProcessResult>> = new Map();
  private isBatchRunning: boolean = false;
  private batchStats = {
    totalQueued: 0,
    completed: 0,
    failed: 0,
    currentVideoId: '',
  };

  public getMediaDir(): string {
    return storageService.getStorageDir();
  }

  public getMediaFilePath(filename: string): string {
    return path.join(this.getMediaDir(), filename);
  }

  public hasMediaFile(filename: string): boolean {
    return storageService.hasFile(`subliminals/${filename}`);
  }

  /**
   * Process a single video's audio using the Python + FFmpeg worker.
   */
  public async processVideo(
    videoId: string,
    title: string = '',
    expectedDuration?: number
  ): Promise<AudioProcessResult> {
    if (!videoId) {
      return { success: false, videoId, error: 'Missing videoId', errorCode: 'INVALID_VIDEO_ID' };
    }

    // Deduplicate in-flight jobs for the same videoId
    if (this.processingQueue.has(videoId)) {
      return this.processingQueue.get(videoId)!;
    }

    const jobPromise = new Promise<AudioProcessResult>((resolve) => {
      const pythonBin = process.env.PYTHON_PATH || 'python';
      const outDir = storageService.getStorageDir();
      const storageKey = storageService.getStorageKey(videoId);
      const audioUrl = storageService.getAudioUrl(storageKey);

      const args = [
        WORKER_SCRIPT,
        '--video-id', videoId,
        '--output-dir', outDir,
        '--ffmpeg-bin', FFMPEG_BIN,
        '--ffprobe-bin', FFPROBE_BIN,
        '--title', title,
      ];

      if (expectedDuration && expectedDuration > 0) {
        args.push('--expected-duration', String(expectedDuration));
      }

      console.log(`[AudioProcessor] Starting extraction for video ${videoId} ("${title}")...`);
      const child = spawn(pythonBin, args);

      let stdoutData = '';
      let stderrData = '';

      // Timeout watchdog: 10 minutes maximum per video
      const timeout = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {}
      }, 600000);

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        stderrData += text;
        // Echo worker stage logs to backend console
        process.stderr.write(text);
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        this.processingQueue.delete(videoId);

        try {
          const lines = stdoutData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine) as AudioProcessResult;

          if (code === 0 && parsed.success) {
            // Apply storage service resolved URL
            parsed.audioUrl = audioUrl;
            parsed.audioStorageKey = storageKey;
            console.log(
              `[AudioProcessor] Completed ${videoId}: ${parsed.audioUrl} (duration: ${parsed.duration}s, hash: ${parsed.audioFileHash?.substring(0, 12)}...)`
            );
            resolve(parsed);
          } else {
            const errReason = parsed.error || stderrData || `Worker exited with code ${code}`;
            console.error(`[AudioProcessor] Failed processing ${videoId}: ${errReason}`);
            resolve({
              success: false,
              videoId,
              title,
              audioStorageKey: storageKey,
              error: errReason,
              errorCode: parsed.errorCode || 'WORKER_ERROR',
              processingStatus: 'FAILED',
            });
          }
        } catch (e: any) {
          console.error(`[AudioProcessor] Failed to parse worker output for ${videoId}:`, stdoutData, stderrData);
          resolve({
            success: false,
            videoId,
            title,
            audioStorageKey: storageKey,
            error: stderrData || e.message || 'Worker execution failed',
            errorCode: 'WORKER_PARSE_FAILED',
            processingStatus: 'FAILED',
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        this.processingQueue.delete(videoId);
        console.error(`[AudioProcessor] Failed to spawn worker process for ${videoId}:`, err);
        resolve({
          success: false,
          videoId,
          title,
          audioStorageKey: storageKey,
          error: err.message,
          errorCode: 'SPAWN_ERROR',
          processingStatus: 'FAILED',
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
      await this.updateRecordStatus(subliminalId, {
        processingStatus: 'FAILED',
        processingError: 'Session has no source YouTube video ID',
        processingCompletedAt: new Date(),
      });
      return { success: false, videoId: '', error: 'Session has no source YouTube video ID' };
    }

    // Set status to PROCESSING with start timestamp
    await this.updateRecordStatus(subliminalId, {
      processingStatus: 'PROCESSING',
      processingStartedAt: new Date(),
      processingError: undefined,
    });

    const result = await this.processVideo(videoId, session.title, session.duration);

    if (result.success && result.audioUrl) {
      await this.updateRecordStatus(subliminalId, {
        audioUrl: result.audioUrl,
        audioStorageKey: result.audioStorageKey || storageService.getStorageKey(videoId),
        duration: result.duration || session.duration,
        sourceDuration: result.sourceDuration || session.duration,
        audioFileHash: result.audioFileHash,
        processingStatus: 'COMPLETED',
        processingCompletedAt: new Date(),
        processingError: undefined,
      });
    } else {
      await this.updateRecordStatus(subliminalId, {
        processingStatus: 'FAILED',
        processingCompletedAt: new Date(),
        processingError: result.error || 'Audio processing failed',
        audioUrl: '',
      });
    }

    return result;
  }

  /**
   * Reprocess all pending or broken records in background queue.
   */
  public async startBackgroundQueue(limit: number = 20): Promise<void> {
    if (this.isBatchRunning) {
      return;
    }

    this.isBatchRunning = true;
    (async () => {
      try {
        const eligible = await SubliminalRepository.findEligibleForProcessing(limit);
        this.batchStats.totalQueued = eligible.length;
        this.batchStats.completed = 0;
        this.batchStats.failed = 0;

        console.log(`[AudioProcessor] Starting background batch for ${eligible.length} eligible subliminals...`);

        for (const item of eligible) {
          const id = item.id || item._id?.toString();
          this.batchStats.currentVideoId = item.source?.videoId || id;

          try {
            const res = await this.processSubliminal(id);
            if (res.success) {
              this.batchStats.completed++;
            } else {
              this.batchStats.failed++;
            }
          } catch (itemErr: any) {
            this.batchStats.failed++;
            console.error(`[AudioProcessor] Exception processing session ${id}:`, itemErr);
            await this.updateRecordStatus(id, {
              processingStatus: 'FAILED',
              processingCompletedAt: new Date(),
              processingError: itemErr.message || 'Unexpected processing exception',
            });
          }
          // Slight delay between downloads to prevent YouTube 429
          await new Promise((r) => setTimeout(r, 2000));
        }

        console.log(`[AudioProcessor] Background batch finished. Completed: ${this.batchStats.completed}, Failed: ${this.batchStats.failed}`);
      } catch (err) {
        console.error('[AudioProcessor] Background batch error:', err);
      } finally {
        this.isBatchRunning = false;
        this.batchStats.currentVideoId = '';
      }
    })();
  }

  public getBatchStats() {
    return {
      isRunning: this.isBatchRunning,
      ...this.batchStats,
    };
  }

  private async updateRecordStatus(id: string, updates: any) {
    await SubliminalRepository.updateById(id, updates);
  }
}

export const audioProcessorService = new AudioProcessorService();
