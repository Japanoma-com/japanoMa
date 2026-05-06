// src/app/privacy/page.tsx
//
// IMPORTANT: This is starter / template copy aligned with the
// Australian Privacy Act 1988, Japan's Act on the Protection of
// Personal Information (APPI), and GDPR principles. It is NOT a
// substitute for review by qualified privacy counsel. Treat the
// content as a structured first draft for the legal team to refine
// before public release.
//
// Bumping the policy version: update PRIVACY_VERSION in
// src/lib/policies/versions.ts. Bumping invalidates every existing
// user acknowledgment and they will be prompted to re-accept on next
// signin.
import { LegalShell, type LegalSection } from '@/components/legal/legal-shell';
import { PRIVACY_VERSION, PRIVACY_LAST_UPDATED } from '@/lib/policies/versions';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How JapanoMa (Go&C Partners) collects, uses, discloses, transfers, secures, and retains your personal information — and the choices and rights you have.',
  alternates: { canonical: '/privacy' },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'collect',
    title: 'Types of Personal Information We Collect and Why',
    body: (
      <>
        <p>
          We collect only the personal information necessary for the purpose for which it is
          provided. The categories of information we may collect include:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            <strong>Account information</strong> — your name, email address, and password (stored
            as a salted hash). Collected when you create an account so we can authenticate you and
            personalise the journey.
          </li>
          <li>
            <strong>Quiz and preference responses</strong> — your answers to our recommendation
            quiz, including budget range, property preferences, and family composition. Used to
            generate matches between you and Northern Japan snow-country areas.
          </li>
          <li>
            <strong>Enquiry information</strong> — the contents of any message you send us through
            the contact form, lead-capture forms, or via the introductions you opt into.
          </li>
          <li>
            <strong>Saved items, notes, and bookmarks</strong> — content you choose to save inside
            your account. Visible only to you.
          </li>
          <li>
            <strong>Technical information</strong> — IP address, browser type, and operating
            system, captured at the time of authentication and significant actions (such as
            policy acknowledgments) for security and audit purposes.
          </li>
        </ul>
        <p>
          We do not collect or process payment-card information; no transactions occur on JapanoMa.
        </p>
      </>
    ),
  },
  {
    id: 'how-collect',
    title: 'How We Collect Your Personal Information',
    body: (
      <>
        <p>We collect personal information in the following ways:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            <strong>Directly from you</strong> when you create an account, complete the
            recommendation quiz, send us a contact message, save an item, or opt into an
            introduction.
          </li>
          <li>
            <strong>Automatically</strong> through privacy-respecting analytics (we use Plausible,
            which is cookieless and does not track individuals across sessions or sites).
          </li>
          <li>
            <strong>From third parties</strong> only where you have authorised the connection (for
            example, if you choose to sign in via a third-party identity provider).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How We Use Your Personal Information',
    body: (
      <>
        <p>We use your personal information for the following purposes:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>To provide, operate and improve the JapanoMa platform.</li>
          <li>
            To generate the personalised area recommendations, decision tools, and content shown
            on your account.
          </li>
          <li>
            To respond to your enquiries and, where you have requested it, to introduce you to
            licensed Japanese real-estate professionals or service providers.
          </li>
          <li>
            To maintain audit logs of authentication events and policy acknowledgments — required
            for our own legal protection and to demonstrate consent.
          </li>
          <li>
            To comply with our legal obligations and to enforce our Terms &amp; Conditions.
          </li>
        </ul>
        <p>
          We will not use your personal information for direct marketing without your express,
          separate consent. You can withdraw any such consent at any time.
        </p>
      </>
    ),
  },
  {
    id: 'disclose',
    title: 'How We Disclose Your Personal Information',
    body: (
      <>
        <p>We may disclose your personal information to:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            <strong>Licensed Japanese real-estate firms and service providers</strong> — only when
            you have explicitly opted into an introduction. We disclose any referral relationship
            before the handoff.
          </li>
          <li>
            <strong>Service providers and processors</strong> who host and operate the platform on
            our behalf (database, authentication, error monitoring, email delivery, analytics).
            These providers process your data only on our instructions and under contractual
            confidentiality and security obligations.
          </li>
          <li>
            <strong>Legal and regulatory authorities</strong> where we are required to do so by
            law, court order, or to establish or defend legal claims.
          </li>
          <li>
            <strong>A successor entity</strong> in the event of a merger, acquisition, or sale of
            assets, subject to the same protections set out here.
          </li>
        </ul>
        <p>
          We do not sell your personal information. We do not share it with advertising networks.
        </p>
      </>
    ),
  },
  {
    id: 'international',
    title: 'International Transfer of Personal Information',
    body: (
      <>
        <p>
          JapanoMa is operated from Australia and serves users primarily in Australia. Your
          personal information may be transferred to and processed in:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            <strong>Australia</strong> — the location of our primary database (Supabase Sydney
            region).
          </li>
          <li>
            <strong>Japan</strong> — when you opt into an introduction to a Japanese
            partner, your relevant contact details are transferred to that partner.
          </li>
          <li>
            <strong>Other jurisdictions</strong> — limited operational data may be processed by
            our service providers outside Australia (for example, error monitoring or content
            delivery). We use providers that maintain industry-standard data-protection
            commitments.
          </li>
        </ul>
        <p>
          Where personal information is transferred outside your country of residence, we take
          reasonable steps to ensure the recipient handles it consistent with this policy.
        </p>
      </>
    ),
  },
  {
    id: 'secure',
    title: 'How We Secure Your Personal Information',
    body: (
      <>
        <p>We protect personal information using a combination of technical and organisational measures:</p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>Encryption in transit (HTTPS / TLS) on every connection.</li>
          <li>Encryption at rest in the database for sensitive fields and authentication credentials.</li>
          <li>
            Row-level access controls so that one user cannot read another user&apos;s data,
            enforced at the database layer.
          </li>
          <li>Role-based administrative access on a least-privilege basis.</li>
          <li>Audit logs for authentication events and policy acknowledgments.</li>
          <li>Regular review of dependencies for known security vulnerabilities.</li>
        </ul>
        <p>
          No system is perfectly secure. If we become aware of a breach affecting your personal
          information we will notify you and the relevant authority where required by law.
        </p>
      </>
    ),
  },
  {
    id: 'retain',
    title: 'How We Retain Your Personal Information',
    body: (
      <>
        <p>
          We retain your personal information only for as long as it is necessary to fulfil the
          purposes for which it was collected, or as required by law:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            <strong>Account data</strong> — for the lifetime of your account. When you delete your
            account, we remove the associated personal information within 30 days, except where we
            are required to retain it for legal, audit, or anti-fraud purposes.
          </li>
          <li>
            <strong>Quiz responses, saved items and notes</strong> — for the lifetime of your
            account. Deleted with your account.
          </li>
          <li>
            <strong>Enquiry messages</strong> — retained for up to seven years to support
            continuity of the introduction relationship and for tax / record-keeping obligations.
          </li>
          <li>
            <strong>Policy acknowledgment records</strong> — retained indefinitely so that we can
            demonstrate the version of the Terms and Privacy Policy you accepted at signup, even
            after the policy has changed. This is for our legal protection and yours.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your Choices and Rights',
    body: (
      <>
        <p>
          Subject to applicable law, you have the following rights in relation to your personal
          information:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li><strong>Access</strong> — request a copy of the personal information we hold about you.</li>
          <li><strong>Correction</strong> — ask us to correct information that is inaccurate or out of date.</li>
          <li><strong>Deletion</strong> — ask us to delete your personal information, subject to lawful retention requirements.</li>
          <li><strong>Withdraw consent</strong> — for any processing that relies on your consent.</li>
          <li><strong>Object or restrict</strong> — object to, or ask us to restrict, certain types of processing.</li>
          <li><strong>Portability</strong> — request a machine-readable copy of the data you have provided.</li>
          <li><strong>Lodge a complaint</strong> — with your local privacy regulator (see Jurisdiction-Specific Notices below).</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:privacy@japanoma.com.au" className="text-ai hover:text-ai-deep underline underline-offset-[3px]">
            privacy@japanoma.com.au
          </a>
          . We will respond within the timeframe required by applicable law (generally 30 days in
          Australia and the EU).
        </p>
      </>
    ),
  },
  {
    id: 'other',
    title: 'Other Important Information',
    body: (
      <>
        <p>
          <strong>Cookies.</strong> We use a single first-party session cookie for authentication.
          We do not use third-party advertising cookies. Our analytics provider (Plausible) does
          not use cookies or persistent identifiers.
        </p>
        <p>
          <strong>Children.</strong> JapanoMa is not directed at children under 18. We do not
          knowingly collect personal information from children. If you believe a child has
          provided us with information, please contact us so we can delete it.
        </p>
        <p>
          <strong>Changes to this policy.</strong> We may update this policy from time to time.
          When we make material changes we will increment the version (shown at the top of this
          page) and you will be prompted to re-acknowledge on next signin.
        </p>
      </>
    ),
  },
  {
    id: 'jurisdiction',
    title: 'Jurisdiction-Specific Notices',
    body: (
      <>
        <p>
          <strong>Australia (Privacy Act 1988 and Australian Privacy Principles).</strong> If you
          are unsatisfied with our handling of your personal information you can lodge a complaint
          with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.
        </p>
        <p>
          <strong>Japan (Act on the Protection of Personal Information — APPI).</strong> Where the
          APPI applies to your personal information, you may exercise the rights granted under the
          APPI by contacting us. The supervisory authority is the Personal Information Protection
          Commission of Japan.
        </p>
        <p>
          <strong>European Economic Area / United Kingdom (GDPR / UK GDPR).</strong> Where the
          GDPR or UK GDPR applies, our lawful bases for processing include contract, consent,
          legitimate interests, and legal obligation. You have the right to lodge a complaint with
          your local data-protection authority.
        </p>
        <p>
          <strong>California (CCPA/CPRA).</strong> California residents have the right to know,
          delete, correct, and opt out of the sale or sharing of personal information. We do not
          sell personal information.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: (
      <>
        <p>
          For privacy enquiries, requests to exercise your rights, or to report a concern:
        </p>
        <ul className="list-disc pl-ma-6 space-y-ma-2">
          <li>
            Email{' '}
            <a href="mailto:privacy@japanoma.com.au" className="text-ai hover:text-ai-deep underline underline-offset-[3px]">
              privacy@japanoma.com.au
            </a>
          </li>
          <li>Postal: Go&amp;C Partners, c/o JapanoMa Privacy Officer (address available on request)</li>
        </ul>
        <p>
          We will acknowledge receipt within 7 days and respond substantively within the timeframe
          required by applicable law.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      overline="Legal"
      title="Privacy Policy"
      version={PRIVACY_VERSION}
      lastUpdated={PRIVACY_LAST_UPDATED}
      reviewNotice={
        <>
          <strong>Awaiting legal review.</strong> The text below is a structured first draft
          aligned with the Australian Privacy Act 1988, Japan&apos;s APPI, and GDPR principles.
          It must be reviewed and finalised by qualified privacy counsel before public release.
        </>
      }
      intro={
        <>
          JapanoMa is operated by <strong>Go&amp;C Partners</strong>. This policy explains what
          personal information we collect about you, why we collect it, how we use and protect
          it, who we share it with, and the choices and rights you have over it. It applies to
          your use of japanoma.com.au and any other digital surface that links to this page.
        </>
      }
      sections={SECTIONS}
    />
  );
}
