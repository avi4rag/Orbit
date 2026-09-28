<div align="center">

# 🪐 O R B I T

### Next-Generation Subconscious Architecture & AI Subliminal Audio Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs_TTS-000000?style=for-the-badge)](https://elevenlabs.io/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg_Audio_Engine-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)

<p align="center">
  <strong>Transform conscious intention into subliminal neural programming through generative AI, Solfeggio frequencies, and professional multi-track audio synthesis.</strong>
</p>

[Key Features](#-key-features) •
[Architecture](#-system-architecture) •
[Audio Pipeline](#-audio-synthesis-pipeline) •
[Tech Stack](#-technology-stack) •
[Quick Start](#-quick-start) •
[API Reference](#-api-reference) •
[Environment Variables](#-environment-variables)

---

</div>

## 🌌 Overview

**ORBIT** is a full-stack subconscious engineering platform designed to systematically align cognitive habits, emotional states, and identity goals. Combining **generative cognitive analysis (Google Gemini)**, **high-fidelity neural voice synthesis (ElevenLabs & Azure)**, and **automated acoustic engineering (FFmpeg)**, Orbit constructs personalized, psychoacoustically-tuned subliminal audio sessions on demand.

Whether training for peak focus, creative momentum, abundance consciousness, or emotional tranquility, Orbit bridges the gap between conscious aspiration and autonomic neural belief systems.

---

## ✨ Key Features

### 🧠 1. AI Intention Profiling & Subconscious Scriptwriting
- **6-Pillar Cognitive Intake**: Gathers deep qualitative dimensions: *Core Desire*, *Specific Intention*, *Identity Persona*, *Target Emotional State*, *Current Cognitive Block*, and *Daily Micro-Action*.
- **Gemini 3.8 Flash Script Generation**: Evaluates user mental blocks and synthesizes customized affirmation scripts that strictly follow Orbit’s **Subconscious Linguistic Rules**:
  1. **Present Tense Exclusivity**: Formulations start with present reality (`"I am"`, `"I naturally embody"`, `"Every day I cultivate"`).
  2. **Zero Negation Mandate**: Completely omits words of resistance or lack (`no`, `not`, `never`, `stop`, `quit`, `fear`, `doubt`, `struggle`).
  3. **Identity & Sensory Fusion**: Fuses visceral emotion with self-perception.
  4. **Rhythmic Cadence**: Designed with spacious looping intervals tailored for subconscious retention.

### 🎙️ 2. Multi-Provider Neural Voice Synthesis
- **ElevenLabs High-Fidelity TTS**: Ultra-realistic human cadence across diverse voice styles (Bella, Antoni, Adam, Arnold).
- **Microsoft Azure Speech Integration**: Low-latency multilingual speech fallback.
- **Dynamic Intensity Modulation**:
  - `Subtle`: Low audibility masked beneath atmospheric frequencies (-18 dB to -22 dB).
  - `Balanced`: Softly audible background guide (-12 dB to -15 dB).
  - `Prominent`: Clearly audible affirmations over ambient beds (-6 dB to -8 dB).

### 🎛️ 3. Multi-Track Acoustic Engineering (FFmpeg)
- **Harmonic Solfeggio & Binaural Frequencies**: Real-time generation of pure sine wave harmonics including:
  - `432 Hz` (Verdi Tuning & Cellular Relaxation)
  - `528 Hz` (Transformation & Neuroplasticity)
  - `639 Hz` (Harmonious Interpersonal Connections)
  - `741 Hz` (Intuitive Insight & Mental Clarity)
  - `852 Hz` (Spiritual Awakening & Higher Order Focus)
  - *Custom user-defined Hz frequencies.*
- **Dynamic Atmospheric Soundscapes**: Looped high-resolution ambient soundbeds (Window Rain, Light Rain, Forest Lluvia, Cosmic Brown Noise, Pink Flow).
- **Automated Gain Staging & Ducking**: Automatically normalizes peak amplitudes and balances voice, frequency, and atmosphere.

### 🪐 4. Celestial Universe Visualizer
- **Interactive 3D Orbital Canvas**: Renders the user’s personal goals and focus domains as celestial planets orbiting a central solar core.
- **Dynamic Planetary Vitality**: Planet size, orbital radius, glow intensity, and ring systems reflect current streak vitality, session history, and alignment metrics.

### 🎧 5. Universal Audio Player & Ritual Tracking
- **Persistent Global Player**: Seamless background playback with waveform displays, time scrubbing, looping, and active affirmation text stream.
- **Daily Ritual Streak System**: Tracks consistent morning and evening listening rituals to optimize long-term neuroplastic adaptation.
- **Session Modes**: Tailored listening modes for *Sleep*, *Deep Work Focus*, *Meditation*, and *Morning Realization*.

### 🛡️ 6. Resilient Dual-Mode Execution
- **Full Cloud Operation**: MongoDB Atlas database persistence, JWT authentication, and cloud-synced user profiles.
- **Zero-Friction Offline Fallback**: In the absence of an active database or network connection, Orbit automatically switches to offline mode with `localStorage` state preservation, pre-bundled ambient tracks, and deterministic seed sessions.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   User Client (Vite)   │
                                  │ React 19 + TypeScript  │
                                  └───────────┬────────────┘
                                              │
                     HTTP REST / JSON         │  Bearer JWT / Mock Token
                                              ▼
                                  ┌────────────────────────┐
                                  │   Express API Server   │
                                  │       Port: 4000       │
                                  └───────────┬────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│  MongoDB Atlas   │               │ Google Gemini AI │               │ ElevenLabs /     │
│   (Mongoose 8)   │               │ (gemini-3.8-fl.) │               │ Azure Speech API │
│ User & Sessions  │               │ Script Synthesis │               │ Neural Voice TTS │
└──────────────────┘               └──────────┬───────┘               └─────────┬────────┘
                                              │                                 │
                                              └────────────────┬────────────────┘
                                                               │
                                                               ▼
                                                    ┌────────────────────┐
                                                    │ FFmpeg Audio Mixer │
                                                    │  Voice + Ambience  │
                                                    │   + Frequencies    │
                                                    └─────────┬──────────┘
                                                              │
                                                              ▼
                                                    ┌────────────────────┐
                                                    │ MP3 Stream Engine  │
                                                    │ /media/sessions/*  │
                                                    └────────────────────┘
```

---

## 🔄 Audio Synthesis Pipeline

When a personalized subliminal is created, the system triggers an asynchronous four-phase state machine:

```mermaid
flowchart LR
    A[Onboarding / Intention] --> B[Intention Analysis & Concept Selection]
    B --> C[1. GENERATING_SCRIPT]
    C -->|Gemini 3.8 Flash| D[2. GENERATING_VOICE]
    D -->|ElevenLabs / Azure| E[3. MIXING_AUDIO]
    E -->|FFmpeg Mixer| F[4. COMPLETED]
    F --> G[Global Player Ready]
```

1. **Intention Mapping**: User questionnaire responses are normalized into a canonical `IntentionAnswers` object.
2. **Phase 1: `GENERATING_SCRIPT`**: Gemini analyzes the user's emotional block and writes an affirmation script adhering to subconscious syntax rules.
3. **Phase 2: `GENERATING_VOICE`**: The affirmation script is rendered into a clean, noise-free voice track using high-grade neural TTS.
4. **Phase 3: `MIXING_AUDIO`**: FFmpeg executes:
   - Voice audio looping & volume ducking according to requested intensity (`subtle` / `balanced` / `prominent`).
   - Solfeggio or binaural carrier frequency sine generation.
   - Ambient soundscape layering (rain, brown noise, pink noise).
   - Audio mastering to stereo MP3 at 192kbps with SHA-256 integrity verification.
5. **Phase 4: `COMPLETED`**: Session status transitions to `COMPLETED` and the media stream URL is emitted to the client.

---

## 💻 Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 | Ultra-fast reactive single-page client with HMR |
| **Routing & Navigation** | React Router DOM v7 | Client-side routing with route guards |
| **Styling & UI** | Vanilla Modular CSS, Canvas Confetti | Bespoke glassmorphic celestial design system |
| **Icons & Visuals** | Lucide React | Clean, modern SVG icon set |
| **Backend Runtime** | Node.js (ESM), Express 4 | High-performance modular REST API |
| **Server TypeScript** | `tsx`, `typescript` 5.8 | Direct TypeScript execution with watch mode |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 | Document storage for users, sessions, and intake |
| **AI Generation** | `@google/genai` (Gemini SDK) | Intention analysis and subliminal scripting |
| **Voice Synthesis** | ElevenLabs API, Azure Speech | Multi-provider emotional neural TTS |
| **Acoustic Processing**| `@ffmpeg-installer/ffmpeg` | Native audio mixing, ducking, and frequency generation |
| **Security & Auth** | JWT, bcryptjs, CORS | Token-based auth with demo bypass capabilities |

---

## 📂 Project Structure

```text
orbit/
├── src/                               # Frontend Source Code
│   ├── assets/                        # Static imagery and branding assets
│   ├── components/                    # Reusable UI Components
│   │   ├── auth/                      # Authentication modal & forms
│   │   ├── layout/                    # Global Navbar, Footer, and Shells
│   │   ├── player/                    # Global persistent Audio Player bar
│   │   ├── session/                   # Session customizer modal
│   │   ├── subliminals/               # Subliminal cards, rails, and grids
│   │   └── universe/                  # 3D Celestial Universe Canvas
│   ├── context/                       # React Context Providers (Auth, Player)
│   ├── data/                          # Seed subliminals and ambient catalogs
│   ├── pages/                         # Application Views & Pages
│   │   ├── AIGeneratorPage.tsx        # Direct AI generation studio
│   │   ├── ActionsPage.tsx            # Daily habits and micro-actions
│   │   ├── CategoryPage.tsx           # Category-specific audio rails
│   │   ├── CelestialUniversePage.tsx  # 3D interactive planetary goals view
│   │   ├── CreateSessionPage.tsx      # Multi-concept customized creation
│   │   ├── ExplorePage.tsx            # Comprehensive subliminal catalog
│   │   ├── LandingPage.tsx            # Conversion-focused homepage
│   │   ├── OnboardingPage.tsx         # 6-step deep intention intake
│   │   ├── ProfilePage.tsx            # User stats, streaks, and preferences
│   │   ├── RitualPage.tsx             # Daily ritual streak tracker
│   │   ├── SessionDetailPage.tsx      # Deep dive into session affirmations
│   │   └── SubliminalsPage.tsx        # Central audio hub & library
│   ├── services/                      # API client & Spoken Affirmation Engine
│   ├── types/                         # Global TypeScript interfaces & schemas
│   ├── App.tsx                        # Main route declarations
│   └── main.tsx                       # React application root
│
├── server/                            # Backend API & Audio Server
│   ├── media/                         # Generated audio & ambient tracks
│   │   ├── ambience/                  # High-quality ambient loop tracks
│   │   └── sessions/                  # Rendered MP3 subliminal audio files
│   ├── src/
│   │   ├── config/                    # Ambience catalogs & audio settings
│   │   ├── controllers/               # API route controllers (session, auth, etc.)
│   │   ├── middleware/                # JWT auth & error handling middleware
│   │   ├── models/                    # Mongoose database models (User, Session)
│   │   ├── routes/                    # Express routing endpoints
│   │   ├── services/                  # Core services (Gemini, FFmpeg, TTS)
│   │   │   ├── audioMixerService.ts   # FFmpeg multi-track mixing engine
│   │   │   ├── geminiScriptService.ts # Gemini 3.8 Flash AI scriptwriter
│   │   │   └── tts/                   # ElevenLabs & Azure TTS providers
│   │   ├── db.ts                      # MongoDB connection manager
│   │   └── index.ts                   # Express application entrypoint
│   ├── package.json                   # Server dependencies & scripts
│   └── tsconfig.json                  # Server TypeScript configuration
│
├── public/                            # Static public web assets
├── package.json                       # Root dependencies & orchestrator scripts
├── vite.config.ts                     # Vite build configuration
└── README.md                          # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI
- *(Optional)* **Google Gemini API Key**: For AI script generation
- *(Optional)* **ElevenLabs API Key**: For neural TTS voice synthesis

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/avi4rag/Orbit.git
cd orbit

# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env` inside `server/`:

```env
PORT=4000
JWT_SECRET=your_jwt_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Orbit
GEMINI_API_KEY=your_google_gemini_api_key
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
MICROSOFT_AZURE_API_KEY=your_azure_speech_key
```

### 3. Launch Development Environment

Run both client and server concurrently with a single command from the project root:

```bash
npm run dev
```

- **Frontend**: Runs at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).
- **Backend API**: Runs at `http://localhost:4000`.

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`email`, `password`, `name`).
- `POST /api/auth/login` — Authenticate and receive a JWT Bearer token.
- `GET /api/auth/me` — Retrieve the currently authenticated user profile.

### 📝 Onboarding & Concepts (`/api/onboarding`)
- `POST /api/onboarding/submit` — Submit 6 onboarding answers and receive 8 AI-generated personalized concepts.
- `GET /api/onboarding/latest` — Retrieve the most recently completed onboarding answers.
- `GET /api/onboarding/:id` — Retrieve specific onboarding session answers.

### 🎧 Sessions & Audio Generation (`/api/sessions`)
- `GET /api/sessions/catalog` — List available ambience tracks, voices, and frequency presets.
- `POST /api/sessions/analyze-intention` — Analyze user intention and suggest concepts.
- `POST /api/sessions` — Initialize audio generation pipeline:
  ```json
  {
    "concept": {
      "title": "Quantum Peak Flow",
      "targetOutcome": "Deep creative focus and momentum",
      "category": "Focus"
    },
    "answers": {
      "desiredOutcome": "Unshakable mental clarity",
      "desiredIdentity": "Disciplined and aligned creator",
      "emotionalState": "Focused and energized",
      "currentBlock": "Overthinking",
      "dailyAction": "Consistent creative output"
    },
    "settings": {
      "durationMinutes": 5,
      "usageContext": "focus",
      "ambienceTrackId": "rain-light",
      "frequencyHz": 432,
      "voiceId": "bella",
      "ttsProvider": "elevenlabs",
      "subliminalIntensity": "subtle"
    }
  }
  ```
- `GET /api/sessions/:id` — Poll generation status (`PENDING` ➔ `GENERATING_SCRIPT` ➔ `GENERATING_VOICE` ➔ `MIXING_AUDIO` ➔ `COMPLETED`).
- `GET /api/sessions` — List user's personalized sessions.

---

## ⚙️ Environment Variables

| Variable | Scope | Description | Default |
|---|---|---|---|
| `PORT` | Server | Express API listening port | `4000` |
| `MONGO_URI` | Server | MongoDB Atlas / Local connection string | `mongodb://localhost:27017/orbit` |
| `JWT_SECRET` | Server | Secret signing key for auth tokens | `orbit-secret-key-2026` |
| `GEMINI_API_KEY` | Server | Google Gemini API key for script generation | *Required for live AI generation* |
| `ELEVEN_LABS_API_KEY`| Server | ElevenLabs API key for neural voice synthesis | *Required for live ElevenLabs TTS* |
| `MICROSOFT_AZURE_API_KEY`| Server | Azure Cognitive Services Speech API Key | *Optional fallback TTS* |
| `VITE_API_URL` | Client | Backend API base URL for client requests | Direct / relative proxy |

---

## 🛠️ Build & Verification

```bash
# Build frontend bundle (TypeScript + Vite)
npm run build

# Build server distribution (TypeScript compiler)
npm run build:server

# Execute linter
npm run lint
```

---

## 🤝 Contributing

Contributions to Orbit are welcome! To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/CelestialEnhancement`)
3. Commit your Changes (`git commit -m 'feat: add binaural frequency visualizer'`)
4. Push to the Branch (`git push origin feature/CelestialEnhancement`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with cosmic precision by <a href="https://github.com/avi4rag">avi4rag</a> and the Orbit team.</sub>
</div>
