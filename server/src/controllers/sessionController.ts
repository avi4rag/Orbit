import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { SubliminalSession, ISubliminalSession } from '../models/SubliminalSession.js';
import { GeminiScriptService, IntentionAnswers } from '../services/geminiScriptService.js';
import { synthesizeAzureSpeech, AzureSpeechError, AZURE_VOICES } from '../services/tts/azureSpeechService.js';
import { elevenLabsMusicService, ElevenLabsMusicError } from '../services/elevenLabsMusicService.js';
import { audioMixerService, AudioMixerError } from '../services/audioMixerService.js';
import { getAmbienceCatalog, FREQUENCY_CATALOG } from '../config/ambienceCatalog.js';
import { storageService } from '../services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const geminiService = new GeminiScriptService();

export async function getSessionCatalog(req: Request, res: Response) {
  try {
    const ambience = getAmbienceCatalog().map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description
    }));

    const voices = Object.values(AZURE_VOICES).map(v => ({
      id: v.id,
      name: v.name,
      label: v.label,
      provider: 'azure'
    }));

    const frequencies = FREQUENCY_CATALOG;

    // Report server-side provider status
    const ttsProvider = 'azure';
    const musicProvider = 'elevenlabs';

    res.json({
      success: true,
      ambience,
      voices,
      frequencies,
      providers: {
        tts: ttsProvider,
        music: musicProvider
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function analyzeIntention(req: Request, res: Response) {
  try {
    const answers: IntentionAnswers = req.body;
    if (!answers.desiredOutcome || !answers.desiredIdentity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required intention fields (desiredOutcome, desiredIdentity).'
      });
    }

    const analysis = await geminiService.analyzeIntentionAndGenerateConcepts(answers);
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    console.error('[analyzeIntention error]', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

function normalizeIntentionAnswers(answers: any, concept?: any): IntentionAnswers {
  const ans = answers || {};
  const c = concept || {};

  return {
    desiredOutcome:
      ans.desiredOutcome ||
      ans.specificIntention ||
      ans.desire ||
      c.targetOutcome ||
      c.description ||
      c.title ||
      'Optimal mental clarity, calm focus, and self-realization',
    desiredIdentity:
      ans.desiredIdentity ||
      ans.identity ||
      c.title ||
      'Aligned, confident, and focused creator',
    emotionalState:
      ans.emotionalState ||
      ans.feelings ||
      'Calm, centered, confident, and energized',
    currentBlock:
      ans.currentBlock ||
      'Overthinking and hesitation',
    dailyAction:
      ans.dailyAction ||
      ans.action ||
      'Consistent daily focused action and creative flow',
    category:
      ans.category ||
      ans.desire ||
      c.category ||
      'Manifestation'
  };
}

export async function createSession(req: Request, res: Response) {
  try {
    const { concept, answers, settings } = req.body;

    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: concept is required.'
      });
    }

    const normalizedAnswers = normalizeIntentionAnswers(answers, concept);

    const session = new SubliminalSession({
      userId: (req as any).userId,
      title: concept.title || 'Cosmic Alignment',
      category: concept.category || normalizedAnswers.category || 'Manifestation',
      status: 'GENERATING_SCRIPT',
      intention: normalizedAnswers,
      settings: {
        durationMinutes: settings?.durationMinutes || 5,
        usageContext: settings?.usageContext || 'meditation',
        ambienceTrackId: settings?.ambienceTrackId || 'rain-light',
        frequencyHz: settings?.frequencyHz,
        voiceId: settings?.voiceId || 'en-US-JennyNeural',
        ttsProvider: 'azure',
        musicProvider: settings?.musicProvider || 'elevenlabs',
        allowAmbienceFallback: settings?.allowAmbienceFallback !== false,
        subliminalIntensity: settings?.subliminalIntensity || 'subtle'
      },
      script: {
        affirmations: [],
        rawText: '',
        tone: ''
      }
    });

    await session.save();

    // Trigger asynchronous multi-stage generation pipeline
    processSessionPipeline(session._id.toString(), concept, normalizedAnswers).catch(err => {
      console.error(`[SessionPipeline Error for ${session._id}]:`, err);
    });

    res.status(201).json({
      success: true,
      session
    });
  } catch (err) {
    console.error('[createSession error]', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function getSessionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await SubliminalSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function listSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const filter = userId ? { userId } : {};
    const sessions = await SubliminalSession.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

/**
 * Background pipeline runner that steps through explicit state transitions:
 * GENERATING_SCRIPT -> GENERATING_VOICE -> GENERATING_MUSIC -> MIXING_AUDIO -> UPLOADING -> COMPLETED
 */
export async function processSessionPipeline(sessionId: string, concept: any, answers: IntentionAnswers) {
  const session = await SubliminalSession.findById(sessionId);
  if (!session) return;

  const tempDir = path.resolve(__dirname, '../../media/temp');
  const outputSessionsDir = path.resolve(__dirname, '../../media/sessions');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(outputSessionsDir)) fs.mkdirSync(outputSessionsDir, { recursive: true });

  const voiceTempPath = path.join(tempDir, `voice_${sessionId}.mp3`);
  const musicTempPath = path.join(tempDir, `music_${sessionId}.mp3`);

  try {
    // ------------------------------------------------------------------------
    // STAGE 1: GENERATING_SCRIPT (Gemini)
    // ------------------------------------------------------------------------
    session.status = 'GENERATING_SCRIPT';
    await session.save();

    console.log(`[Session ${sessionId}] Stage: GENERATING_SCRIPT`);
    const scriptResult = await geminiService.generateAffirmationScript({
      concept,
      answers,
      intensity: session.settings.subliminalIntensity
    });

    session.script = {
      title: scriptResult.title,
      tone: scriptResult.tone,
      affirmations: scriptResult.affirmations,
      identityStatements: scriptResult.identityStatements,
      visualizationPrompts: scriptResult.visualizationPrompts,
      actionAnchors: scriptResult.actionAnchors,
      closingStatements: scriptResult.closingStatements,
      rawText: scriptResult.rawText
    };
    session.title = scriptResult.title || session.title;

    // ------------------------------------------------------------------------
    // STAGE 2: GENERATING_VOICE (Microsoft Azure Speech TTS)
    // ------------------------------------------------------------------------
    session.status = 'GENERATING_VOICE';
    await session.save();

    console.log(`[Session ${sessionId}] Stage: GENERATING_VOICE (Azure Speech)`);
    let voiceResult: any;
    try {
      voiceResult = await synthesizeAzureSpeech({
        text: scriptResult.rawText,
        voiceId: session.settings.voiceId,
        intensity: session.settings.subliminalIntensity,
        outputPath: voiceTempPath
      });
    } catch (voiceErr: any) {
      console.error(`[Session ${sessionId}] Azure Speech Voice Generation Failed:`, voiceErr);
      session.status = 'FAILED';
      session.failedStage = 'GENERATING_VOICE';
      session.errorCode = voiceErr.code || 'AZURE_SPEECH_SYNTHESIS_FAILED';
      session.errorMessage = voiceErr.message || 'Azure Speech synthesis failed.';
      session.error = voiceErr.message;
      await session.save();
      return;
    }

    // ------------------------------------------------------------------------
    // STAGE 3: GENERATING_MUSIC (ElevenLabs Music / Verified Ambience)
    // ------------------------------------------------------------------------
    session.status = 'GENERATING_MUSIC';
    await session.save();

    console.log(`[Session ${sessionId}] Stage: GENERATING_MUSIC (ElevenLabs Music)`);
    let musicResult: any;
    try {
      musicResult = await elevenLabsMusicService.resolveSessionMusicTrack({
        sessionTitle: session.title,
        category: session.category,
        usageContext: session.settings.usageContext,
        ambienceStyle: session.settings.ambienceTrackId,
        targetDurationSeconds: 30,
        outputPath: musicTempPath,
        allowAmbienceFallback: session.settings.allowAmbienceFallback !== false,
        musicProvider: session.settings.musicProvider || 'elevenlabs'
      });
    } catch (musicErr: any) {
      console.error(`[Session ${sessionId}] ElevenLabs Music Generation Failed:`, musicErr);
      session.status = 'FAILED';
      session.failedStage = 'GENERATING_MUSIC';
      session.errorCode = musicErr.code || 'ELEVENLABS_MUSIC_GENERATION_FAILED';
      session.errorMessage = musicErr.message || 'ElevenLabs music generation failed.';
      session.error = musicErr.message;
      await session.save();
      return;
    }

    // ------------------------------------------------------------------------
    // STAGE 4: MIXING_AUDIO (FFmpeg Multi-layer Mixer)
    // ------------------------------------------------------------------------
    session.status = 'MIXING_AUDIO';
    await session.save();

    console.log(`[Session ${sessionId}] Stage: MIXING_AUDIO (FFmpeg)`);
    let mixResult: any;
    try {
      mixResult = await audioMixerService.mixSessionAudio({
        sessionId,
        voiceAudioPath: voiceTempPath,
        musicAudioPath: musicResult.outputPath,
        ambienceTrackId: session.settings.ambienceTrackId,
        frequencyHz: session.settings.frequencyHz,
        durationMinutes: session.settings.durationMinutes,
        intensity: session.settings.subliminalIntensity,
        outputDirectory: outputSessionsDir
      });
    } catch (mixErr: any) {
      console.error(`[Session ${sessionId}] Audio Mixing Failed:`, mixErr);
      session.status = 'FAILED';
      session.failedStage = 'MIXING_AUDIO';
      session.errorCode = mixErr.code || 'AUDIO_MIXING_FAILED';
      session.errorMessage = mixErr.message || 'Audio mixing process failed.';
      session.error = mixErr.message;
      await session.save();
      return;
    }

    // ------------------------------------------------------------------------
    // STAGE 5: UPLOADING (Persistent Storage Resolution)
    // ------------------------------------------------------------------------
    session.status = 'UPLOADING';
    await session.save();

    console.log(`[Session ${sessionId}] Stage: UPLOADING (Persistent Storage)`);
    const storageKey = `sessions/session_${sessionId}.mp3`;
    const finalAudioUrl = mixResult.relativeUrl;

    // ------------------------------------------------------------------------
    // STAGE 6: COMPLETED
    // ------------------------------------------------------------------------
    session.audio = {
      url: finalAudioUrl,
      storageKey,
      durationSeconds: mixResult.durationSeconds,
      fileSizeBytes: mixResult.fileSizeBytes,
      voiceDurationSeconds: voiceResult.durationSeconds,
      musicDurationSeconds: musicResult.durationSeconds,
      voiceProvider: 'azure',
      musicProvider: musicResult.provider,
      musicPrompt: musicResult.promptUsed,
      sha256: mixResult.sha256
    };
    session.status = 'COMPLETED';
    session.failedStage = undefined;
    session.errorCode = undefined;
    session.errorMessage = undefined;
    session.error = undefined;
    await session.save();

    console.log(`[Session ${sessionId}] ✓ GENERATION PIPELINE COMPLETED SUCCESSFULLY.`);

    // Cleanup voice temp file
    if (fs.existsSync(voiceTempPath)) {
      try {
        fs.unlinkSync(voiceTempPath);
      } catch {}
    }
  } catch (err: any) {
    console.error(`[Session Pipeline Catastrophic Failure for ${sessionId}]:`, err);
    session.status = 'FAILED';
    session.failedStage = session.status || 'UNKNOWN';
    session.errorCode = 'INTERNAL_PIPELINE_ERROR';
    session.errorMessage = err.message || 'Generation failed';
    session.error = err.message;
    await session.save();
  }
}
