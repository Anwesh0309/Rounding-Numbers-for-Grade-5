// Audio Engine supporting ElevenLabs API TTS and Web Speech API fallback

const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_13c95dcde53c821510f9db98accf79e28754c524ab306a3d';

const audioCache = new Map();
let currentAudio = null;
let currentUtterance = null;
let isMuted = false;

export function setMuted(muted) {
  isMuted = muted;
  if (isMuted) {
    stopNarration();
  }
}

export function getMuted() {
  return isMuted;
}

export function stopNarration() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(text) {
  if (isMuted || !text) return;
  stopNarration();

  // Check audio cache
  if (audioCache.has(text)) {
    const audio = audioCache.get(text);
    currentAudio = audio;
    audio.currentTime = 0;
    audio.play().catch(() => fallbackWebSpeech(text));
    return;
  }

  // Try ElevenLabs API
  if (ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioCache.set(text, audio);
        currentAudio = audio;
        audio.play().catch(() => fallbackWebSpeech(text));
        return;
      }
    } catch (e) {
      console.warn('ElevenLabs API request failed, falling back to SpeechSynthesis', e);
    }
  }

  // Fallback to Web Speech API
  fallbackWebSpeech(text);
}

function fallbackWebSpeech(text) {
  if (!('speechSynthesis' in window) || isMuted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
