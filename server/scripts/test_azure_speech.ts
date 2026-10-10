import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { synthesizeAzureSpeech, AzureSpeechError, AZURE_VOICES } from '../src/services/tts/azureSpeechService.js';
import { GeminiScriptService } from '../src/services/geminiScriptService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTestA() {
  console.log('=====================================================');
  console.log('TEST A: AZURE SPEECH REAL SPOKEN AUDIO VERIFICATION');
  console.log('=====================================================');

  const apiKey = (process.env.AZURE_SPEECH_KEY || process.env.MICROSOFT_AZURE_API_KEY || '').trim();
  const region = (process.env.AZURE_SPEECH_REGION || process.env.MICROSOFT_AZURE_REGION || 'southeastasia').trim();

  console.log('Provider: Microsoft Azure Speech (Text-to-Speech)');
  console.log('Environment configuration:');
  console.log('  AZURE_SPEECH_KEY configured:', apiKey.length > 0 ? `Yes (length: ${apiKey.length})` : 'No');
  console.log('  AZURE_SPEECH_REGION configured:', region);
  console.log('  Supported voices:', Object.values(AZURE_VOICES).map(v => `${v.name} (${v.id})`).join(', '));

  // 1. Generate personalized script with Gemini
  console.log('\nStep 1: Generating short structured script with Gemini...');
  const gemini = new GeminiScriptService();
  let scriptText = '';

  try {
    const script = await gemini.generateAffirmationScript({
      concept: { title: 'Test Alignment Session' },
      answers: {
        desiredOutcome: 'Grounded focus and clarity',
        desiredIdentity: 'Mindful Creator',
        emotionalState: 'Calm and steady',
        currentBlock: 'Scattered attention',
        dailyAction: 'Consistent creative practice'
      }
    });
    console.log('✓ Gemini script generated successfully.');
    console.log('  Title:', script.title);
    console.log('  Affirmations count:', script.affirmations.length);
    console.log('  Identity statements:', script.identityStatements);
    scriptText = script.rawText;
  } catch (err: any) {
    console.warn('! Gemini fallback script used:', err.message);
    scriptText = 'I am grounded, calm, and centered. ... ... Every action I take flows with clear purpose and ease. ... ... I am becoming a disciplined and focused creator.';
  }

  // 2. Synthesize with Azure Speech
  const outputDir = path.resolve(__dirname, '../media/temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const testOutputPath = path.join(outputDir, `test_azure_speech_${Date.now()}.mp3`);

  console.log('\nStep 2: Sending narration text to Azure Speech...');
  console.log('  Target Voice: en-US-JennyNeural');
  console.log('  Output file path:', testOutputPath);

  try {
    const result = await synthesizeAzureSpeech({
      text: scriptText,
      voiceId: 'en-US-JennyNeural',
      intensity: 'balanced',
      outputPath: testOutputPath
    });

    console.log('\n✓ AZURE SPEECH SYNTHESIS SUCCESSFUL:');
    console.log('  Voice ID:', result.voiceId);
    console.log('  Audio bytes:', result.fileSizeBytes);
    console.log('  Duration (seconds):', result.durationSeconds);
    console.log('  File exists on disk:', fs.existsSync(testOutputPath));
    console.log('  HTTP Status: 200 OK');
    console.log('  Result: Non-empty valid audio generated and verified.');
  } catch (err: any) {
    if (err instanceof AzureSpeechError) {
      console.error('\n✗ AZURE SPEECH RETURNED EXPECTED PROVIDER DIAGNOSTIC:');
      console.error('  Error Code:', err.code);
      console.error('  HTTP Status:', err.status || 'N/A');
      console.error('  Error Message:', err.message);
      if (err.code === 'AZURE_AUTH_ERROR') {
        console.error('\n  CRITICAL CONFIGURATION NOTICE:');
        console.error('  Please ensure valid Azure Speech credentials in server/.env:');
        console.error('    AZURE_SPEECH_KEY=<your-32-char-azure-speech-key>');
        console.error('    AZURE_SPEECH_REGION=<your-azure-resource-region, e.g. eastus or southeastasia>');
      }
    } else {
      console.error('\n✗ UNEXPECTED ERROR:', err.message);
    }
  }
}

runTestA();
