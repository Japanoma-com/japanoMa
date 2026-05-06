const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  ImageRun, TableOfContents
} = require("docx");

// ============================================================
// CONFIGURATION
// ============================================================
const COLORS = {
  primary: "1B365D", secondary: "8B7355", accent: "C4A35A",
  text: "333333", lightBg: "F5F3EE", white: "FFFFFF",
  codeBg: "F0EDE6", border: "BFBFBF", headerText: "FFFFFF",
};
const FONTS = { heading: "Calibri", body: "Calibri", code: "Consolas" };
const PAGE = {
  width: 11906, height: 16838,
  margin: { top: 1440, right: 1296, bottom: 1440, left: 1296 },
  contentWidth: 11906 - 2592,
};
const DOCS_ROOT = path.resolve("docs");
const bodyStyle = { font: FONTS.body, size: 22, color: COLORS.text };
let numRefIndex = 0;

// ============================================================
// NUMBERING + STYLES (same as full version)
// ============================================================
function getNumberingConfig() {
  const c = [{
    reference: "bullets",
    levels: [
      { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
    ]
  }];
  for (let i = 0; i < 300; i++) {
    c.push({
      reference: `num-${i}`,
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    });
  }
  return c;
}

function getStyles() {
  return {
    default: { document: { run: { font: FONTS.body, size: 22, color: COLORS.text } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 48, bold: true, font: FONTS.heading, color: COLORS.primary },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONTS.heading, color: COLORS.primary },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONTS.heading, color: COLORS.secondary },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONTS.heading, color: COLORS.text },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 3 } },
    ]
  };
}

// ============================================================
// MARKDOWN PARSER (same as full version)
// ============================================================
function parseMarkdown(content) {
  const lines = content.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      if (i < lines.length) i++;
      blocks.push({ type: "code", lang, content: codeLines.join("\n").trim() });
      continue;
    }
    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) { blocks.push({ type: "heading", level: hm[1].length, content: hm[2].trim() }); i++; continue; }
    if (line.match(/^---+\s*$/) || line.match(/^\*\*\*+\s*$/)) { blocks.push({ type: "hr" }); i++; continue; }
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const raw = lines[i].trim();
        if (!raw.match(/^\|[\s\-:|]+\|$/)) {
          const cells = raw.split("|").slice(1);
          if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();
          rows.push(cells.map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) blocks.push({ type: "table", rows });
      continue;
    }
    if (line.match(/^\s*[-*]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s/)) { items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim()); i++; }
      blocks.push({ type: "bullets", items });
      continue;
    }
    if (line.match(/^\s*\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s/)) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim()); i++; }
      blocks.push({ type: "numbered", items });
      continue;
    }
    if (line.startsWith(">")) {
      const ql = [];
      while (i < lines.length && lines[i].startsWith(">")) { ql.push(lines[i].replace(/^>\s*/, "")); i++; }
      blocks.push({ type: "blockquote", content: ql.join(" ") });
      continue;
    }
    blocks.push({ type: "paragraph", content: line.trim() });
    i++;
  }
  return blocks;
}

// ============================================================
// INLINE TEXT PARSER (same as full version)
// ============================================================
function parseInline(text, opts = {}) {
  if (!text) return [new TextRun({ text: " ", ...opts })];
  const runs = [];
  const rx = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))/g;
  let last = 0, m;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) { const p = text.slice(last, m.index); if (p) runs.push(new TextRun({ text: p, ...opts })); }
    const tok = m[1];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      runs.push(new TextRun({ text: tok.slice(2, -2), bold: true, ...opts }));
    } else if (tok.startsWith("*") && tok.endsWith("*")) {
      runs.push(new TextRun({ text: tok.slice(1, -1), italics: true, ...opts }));
    } else if (tok.startsWith("`") && tok.endsWith("`")) {
      runs.push(new TextRun({ text: tok.slice(1, -1), font: FONTS.code, size: 20 }));
    } else if (tok.startsWith("[")) {
      const lm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (lm) runs.push(new TextRun({ text: lm[1], color: COLORS.primary, underline: {}, ...opts }));
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...opts }));
  if (runs.length === 0) runs.push(new TextRun({ text, ...opts }));
  return runs;
}

