#!/usr/bin/env python3
"""
Japanoma — Sanity Quick Reference.

A 4-page companion to the full handbook. Everything an editor needs at
a glance: the three document types, the voice rules, the canonical tag
vocabulary, and the pre-publish checklist. Designed to be printed and
left next to the keyboard.

Output: docs/Japanoma-Sanity-Quick-Reference.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------------------
# Ma Space v4 — design tokens (mirrored from the full handbook)
# ---------------------------------------------------------------------------

SUMI = HexColor("#1A1816")
SUMI_LIGHT = HexColor("#3D3833")
STONE = HexColor("#8A8279")
ASH = HexColor("#C4BDB4")
WASHI = HexColor("#F5F0E8")
SHOJI = HexColor("#FAFAF7")
KINU = HexColor("#FFFFFF")
SUGI = HexColor("#9B7B4F")
BORDER = HexColor("#E5E0D8")
MATSU = HexColor("#4A6B52")
BENI = HexColor("#8B3A3A")

PAGE_W, PAGE_H = A4
MARGIN_L = 1.6 * cm
MARGIN_R = 1.6 * cm
MARGIN_T = 1.8 * cm
MARGIN_B = 1.8 * cm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = PROJECT_ROOT / "docs" / "Japanoma-Sanity-Quick-Reference.pdf"

# ---------------------------------------------------------------------------
# Fonts
# ---------------------------------------------------------------------------

SATOSHI_PATH = PROJECT_ROOT / "src" / "fonts" / "Satoshi-Variable.ttf"
try:
    pdfmetrics.registerFont(TTFont("Satoshi", str(SATOSHI_PATH)))
    UI = "Satoshi"
except Exception:
    UI = "Helvetica"

SERIF = "Times-Roman"
SERIF_IT = "Times-Italic"

# ---------------------------------------------------------------------------
# Paragraph styles — compact by design
# ---------------------------------------------------------------------------

TITLE = ParagraphStyle(
    "Title", fontName=SERIF, fontSize=28, leading=32, textColor=SUMI,
    spaceAfter=6, alignment=TA_LEFT,
)
SUB = ParagraphStyle(
    "Sub", fontName=SERIF_IT, fontSize=11, leading=15, textColor=STONE,
    spaceAfter=12, alignment=TA_LEFT,
)
SECTION = ParagraphStyle(
    "Section", fontName=UI, fontSize=7.5, leading=10, textColor=SUGI,
    spaceBefore=10, spaceAfter=3, alignment=TA_LEFT,
)
H = ParagraphStyle(
    "H", fontName=SERIF, fontSize=14, leading=18, textColor=SUMI,
    spaceBefore=4, spaceAfter=5, alignment=TA_LEFT,
)
SMALL_H = ParagraphStyle(
    "SmallH", fontName=UI, fontSize=8.5, leading=12, textColor=SUMI,
    spaceBefore=4, spaceAfter=2, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    "Body", fontName=UI, fontSize=8.5, leading=12.5, textColor=SUMI_LIGHT,
    spaceAfter=4, alignment=TA_LEFT,
)
TINY = ParagraphStyle(
    "Tiny", fontName=UI, fontSize=7.5, leading=11, textColor=STONE,
    spaceAfter=3, alignment=TA_LEFT,
)
BULLET = ParagraphStyle(
    "Bullet", parent=BODY, leftIndent=10, bulletIndent=0, spaceAfter=2,
)


# ---------------------------------------------------------------------------
# Page chrome
# ---------------------------------------------------------------------------

def _hairline(c: Canvas, y: float, color=BORDER, width=0.3):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)


def every_page(c: Canvas, doc):
    c.saveState()

    # Overline top-left
    c.setFont(UI, 7)
    c.setFillColor(SUGI)
    c.drawString(MARGIN_L, PAGE_H - 1.1 * cm,
                 "JAPANOMA  ·  SANITY QUICK REFERENCE")

    # Version top-right
    c.setFillColor(STONE)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.1 * cm, "V1.0")
    _hairline(c, PAGE_H - 1.3 * cm)

    # Footer rule
    _hairline(c, 1.3 * cm)
    c.setFont(UI, 7)
    c.setFillColor(STONE)
    c.drawString(MARGIN_L, 0.9 * cm, "For Kaz & Shiun  ·  Go&C Partners")
    c.setFillColor(SUMI)
    c.drawRightString(PAGE_W - MARGIN_R, 0.9 * cm, f"{doc.page:02d} / 04")

    c.restoreState()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def p(text, style=BODY):
    return Paragraph(text, style)


def bullets(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=8, value="disc") for t in items],
        bulletType="bullet",
        start="disc",
        bulletFontName=UI,
        bulletFontSize=5.5,
        leftIndent=12,
        bulletColor=SUGI,
    )


def field_row_table(rows, widths):
    """Compact field table for quick reference."""
    header_style = ParagraphStyle(
        "FTH", fontName=UI, fontSize=6.5, textColor=STONE, leading=9)
    name_style = ParagraphStyle(
        "FN", fontName=UI, fontSize=8, textColor=SUMI, leading=11)
    type_style = ParagraphStyle(
        "FT", fontName=UI, fontSize=7, textColor=STONE, leading=10)
    desc_style = ParagraphStyle(
        "FD", fontName=UI, fontSize=7.5, textColor=SUMI_LIGHT, leading=11)

    data = [[
        Paragraph("FIELD", header_style),
        Paragraph("TYPE", header_style),
        Paragraph("WHAT TO PUT HERE", header_style),
    ]]
    for name, ftype, note in rows:
        data.append([
            Paragraph(f"<b>{name}</b>", name_style),
            Paragraph(ftype, type_style),
            Paragraph(note, desc_style),
        ])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, SUMI),
        ("LINEBELOW", (0, 1), (-1, -2), 0.2, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def two_column(left_flowables, right_flowables, gap=0.5 * cm):
    col_w = (PAGE_W - MARGIN_L - MARGIN_R - gap) / 2
    t = Table(
        [[left_flowables, right_flowables]],
        colWidths=[col_w, col_w],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), gap),
            ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )
    return t


def callout(title, body_text, tone=SUGI):
    inner = [
        Paragraph(title.upper(), ParagraphStyle(
            "CT", fontName=UI, fontSize=6.5, textColor=tone, leading=10,
            spaceAfter=2)),
        Paragraph(body_text, ParagraphStyle(
            "CB", fontName=UI, fontSize=7.5, textColor=SUMI, leading=11)),
    ]
    t = Table([[inner]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 1.5, tone),
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def tag_chip_list(items):
    """Comma-separated tag list rendered compactly."""
    text = "  ·  ".join(items)
    return Paragraph(
        text,
        ParagraphStyle(
            "Tags", fontName=UI, fontSize=7.5, leading=12,
            textColor=SUMI_LIGHT, alignment=TA_LEFT, spaceAfter=6,
        ),
    )


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

def build(output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B,
        title="Japanoma — Sanity Quick Reference",
        author="Craefto for Go&C Partners",
        subject="4-page quick reference for editing Japanoma in Sanity Studio",
    )

    frame = Frame(
        MARGIN_L, MARGIN_B,
        PAGE_W - MARGIN_L - MARGIN_R,
        PAGE_H - MARGIN_T - MARGIN_B - 0.4 * cm,
        id="body",
    )
    doc.addPageTemplates([
        PageTemplate(id="Body", frames=[frame], onPage=every_page),
    ])

    s = []

    # ======================================================================
    # PAGE 1 — ORIENTATION + STUDIO LAYOUT
    # ======================================================================
    s.append(p("QUICK REFERENCE  ·  01", SECTION))
    s.append(p("Editing Japanoma in Sanity.", TITLE))
    s.append(p(
        "Four pages of pure mechanics. The full handbook lives in the "
        "same folder.", SUB))

    # Left column: Four facts
    left = []
    left.append(p("THE FOUR THINGS THAT MATTER", SECTION))
    left.append(p("1  ·  Three document types", SMALL_H))
    left.append(p(
        "<b>Article</b> (9 fields, renders at /content/[slug]), "
        "<b>Area Guide</b> (9 fields, /areas/[pref]/[city]), "
        "and <b>Page</b> (3 fields, /[slug]). That's it."))
    left.append(p("2  ·  Autosave is always on", SMALL_H))
    left.append(p(
        "Every keystroke saves as a draft within ~1 second. Drafts are "
        "private to editors. Nothing is public until you press Publish."))
    left.append(p("3  ·  Publish timing differs by type", SMALL_H))
    left.append(p(
        "<b>Article</b> → instant (force-dynamic). "
        "<b>Area Guide / Page</b> → webhook to /api/revalidate → "
        "live within seconds on next request."))
    left.append(p("4  ·  Every version is kept", SMALL_H))
    left.append(p(
        "Click the clock icon on any document. Timeline of every change, "
        "who made it, when. Restore in two clicks."))

    # Right column: Studio regions + status dots
    right = []
    right.append(p("THE FOUR REGIONS OF THE STUDIO", SECTION))
    right.append(p("Top bar", SMALL_H))
    right.append(p("Project name, global search, your avatar. Rarely touched."))
    right.append(p("Left navigation", SMALL_H))
    right.append(p("Tool icons. <b>Desk</b> is the only one you'll use."))
    right.append(p("Desk panes", SMALL_H))
    right.append(p(
        "Column-based browser. Click <i>Article</i>, then a specific one. "
        "Each click opens a new column to the right."))
    right.append(p("Document editor", SMALL_H))
    right.append(p(
        "Wide panel on the right. All fields live here. <b>Publish</b> "
        "at bottom-right. Autosave indicator at the top."))

    right.append(p("STATUS DOTS", SECTION))
    right.append(p("<b>Green</b> — published, live on the site.", TINY))
    right.append(p(
        "<b>Orange</b> — draft only, never published.", TINY))
    right.append(p(
        "<b>Green + orange</b> — published, with newer unpublished edits "
        "on top.", TINY))
    right.append(p("<b>No dot</b> — draft-only state.", TINY))

    s.append(two_column(left, right))

    s.append(Spacer(1, 8))
    s.append(callout(
        "Studio URL & project",
        "<b>japanoma.sanity.studio</b> (hosted — not embedded in the "
        "Next.js app).  Project: <b>ljeqozrv</b>  ·  "
        "Dataset: <b>production</b>"
    ))

    s.append(Spacer(1, 6))
    s.append(callout(
        "Typical session",
        "Open Studio  →  click document type  →  edit  →  check required "
        "fields filled  →  Publish  →  hard-reload the live route "
        "(<b>Cmd+Shift+R</b>) to verify."
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 2 — ARTICLE FIELD TABLE + AREA GUIDE / PAGE SUMMARY
    # ======================================================================
    s.append(p("QUICK REFERENCE  ·  02", SECTION))
    s.append(p("Article — the nine fields.", TITLE))
    s.append(p(
        "Schema: sanity/schemas/article.ts. Renders at /content/[slug] "
        "via getArticleBySlug(). Appears on /content via "
        "getFilteredArticles().", SUB))

    col_w = [2.7 * cm, 2.5 * cm, PAGE_W - MARGIN_L - MARGIN_R - 5.2 * cm]
    s.append(field_row_table([
        ("title", "string · required",
         "Rendered as H1 on the article page and as card title on /content."),
        ("slug", "slug · required",
         "URL-friendly identifier. Click <b>Generate</b> — do not type. "
         "Changing after publish breaks existing links."),
        ("excerpt", "text (3 rows)",
         "Card summary and SEO meta description. Optional but recommended."),
        ("body", "array · block + image",
         "Portable Text. Contains text blocks and inline images. "
         "Rendered by @portabletext/react."),
        ("featuredImage", "image (hotspot)",
         "Hero image. Rendered at 1360px via "
         "urlFor(img).width(1360).auto('format').url()."),
        ("areaTags", "array of string",
         "Filter field. Drives /content?area=... via GROQ <b>$area in "
         "areaTags</b>. Exact string match — see page 03."),
        ("propertyTypeTags", "array of string",
         "Filter field. Drives /content?type=..."),
        ("useCaseTags", "array of string",
         "Filter field. Drives /content?use=..."),
        ("publishedAt", "datetime",
         "Display date and sort key. Used by | order(publishedAt desc). "
         "Set automatically on first publish."),
    ], col_w))

    s.append(Spacer(1, 10))

    # Area Guide + Page in two columns
    left = []
    left.append(p("AREA GUIDE — NINE FIELDS", SECTION))
    left.append(p("<b>name</b>  ·  string, required<br/>"
                  "H1 on guide page, card title on /areas.", TINY))
    left.append(p("<b>slug</b>  ·  slug, required<br/>"
                  "Final URL segment. Generate from name.", TINY))
    left.append(p("<b>prefectureSlug</b>  ·  string<br/>"
                  "First URL segment. Must match an existing Next.js "
                  "route folder in /areas.", TINY))
    left.append(p("<b>description</b>  ·  text<br/>"
                  "Plain text, rendered as paragraphs.", TINY))
    left.append(p("<b>images</b>  ·  array of image (hotspot)<br/>"
                  "Gallery. Drag handle on left to reorder. Each image "
                  "has its own hotspot, crop, alt text.", TINY))
    left.append(p("<b>climateInfo</b>  ·  text", TINY))
    left.append(p("<b>accessInfo</b>  ·  text", TINY))
    left.append(p("<b>propertyOverview</b>  ·  text", TINY))
    left.append(p("<b>tags</b>  ·  array of string<br/>"
                  "Free-form filter labels. Typo trap — see page 03.",
                  TINY))

    right = []
    right.append(p("PAGE — THREE FIELDS", SECTION))
    right.append(p("<b>title</b>  ·  string, required<br/>"
                   "H1 and browser tab title.", TINY))
    right.append(p("<b>slug</b>  ·  slug, required<br/>"
                   "Renders at /{slug.current}. Changing after publish "
                   "breaks bookmarks — ask developer for redirect.", TINY))
    right.append(p("<b>body</b>  ·  array · block only<br/>"
                   "Portable Text, no inline images allowed by current "
                   "schema.", TINY))

    right.append(p("URL CONSTRUCTION", SECTION))
    right.append(p("<b>Article:</b>  /content/{slug.current}", TINY))
    right.append(p("<b>Area Guide:</b>  /areas/{prefectureSlug}/{slug.current}",
                   TINY))
    right.append(p("<b>Page:</b>  /{slug.current}", TINY))

    right.append(p("WEBHOOK BEHAVIOUR", SECTION))
    right.append(p("Publishing POSTs to /api/revalidate. Article routes "
                   "are force-dynamic (no ISR wait). Area Guide calls "
                   "revalidatePath('/areas') + /areas/[pref]. Page calls "
                   "revalidatePath('/[slug]').", TINY))

    s.append(two_column(left, right))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 3 — PORTABLE TEXT, TAG TYPO TRAP, IMAGES, PUBLISH PIPELINE
    # ======================================================================
    s.append(p("QUICK REFERENCE  ·  03", SECTION))
    s.append(p("Editor mechanics & the typo trap.", TITLE))
    s.append(p(
        "Keyboard shortcuts, the exact GROQ query that makes tag "
        "spelling matter, image upload rules, and the publish pipeline.",
        SUB))

    # Two columns: keyboard shortcuts + tag typo trap
    mono_style = ParagraphStyle(
        "Mono", fontName="Courier-Bold", fontSize=7.5, leading=11,
        textColor=SUMI, spaceAfter=2,
    )
    code_inline = ParagraphStyle(
        "CodeInline", fontName="Courier", fontSize=7, leading=11,
        textColor=SUMI, spaceAfter=4, leftIndent=6, rightIndent=6,
        backColor=SHOJI, borderPadding=4,
    )

    left = []
    left.append(p("PORTABLE TEXT SHORTCUTS", SECTION))
    for k, a in [
        ("Cmd / Ctrl + B", "Bold"),
        ("Cmd / Ctrl + I", "Italic"),
        ("Cmd / Ctrl + U", "Underline"),
        ("Cmd / Ctrl + K", "Insert link on selection"),
        ("Cmd / Ctrl + Z", "Undo"),
        ("Cmd / Ctrl + Shift + Z", "Redo"),
        ("Tab  /  Shift + Tab", "Next / previous field"),
        ("Escape", "Close popover (link, image, ref)"),
    ]:
        row = Table(
            [[Paragraph(k, mono_style),
              Paragraph(a, ParagraphStyle(
                  "KA", fontName=UI, fontSize=7.5, leading=11,
                  textColor=SUMI_LIGHT))]],
            colWidths=[3.6 * cm, None],
        )
        row.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        left.append(row)

    left.append(p("USE THE STYLE DROPDOWN FOR HEADINGS", SECTION))
    left.append(p(
        "Cmd+B on a large line produces a bold paragraph, not a heading. "
        "The design system's type scale and the page's anchor structure "
        "only apply when you use the style dropdown (Heading 2 / 3 / "
        "Quote).",
        TINY,
    ))

    right = []
    right.append(p("THE TAG TYPO TRAP", SECTION))
    right.append(p(
        "All four tag fields are declared <b>array of string</b>. "
        "The /content filter uses GROQ's <b>in</b> operator — exact, "
        "case-sensitive, whitespace-sensitive match:",
        TINY,
    ))
    right.append(p(
        '*[_type == "article" &amp;&amp; $area in areaTags]',
        code_inline,
    ))
    right.append(p(
        "<b>Niseko</b> and <b>niseko</b> are two different tags. A typo "
        "silently hides the article from the filter — no error, no "
        "warning. Maintain a shared tag list outside this document and "
        "copy-paste values, never retype.",
        TINY,
    ))

    right.append(p("FILTER URL FORMAT", SECTION))
    right.append(p(
        "/content?area=Niseko&amp;type=Managed+Condo&amp;use=Family+Base",
        code_inline,
    ))

    s.append(two_column(left, right))

    s.append(Spacer(1, 10))

    # Image rules — compact technical
    s.append(p("IMAGES — TECHNICAL RULES", SECTION))
    left2 = []
    left2.append(p("<b>JPEG</b> for photos. <b>PNG</b> for graphics with "
                   "transparency. <b>SVG</b> for logos and icons only.",
                   TINY))
    left2.append(p("<b>HEIC not supported.</b>  Convert on Mac: "
                   "Preview → Export as JPEG.", TINY))
    left2.append(p("<b>≥1600 px wide.</b>  Sanity CDN resizes down via "
                   "urlFor(img).width(N).auto('format').url().", TINY))
    left2.append(p("<b>Hotspot is required.</b>  Click crop icon, drag "
                   "the circular marker over the focal point.", TINY))

    right2 = []
    right2.append(p("<b>Alt text is required.</b>  Emitted as "
                    '&lt;img alt="..."&gt; on the live site. WCAG 2.1 '
                    "AA compliance.", TINY))
    right2.append(p("<b>Asset library is shared.</b>  Select → From "
                    "asset library to reuse an existing upload.", TINY))
    right2.append(p("<b>Hotspot is per-document.</b>  The same image in "
                    "another document has its own hotspot and crop.",
                    TINY))
    right2.append(p("<b>Replace image:</b>  three-dot menu → Upload — "
                    "old file stays in the library.", TINY))

    s.append(two_column(left2, right2))

    s.append(Spacer(1, 10))

    s.append(p("PUBLISH PIPELINE IN ONE LINE", SECTION))
    s.append(p(
        "Edit → autosave draft → <b>Publish</b> → validation → draft "
        "promoted → Sanity webhook POSTs /api/revalidate → "
        "revalidatePath() by _type → next request rebuilds the route.",
        TINY,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 4 — CHECKLIST + TROUBLESHOOTING + ESCALATION
    # ======================================================================
    s.append(p("QUICK REFERENCE  ·  04", SECTION))
    s.append(p("Pre-publish checklist & troubleshooting.", TITLE))
    s.append(p(
        "Technical checks only. Per document type, then a common "
        "troubleshooting table.", SUB))

    # Three-column checklist — one per document type
    col_w3 = [(PAGE_W - MARGIN_L - MARGIN_R - 0.8 * cm) / 3] * 3

    checklist_style = ParagraphStyle(
        "CL", fontName=UI, fontSize=7.5, leading=11, textColor=SUMI_LIGHT,
        spaceAfter=3, leftIndent=10, bulletIndent=0,
    )

    def checkbox_list(items):
        return ListFlowable(
            [ListItem(Paragraph(t, checklist_style), leftIndent=10) for t in items],
            bulletType="bullet",
            start="square",
            bulletFontName=UI,
            bulletFontSize=7,
            leftIndent=12,
            bulletColor=SUGI,
        )

    article_col = [
        p("ARTICLE", SECTION),
        checkbox_list([
            "title is set",
            "slug generated (not hand-typed)",
            "excerpt set (used in cards + SEO meta)",
            "body headings set via style dropdown",
            "every link opens with https://",
            "every inline image has alt text + hotspot",
            "featuredImage is set",
            "areaTags / propertyTypeTags / useCaseTags "
            "match the shared tag list exactly",
            "publishedAt present or empty (for auto)",
            "no validation errors shown in the editor",
        ]),
    ]

    area_col = [
        p("AREA GUIDE", SECTION),
        checkbox_list([
            "name is set",
            "slug generated from name",
            "prefectureSlug matches an existing route "
            "folder under /areas",
            "description is not empty",
            "images array has at least one image",
            "every image has alt text + hotspot",
            "climateInfo / accessInfo / propertyOverview "
            "filled as applicable",
            "tags match the shared tag list",
        ]),
    ]

    page_col = [
        p("PAGE", SECTION),
        checkbox_list([
            "title is set",
            "slug is final (not to be changed later)",
            "body has no placeholders or TODOs",
            "all links resolve to production URLs",
        ]),
        p("AFTER PUBLISH — VERIFY", SECTION),
        checkbox_list([
            "status dot turned solid green",
            "reloaded the live route "
            "(Cmd+Shift+R)",
            "new content visible on the page",
            "no console errors on the live page",
        ]),
    ]

    t = Table(
        [[article_col, area_col, page_col]],
        colWidths=col_w3,
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0.4 * cm),
            ("LINEAFTER", (0, 0), (1, 0), 0.2, BORDER),
        ]),
    )
    s.append(t)

    s.append(Spacer(1, 14))

    # Bottom row: symptom/fix table + escalation triggers
    left3 = []
    left3.append(p("SYMPTOM  →  FIRST FIX", SECTION))
    left3.append(p("<b>Publish button is grey</b><br/>"
                   "Required field is empty or invalid. Scroll up — "
                   "Sanity highlights the field in red.", TINY))
    left3.append(p("<b>Article change not live</b><br/>"
                   "Hard-reload (Cmd+Shift+R). Article routes are "
                   "force-dynamic — change is live on the next request.",
                   TINY))
    left3.append(p("<b>Area Guide / Page change not live</b><br/>"
                   "Wait ~10 seconds for the webhook → revalidatePath(), "
                   "then reload. Still missing → webhook failure, "
                   "developer task.", TINY))
    left3.append(p("<b>Filter shows no results for a known tag</b><br/>"
                   "Typo trap. The GROQ <b>in</b> operator requires "
                   "exact match. Check case and whitespace.", TINY))
    left3.append(p("<b>Image wrong aspect ratio on site</b><br/>"
                   "Open image → crop icon → adjust hotspot → save → "
                   "republish.", TINY))

    right3 = []
    right3.append(p("DEVELOPER REQUIRED FOR…", SECTION))
    right3.append(p("Adding, removing, or renaming a field on any doc type "
                    "(schema change in sanity/schemas/*.ts).", TINY))
    right3.append(p("Adding a new document type.", TINY))
    right3.append(p("Converting tag fields to reference-based taxonomy.",
                    TINY))
    right3.append(p("Slug change after publish (needs a Next.js redirect).",
                    TINY))
    right3.append(p("Webhook not firing (publish succeeds, revalidation "
                    "does not).", TINY))
    right3.append(p("Rotating SANITY_WEBHOOK_SECRET or API tokens.", TINY))
    right3.append(p("Any 500 on the live site after a publish.", TINY))

    right3.append(p("EDITOR-SAFE — NO DEVELOPER NEEDED", SECTION))
    right3.append(p("Creating, editing, publishing, unpublishing any "
                    "of the three existing doc types.", TINY))
    right3.append(p("Uploading, replacing, reusing images. Hotspot, "
                    "crop, alt text changes.", TINY))
    right3.append(p("Reordering items in an array (gallery, etc.).",
                    TINY))
    right3.append(p("Restoring any previous version from history.", TINY))

    s.append(two_column(left3, right3))

    s.append(Spacer(1, 10))
    s.append(callout(
        "Recovery window",
        "Every version of every document is kept. Click the clock icon "
        "on any document to open the timeline and restore a previous "
        "version. Accidentally deleted a document? Contact the developer "
        "immediately — Sanity's restore-from-history window is limited."
    ))

    doc.build(s)


if __name__ == "__main__":
    build(OUTPUT_PATH)
    print(f"Wrote {OUTPUT_PATH}")
