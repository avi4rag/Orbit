const { execSync } = require('child_process');

const url = 'https://www.youtube.com/playlist?list=PLag5P_z1arBQpBpqXOMGIolROofiuGUY_';
const out = execSync(`python -m yt_dlp --flat-playlist --dump-json "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const lines = out.trim().split('\n').filter(Boolean);
const sample = lines.slice(0, 15).map(l => JSON.parse(l));
sample.forEach((v, i) => {
  console.log(`[${i+1}] ID: ${v.id} | Title: ${v.title}`);
});