// ============================================================
// ELEMENT BUILDERS (same as full version)
// ============================================================
function buildTable(rows) {
  if (!rows || rows.length === 0) return [];
  const nc = Math.max(...rows.map(r => r.length));
  const bw = Math.floor(PAGE.contentWidth / nc);
  const cw = Array(nc).fill(bw);
  cw[nc - 1] += PAGE.contentWidth - bw * nc;
  const brd = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
  const borders = { top: brd, bottom: brd, left: brd, right: brd };
  const margins = { top: 60, bottom: 60, left: 100, right: 100 };
  const tRows = rows.map((row, ri) => {
    const isH = ri === 0;
    const isAlt = ri % 2 === 0 && ri > 0;
    const cells = [];
    for (let c = 0; c < nc; c++) {
      cells.push(new TableCell({
        borders, margins,
        width: { size: cw[c], type: WidthType.DXA },
        shading: { fill: isH ? COLORS.primary : (isAlt ? COLORS.lightBg : COLORS.white), type: ShadingType.CLEAR },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: parseInline((row[c] || "").trim(), {
            font: FONTS.body, size: 19, color: isH ? COLORS.headerText : COLORS.text, bold: isH,
          })
        })]
      }));
    }
    return new TableRow({ children: cells });
  });
  return [
    new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }),
    new Table({ width: { size: PAGE.contentWidth, type: WidthType.DXA }, columnWidths: cw, rows: tRows }),
    new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }),
  ];
}

function buildBulletItems(items) {
  return items.map(item => new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 30, after: 30 },
    children: parseInline(item, bodyStyle),
  }));
}

function buildNumberedItems(items) {
  const ref = `num-${numRefIndex++}`;
  return items.map(item => new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 30, after: 30 },
    children: parseInline(item, bodyStyle),
  }));
}

function buildDiagramImage(buffer) {
  try {
    const imgW = buffer.readUInt32BE(16);
    const imgH = buffer.readUInt32BE(20);
    const targetW = 500;
    const scale = Math.min(1, targetW / imgW);
    return [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
      children: [new ImageRun({
        type: "png", data: buffer,
        transformation: { width: Math.round(imgW * scale), height: Math.round(imgH * scale) },
        altText: { title: "Diagram", description: "Architecture diagram", name: "diagram" }
      })]
    })];
  } catch { return []; }
}

