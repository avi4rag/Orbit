const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ffprobePath = require('c:/Users/HP/OneDrive/Desktop/orbit/server/node_modules/@ffprobe-installer/ffprobe').path;
const mediaDir = 'c:/Users/HP/OneDrive/Desktop/orbit/server/media/subliminals';

const serverSeedPath = 'c:/Users/HP/OneDrive/Desktop/orbit/server/src/data/seedSubliminals.ts';
const clientSeedPath = 'c:/Users/HP/OneDrive/Desktop/orbit/src/data/seedSubliminals.ts';

// Get all existing media files and their probe info
const mediaFiles = fs.readdirSync(mediaDir).filter(f => f.endsWith('.mp3'));
const mediaMap = {};

for (const file of mediaFiles) {
  const videoId = file.replace('.mp3', '');
  const filePath = path.join(mediaDir, file);
  const fileBuf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuf).digest('hex');

  let duration = 0;
  try {
    const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration -of json "${filePath}"`;
    const out = JSON.parse(execSync(probeCmd, { encoding: 'utf8' }));
    duration = Math.round(parseFloat(out.format.duration || 0));
  } catch (e) {
    console.error('Probe error for', file, e.message);
  }

  mediaMap[videoId] = {
    audioUrl: `/api/subliminals/media/${file}`,
    duration: duration > 0 ? duration : undefined,
    audioFileHash: hash,
    processingStatus: 'COMPLETED'
  };
}

console.log('Available processed media:', mediaMap);

function processSeedFile(filePath, isClient = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Extract JSON array
  const match = content.match(/export const SEED_SUBLIMINALS:\s*[\w\[\]<>]+\s*=\s*(\[[\s\S]*\]);/);
  if (!match) {
    console.error('Could not match SEED_SUBLIMINALS in', filePath);
    return;
  }

  const items = JSON.parse(match[1]);
  let updatedCount = 0;
  let clearedCount = 0;

  for (const item of items) {
    const vId = item.source?.videoId;
    if (vId && mediaMap[vId]) {
      item.audioUrl = mediaMap[vId].audioUrl;
      if (mediaMap[vId].duration) item.duration = mediaMap[vId].duration;
      item.audioFileHash = mediaMap[vId].audioFileHash;
      item.processingStatus = 'COMPLETED';
      updatedCount++;
    } else {
      if (item.audioUrl && item.audioUrl.includes('ambient_stream.ogg')) {
        clearedCount++;
      }
      item.audioUrl = '';
      item.audioFileHash = undefined;
      item.processingStatus = 'processing';
    }
  }

  const prefix = isClient ? "import type { SubliminalSession } from '../types/subliminal';\n\nexport const SEED_SUBLIMINALS: SubliminalSession[] =" : "export const SEED_SUBLIMINALS: any[] =";
  const newContent = `${prefix} ${JSON.stringify(items, null, 2)};\n`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated ${filePath}: ${updatedCount} completed media linked, ${clearedCount} fake audioUrls cleared, total ${items.length} records.`);
}

processSeedFile(serverSeedPath, false);
processSeedFile(clientSeedPath, true);
