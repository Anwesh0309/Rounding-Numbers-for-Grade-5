import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const audioItems = [
  {
    filename: 'wonder-intro.mp3',
    text: 'A stadium says 48,732 people attended the match. The newspaper rounds it to the nearest thousand. What number will they print?'
  },
  {
    filename: 'story-slide-1.mp3',
    text: 'Leo\'s Marathon Count. Leo counted 3,482 runners crossing the marathon starting arch. He wants to quickly report about how many runners entered. How should Leo round 3,482 to the nearest 1,000?'
  },
  {
    filename: 'story-slide-2.mp3',
    text: 'Emma collected 48,732 dollars during the school fundraiser. What is 48,732 rounded to the nearest 10,000?'
  },
  {
    filename: 'story-slide-3.mp3',
    text: 'Alex\'s Stadium Spectacle. Alex attended a grand sports match with 68,472 cheering fans in the stadium. The big stadium screen estimated the crowd. What is 68,472 rounded to the nearest 1,000?'
  },
  {
    filename: 'story-slide-4.mp3',
    text: 'Maya\'s Lunar Rocket Expedition. Maya watched a rocket launch heading to the Moon, which is 384,400 kilometers away from Earth. What is 384,400 rounded to the nearest 100,000?'
  },
  {
    filename: 'simulate-station-1.mp3',
    text: 'Station 1: Number Line Zoom. Drag to find which round marker is closer.'
  },
  {
    filename: 'simulate-station-2.mp3',
    text: 'Station 2: Place Value Spotlight. Tap the decider digit that determines rounding.'
  },
  {
    filename: 'simulate-station-3.mp3',
    text: 'Station 3: Rounding Slider. Drag the slider and watch rounding update live.'
  },
  {
    filename: 'simulate-station-4.mp3',
    text: 'Station 4: Spot the Rounding Error. Tap the step that contains the deliberate mistake.'
  },
  {
    filename: 'reflect-intro.mp3',
    text: 'Congratulations! You have completed your Rounding Expedition! Reflect on what you learned today.'
  }
];

async function generate() {
  console.log('Generating pre-rendered audio files...');
  for (const item of audioItems) {
    const filePath = path.join(outputDir, item.filename);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(item.text)}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`Saved ${item.filename} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${item.filename}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`Error ${item.filename}:`, e);
    }
  }
  console.log('Finished generating audio files.');
}

generate();