// ============================================================
// DIAGRAM RENDERING (kroki.io)
// ============================================================
async function renderDiagram(code) {
  try {
    const r = await fetch("https://kroki.io/mermaid/png", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: code, signal: AbortSignal.timeout(30000),
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
  } catch { /* fallback */ }
  return null;
}

function extractMermaidBlocks(content) {
  const rx = /```mermaid\n([\s\S]*?)```/g;
  const out = []; let m;
  while ((m = rx.exec(content)) !== null) out.push(m[1].trim());
  return out;
}

// ============================================================
// CONDENSATION ENGINE
// ============================================================

/**
 * Condense blocks by limiting paragraphs per section, truncating lists,
 * skipping code blocks, and optionally skipping named sections.
 */
function condenseBlocks(blocks, opts = {}) {
  const {
    maxParas = 1,
    maxListItems = 3,
    maxTableRows = 20,
    maxTables = 99,
    skipCode = true,
    skipSections = [],
    keepMermaid = true,
    maxDiagrams = 99,
  } = opts;

  const result = [];
  let parasInSection = 0;
  let skipping = false;
  let skipLevel = 0;
  let diagramCount = 0;
  let tableCount = 0;

  for (const b of blocks) {
    if (b.type === "heading") {
      const lower = b.content.toLowerCase();
      if (lower.startsWith("*cross-ref") || lower.startsWith("*document version")) continue;
      if (skipSections.some(pat => lower.includes(pat.toLowerCase()))) {
        skipping = true;
        skipLevel = b.level;
        continue;
      }
      if (skipping && b.level <= skipLevel) skipping = false;
      if (skipping) continue;
      parasInSection = 0;
      result.push(b);
      continue;
    }
    if (skipping) continue;

    switch (b.type) {
      case "paragraph":
        if (b.content.startsWith("*Cross-ref") || b.content.startsWith("*Document version")
            || b.content.startsWith("*Last updated") || b.content.startsWith("*Author:")
            || b.content.startsWith("*Reviewed by")) break;
        if (parasInSection < maxParas) { result.push(b); parasInSection++; }
        break;
      case "table":
        if (tableCount >= maxTables) break;
        tableCount++;
        if (b.rows.length > maxTableRows + 1) {
          result.push({ ...b, rows: [...b.rows.slice(0, maxTableRows + 1)] });
        } else {
          result.push(b);
        }
        break;
      case "bullets":
        result.push({ ...b, items: b.items.slice(0, maxListItems) });
        break;
      case "numbered":
        result.push({ ...b, items: b.items.slice(0, maxListItems) });
        break;
      case "code":
        if (b.lang === "mermaid" && keepMermaid && diagramCount < maxDiagrams) {
          result.push(b);
          diagramCount++;
        }
        break;
      case "blockquote": break;
      case "hr": break;
    }
  }
  return result;
}

/**
 * Extract user stories from a user story markdown file into a summary table.
 * Returns array of { id, title, persona, priority, phase }.
 */
function extractUserStories(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const stories = [];
  let current = null;

  for (const line of lines) {
    // Match H3 like "### US-01: Browse Content Hub..."
    const h3 = line.match(/^###\s+(US-\d+):\s*(.*)/);
    if (h3) {
      current = { id: h3[1], title: h3[2].trim(), persona: "", priority: "", phase: "" };
      stories.push(current);
      continue;
    }
    if (!current) continue;

    // Extract persona from "**As a** Name (Role)"
    const asA = line.match(/\*\*As a\*\*\s*(.+?)(?:\s*\*\*I want|\s*$)/);
    if (asA) { current.persona = asA[1].replace(/\s+$/, ""); continue; }

    // Extract priority and phase
    if (line.includes("**Priority:**")) {
      const pm = line.match(/\*\*Priority:\*\*\s*([^|*]+)/);
      const phm = line.match(/\*\*Phase:\*\*\s*([^|*]+)/);
      if (pm) current.priority = pm[1].trim();
      if (phm) current.phase = phm[1].trim();
    }
  }
  return stories;
}

// ============================================================
// BLOCKS TO DOCX (same as full version)
// ============================================================
function blocksToDocx(blocks, diagrams) {
  const els = [];
  let skipH1 = true;
  for (const b of blocks) {
    switch (b.type) {
      case "heading":
        if (b.level === 1 && skipH1) { skipH1 = false; break; }
        if (b.level <= 2) {
          els.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: parseInline(b.content, { font: FONTS.heading }) }));
        } else if (b.level === 3) {
          els.push(new Paragraph({ heading: HeadingLevel.HEADING_4, children: parseInline(b.content, { font: FONTS.heading }) }));
        } else {
          els.push(new Paragraph({ spacing: { before: 160, after: 80 },
            children: parseInline(b.content, { bold: true, font: FONTS.body, size: 22, color: COLORS.text }) }));
        }
        break;
      case "paragraph":
        els.push(new Paragraph({ spacing: { before: 60, after: 60 }, children: parseInline(b.content, bodyStyle) }));
        break;
      case "table": els.push(...buildTable(b.rows)); break;
      case "bullets": els.push(...buildBulletItems(b.items)); break;
      case "numbered": els.push(...buildNumberedItems(b.items)); break;
      case "code":
        if (b.lang === "mermaid" && diagrams) {
          const img = diagrams.get(b.content);
          if (img) { els.push(...buildDiagramImage(img)); break; }
        }
        // In compact mode, skip non-mermaid code blocks (already filtered by condenseBlocks)
        break;
      case "blockquote":
        els.push(new Paragraph({ indent: { left: 400 }, spacing: { before: 80, after: 80 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent } },
          children: parseInline(b.content, { ...bodyStyle, italics: true, color: COLORS.secondary }) }));
        break;
    }
  }
  return els;
}

// ============================================================
// COVER PAGE
// ============================================================
function buildCoverPage() {
  const sp = () => new Paragraph({ spacing: { before: 400 }, children: [] });
  return [
    sp(), sp(), sp(), sp(), sp(), sp(), sp(), sp(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: "JAPANOMA", font: FONTS.heading, size: 72, bold: true, color: COLORS.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "Buyer Insight Platform for Japan Property Investment", font: FONTS.heading, size: 26, color: COLORS.secondary })] }),
    sp(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: "TECHNICAL SUMMARY", font: FONTS.heading, size: 28, bold: true, color: COLORS.primary, characterSpacing: 160 })] }),
    sp(), sp(), sp(),
    ...["Version 1.0", "27 February 2026", "",
      "Client: Go&C Partners (Kaz Arakaki + Shiun Iseda)",
      "Builder: Craefto (Obi, Developer; Sara, Project Manager)",
      "Budget: $8,640 AUD  |  Timeline: 13 Weeks"
    ].map(l => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: l || " ", font: FONTS.body, size: 22, color: l ? COLORS.text : COLORS.white })] })),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// PART DIVIDER
// ============================================================
function buildPartDivider(num, title) {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true,
      children: [new TextRun({ text: `Part ${num}: ${title}` })] }),
  ];
}

