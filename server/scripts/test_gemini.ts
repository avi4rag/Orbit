import { GeminiScriptService } from '../src/services/geminiScriptService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Testing GeminiScriptService with GEMINI_API_KEY...');
  const g = new GeminiScriptService();
  try {
    const res = await g.generateAffirmationScript({
      concept: { title: 'Focused Creator' },
      answers: {
        desiredOutcome: 'High focus and productivity',
        desiredIdentity: 'Disciplined creator',
        emotionalState: 'Calm and steady',
        currentBlock: 'Distraction',
        dailyAction: 'Create for 2 hours daily'
      }
    });
    console.log('SUCCESS! Gemini generated structured script:');
    console.log('Title:', res.title);
    console.log('Tone:', res.tone);
    console.log('Affirmations count:', res.affirmations.length);
    console.log('Identity statements:', res.identityStatements);
    console.log('Visualization prompts:', res.visualizationPrompts);
    console.log('Action anchors:', res.actionAnchors);
    console.log('Closing statements:', res.closingStatements);
    console.log('Raw text preview:', res.rawText.slice(0, 120) + '...');
  } catch (err: any) {
    console.error('Gemini error:', err.message);
  }
}

main();
