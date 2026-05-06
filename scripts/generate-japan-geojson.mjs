#!/usr/bin/env node
/**
 * Download a public-domain GeoJSON of Japan's 47 prefectures and ship
 * it as a single static asset. The runtime never calls anything
 * external — once this script has run, /public/atlas/japan.geojson
 * sits on your CDN and you own it.
 *
 * Source: https://github.com/dataofjapan/land
 *   License: CC0 1.0 Universal (public domain dedication)
 *   Coverage: 47 prefectures with English + Japanese names
 *
 * Usage: node scripts/generate-japan-geojson.mjs
 *
 * Output: public/atlas/japan.geojson
 *
 * The data is dense (~3-4 MB raw). We pass it through a Douglas-
 * Peucker-style simplifier to drop colinear points, which cuts the
 * file ~3× without affecting the silhouette read.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson';
const OUT = path.resolve('public/atlas/japan.geojson');
const SIMPLIFY_TOLERANCE = 0.012; // degrees lat/lng — preserves coastline shape, drops noise

async function main() {
  console.log(`Fetching ${SRC} …`);
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`source returned ${res.status}`);
  const raw = await res.json();
  console.log(`  features: ${raw.features.length}`);

  let beforeTotal = 0;
  let afterTotal = 0;

  // Simplify each feature in place.
  for (const f of raw.features) {
    const before = countCoords(f.geometry);
    f.geometry = simplifyGeometry(f.geometry, SIMPLIFY_TOLERANCE);
    const after = countCoords(f.geometry);
    beforeTotal += before;
    afterTotal += after;
  }
  console.log(
    `  coords: ${beforeTotal.toLocaleString()} → ${afterTotal.toLocaleString()}` +
      ` (${((afterTotal / beforeTotal) * 100).toFixed(1)}%)`
  );

  // Strip every prefecture down to the fields the renderer actually
  // uses, so the shipped file is as small as possible.
  for (const f of raw.features) {
    f.properties = {
      // dataofjapan/land uses these property names
      name: f.properties.nam ?? f.properties.name,
      nameJa: f.properties.nam_ja ?? f.properties.name_ja,
      id: f.properties.id,
    };
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(raw));
  const fs = await import('node:fs/promises');
  const stat = await fs.stat(OUT);
  console.log(`✔ wrote ${OUT} (${(stat.size / 1024).toFixed(0)} KB)`);
  console.log(`  47 prefectures, ${afterTotal.toLocaleString()} coordinates`);
  console.log(`  attribution: dataofjapan/land — CC0 1.0 Universal`);
}

// ---------- helpers ----------

function countCoords(geom) {
  let n = 0;
  walk(geom.coordinates, (pt) => {
    if (typeof pt[0] === 'number') n++;
  });
  return n;
}

function walk(arr, fn) {
  if (!Array.isArray(arr)) return;
  if (typeof arr[0] === 'number') {
    fn(arr);
  } else {
    for (const x of arr) walk(x, fn);
  }
}

/**
 * Apply Douglas-Peucker to every linear ring inside Polygon /
 * MultiPolygon geometries. Other geometry types pass through.
 */
function simplifyGeometry(geom, tol) {
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: geom.coordinates.map((ring) => simplifyRing(ring, tol)) };
  }
  if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map((poly) =>
        poly.map((ring) => simplifyRing(ring, tol))
      ),
    };
  }
  return geom;
}

function simplifyRing(points, tol) {
  if (points.length < 4) return points;
  const closed =
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1];
  const inner = closed ? points.slice(0, -1) : points;
  const simplified = douglasPeucker(inner, tol);
  if (simplified.length < 3) return points; // keep the ring valid
  return closed ? [...simplified, simplified[0]] : simplified;
}

function douglasPeucker(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0;
  let idx = 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], a, b);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > tol) {
    const left = douglasPeucker(pts.slice(0, idx + 1), tol);
    const right = douglasPeucker(pts.slice(idx), tol);
    return [...left.slice(0, -1), ...right];
  }
  return [a, b];
}

function perpDist([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const px = x1 + Math.max(0, Math.min(1, t)) * dx;
  const py = y1 + Math.max(0, Math.min(1, t)) * dy;
  return Math.hypot(x - px, y - py);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
