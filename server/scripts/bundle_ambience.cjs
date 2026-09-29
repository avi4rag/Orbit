const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..', '..', 'public', 'media', 'ambience', 'rain');
fs.mkdirSync(targetDir, { recursive: true });

const files = [
  { in: 'light-rain-ambient.mp3', out: 'light-rain-ambient.mp3' },
  { in: 'rain-on-the-window.mp3', out: 'rain-on-the-window.mp3' },
  { in: 'lluvia-rain.mp3', out: 'lluvia-rain.mp3' }
];

for (const f of files) {
  const inPath = path.resolve(__dirname, '..', 'media', 'ambience', 'rain', f.in);
  const outPath = path.join(targetDir, f.out);
  console.log('Processing', f.in, '->', outPath);
  execSync(`"${ffmpeg}" -y -ss 0 -t 35 -i "${inPath}" -af "afade=t=in:ss=0:d=1,afade=t=out:st=33:d=2" -b:a 128k "${outPath}"`);
  const stat = fs.statSync(outPath);
  console.log('Created', f.out, stat.size, 'bytes');
}
