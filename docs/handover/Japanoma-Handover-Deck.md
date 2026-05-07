---
marp: true
theme: default
size: 16:9
paginate: true
backgroundColor: "#F5F0E8"
color: "#1A1816"
style: |
  section {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    padding: 64px 80px;
    background: #F5F0E8;
    color: #1A1816;
  }
  h1 {
    font-family: "Shippori Mincho B1", "Hiragino Mincho ProN", serif;
    font-weight: 400;
    font-size: 64px;
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: #1A1816;
    margin: 0 0 32px;
  }
  h2 {
    font-family: "Shippori Mincho B1", "Hiragino Mincho ProN", serif;
    font-weight: 400;
    font-size: 44px;
    line-height: 1.1;
    color: #1A1816;
    margin: 0 0 24px;
  }
  h3 {
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #8A8279;
    margin: 0 0 12px;
  }
  p, li {
    font-size: 22px;
    line-height: 1.55;
    color: #3D3833;
  }
  strong { color: #1A1816; }
  em { color: #3D5A7A; }
  .overline {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #8A8279;
    margin-bottom: 16px;
  }
  .muted { color: #8A8279; }
  .footer-note {
    position: absolute;
    bottom: 32px;
    left: 80px;
    right: 80px;
    font-size: 14px;
    color: #8A8279;
    border-top: 1px solid #E5E0D8;
    padding-top: 12px;
  }
  table {
    border-collapse: collapse;
    font-size: 18px;
  }
  th, td {
    text-align: left;
    padding: 8px 16px 8px 0;
    border-bottom: 1px solid #E5E0D8;
  }
  th { color: #8A8279; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; font-size: 13px; }
  img { background: transparent; }
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  section.title h1 { font-size: 96px; }
---

<!-- _class: title -->

<p class="overline">A decision-aid platform for Australian buyers</p>

# Japanoma
## MVP Handover Report

<p style="margin-top:48px;font-size:18px;color:#8A8279;">
Built by Craefto for Go&amp;C Partners · 2026-05-07
</p>

<p class="footer-note">Operated by Go&amp;C Partners · Kaz Yasumura, Director · Shiun, CMO</p>

---

## In one sentence

> Help Australian ski-lovers decide whether — and where — to buy a home base in Northern Japan, with **transparent total-cost models, practical due diligence, and introductions** to licensed local professionals.

<p style="margin-top:48px;color:#3D5A7A;font-style:italic;font-size:24px;">
&ldquo;Own a Japan ski home base with clarity — not guesswork.&rdquo;
</p>

---

## What "MVP" means today

<table>
<tr><td>**24** routes built</td><td>**24** Postgres migrations applied</td></tr>
<tr><td>**459** tracked source files</td><td>**8** architecture diagrams</td></tr>
<tr><td>**HTTP 200** on every public route</td><td>Build verified clean</td></tr>
<tr><td>**Two** production deployments</td><td>Pre-launch gate live</td></tr>
</table>

<p class="muted" style="margin-top:48px;">
Functionally complete · Production-deployed · Coming-soon-gated until Kaz approves
</p>

---

## Tech stack

<table>
<tr><th>Layer</th><th>Choice</th></tr>
<tr><td>Framework</td><td>Next.js 15 · App Router · React 19 · RSC</td></tr>
<tr><td>Language</td><td>TypeScript 5</td></tr>
<tr><td>UI</td><td>shadcn/ui + Tailwind v4 + bespoke "Ma Space"</td></tr>
<tr><td>Database</td><td>Supabase Postgres · Sydney · Drizzle ORM</td></tr>
<tr><td>Auth</td><td>Supabase Auth · anonymous-first sessions</td></tr>
<tr><td>CMS</td><td>Sanity · production dataset</td></tr>
<tr><td>3D map</td><td>three.js + @react-three/fiber + drei</td></tr>
<tr><td>Email · analytics · errors</td><td>Resend · Plausible · Sentry</td></tr>
<tr><td>Hosting</td><td>Vercel</td></tr>
</table>

---

## System architecture

![System architecture diagram height:520px](../diagrams/01-system-architecture.png)

---

## Deployment topology

![Deployment topology diagram height:520px](../diagrams/02-deployment-topology.png)

---

## Database

![Database ERD height:520px](../diagrams/03-database-erd.png)

---

## D2L user journey

![D2L journey diagram height:520px](../diagrams/05-d2l-journey.png)

---

## Lead capture & consent

![Lead capture flow height:520px](../diagrams/06-lead-capture.png)

---

## Compliance state

| Item | Status |
| --- | --- |
| Privacy Policy (11 sections) | ✓ Built · **awaiting legal review** |
| Terms & Conditions | ✓ Built · **awaiting legal review** |
| Required signup acknowledgment | ✓ Live |
| Append-only audit log | ✓ `policy_acknowledgments` retained indefinitely |
| Cookieless analytics | ✓ Plausible (when key set) |
| Anonymous-first sessions | ✓ Quiz / browse / save without account |
| Versioned consent records | ✓ With IP-hash + UA |
| WCAG 2.1 AA | In progress · `inert` mobile menu, focus traps, aria-live announcements |

---

## What's deferred

<p class="overline">Not blocking handover</p>

- **Legal counsel review** of `/privacy` + `/terms` wording → lift the on-page banner
- **DNS** — point `japanoma.com.au` at Vercel
- **Resend domain verification** — DKIM, SPF, DMARC records
- **Sentry / Plausible env keys** — set when those services are provisioned
- **Re-acknowledgment middleware** — gate next signin on stale policy version

---

## Two deployments

<table>
<tr><th>URL</th><th>State</th></tr>
<tr><td>https://japanoma.vercel.app</td><td>Original Craefto deploy · full site live</td></tr>
<tr><td>https://japanoma-japanoma-2058s-projects.vercel.app</td><td>Handover deploy · pre-launch coming-soon gate</td></tr>
</table>

<p class="muted" style="margin-top:48px;">
Reviewer bypass on the handover: <code>?preview=&lt;PREVIEW_KEY&gt;</code> sets a 30-day cookie. Lift gate by removing or changing <code>LAUNCH_MODE</code> env var — no rebuild needed.
</p>

---

## What's in the handover package

<table>
<tr><th>File</th><th>Purpose</th></tr>
<tr><td><code>Japanoma-Handover-Report.md</code></td><td>Master text source</td></tr>
<tr><td><code>Japanoma-Handover-Report.docx</code></td><td>Word — with embedded diagrams</td></tr>
<tr><td><code>Japanoma-Handover-Report.pdf</code></td><td>PDF — same content as the Word doc</td></tr>
<tr><td><code>Japanoma-Handover-Deck.pptx</code></td><td>This slide deck</td></tr>
<tr><td><code>Japanoma-Handover-Deck.pdf</code></td><td>This deck as PDF</td></tr>
<tr><td><code>diagrams/*.mmd · *.png · *.svg</code></td><td>8 Mermaid diagrams + renders</td></tr>
</table>

---

<!-- _class: title -->

<p class="overline">Thank you</p>

# Ready for handover.

<p style="margin-top:48px;font-size:20px;color:#3D3833;">
Questions: <strong>obibatbileg@gmail.com</strong> · Craefto
</p>

<p class="footer-note">Built for Go&amp;C Partners · 2026-05-07</p>
