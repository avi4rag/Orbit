const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffprobePath = require('../node_modules/@ffprobe-installer/ffprobe').path;

const targetFile = process.argv[2] || 'rikuTng0N7g.mp3';
const file = path.resolve(__dirname, '../media/subliminals', targetFile);
const stats = fs.statSync(file);
const probeRaw = execSync(`"${ffprobePath}" -v error -show_entries format=duration,size,bit_rate:stream=codec_name,sample_rate,channels -of json "${file}"`, { encoding: 'utf8' });
const probe = JSON.parse(probeRaw);
const stream = probe.streams[0];
const videoId = path.basename(targetFile, '.mp3');

console.log('[ORBIT AUDIO TEST]\n');
console.log('videoId:', videoId);
console.log('source: https://www.youtube.com/watch?v=' + videoId);
console.log('downloadedFile:', file);
console.log('fileSize:', stats.size, 'bytes');
console.log('duration:', Math.round(parseFloat(probe.format.duration)), 'seconds');
console.log('codec:', stream.codec_name);
console.log('sampleRate:', stream.sample_rate);
console.log('bitrate:', probe.format.bit_rate);
