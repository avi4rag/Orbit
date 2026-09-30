const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', '..', 'public', 'media', 'ambience');

const directories = [
  path.join(baseDir, 'rain'),
  path.join(baseDir, 'noise'),
  path.join(baseDir, 'space'),
  path.join(baseDir, 'water')
];

directories.forEach(d => fs.mkdirSync(d, { recursive: true }));

const tracks = [
  {
    path: path.join(baseDir, 'noise', 'cosmic-brown-noise.mp3'),
    // Deep warm cosmic brown noise with gentle sub-octave rumble
    cmd: `"${ffmpeg}" -y -f lavfi -i "anoisesrc=c=brown:r=44100:d=45" -f lavfi -i "aevalsrc=0.18*sin(54*2*PI*t):s=44100:d=45" -filter_complex "[0:a]lowpass=f=420,volume=1.8[n];[1:a]volume=0.25[sub];[n][sub]amix=inputs=2:duration=first,afade=t=in:ss=0:d=1.5,afade=t=out:st=42:d=3" -b:a 128k`
  },
  {
    path: path.join(baseDir, 'noise', 'pink-flow.mp3'),
    // Soft, soothing pink noise spectrum mimicking gentle natural airflow
    cmd: `"${ffmpeg}" -y -f lavfi -i "anoisesrc=c=pink:r=44100:d=45" -af "lowpass=f=1200,highpass=f=120,volume=1.2,afade=t=in:ss=0:d=1.5,afade=t=out:st=42:d=3" -b:a 128k`
  },
  {
    path: path.join(baseDir, 'space', 'celestial-drone.mp3'),
    // Harmonic celestial Solfeggio drone tuned around 432 Hz and harmonics
    cmd: `"${ffmpeg}" -y -f lavfi -i "aevalsrc=0.25*sin(108*2*PI*t)+0.22*sin(216*2*PI*t)+0.18*sin(432*2*PI*t)+0.12*sin(648*2*PI*t):s=44100:d=45" -af "lowpass=f=550,volume=1.3,afade=t=in:ss=0:d=2,afade=t=out:st=41:d=4" -b:a 128k`
  },
  {
    path: path.join(baseDir, 'water', 'ocean-waves.mp3'),
    // Ocean surf ebb and flow using modulated pink noise with resonant low swell
    cmd: `"${ffmpeg}" -y -f lavfi -i "anoisesrc=c=pink:r=44100:d=45" -af "tremolo=f=0.11:d=0.75,lowpass=f=750,highpass=f=80,volume=1.5,afade=t=in:ss=0:d=2,afade=t=out:st=41:d=4" -b:a 128k`
  }
];

console.log('Generating ambience soundbed assets...');

for (const t of tracks) {
  console.log(`Synthesizing: ${path.basename(t.path)}...`);
  const fullCmd = `${t.cmd} "${t.path}"`;
  execSync(fullCmd);
  const stat = fs.statSync(t.path);
  console.log(`✓ Created ${path.basename(t.path)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

console.log('All ambience soundbeds synthesized successfully.');
