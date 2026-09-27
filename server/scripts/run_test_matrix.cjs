const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TEST_MATRIX = [
  {
    name: 'Test A: Focus Session (432 Hz + Gentle Rain)',
    payload: {
      concept: {
        title: 'Quantum Focus: The Deep Workspace',
        targetOutcome: 'Unwavering single-task focus without cognitive fatigue',
        category: 'Focus & Productivity'
      },
      answers: {
        desiredOutcome: 'Laser focus and effortless creative flow',
        desiredIdentity: 'A grounded master of deep, uninterrupted creative craft',
        emotionalState: 'Still, calm, sovereign concentration',
        currentBlock: 'Context switching and digital friction',
        dailyAction: '90 minutes of morning deep work without interruptions',
        category: 'Focus & Productivity'
      },
      settings: {
        durationMinutes: 0.5, // 30 sec test
        usageContext: 'focus',
        ambienceTrackId: 'rain-light',
        frequencyHz: 432,
        voiceId: 'bella',
        ttsProvider: 'elevenlabs',
        subliminalIntensity: 'subtle'
      }
    }
  },
  {
    name: 'Test B: Morning Awakening (528 Hz + Cosmic Brown Noise)',
    payload: {
      concept: {
        title: 'Solar Vitality: The Dawn Sovereign',
        targetOutcome: 'Expansive physical energy and clear morning conviction',
        category: 'Vitality & Health'
      },
      answers: {
        desiredOutcome: 'Radiant morning momentum and high somatic energy',
        desiredIdentity: 'An energized visionary who meets each day with joyful authority',
        emotionalState: 'Expansive, vibrant, grounded optimism',
        currentBlock: 'Morning lethargy and sluggish starts',
        dailyAction: 'Hydrating, morning movement, and identity affirmation',
        category: 'Vitality & Health'
      },
      settings: {
        durationMinutes: 0.5, // 30 sec test
        usageContext: 'morning',
        ambienceTrackId: 'noise-brown',
        frequencyHz: 528,
        voiceId: 'adam',
        ttsProvider: 'elevenlabs',
        subliminalIntensity: 'balanced'
      }
    }
  },
  {
    name: 'Test C: Night Sleep & Rest (Rain on the Window)',
    payload: {
      concept: {
        title: 'Night Harbor: Deep Subconscious Rest',
        targetOutcome: 'Effortless transition into restorative cellular sleep',
        category: 'Rest & Recovery'
      },
      answers: {
        desiredOutcome: 'Deep, uninterrupted sleep and complete nervous system renewal',
        desiredIdentity: 'A peaceful soul who rests completely and recharges deeply',
        emotionalState: 'Serene, safe, velvety calmness',
        currentBlock: 'Late-night racing thoughts and active mind',
        dailyAction: 'Evening screen-free wind-down ritual',
        category: 'Rest & Recovery'
      },
      settings: {
        durationMinutes: 0.5, // 30 sec test
        usageContext: 'sleep',
        ambienceTrackId: 'rain-window',
        frequencyHz: 396,
        voiceId: 'bella',
        ttsProvider: 'elevenlabs',
        subliminalIntensity: 'subtle'
      }
    }
  }
];

async function runTest(testCase, index) {
  console.log(`\n============================================================`);
  console.log(`RUNNING ${testCase.name} (${index + 1}/${TEST_MATRIX.length})`);
  console.log(`============================================================`);

  const createRes = await fetch('http://localhost:4000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCase.payload)
  });

  const createData = await createRes.json();
  const sessionId = createData.session?._id;
  console.log(`Created Session ID: ${sessionId}`);

  if (!sessionId) {
    throw new Error(`Failed to create session: ${JSON.stringify(createData)}`);
  }

  // Poll until COMPLETED or FAILED
  let session = null;
  for (let poll = 1; poll <= 40; poll++) {
    await new Promise(r => setTimeout(r, 2000));
    const checkRes = await fetch(`http://localhost:4000/api/sessions/${sessionId}`);
    const checkData = await checkRes.json();
    session = checkData.session;
    console.log(`[Poll ${poll}] Status: ${session.status}`);

    if (session.status === 'COMPLETED') {
      break;
    }
    if (session.status === 'FAILED') {
      throw new Error(`Session failed: ${session.error}`);
    }
  }

  if (!session || session.status !== 'COMPLETED') {
    throw new Error(`Timed out waiting for session completion`);
  }

  console.log(`✓ COMPLETED in pipeline!`);
  console.log(`  Title: ${session.title}`);
  console.log(`  Audio URL: ${session.audio.url}`);
  console.log(`  Duration: ${session.audio.durationSeconds}s`);
  console.log(`  File Size: ${session.audio.fileSizeBytes} bytes`);
  console.log(`  SHA-256: ${session.audio.sha256}`);
  console.log(`  Sample Affirmations (${session.script.affirmations.length} total):`);
  session.script.affirmations.slice(0, 3).forEach((a, i) => {
    console.log(`    ${i + 1}. "${a}"`);
  });

  // Verify file on disk
  const localFilePath = path.resolve(__dirname, `..${session.audio.url}`);
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Local file missing at: ${localFilePath}`);
  }
  const fileBytes = fs.readFileSync(localFilePath);
  const verifyHash = crypto.createHash('sha256').update(fileBytes).digest('hex');
  if (verifyHash !== session.audio.sha256) {
    throw new Error(`Hash mismatch! Expected ${session.audio.sha256}, got ${verifyHash}`);
  }
  console.log(`✓ On-disk file verified and SHA-256 hash match confirmed.`);

  return session;
}

async function main() {
  console.log(`Starting Test Matrix: 3 Complete End-to-End Pipeline Flows`);
  for (let i = 0; i < TEST_MATRIX.length; i++) {
    await runTest(TEST_MATRIX[i], i);
  }
  console.log(`\n============================================================`);
  console.log(`ALL 3 TEST FLOWS PASSED VERIFICATION!`);
  console.log(`============================================================\n`);
}

main().catch(err => {
  console.error(`Test Matrix Failed:`, err);
  process.exit(1);
});
