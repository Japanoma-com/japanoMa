'use client';

import { MaDivider, ScrollReveal } from '@/components/japandi';

type ChangeType = 'added' | 'improved' | 'fixed';

type Change = {
  text: string;
  type: ChangeType;
};

type Release = {
  version: string;
  date: string;
  title: string;
  description?: string;
  changes: Change[];
};

const TYPE_STYLES: Record<ChangeType, { label: string; bg: string; text: string }> = {
  added: { label: 'Added', bg: 'bg-matsu/10', text: 'text-matsu' },
  improved: { label: 'Improved', bg: 'bg-ai/10', text: 'text-ai-deep' },
  fixed: { label: 'Fixed', bg: 'bg-ai/10', text: 'text-ai' },
};

const RELEASES: Release[] = [
  {
    version: '0.15.0',
    date: '2026-04-25',
    title: '3D Japan Map for /areas',
    description:
      'The /areas browsing experience rebuilt around a bespoke Three.js extruded silhouette of Japan. Hover any prefecture and it lifts off the plate; click to focus it and surface a full-bleed editorial info panel with imagery, big-number stats and a Sydney→Japan flight arc. Cartographic overlays — a Sea of Japan label, the 36°N heavy-snow-zone parallel, an opt-in prefecture borders toggle — give the map a hand-drawn field-atlas feeling without sacrificing data clarity. List view remains one tap away.',
    changes: [
      {
        text: 'Bespoke Three.js 3D map of Japan replaces the previous list-only /areas view — every prefecture is an extruded silhouette mesh with hover-lift, click-to-focus, and a cinematic perspective camera that auto-fits to every viewport from 375px phones to 4K desktops',
        type: 'added' as ChangeType,
      },
      {
        text: 'Snow-country prefectures (Hokkaidō, Aomori, Akita, Iwate, Yamagata, Niigata, Nagano, Toyama, Fukushima, Miyagi) extrude taller and read in slate-blue indigo — the rest of Japan sits softer in warm cream so the launch focus is unmistakable',
        type: 'added' as ChangeType,
      },
      {
        text: 'Hover any prefecture to lift it 0.32 units off the plate; click to focus and lift to 0.55 with a white silhouette outline tracing its top edge — clearly tactile, not a subtle nudge',
        type: 'added' as ChangeType,
      },
      {
        text: 'Editorial info panel with full-bleed prefecture/town hero imagery, Shippori Mincho headlines, and big-number stats: AUD price floor, drive-from-airport time, year-round appeal score',
        type: 'added' as ChangeType,
      },
      {
        text: 'Origin arc — a soft indigo curve from a "from {capital}" marker pinned to the bottom-left up toward Japan, with the flight time floating midway. Becomes visible the moment a visitor hovers or selects a prefecture',
        type: 'added' as ChangeType,
      },
      {
        text: 'Snow-line annotation: the 36th parallel rendered as a double-stroke band on the map with a labelled chip ("HEAVY SNOW ZONE · 36°N ↑"). On mobile the entire chip is one finger-sized tap target that opens the explanation; on desktop the small "i" hovers it open',
        type: 'added' as ChangeType,
      },
      {
        text: 'Cartographic overlays: Sea of Japan / Pacific Ocean labels, scale bar with a real-world km figure, and a compass rose tucked in the corner',
        type: 'added' as ChangeType,
      },
      {
        text: 'Optional prefecture borders toggle in the corner (off by default everywhere) — opt in for hand-drawn-feeling sumi-light hairlines on every prefecture for cartographic orientation',
        type: 'added' as ChangeType,
      },
      {
        text: 'AU origin picker — pick Sydney / Melbourne / Brisbane / Perth / Adelaide once and every flight time and arc updates instantly. Mobile shows airport codes (SYD / MEL / BNE / PER / ADL) for compactness; full city names at sm+',
        type: 'added' as ChangeType,
      },
      {
        text: 'Map-default on desktop, list-default on mobile (small viewports favour the scannable list) — visitors can switch either way with the view toggle',
        type: 'added' as ChangeType,
      },
      {
        text: 'Quiz result cards on /quiz/results refreshed to match the new editorial language — same big-imagery card primitive as the directory',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Two new editorial home heroes shot through the Real-ESRGAN pipeline: a single farmhouse with valley fog under alpenglow, and a gassho-village under starry alpenglow — both feel like dossier plates rather than stock',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Portal-mounted info tooltips with viewport-edge clamping — when an info icon sits near the right edge of the screen the tooltip slides inward instead of overflowing, and the caret offsets so it still points at the icon',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Container-query-driven card titles that fit in one line at every width — long names like "Hakodate" or "Tsuruoka" no longer break to a second row',
        type: 'improved' as ChangeType,
      },
      {
        text: '8×4 base64 blur placeholders on every area-card hero (~15KB total across 33 images) so cards never paint blank rectangles while images load',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Hokkaidō no longer truncates to "Hokkai" in the panel header — the cleanup pass that strips suffix kana now keeps the trailing -do',
        type: 'fixed' as ChangeType,
      },
      {
        text: 'Yamanouchi previously rendered as "Yamanochi" — typo corrected in the taxonomy seed',
        type: 'fixed' as ChangeType,
      },
      {
        text: 'Semboku hero re-cropped — was letterboxed inside a 2400×1350 canvas, leaving solid-black bands top and bottom that read as gaps in the area-card grid',
        type: 'fixed' as ChangeType,
      },
      {
        text: 'Origin picker fits on a single row at every mobile width including 320px',
        type: 'fixed' as ChangeType,
      },
    ],
  },
  {
    version: '0.14.0',
    date: '2026-04-24',
    title: 'AUD-First Pricing & Editorial Area Cards',
    description:
      'Pricing across every buyer-facing surface flipped to AUD-primary with JPY + exchange-rate disclosure as supporting context — the headline number is always the dollar figure an Australian buyer can act on. Area pages and cards rebuilt around a buyer-focused editorial language: full-bleed heroes, average-price as the lead stat, and 33 commissioned hero photographs with proper image schema and AVIF delivery.',
    changes: [
      {
        text: 'AUD primary, JPY secondary across every buyer-facing surface — area pages, area cards, quiz results, contact context, hero figures. JPY now reads as supporting disclosure rather than the lead number',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Clearer JPY + exchange-rate disclosure on Area pages — the rate used to compute AUD is shown alongside the JPY figure so the conversion is auditable',
        type: 'improved' as ChangeType,
      },
      {
        text: 'CRA-76 taxonomy refresh — AU enrichment columns and Land & Building separation across every prefecture / city, sourced from the latest Go&C spreadsheet',
        type: 'added' as ChangeType,
      },
      {
        text: '33 editorial hero photographs commissioned and shipped across every launch area, wired to the area schema and served via AVIF (with JPG fallback through <picture>) for old-browser compatibility',
        type: 'added' as ChangeType,
      },
      {
        text: 'Editorial card redesign — buyer-focused stat hierarchy with average price as the lead number, supporting stats demoted to a right-stack, and unambiguous time format ("1h 5m" not "1.08h")',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Area detail pages now show a full-bleed hero, image-ready schema, and 33 launch-area image prompts ready for the next photographer brief',
        type: 'added' as ChangeType,
      },
      {
        text: 'Search across the area directory + Sanity sync — typing in the search box filters cities and surfaces matching prefecture-tagged articles',
        type: 'added' as ChangeType,
      },
      {
        text: 'Prefecture-tagged articles now appear on city pages too — previously only city-tagged articles showed up, leaving prefecture-level guides orphaned',
        type: 'fixed' as ChangeType,
      },
      {
        text: 'Phase-internals (P1/P2/P3 launch tier badges) hidden from public area UI — kept in the database for internal use, but the public surface no longer leaks the launch-priority taxonomy',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Lighter price UI across area cards — less visual weight on the JPY figure, more on the AUD headline',
        type: 'improved' as ChangeType,
      },
    ],
  },
  {
    version: '0.13.0',
    date: '2026-04-23',
    title: 'Admin Console, Go&C Email Notifications, Analytics',
    description:
      'The operations layer that turns the site from a marketing page into a working decision-aid platform. A consolidated admin console with Overview / Content / Quiz / Leads / Areas / Taxonomy / Traffic / Timeline tabs, real-time email notifications to Go&C on new leads and contact submissions, and consent-gated event tracking with a privacy banner. Plus a 10-test Playwright golden-path suite, Lighthouse CI, and a WCAG AA contrast pass.',
    changes: [
      {
        text: 'Admin console overhaul — collapsed 9 tabs into 4 visual-first sections (Overview / Content / Quiz / Leads), with timeline, areas, taxonomy and traffic views layered underneath',
        type: 'improved' as ChangeType,
      },
      {
        text: 'Insights view rebuilt as an area-demand command surface — see at a glance which prefectures and cities are pulling the most quiz interest, contact submissions, and saves',
        type: 'added' as ChangeType,
      },
      {
        text: 'Leads view with CSV export — every Express-interest submission is queryable and downloadable for Go&C handover',
        type: 'added' as ChangeType,
      },
      {
        text: 'Go&C email notifications fire on every new lead and contact submission, so the team no longer has to refresh the admin to see new activity',
        type: 'added' as ChangeType,
      },
      {
        text: 'Post-handoff follow-up survey + admin send button — once Go&C marks a lead as handed-off, an admin can trigger a single-question follow-up email asking how the introduction went',
        type: 'added' as ChangeType,
      },
      {
        text: 'Consent-gated event tracking with a privacy banner — analytics fire only after the visitor explicitly accepts, and the consent text is versioned so updates do not require a code deploy',
        type: 'added' as ChangeType,
      },
      {
        text: 'Playwright e2e suite with 10 golden-path tests — sign up, sign in, take the quiz, save an area, express interest, withdraw, contact, sign out — running on every PR',
        type: 'added' as ChangeType,
      },
      {
        text: 'Accessibility test suite + Lighthouse CI integrated into GitHub Actions — every PR gets a performance, accessibility, best-practices, and SEO score, with thresholds that block regressions',
        type: 'added' as ChangeType,
      },
      {
        text: 'WCAG AA contrast pass — --stone token darkened so secondary text meets the 4.5:1 ratio against washi backgrounds without a separate dark-mode pass',
        type: 'fixed' as ChangeType,
      },
      {
        text: 'Admin DB performance — queries stream with React Suspense and the connection pool widened, so the dashboard renders in under 200ms on warm caches',
        type: 'improved' as ChangeType,
      },
    ],
  },
  {
    version: '0.12.2',
    date: '2026-04-18',
    title: 'Hero — new Nagano highlands photograph',
    description: 'The hero photo swapped from the Niigata valley plate (snow town with rail and highway) to a wider Nagano highlands panorama — a central peak rising above forested slopes with a ski area visible at the right treeline. More editorial, more "field plate," and better matches the launch focus on Nagano snow country. Pushed through the same Real-ESRGAN AI pipeline as the previous hero so the detail is genuine, not interpolated.',
    changes: [
      { text: 'New hero image: a Nagano highlands panorama at 2560×948 (2.7:1 cinematic), reconstructed from a 1702×630 source via Real-ESRGAN realesrgan-x4plus (4x AI upscale to 6808×2520, then Lanczos-downscaled to the web target)', type: 'improved' as ChangeType },
      { text: 'Hero metadata strip updated to match the new location — N 36°43′ · E 138°30′ · Alt 1,800m · Nagano Highlands (Shiga Kogen area) instead of the previous Niigata valley coordinates', type: 'improved' as ChangeType },
      { text: 'object-position adjusted to 38% 45% so the central peak stays in frame across portrait mobile, laptop, and 4K aspects — the image\u2019s focal isn\u2019t dead-centre horizontally', type: 'improved' as ChangeType },
      { text: 'Blur placeholder, alt text, saturation and brightness tuning all regenerated for the new cooler / brighter composition', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.12.1',
    date: '2026-04-18',
    title: 'Post-launch polish — unified page, row CTAs, changelog in footer',
    description: 'A small sweep of visual cleanup following the logo launch. The alternating cream/off-white section backgrounds were reading as flicker rather than rhythm, so the page now sits on a single washi sheet with shoji reserved for in-section callout plates. CTAs on mobile behave like proper editorial sign-offs: button and text link share a row, aligned on the bottom edge. And the changelog is now reachable from the footer.',
    changes: [
      { text: 'Unified home and about page backgrounds to a single washi sheet — the bg-washi / bg-shoji alternation across 6–8 sections was only ~5 luminance values apart, enough to read as flicker rather than intentional rhythm. Chapter marks and 96–128px Ma-zone padding carry section demarcation instead', type: 'improved' as ChangeType },
      { text: 'In-section shoji plates (Katitas partner facts, AU↔JP fee comparison, founder architect aside) retained — against a unified page they now read cleanly as subtly raised paper callouts, which was shoji\u2019s intended role', type: 'improved' as ChangeType },
      { text: 'CTA rows across home Ch · 02, home Ch · 07, and the About closing now place the primary button and the "or explore areas" text link on the same row on every viewport, instead of stacking the link onto a second row on mobile', type: 'fixed' as ChangeType },
      { text: 'CTA rows now align the button and text link on the bottom edge (items-end) so the link underline extends the button\u2019s lower baseline rather than bisecting its vertical midpoint', type: 'improved' as ChangeType },
      { text: 'About closing CTA copy tightened from "Start with the quiz" + "or explore the areas" to "Take the quiz" + "or explore areas" so the longer phrases stop forcing a row break on 375px phones', type: 'fixed' as ChangeType },
      { text: 'Changelog link added to the footer navigation so visitors can reach the release history from any page', type: 'added' as ChangeType },
    ],
  },
  {
    version: '0.12.0',
    date: '2026-04-17',
    title: 'Logo System — Mark, Lockup, Favicon',
    description: 'The real JapanoMa brand mark — a torii gate with a house silhouette nested in the doorway — incorporated across the site as a proper logo system. Vector everywhere, inherits text colour so it adapts to every surface without separate dark/light assets, and now shows up in browser tabs and on iOS home screens.',
    changes: [
      { text: 'New LogoMark + LogoLockup React components under src/components/brand/. The mark is a hand-traced SVG (from the master PNG, via potrace) with currentColor fill so it inherits the surrounding text colour — kinu over the home hero, sumi on scrolled/interior pages, ai on links, etc.', type: 'added' as ChangeType },
      { text: 'Header now shows the full lockup (mark + Shippori Mincho "JapanoMa" wordmark) in place of the plain text link, and adapts colour along with the rest of the nav as you scroll past the hero', type: 'added' as ChangeType },
      { text: 'Footer leads with the lockup above the tagline so the brand signs off every page', type: 'added' as ChangeType },
      { text: 'Favicon and iOS apple-touch-icon wired via Next.js App Router conventions (icon.svg + apple-icon.png) — the torii now appears in browser tabs and on home-screen shortcuts, in washi on sumi', type: 'added' as ChangeType },
      { text: 'Public SVG asset at /brand/logo-mark.svg for partner kits, email signatures, and social previews', type: 'added' as ChangeType },
      { text: 'Lockup supports four sizes (sm/md/lg/xl) and two orientations (horizontal/stacked) so future hero, email, or merch contexts can reach for the right variant without reinventing it', type: 'added' as ChangeType },
    ],
  },
  {
    version: '0.11.3',
    date: '2026-04-17',
    title: 'Hero Image — Real-ESRGAN AI Reconstruction',
    description: 'Classical interpolation had hit its ceiling — the 1280×600 source simply didn\u2019t carry enough pixels for a crisp retina render. Rebuilt the hero through Real-ESRGAN\u2019s realesrgan-x4plus neural network, which hallucinates plausible photographic detail rather than smearing the existing pixels wider. Edges on the mountain silhouettes are now genuinely sharp, individual roof lines and rail rails are distinguishable, and forested slopes show real texture where the Lanczos version had smooth blur.',
    changes: [
      { text: 'Hero photo regenerated through Real-ESRGAN\u2019s realesrgan-x4plus model — 4x AI upscale from the original 1280×600 source to 5120×2400, then Lanczos-downscaled to the 2560×1200 web target. The result is genuine photographic detail, not interpolation', type: 'improved' as ChangeType },
      { text: 'Mountain ridges, rail lines, highway, and individual town rooflines are visibly sharper on retina and 4K displays', type: 'improved' as ChangeType },
      { text: 'Blur placeholder regenerated from the new (slightly warmer) hero so the coloured haze during load matches the final image', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.11.2',
    date: '2026-04-17',
    title: 'Hero Image Upscale + AVIF Delivery',
    description: 'The home hero photo rebuilt at 2x the resolution and served in AVIF format first. Same cinematic composition, visibly sharper on every retina and 4K display; real bytes on the wire actually go down thanks to AVIF.',
    changes: [
      { text: 'Hero photo upscaled from 1280×600 to 2560×1200 through a linear-light Lanczos pipeline with sigmoidal contrast preservation and a subtle unsharp mask — crisp edges on mountains, rail lines, and valley detail without haloing', type: 'improved' as ChangeType },
      { text: 'Next.js Image config now delivers AVIF first (≈50% smaller than WebP on photographic content), with WebP fallback for older browsers and JPG as the universal fallback', type: 'improved' as ChangeType },
      { text: 'Inline base64 blur placeholder (317 bytes, 16px thumbnail) gives an instant coloured haze while the hero loads — no blank sumi screen on slow connections', type: 'added' as ChangeType },
      { text: 'Explicit quality={85} on the hero — optimal sharpness-to-size balance for a photographic hero', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.11.1',
    date: '2026-04-17',
    title: 'Ch · 02 Refinement — The Pivot, Louder',
    description: 'The "On what you can\u2019t renovate" chapter redesigned so the argument lands harder. The can-change items are now struck through (the visual tells you before the prose that these aren\u2019t the point), the "But" becomes an editorial hinge flanked by rules, the permanent truths scale up to display type, and the bigger question gets its own breath with a rule-and-dot ornament.',
    changes: [
      { text: 'Can-change list (kitchen / bathroom / walls) now rendered struck-through in lighter stone — the visual says "crossed off, not the point" before you read the words', type: 'improved' as ChangeType },
      { text: 'Each can-change item staggers in individually (100ms apart) so the three strikes arrive in sequence before the pivot', type: 'improved' as ChangeType },
      { text: '"But" is now a full editorial hinge — italic Shippori Mincho flanked by hairlines, framed like a page-turn between the lesser truths and the lasting ones', type: 'improved' as ChangeType },
      { text: 'Permanent truths ("you can\u2019t move the house" / "you can\u2019t get closer to the nearest airport or bullet train station") scaled up from 34px to ~52px display type, paired with a 180ms stagger between them', type: 'improved' as ChangeType },
      { text: 'Setup prose ("Before falling in love with the floor plan…") switched to italic serif as a quieter prelude to the big question', type: 'improved' as ChangeType },
      { text: 'Bigger question elevated with a kicker overline, scaled from 60px to 76px max, broken across three lines for editorial rhythm, and closed with a rule-and-centred-dot ornament acting as a visual period', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.11.0',
    date: '2026-04-17',
    title: 'Editorial Dossier — Hero, Nav & About Overhaul',
    description: 'The homepage and About page reimagined as a field dossier. A full-bleed cinematic hero where the mountain photo becomes the canvas, an adaptive navigation that dissolves into the photograph, seven chapter-marked sections below the fold, and a long-form About that tells the full Katitas partnership, fees-and-fairness, and founder\u2019s story.',
    changes: [
      { text: 'Full-bleed cinematic hero on the homepage — the mountain photo is now the canvas, with a Shippori Mincho "Location, Location, Location." headline over a dual-gradient scrim and an ASCII metadata strip (N 36°56′ · E 138°49′ · Alt 350m · Niigata Corridor)', type: 'added' as ChangeType },
      { text: 'Adaptive navigation that stays transparent with white type over the home hero and transitions to a backdrop-blurred washi bar with sumi type after 40px of scroll; solid immediately on every non-home page', type: 'added' as ChangeType },
      { text: 'Seven chapter-marked sections below the home hero (Ch · 02 through Ch · 07) — philosophy, Decide First / Buy Second, Decision-aid not sales with strike-through list, Five commitments, Nagano & Niigata corridor metadata plate, and a Vol. I colophon sign-off', type: 'added' as ChangeType },
      { text: 'Complete rewrite of /about as a Vol. II long-form dossier — opening promise pull quote, Mottainai origin story, four differentiators with a Katitas partner-facts plate (1978 · 12 yrs No. 1 · 152 locations · 1,292 contractors · 2,857 agencies), six-question decision framework, AU↔JP fee comparison plate (A$48–60K vs A$8.8–8.9K), fairness model, and Kaz\u2019s signed founder\u2019s message', type: 'added' as ChangeType },
      { text: 'New hero background image at /images/hero-location.jpg — Niigata winter corridor', type: 'added' as ChangeType },
      { text: 'Viewport optimisation across devices — 100svh with min/max clamp, landscape-phone and 4K adjustments, iOS safe-area-inset padding on the content pocket, and object-position biased to show the valley on portrait crops', type: 'improved' as ChangeType },
      { text: 'Hero motion efficiency reduced from 14 staggered reveals over ~2.1s down to 5 staged reveals under ~1.2s — keeps the editorial cadence, feels markedly snappier', type: 'improved' as ChangeType },
      { text: 'Main content area reserves 64px top padding so interior pages sit below the fixed header; home hero uses -mt-16 to slide back under it for edge-to-edge cinematography', type: 'improved' as ChangeType },
      { text: 'iOS Safari URL-bar height jump on the hero — switched from 100vh to 100svh with dvh and vh fallbacks via @supports', type: 'fixed' as ChangeType },
      { text: 'Homepage masthead (Vol. I · MMXXVI · Plate 01) repositioned to sit below the fixed nav instead of behind it', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.10.2',
    date: '2026-04-10',
    title: 'Results Page Restored + Area Card Refinement',
    description: 'The Property Profile recap and Personalised Checklist are back on /quiz/results — the "we heard you" receipt and the decision-aid payoff that bridge scores to next steps. Area cards pick up colour-coded scores and the last bit of whitespace below the button is gone.',
    changes: [
      { text: 'Your Property Profile recap card is back on /quiz/results — property type, condition, budget with AUD conversion, and the profile summary narrative', type: 'added' as ChangeType },
      { text: 'Your Personalised Checklist is back — three profile-aware next steps naming your top cities, property type, condition, and prefecture', type: 'added' as ChangeType },
      { text: '"Read the area guide" secondary link on every result card, giving a soft path for users not yet ready for Express interest', type: 'added' as ChangeType },
      { text: '"Questions about these results? Contact Go&C" lifeline in the /quiz/results footer', type: 'added' as ChangeType },
      { text: 'Area card scores now colour-code by tier: matsu pine green for 80+, sumi for 60-79, stone for weaker fits — so strong matches read at a glance', type: 'added' as ChangeType },
      { text: 'ScrollReveal staggered reveals and MaDivider zone transitions restored across /quiz/results per Ma Space v4 Tier 2 motion', type: 'improved' as ChangeType },
      { text: 'Profile-aware hero copy on /quiz/results that names the scoring dimensions (purpose, season, property, budget, priorities)', type: 'improved' as ChangeType },
      { text: '% suffix back on area card scores after the previous round briefly showed them bare', type: 'fixed' as ChangeType },
      { text: 'Phantom row of whitespace below the Express interest button on desktop removed — the sm:min-h floor was larger than the button height', type: 'fixed' as ChangeType },
      { text: 'Unified padding on hero and half area card variants (both now p-ma-6 / 24px) so the two sizes feel like the same component family', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.10.1',
    date: '2026-04-10',
    title: 'Hero Polish',
    description: 'Three quick walkthrough fixes: hero illustration at 60fps on Safari and mobile, hero text tightened under the mountains, and area card CTAs aligned at the bottom of every card.',
    changes: [
      { text: 'Hero illustration now runs 60fps on Safari and mobile via GPU layer promotion and SVG filter consolidation', type: 'fixed' as ChangeType },
      { text: 'Hero text pulled up to sit right below where the mountains end, closing the mid-viewport gap', type: 'improved' as ChangeType },
      { text: 'Express interest button pinned to the bottom of every area card regardless of explanation length', type: 'fixed' as ChangeType },
      { text: 'All custom buttons (Express interest, Confirm and share, Delete permanently, and the 5 auth submits) now match the homescreen shadcn button typography — font-semibold with wide tracking', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.10.0',
    date: '2026-04-10',
    title: 'Saves Move Home to /account',
    description: 'Saved items now live on your /account page alongside recommended areas. Saves persist to the database for signed-in users, and content articles can now be saved too.',
    changes: [
      { text: 'Saved items section on /account grouped by Areas and Guides', type: 'added' as ChangeType },
      { text: 'Database-backed saves for signed-in users — heart an area or article and it follows you across devices', type: 'added' as ChangeType },
      { text: 'Content articles now have a Save button on their detail pages (previously only areas were savable)', type: 'added' as ChangeType },
      { text: 'Guest save hint: saving while signed out shows a "Saved locally. Sign up to keep across devices" tooltip for 4 seconds', type: 'added' as ChangeType },
      { text: 'Loading spinners on Express interest, withdraw, consent submit, delete account, save toggle, and remove-saved buttons', type: 'added' as ChangeType },
      { text: 'Existing guest saves automatically migrate to the database on first sign-in', type: 'improved' as ChangeType },
      { text: 'Standalone /saved page and its header/footer link removed in favour of the new /account section', type: 'improved' as ChangeType },
      { text: 'Area card scores now display as "92%" instead of "92/100"', type: 'improved' as ChangeType },
      { text: 'Sidebar Interests and Saves counters now live-update after every action without a page reload', type: 'fixed' as ChangeType },
      { text: 'Consent modal scroll behaviour rebuilt so the header and buttons stay visible on tall content', type: 'fixed' as ChangeType },
      { text: 'Consent and delete-account modals now render via React Portal so they are no longer clipped by transformed ancestors', type: 'fixed' as ChangeType },
      { text: 'Express interest spinner now appears instantly on click instead of being batched with the React transition', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.9.1',
    date: '2026-04-09',
    title: 'Indigo & Rounded Refresh',
    description: 'Site-wide visual refresh. The cedar and indigo accents unified into a single indigo, every corner softened to 12px rounding, and interactive motion audited against the Ma Space v4 Tier 1 spec.',
    changes: [
      { text: 'Cedar (--sugi) and indigo (--ai) accent tokens merged into a single indigo (#3D5A7A) across the whole site', type: 'improved' as ChangeType },
      { text: 'Border radius increased to 12px on new components, matching the homescreen button rounding', type: 'improved' as ChangeType },
      { text: 'Card hover lift: 2px vertical translate + shadow deepen over 300ms per Ma Space Tier 1 spec', type: 'added' as ChangeType },
      { text: 'Scroll reveal stagger: list items cascade in with 80ms between elements', type: 'added' as ChangeType },
      { text: '"YOUR TOP MATCH" badge now appears with a 250ms fade-in', type: 'added' as ChangeType },
      { text: 'Form inputs now animate the bottom-border colour change on focus over 200ms', type: 'improved' as ChangeType },
      { text: 'Button hover states simplified to background-colour shift only — no more translate/scale jumps', type: 'improved' as ChangeType },
      { text: 'Duplicate Japanoma wordmark on auth pages (one from the global header, one from AuthShell) removed', type: 'fixed' as ChangeType },
      { text: 'Auth card vertical centring fixed so the footer stays pinned to the viewport bottom', type: 'fixed' as ChangeType },
      { text: 'Area card hover lift no longer clipped by its ScrollReveal container', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-04-09',
    title: 'Account Concierge Redesign',
    description: '/account reworked in a two-column Japandi layout with a sticky concierge sidebar alongside your recommended areas. Auth pages now share a single calm shell, and /quiz/results uses the same card language.',
    changes: [
      { text: 'Two-column /account layout: sticky concierge sidebar + main content column', type: 'added' as ChangeType },
      { text: 'Concierge sidebar with identity block, status facts, inline name edit, sign out, and delete account actions', type: 'added' as ChangeType },
      { text: 'Delete account modal with "Type DELETE to confirm" gate and full keyboard focus trap', type: 'added' as ChangeType },
      { text: 'Recommended areas grid: first card as a full-width hero with "YOUR TOP MATCH" badge, remaining cards in half variants', type: 'added' as ChangeType },
      { text: 'Shared AuthShell for login, signup, verify email, forgot password, and reset password pages', type: 'added' as ChangeType },
      { text: '/quiz/results rewritten with matching hero + half-grid card layout', type: 'added' as ChangeType },
      { text: 'Auth form inputs switched to bottom-border-only styling per Ma Space v4', type: 'improved' as ChangeType },
      { text: 'Signed-in users taking the quiz now land on their /account results immediately instead of being orphaned under a session ID', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-04-09',
    title: 'Express Interest: Lead Capture',
    description: 'The main commercial moment ships. Click Express interest on a recommended area, read a short cross-border data sharing explanation, and your interest is recorded for Go&C to follow up on.',
    changes: [
      { text: 'Express interest flow on /account area cards with in-place confirmation state and checkmark', type: 'added' as ChangeType },
      { text: 'Consent modal explaining cross-border data sharing with Go&C and their Japan partners in plain language', type: 'added' as ChangeType },
      { text: 'Withdraw interest link returns the card to its default state without a page reload', type: 'added' as ChangeType },
      { text: 'Interest records and leads now persist to the database with an audit trail for Go&C follow-up', type: 'added' as ChangeType },
      { text: 'Consent text stored as a versioned record so updates do not require a code deploy — pending final legal review', type: 'added' as ChangeType },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-04-08',
    title: 'Sign Up, Sign In, Account',
    description: 'Full user accounts with email verification, password reset, and a personal dashboard page. Your saved areas and quiz results now follow you across sessions.',
    changes: [
      { text: 'Sign up with email and password, with email verification', type: 'added' as ChangeType },
      { text: 'Sign in and sign out with "Forgot password?" recovery flow', type: 'added' as ChangeType },
      { text: 'Personal /account dashboard: edit your name, see your saved items and last quiz result', type: 'added' as ChangeType },
      { text: 'Permanent account deletion with explicit "Type DELETE" confirmation', type: 'added' as ChangeType },
      { text: 'Header shows your name when signed in, or Sign in link when not', type: 'added' as ChangeType },
      { text: 'Anonymous saves, quiz results, and page events automatically link to your account on first sign-in', type: 'added' as ChangeType },
      { text: 'Auth architecture migrated from NextAuth to Supabase Auth for better RLS and email template management', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-04-08',
    title: 'Smart Contact Form',
    description: 'Quiz answers now travel into the contact form so you can see what context we already have before writing your message.',
    changes: [
      { text: 'Quiz answers carry into the contact form via a new pre-fill panel showing purpose, ski season, property type, condition, budget, and priority', type: 'added' as ChangeType },
      { text: 'Pre-fill panel includes the area you came from as the first row, replacing the previous simple area banner on quiz traffic', type: 'added' as ChangeType },
      { text: 'New "Clear pre-filled answers" link for cases where you want to ask about something different from your quiz results', type: 'added' as ChangeType },
      { text: 'Quiz context now persists into form_submissions.source_context as a structured JSON snapshot, ready for the upcoming admin Leads view', type: 'added' as ChangeType },
      { text: 'Sprint 2 is now 100% complete: lifestyle quiz, SEO foundation, and smart contact form all shipped', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-04-02',
    title: 'Hero Redesign, CMS Pages, UI Polish',
    description: 'New mountain silhouette with ski trail, Sanity-powered pages, accent colour unification, and content improvements.',
    changes: [
      { text: 'New mountain illustration: two peaks with 6-spiral ski trail descent', type: 'added' as ChangeType },
      { text: 'About and Privacy pages now editable via Sanity CMS', type: 'added' as ChangeType },
      { text: 'Sanity Studio deployed to japanoma.sanity.studio (v5.18)', type: 'added' as ChangeType },
      { text: 'Article cards with real Sanity images, consistent aspect ratio, hover zoom', type: 'added' as ChangeType },
      { text: 'Article detail hero images with full-width display', type: 'added' as ChangeType },
      { text: 'Custom dropdown arrows with proper edge spacing on filter bar', type: 'added' as ChangeType },
      { text: 'Unified accent colour from sugi (gold) to ai (indigo) across all interactive states', type: 'improved' as ChangeType },
      { text: 'Hero viewport optimised with 100svh for all screen sizes', type: 'improved' as ChangeType },
      { text: 'Mountain illustration background now seamlessly blends with page', type: 'improved' as ChangeType },
      { text: 'Form input focus ring double-outline on mobile', type: 'fixed' as ChangeType },
      { text: 'Sanity client build error on Vercel (lazy init + env var scoping)', type: 'fixed' as ChangeType },
      { text: 'Related articles now show featured images', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-03-28',
    title: 'Content Hub, Save/Bookmark, Compare Tool',
    description: 'Sprint 3. Browse and filter articles from Sanity CMS, bookmark areas and content, compare up to 3 cities side by side.',
    changes: [
      { text: 'Content Hub at /content with article grid, taxonomy filtering, and pagination', type: 'added' as ChangeType },
      { text: 'Article detail pages with Portable Text rendering, clickable tag badges, and related articles', type: 'added' as ChangeType },
      { text: 'Save/Bookmark system with heart icon toggle on areas and articles', type: 'added' as ChangeType },
      { text: 'Saved Items page at /saved with collection management and empty state', type: 'added' as ChangeType },
      { text: 'Compare Tool with sticky bottom tray (max 3 areas) and side-by-side comparison', type: 'added' as ChangeType },
      { text: 'Compare page highlights differences between areas across 8 metrics', type: 'added' as ChangeType },
      { text: 'CityActions wrapper for Save + Compare buttons on area detail pages', type: 'added' as ChangeType },
      { text: 'Content and Saved links added to header and footer navigation', type: 'improved' as ChangeType },
      { text: 'saves.contentId migrated from UUID to TEXT for Sanity article compatibility', type: 'fixed' as ChangeType },
    ],
  },
  {
    version: '0.4.2',
    date: '2026-03-26',
    title: 'Quiz Transitions + Scoring Deep Dive',
    description: 'Smooth step transitions, scroll-to-top fix, and detailed scoring documentation.',
    changes: [
      { text: 'Smooth directional slide transitions between quiz steps (200ms fade + horizontal slide)', type: 'added' as ChangeType },
      { text: 'Scroll-to-top on every quiz step change. No more landing mid-page on mobile.', type: 'fixed' as ChangeType },
      { text: 'Forward steps slide left, back steps slide right for natural directional feel', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.4.1',
    date: '2026-03-25',
    title: 'Taxonomy v3 + Scoring Overhaul',
    description: 'Updated taxonomy data, fixed quiz scoring to produce motivating results.',
    changes: [
      { text: '2 new property types: Two-generation House / Duplex and Multi-generational House', type: 'added' as ChangeType },
      { text: '2 new renovation features: Parking space expansion and Garden trees trimmed', type: 'added' as ChangeType },
      { text: 'Changelog page with timeline and version history', type: 'added' as ChangeType },
      { text: 'Region type populated on all 86 cities from latest CRA-76 taxonomy', type: 'fixed' as ChangeType },
      { text: 'Quiz scoring completely reworked. No more zero-score traps. Top results now score 70+.', type: 'fixed' as ChangeType },
      { text: 'Every scoring dimension now contributes positively with generous base floors', type: 'improved' as ChangeType },
      { text: 'Score thresholds adjusted: 75+ Strong match, 60+ Good fit, below 60 Worth exploring', type: 'improved' as ChangeType },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-03-25',
    title: 'Hero Redesign + Quiz Polish',
    description: 'Three-peak mountain illustration, sumi-e scroll composition, and quiz refinements.',
    changes: [
      { text: 'Three separate mountain peaks with staggered brush stroke animation', type: 'added' },
      { text: 'Sumi-e scroll composition for desktop hero. Mountains top, text below.', type: 'added' },
      { text: 'Quiz CTA in landing hero as primary action', type: 'added' },
      { text: 'Shoji mobile menu with staggered animations, focus trap, and Japanese nav labels', type: 'added' },
      { text: 'Custom branded SVG icons for quiz. 10 crafted icons + 5 kanji characters.', type: 'improved' },
      { text: 'Auto-advance on single-select quiz steps for faster flow', type: 'improved' },
      { text: 'AUD price conversions on budget quiz step and results', type: 'improved' },
      { text: 'Removed emojis and em dashes throughout quiz for more natural language', type: 'improved' },
      { text: 'SVG filter ID collision on desktop hero causing missing animations', type: 'fixed' },
      { text: 'Solid washi background on shoji menu overlay', type: 'fixed' },
      { text: 'Focus ring artifacts removed from mobile navigation', type: 'fixed' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-03-22',
    title: 'Lifestyle Quiz + SEO + Contact Auto-Population',
    description: 'Sprint 2 core features. The conversion loop: quiz captures intent, contact converts, SEO drives discovery.',
    changes: [
      { text: '6-step lifestyle quiz with scoring algorithm matching 13 launch cities', type: 'added' },
      { text: 'Property type and condition steps covering Go&C taxonomy', type: 'added' },
      { text: 'Budget reality check panel showing what your money actually buys', type: 'added' },
      { text: 'Quiz results page with DecisionSignal fit scores and personalised next steps', type: 'added' },
      { text: 'Contact form auto-population from quiz results and area context', type: 'added' },
      { text: 'JSON-LD structured data on all pages (Organization, Place, BreadcrumbList)', type: 'added' },
      { text: 'Open Graph and Twitter card metadata', type: 'added' },
      { text: 'Dynamic XML sitemap with all pages and city detail routes', type: 'added' },
      { text: 'Canonical URLs on every page', type: 'added' },
      { text: 'robots.txt with sitemap reference', type: 'added' },
      { text: 'Source tracking on contact form submissions (quiz, area, direct)', type: 'added' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-03-21',
    title: 'Taxonomy Update + Loading States',
    description: 'Updated taxonomy from CRA-76, new database tables, and Ma Space loading skeletons.',
    changes: [
      { text: 'Property conditions table (5 conditions from as-is to new build)', type: 'added' },
      { text: 'Local areas table (22 areas, third level under cities)', type: 'added' },
      { text: 'City columns: content priority, shuttle bus, slope access times', type: 'added' },
      { text: 'Buyer relevance text on renovation features', type: 'added' },
      { text: 'Ma Space loading skeletons for all routes with breathing animation', type: 'added' },
      { text: 'Launch priorities corrected: 13 P1, 20 P2, 39 P3, 3 P4 cities', type: 'fixed' },
      { text: 'Renovation features deduplicated from 56 to 34 correct records', type: 'fixed' },
      { text: 'Supabase transaction pooler compatibility', type: 'fixed' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-03-20',
    title: 'Sprint 1 Foundation',
    description: 'Full-stack foundation. Database, authentication, CMS, layout shell, and all core pages.',
    changes: [
      { text: 'Supabase database (Sydney) with 13 tables and RLS policies', type: 'added' },
      { text: '194 taxonomy records seeded from CRA-76 spreadsheet', type: 'added' },
      { text: 'NextAuth v5 with credentials provider and JWT strategy', type: 'added' },
      { text: 'Anonymous session middleware with 90-day cookies', type: 'added' },
      { text: 'Sanity CMS schemas for articles, area guides, and pages', type: 'added' },
      { text: 'Layout shell with header and footer', type: 'added' },
      { text: 'Homepage with hero illustration, value proposition, and CTAs', type: 'added' },
      { text: 'Areas listing page with P1 cities grouped by prefecture', type: 'added' },
      { text: 'City detail pages with access information and static generation', type: 'added' },
      { text: 'Contact page with validated form and server action', type: 'added' },
      { text: 'About and privacy policy pages', type: 'added' },
      { text: 'Plausible cookieless analytics', type: 'added' },
      { text: 'ISR revalidation webhook for Sanity', type: 'added' },
    ],
  },
  {
    version: '0.0.1',
    date: '2026-03-10',
    title: 'Ma Space Design System',
    description: 'Sprint 0. The visual foundation. Every design decision made before a single feature was built.',
    changes: [
      { text: 'Ma Space v4 design system with Sumi & Cedar palette', type: 'added' },
      { text: 'Shippori Mincho B1 + Satoshi typography scale', type: 'added' },
      { text: 'shadcn/ui components rethemed (Button, Badge, Card, Input, Table, Tooltip)', type: 'added' },
      { text: 'Custom Japandi components: DecisionSignal, RedFlagPanel, ContentCard, MaDivider', type: 'added' },
      { text: 'ScrollReveal animations with GPU-accelerated compositing', type: 'added' },
      { text: 'Seasonal overlay (Canvas 2D particles)', type: 'added' },
      { text: 'Photography components: FullBleedImage, KenBurnsHero', type: 'added' },
      { text: 'Score counter animation (800ms count-up)', type: 'added' },
      { text: 'Two-tier motion system: always-on micro-interactions + editorial storytelling', type: 'added' },
      { text: 'Design system showcase page at /design-system', type: 'added' },
    ],
  },
];

function TypeBadge({ type }: { type: ChangeType }) {
  const style = TYPE_STYLES[type];
  return (
    <span className={`inline-block text-[10px] font-ui font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">

        {/* Header */}
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">Development</p>
          <h1 className="mb-ma-6">Changelog</h1>
          <p className="text-sumi-light leading-body">
            A record of what we ship. New features, improvements, and fixes
            as JapanoMa evolves.
          </p>
        </ScrollReveal>

        <MaDivider size="zone" line />

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border hidden sm:block" />

          {RELEASES.map((release, ri) => (
            <div key={release.version} className="relative">
              <ScrollReveal delay={ri * 50}>

                {/* Timeline dot */}
                <div className="hidden sm:block absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-2 border-ai bg-washi z-10" />

                <div className="sm:pl-10">
                  {/* Version + date header */}
                  <div className="flex flex-wrap items-baseline gap-ma-3 mb-ma-3">
                    <span className="font-editorial text-xl text-sumi">
                      {release.version}
                    </span>
                    <span className="text-xs text-stone font-ui">
                      {new Date(release.date).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h2 className="text-lg mb-ma-2" style={{ fontFamily: 'var(--font-editorial)', fontWeight: 400 }}>
                    {release.title}
                  </h2>
                  {release.description && (
                    <p className="text-sm text-stone leading-relaxed mb-ma-8">
                      {release.description}
                    </p>
                  )}

                  {/* Changes list */}
                  <div className="space-y-ma-3 mb-ma-16">
                    {release.changes.map((change, ci) => (
                      <div key={ci} className="flex items-start gap-ma-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <TypeBadge type={change.type} />
                        </div>
                        <p className="text-sm text-sumi-light leading-relaxed">
                          {change.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {ri < RELEASES.length - 1 && (
                <div className="sm:pl-10">
                  <div className="h-px bg-border mb-ma-12" />
                </div>
              )}
            </div>
          ))}
        </div>

        <MaDivider size="zone" />

        <ScrollReveal>
          <div className="text-center">
            <p className="caption">
              JapanoMa is built by Craefto for Go&C Partners.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
