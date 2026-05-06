// src/app/terms/page.tsx
//
// IMPORTANT: This is starter / template copy aligned with the Australian
// Consumer Law and standard SaaS terms-of-service patterns. It is NOT a
// substitute for review by qualified legal counsel. Treat the content
// as a structured first draft for the legal team to refine before
// public release.
//
// Bumping the policy version: update TERMS_VERSION in
// src/lib/policies/versions.ts. Bumping invalidates every existing
// user acknowledgment and they will be prompted to re-accept on next
// signin.
import { LegalShell, type LegalSection } from '@/components/legal/legal-shell';
import { TERMS_VERSION, TERMS_LAST_UPDATED } from '@/lib/policies/versions';

export const metadata = {
  title: 'Terms & Conditions',
  description:
    'JapanoMa terms & conditions — the rules of using our decision-aid platform for Australian buyers exploring Japan ski-country property.',
  alternates: { canonical: '/terms' },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    body: (
      <>
        <p>
          By creating an account, ticking the acknowledgment checkbox at signup, or otherwise
          using JapanoMa, you agree to these Terms &amp; Conditions and to our{' '}
          <a href="/privacy" className="text-ai hover:text-ai-deep underline underline-offset-[3px]">
            Privacy Policy
          </a>
          . If you do not agree, please do not use the site.
        </p>
        <p>
          We may update these terms from time to time. When we make material changes we will
          increment the version shown at the top of this page; you will be prompted to
          re-acknowledge on your next signin. Continued use of the site after a re-acknowledgment
          prompt constitutes acceptance of the updated terms.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-are',
    title: 'What JapanoMa Is — and Is Not',
    body: (
      <>
        <p>
          JapanoMa is a <strong>decision-aid platform</strong> operated by Go&amp;C Partners. We
          provide:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>Educational content about Northern Japan snow-country property ownership.</li>
          <li>Cost models, decision tools, and area recommendations.</li>
          <li>
            On request, introductions to <strong>licensed Japanese real-estate firms</strong> and
            other service professionals.
          </li>
        </ul>
        <p>We are <strong>not</strong>:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>A property listings portal.</li>
          <li>A buyer&apos;s agent or broker.</li>
          <li>A licensed financial, legal, or tax adviser.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'educational',
    title: 'Educational Nature — Not Advice',
    body: (
      <>
        <p>
          The information on JapanoMa is general and educational. It does not constitute
          financial, legal, tax, or real-estate advice. Property purchase in Japan has legal,
          tax, currency, and regulatory consequences specific to your situation. Always consult
          qualified, licensed professionals in the relevant jurisdictions before making any
          decision.
        </p>
        <p>
          Cost estimates, snow conditions, market figures, and tax assumptions on the site
          reflect our understanding at the time of publication and may be out of date.
        </p>
      </>
    ),
  },
  {
    id: 'no-transactions',
    title: 'No Transactions on JapanoMa',
    body: (
      <>
        <p>
          No property, financial, or service transactions occur on this site. When you engage
          with a licensed professional we have introduced you to, you transact with that
          professional <strong>directly under their terms</strong> — not under ours. Any fees,
          contracts, deposits, commitments, or refunds are between you and that professional.
        </p>
      </>
    ),
  },
  {
    id: 'referrals',
    title: 'Referral Disclosures',
    body: (
      <>
        <p>
          We may receive referral fees from licensed Japanese real-estate firms and service
          providers in respect of introductions made through our platform. We disclose any such
          relationship before any handoff. Receipt of a referral fee does not influence the
          information, recommendations, or area scoring shown to you on JapanoMa — our editorial
          content remains independent of commercial relationships.
        </p>
      </>
    ),
  },
  {
    id: 'account',
    title: 'Account, Security, and Acceptable Use',
    body: (
      <>
        <p>
          You are responsible for keeping your account credentials secure and for all activity
          under your account. Notify us promptly if you suspect unauthorised access.
        </p>
        <p>You agree not to:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>Use the site to violate any law or third-party right.</li>
          <li>
            Scrape, copy, or systematically extract content from the site beyond fair quotation
            with attribution.
          </li>
          <li>
            Attempt to interfere with the operation of the site, probe for vulnerabilities, or
            circumvent access controls.
          </li>
          <li>Impersonate another person or submit false information through our forms.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    body: (
      <>
        <p>
          All content on JapanoMa — text, tools, calculators, illustrations, photography, and
          source code — is owned by Go&amp;C Partners or licensed for our use. You may share
          links and quote brief excerpts with attribution. You may not republish, redistribute,
          or commercialise our content without prior written permission.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    body: (
      <>
        <p>
          The site is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as
          available&quot;</strong>. To the maximum extent permitted by law we exclude all
          warranties, whether express or implied, in respect of the site and its content,
          including warranties of merchantability, fitness for a particular purpose, accuracy,
          and non-infringement.
        </p>
        <p>
          Property ownership in Japan carries currency, tax, regulatory, and natural-hazard risks
          (including earthquake, snow load, and tsunami exposure depending on location). Verify
          current conditions with qualified local advisors before committing.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by law, Go&amp;C Partners is not liable for any
          indirect, incidental, special, or consequential losses arising from your use of, or
          reliance on, JapanoMa, or from any dealings between you and a third-party professional
          we have introduced you to.
        </p>
        <p>
          Nothing in these terms excludes, restricts, or modifies any consumer guarantee, right,
          or remedy that cannot lawfully be excluded under the Australian Consumer Law or
          equivalent legislation in your jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <>
        <p>
          You may close your account at any time from the settings page. We may suspend or
          terminate access for material breach of these terms, suspected fraudulent or unlawful
          activity, or where required by law. Provisions that by their nature should survive
          termination (intellectual property, disclaimers, limitation of liability, governing
          law) will survive.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Disputes',
    body: (
      <>
        <p>
          These terms are governed by the laws of New South Wales, Australia. The parties submit
          to the non-exclusive jurisdiction of the courts of New South Wales and the Federal
          Court of Australia. Nothing in this clause affects any non-excludable right to bring
          proceedings in another jurisdiction afforded by applicable consumer protection law.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <p>
          For questions about these terms, contact Go&amp;C Partners at{' '}
          <a href="mailto:hello@japanoma.com.au" className="text-ai hover:text-ai-deep underline underline-offset-[3px]">
            hello@japanoma.com.au
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      overline="Legal"
      title="Terms & Conditions"
      version={TERMS_VERSION}
      lastUpdated={TERMS_LAST_UPDATED}
      reviewNotice={
        <>
          <strong>Awaiting legal review.</strong> The text below is a structured first draft. It
          must be reviewed and finalised by qualified legal counsel before public release.
        </>
      }
      intro={
        <>
          These Terms &amp; Conditions govern your use of JapanoMa, a decision-aid platform
          operated by <strong>Go&amp;C Partners</strong>. By creating an account or otherwise
          using the site, you agree to be bound by them. Read carefully — they include important
          disclaimers about the educational nature of our content and the limits of our
          liability.
        </>
      }
      sections={SECTIONS}
    />
  );
}
