import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { SubliminalSession, ISubliminalSession } from '../models/SubliminalSession.js';
import { GeminiScriptService, IntentionAnswers } from '../services/geminiScriptService.js';
import { generateSpeech, getAvailableVoices } from '../services/tts/index.js';
import { AudioMixerService } from '../services/audioMixerService.js';
import { getAmbienceCatalog, FREQUENCY_CATALOG } from '../config/ambienceCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const geminiService = new GeminiScriptService();
const audioMixerService = new AudioMixerService();

export async function getSessionCatalog(req: Request, res: Response) {
  try {
    const ambience = getAmbienceCatalog().map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description
    }));

    const voices = getAvailableVoices();
    const frequencies = FREQUENCY_CATALOG;

    res.json({
      success: true,
      ambience,
      voices,
      frequencies
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

export async function createSession(req: Request, res: Response) {
  try {
    const { concept, answers, settings } = req.body;

    if (!answers || !concept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: concept and answers are required.'
      });
    }

    const session = new SubliminalSession({
      title: concept.title || 'Cosmic Alignment',
      category: concept.category || answers.category || 'Manifestation',
      status: 'GENERATING_SCRIPT',
      intention: {
        desiredOutcome: answers.desiredOutcome,
        desiredIdentity: answers.desiredIdentity,
        emotionalState: answers.emotionalState,
        currentBlock: answers.currentBlock,
        dailyAction: answers.dailyAction,
        category: answers.category || 'Manifestation'
      },
      settings: {
        durationMinutes: settings?.durationMinutes || 5,
        usageContext: settings?.usageContext || 'meditation',
        ambienceTrackId: settings?.ambienceTrackId || 'rain-light',
        frequencyHz: settings?.frequencyHz,
        voiceId: settings?.voiceId || 'bella',
        ttsProvider: settings?.ttsProvider || 'elevenlabs',
        subliminalIntensity: settings?.subliminalIntensity || 'subtle'
      },
      script: {
        affirmations: [],
        rawText: '',
        tone: ''
      }
    });

    await session.save();

    // Trigger asynchronous generation pipeline
    processSessionPipeline(session._id.toString(), concept, answers).catch(err => {
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
    // Use userId from auth middleware if available, otherwise return all sessions
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
 * Background pipeline runner that walks through state transitions
 */
async function processSessionPipeline(sessionId: string, concept: any, answers: IntentionAnswers) {
  const session = await SubliminalSession.findById(sessionId);
  if (!session) return;

  const tempDir = path.resolve(__dirname, '../../media/temp');
  const outputSessionsDir = path.resolve(__dirname, '../../media/sessions');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(outputSessionsDir)) fs.mkdirSync(outputSessionsDir, { recursive: true });

  try {
    // Step 1: GENERATING_SCRIPT
    session.status = 'GENERATING_SCRIPT';
    await session.save();

    const scriptResult = await geminiService.generateAffirmationScript({
      concept,
      answers,
      intensity: session.settings.subliminalIntensity
    });

    session.script = {
      affirmations: scriptResult.affirmations,
      rawText: scriptResult.rawText,
      tone: scriptResult.tone
    };
    session.title = scriptResult.title;
    session.status = 'GENERATING_VOICE';
    await session.save();

    // Step 2: GENERATING_VOICE
    const voiceTempPath = path.join(tempDir, `voice_${sessionId}.mp3`);
    await generateSpeech({
      provider: session.settings.ttsProvider,
      text: scriptResult.rawText,
      voiceId: session.settings.voiceId,
      intensity: session.settings.subliminalIntensity,
      outputPath: voiceTempPath
    });

    session.status = 'MIXING_AUDIO';
    await session.save();

    // Step 3: MIXING_AUDIO
    const mixResult = await audioMixerService.mixSessionAudio({
      sessionId,
      voiceAudioPath: voiceTempPath,
      ambienceTrackId: session.settings.ambienceTrackId,
      frequencyHz: session.settings.frequencyHz,
      durationMinutes: session.settings.durationMinutes,
      intensity: session.settings.subliminalIntensity,
      outputDirectory: outputSessionsDir
    });

    // Step 4: COMPLETED
    session.audio = {
      url: mixResult.relativeUrl,
      durationSeconds: mixResult.durationSeconds,
      fileSizeBytes: mixResult.fileSizeBytes,
      sha256: mixResult.sha256
    };
    session.status = 'COMPLETED';
    await session.save();

    // Cleanup voice temp file
    if (fs.existsSync(voiceTempPath)) {
      try {
        fs.unlinkSync(voiceTempPath);
      } catch {}
    }
  } catch (err) {
    console.error(`[Pipeline Failed for ${sessionId}]:`, err);
    session.status = 'FAILED';
    session.error = (err as Error).message || 'Generation failed';
    await session.save();
  }
}
