// Audio Engine supporting ElevenLabs API TTS, Pre-rendered Local Audio, and Web Speech API Fallback

let isMuted = false;
let currentSpeechId = 0;
let currentAudio = null;
const audioCache = new Map();

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
  let apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_7ef27dccb32144843f8ee5068dfd4223a85326c56c14b00a';
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
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

export async function speakText(text, audioFileHint = null) {
  if (isMuted || !text) return;

  // STOP previous narration immediately to prevent audio overlap
  stopNarration();
  const activeSpeechId = currentSpeechId;

  // 1. Try playing pre-rendered local audio file from /audio/ directory
  let localFileName = null;
  if (audioFileHint) {
    localFileName = audioFileHint.endsWith('.mp3') ? audioFileHint : `${audioFileHint}.mp3`;
  }

  if (localFileName) {
    const localUrl = `/audio/${localFileName}`;
    try {
      const audio = new Audio(localUrl);
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return; // Played pre-rendered file successfully
      }
    } catch (e) {
      // If local file play fails, continue to ElevenLabs API or WebSpeech
    }
  }

  if (activeSpeechId !== currentSpeechId || isMuted) return;

  // 2. Check in-memory audio Cache for exact text
  if (audioCache.has(text)) {
    const audio = audioCache.get(text);
    audio.currentTime = 0;
    currentAudio = audio;
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
    };
    audio.play().catch(() => {
      if (activeSpeechId === currentSpeechId && !isMuted) {
        fallbackWebSpeech(text, activeSpeechId);
      }
    });
    return;
  }

  // 3. Try ElevenLabs API with current credentials
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
            fallbackWebSpeech(text, activeSpeechId);
          }
        });
        return;
      }
    } catch (e) {
      console.warn('[AudioEngine] ElevenLabs fetch error:', e);
    }
  }

  // 4. Final Fallback: Browser Web Speech API
  if (activeSpeechId === currentSpeechId && !isMuted) {
    fallbackWebSpeech(text, activeSpeechId);
  }
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
