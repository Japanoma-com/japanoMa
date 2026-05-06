#!/usr/bin/env node
/**
 * Bulk-generate area hero images via Google Imagen 4.
 *
 * Usage:
 *   export GEMINI_API_KEY=...
 *   node scripts/generate-area-images.mjs                  # all 33, ultra model
 *   node scripts/generate-area-images.mjs --slug iiyama    # single area (dry test)
 *   node scripts/generate-area-images.mjs --model standard # cheaper, ~$1.30 total
 *   node scripts/generate-area-images.mjs --force          # overwrite existing
 *
 * Reads:  docs/area-image-prompts.md
 * Writes: public/areas/<slug>.avif (1600x900)
 *         public/areas/update-hero-images.sql
 */
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROMPT_FILE = path.join(ROOT, 'docs/area-image-prompts.md');
const OUT_DIR = path.join(ROOT, 'public/areas');

const { values } = parseArgs({
  options: {
    slug: { type: 'string' },
    model: { type: 'string', default: 'ultra' },
    force: { type: 'boolean', default: false },
  },
});

const MODEL_ID =
  values.model === 'standard'
    ? 'imagen-4.0-generate-001'
    : 'imagen-4.0-ultra-generate-001';

function parsePrompts(md) {
  const houseMatch = md.match(/## House style[\s\S]*?```\n([\s\S]*?)```/);
  if (!houseMatch) throw new Error('Could not find house style block in prompt file');
  const house = houseMatch[1].trim();

  const negMatch = md.match(/\*\*Negative prompt[^*]*\*\*\s*\n`([^`]+)`/);
  const negativePrompt = negMatch ? negMatch[1].trim() : '';

  const areas = [];
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].match(/^###\s+\d+\.\s+(.+?)\s+—\s+`([^`]+)`\s*$/);
    if (!header) continue;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].startsWith('##')) break;
      const prompt = lines[j].match(/^>\s+(.+)$/);
      if (prompt) {
        areas.push({
          name: header[1].trim(),
          slug: header[2].trim(),
          prompt: prompt[1].trim(),
        });
        break;
      }
    }
  }
  return { house, negativePrompt, areas };
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(ai, area, house, negativePrompt) {
  const fullPrompt = `${area.prompt}\n\n${house}`;
  const response = await ai.models.generateImages({
    model: MODEL_ID,
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
      imageSize: '2K',
      personGeneration: 'dont_allow',
      outputMimeType: 'image/png',
    },
  });

  const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
  if (!b64) {
    const rai = response?.generatedImages?.[0]?.raiFilteredReason;
    throw new Error(rai ? `blocked: ${rai}` : 'no image bytes in response');
  }
  return Buffer.from(b64, 'base64');
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Set GEMINI_API_KEY first (https://aistudio.google.com/apikey)');
    process.exit(1);
  }

  const md = await readFile(PROMPT_FILE, 'utf8');
  const { house, negativePrompt, areas } = parsePrompts(md);
  console.log(`Parsed ${areas.length} areas from ${path.relative(ROOT, PROMPT_FILE)}`);
  console.log(`Model:  ${MODEL_ID}  (imageSize=2K, aspectRatio=16:9)`);
  console.log(`Negative prompt: ${negativePrompt ? 'loaded' : 'none'}`);

  await mkdir(OUT_DIR, { recursive: true });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const targets = values.slug ? areas.filter((a) => a.slug === values.slug) : areas;

  if (values.slug && !targets.length) {
    console.error(`No area matches --slug="${values.slug}"`);
    process.exit(1);
  }

  const results = [];
  for (let i = 0; i < targets.length; i++) {
    const area = targets[i];
    const outPath = path.join(OUT_DIR, `${area.slug}.avif`);
    const tag = `[${i + 1}/${targets.length}] ${area.slug}`;

    if (!values.force && (await fileExists(outPath))) {
      console.log(`${tag} — skip (exists, use --force to overwrite)`);
      results.push({ ...area, status: 'skipped' });
      continue;
    }

    process.stdout.write(`${tag} — generating... `);
    try {
      const png = await generateOne(ai, area, house, negativePrompt);
      await sharp(png)
        .resize(2400, 1350, { fit: 'cover', withoutEnlargement: false })
        .avif({ quality: 72, effort: 6 })
        .toFile(outPath);
      console.log(`ok (${path.relative(ROOT, outPath)})`);
      results.push({ ...area, status: 'ok' });
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      results.push({ ...area, status: 'failed', error: err.message });
    }

    if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 1000));
  }

  const ok = results.filter((r) => r.status === 'ok');
  const skipped = results.filter((r) => r.status === 'skipped');
  const failed = results.filter((r) => r.status === 'failed');
  console.log('');
  console.log(`Done. ok=${ok.length} skipped=${skipped.length} failed=${failed.length}`);
  if (failed.length) {
    for (const r of failed) console.log(`  - ${r.slug}: ${r.error}`);
  }

  const successful = [...ok, ...skipped];
  if (successful.length) {
    const sqlPath = path.join(OUT_DIR, 'update-hero-images.sql');
    const slugList = successful.map((r) => `'${r.slug}'`).join(', ');
    const sql = `-- Generated ${new Date().toISOString()}\nUPDATE cities\nSET hero_image_path = '/areas/' || slug || '.avif'\nWHERE slug IN (${slugList});\n`;
    await writeFile(sqlPath, sql);
    console.log(`SQL: ${path.relative(ROOT, sqlPath)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
