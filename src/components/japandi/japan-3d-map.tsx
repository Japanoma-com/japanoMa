'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { formatPriceFromJpy } from '@/lib/format/price';
import {
  AuOrigin,
  formatFlightTime,
  originLabel,
  pickTimeForOrigin,
} from '@/lib/format/origin';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { blurFor } from '@/data/area-blurs';
import { InfoTip } from './info-tip';
import { JaCopyChip } from './ja-copy-chip';

/**
 * Japan 3D Map — extruded vector silhouette of all 47 prefectures,
 * styled as a paper cutout / wooden block on a soft gray surface.
 *
 * Inspired by the editorial reference shared in design review (Apr
 * 2026): white prefectures with one region painted in the brand
 * accent. We use indigo (the existing Japandi accent) instead of
 * red so it sits inside the rest of the design language.
 *
 * Stack — fully owned, no third-party services at runtime:
 *   - three / @react-three/fiber / @react-three/drei (MIT)
 *   - public/atlas/japan.geojson (CC0 — dataofjapan/land)
 *
 * Geometry: each prefecture polygon ring becomes a THREE.Shape;
 * MultiPolygons (Hokkaido + small islands, Tokyo + Izu, etc.) are
 * extruded as a group. Coastline interior rings are added as Shape
 * holes so e.g. Lake Biwa shows through correctly.
 *
 * Camera is locked to a single isometric view — the silhouette only
 * reads at this angle, so user orbit is intentionally disabled.
 * A 4° idle drift on the group keeps it feeling alive.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MapCity = {
  citySlug: string;
  cityName: string;
  cityNameJa: string | null;
  regionType: string | null;
  prefectureSlug: string;
  prefectureName: string;
  prefectureNameJa: string | null;
  avgPropertyPriceJpy: number | null;
  offSeasonActivitiesScore: number | null;
  timeFromSydney: string | null;
  timeFromMelbourne: string | null;
  timeFromBrisbane: string | null;
  timeFromPerth: string | null;
  timeFromAdelaide: string | null;
  notes: string | null;
  heroImagePath?: string | null;
};

type Coord = [number, number]; // [lng, lat]
type Ring = Coord[];
type Polygon = Ring[];          // [outer, ...holes]
type MultiPolygon = Polygon[];

type GeoFeature = {
  type: 'Feature';
  properties: { name: string; nameJa: string; id: number };
  geometry:
    | { type: 'Polygon'; coordinates: Polygon }
    | { type: 'MultiPolygon'; coordinates: MultiPolygon };
};

type GeoCollection = { type: 'FeatureCollection'; features: GeoFeature[] };

// ---------------------------------------------------------------------------
// Slug normalisation — match GeoJSON `properties.name` ("Aomori Ken")
// to our DB prefecture slugs ("aomori"). Hokkaido is the only entry
// that legitimately keeps its suffix as part of the name.
// ---------------------------------------------------------------------------

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ (ken|fu|to)$/, '') // drop type suffix
    .replace(/ /g, '');           // "Hokkai Do" → "hokkaido"
}

// ---------------------------------------------------------------------------
// Latitude references — for the "same latitude as ___" badge in the panel.
// Hand-picked global cities that anchor each Japanese prefecture's lat for
// non-Japanese readers. AU buyers especially benefit since most of Japan's
// snow country sits *north* of Sydney (-33.9°) by 70°+ latitude — that's
// what makes it cold enough to ski.
// ---------------------------------------------------------------------------

const PREFECTURE_LATITUDE_REF: Record<
  string,
  { lat: number; cities: string }
> = {
  hokkaido:  { lat: 43.5, cities: 'Marseille · Boston · Toronto' },
  aomori:    { lat: 40.8, cities: 'Madrid · New York · Beijing' },
  iwate:     { lat: 39.7, cities: 'Lisbon · Washington DC · Seoul' },
  akita:     { lat: 39.7, cities: 'Lisbon · Washington DC · Seoul' },
  miyagi:    { lat: 38.3, cities: 'Athens · San Francisco' },
  yamagata:  { lat: 38.3, cities: 'Athens · San Francisco' },
  fukushima: { lat: 37.4, cities: 'Athens · Seoul · San Francisco' },
  niigata:   { lat: 37.4, cities: 'Athens · San Francisco · Lisbon' },
  tochigi:   { lat: 36.7, cities: 'Athens · Seoul · Las Vegas' },
  gunma:     { lat: 36.4, cities: 'Athens · Las Vegas · Seoul' },
  nagano:    { lat: 36.2, cities: 'Athens · Las Vegas · Lisbon' },
};

// ---------------------------------------------------------------------------
// Projection — equirectangular tuned so Honshu reads top-to-bottom in
// frame. Lat scale is slightly larger than lng scale because Japan at
// this latitude has lat:lng ≈ 1.27:1; we tune to 1.2:1 for visual
// compactness. The whole country including Hokkaido + Kyushu fits in
// ~14 world units, with the camera placed accordingly.
// ---------------------------------------------------------------------------

const CENTER_LNG = 137.5;
const CENTER_LAT = 38.5;
const LNG_SCALE = 0.42;
const LAT_SCALE = 0.50;

/**
 * WGS84 [lng, lat] → 2D scene plane.
 * Positive lat offset: northern prefectures end up at +Y in 2D, which
 * after `rotateFlat` lands at –Z (far from camera) and therefore at
 * the TOP of the rendered frame. North-up, south-down — per Kaz's
 * 25 Apr request that Hokkaidō anchor the top.
 */
function project([lng, lat]: Coord): [number, number] {
  return [(lng - CENTER_LNG) * LNG_SCALE, (lat - CENTER_LAT) * LAT_SCALE];
}

// ---------------------------------------------------------------------------
// Ring area — used to drop tiny offshore islands (Ogasawara, Iki,
// micro-islets) that on the silhouette read as vertical shards rather
// than landmasses. A polygon ring under ~0.025 sq world units gets
// skipped entirely.
// ---------------------------------------------------------------------------

const MIN_RING_AREA = 0.025;

function ringArea(ring: Coord[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = project(ring[j]);
    const [x2, y2] = project(ring[i]);
    a += (x1 + x2) * (y2 - y1);
  }
  return Math.abs(a / 2);
}

// ---------------------------------------------------------------------------
// Build ExtrudeGeometry for one prefecture.
// ---------------------------------------------------------------------------

const EXTRUDE_DEPTH = 0.32;
const EXTRUDE_DEPTH_DIM = 0.20;

function geometryFromFeature(feature: GeoFeature, depth: number): THREE.BufferGeometry | null {
  const polygons: Polygon[] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  const geoms: THREE.ExtrudeGeometry[] = [];
  for (const poly of polygons) {
    if (poly.length === 0) continue;
    const [outer, ...holes] = poly;
    // Skip micro-islands so the silhouette doesn't acquire random
    // tower-shards far from the mainland.
    if (ringArea(outer) < MIN_RING_AREA) continue;
    const shape = new THREE.Shape();
    const [ox, oy] = project(outer[0]);
    shape.moveTo(ox, oy);
    for (let i = 1; i < outer.length; i++) {
      const [x, y] = project(outer[i]);
      shape.lineTo(x, y);
    }
    for (const hole of holes) {
      if (hole.length < 3) continue;
      const path = new THREE.Path();
      const [hx, hy] = project(hole[0]);
      path.moveTo(hx, hy);
      for (let i = 1; i < hole.length; i++) {
        const [x, y] = project(hole[i]);
        path.lineTo(x, y);
      }
      shape.holes.push(path);
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 1,
    });
    geoms.push(g);
  }
  if (geoms.length === 0) return null;
  // Merge multi-polygon prefectures into a single buffer geometry so
  // each prefecture is one mesh — keeps the scene draw-call count low.
  if (geoms.length === 1) {
    return rotateFlat(geoms[0]);
  }
  const merged = mergeBufferGeometries(geoms);
  geoms.forEach((g) => g.dispose());
  return rotateFlat(merged);
}

