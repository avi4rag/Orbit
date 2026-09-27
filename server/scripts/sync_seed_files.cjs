const fs = require('fs');
const path = require('path');

const serverSeedFile = path.resolve(__dirname, '../src/data/seedSubliminals.ts');
const clientSeedFile = path.resolve(__dirname, '../../src/data/seedSubliminals.ts');
const mediaDir = path.resolve(__dirname, '../media/subliminals');

let raw = fs.readFileSync(serverSeedFile, 'utf8');
const jsonMatch = raw.match(/export const SEED_SUBLIMINALS: any\[\] = (\[[\s\S]+?\]);\s*$/);
if (!jsonMatch) {
  console.error('Could not find SEED_SUBLIMINALS in server file');
  process.exit(1);
}
const items = JSON.parse(jsonMatch[1]);

const mediaFiles = new Set(fs.readdirSync(mediaDir).filter(f => f.endsWith('.mp3')));

const byVideoId = new Map();
for (const item of items) {
  const vid = item.source?.videoId;
  if (!vid) continue;
  
  const mp3Name = vid + '.mp3';
  if (mediaFiles.has(mp3Name)) {
    item.audioUrl = '/api/subliminals/media/' + mp3Name;
    item.audioStorageKey = 'subliminals/' + mp3Name;
    item.processingStatus = 'COMPLETED';
    delete item.processingError;
  } else {
    item.audioUrl = '';
    item.audioStorageKey = 'subliminals/' + mp3Name;
    item.processingStatus = 'PENDING';
    delete item.processingError;
  }

  if (byVideoId.has(vid)) {
    const existing = byVideoId.get(vid);
    if (existing.processingStatus !== 'COMPLETED' && item.processingStatus === 'COMPLETED') {
      byVideoId.set(vid, item);
    }
  } else {
    byVideoId.set(vid, item);
  }
}

const deduplicated = Array.from(byVideoId.values());
deduplicated.sort((a, b) => {
  if (a.processingStatus === 'COMPLETED' && b.processingStatus !== 'COMPLETED') return -1;
  if (a.processingStatus !== 'COMPLETED' && b.processingStatus === 'COMPLETED') return 1;
  return (b.playCount || 0) - (a.playCount || 0);
});

// Update server file
const serverContent = 'export const SEED_SUBLIMINALS: any[] = ' + JSON.stringify(deduplicated, null, 2) + ';\n';
fs.writeFileSync(serverSeedFile, serverContent, 'utf8');

// Update client file
const clientContent = "import type { SubliminalSession } from '../types/subliminal';\n\nexport const SEED_SUBLIMINALS: SubliminalSession[] = " + JSON.stringify(deduplicated, null, 2) + ';\n';
fs.writeFileSync(clientSeedFile, clientContent, 'utf8');

console.log('Successfully wrote deduplicated seed files with', deduplicated.length, 'tracks.');