// ============================================================
// DOCUMENT STRUCTURE (with condensation modes)
// ============================================================
const STRUCTURE = [
  { type: "part", num: 1, title: "Project Overview" },
  { type: "ch", title: "Discovery Summary", file: "plans/discovery-summary.md", mode: "default" },

  { type: "part", num: 2, title: "Architecture" },
  { type: "ch", title: "System Overview", file: "architecture/system-overview.md", mode: "arch" },
  { type: "ch", title: "Data Model", file: "architecture/data-model.md", mode: "arch" },
  { type: "ch", title: "Authentication Specification", file: "architecture/auth-spec.md", mode: "arch" },

  { type: "part", num: 3, title: "Architecture Decisions" },
  { type: "adr-summary" },

  { type: "part", num: 4, title: "User Research" },
  { type: "ch", title: "User Personas", file: "personas/personas.md", mode: "default" },

  { type: "part", num: 5, title: "User Stories" },
  { type: "stories", title: "Taxonomy & Content", file: "user-stories/taxonomy-and-content.md" },
  { type: "stories", title: "Buyer Interactions", file: "user-stories/buyer-interactions.md" },
  { type: "stories", title: "Event Tracking", file: "user-stories/event-tracking.md" },
  { type: "stories", title: "User Accounts", file: "user-stories/user-accounts.md" },
  { type: "stories", title: "Admin Dashboard", file: "user-stories/admin-dashboard.md" },
  { type: "stories", title: "Privacy & Compliance", file: "user-stories/privacy-compliance.md" },

  { type: "part", num: 6, title: "Requirements" },
  { type: "ch", title: "Non-Functional Requirements", file: "requirements/non-functional.md", mode: "tables-only" },
  { type: "ch", title: "Scope Boundaries", file: "requirements/scope-boundaries.md", mode: "tables-only" },
];

