// Audio Engine supporting ElevenLabs API TTS, Pre-rendered Local Audio, and Web Speech API Fallback

let isMuted = false;
let currentSpeechId = 0;
let currentAudio = null;
const audioCache = new Map();

// Sound effect cache
const sfxCache = new Map();

// Map text keys/hints to pre-rendered high-quality audio files in /audio/
const PRE_RENDERED_AUDIO_MAP = {
  'wonder': '/audio/wonder-intro.mp3',
  'story-1': '/audio/story-slide-1.mp3',
  'story-2': '/audio/story-slide-2.mp3',
  'story-3': '/audio/story-slide-3.mp3',
  'story-4': '/audio/story-slide-4.mp3',
  'simulate-1': '/audio/simulate-station-1.mp3',
  'simulate-2': '/audio/simulate-station-2.mp3',
  'simulate-3': '/audio/simulate-station-3.mp3',
  'simulate-4': '/audio/simulate-station-4.mp3',
  'reflect': '/audio/reflect-intro.mp3'
};

// Global user-gesture listener to unlock Web Audio & Speech synthesis policies
let isAudioUnlocked = false;
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
}

export function getMuted() {
  return isMuted;
}

export function setMuted(muted) {
  isMuted = muted;
  if (muted) {
    stopNarration();
  }
}

export function getElevenLabsCredentials() {
  let apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_13c95dcde53c821510f9db98accf79e28754c524ab306a3d';
  let voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';

  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('roundorama_elevenlabs_key');
    const savedVoice = localStorage.getItem('roundorama_elevenlabs_voice');
    if (savedKey) apiKey = savedKey;
    if (savedVoice) voiceId = savedVoice;
  }
  return { apiKey, voiceId };
}

export function setElevenLabsCredentials(apiKey, voiceId) {
  if (typeof window !== 'undefined') {
    if (apiKey) localStorage.setItem('roundorama_elevenlabs_key', apiKey.trim());
    if (voiceId) localStorage.setItem('roundorama_elevenlabs_voice', voiceId.trim());
  }
}

export async function testElevenLabsConnection(customApiKey, customVoiceId) {
  const { apiKey, voiceId } = getElevenLabsCredentials();
  const testKey = customApiKey !== undefined ? customApiKey : apiKey;
  const testVoice = customVoiceId !== undefined ? customVoiceId : voiceId;

  if (!testKey || !testVoice) {
    return { ok: false, error: 'Missing API Key or Voice ID' };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${testVoice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': testKey
      },
      body: JSON.stringify({
        text: 'Audio test successful.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      return { ok: true, audioUrl: URL.createObjectURL(blob) };
    } else {
      const text = await response.text().catch(() => '');
      let jsonMsg = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.detail && parsed.detail.message) jsonMsg = parsed.detail.message;
      } catch (e) {}
      return { ok: false, status: response.status, error: jsonMsg || `HTTP ${response.status}` };
    }
  } catch (err) {
    return { ok: false, error: err.message || 'Network error connecting to ElevenLabs API' };
  }
}

export function stopNarration() {
  currentSpeechId++;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore pause error
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(text, audioFileHint = null) {
  if (isMuted || !text) return;

  stopNarration();
  const activeSpeechId = currentSpeechId;

  // 1. Check in-memory audio Cache for exact text
  if (audioCache.has(text)) {
    if (activeSpeechId !== currentSpeechId || isMuted) return;
    const audio = audioCache.get(text);
    audio.currentTime = 0;
    currentAudio = audio;
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
    };
    audio.play().catch(() => {
      if (activeSpeechId === currentSpeechId && !isMuted) {
        fallbackAudio(text, audioFileHint, activeSpeechId);
      }
    });
    return;
  }

  // 2. Try ElevenLabs API with current credentials
  const { apiKey, voiceId } = getElevenLabsCredentials();

  if (apiKey && voiceId) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
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

      if (activeSpeechId !== currentSpeechId || isMuted) return;

      if (response.ok) {
        const blob = await response.blob();
        if (activeSpeechId !== currentSpeechId || isMuted) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioCache.set(text, audio);

        currentAudio = audio;
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
        };
        audio.play().catch(() => {
          if (activeSpeechId === currentSpeechId && !isMuted) {
            fallbackAudio(text, audioFileHint, activeSpeechId);
          }
        });
        return;
      } else {
        const errDetail = await response.text().catch(() => '');
        console.warn(`[AudioEngine] ElevenLabs API HTTP ${response.status}: ${errDetail}. Falling back to pre-rendered audio / Web Speech API.`);
      }
    } catch (e) {
      console.warn('[AudioEngine] ElevenLabs fetch error:', e);
    }
  }

  // 3. Fallback to Pre-rendered Audio file or Web Speech API
  if (activeSpeechId === currentSpeechId && !isMuted) {
    fallbackAudio(text, audioFileHint, activeSpeechId);
  }
}

function fallbackAudio(text, audioFileHint, speechId) {
  if (speechId !== undefined && speechId !== currentSpeechId) return;

  // Try pre-rendered local audio clip matching hint or text match
  let preRenderedUrl = null;
  if (audioFileHint && PRE_RENDERED_AUDIO_MAP[audioFileHint]) {
    preRenderedUrl = PRE_RENDERED_AUDIO_MAP[audioFileHint];
  } else {
    // Check if text matches any key in PRE_RENDERED_AUDIO_MAP
    if (text.includes('48,732 people attended') || text.includes('newspaper rounds')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['wonder'];
    else if (text.includes('Leo') || text.includes('3,482')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['story-1'];
    else if (text.includes('Emma') || text.includes('48,732')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['story-2'];
    else if (text.includes('Alex') || text.includes('68,472')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['story-3'];
    else if (text.includes('Maya') || text.includes('384,400')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['story-4'];
    else if (text.includes('Station 1')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['simulate-1'];
    else if (text.includes('Station 2')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['simulate-2'];
    else if (text.includes('Station 3')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['simulate-3'];
    else if (text.includes('Station 4')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['simulate-4'];
    else if (text.includes('Reflect') || text.includes('Expedition')) preRenderedUrl = PRE_RENDERED_AUDIO_MAP['reflect'];
  }

  if (preRenderedUrl) {
    try {
      const audio = new Audio(preRenderedUrl);
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
      };
      audio.play().then(() => {
        return;
      }).catch(() => {
        fallbackWebSpeech(text, speechId);
      });
      return;
    } catch (e) {
      // ignore audio play error
    }
  }

  // Final fallback: Browser Web Speech API
  fallbackWebSpeech(text, speechId);
}

function fallbackWebSpeech(text, speechId) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return;
  if (speechId !== undefined && speechId !== currentSpeechId) return;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    const findBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      return voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online')) && (v.name.includes('Jenny') || v.name.includes('Ava') || v.name.includes('Aria') || v.name.includes('Ana') || v.name.includes('Emma')))
        || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English') || v.name.includes('Google UK English Female')))
        || voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.includes('Female')))
        || voices.find(v => v.lang.startsWith('en'));
    };

    const voice = findBestVoice();
    if (voice) {
      utterance.voice = voice;
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        const newlyLoadedVoice = findBestVoice();
        if (newlyLoadedVoice) utterance.voice = newlyLoadedVoice;
      };
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[AudioEngine] Web Speech API error:', e);
  }
}
