require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log('Testing gemini-3.8-flash...');
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Generate 3 words of peace'
    });
    console.log('gemini-3.8-flash success:', res.text);
    return;
  } catch (e) {
    console.log('gemini-3.8-flash error:', e.message);
  }

  console.log('Listing available models:');
  const pager = await ai.models.list();
  for await (const m of pager) {
    console.log('Available model:', m.name);
  }
}

main().catch(console.error);
