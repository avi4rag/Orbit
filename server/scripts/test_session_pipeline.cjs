async function testPipeline() {
  console.log('Starting full pipeline test...');
  const createRes = await fetch('http://localhost:4000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept: {
        title: 'Solar Radiance: Unshakable Clarity',
        targetOutcome: 'Total mental peace, unwavering focus, effortless momentum',
        category: 'Focus & Productivity'
      },
      answers: {
        desiredOutcome: 'Total mental clarity and deep creative focus',
        desiredIdentity: 'A calm, prolific creator who executes effortlessly',
        emotionalState: 'Grounded, peaceful, sovereign',
        currentBlock: 'Overthinking and self-imposed pressure',
        dailyAction: '1 hour of calm morning deep work',
        category: 'Focus & Productivity'
      },
      settings: {
        durationMinutes: 0.5, // 30 seconds for quick verification
        usageContext: 'focus',
        ambienceTrackId: 'rain-light',
        frequencyHz: 432,
        voiceId: 'bella',
        ttsProvider: 'elevenlabs',
        subliminalIntensity: 'subtle'
      }
    })
  });

  const createData = await createRes.json();
  console.log('Session created:', createData.session?._id, 'Initial status:', createData.session?.status);
  const sessionId = createData.session?._id;

  if (!sessionId) {
    console.error('Failed to create session:', createData);
    process.exit(1);
  }

  // Poll status until COMPLETED or FAILED
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const checkRes = await fetch(`http://localhost:4000/api/sessions/${sessionId}`);
    const checkData = await checkRes.json();
    const s = checkData.session;
    console.log(`[Poll ${i+1}] Status: ${s.status}, Audio: ${s.audio?.url || 'none'}`);
    if (s.status === 'COMPLETED') {
      console.log('SUCCESS! Session pipeline completed successfully!');
      console.log('Audio URL:', s.audio.url);
      console.log('Duration:', s.audio.durationSeconds, 'seconds');
      console.log('File size:', s.audio.fileSizeBytes, 'bytes');
      console.log('SHA-256:', s.audio.sha256);
      console.log('Affirmations sample:', s.script.affirmations.slice(0, 3));
      return;
    }
    if (s.status === 'FAILED') {
      console.error('Session pipeline failed with error:', s.error);
      process.exit(1);
    }
  }

  console.error('Pipeline timed out');
  process.exit(1);
}

testPipeline().catch(err => {
  console.error('Pipeline test crashed:', err);
  process.exit(1);
});