/**
 * Rotate the extruded shape so it lies flat on the XZ plane (Y up).
 * ExtrudeGeometry extrudes along +Z; we want it along +Y.
 */
function rotateFlat(g: THREE.BufferGeometry): THREE.BufferGeometry {
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * Minimal BufferGeometryUtils.mergeBufferGeometries — three has this
 * in the addons but importing it pulls a chain we don't need. Hand-
 * roll: it only has to handle position + index for our Extrude meshes.
 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;
  for (const g of geometries) {
    const pos = g.getAttribute('position');
    if (!pos) continue;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
    const idx = g.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + vertexOffset);
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(i + vertexOffset);
    }
    vertexOffset += pos.count;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

// ---------------------------------------------------------------------------
// Prefecture mesh — one feature, one mesh. Material state derived from
// hover/active/snowCountry flags.
// ---------------------------------------------------------------------------

// Material palette — slightly more contrast than the first pass so
// the silhouette pops on the warm washi page background.
const COLOR_DEFAULT = '#F2EEE3';
const COLOR_SNOW    = '#7B96B0';
const COLOR_HOVER   = '#3D5A7A';
const COLOR_ACTIVE  = '#2C4562';

function PrefectureMesh({
  feature,
  isSnowCountry,
  isActive,
  isHovered,
  onHover,
  onSelect,
}: {
  feature: GeoFeature;
  isSnowCountry: boolean;
  isActive: boolean;
  isHovered: boolean;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // Larger lift values so the focused prefecture clearly rises above
  // the surrounding map plate — not a subtle nudge but a deliberate
  // separation. Active sits even higher than hover.
  const targetLift = isActive ? 0.55 : isHovered ? 0.32 : 0;
  const liftRef = useRef(0);

  const topHeight = isSnowCountry ? EXTRUDE_DEPTH : EXTRUDE_DEPTH_DIM;

  const geometry = useMemo(
    () => geometryFromFeature(feature, topHeight),
    [feature, topHeight]
  );

  // Per-mesh top outline — sits inside the group so it lifts with the
  // mesh, tracing the prefecture's silhouette when it floats above the
  // plate. Built once per feature; cheap to keep mounted always but only
  // rendered when focused.
  const outlineGeometry = useMemo(() => {
    const positions = buildBorderPositions(feature, topHeight + 0.006);
    if (positions.length === 0) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [feature, topHeight]);

  // Animate vertical lift on hover/active so interaction feels tactile.
  useFrame(() => {
    if (!groupRef.current) return;
    liftRef.current += (targetLift - liftRef.current) * 0.22;
    groupRef.current.position.y = liftRef.current;
  });

  if (!geometry) return null;

  // Pick the colour for the current state.
  const color = isActive
    ? COLOR_ACTIVE
    : isHovered
      ? COLOR_HOVER
      : isSnowCountry
        ? COLOR_SNOW
        : COLOR_DEFAULT;

  const focused = isActive || isHovered;
  const slug = nameToSlug(feature.properties.name);

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(slug);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          onHover(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(slug);
        }}
      >
        <meshStandardMaterial
          color={color}
          roughness={focused ? 0.5 : 0.78}
          metalness={isActive ? 0.22 : 0.05}
          envMapIntensity={0.45}
        />
      </mesh>
      {focused && outlineGeometry && (
        <lineSegments geometry={outlineGeometry} renderOrder={3}>
          <lineBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={isActive ? 0.95 : 0.85}
            depthTest={false}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// ResponsiveFov — perspective camera doesn't auto-fit, so on narrow
// (mobile portrait) canvases Japan ended up clipping at the sides.
// This helper recomputes the camera's vertical FOV every time the
// canvas resizes, picking the larger of "FOV needed to fit Japan's
// height" and "FOV needed to fit Japan's width given current aspect".
// Result: Japan + a configurable margin always sit inside the frame
// regardless of viewport.
// ---------------------------------------------------------------------------

// Bounding box of the silhouette in scene space — projection scales
// give lng range × 0.42 ≈ 9.6 wide, lat range × 0.50 ≈ 10.8 tall.
// We use the actual values plus a tiny bevel/drift allowance, so the
// fit calculation lets Japan fill nearly the whole canvas.
const SILHOUETTE_W = 9.8;
const SILHOUETTE_H = 11;

function ResponsiveFov({ margin = 1.02 }: { margin?: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!camera || size.width === 0 || size.height === 0) return;
    if (!('fov' in camera)) return; // skip for non-perspective cameras
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.length();
    const aspect = size.width / size.height;
    const fovForHeight = 2 * Math.atan((SILHOUETTE_H * margin) / 2 / dist);
    const fovForWidth = 2 * Math.atan((SILHOUETTE_W * margin) / 2 / (dist * aspect));
    cam.fov = (Math.max(fovForHeight, fovForWidth) * 180) / Math.PI;
    cam.updateProjectionMatrix();
  }, [camera, size, margin]);
  return null;
}

// ---------------------------------------------------------------------------
// Scene composition
// ---------------------------------------------------------------------------

function Scene({
  features,
  snowCountry,
  hoverSlug,
  activeSlug,
  onHover,
  onSelect,
  reducedMotion,
  showBorders,
}: {
  features: GeoFeature[];
  snowCountry: Set<string>;
  hoverSlug: string | null;
  activeSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  showBorders: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Idle drift — a barely-perceptible Y wobble. We deliberately
  // skip rotating around X here because that pitches the silhouette
  // toward/away from camera and was occasionally clipping Hokkaidō
  // at the top of the canvas.
  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.14) * 0.018;
  });

  return (
    <>
      <ambientLight intensity={0.65} color="#FFFFFF" />
      <directionalLight
        position={[6, 14, 8]}
        intensity={1.2}
        color="#FFFAF0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={20}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#3D5A7A" />
      <hemisphereLight args={['#FFFFFF', '#D9DEE6', 0.45]} />

      {/* Soft contact shadow disc beneath Japan */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.32}
        scale={28}
        blur={2.4}
        far={4}
        resolution={1024}
        color="#1A1816"
      />

      <group ref={groupRef}>
        {features.map((f) => {
          const slug = nameToSlug(f.properties.name);
          return (
            <PrefectureMesh
              key={f.properties.id ?? slug}
              feature={f}
              isSnowCountry={snowCountry.has(slug)}
              isActive={slug === activeSlug}
              isHovered={slug === hoverSlug}
              onHover={onHover}
              onSelect={onSelect}
            />
          );
        })}
        {showBorders && (
          <PrefectureBorders features={features} snowCountry={snowCountry} />
        )}
        <SnowLine />
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// SnowLine — a faint dashed band at the 36th parallel, the rough southern
// edge of Japan's heavy-snow zone. Sits flat on the silhouette plane so it
// looks like a hand-drawn cartographic annotation rather than 3D geometry.
// ---------------------------------------------------------------------------

const SNOW_LINE_LAT = 36.0;

function SnowLine() {
  // Two parallel hairlines at the 36th parallel form a "double-stroke
  // cartographic divider" — visually richer than a single line, reads
  // as an intentional border on the map. Kept at a low opacity so the
  // chip overlay is the focal point and the rails stay supporting
  // context (not the loudest thing on the map).
  const z = -((SNOW_LINE_LAT - CENTER_LAT) * LAT_SCALE);
  return (
    <group position={[0, 0.34, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -0.05]}>
        <planeGeometry args={[14, 0.018]} />
        <meshBasicMaterial
          color="#3D5A7A"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0.05]}>
        <planeGeometry args={[14, 0.018]} />
        <meshBasicMaterial
          color="#3D5A7A"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// PrefectureBorders — subtle sumi hairlines at every prefecture
// boundary so visitors can see *where* to hover before they hover.
// Two passes:
//   1. All-prefectures geometry at low opacity (the "whisper" map)
//   2. The hovered/active prefecture's outline rendered separately on
//      top in indigo at higher opacity for emphasis
//
// Each line sits at the prefecture's top extrusion height + a tiny
// epsilon so it floats just above the surface without z-fighting.
// Polygons under MIN_RING_AREA are skipped to match the mesh — if a
// prefecture polygon is large enough to render as 3D extrude, its
// outline is rendered too. Otherwise prefectures with small mainland
// pieces (or the smallest by-area prefectures) get a mesh but no
// border line, which reads as a missing edge.
// We additionally render any holes (inner rings), so a prefecture
// fully enclosing another renders both its outer edge and the gap.
// ---------------------------------------------------------------------------

function buildBorderPositions(
  feature: GeoFeature,
  topHeight: number
): number[] {
  const polygons: Polygon[] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  const out: number[] = [];
  // Larger epsilon than you'd expect — at 0.005 the lines were
  // sinking under the mesh top under most camera angles. 0.03
  // visually still sits flush to the surface but escapes z-fighting.
  const eps = 0.03;
  const y = topHeight + eps;

  const pushRing = (ring: Coord[]) => {
    // LineSegments expects pairs of points (each pair = one segment),
    // so we push (p[i], p[i+1]) including the wrap from last → first.
    for (let i = 0; i < ring.length; i++) {
      const [x1, z1] = project(ring[i]);
      const [x2, z2] = project(ring[(i + 1) % ring.length]);
      // Match the meshes' rotation: 2D y → -3D z (post-rotateFlat math)
      out.push(x1, y, -z1, x2, y, -z2);
    }
  };

  for (const poly of polygons) {
    if (poly.length === 0) continue;
    const [outer, ...holes] = poly;
    // Use the same threshold as the mesh (MIN_RING_AREA) so every
    // prefecture that gets a 3D shape also gets an outline.
    if (ringArea(outer) < MIN_RING_AREA) continue;
    pushRing(outer);
    for (const hole of holes) {
      if (hole.length < 3) continue;
      pushRing(hole);
    }
  }
  return out;
}

function PrefectureBorders({
  features,
  snowCountry,
}: {
  features: GeoFeature[];
  snowCountry: Set<string>;
}) {
  // All-prefecture geometry — built once and cached. Focus emphasis
  // is handled inside PrefectureMesh (so the outline can lift with
  // the prefecture instead of staying stranded at the original height).
  const allGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const f of features) {
      const slug = nameToSlug(f.properties.name);
      const top = snowCountry.has(slug) ? EXTRUDE_DEPTH : EXTRUDE_DEPTH_DIM;
      positions.push(...buildBorderPositions(f, top));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return g;
  }, [features, snowCountry]);

  return (
    <lineSegments geometry={allGeometry} renderOrder={2}>
      <lineBasicMaterial
        color="#3D3833"
        transparent
        opacity={0.45}
        depthTest={false}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// GeoJSON loader — fetches once on mount, caches in a module-scoped
// promise so subsequent component mounts reuse the data.
// ---------------------------------------------------------------------------

let geoPromise: Promise<GeoCollection> | null = null;

function useJapanGeo(): GeoCollection | null {
  const [data, setData] = useState<GeoCollection | null>(null);
  useEffect(() => {
    if (!geoPromise) {
      geoPromise = fetch('/atlas/japan.geojson').then((r) => r.json());
    }
    let cancelled = false;
    geoPromise.then((g) => {
      if (!cancelled) setData(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

// ---------------------------------------------------------------------------
// Cartographic overlays — sumi-stroke compass, italic sea labels,
// scale bar, and a label for the snow-line band. All are pure HTML/SVG
// over the canvas so they don't compete with the 3D scene's GPU work.
// ---------------------------------------------------------------------------

function CompassRose() {
  return (
    <div
      className="absolute top-4 right-4 pointer-events-none"
      aria-hidden
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="text-sumi-light"
      >
        {/* outer ring */}
        <circle cx="28" cy="28" r="22" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
        <circle cx="28" cy="28" r="14" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.6" />
        {/* needle — north arm filled indigo, south arm hollow */}
        <path d="M28 6 L31 28 L28 23 L25 28 Z" fill="#3D5A7A" />
        <path d="M28 50 L31 28 L28 33 L25 28 Z" fill="currentColor" fillOpacity="0.3" />
        {/* east/west arms — hairline */}
        <line x1="6" y1="28" x2="22" y2="28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
        <line x1="34" y1="28" x2="50" y2="28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
        {/* labels */}
        <text x="28" y="5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#3D5A7A" letterSpacing="1">N</text>
        <text x="28" y="55" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.5" letterSpacing="1">S</text>
        <text x="4" y="30" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.5" letterSpacing="1">W</text>
        <text x="52" y="30" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.5" letterSpacing="1">E</text>
      </svg>
    </div>
  );
}

function SeaLabels() {
  return (
    <>
      <p
        aria-hidden
        className="absolute pointer-events-none italic font-editorial text-stone/55 text-[12px] sm:text-[14px] tracking-wider"
        style={{ top: '38%', left: '4%', transform: 'rotate(-72deg)', transformOrigin: 'center' }}
      >
        Sea&nbsp;of&nbsp;Japan
      </p>
      <p
        aria-hidden
        className="absolute pointer-events-none italic font-editorial text-stone/55 text-[12px] sm:text-[14px] tracking-wider"
        style={{ bottom: '20%', right: '5%', transform: 'rotate(-72deg)', transformOrigin: 'center' }}
      >
        Pacific&nbsp;Ocean
      </p>
    </>
  );
}

/**
 * BordersToggle — small chip in the bottom-right corner of the map
 * that lets the visitor turn prefecture borders on or off. Default
 * varies by viewport (on at lg+, off below) but the user's choice
 * wins from the moment they tap.
 */
function BordersToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-label={value ? 'Hide prefecture borders' : 'Show prefecture borders'}
      aria-pressed={value}
      className="absolute bottom-4 right-4 inline-flex items-center gap-ma-2 bg-washi/95 backdrop-blur-sm border border-border hover:border-ai/50 rounded-full px-ma-3 py-[5px] shadow-[0_2px_8px_rgba(26,24,22,0.06)] transition-colors duration-base ease-settle"
    >
      <span
        aria-hidden
        className={`w-[6px] h-[6px] rounded-full transition-colors ${
          value ? 'bg-ai' : 'bg-stone/40'
        }`}
      />
      <span className="text-[10px] uppercase tracking-[0.14em] text-sumi-light font-medium">
        Borders
      </span>
    </button>
  );
}

function ScaleBar() {
  return (
    <div
      className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-ma-2"
      aria-label="Approximate scale: 100 kilometres"
    >
      {/* Bar — width matches roughly 100 km in the default camera framing.
          Approximate by design; a hero element, not a survey aid. */}
      <svg width="56" height="14" viewBox="0 0 56 14" aria-hidden>
        <line x1="2" y1="2" x2="2" y2="10" stroke="#3D3833" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="2" y1="6" x2="54" y2="6" stroke="#3D3833" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="54" y1="2" x2="54" y2="10" stroke="#3D3833" strokeOpacity="0.45" strokeWidth="1" />
      </svg>
      <span className="text-[10px] tabular-nums text-stone tracking-wide">
        ≈ 100 km
      </span>
    </div>
  );
}

/**
 * Six-axis snowflake — small SVG paired with the snow-line chip.
 * Indigo on washi for the editorial Japandi reading.
 */
function SnowflakeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="text-ai/85"
    >
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <line x1="8" y1="2" x2="8" y2="14" />
        <line x1="2.8" y1="5" x2="13.2" y2="11" />
        <line x1="2.8" y1="11" x2="13.2" y2="5" />
        {/* Tiny tip-flares on the vertical arm only — keeps the icon from
            looking like a plus sign without overcomplicating the shape. */}
        <line x1="8" y1="2" x2="6.5" y2="3.4" />
        <line x1="8" y1="2" x2="9.5" y2="3.4" />
        <line x1="8" y1="14" x2="6.5" y2="12.6" />
        <line x1="8" y1="14" x2="9.5" y2="12.6" />
      </g>
    </svg>
  );
}

/**
 * Snow-line label — a designed chip that sits at the 36th parallel
 * line on the map. Replaces the prior italic "─ Heavy snow zone above ─"
 * floating text with something that reads as an intentional cartographic
 * annotation: snowflake icon, parallel reference, info popover.
 *
 * Responsive: on mobile only the icon + "36°N" shows; the full label
 * "Snow line" appears at sm+ where there's horizontal room.
 */
function SnowLineLabel() {
  const tooltipText =
    "The 36th parallel is the rough southern edge of Northern Japan's heavy-snow belt. Above this line, lake-effect winds from the Sea of Japan dump deep, dry powder all winter — what makes Niigata, Nagano and Tōhoku world-class snow country. Below, winters get milder and wetter.";

  // Two layouts: on mobile the entire pill is one tap target (no
  // tiny info icon to hit). On desktop the pill is decorative and
  // the small "i" at the end opens the tip on hover/focus.
  return (
    <div
      className="absolute pointer-events-auto"
      style={{ top: '52%', right: '4%' }}
    >
      {/* Mobile: whole pill is the tap trigger */}
      <div className="sm:hidden">
        <InfoTip
          text={tooltipText}
          maxWidth={280}
          triggerClassName="inline-flex items-center gap-ma-2 bg-washi/95 backdrop-blur-sm border border-ai/20 rounded-full px-ma-3 py-[6px] shadow-[0_2px_8px_rgba(26,24,22,0.06)] active:bg-washi cursor-pointer"
        >
          <SnowflakeIcon />
          <span className="text-[10px] uppercase tracking-[0.14em] text-sumi-light font-medium tabular-nums">
            36°N
          </span>
          {/* Small ⓘ glyph hints that the chip is tappable on touch */}
          <span
            aria-hidden
            className="inline-flex w-[13px] h-[13px] rounded-full border border-ai/50 text-ai text-[8px] font-bold leading-none items-center justify-center"
          >
            i
          </span>
        </InfoTip>
      </div>

      {/* Desktop: pill + separate small info icon trigger */}
      <div className="hidden sm:inline-flex items-center gap-ma-2 bg-washi/95 backdrop-blur-sm border border-ai/20 rounded-full pl-ma-3 pr-ma-2 py-[5px] shadow-[0_2px_8px_rgba(26,24,22,0.06)]">
        <SnowflakeIcon />
        <span className="text-[10px] uppercase tracking-[0.14em] text-sumi-light font-medium">
          Heavy&nbsp;snow&nbsp;zone ·{' '}
          <span className="tabular-nums">36°N&nbsp;↑</span>
        </span>
        <InfoTip text={tooltipText} maxWidth={280} />
      </div>
    </div>
  );
}

/**
 * OriginArc — a soft indigo curve from a small "from {capital}" marker
 * pinned to the bottom-left of the canvas up toward Japan, with the
 * flight time floating midway. Becomes visible once the visitor hovers
 * or selects a prefecture, anchoring the journey-from-AU narrative.
 *
 * Drawn as an SVG over the canvas (not in-scene) so it stays crisp and
 * doesn't fight the 3D z-buffer. The arc's destination shifts slightly
 * across the silhouette so different prefectures feel different — but
 * it's intentionally not pixel-perfect; this is a narrative motif, not
 * a survey-grade flight path.
 */
function OriginArc({
  origin,
  hoverFlightTime,
  activeFlightTime,
  hasFocus,
}: {
  origin: AuOrigin;
  hoverFlightTime: string | null;
  activeFlightTime: string | null;
  hasFocus: boolean;
}) {
  const flight = hoverFlightTime ?? activeFlightTime;
  return (
    <>
      {/* Origin pin + flight-time pill, both bottom-left, inline.
          The pin always shows so the visitor knows the journey origin;
          the time appears (with a soft fade) only when a prefecture is
          focused. Per Kaz: keep the time next to the FROM pin instead
          of floating in the centre of the map. */}
      <div className="absolute bottom-12 left-4 pointer-events-none flex items-center gap-ma-3">
        <div className="flex items-center gap-ma-2">
          <span className="block w-2 h-2 rounded-full bg-ai shadow-[0_0_0_3px_rgba(61,90,122,0.18)]" />
          <span className="text-[10px] uppercase tracking-[0.12em] text-stone">
            From {originLabel(origin)}
          </span>
        </div>
        {hasFocus && flight && (
          <span className="text-[11px] tabular-nums font-medium text-sumi bg-washi/95 backdrop-blur-sm px-ma-2 py-[2px] rounded border border-ai/30 shadow-sm animate-fade-in">
            {formatFlightTime(flight)}
          </span>
        )}
      </div>

      {hasFocus && flight && (
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Arc only — the time chip lives with the pin now. */}
          <path
            d="M 6%,86% Q 30%,55% 60%,40%"
            fill="none"
            stroke="#3D5A7A"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-16"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers used by the info panel
// ---------------------------------------------------------------------------

/**
 * Strip the type suffix from a GeoJSON prefecture name for display.
 *   "Aomori Ken"  → "Aomori"
 *   "Tokyo To"    → "Tokyo"
 *   "Osaka Fu"    → "Osaka"
 *   "Hokkai Do"   → "Hokkaido"   (Do/道 is part of the actual name —
 *                                 keep it, just collapse the space)
 */
function cleanPrefectureName(raw: string): string {
  return raw
    .replace(/ (Ken|Fu|To)$/, '')
    .replace(/ Do$/, 'do');
}

function formatJpyShort(jpy: number | null | undefined): string {
  if (!jpy) return '—';
  const m = jpy / 1_000_000;
  if (m >= 10) return `¥${Math.round(m)}M`;
  return `¥${m.toFixed(1)}M`;
}

/**
 * Full JPY string with thousand-separators, used as the title (tooltip)
 * on AUD-primary stats so hovering reveals the precise yen value.
 */
function formatJpyFull(jpy: number | null | undefined): string {
  if (!jpy) return '—';
  return `¥${jpy.toLocaleString('en-AU')}`;
}

/**
 * Pick the prefecture's "flagship" town image — the highest-scoring
 * town with a hero image. Falls back to first available, then null.
 */
function flagshipImage(cities: MapCity[]): string | null {
  const sorted = cities
    .filter((c) => c.heroImagePath)
    .sort(
      (a, b) =>
        (b.offSeasonActivitiesScore ?? 0) - (a.offSeasonActivitiesScore ?? 0)
    );
  return sorted[0]?.heroImagePath ?? null;
}

/**
 * Hero image with AVIF + JPG fallback via `<picture>`. Bleeds to the
 * panel edges (no rounded corners, no border) so the imagery owns the
 * top of the card. Aspect 4:3 gives more presence than the prior 16:10.
 *
 * Tiny base64 blur (from area-blurs.ts) shows immediately as a
 * background so the panel never flashes a blank shoji square while
 * the full image loads. Slug is parsed from the src path so callers
 * don't need to thread it through.
 */
function PanelHero({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div
        className="aspect-[4/3] w-full bg-gradient-to-br from-[#3D5A7A] via-[#6B92B7] to-[#A4B7CC]"
        aria-hidden
      />
    );
  }
  // Path is /areas/<slug>.avif (or .jpg) — pull the slug for blur lookup.
  const slug = src.split('/').pop()?.replace(/\.(avif|jpg)$/, '');
  const blur = blurFor(slug);
  return (
    <div
      key={src}
      className="aspect-[4/3] w-full relative overflow-hidden bg-shoji bg-cover bg-center"
      style={{ backgroundImage: blur ? `url("${blur}")` : undefined }}
    >
      <picture>
        <source srcSet={src} type="image/avif" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src.replace(/\.avif$/, '.jpg')}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
      </picture>
      {/* Soft bottom gradient lifts type into the image when used as a
          headerful state without harming the photographic mood. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent"
      />
    </div>
  );
}

/**
 * Town card — image-on-top editorial layout. Replaces the prior
 * thumbnail-left list-row pattern that read as "data table". Now each
 * town is a small magazine spread: 16:9 hero, name in editorial serif,
 * region whisper-tag, and a thin stat row.
 */
function TownCard({ city, origin }: { city: MapCity; origin: AuOrigin }) {
  const flight = pickTimeForOrigin(origin, city);
  const price = city.avgPropertyPriceJpy
    ? formatPriceFromJpy(city.avgPropertyPriceJpy)
    : null;

  return (
    <Link
      href={`/areas/${city.prefectureSlug}/${city.citySlug}`}
      className="block group"
    >
      <div
        className="aspect-[16/9] w-full relative overflow-hidden rounded-md bg-shoji bg-cover bg-center"
        style={{
          backgroundImage: city.heroImagePath
            ? `url("${blurFor(city.citySlug) ?? ''}")`
            : undefined,
        }}
      >
        {city.heroImagePath ? (
          <picture>
            <source srcSet={city.heroImagePath} type="image/avif" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={city.heroImagePath.replace(/\.avif$/, '.jpg')}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-slow ease-settle group-hover:scale-[1.04] animate-fade-in"
            />
          </picture>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#3D5A7A]/70 to-[#6B92B7]/70"
          />
        )}
        {city.regionType && (
          <span className="absolute top-ma-2 left-ma-2 text-[9px] uppercase tracking-[0.12em] text-kinu/85 bg-sumi/45 backdrop-blur-sm px-ma-2 py-[2px] rounded">
            {city.regionType.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <div className="pt-ma-3">
        <h4 className="font-editorial text-[18px] text-sumi group-hover:text-ai transition-colors duration-base ease-settle leading-tight mb-ma-1">
          {city.cityName}
          <span className="ml-ma-2 text-[11px] text-ash group-hover:text-ai/70">
            →
          </span>
        </h4>
        {city.cityNameJa && (
          <div className="mb-ma-2">
            <JaCopyChip
              nameJa={city.cityNameJa}
              size="sm"
              showLabel={false}
              outboundSites={[]}
              ariaLabel={`Copy ${city.cityNameJa} (${city.cityName} in Japanese) to clipboard`}
            />
          </div>
        )}
        <div className="space-y-[2px]">
          {price && (
            <PanelStatLine
              value={price.primary}
              valueTitle={
                city.avgPropertyPriceJpy
                  ? formatJpyFull(city.avgPropertyPriceJpy)
                  : undefined
              }
              label="avg price"
            />
          )}
          {flight && (
            <PanelStatLine
              value={formatFlightTime(flight)}
              label={`from ${originLabel(origin)}`}
            />
          )}
          {city.offSeasonActivitiesScore != null && (
            <PanelStatLine
              value={`${city.offSeasonActivitiesScore}/10`}
              label="year-round appeal"
              info="Year-round appeal — measures how much a town has to offer beyond winter ski season. Onsens, hiking trails, summer festivals, regional cuisine, cultural sites, scenic drives. Higher scores mean a stronger reason to visit (or own a base) any time of year, not just snow months."
            />
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * PanelStatLine — vertical stat layout used inside town cards in the
 * map InfoPanel. Same pattern as the directory + quiz cards.
 */
function PanelStatLine({
  value,
  valueTitle,
  label,
  info,
}: {
  value: string;
  valueTitle?: string;
  label: string;
  info?: string;
}) {
  return (
    <div className="flex items-baseline gap-ma-2 text-[11px] tabular-nums whitespace-nowrap">
      <span className="font-medium text-sumi" title={valueTitle}>
        {value}
      </span>
      <span className="text-stone/70 inline-flex items-center gap-1">
        {label}
        {info && <InfoTip text={info} />}
      </span>
    </div>
  );
}

/**
 * BigStat — a hero number with a quiet label below. Optional `sub`
 * shows a tiny secondary line (e.g. "≈ ¥6,040,000" for AUD prices),
 * and `title` becomes the native browser hover-tooltip so the precise
 * value is revealed without taking screen space.
 */
function BigStat({
  value,
  label,
  sub,
  title,
}: {
  value: string;
  label: string;
  sub?: string;
  title?: string;
}) {
  return (
    <div title={title}>
      <div
        style={{ fontFamily: 'var(--font-editorial)', fontWeight: 400 }}
        className="font-editorial tabular-nums text-[22px] sm:text-[26px] text-sumi leading-none mb-ma-1"
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] tabular-nums text-stone mb-[2px]">
          {sub}
        </div>
      )}
      <div className="text-[10px] uppercase tracking-[0.12em] text-stone">
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InfoPanel — permanent right-column companion to the 3D map. Three
// progressive states drive the content:
//
//   1. idle   — first-load welcome + "how to use" hints
//   2. hover  — quick preview of whichever prefecture the cursor is
//                over (no commitment)
//   3. active — the selected prefecture: full town list, summary
//                stats, breakdown and CTA
//
// Always visible. Never overlaps the map. Sized so a typical desktop
// reads the map and panel side-by-side; mobile stacks them.
// ---------------------------------------------------------------------------

function InfoPanel({
  origin,
  allCities,
  totalTowns,
  totalPrefectures,
  hoverFeature,
  hoverCities,
  activeFeature,
  activeCities,
  onClear,
}: {
  origin: AuOrigin;
  allCities: MapCity[];
  totalTowns: number;
  totalPrefectures: number;
  hoverFeature: GeoFeature | null;
  hoverCities: MapCity[];
  activeFeature: GeoFeature | null;
  activeCities: MapCity[];
  onClear: () => void;
}) {
  // Selection commitment beats hover exploration. Once a prefecture
  // is active, the panel locks to that ActiveView and ignores hovers
  // — those still highlight the polygon and the legend chip, but
  // they don't swap the panel content. This avoids the height-jitter
  // glitch where, with the map sticky on scroll, every hover on the
  // canvas was triggering a panel-content swap, the right column
  // changed height, the document scroll height changed, and the user
  // saw the page jump under their cursor.
  if (activeFeature) {
    return (
      <ActiveView
        feature={activeFeature}
        cities={activeCities}
        origin={origin}
        onClear={onClear}
      />
    );
  }
  if (hoverFeature) {
    return (
      <HoverPreview
        feature={hoverFeature}
        cities={hoverCities}
        origin={origin}
      />
    );
  }
  return (
    <IdleView
      allCities={allCities}
      totalTowns={totalTowns}
      totalPrefectures={totalPrefectures}
    />
  );
}

/**
 * Latitude reference line — quiet, italic, beneath the prefecture name.
 * Replaces the prior bordered "badge" box that added visual weight
 * without adding hierarchy.
 */
function LatitudeLine({ slug }: { slug: string }) {
  const ref = PREFECTURE_LATITUDE_REF[slug];
  if (!ref) return null;
  return (
    <p className="text-[11px] text-stone italic leading-snug mt-ma-3">
      <span className="tabular-nums not-italic font-medium text-sumi-light mr-ma-1">
        {ref.lat.toFixed(1)}°N
      </span>
      same latitude as {ref.cities}
    </p>
  );
}

/**
 * Idle state — editorial first impression. Single hero spotlight from
 * the highest-scoring town, headline pulled big in serif, two stat
 * tiles in soft cards, single italic prompt at the bottom. No numbered
 * "how to use" list — the prompt + thumbnail row is enough on-ramp.
 */
function IdleView({
  allCities,
  totalTowns,
  totalPrefectures,
}: {
  allCities: MapCity[];
  totalTowns: number;
  totalPrefectures: number;
}) {
  const featured = useMemo(() => {
    return allCities
      .filter((c) => c.heroImagePath)
      .sort(
        (a, b) =>
          (b.offSeasonActivitiesScore ?? 0) - (a.offSeasonActivitiesScore ?? 0)
      )
      .slice(0, 3);
  }, [allCities]);

  const lead = featured[0];
  const supporting = featured.slice(1);

  return (
    <div>
      {/* Editorial spotlight — large hero pulled from the highest-
          scoring town, panel-bleed at top so it reads as a magazine
          cover plate. */}
      {lead?.heroImagePath && (
        <Link
          href={`/areas/${lead.prefectureSlug}/${lead.citySlug}`}
          className="block group relative"
          aria-label={`Open ${lead.cityName}`}
        >
          <PanelHero src={lead.heroImagePath} alt="" />
          {/* Stronger gradient — top-fade for the eyebrow and a heavier
              dark wash at the bottom that the white type can sit on
              with proper contrast even when the image goes pale. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"
          />
          <div className="absolute inset-x-0 bottom-0 px-ma-6 pb-ma-6 pt-ma-12">
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              }}
              className="text-[10px] uppercase tracking-[0.18em] mb-ma-2 font-medium"
            >
              Featured&nbsp;·&nbsp;{lead.prefectureName}
            </p>
            <div className="flex items-baseline gap-ma-3 transition-transform duration-base ease-settle group-hover:translate-x-1">
              <h3
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 400,
                  color: '#FFFFFF',
                  fontSize: 'clamp(28px, 5.5vw, 36px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  margin: 0,
                  textShadow: '0 2px 14px rgba(0,0,0,0.5)',
                }}
              >
                {lead.cityName}
              </h3>
              <span
                aria-hidden
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '22px',
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                }}
                className="leading-tight"
              >
                →
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="p-ma-6 lg:p-ma-6 space-y-ma-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-ai mb-ma-3">
            Northern snow country
          </p>
          <h3 style={{ fontFamily: 'var(--font-editorial)', fontWeight: 400 }} className="font-editorial text-[28px] sm:text-[32px] text-sumi leading-[1.1]">
            Where Japanoma operates.
          </h3>
          <p className="text-sm text-sumi-light leading-body mt-ma-4">
            Tinted prefectures are the regions we cover today —
            Hokkaidō through Tōhoku, into Niigata and Nagano.
          </p>
        </div>

        {/* Two hero stats, no border. The editorial number does the
            heavy lifting; the label whispers context. */}
        <div className="flex gap-ma-8">
          <BigStat value={String(totalTowns)} label="Towns live" />
          <BigStat value={String(totalPrefectures)} label="Prefectures" />
        </div>

        {/* Supporting thumbnails — bleed past the body padding so they
            visually anchor to the panel edges. The negative margins
            on each side cancel the parent padding (p-ma-6 = 24px on
            mobile, p-ma-8 = 28px on lg). gap-0 so the two thumbnails
            butt up — feels like a continuous editorial spread. */}
        {supporting.length > 0 && (
          <div className="grid grid-cols-2 gap-[2px] -mx-ma-6 lg:-mx-ma-6">
            {supporting.map((c) => (
              <Link
                key={c.citySlug}
                href={`/areas/${c.prefectureSlug}/${c.citySlug}`}
                className="group relative aspect-[4/3] overflow-hidden bg-shoji bg-cover bg-center"
                style={{
                  backgroundImage: c.heroImagePath
                    ? `url("${blurFor(c.citySlug) ?? ''}")`
                    : undefined,
                }}
                aria-label={`Open ${c.cityName}`}
              >
                <picture>
                  <source srcSet={c.heroImagePath ?? undefined} type="image/avif" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(c.heroImagePath ?? '').replace(/\.avif$/, '.jpg')}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-slow ease-settle group-hover:scale-[1.06] animate-fade-in"
                  />
                </picture>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-sumi/75 via-transparent to-transparent"
                />
                <p className="absolute left-ma-3 bottom-ma-3 text-[12px] text-kinu font-medium leading-none">
                  {c.cityName}
                </p>
              </Link>
            ))}
          </div>
        )}

        <p className="text-[12px] text-stone italic leading-snug">
          Hover any tinted prefecture on the map for a preview ·
          click to open the full town list.
        </p>
      </div>
    </div>
  );
}

function HoverPreview({
  feature,
  cities,
  origin,
}: {
  feature: GeoFeature;
  cities: MapCity[];
  origin: AuOrigin;
}) {
  const hasTowns = cities.length > 0;
  const cleanName = cleanPrefectureName(feature.properties.name);
  const heroSrc = flagshipImage(cities);

  const prices = cities.map((c) => c.avgPropertyPriceJpy).filter(Boolean) as number[];
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const offSeasonScores = cities
    .map((c) => c.offSeasonActivitiesScore)
    .filter((v): v is number => v != null);
  const avgOffSeason = offSeasonScores.length
    ? offSeasonScores.reduce((a, b) => a + b, 0) / offSeasonScores.length
    : null;
  const flightSamples = cities
    .map((c) => pickTimeForOrigin(origin, c))
    .filter(Boolean) as string[];
  const flightSample = flightSamples[0] ?? null;

  return (
    <div>
      {hasTowns && <PanelHero src={heroSrc} alt={`${cleanName} prefecture`} />}

      <div className="p-ma-6 lg:p-ma-6 space-y-ma-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-stone mb-ma-3">
            Preview
          </p>
          <h3 style={{ fontFamily: 'var(--font-editorial)', fontWeight: 400 }} className="font-editorial text-[30px] sm:text-[34px] text-sumi leading-[1.05]">
            {cleanName}
          </h3>
          <div className="mt-ma-2 flex items-center gap-ma-3 flex-wrap">
            <JaCopyChip nameJa={feature.properties.nameJa} size="sm" showLabel={false} outboundSites={[]} />
            {hasTowns && (
              <span className="text-xs text-stone">
                {cities.length} town{cities.length === 1 ? '' : 's'} live
              </span>
            )}
          </div>
          <LatitudeLine slug={nameToSlug(feature.properties.name)} />
        </div>

        {hasTowns ? (
          <>
            <div className="flex gap-ma-6 sm:gap-ma-8">
              {avgPrice != null && (() => {
                const p = formatPriceFromJpy(avgPrice);
                return (
                  <BigStat
                    value={p.primary}
                    sub={p.secondary}
                    label="Avg price"
                    title={formatJpyFull(avgPrice)}
                  />
                );
              })()}
              {flightSample && (
                <BigStat
                  value={`~${formatFlightTime(flightSample)}`}
                  label={`From ${originLabel(origin)}`}
                />
              )}
              {avgOffSeason != null && (
                <BigStat
                  value={`${avgOffSeason.toFixed(1)}`}
                  label="Year-round / 10"
                />
              )}
            </div>

            <p className="text-[12px] text-ai italic">
              Click {cleanName} to open the {cities.length} town
              {cities.length === 1 ? '' : 's'} →
            </p>
          </>
        ) : (
          <p className="text-sm text-stone italic leading-body">
            Not in the launch set yet — coming in a later phase as we
            expand south of the snow country.
          </p>
        )}
      </div>
    </div>
  );
}

function ActiveView({
  feature,
  cities,
  origin,
  onClear,
}: {
  feature: GeoFeature;
  cities: MapCity[];
  origin: AuOrigin;
  onClear: () => void;
}) {
  const cleanName = cleanPrefectureName(feature.properties.name);
  const hasTowns = cities.length > 0;
  const heroSrc = flagshipImage(cities);

  return (
    <div>
      {hasTowns && (
        <div className="relative">
          <PanelHero src={heroSrc} alt={`${cleanName} prefecture`} />
          {/* Close pinned to the hero corner so it doesn't compete
              with the prefecture name in the body. */}
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            className="absolute top-ma-3 right-ma-3 w-9 h-9 rounded-full bg-kinu/95 backdrop-blur-sm flex items-center justify-center hover:bg-kinu transition-colors duration-base ease-settle shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="#1A1816" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-ma-6 lg:p-ma-6 space-y-ma-6">
        <div className="flex items-start justify-between gap-ma-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-ai mb-ma-3">
              Selected
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 400,
                color: 'var(--sumi)',
                // A moderate bump above the original 32-38 — bigger
                // enough to clearly outrank the 18px town titles in
                // the list below, not display-shouting.
                fontSize: 'clamp(32px, 4vw + 12px, 42px)',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                margin: 0,
              }}
              className="font-editorial"
            >
              {cleanName}
            </h3>
            {hasTowns && (
              <p className="text-xs text-stone mt-ma-1">
                {cities.length} town{cities.length === 1 ? '' : 's'} on Japanoma
              </p>
            )}
            <div className="mt-ma-3">
              <JaCopyChip
                nameJa={feature.properties.nameJa}
                size="md"
                ariaLabel={`Copy ${feature.properties.nameJa} (${cleanName} prefecture in Japanese) to clipboard`}
              />
            </div>
            <LatitudeLine slug={nameToSlug(feature.properties.name)} />
          </div>
          {/* Fallback close when there's no hero — keeps it accessible
              on prefectures we don't cover yet. */}
          {!hasTowns && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear selection"
              className="w-8 h-8 rounded-full bg-shoji flex items-center justify-center hover:bg-kinu transition-colors duration-base ease-settle flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 3l8 8M11 3l-8 8" stroke="#1A1816" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {hasTowns ? (
          <div className="space-y-ma-6">
            {cities.map((c) => (
              <TownCard key={c.citySlug} city={c} origin={origin} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-sumi-light leading-body italic">
            On the roadmap for a later phase. We&apos;ll cover {cleanName}
            {' '}as we expand south of the snow country.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Snow-country legend — overlays the canvas as a compact, vertical key
// of the prefectures we currently list. Drives the same hoverSlug/
// activeSlug state the polygons use, so the list and silhouette are
// always synced. Hidden on mobile where the InfoPanel below the canvas
// already exposes the same set.
// ---------------------------------------------------------------------------

function SnowCountryLegend({
  features,
  snowCountry,
  byPrefecture,
  hoverSlug,
  activeSlug,
  onHover,
  onSelect,
}: {
  features: GeoFeature[];
  snowCountry: Set<string>;
  byPrefecture: Map<string, MapCity[]>;
  hoverSlug: string | null;
  activeSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string | null) => void;
}) {
  // Snow-country features only, sorted north → south by hand-curated
  // latitude refs so the legend reads as a geographical scan rather
  // than alphabetical. Falls back to alphabetical for any prefecture
  // missing a lat ref so new additions don't silently disappear.
  const items = useMemo(() => {
    return features
      .filter((f) => snowCountry.has(nameToSlug(f.properties.name)))
      .sort((a, b) => {
        const aSlug = nameToSlug(a.properties.name);
        const bSlug = nameToSlug(b.properties.name);
        const aLat = PREFECTURE_LATITUDE_REF[aSlug]?.lat;
        const bLat = PREFECTURE_LATITUDE_REF[bSlug]?.lat;
        if (aLat != null && bLat != null) return bLat - aLat;
        return cleanPrefectureName(a.properties.name).localeCompare(
          cleanPrefectureName(b.properties.name)
        );
      });
  }, [features, snowCountry]);

  if (items.length === 0) return null;

  return (
    // Backgroundless editorial list. Sits over the Sea of Japan
    // empty area (top-left of the silhouette). left-24 keeps the
    // rotated "Sea of Japan" italic visible to its left; compass
    // and borders toggle stay in their corners.
    //
    // Visible on every viewport — on phones the legend takes ~140px
    // of the upper-left empty space, which is the only spot the
    // silhouette doesn't occupy at this camera angle.
    <div
      className="absolute top-4 left-20 sm:left-24 z-10 flex flex-col w-[136px] sm:w-[140px]"
      aria-label="Snow country prefectures"
    >
      <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-stone/85 mb-[6px] pl-[10px]">
        Snow country · <span className="tabular-nums text-stone/60">{items.length}</span>
      </p>

      <div className="flex flex-col max-h-[min(62%,360px)] overflow-y-auto pr-1">
        {items.map((f) => {
          const slug = nameToSlug(f.properties.name);
          const name = cleanPrefectureName(f.properties.name);
          const isActive = slug === activeSlug;
          const isHovered = slug === hoverSlug;
          const cityCount = byPrefecture.get(slug)?.length ?? 0;

          const base =
            'w-full flex items-center gap-[6px] px-[10px] h-[22px] text-[11px] tracking-tight transition-colors duration-base ease-settle text-left rounded-sm';
          const tone = isActive
            ? 'text-ai font-semibold bg-ai/8'
            : isHovered
              ? 'text-ai bg-ai/5'
              : 'text-sumi hover:text-ai';

          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelect(isActive ? null : slug)}
              onMouseEnter={() => onHover(slug)}
              onMouseLeave={() => onHover(null)}
              onTouchStart={() => onHover(slug)}
              onFocus={() => onHover(slug)}
              onBlur={() => onHover(null)}
              aria-pressed={isActive}
              aria-label={`${name} — ${cityCount} listed ${cityCount === 1 ? 'town' : 'towns'}`}
              className={`${base} ${tone}`}
            >
              <span
                aria-hidden
                className={`w-[4px] h-[4px] rounded-full flex-shrink-0 transition-colors ${
                  isActive || isHovered ? 'bg-ai' : 'bg-ai/55'
                }`}
              />
              <span className="flex-1 font-medium truncate">{name}</span>
              {cityCount > 0 && (
                <span
                  className={`tabular-nums text-[9px] font-medium flex-shrink-0 ${
                    isActive ? 'text-ai/80' : 'text-stone/60'
                  }`}
                >
                  {cityCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function Japan3DMap({
  cities,
  origin,
}: {
  cities: MapCity[];
  origin: AuOrigin;
}) {
  const geo = useJapanGeo();
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // Prefecture borders — on by default so visitors immediately see
  // the cartographic structure of Japan. Toggle in the corner lets
  // them hide the lines if they prefer the cleaner silhouette.
  const [showBorders, setShowBorders] = useState(true);

  // Snow country = the set of prefecture slugs that have at least one
  // P1 city. Computed once so re-renders don't recompute.
  const snowCountry = useMemo(() => {
    const s = new Set<string>();
    for (const c of cities) s.add(c.prefectureSlug);
    return s;
  }, [cities]);

  // Cities grouped by prefectureSlug for the side-panel lookup.
  const byPrefecture = useMemo(() => {
    const m = new Map<string, MapCity[]>();
    for (const c of cities) {
      const arr = m.get(c.prefectureSlug) ?? [];
      arr.push(c);
      m.set(c.prefectureSlug, arr);
    }
    return m;
  }, [cities]);

  const activeFeature = useMemo(() => {
    if (!geo || !activeSlug) return null;
    return geo.features.find((f) => nameToSlug(f.properties.name) === activeSlug) ?? null;
  }, [geo, activeSlug]);

  const activeCities = activeSlug ? byPrefecture.get(activeSlug) ?? [] : [];
  const hoverFeature = useMemo(() => {
    if (!geo || !hoverSlug) return null;
    return geo.features.find((f) => nameToSlug(f.properties.name) === hoverSlug) ?? null;
  }, [geo, hoverSlug]);
  const hoverCities = hoverSlug ? byPrefecture.get(hoverSlug) ?? [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-ma-6 lg:gap-ma-12 items-start">
      {/*
        Map column — no frame, transparent canvas, sits on the page.
        Desktop only: sticky at top-ma-32 (128px = 64px fixed header
        + 64px breath, matching the /account sidebar pattern). Once
        the InfoPanel on the right grows taller than the map (which
        happens after a prefecture is selected and the city list +
        hero image render), the user can scroll through the panel
        while the silhouette stays anchored in view.
      */}
      <div className="relative lg:sticky lg:top-ma-32 lg:self-start">
        <div
          // Three constraints, tightest wins:
          //   82vh           — keep the silhouette prominent
          //   100vh - 160px  — sticky-safe: 128px top offset + ~32px
          //                    attribution/breath, so the bottom of the
          //                    map never falls off-screen when frozen
          //                    on scroll on shorter desktops
          //   760px          — absolute ceiling
          style={{ height: 'min(82vh, calc(100vh - 160px), 760px)' }}
          aria-label="Interactive 3D map of Japan"
        >
          <Canvas
            shadows
            // Camera distance is fixed; ResponsiveFov below adapts the
            // FOV to the canvas aspect ratio so the silhouette + a 20%
            // margin always fit, on any viewport.
            camera={{ position: [0, 19, 18], fov: 22, near: 0.1, far: 80 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
            style={{ background: 'transparent' }}
            onPointerMissed={() => {
              setHoverSlug(null);
              setActiveSlug(null);
            }}
          >
            <ResponsiveFov margin={1.02} />
            <Suspense fallback={null}>
              {geo && (
                <Scene
                  features={geo.features}
                  snowCountry={snowCountry}
                  hoverSlug={hoverSlug}
                  activeSlug={activeSlug}
                  onHover={setHoverSlug}
                  onSelect={setActiveSlug}
                  reducedMotion={reducedMotion}
                  showBorders={showBorders}
                />
              )}
            </Suspense>
          </Canvas>
        </div>

        {/* Loading state — until GeoJSON arrives */}
        {!geo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-stone">Loading Japan…</p>
          </div>
        )}

        {/* ── Cartographic overlays ────────────────────────────────── */}
        {geo && (
          <>
            <SeaLabels />
            <CompassRose />
            <ScaleBar />
            <SnowLineLabel />
            <BordersToggle
              value={showBorders}
              onChange={setShowBorders}
            />
            <SnowCountryLegend
              features={geo.features}
              snowCountry={snowCountry}
              byPrefecture={byPrefecture}
              hoverSlug={hoverSlug}
              activeSlug={activeSlug}
              onHover={setHoverSlug}
              onSelect={setActiveSlug}
            />
            <OriginArc
              origin={origin}
              activeFlightTime={
                activeCities.length > 0
                  ? pickTimeForOrigin(origin, activeCities[0])
                  : null
              }
              hoverFlightTime={
                hoverCities.length > 0
                  ? pickTimeForOrigin(origin, hoverCities[0])
                  : null
              }
              hasFocus={!!hoverFeature || !!activeFeature}
            />
          </>
        )}

      </div>

      {/*
        Info panel — flows naturally so it can grow beyond the map's
        height when a prefecture is selected. The map column above is
        the sticky one now.
      */}
      <aside aria-label="Prefecture details">
        {/* No padding on the wrapper — each panel state owns its own
            padding so the hero image can bleed to the card's rounded
            edges. overflow-hidden clips the image to the radius.
            min-h floors the panel so hovering different prefectures
            (which renders smaller HoverPreview content) doesn't
            shrink the column and shift document scroll height under
            the user's cursor. 560px ≈ a typical Idle / Hover view; a
            taller ActiveView is allowed to grow past it. */}
        <div className="bg-shoji rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(26,24,22,0.04)] lg:min-h-[560px]">
          <InfoPanel
            origin={origin}
            allCities={cities}
            totalTowns={cities.length}
            totalPrefectures={snowCountry.size}
            hoverFeature={hoverFeature}
            hoverCities={hoverCities}
            activeFeature={activeFeature}
            activeCities={activeCities}
            onClear={() => setActiveSlug(null)}
          />
        </div>
      </aside>
    </div>
  );
}
