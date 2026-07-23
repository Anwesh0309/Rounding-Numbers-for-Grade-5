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

  // Skip if already exists and is non-empty (> 2KB)
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 2000) {
    return true;
  }

  // Try ElevenLabs API
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: item.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[ElevenLabs OK] ${item.filename} (${buffer.byteLength} bytes)`);
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
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(item.text)}`;
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
  console.log(`Starting ElevenLabs audio generation for ${allItems.length} files...`);
  let successCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const success = await generateSingle(item);
    if (success) successCount++;

    // Small delay to prevent rate limits
    await new Promise(r => setTimeout(r, 200));

    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1} / ${allItems.length} audio files processed.`);
    }
  }

  console.log(`Finished audio generation. Total successfully processed: ${successCount} / ${allItems.length}`);
}

run();
