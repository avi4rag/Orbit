const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testElevenLabs() {
  console.log('--- ELEVENLABS DIAGNOSTIC ---');
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    console.log('ELEVENLABS_API_KEY: NOT SET');
    return;
  }
  console.log('ELEVENLABS_API_KEY: Present (length: ' + apiKey.length + ')');

  // Check /v1/user
  try {
    const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey }
    });
    console.log('/v1/user status:', userRes.status);
    if (userRes.ok) {
      const userData = await userRes.json();
      console.log('User tier:', userData.subscription?.tier, 'character count:', userData.subscription?.character_count, '/', userData.subscription?.character_limit);
      console.log('Can use instant voice clone:', userData.subscription?.can_use_instant_voice_cloning);
    } else {
      console.log('/v1/user error:', await userRes.text());
    }
  } catch (err) {
    console.log('/v1/user request failed:', err.message);
  }

  // Check /v1/models
  try {
    const modelsRes = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: { 'xi-api-key': apiKey }
    });
    console.log('/v1/models status:', modelsRes.status);
    if (modelsRes.ok) {
      const models = await modelsRes.json();
      const modelIds = models.map(m => m.model_id);
      console.log('Available models:', modelIds);
      const musicModels = models.filter(m => m.model_id.includes('music') || (m.name && m.name.toLowerCase().includes('music')));
      console.log('Music models found in /v1/models:', musicModels.map(m => ({ id: m.model_id, name: m.name })));
    }
  } catch (err) {
    console.log('/v1/models request failed:', err.message);
  }

  // Test /v1/music/stream or /v1/music
  try {
    console.log('Testing POST /v1/music/stream...');
    const musicRes = await fetch('https://api.elevenlabs.io/v1/music/stream', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'gentle atmospheric ambient music, soft pads, no vocals',
        music_length_ms: 10000,
        force_instrumental: true
      })
    });
    console.log('/v1/music/stream status:', musicRes.status);
    const musicText = await musicRes.text();
    console.log('/v1/music/stream body (first 200 chars):', musicText.slice(0, 200));
  } catch (err) {
    console.log('/v1/music/stream failed:', err.message);
  }

  // Test /v1/music
  try {
    console.log('Testing POST /v1/music...');
    const musicRes2 = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'gentle atmospheric ambient music, soft pads, no vocals',
        music_length_ms: 10000,
        force_instrumental: true
      })
    });
    console.log('/v1/music status:', musicRes2.status);
    const musicText2 = await musicRes2.text();
    console.log('/v1/music body (first 200 chars):', musicText2.slice(0, 200));
  } catch (err) {
    console.log('/v1/music failed:', err.message);
  }

  // Also test /v1/sound-generation
  try {
    console.log('Testing POST /v1/sound-generation...');
    const sfxRes = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'gentle ambient atmospheric pad drone',
        duration_seconds: 5
      })
    });
    console.log('/v1/sound-generation status:', sfxRes.status);
    if (sfxRes.ok) {
      const buf = await sfxRes.arrayBuffer();
      console.log('/v1/sound-generation audio received! Bytes:', buf.byteLength);
    } else {
      console.log('/v1/sound-generation body:', (await sfxRes.text()).slice(0, 200));
    }
  } catch (err) {
    console.log('/v1/sound-generation failed:', err.message);
  }
}

async function testAzureSpeech() {
  console.log('\n--- AZURE SPEECH DIAGNOSTIC ---');
  const apiKey = process.env.AZURE_SPEECH_KEY || process.env.MICROSOFT_AZURE_API_KEY;
  const configuredRegion = process.env.AZURE_SPEECH_REGION || process.env.MICROSOFT_AZURE_REGION;
  console.log('AZURE_SPEECH_KEY present:', !!apiKey, 'length:', (apiKey || '').length);
  console.log('Configured region:', configuredRegion);

  const testRegions = configuredRegion ? [configuredRegion] : ['southeastasia', 'eastus', 'westus', 'centralus', 'northeurope', 'westeurope'];

  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="-5%" pitch="-2%">
      I am calm, centered, and aligned with my highest potential.
    </prosody>
  </voice>
</speak>`.trim();

  for (const region of testRegions) {
    try {
      const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
          'User-Agent': 'OrbitManifestation/1.0'
        },
        body: ssml
      });

      console.log(`Region [${region}] status:`, res.status);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`SUCCESS in region [${region}]! Received MP3 audio bytes:`, buf.byteLength);
        return; // found working region!
      } else {
        const errText = await res.text();
        console.log(`Region [${region}] error:`, errText.slice(0, 150));
      }
    } catch (err) {
      console.log(`Region [${region}] exception:`, err.message);
    }
  }
}

async function run() {
  await testElevenLabs();
  await testAzureSpeech();
}

run();
