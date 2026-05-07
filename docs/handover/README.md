# Japanoma — MVP Handover Package

Generated **2026-05-07** by Craefto for Go&C Partners.

This directory contains the full handover deliverables for the Japanoma MVP. Sources are in `src/` and `diagrams/`; rendered deliverables are in `dist/`.

## Documents

| File | Format | Purpose |
| --- | --- | --- |
| [`dist/Japanoma-Handover-Report.docx`](dist/Japanoma-Handover-Report.docx) | Word | Comprehensive handover report (12 sections, 8 embedded diagrams). Best for tracked-changes review. |
| [`dist/Japanoma-Handover-Report.pdf`](dist/Japanoma-Handover-Report.pdf) | PDF | Same content as the Word doc. Best for stakeholder distribution. |
| [`dist/Japanoma-Handover-Deck.pptx`](dist/Japanoma-Handover-Deck.pptx) | PowerPoint | 12-slide executive summary deck (different shape than the long-form report). Best for stakeholder review meetings. |
| [`dist/Japanoma-Handover-Deck.pdf`](dist/Japanoma-Handover-Deck.pdf) | PDF | Same deck as PDF. |
| [`src/Japanoma-Handover-Report.md`](src/Japanoma-Handover-Report.md) | Markdown | Master text source for the report. Edit here, regenerate with the commands below. |
| [`src/Japanoma-Handover-Deck.md`](src/Japanoma-Handover-Deck.md) | Markdown | Master text source for the deck. |

## Diagrams

Eight Mermaid sources, rendered to PNG (1600w, embed-ready) and SVG (crisp print + Figma-importable).

| # | Title | Source |
| - | --- | --- |
| 1 | System architecture | [`diagrams/01-system-architecture.mmd`](diagrams/01-system-architecture.mmd) |
| 2 | Deployment topology | [`diagrams/02-deployment-topology.mmd`](diagrams/02-deployment-topology.mmd) |
| 3 | Database ERD | [`diagrams/03-database-erd.mmd`](diagrams/03-database-erd.mmd) |
| 4 | Auth and signup flow | [`diagrams/04-auth-and-signup.mmd`](diagrams/04-auth-and-signup.mmd) |
| 5 | D2L user journey | [`diagrams/05-d2l-journey.mmd`](diagrams/05-d2l-journey.mmd) |
| 6 | Lead capture and consent flow | [`diagrams/06-lead-capture.mmd`](diagrams/06-lead-capture.mmd) |
| 7 | Content Hub filter | [`diagrams/07-content-filter.mmd`](diagrams/07-content-filter.mmd) |
| 8 | Quiz flow | [`diagrams/08-quiz-flow.mmd`](diagrams/08-quiz-flow.mmd) |

## Regenerating the package

Run from this directory:

```bash
# 1. Render diagrams (PNG + SVG)
for f in diagrams/*.mmd; do
  base="${f%.mmd}"
  mmdc -i "$f" -o "$base.png" -b "#FAFAF7" -w 1600
  mmdc -i "$f" -o "$base.svg" -b "#FAFAF7"
done

# 2. Master report → DOCX + PDF
pandoc src/Japanoma-Handover-Report.md \
  -o dist/Japanoma-Handover-Report.docx \
  --resource-path=".:src:diagrams" --toc --toc-depth=3

pandoc src/Japanoma-Handover-Report.md \
  -o dist/Japanoma-Handover-Report.pdf \
  --resource-path=".:src:diagrams" --pdf-engine=weasyprint \
  --toc --toc-depth=3

# 3. Deck → PPTX + PDF
marp src/Japanoma-Handover-Deck.md --pptx --allow-local-files \
  -o dist/Japanoma-Handover-Deck.pptx
marp src/Japanoma-Handover-Deck.md --pdf --allow-local-files \
  -o dist/Japanoma-Handover-Deck.pdf
```

### Required tooling

- **mmdc** (Mermaid CLI) — `npm i -g @mermaid-js/mermaid-cli`
- **pandoc** — `brew install pandoc`
- **weasyprint** for PDF — `brew install weasyprint` (or `pip install weasyprint`)
- **marp-cli** — `npm i -g @marp-team/marp-cli`

## Why Mermaid (not Figma)

The original brief asked for diagrams via Figma MCP. Figma MCP exposes OAuth + read-only file inspection — there's no programmatic API for creating new design files. Mermaid round-trips cleanly into Word, PDF, and PowerPoint via standard pandoc/marp flows, and the source is plain text in git so future updates don't require a Figma seat. SVG renders are also Figma-importable if a designer wants to reskin them.

---

For questions: **obibatbileg@gmail.com** · Craefto.
