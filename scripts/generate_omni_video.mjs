import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VIDEO_DIR = path.join(ROOT, 'assets', 'video');
const FRAMES_DIR = path.join(ROOT, 'assets', 'frames');
const PART1_PATH = path.join(VIDEO_DIR, 'omni_part1_15s.mp4');
const FINAL_VIDEO_PATH = path.join(VIDEO_DIR, 'background_omni.mp4');

const TARGET_FRAMES = 331; // 11 scrolls x 30 frames + initial frame 0

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is not set.');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiVersion: 'v1beta',
  httpOptions: {
    apiVersion: 'v1beta',
    timeout: 900_000
  }
});

async function waitAndDownload(interaction, outPath) {
  const videoOut = interaction?.output_video;
  if (!videoOut) {
    throw new Error('No output_video returned in interaction response.');
  }

  if (videoOut.data) {
    fs.writeFileSync(outPath, Buffer.from(videoOut.data, 'base64'));
    console.log(`Saved inline video to ${outPath}`);
    return;
  }

  if (!videoOut.uri) {
    throw new Error('output_video has neither data nor uri.');
  }

  const match = videoOut.uri.match(/files\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new Error(`Could not extract file id from URI.`);
  }
  const fileName = `files/${match[1]}`;
  console.log(`Polling ${fileName} until ACTIVE...`);

  for (let i = 0; i < 90; i++) {
    const info = await ai.files.get({ name: fileName });
    if (info.state === 'ACTIVE') break;
    if (info.state === 'FAILED') throw new Error(`File processing failed for ${fileName}`);
    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log(`Downloading ${fileName} -> ${outPath}...`);
  await ai.files.download({
    file: fileName,
    downloadPath: outPath
  });
  console.log(`Saved video to ${outPath}`);
}

function probeDuration(videoPath) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    videoPath
  ], { encoding: 'utf8' }).trim();
  return parseFloat(out);
}

function extractFrames(videoPath) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  for (const f of fs.readdirSync(FRAMES_DIR)) {
    fs.unlinkSync(path.join(FRAMES_DIR, f));
  }

  const duration = probeDuration(videoPath);
  const fps = ((TARGET_FRAMES - 0.5) / duration).toFixed(4);
  console.log(`Video duration: ${duration.toFixed(2)}s -> extracting ~${TARGET_FRAMES} WebP frames at ${fps} fps...`);

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', videoPath,
    '-vf', `fps=${fps},scale=1280:720:flags=lanczos`,
    '-frames:v', String(TARGET_FRAMES),
    '-c:v', 'libwebp',
    '-quality', '82',
    '-compression_level', '4',
    path.join(FRAMES_DIR, 'frame_%04d.webp')
  ]);

  const files = fs.readdirSync(FRAMES_DIR).filter((f) => f.endsWith('.webp')).sort();
  const totalMB = (
    files.reduce((sum, f) => sum + fs.statSync(path.join(FRAMES_DIR, f)).size, 0) / (1024 * 1024)
  ).toFixed(2);
  console.log(`Extracted ${files.length} WebP frames (${totalMB} MB total).`);
  return files.length;
}

async function main() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const promptPart1 =
    'Single unbroken continuous cinematic camera flight with no scene cuts, ultra-clean dark obsidian futuristic cybersecurity 3D aesthetic, deep midnight-navy background, volumetric neon rim lighting, no text, no words, no letters, no logos, no dialogue, calm minimal electronic ambient hum. ' +
    '[0-5s] The camera glides smoothly forward through deep midnight-blue volumetric space toward a luminous holographic crystalline Wi-Fi broadcast core emitting concentric translucent cyan radio-frequency wave rings connecting sleek floating glass laptops and smartphones. ' +
    '[5-10s] Continuing smoothly forward in one unbroken shot, the camera enters a dark translucent glass network corridor where warm amber hairline fractures glow across a hexagonal security shield and unencrypted golden light-cubes stream openly past dark metallic server monoliths. ' +
    '[10-15s] Continuing seamlessly with no cuts, the atmosphere shifts to dramatic crimson and magenta as the camera glides between twin glowing wireless towers—one calm cyan legitimate spire and one pulsing red rogue tower—with a sharp faceted crimson prism siphoning luminous data streams mid-air while swirling red light trails orbit a strained hexagonal router core.';

  console.log('Step 1/2: Generating 15s base video with gemini-omni-1.2-flash (720p, 16:9)...');
  const t1 = Date.now();
  const interaction1 = await ai.interactions.create({
    model: 'gemini-omni-1.2-flash',
    input: promptPart1,
    response_format: {
      type: 'video',
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '15s',
      delivery: 'uri'
    }
  });
  console.log(`Turn 1 complete in ${((Date.now() - t1) / 1000).toFixed(1)}s | Interaction ID: ${interaction1.id}`);
  await waitAndDownload(interaction1, PART1_PATH);

  const promptPart2 =
    'Extend this video in one continuous unbroken cinematic camera flight with no scene cuts, no text, no words, no letters, no logos, no dialogue. ' +
    '[0-5s] The camera glides smoothly out of the crimson threat zone and flies through four ascending glowing holographic cryptographic portal arches transitioning smoothly from warm amber to electric blue to radiant emerald green, revealing rotating emerald hexagonal firewall barriers isolating three illuminated glass network islands floating in dark obsidian space. ' +
    '[5-10s] The camera smoothly rises and glides over a minimalist dark-glass futuristic corporate and university campus skyline bridged by cyan and emerald light arcs sheltered beneath a translucent glowing geodesic energy dome, ending in a serene orbital pull-back around a harmonious armored crystalline sphere encircled by soft cyan, emerald, and subtle gold light halos floating in deep midnight space.';

  console.log('Step 2/2: Extending video by +10s (25s total) using previous_interaction_id...');
  const t2 = Date.now();
  let finalPath = PART1_PATH;
  try {
    const interaction2 = await ai.interactions.create({
      model: 'gemini-omni-1.2-flash',
      previous_interaction_id: interaction1.id,
      input: promptPart2,
      response_format: {
        type: 'video',
        aspect_ratio: '16:9',
        resolution: '720p',
        duration: '10s',
        delivery: 'uri'
      }
    });
    console.log(`Turn 2 complete in ${((Date.now() - t2) / 1000).toFixed(1)}s | Interaction ID: ${interaction2.id}`);
    await waitAndDownload(interaction2, FINAL_VIDEO_PATH);
    finalPath = FINAL_VIDEO_PATH;
    // Remove intermediate part1 clip to keep repo clean & under GitHub size limits
    if (fs.existsSync(PART1_PATH)) fs.unlinkSync(PART1_PATH);
  } catch (err) {
    console.warn('Extension turn failed, falling back to 15s OmniFlash base clip:', err?.message || err);
    fs.copyFileSync(PART1_PATH, FINAL_VIDEO_PATH);
    if (fs.existsSync(PART1_PATH)) fs.unlinkSync(PART1_PATH);
    finalPath = FINAL_VIDEO_PATH;
  }

  const videoMB = (fs.statSync(finalPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Final OmniFlash video ready: ${finalPath} (${videoMB} MB)`);

  const frameCount = extractFrames(finalPath);
  console.log(`ALL DONE! Total extracted frames: ${frameCount}`);
}

main().catch((err) => {
  console.error('OMNIFLASH GENERATION ERROR:', err?.message || err);
  process.exit(1);
});