// ADR summary data: [ID, Topic, Decision, Key Trade-off]
const ADR_SUMMARY = [
  ["ADR-001", "Framework", "Next.js 15 (App Router)", "Vercel lock-in for ISR/edge features"],
  ["ADR-002", "Database & ORM", "Supabase + Drizzle ORM", "Supabase vendor dependency; Drizzle is newer ecosystem"],
  ["ADR-003", "Authentication", "NextAuth.js v5 (Auth.js)", "v5 in RC; limited to web-based OAuth flows"],
  ["ADR-004", "CMS", "Sanity (headless)", "Free tier limits; requires developer for schema changes"],
  ["ADR-005", "Analytics", "Custom tracking + Plausible", "Custom tracking needs maintenance; no real-time dashboard"],
  ["ADR-006", "State Mgmt", "Zustand + TanStack Query + nuqs", "Three libraries to learn; URL state adds complexity"],
  ["ADR-007", "UI Components", "shadcn/ui + Tailwind v4", "Copy-paste model means manual updates"],
  ["ADR-008", "Forms", "React Hook Form + Zod", "Zod bundle size; RHF learning curve"],
  ["ADR-009", "Charting", "Recharts", "Limited chart types; no real-time streaming"],
  ["ADR-010", "Deployment", "Vercel", "Vendor lock-in; Pro plan $20/mo for production"],
  ["ADR-011", "SEO", "Next.js Metadata + JSON-LD", "Manual structured data maintenance"],
  ["ADR-012", "Privacy", "APPI + AU Privacy + GDPR", "Multi-jurisdiction compliance overhead"],
];

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("Japanoma Technical Summary Generator (Compact)");
  console.log("===============================================\n");

  // Phase 1: Extract mermaid diagrams
  console.log("Phase 1: Extracting Mermaid diagrams...");
  const diagrams = new Map();
  for (const item of STRUCTURE) {
    if (item.file) {
      const content = fs.readFileSync(path.join(DOCS_ROOT, item.file), "utf-8");
      for (const code of extractMermaidBlocks(content)) {
        if (!diagrams.has(code)) diagrams.set(code, null);
      }
    }
  }
  console.log(`  Found ${diagrams.size} unique diagrams.\n`);

  // Phase 2: Render diagrams
  console.log("Phase 2: Rendering diagrams via kroki.io...");
  let ok = 0;
  for (const [code] of diagrams) {
    const buf = await renderDiagram(code);
    if (buf) { diagrams.set(code, buf); ok++; console.log(`  [${ok}] Rendered (${Math.round(buf.length / 1024)}KB)`); }
    else { console.log(`  [x] Failed`); }
  }
  console.log(`  ${ok}/${diagrams.size} diagrams rendered.\n`);

  // Phase 3: Build content
  console.log("Phase 3: Building condensed content...");
  numRefIndex = 0;
  const coverChildren = buildCoverPage();
  const mainChildren = [];

  // TOC
  mainChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Table of Contents" })] }));
  mainChildren.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));
  mainChildren.push(new Paragraph({ children: [new PageBreak()] }));

  for (const item of STRUCTURE) {
    // Part divider
    if (item.type === "part") {
      mainChildren.push(...buildPartDivider(item.num, item.title));
      continue;
    }

    // ADR summary table
    if (item.type === "adr-summary") {
      mainChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Decision Summary" })] }));
      mainChildren.push(new Paragraph({ spacing: { before: 60, after: 80 },
        children: [new TextRun({ text: "All 12 architecture decisions at a glance:", ...bodyStyle })] }));
      mainChildren.push(...buildTable([
        ["ADR", "Topic", "Decision", "Key Trade-off"],
        ...ADR_SUMMARY.map(([adr, topic, dec, tradeoff]) => [adr, topic, dec, tradeoff])
      ]));
      continue;
    }

    // User stories as summary tables
    if (item.type === "stories") {
      console.log(`  Summarizing: ${item.title}`);
      const stories = extractUserStories(path.join(DOCS_ROOT, item.file));
      mainChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: item.title })] }));
      if (stories.length > 0) {
        mainChildren.push(new Paragraph({ spacing: { before: 60, after: 80 },
          children: [new TextRun({ text: `${stories.length} user stories in this area:`, ...bodyStyle })] }));
        mainChildren.push(...buildTable([
          ["ID", "Story Title", "Priority", "Phase"],
          ...stories.map(s => [s.id, s.title, s.priority, s.phase])
        ]));
      } else {
        mainChildren.push(new Paragraph({ spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: "See full documentation for detailed stories.", ...bodyStyle, italics: true })] }));
      }
      continue;
    }

    // Regular chapter with condensation
    if (item.type === "ch") {
      console.log(`  Processing: ${item.title}`);
      const content = fs.readFileSync(path.join(DOCS_ROOT, item.file), "utf-8");
      let blocks = parseMarkdown(content);

      // Apply condensation based on mode
      switch (item.mode) {
        case "arch":
          blocks = condenseBlocks(blocks, {
            maxParas: 1,
            maxListItems: 3,
            maxTableRows: 8,
            maxTables: 6,
            maxDiagrams: 2,
            skipCode: true,
          });
          break;
        case "tables-only":
          blocks = condenseBlocks(blocks, {
            maxParas: 0,
            maxListItems: 3,
            maxTableRows: 8,
            maxTables: 8,
            skipCode: true,
          });
          break;
        default:
          blocks = condenseBlocks(blocks, {
            maxParas: 1,
            maxListItems: 3,
            maxTableRows: 8,
            maxTables: 10,
            skipCode: true,
          });
          break;
      }

      mainChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: item.title })] }));
      mainChildren.push(...blocksToDocx(blocks, diagrams));
    }
  }

  // Phase 4: Assemble
  console.log("\nPhase 4: Assembling document...");
  const doc = new Document({
    title: "Japanoma Technical Summary",
    description: "Condensed technical documentation for Japanoma",
    creator: "Craefto (Obi)",
    styles: getStyles(),
    numbering: { config: getNumberingConfig() },
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: coverChildren,
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        headers: {
          default: new Header({ children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border } },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Japanoma", bold: true, font: FONTS.heading, size: 18, color: COLORS.primary }),
              new TextRun({ text: "  |  Technical Summary", font: FONTS.body, size: 18, color: COLORS.secondary }),
            ]
          })] })
        },
        footers: {
          default: new Footer({ children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border } },
            spacing: { before: 120 },
            children: [
              new TextRun({ text: "Confidential \u2014 Go&C Partners / Craefto  |  Page ", font: FONTS.body, size: 16, color: COLORS.secondary }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONTS.body, size: 16, color: COLORS.secondary }),
            ]
          })] })
        },
        children: mainChildren,
      }
    ]
  });

  // Phase 5: Write
  const outPath = path.resolve("Japanoma_Technical_Summary.docx");
  console.log("Phase 5: Writing document...");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`\nDone! Condensed document generated:`);
  console.log(`  ${outPath}`);
  console.log(`  ${Math.round(buffer.length / 1024)}KB`);
}

main().catch(err => { console.error("Error:", err); process.exit(1); });
