import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ambience track definition
export interface AmbienceTrack {
  id: string;
  name: string;
  category: 'rain' | 'noise' | 'space' | 'water';
  description: string;
  filePath?: string; // Path if static file
  relativeUrl: string;
  noiseType?: 'brown' | 'pink' | 'white'; // If synthesized
}

export interface FrequencyOption {
  hz: number;
  label: string;
  intent: string;
}

export const FREQUENCY_CATALOG: FrequencyOption[] = [
  { hz: 432, label: '432 Hz', intent: 'Deep grounding and natural calm' },
  { hz: 528, label: '528 Hz', intent: 'Focus, renewal, and centered clarity' },
  { hz: 396, label: '396 Hz', intent: 'Releasing mental static and tension' },
  { hz: 639, label: '639 Hz', intent: 'Openness, emotional warmth, and alignment' },
  { hz: 741, label: '741 Hz', intent: 'Creative flow and intuitive confidence' }
];

export function getAmbienceCatalog(): AmbienceTrack[] {
  const mediaRoot = path.resolve(__dirname, '../../media/ambience');

  return [
    {
      id: 'rain-light',
      name: 'Gentle Rain',
      category: 'rain',
      description: 'Soothing soft rain with delicate drops and gentle atmosphere.',
      filePath: path.join(mediaRoot, 'rain', 'light-rain-ambient.mp3'),
      relativeUrl: '/media/ambience/rain/light-rain-ambient.mp3'
    },
    {
      id: 'rain-window',
      name: 'Rain on the Window',
      category: 'rain',
      description: 'Intimate rainfall pattering against glass with warm resonance.',
      filePath: path.join(mediaRoot, 'rain', 'rain-on-the-window.mp3'),
      relativeUrl: '/media/ambience/rain/rain-on-the-window.mp3'
    },
    {
      id: 'rain-lluvia',
      name: 'Deep Forest Rain',
      category: 'rain',
      description: 'Rich, immersive rain showers providing continuous white-spectrum calm.',
      filePath: path.join(mediaRoot, 'rain', 'lluvia-rain.mp3'),
      relativeUrl: '/media/ambience/rain/lluvia-rain.mp3'
    },
    {
      id: 'noise-brown',
      name: 'Cosmic Brown Noise',
      category: 'noise',
      description: 'Low-frequency, warm rumble reminiscent of deep planetary space.',
      filePath: path.join(mediaRoot, 'noise', 'cosmic-brown-noise.mp3'),
      relativeUrl: '/media/ambience/noise/cosmic-brown-noise.mp3',
      noiseType: 'brown'
    },
    {
      id: 'noise-pink',
      name: 'Pink Flow',
      category: 'noise',
      description: 'Balanced, organic cascade mimicking a gentle ocean breeze.',
      filePath: path.join(mediaRoot, 'noise', 'pink-flow.mp3'),
      relativeUrl: '/media/ambience/noise/pink-flow.mp3',
      noiseType: 'pink'
    },
    {
      id: 'space-drone',
      name: 'Celestial Drone',
      category: 'space',
      description: 'Deep meditative harmonic chord in Solfeggio ratios for spiritual peace.',
      filePath: path.join(mediaRoot, 'space', 'celestial-drone.mp3'),
      relativeUrl: '/media/ambience/space/celestial-drone.mp3'
    },
    {
      id: 'water-waves',
      name: 'Ocean Waves',
      category: 'water',
      description: 'Rhythmic oceanic tides and surf providing natural breath entrainment.',
      filePath: path.join(mediaRoot, 'water', 'ocean-waves.mp3'),
      relativeUrl: '/media/ambience/water/ocean-waves.mp3'
    }
  ];
}

export function resolveAmbienceTrack(trackId?: string): AmbienceTrack {
  const catalog = getAmbienceCatalog();
  const track = catalog.find(t => t.id === trackId);
  if (track) return track;
  return catalog[0]; // Default to gentle rain
}
