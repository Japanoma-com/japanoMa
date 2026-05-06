import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { ScrollReveal } from '@/components/japandi';

export const metadata = {
  title: 'About',
  description:
    'An Australia-focused decision-aid platform for owning a non-metro Japanese home base. Honest costs, local partners, and a founder who has lived both sides.',
  alternates: { canonical: '/about' },
};

const DIFFERENTIATORS = [
  {
    title: 'A trust bridge between Australia and Japan.',
    body: 'Designed specifically for Australians. The questions, assumptions, examples, and concerns are relevant from day one — not a generic foreign-buyer portal translated on the fly.',
  },
  {
    title: 'Unique access to a major rural Japan partner network.',
    body: 'We work with Katitas, a company established in 1978 and No. 1 in Japan\u2019s detached-house purchase-and-resale category for 12 consecutive years. That means local sourcing, filtering, renovation capability, and on-the-ground execution in regional Japan — not just online listings.',
  },
  {
    title: 'Turn-key readiness over bargain hunting.',
    body: 'Many sites help people find cheap properties. Far fewer help them reduce the fear of hidden defects, repair costs, renovation surprises, and the burden of managing everything from overseas.',
  },
  {
    title: 'Decision support for the full ownership journey.',
    body: 'This is about more than finding a house. It\u2019s about thinking through the reality of ownership: taxes, upkeep, FX exposure, renovation risk, winter access, local norms, language, and what happens when the owner is overseas.',
  },
];

const KATITAS_FACTS = [
  { k: 'Established', v: '1978' },
  { k: 'No. 1 (Japan)', v: '12 yrs' },
  { k: 'Sales locations', v: '152' },
  { k: 'Partner contractors', v: '1,292' },
  { k: 'Partner agencies', v: '2,857' },
];

const DECISION_QUESTIONS = [
  'Should I buy at all?',
  'Should I wait?',
  'What kind of property fits my actual use pattern?',
  'What does ownership cost in full, not just at purchase?',
  'What red flags matter in snow country?',
  'What would make this exciting idea become a burden?',
];

const NOT_LIST = [
  'a "cheap akiya bargain" site.',
  'a Tokyo or Osaka yield-investment marketplace.',
  'a hype-driven real estate portal.',
  'here to pressure you into buying.',
];

