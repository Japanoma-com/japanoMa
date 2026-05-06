/**
 * Japanoma quiz visual elements.
 *
 * Switched from hand-drawn SVGs to Lucide — the same icon system used
 * by shadcn/ui, Linear, Vercel and other modern product surfaces.
 * Consistent 2px stroke, rounded joins, professionally drawn at every
 * scale. Each answer is mapped to the icon whose semantic is closest
 * to the answer's meaning.
 *
 * Steps that intentionally have no icons:
 *   - Ski Season       (text labels are the visual hierarchy)
 *   - Budget           (the yen amounts are the visual)
 *
 * Lookup-only consumers should continue using `getQuizVisual(answerId)`.
 */
import {
  // Purpose
  Plane,
  Snowflake,
  CalendarDays,
  TrendingUp,
  Coins,
  // Family composition
  User,
  Heart,
  Baby,
  GraduationCap,
  Bird,
  Users,
  // Property type
  Home,
  Building2,
  Hammer,
  // Condition
  HelpCircle,
  ShieldCheck,
  Wrench,
  KeyRound,
  Sparkles,
  // Priority
  MountainSnow,
  Bath,
  Wallet,
  Leaf,
} from 'lucide-react';

/**
 * Kominka — custom icon. Lucide has no traditional Japanese farmhouse
 * glyph and `Landmark` (columned civic building) didn't read as the
 * gabled, post-and-beam vernacular kominka actually is. Drawn in
 * Lucide's visual language (24×24, 2px stroke, rounded joins) so it
 * sits next to the other quiz icons cleanly.
 *
 * Five elements, top to bottom:
 *  1. Chigi — crossed roof finials at the apex (the distinctive
 *     X-shape that signals "traditional Japanese architecture"
 *     instantly, even to non-Japanese viewers).
 *  2. Gable roof with overhanging eaves.
 *  3. Eaves underside (horizontal line where the roof meets posts).
 *  4. Four vertical posts — the visible post-and-beam structure
 *     under the eaves.
 *  5. Raised floor base.
 */
function Kominka(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Chigi — crossed roof finials */}
      <path d="M9 1.5L15 4.5" />
      <path d="M15 1.5L9 4.5" />
      {/* Gable roof with overhanging eaves */}
      <path d="M2 10L12 4L22 10" />
      {/* Eaves underside */}
      <path d="M3 10H21" />
      {/* Vertical posts */}
      <path d="M6 10V19" />
      <path d="M10 10V19" />
      <path d="M14 10V19" />
      <path d="M18 10V19" />
      {/* Floor base */}
      <path d="M4 19H20" />
    </svg>
  );
}

/**
 * Land — custom icon. Lucide's `Trees` said "forest / nature", not
 * the buildable plot of land the answer actually means ("Land Only ·
 * Build custom from scratch"). The reference visual is the
 * universal aerial/isometric subdivision diagram: a square plot
 * rotated 45° (so its corners point N/E/S/W, forming a diamond)
 * subdivided into four parcels arranged in the same diamond pattern.
 *
 * Geometry: four equal diamond parcels at the N/E/S/W positions of
 * an outer 18-unit diamond, separated by ~1-unit "streets". Each
 * inner parcel is itself a diamond, so the overall silhouette also
 * reads as a diamond — the way real-estate plots look when viewed
 * from above on a 2D site plan. Visually distinct from the previous
 * horizontal parallelogram (which read as a windowpane, not a lot).
 */
function LandPlot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* North parcel (top) */}
      <path d="M12 4L16 8L12 12L8 8Z" />
      {/* East parcel (right) */}
      <path d="M17 8L21 12L17 16L13 12Z" />
      {/* South parcel (bottom) */}
      <path d="M12 13L16 17L12 21L8 17Z" />
      {/* West parcel (left) */}
      <path d="M7 8L11 12L7 16L3 12Z" />
    </svg>
  );
}

export type QuizVisual = {
  type: 'icon';
  Component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
} | null;

// Lucide components accept the same SVGProps shape we already pass in
// (className, width, height, strokeWidth). No adapter needed.
const ICON_BY_ANSWER: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  // Purpose — why are you considering buying
  'holiday':          Plane,         // flying in for seasonal use
  'ski-base':         Snowflake,     // winter sport specialist
  'year-round':       CalendarDays,  // every day of the year
  'investment':       TrendingUp,    // yield-focused growth
  'lifestyle-income': Coins,         // personal use + rental income

  // Family composition — who will be using the property
  'solo':         User,            // single occupant
  'couple':       Heart,           // two people, no kids
  'young_family': Baby,            // school-age children
  'teen_family':  GraduationCap,   // older kids
  'empty_nest':   Bird,            // classic "empty nest" metaphor
  'multi_gen':    Users,           // multiple generations

  // Property type — what kind of structure
  'detached':  Home,         // standalone single-family
  'apartment': Building2,    // multi-storey managed
  'akiya':     Hammer,       // renovation project
  'land':      LandPlot,     // subdivided plot, build custom
  'kominka':   Kominka,      // traditional gable + chigi farmhouse

  // Condition — how much work
  'as-is':           HelpCircle,    // uncertain — no inspection
  'inspected':       ShieldCheck,   // verified + warranted
  'reform-included': Wrench,        // partial renovation
  'turnkey':         KeyRound,      // keys, move-in ready
  'new-build':       Sparkles,      // brand new

  // Priority — what tips the balance
  'slopes':       MountainSnow,  // proximity to ski terrain
  'onsen':        Bath,          // hot-spring culture
  'affordable':   Wallet,        // value-conscious
  'four-seasons': Leaf,          // year-round nature
};

export function getQuizVisual(answerId: string): QuizVisual {
  const Component = ICON_BY_ANSWER[answerId];
  return Component ? { type: 'icon', Component } : null;
}
