import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '..', 'public', 'audio');
const questionsPath = path.join(__dirname, '..', 'src', 'data', 'questions.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const API_KEY = 'sk_7ef27dccb32144843f8ee5068dfd4223a85326c56c14b00a';
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

function numberToWords(num) {
  if (num === 0) return 'zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 
                'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convertChunk(n) {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return (convertChunk(millions) + ' million ' + (remainder ? numberToWords(remainder) : '')).trim();
  }
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (convertChunk(thousands) + ' thousand ' + (remainder ? convertChunk(remainder) : '')).trim();
  }
  return convertChunk(num);
}

function normalizeTextForTTS(text) {
  if (!text) return '';
  return text.replace(/\b\d{1,3}(,\d{3})+\b|\b\d+\b/g, (match) => {
    const n = parseInt(match.replace(/,/g, ''), 10);
    if (!isNaN(n)) {
      return numberToWords(n);
    }
    return match;
  });
}

// 1. Static Phase items
const staticItems = [
  {
    filename: 'wonder-intro.mp3',
    text: 'A stadium says 48,732 people attended the match. The newspaper rounds it to the nearest thousand. What number will they print?'
  },
  {
    filename: 'story-slide-1.mp3',
    text: 'Leo\'s Marathon Count. Leo counted 3,482 runners crossing the marathon starting arch. He wants to report about how many runners entered. How should Leo round 3,482 to the nearest 1,000?'
  },
  {
    filename: 'story-slide-2.mp3',
    text: 'Emma collected 48,732 dollars during the school fundraiser. What is 48,732 rounded to the nearest 10,000?'
  },
  {
    filename: 'story-slide-3.mp3',
    text: 'Alex\'s Stadium Spectacle. Alex attended a grand sports match with 68,472 cheering fans in the stadium. What is 68,472 rounded to the nearest 1,000?'
  },
  {
    filename: 'story-slide-4.mp3',
    text: 'Maya\'s Lunar Rocket Expedition. Maya watched a rocket launch heading to the Moon, which is 384,400 kilometers away from Earth. What is 384,400 rounded to the nearest 100,000?'
  },
  {
    filename: 'simulate-station-1.mp3',
    text: 'Section A: Number Line Zoom. Drag to find which round marker is closer.'
  },
  {
    filename: 'simulate-station-2.mp3',
    text: 'Section B: Place Value Spotlight. Tap the decider digit that determines rounding.'
  },
  {
    filename: 'simulate-station-3.mp3',
    text: 'Section C: Rounding Slider. Select the correct rounded number.'
  },
  {
    filename: 'simulate-station-4.mp3',
    text: 'Section D: Spot the Rounding Error. Tap the step that contains the deliberate mistake.'
  },
  {
    filename: 'reflect-intro.mp3',
    text: 'Congratulations! You have completed your Rounding Expedition! Reflect on what you learned today.'
  }
];

// 2. Load questions for Play Phase (100 questions + 100 hints)
const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

const playItems = [];
for (const q of questionsData) {
  playItems.push({
    filename: `play-${q.id}.mp3`,
    text: q.question
  });
  playItems.push({
    filename: `play-${q.id}-hint.mp3`,
    text: `Hint: ${q.explanation || 'Look at the decider digit right next door!'}`
  });
}

const allItems = [...staticItems, ...playItems];

async function generateSingle(item) {
  const filePath = path.join(outputDir, item.filename);

  // Normalize numbers to spelled-out English words for perfect pronunciation
  const phoneticText = normalizeTextForTTS(item.text);

  // Try ElevenLabs API
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: phoneticText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[ElevenLabs Perfect Pronunciation OK] ${item.filename} (${buffer.byteLength} bytes)`);
      return true;
    } else {
      const errText = await res.text().catch(() => '');
      console.warn(`[ElevenLabs HTTP ${res.status}] ${errText} -> Falling back to TTS for ${item.filename}`);
    }
  } catch (e) {
    console.warn(`[ElevenLabs Error] ${e.message} for ${item.filename}`);
  }

  // Fallback to Google TTS if ElevenLabs rate limits
  try {
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(phoneticText)}`;
    const res = await fetch(fallbackUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[Fallback TTS OK] ${item.filename} (${buffer.byteLength} bytes)`);
      return true;
    }
  } catch (e) {
    console.error(`[Fallback Failed] ${item.filename}:`, e);
  }

  return false;
}

async function run() {
  console.log(`Starting Perfect-Pronunciation Audio Generation for ${allItems.length} files...`);
  let successCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const success = await generateSingle(item);
    if (success) successCount++;

    // 200ms delay for rate limits
    await new Promise(r => setTimeout(r, 200));

    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1} / ${allItems.length} audio files re-generated.`);
    }
  }

  console.log(`Finished audio generation. Total successfully processed: ${successCount} / ${allItems.length}`);
}

run();
