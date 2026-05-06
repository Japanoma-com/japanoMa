// Render all Mermaid diagrams from the docs as PNG images via mermaid.ink
import fs from "fs";
import path from "path";

const DIAGRAM_DIR = path.resolve("scripts/docgen/diagrams");

// Extract all mermaid code blocks from markdown files
function extractMermaid(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const regex = /```mermaid\n([\s\S]*?)```/g;
  const diagrams = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    diagrams.push(match[1].trim());
  }
  return diagrams;
}

async function renderDiagram(code, name) {
  const encoded = Buffer.from(code).toString("base64");
  const url = `https://mermaid.ink/img/base64:${encoded}?bgColor=white&width=1200`;
  console.log(`  Fetching ${name}...`);
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const outPath = path.join(DIAGRAM_DIR, `${name}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log(`  ✓ ${name}.png (${Math.round(buffer.length / 1024)}KB)`);
    return outPath;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    return null;
  }
}

async function main() {
  const docsRoot = path.resolve("docs");

  // System overview diagrams
  const sysOverview = extractMermaid(path.join(docsRoot, "architecture/system-overview.md"));
  const sysNames = [
    "sys-high-level",
    "sys-client-arch",
    "flow-anonymous-browsing",
    "flow-quiz-completion",
    "flow-save-bookmark",
    "flow-contact-form",
    "flow-admin-analytics",
    "flow-content-publishing",
    "sys-deployment",
  ];

  // Auth spec diagrams
  const authSpec = extractMermaid(path.join(docsRoot, "architecture/auth-spec.md"));
  const authNames = [
    "auth-request-flow",
    "auth-session-migration",
    "auth-middleware-flow",
  ];

  // Data model ERD
  const dataModel = extractMermaid(path.join(docsRoot, "architecture/data-model.md"));
  const dataNames = ["erd"];

  const allDiagrams = [
    ...sysOverview.map((code, i) => ({ code, name: sysNames[i] || `sys-${i}` })),
    ...authSpec.map((code, i) => ({ code, name: authNames[i] || `auth-${i}` })),
    ...dataModel.map((code, i) => ({ code, name: dataNames[i] || `data-${i}` })),
  ];

  console.log(`Found ${allDiagrams.length} Mermaid diagrams to render.\n`);

  const results = {};
  for (const { code, name } of allDiagrams) {
    results[name] = await renderDiagram(code, name);
  }

  // Write manifest
  fs.writeFileSync(
    path.join(DIAGRAM_DIR, "manifest.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`\nDone. Manifest written to diagrams/manifest.json`);
}

main();
