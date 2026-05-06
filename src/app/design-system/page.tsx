'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DecisionSignal } from '@/components/japandi/decision-signal';
import { RedFlagPanel } from '@/components/japandi/red-flag-panel';
import { ContentCard } from '@/components/japandi/content-card';
import { MaDivider, ScrollReveal } from '@/components/japandi';

/* ── Palette data ── */
const CORE_PALETTE = [
  { name: 'Sumi', nameJa: '墨', hex: '#1A1816', role: 'Headings, primary text', light: false },
  { name: 'Sumi Light', nameJa: '薄墨', hex: '#3D3833', role: 'Body text', light: false },
  { name: 'Stone', nameJa: '石', hex: '#8A8279', role: 'Secondary, captions', light: false },
  { name: 'Ash', nameJa: '灰', hex: '#C4BDB4', role: 'Muted, placeholders', light: false },
  { name: 'Washi', nameJa: '和紙', hex: '#F5F0E8', role: 'Page background', light: true },
  { name: 'Shoji', nameJa: '障子', hex: '#FAFAF7', role: 'Card surfaces', light: true },
  { name: 'Sugi', nameJa: '杉', hex: '#9B7B4F', role: 'The accent, CTAs, focus', light: false },
  { name: 'Sugi Deep', nameJa: '杉深', hex: '#7A5F3A', role: 'Hover, pressed states', light: false },
];

const SEMANTIC_PALETTE = [
  { name: 'Matsu', nameJa: '松', hex: '#4A6B52', role: 'Success / Pine' },
  { name: 'Kohaku', nameJa: '琥珀', hex: '#A67B3D', role: 'Warning / Amber' },
  { name: 'Beni', nameJa: '紅', hex: '#8B3A3A', role: 'Error / Crimson' },
  { name: 'Ai', nameJa: '藍', hex: '#3D5A7A', role: 'Info / Indigo' },
];

const PROPERTIES = [
  { area: 'Hakuba', type: '3LDK Detached', price: '¥28,500,000', annual: '¥480,000', score: 78 },
  { area: 'Myoko', type: '2LDK Mansion', price: '¥12,800,000', annual: '¥320,000', score: 65 },
  { area: 'Nozawa', type: '4LDK Detached', price: '¥35,200,000', annual: '¥620,000', score: 82 },
  { area: 'Furano', type: '2LDK Detached', price: '¥18,500,000', annual: '¥390,000', score: 71 },
];

const SPACES = [
  { token: '--space-1', size: '4px', label: '4' },
  { token: '--space-2', size: '8px', label: '8' },
  { token: '--space-4', size: '16px', label: '16' },
  { token: '--space-8', size: '32px', label: '32' },
  { token: '--space-16', size: '64px', label: '64' },
  { token: '--space-32', size: '128px', label: '128' },
];