export default function AboutPage() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          About — dossier opening. Overline + long serif lead +
          a quiet promise pull. Matches the home page's chapter
          grammar but starts at its own Vol. II convention.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 pt-ma-24 sm:pt-ma-32 pb-ma-16 sm:pb-ma-24 overflow-hidden">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-ma-4 mb-ma-12 sm:mb-ma-16">
              <div className="flex items-baseline gap-ma-3">
                <span className="font-editorial italic text-stone text-base">Vol. II</span>
                <span aria-hidden className="block w-6 h-px bg-sumi/30" />
                <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone tabular-nums">
                  MMXXVI
                </span>
              </div>
              <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone tabular-nums">
                About &middot; 00
              </span>
            </div>
            <span aria-hidden className="block w-full h-px bg-sumi/20 mb-ma-12 sm:mb-ma-16" />
          </ScrollReveal>

          <ScrollReveal>
            <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-6">
              About
            </p>
            <h1
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.02] mb-ma-12"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw + 0.5rem, 4.25rem)' }}
            >
              Australia-focused guidance<br />
              for buying affordable,<br />
              turn-key homes in Japan.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[600px]">
              <p className="text-lg">
                We help Australians make clear, grounded decisions about whether owning a
                home in Japan makes sense for their lifestyle, budget, and risk tolerance.
              </p>
              <p>
                Our focus is non-metro Japan by design — especially Northern Japan snow
                country for ski lovers, repeat travellers, couples, and families who want
                a reliable home base rather than another year of rising trip costs,
                booking friction, and uncertainty.
              </p>
              <p>
                This is not a generic foreign-buyer portal. It is not a cheap-akiya-hunt
                site. And it is not a pressure-based brokerage funnel. It is an
                Australia-focused decision-aid platform built to help you understand the
                full picture before you commit: what ownership really costs, what can go
                wrong, what to check, and what type of property is actually right for
                you.
              </p>
            </div>
          </ScrollReveal>

          {/* The promise pull — the one line to remember */}
          <ScrollReveal delay={200}>
            <blockquote className="mt-ma-16 sm:mt-ma-24 pl-ma-8 border-l-2 border-ai">
              <p
                className="font-editorial text-sumi leading-[1.2] tracking-[-0.015em]"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
              >
                Own a Japan ski home base<br />
                with clarity &mdash; not guesswork.
              </p>
              <cite className="not-italic block mt-ma-4 font-editorial italic text-stone">
                And even if you don&rsquo;t buy, you should still leave with the truth.
              </cite>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 01 — Why we exist. Mottainai.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 01
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Why we exist
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <p className="font-editorial italic text-stone mb-ma-6 text-lg">Mottainai &mdash;</p>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-12"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              It is a shame to waste something<br />that still has life in it.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[600px]">
              <p>
                Many older homes in Japan are undervalued or dismissed too quickly. Some
                deserve that caution. Some do not. We believe the right older homes, when
                chosen carefully and handled properly, can become wonderful homes again.
              </p>
              <p>
                Australians often bring a different mindset. In Australia, older homes
                are more often seen as worth improving, modernising, and passing on. That
                mindset can be powerful in Japan too — not as blind optimism, but as
                thoughtful stewardship.
              </p>
              <p>
                We want to help Australians appreciate the right homes, avoid the wrong
                ones, and choose properties that are genuinely workable for the life they
                want to live in Japan.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p
              className="mt-ma-16 sm:mt-ma-20 pt-ma-8 border-t border-border font-editorial italic text-sumi leading-[1.4] max-w-[600px]"
              style={{ fontSize: 'clamp(1.25rem, 0.8vw + 1rem, 1.75rem)' }}
            >
              &mdash; Aussies are the key to staying true to mottainai values for homes
              among Japanese.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 02 — What makes us different.
          Four numbered differentiators + a Katitas stat plate.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 02
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                What makes us different
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-16 sm:mb-ma-20"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              Four things that set<br />this platform apart.
            </h2>
          </ScrollReveal>

          <ol className="space-y-ma-8 sm:space-y-ma-12">
            {DIFFERENTIATORS.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 60}>
                <li className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr] gap-ma-4 sm:gap-ma-6 pb-ma-6 border-b border-border">
                  <span
                    className="font-editorial text-stone tabular-nums leading-none pt-1"
                    style={{ fontSize: 'clamp(1.5rem, 1.2vw + 0.75rem, 2rem)' }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3
                      className="font-editorial text-sumi leading-[1.2] mb-ma-3"
                      style={{ fontSize: 'clamp(1.25rem, 0.8vw + 0.875rem, 1.5rem)', fontWeight: 400 }}
                    >
                      {d.title}
                    </h3>
                    <p className="text-sumi-light text-[15px] sm:text-base leading-[1.65]">
                      {d.body}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>

          {/* Katitas facts plate — gives the partner network real shape */}
          <ScrollReveal delay={240}>
            <div className="mt-ma-16 sm:mt-ma-20 p-ma-6 sm:p-ma-8 bg-shoji border border-border">
              <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-4">
                Katitas &mdash; partner facts
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-5 gap-y-ma-4 gap-x-ma-4">
                {KATITAS_FACTS.map(({ k, v }) => (
                  <div key={k} className="flex flex-col gap-1">
                    <dt className="font-ui text-[9px] tracking-[0.25em] uppercase text-stone">
                      {k}
                    </dt>
                    <dd className="font-editorial text-sumi text-xl tabular-nums leading-none">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 03 — Our approach.
          Six questions we start with, then the bias + path choice.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 03
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Our approach
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-8"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              A decision-aid platform,<br />not a listings portal.
            </h2>
            <p className="text-sumi-light leading-body max-w-[600px] text-lg mb-ma-12 sm:mb-ma-16">
              And not a buyer&rsquo;s agent from day one. We start with the questions that
              matter most to you.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <ol className="space-y-ma-4 mb-ma-16 sm:mb-ma-20">
              {DECISION_QUESTIONS.map((q, i) => (
                <li key={i} className="flex items-baseline gap-ma-4 pb-ma-3 border-b border-border">
                  <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone tabular-nums w-6 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="font-editorial italic text-sumi text-lg sm:text-xl leading-[1.5]">
                    {q}
                  </span>
                </li>
              ))}
            </ol>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[600px]">
              <p>
                Our bias is toward <span className="text-sumi">clarity, financial realism,
                risk control,</span> and <span className="text-sumi">lifestyle fit</span>.
              </p>
              <p>
                We showcase many affordable, turn-key-ready homes, because for many
                Australians that is the most practical, lower-stress path to ownership.
              </p>
              <p>
                At the same time, some buyers want different choices. So we may also
                introduce not-yet-inspected homes to those who want to consider that
                option, and help connect you with inspection and renovation assistance so
                you are not left navigating those steps alone.
              </p>
              <p>
                That means you can choose between a more ready-to-go path and a more
                project-based path, with clearer support around the risks and trade-offs
                of each.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 04 — Fees & fairness.
          Full transparency about how we make money, with an
          Australia ↔ Japan transaction comparison plate.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 04
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Fees &amp; fairness
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-8"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              Transparent about<br />how we&rsquo;re paid.
            </h2>
            <p className="text-sumi-light leading-body max-w-[600px] text-lg mb-ma-12 sm:mb-ma-16">
              We want to be clear about how we make money &mdash; because transparency
              builds trust, and because it explains why the incentives here are different
              from what you may be used to.
            </p>
          </ScrollReveal>

          {/* The comparison plate — AU vs JP transaction costs */}
          <ScrollReveal delay={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border mb-ma-16 sm:mb-ma-20">
              <div className="bg-shoji p-ma-6 sm:p-ma-8">
                <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-4">
                  Australia &mdash; typical transaction
                </p>
                <p className="font-editorial text-sumi text-xl sm:text-2xl leading-[1.2] mb-ma-6">
                  On a A$1.07M home
                </p>
                <dl className="space-y-ma-4 text-sm">
                  <div className="flex justify-between gap-ma-4 pb-ma-2 border-b border-border">
                    <dt className="text-sumi-light">Seller&rsquo;s agent (2.31%)</dt>
                    <dd className="font-editorial text-sumi tabular-nums">≈ A$24,826</dd>
                  </div>
                  <div className="flex justify-between gap-ma-4 pb-ma-2 border-b border-border">
                    <dt className="text-sumi-light">Buyer&rsquo;s agent (2&ndash;3% + GST)</dt>
                    <dd className="font-editorial text-sumi tabular-nums text-right">
                      ≈ A$23,643&ndash;<br className="sm:hidden" />35,465
                    </dd>
                  </div>
                  <div className="flex justify-between gap-ma-4 pt-ma-2">
                    <dt className="font-editorial italic text-sumi">Possible total</dt>
                    <dd className="font-editorial text-sumi tabular-nums font-medium">
                      ≈ A$48,000&ndash;60,000+
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-shoji p-ma-6 sm:p-ma-8">
                <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-matsu mb-ma-4">
                  Japan &mdash; typical transaction
                </p>
                <p className="font-editorial text-sumi text-xl sm:text-2xl leading-[1.2] mb-ma-6">
                  On a ~A$250K / ¥28M home
                </p>
                <dl className="space-y-ma-4 text-sm">
                  <div className="flex justify-between gap-ma-4 pb-ma-2 border-b border-border">
                    <dt className="text-sumi-light">Brokerage cap (one side)</dt>
                    <dd className="font-editorial text-sumi tabular-nums">3% + ¥60k + tax</dd>
                  </div>
                  <div className="flex justify-between gap-ma-4 pb-ma-2 border-b border-border">
                    <dt className="text-sumi-light">At this price point</dt>
                    <dd className="font-editorial text-sumi tabular-nums">≈ A$8,800&ndash;8,900</dd>
                  </div>
                  <div className="flex justify-between gap-ma-4 pt-ma-2">
                    <dt className="font-editorial italic text-sumi">Far below AU norms</dt>
                    <dd className="font-editorial text-matsu tabular-nums font-medium">✓</dd>
                  </div>
                </dl>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[620px]">
              <p>
                Japanese property businesses may pay us for Australia-focused decision-aid
                marketing and education. That isn&rsquo;t simply about putting listings in
                front of people &mdash; it funds the content, tools, and guidance that
                help Australians understand the lifestyle, cost, and risk considerations
                of owning in Japan before they speak to a licensed property professional.
              </p>
              <p>
                Australian buyers may also choose to pay us for optional value-added
                services if they want extra support &mdash; inspections, renovation
                coordination, ownership setup, or other practical help from decision
                through to living in Japan.
              </p>
            </div>
          </ScrollReveal>

          {/* Three-line fairness model */}
          <ScrollReveal delay={240}>
            <ul className="mt-ma-12 sm:mt-ma-16 space-y-ma-3 border-t border-sumi/15 pt-ma-8">
              {[
                'Japanese property businesses may pay us for Australia-focused education and decision-aid reach.',
                'Buyers may choose to pay us for extra help they actually want.',
                'Buyers are never locked in to our recommended providers.',
              ].map((line, i) => (
                <li key={i} className="flex items-baseline gap-ma-4">
                  <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-ai tabular-nums w-6 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="font-editorial text-sumi text-base sm:text-lg leading-[1.55]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={320}>
            <p className="mt-ma-12 sm:mt-ma-16 text-sumi-light leading-body max-w-[620px]">
              If a home is owned and sold directly by Katitas, there may not be a separate
              seller-side broker. Buyers still have normal purchase-side costs and may
              still choose optional support services &mdash; but they are never locked
              into our network if they already have professionals they trust. This
              platform is education-first and decision-first, not a closed system.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 05 — What we are not. Same strike-through grammar
          as the home page, but with About-specific copy.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 05
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                What we are not
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-12 sm:mb-ma-16"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              Here to help Australians<br />decide first, buy second.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <ul className="space-y-ma-4 sm:space-y-ma-6">
              {NOT_LIST.map((line, i) => (
                <li key={i} className="flex items-baseline gap-ma-4 pb-ma-3 border-b border-border">
                  <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone tabular-nums w-10 shrink-0">
                    No. 0{i + 1}
                  </span>
                  <span className="font-editorial text-sumi-light text-base sm:text-lg leading-[1.55] line-through decoration-sumi/15 decoration-[1px]">
                    We are not {line}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 06 — Founder's message.
          Kaz speaking personally. Pull quote opening + long
          first-person prose + family architect context +
          signature block.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 06
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Founder&rsquo;s message
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-6">
              A letter from the founder
            </p>
            <blockquote className="border-l-2 border-ai pl-ma-8 mb-ma-16 sm:mb-ma-20">
              <p
                className="font-editorial text-sumi leading-[1.25] tracking-[-0.015em]"
                style={{ fontSize: 'clamp(1.5rem, 2.4vw + 0.5rem, 2.5rem)' }}
              >
                I am Japanese, and Japan will always be my home &mdash; but I am proud
                to call Australia my second home for my family.
              </p>
              <cite className="not-italic block mt-ma-4 font-editorial italic text-stone">
                I hope others can feel truly at home in both places.
              </cite>
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[620px]">
              <p>
                That is a big part of why I built this platform. For many people,
                especially ski lovers and families, the dream is not to visit Japan
                once. It is to come back again and again, with less hassle, more
                familiarity, and a place that starts to feel like your own base rather
                than another temporary booking.
              </p>
              <p>But between dream and decision sits a lot of uncertainty.</p>
            </div>
          </ScrollReveal>

          {/* The worry list — the six questions every serious buyer has */}
          <ScrollReveal delay={160}>
            <ul className="mt-ma-8 mb-ma-12 space-y-ma-2 pl-ma-6 border-l border-border max-w-[620px]">
              {[
                'Should we buy at all?',
                'Can we really manage a place in Japan from Australia?',
                'What if the house has hidden issues?',
                'What if winter access is harder than expected?',
                'What happens when we are not there?',
                'Will this become a lifestyle upgrade — or a burden?',
              ].map((q, i) => (
                <li
                  key={i}
                  className="font-editorial italic text-sumi-light text-base sm:text-lg leading-[1.55]"
                >
                  {q}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[620px]">
              <p>
                Those questions deserve better answers than hype, pressure, or a pile of
                listings.
              </p>
              <p>
                My perspective is personal, not just commercial. It comes from real
                ownership experience across both Japan and Australia &mdash; which means
                I understand the practical concerns Australians genuinely worry about
                when considering property in Japan: hidden defects, maintenance
                realities, language barriers, distance, and whether the whole thing will
                actually work in day-to-day life.
              </p>
            </div>
          </ScrollReveal>

          {/* Family architect — a dossier callout */}
          <ScrollReveal delay={280}>
            <aside className="mt-ma-12 sm:mt-ma-16 p-ma-6 sm:p-ma-8 bg-shoji border-l-2 border-sumi/40">
              <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-3">
                Family context &mdash; 一級建築士
              </p>
              <p className="font-editorial text-sumi text-lg sm:text-xl leading-[1.5] mb-ma-3">
                My father is a First-Class Architect in Japan.
              </p>
              <p className="text-sumi-light text-sm sm:text-[15px] leading-[1.65]">
                Japan&rsquo;s Ministry of Land, Infrastructure, Transport and Tourism
                defines a First-Class Architect as a person licensed by the Minister to
                carry out architectural design, construction supervision, and related
                work. He has designed high-rises, shopping centres, public school
                buildings, and homes &mdash; and continues to play an advisory role in
                this business.
              </p>
            </aside>
          </ScrollReveal>

          <ScrollReveal delay={340}>
            <div className="mt-ma-12 sm:mt-ma-16 space-y-ma-6 text-sumi-light leading-body max-w-[620px]">
              <p>
                I also feel privileged to work with a trusted rural Japan partner network
                with deep operational experience on the ground. That matters because, for
                Australians, the biggest fear is often not ownership itself &mdash; it is
                what happens after purchase: hidden defects, repairs, snow, maintenance,
                language, local coordination, and whether the property starts demanding
                more than it gives back.
              </p>
              <p>
                That is why I care so much about turn-key readiness over bargain hunting.
                Cheap and good value are not the same thing. A house that costs more
                upfront but has already been selected well, checked properly, and made
                ready for practical use can save an enormous amount of time, stress, and
                money later.
              </p>
              <p>
                At the same time, some buyers want to consider less-ready homes too. That
                is fine. My goal is not to force one path &mdash; it is to help you see
                the trade-offs clearly, and to support you with inspection and renovation
                assistance if you choose the more project-based route.
              </p>
              <p>
                I am not here to push people into buying. A trustworthy platform should
                also help people decide not to buy &mdash; or not yet &mdash; when the
                fit is wrong.
              </p>
            </div>
          </ScrollReveal>

          {/* The three aspirations */}
          <ScrollReveal delay={400}>
            <div className="mt-ma-16 sm:mt-ma-20 pt-ma-8 border-t border-sumi/15 max-w-[620px]">
              <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-6">
                Because the goal is bigger than a transaction.
              </p>
              <ul className="space-y-ma-4">
                {[
                  'To help Australians make financially sound, lifestyle-aligned decisions about owning in Japan.',
                  'To help the right older Japanese homes get another life — and revitalise the local community.',
                  'To build a more honest, practical bridge between Australia and Japan.',
                ].map((line, i) => (
                  <li key={i} className="flex items-baseline gap-ma-4">
                    <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-ai tabular-nums w-6 shrink-0">
                      0{i + 1}
                    </span>
                    <span className="font-editorial text-sumi text-base sm:text-lg leading-[1.55]">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Sign-off line */}
          <ScrollReveal delay={460}>
            <p
              className="mt-ma-16 sm:mt-ma-20 font-editorial italic text-sumi leading-[1.3]"
              style={{ fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2.25rem)' }}
            >
              From ski trips to a home base &mdash;<br />
              <span className="text-sumi-light not-italic font-normal">
                we aspire to be your partner. Go &amp; C it for yourself, and decide with
                confidence.
              </span>
            </p>
          </ScrollReveal>

          {/* Signature block */}
          <ScrollReveal delay={540}>
            <div className="mt-ma-12 sm:mt-ma-16 pt-ma-6 border-t border-border flex flex-wrap items-baseline justify-between gap-ma-4">
              <div>
                <p className="font-editorial italic text-sumi text-xl">Kaz Yasumura</p>
                <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone mt-ma-1">
                  Founder, Go&amp;C Partners
                </p>
              </div>
              <span className="font-ui text-[10px] tracking-[0.28em] uppercase text-stone tabular-nums">
                Tokyo &middot; Sydney
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Closing CTA — returns the reader to action */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex flex-row flex-wrap items-end gap-x-ma-4 gap-y-ma-3 sm:gap-x-ma-6">
              <ButtonLink href="/quiz" size="lg">
                Take the quiz
              </ButtonLink>
              <Link
                href="/areas"
                className="text-sumi-light text-xs tracking-[0.2em] uppercase font-ui font-medium border-b border-sumi/20 pb-1.5 transition-all duration-base ease-settle hover:text-sumi hover:border-sumi hover:tracking-[0.25em]"
              >
                or explore areas
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="mt-ma-16 pt-ma-6 border-t border-sumi/15">
              <div className="flex flex-wrap items-center justify-between gap-ma-4 font-ui text-[10px] tracking-[0.28em] uppercase text-stone tabular-nums">
                <span>Vol. II &middot; MMXXVI</span>
                <span aria-hidden className="hidden sm:block flex-1 h-px bg-sumi/10 max-w-[120px]" />
                <span>About &middot; 00</span>
                <span aria-hidden className="hidden sm:block flex-1 h-px bg-sumi/10 max-w-[120px]" />
                <span className="font-editorial italic text-stone normal-case tracking-normal">
                  &mdash; fin. &mdash;
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
