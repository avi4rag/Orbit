import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Media persistent storage path: server/media/subliminals
const MEDIA_DIR = path.resolve(__dirname, '../../media/subliminals');
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

export interface IStorageService {
  getStorageKey(videoId: string): string;
  getAudioUrl(storageKey: string): string;
  getLocalStoragePath(storageKey: string): string;
  hasFile(storageKey: string): boolean;
  getFileSize(storageKey: string): number;
  getFileStream(storageKey: string, start?: number, end?: number): fs.ReadStream;
}

class StorageService implements IStorageService {
  private mediaDir: string = MEDIA_DIR;

  public getStorageDir(): string {
    return this.mediaDir;
  }

  public getStorageKey(videoId: string): string {
    return `subliminals/${videoId}.mp3`;
  }

  public getFilenameFromKey(storageKey: string): string {
    return path.basename(storageKey);
  }

  public getLocalStoragePath(storageKey: string): string {
    const filename = path.basename(storageKey);
    return path.join(this.mediaDir, filename);
  }

  public hasFile(storageKey: string): boolean {
    const localPath = this.getLocalStoragePath(storageKey);
    try {
      return fs.existsSync(localPath) && fs.statSync(localPath).size > 1024;
    } catch {
      return false;
    }
  }

  public getFileSize(storageKey: string): number {
    const localPath = this.getLocalStoragePath(storageKey);
    try {
      return fs.statSync(localPath).size;
    } catch {
      return 0;
    }
  }

  public getFileStream(storageKey: string, start?: number, end?: number): fs.ReadStream {
    const localPath = this.getLocalStoragePath(storageKey);
    if (typeof start === 'number' && typeof end === 'number') {
      return fs.createReadStream(localPath, { start, end });
    }
    return fs.createReadStream(localPath);
  }

  /**
   * Resolves the real audio URL.
   * If an external S3 / Cloudflare R2 / CDN URL prefix is configured via environment variables
   * (e.g. S3_PUBLIC_URL=https://bucket.r2.cloudflarestorage.com or CDN_URL=https://cdn.orbit.audio),
   * it returns the direct CDN/S3 URL for serverless/Vercel production.
   * Otherwise, it returns the backend media streaming URL /api/subliminals/media/<filename>.mp3
   */
  public getAudioUrl(storageKey: string): string {
    const filename = path.basename(storageKey);
    const cdnUrl = process.env.CDN_URL || process.env.S3_PUBLIC_URL || process.env.STORAGE_BUCKET_URL;
    if (cdnUrl) {
      return `${cdnUrl.replace(/\/+$/, '')}/${storageKey}`;
    }
    const apiBase = process.env.API_BASE_URL || '';
    return `${apiBase}/api/subliminals/media/${filename}`;
  }
}

export const storageService = new StorageService();