export default function DesignSystem() {
  return (
    <div>
      <style>{`
        .ds-swatch {
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .ds-swatch:hover {
          transform: scale(1.03);
        }

        .ds-grid-line {
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent calc(100% / 12 - 1px),
            var(--border) calc(100% / 12 - 1px),
            var(--border) calc(100% / 12)
          );
          opacity: 0.4;
        }

        @media (prefers-reduced-motion: reduce) {
          .ds-swatch:hover {
            transform: none;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          ACT I · Philosophy
          ══════════════════════════════════════════════════ */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-ma-6">
        <ScrollReveal className="text-center">
          <p
            className="font-editorial text-[clamp(120px,20vw,220px)] leading-[0.9] text-sumi/[0.06] select-none"
            aria-hidden="true"
          >
            間
          </p>
        </ScrollReveal>
        <ScrollReveal delay={100} className="text-center -mt-16 sm:-mt-24">
          <span className="label-overline block mb-ma-6">DESIGN SYSTEM</span>
          <h1 className="mb-ma-6">Ma Space v4</h1>
          <p className="ma-content text-stone leading-body mx-auto" style={{ maxWidth: 480 }}>
            Meaningful emptiness as the primary design material.
            <br />
            Japanese restraint. Scandinavian clarity.
          </p>
        </ScrollReveal>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          DESIGN PHILOSOPHY
          ══════════════════════════════════════════════════ */}
      <section className="ma-page px-ma-6">
        <div className="ma-content mx-auto pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">OUR THINKING</span>
            <h2 className="mb-ma-12">Design Philosophy</h2>
          </ScrollReveal>

          <div className="space-y-ma-16">
            <ScrollReveal>
              <h3 className="text-sm mb-ma-4">Emptiness as Material</h3>
              <p className="text-sumi-light leading-body">
                In Japanese aesthetics, 間 (ma) is not empty space left over after placing
                objects. It is the primary material from which the composition is built.
                Every margin, every pause, every silence in this design system carries
                intention. We don&apos;t fill space; we shape it. The emptiness between elements
                does more work than the elements themselves.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h3 className="text-sm mb-ma-4">Wabi-Sabi Meets Scandinavian Clarity</h3>
              <p className="text-sumi-light leading-body">
                We draw from two traditions that share a deep respect for restraint.
                From Japan: wabi-sabi, the beauty of imperfection, impermanence, and
                incompleteness. A cracked glaze, ink bleeding into paper, the gap where
                an enso never closes. From Scandinavia: democratic clarity, functional
                warmth, and the belief that good design disappears into usefulness.
                Together they form Japandi. Not a trend, but a shared value system.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h3 className="text-sm mb-ma-4">The Feel We Aspire To</h3>
              <p className="text-sumi-light leading-body">
                Imagine stepping into a Japanese mountain lodge after a powder day.
                Warm wood underfoot. Snow falling outside a window. A cup of tea.
                Silence, but not lonely silence. The kind that lets you think clearly.
                That is the feeling this interface should evoke: calm authority, honest
                warmth, and the quiet confidence that comes from having done the research
                so you don&apos;t have to guess.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <h3 className="text-sm mb-ma-4">Decisions, Not Decoration</h3>
              <p className="text-sumi-light leading-body">
                Every element earns its place. A colour appears only when it communicates
                data. A border exists only when it distinguishes. Motion occurs only when
                it aids understanding. We chose a near-monochromatic palette not because
                we couldn&apos;t use colour, but because restraint builds trust. When
                a score turns red, you know it matters. Because nothing else is red.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <h3 className="text-sm mb-ma-4">Three Guiding Principles</h3>
              <div className="mt-ma-6 space-y-ma-6">
                <div className="flex gap-ma-6">
                  <span className="data-text text-stone shrink-0 w-4 text-right">1</span>
                  <p className="text-sumi-light leading-body">
                    <strong className="text-sumi">Respect the viewer&apos;s intelligence.</strong>{' '}
                    No gratuitous animation. No hand-holding tooltips. No decoration for
                    decoration&apos;s sake. Present the information clearly and trust
                    people to think.
                  </p>
                </div>
                <div className="flex gap-ma-6">
                  <span className="data-text text-stone shrink-0 w-4 text-right">2</span>
                  <p className="text-sumi-light leading-body">
                    <strong className="text-sumi">Show everything, hide nothing.</strong>{' '}
                    Transparency is the product. The design must never feel like it is
                    obscuring information or softening bad news. If a property has a problem,
                    the interface surfaces it plainly.
                  </p>
                </div>
                <div className="flex gap-ma-6">
                  <span className="data-text text-stone shrink-0 w-4 text-right">3</span>
                  <p className="text-sumi-light leading-body">
                    <strong className="text-sumi">Less, but better.</strong>{' '}
                    Dieter Rams by way of Kenya Hara. Fewer elements, each considered
                    completely. One font for authority, one for utility. One accent colour.
                    One primary action per viewport. Constraint is creative freedom.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT II · Palette
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">01 · PALETTE</span>
            <h2 className="mb-ma-3">Sumi &amp; Cedar</h2>
            <p className="text-stone text-sm" style={{ maxWidth: 440 }}>
              Near-monochromatic. One warm accent. Max three colors
              active per screen.
            </p>
          </ScrollReveal>

          {/* Core swatches */}
          <div className="mt-ma-16 grid grid-cols-2 sm:grid-cols-4 gap-ma-3">
            {CORE_PALETTE.map((c, i) => (
              <ScrollReveal
                key={c.hex}
                delay={(i % 4) * 100}
                className="ds-swatch"
              >
                <div
                  className="aspect-[4/3] rounded-lg mb-ma-3 flex items-end p-ma-4"
                  style={{ backgroundColor: c.hex }}
                >
                  <span
                    className="font-editorial text-2xl leading-none"
                    style={{ color: c.light ? '#1A1816' : '#FAFAF7' }}
                  >
                    {c.nameJa}
                  </span>
                </div>
                <p className="data-text">{c.name}</p>
                <p className="caption">{c.hex} · {c.role}</p>
              </ScrollReveal>
            ))}
          </div>

          {/* Semantic strip */}
          <ScrollReveal className="mt-ma-16">
            <p className="label-overline mb-ma-6">SEMANTIC · DATA CONTEXTS ONLY</p>
            <div className="grid grid-cols-4 gap-ma-3">
              {SEMANTIC_PALETTE.map((c) => (
                <div key={c.hex}>
                  <div
                    className="h-12 rounded-lg mb-ma-2"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="data-text text-xs">{c.name} <span className="text-stone">{c.nameJa}</span></p>
                  <p className="caption text-xs">{c.role}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT III · Typography
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">02 · TYPOGRAPHY</span>
            <h2 className="mb-ma-3">Two Voices</h2>
            <p className="text-stone text-sm" style={{ maxWidth: 440 }}>
              Shippori Mincho B1 for editorial authority. Satoshi for everything else.
              Never bold a heading. Size and space carry weight.
            </p>
          </ScrollReveal>

          {/* Shippori specimen */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-8">SHIPPORI MINCHO B1 · REGULAR 400</span>
            <p className="font-editorial text-[clamp(36px,6vw,64px)] leading-[1.1] text-sumi tracking-[-0.02em]">
              Know Before<br />You Buy
            </p>
          </ScrollReveal>

          <div className="h-ma-16" aria-hidden="true" />

          {/* Satoshi specimen */}
          <ScrollReveal>
            <span className="label-overline block mb-ma-8">SATOSHI · VARIABLE · 400 / 700</span>
            <p className="font-ui text-[clamp(24px,4vw,40px)] font-bold leading-[1.2] text-sumi">
              Total Cost of Ownership
            </p>
            <p className="mt-ma-6 leading-body text-sumi-light" style={{ maxWidth: 560 }}>
              Expect total annual holding costs of ¥350,000 to ¥600,000 for a typical
              Nagano snow-country property, including fixed asset tax, management fees,
              snow removal, and insurance.
            </p>
          </ScrollReveal>

          {/* Type scale reference */}
          <ScrollReveal className="mt-ma-24">
            <div className="space-y-ma-8">
              {[
                { label: 'H1', font: 'Shippori Mincho B1', weight: '400', size: '40px / 1.15', sample: 'Own a Japan Ski Home Base', cls: 'font-editorial text-[40px] leading-[1.15] tracking-[-0.02em] text-sumi' },
                { label: 'H2', font: 'Shippori Mincho B1', weight: '400', size: '28px / 1.25', sample: 'Hakuba Valley: Full Cost Picture', cls: 'font-editorial text-[28px] leading-[1.25] tracking-[-0.01em] text-sumi' },
                { label: 'H3', font: 'Satoshi', weight: '700', size: '17px / 1.35', sample: 'Annual Holding Cost Breakdown', cls: 'font-ui font-bold text-[17px] leading-[1.35] text-sumi' },
                { label: 'Body', font: 'Satoshi', weight: '400', size: '16px / 1.8', sample: 'Fixed asset tax typically runs 1.4% of assessed value.', cls: 'font-ui text-base leading-[1.8] text-sumi-light' },
                { label: 'Data', font: 'Satoshi', weight: '500', size: '14px / tabular', sample: '¥28,500,000 · 3LDK · Hakuba', cls: 'data-text' },
                { label: 'Caption', font: 'Satoshi', weight: '400', size: '13px', sample: 'Source: Ministry of Land data, 2024', cls: 'caption' },
                { label: 'Overline', font: 'Satoshi', weight: '700', size: '10px / uppercase', sample: 'AREA GUIDE', cls: 'label-overline' },
              ].map((t) => (
                <div key={t.label} className="flex flex-col sm:flex-row sm:items-baseline gap-ma-2 sm:gap-ma-8">
                  <div className="shrink-0 w-44">
                    <span className="data-text text-sumi text-xs">{t.label}</span>
                    <br />
                    <span className="caption text-xs">{t.font} {t.weight}</span>
                    <br />
                    <span className="caption text-xs text-stone">{t.size}</span>
                  </div>
                  <span className={t.cls}>{t.sample}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT IV · Spacing (Ma)
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">03 · SPACING</span>
            <h2 className="mb-ma-3">間 · Ma</h2>
            <p className="text-stone text-sm" style={{ maxWidth: 440 }}>
              8px base grid. Intentional emptiness between elements.
              128px Ma zones between page acts.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-ma-16">
            <div className="space-y-ma-4">
              {SPACES.map((s) => (
                <div key={s.token} className="flex items-center gap-ma-6">
                  <span className="data-text text-stone w-8 text-right shrink-0 text-xs">{s.label}</span>
                  <div
                    className="h-8 bg-ai/10 rounded-lg transition-all duration-slow"
                    style={{ width: s.size }}
                  />
                  <span className="caption text-xs">{s.token}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Grid demo */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">12-COLUMN GRID · CONTENT USES CENTER 8</span>
            <div className="relative h-32 rounded-lg overflow-hidden border border-bamboo/50">
              <div className="absolute inset-0 ds-grid-line" />
              <div className="absolute top-0 bottom-0 left-[calc(100%/6)] right-[calc(100%/6)] bg-ai/[0.06]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="caption text-xs bg-washi/80 px-ma-2">680px content · 1120px page</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT V · Components
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">04 · COMPONENTS</span>
            <h2 className="mb-ma-3">Building Blocks</h2>
            <p className="text-stone text-sm" style={{ maxWidth: 440 }}>
              shadcn/ui rethemed for Ma Space. Bespoke Japandi components
              for domain-specific patterns.
            </p>
          </ScrollReveal>

          {/* Buttons */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">BUTTONS</span>
            <div className="flex gap-ma-4 flex-wrap items-center">
              <Button>Start Assessment</Button>
              <Button variant="outline">Compare Areas</Button>
              <Button variant="secondary">Save Draft</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="link">How we calculate this</Button>
            </div>
            <div className="mt-ma-4 flex gap-ma-4 flex-wrap items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </ScrollReveal>

          {/* Badges */}
          <ScrollReveal className="mt-ma-16">
            <span className="label-overline block mb-ma-6">BADGES</span>
            <div className="flex gap-ma-2 flex-wrap">
              <Badge>Hakuba</Badge>
              <Badge variant="secondary">Nagano</Badge>
              <Badge variant="outline">Active Filter</Badge>
              <Badge variant="success">Low Risk</Badge>
              <Badge variant="warning">Review</Badge>
              <Badge variant="destructive">High Risk</Badge>
              <Badge variant="info">New Data</Badge>
            </div>
          </ScrollReveal>

          {/* Inputs */}
          <ScrollReveal className="mt-ma-16">
            <span className="label-overline block mb-ma-6">INPUTS</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-ma-4" style={{ maxWidth: 560 }}>
              <Input placeholder="Budget in ¥" />
              <Input placeholder="Ski days/year" type="number" />
              <Input placeholder="Disabled" disabled />
            </div>
          </ScrollReveal>

          {/* Decision Signals */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">DECISION SIGNALS · THE CORE PRODUCT MOMENT</span>
            <p className="caption mb-ma-8" style={{ maxWidth: 440 }}>
              Animated score counter (800ms). Color shifts at thresholds:
              70+ matsu, 40-69 kohaku, &lt;40 beni. Letter grades use ai.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-ma-4">
              <DecisionSignal score={82} label="Base Fit" context="Nozawa · Family · 14d/yr" />
              <DecisionSignal score={55} label="Value Index" context="Above median, Nagano 3LDK" />
              <DecisionSignal score={25} label="Rental Yield" context="Not suitable as investment" />
              <DecisionSignal score="A" label="Snow" context="Consistent Dec to Mar" />
            </div>
          </ScrollReveal>

          {/* Red Flag Panels */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">RED FLAG PANELS</span>
            <div className="space-y-ma-4" style={{ maxWidth: 560 }}>
              <RedFlagPanel
                title="Winter Access"
                description="2.3km from nearest maintained road. 4WD or snow chains required Dec to Mar."
                action="Confirm road maintenance with municipality."
              />
              <RedFlagPanel
                severity="warning"
                title="Snow Load"
                description="Annual snowfall exceeds 8m. Confirm roof rating and removal costs."
              />
            </div>
          </ScrollReveal>

          {/* Content Cards */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">CONTENT CARDS</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-ma-4">
              <ContentCard
                category="AREA GUIDE"
                title="Hakuba Valley"
                titleJa="白馬"
                description="Nagano Prefecture. 90 min from Tokyo. Premier powder."
                href="#"
              />
              <ContentCard
                category="COST ANALYSIS"
                title="Ownership Model"
                description="Purchase is just the start. See the full picture."
                href="#"
              />
              <ContentCard
                category="DUE DILIGENCE"
                title="Inspection Guide"
                titleJa="物件調査"
                description="What to check before you commit."
                href="#"
              />
            </div>
          </ScrollReveal>

          {/* Data Table */}
          <ScrollReveal className="mt-ma-24">
            <span className="label-overline block mb-ma-6">DATA TABLE</span>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Annual</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROPERTIES.map((p) => (
                  <TableRow key={p.area}>
                    <TableCell className="font-medium">{p.area}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell className="tabular-nums">{p.price}</TableCell>
                    <TableCell className="tabular-nums">{p.annual}</TableCell>
                    <TableCell>
                      <Badge variant={p.score >= 70 ? 'success' : 'warning'}>
                        {p.score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollReveal>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT VI · Motion
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-16">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">05 · MOTION</span>
            <h2 className="mb-ma-3">Two Tiers</h2>
          </ScrollReveal>

          <div className="mt-ma-12 grid grid-cols-1 sm:grid-cols-2 gap-ma-8">
            <ScrollReveal>
              <h3 className="mb-ma-4">Tier 1 · Always On</h3>
              <p className="text-sm text-sumi-light leading-body mb-ma-6">
                Functional micro-interactions. 150 to 300ms.
                Focus rings, hover states, accordion expand.
              </p>
              <div className="flex items-center gap-ma-4">
                <div className="data-text text-stone text-xs">ease-settle</div>
                <div className="flex-1 h-px bg-bamboo relative">
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-ai"
                    style={{
                      animation: 'slide-dot 2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite',
                    }}
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h3 className="mb-ma-4">Tier 2 · Editorial</h3>
              <p className="text-sm text-sumi-light leading-body mb-ma-6">
                Scroll reveals, parallax, seasonal particles.
                Disabled with <code className="text-xs bg-shoji px-1 rounded-lg">prefers-reduced-motion</code>.
              </p>
              <p className="caption">
                Motion budget: &lt; 15KB JS. CSS transforms + opacity only.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ══════════════════════════════════════════════════
          ACT VII · Rules
          ══════════════════════════════════════════════════ */}
      <section className="ma-page">
        <div className="pt-ma-24 pb-ma-32">
          <ScrollReveal>
            <span className="label-overline block mb-ma-4">06 · RULES</span>
            <h2 className="mb-ma-12">Constraints</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-ma-8">
            {[
              { rule: 'Max 3 colors per screen', detail: 'Sumi + washi + one accent or semantic. Need a fourth? Remove something.' },
              { rule: 'One primary CTA per viewport', detail: 'If two buttons compete, one becomes secondary or outline.' },
              { rule: 'Soft radius scale', detail: '6 to 16px radius. Buttons lg, cards xl, badges md. Warm and inviting, never sharp.' },
              { rule: 'Full-bleed photos only', detail: 'No thumbnails. Max 2 to 3 per page. Desaturated 10 to 15%, warm shift.' },
              { rule: 'Never bold a heading', detail: 'Shippori Mincho B1 at 400 always. Authority from size + surrounding Ma.' },
              { rule: '680px content width', detail: 'Single column default. Multi-column only for data grids and comparison.' },
            ].map((r, i) => (
              <ScrollReveal key={i} delay={(i % 3) * 100}>
                <h3 className="mb-ma-2 text-sm">{r.rule}</h3>
                <p className="caption text-xs leading-relaxed">{r.detail}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <MaDivider size="breath" line />

      {/* ══════════════════════════════════════════════════
          Colophon
          ══════════════════════════════════════════════════ */}
      <section className="ma-page pb-ma-32">
        <ScrollReveal className="pt-ma-16 text-center">
          <p className="caption">
            Ma Space v4 · Sumi &amp; Cedar · JapanoMa
          </p>
        </ScrollReveal>
      </section>

      {/* Keyframe for motion dot */}
      <style>{`
        @keyframes slide-dot {
          0%, 100% { left: 0; }
          50% { left: calc(100% - 8px); }
        }
      `}</style>
    </div>
  );
}
