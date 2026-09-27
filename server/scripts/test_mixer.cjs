const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);

async function testMix() {
  const mediaDir = path.resolve(__dirname, '../media');
  const voicePath = path.join(mediaDir, 'test_elevenlabs.mp3');
  const rainPath = path.join(mediaDir, 'ambience/rain/light-rain-ambient.mp3');
  const outPath = path.join(mediaDir, 'test_mixed_output.mp3');

  const durationSeconds = 30; // 30 sec test
  const frequencyHz = 432;

  console.log('Testing mix with voice:', voicePath);
  console.log('Ambience:', rainPath);

  // Stream loop inputs
  const args = [
    '-y',
    '-stream_loop', '-1', '-i', voicePath,
    '-stream_loop', '-1', '-i', rainPath,
    '-f', 'lavfi', '-i', `aevalsrc=sin(${frequencyHz}*2*PI*t):s=44100:d=${durationSeconds}`,
    '-filter_complex',
    `[0:a]volume=0.25[v];[1:a]volume=0.75[amb];[2:a]volume=0.04[freq];[v][amb][freq]amix=inputs=3:duration=longest:dropout_transition=2,afade=t=in:ss=0:d=2,afade=t=out:st=${durationSeconds - 3}:d=3[out]`,
    '-map', '[out]',
    '-t', `${durationSeconds}`,
    '-c:a', 'libmp3lame',
    '-b:a', '256k',
    outPath
  ];

  console.log('Running ffmpeg...');
  await execFileAsync('ffmpeg', args);
  console.log('Success! Output generated at:', outPath);
  const stats = fs.statSync(outPath);
  console.log('Output size:', stats.size, 'bytes');
}

testMix().catch(err => {
  console.error('Mix test failed:', err);
  process.exit(1);
});
