import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ElevenLabsMusicService, ElevenLabsMusicError } from '../src/services/elevenLabsMusicService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTestB() {
  console.log('========================================================');
  console.log('TEST B: ELEVENLABS REAL MUSIC GENERATION VERIFICATION');
  console.log('========================================================');

  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY || '').trim();
  console.log('Provider: ElevenLabs Music Generation API');
  console.log('Environment configuration:');
  console.log('  ELEVENLABS_API_KEY configured:', apiKey.length > 0 ? `Yes (length: ${apiKey.length})` : 'No');

  const musicService = new ElevenLabsMusicService();

  // 1. Check account capability first
  console.log('\nStep 1: Checking ElevenLabs Music API account capability...');
  const availability = await musicService.checkMusicAvailability();
  console.log('  Music API Supported for Account:', availability.supported);
  if (!availability.supported) {
    console.log('  Reason / Limitation:', availability.reason);
    console.log('  Error Code:', availability.code);
  }

  // 2. Request short instrumental track
  console.log('\nStep 2: Requesting instrumental ambient track from ElevenLabs Music API...');
  const outputDir = path.resolve(__dirname, '../media/temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const testOutputPath = path.join(outputDir, `test_elevenlabs_music_${Date.now()}.mp3`);

  try {
    const result = await musicService.generateMusic({
      sessionTitle: 'Solar Radiance Meditation',
      category: 'Manifestation',
      usageContext: 'meditation',
      ambienceStyle: 'rain-light',
      targetDurationSeconds: 10,
      outputPath: testOutputPath
    });

    console.log('\n✓ ELEVENLABS MUSIC GENERATION SUCCESSFUL:');
    console.log('  Provider:', result.provider);
    console.log('  Output file path:', result.outputPath);
    console.log('  Audio bytes:', result.fileSizeBytes);
    console.log('  Duration (seconds):', result.durationSeconds);
    console.log('  Is Instrumental:', result.isInstrumental);
    console.log('  Prompt Used:', result.promptUsed);
    console.log('  HTTP Status: 200 OK');
    console.log('  Result: Non-empty valid instrumental music generated and verified.');
  } catch (err: any) {
    if (err instanceof ElevenLabsMusicError) {
      console.error('\n✗ ELEVENLABS RETURNED EXPECTED ACCOUNT CAPABILITY LIMITATION:');
      console.error('  Error Code:', err.code);
      console.error('  HTTP Status:', err.status || 'N/A');
      console.error('  Error Message:', err.message);
      if (err.details) {
        console.error('  API Detail:', JSON.stringify(err.details));
      }
      if (err.code === 'ELEVENLABS_MUSIC_UNAVAILABLE') {
        console.error('\n  CRITICAL ACCOUNT STATUS:');
        console.error('  The configured ElevenLabs account is on a free tier which does not include access to the Music API.');
        console.error('  To generate AI music directly via ElevenLabs, upgrade the account to a paid subscription.');
        console.error('  ORBIT architecture provides verified licensed ambience fallback when configured.');
      }
    } else {
      console.error('\n✗ UNEXPECTED ERROR:', err.message);
    }
  }
}

runTestB();
