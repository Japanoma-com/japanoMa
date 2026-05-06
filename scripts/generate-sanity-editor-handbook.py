#!/usr/bin/env python3
"""
Japanoma Sanity Studio — Technical Reference.

A precise how-to-use document for editors working in the Japanoma Sanity
Studio. Covers mechanics only: logging in, the three document types,
fields, the Portable Text editor, image handling, tags, publishing,
and troubleshooting. No brand voice, no editorial guidance — this is
the technical manual.

Output: docs/Japanoma-Sanity-Editor-Handbook.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
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
# Ma Space v4 design tokens
# ---------------------------------------------------------------------------

SUMI = HexColor("#1A1816")
SUMI_LIGHT = HexColor("#3D3833")
STONE = HexColor("#8A8279")
ASH = HexColor("#C4BDB4")
WASHI = HexColor("#F5F0E8")
SHOJI = HexColor("#FAFAF7")
KINU = HexColor("#FFFFFF")
SUGI = HexColor("#9B7B4F")
SUGI_DEEP = HexColor("#7A5F3A")
BORDER = HexColor("#E5E0D8")
MATSU = HexColor("#4A6B52")
KOHAKU = HexColor("#A67B3D")
BENI = HexColor("#8B3A3A")
AI = HexColor("#3D5A7A")

PAGE_W, PAGE_H = A4
MARGIN_L = 2.4 * cm
MARGIN_R = 2.4 * cm
MARGIN_T = 2.6 * cm
MARGIN_B = 2.6 * cm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = PROJECT_ROOT / "docs" / "Japanoma-Sanity-Editor-Handbook.pdf"

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
MONO = "Courier"
MONO_B = "Courier-Bold"

# ---------------------------------------------------------------------------
# Paragraph styles
# ---------------------------------------------------------------------------

H1 = ParagraphStyle(
    "H1", fontName=SERIF, fontSize=26, leading=32, textColor=SUMI,
    spaceBefore=0, spaceAfter=10, alignment=TA_LEFT,
)
H2 = ParagraphStyle(
    "H2", fontName=SERIF, fontSize=15, leading=20, textColor=SUMI,
    spaceBefore=16, spaceAfter=5, alignment=TA_LEFT,
)
H3 = ParagraphStyle(
    "H3", fontName=UI, fontSize=9.5, leading=13, textColor=SUGI,
    spaceBefore=10, spaceAfter=3, alignment=TA_LEFT,
)
OVERLINE = ParagraphStyle(
    "Overline", fontName=UI, fontSize=8, leading=12, textColor=SUGI,
    spaceAfter=4, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    "Body", fontName=UI, fontSize=9.5, leading=15.5,
    textColor=SUMI_LIGHT, spaceAfter=6, alignment=TA_LEFT,
)
LEAD = ParagraphStyle(
    "Lead", fontName=SERIF_IT, fontSize=11.5, leading=18,
    textColor=STONE, spaceAfter=12, alignment=TA_LEFT,
)
CAPTION = ParagraphStyle(
    "Caption", fontName=UI, fontSize=8, leading=12, textColor=STONE,
    spaceAfter=4, alignment=TA_LEFT,
)
CODE = ParagraphStyle(
    "Code", fontName=MONO, fontSize=8.5, leading=12, textColor=SUMI,
    spaceAfter=6, leftIndent=10, rightIndent=10, alignment=TA_LEFT,
    backColor=SHOJI, borderPadding=6,
)
BULLET = ParagraphStyle(
    "Bullet", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=3,
)
CALLOUT_TITLE = ParagraphStyle(
    "CalloutTitle", fontName=UI, fontSize=7.5, leading=11, textColor=SUGI,
    spaceAfter=4, alignment=TA_LEFT,
)
CALLOUT_BODY = ParagraphStyle(
    "CalloutBody", fontName=UI, fontSize=9, leading=14, textColor=SUMI,
    spaceAfter=0, alignment=TA_LEFT,
)
TOC_NUM = ParagraphStyle(
    "TOCNum", fontName=UI, fontSize=9, leading=16, textColor=SUGI,
)
TOC_ITEM = ParagraphStyle(
    "TOCItem", fontName=SERIF, fontSize=11, leading=18, textColor=SUMI,
)
TOC_PAGE = ParagraphStyle(
    "TOCPage", fontName=UI, fontSize=9, leading=16, textColor=STONE,
    alignment=2,
)

COVER_OV = ParagraphStyle(
    "CoverOv", fontName=UI, fontSize=9, leading=12, textColor=SUGI,
    alignment=TA_LEFT, spaceAfter=12,
)
COVER_TITLE = ParagraphStyle(
    "CoverTitle", fontName=SERIF, fontSize=42, leading=50, textColor=SUMI,
    alignment=TA_LEFT, spaceAfter=14,
)
COVER_SUB = ParagraphStyle(
    "CoverSub", fontName=SERIF_IT, fontSize=15, leading=22, textColor=STONE,
    alignment=TA_LEFT, spaceAfter=24,
)
COVER_META_LABEL = ParagraphStyle(
    "CoverMetaLabel", fontName=UI, fontSize=7, leading=10, textColor=SUGI,
    alignment=TA_LEFT, spaceAfter=2,
)
COVER_META = ParagraphStyle(
    "CoverMeta", fontName=UI, fontSize=9, leading=13, textColor=SUMI_LIGHT,
    alignment=TA_LEFT, spaceAfter=8,
)


# ---------------------------------------------------------------------------
# Page chrome
# ---------------------------------------------------------------------------

def _hairline(c: Canvas, y: float, color=BORDER, width=0.3):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)


def cover_page(c: Canvas, doc):
    c.saveState()

    c.setFillColor(WASHI)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(SUGI)
    c.rect(MARGIN_L, PAGE_H - 3.6 * cm, 6, 6, fill=1, stroke=0)

    c.setFont(UI, 7.5)
    c.setFillColor(SUGI)
    c.drawString(MARGIN_L + 14, PAGE_H - 3.3 * cm,
                 "JAPANOMA  ·  SANITY STUDIO  ·  TECHNICAL REFERENCE")

    c.setStrokeColor(SUMI)
    c.setLineWidth(0.5)
    c.line(MARGIN_L, 3.2 * cm, PAGE_W - MARGIN_R, 3.2 * cm)

    c.setFont(UI, 8)
    c.setFillColor(SUMI)
    c.drawString(MARGIN_L, 2.55 * cm, "PROJECT  ·  ljeqozrv / production")
    c.drawRightString(PAGE_W - MARGIN_R, 2.55 * cm,
                      "STUDIO  ·  japanoma.sanity.studio")

    c.setFont(UI, 7.5)
    c.setFillColor(STONE)
    c.drawString(MARGIN_L, 2.1 * cm,
                 "Sanity 5.18  ·  next-sanity 11.6  ·  Next.js 15")
    c.drawRightString(PAGE_W - MARGIN_R, 2.1 * cm, "Version 1.0")

    c.restoreState()


def body_page(c: Canvas, doc):
    c.saveState()

    c.setFont(UI, 7.5)
    c.setFillColor(SUGI)
    c.drawString(MARGIN_L, PAGE_H - 1.5 * cm,
                 "JAPANOMA  ·  SANITY TECHNICAL REFERENCE")
    c.setFillColor(STONE)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.5 * cm, "V1.0")
    _hairline(c, PAGE_H - 1.75 * cm)

    _hairline(c, 1.9 * cm)
    c.setFont(UI, 7.5)
    c.setFillColor(STONE)
    c.drawString(MARGIN_L, 1.4 * cm, "Technical Reference")
    c.setFillColor(SUMI)
    c.drawRightString(PAGE_W - MARGIN_R, 1.4 * cm, f"{doc.page - 1:02d}")

    c.restoreState()


# ---------------------------------------------------------------------------
# Flowable helpers
# ---------------------------------------------------------------------------

def p(text, style=BODY):
    return Paragraph(text, style)


def bullets(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=10, value="disc") for t in items],
        bulletType="bullet",
        start="disc",
        bulletFontName=UI,
        bulletFontSize=6,
        leftIndent=16,
        bulletColor=SUGI,
    )


def numbered(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=10) for t in items],
        bulletType="1",
        bulletFormat="%s.",
        bulletFontName=UI,
        bulletFontSize=9,
        leftIndent=20,
        bulletColor=SUGI,
    )


def callout(title, body_text, tone=SUGI, bg=SHOJI):
    inner = [
        Paragraph(title.upper(), CALLOUT_TITLE),
        Paragraph(body_text, CALLOUT_BODY),
    ]
    t = Table([[inner]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 2, tone),
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


def code_block(text):
    """A fenced monospace block for GROQ/URLs/paths."""
    t = Table(
        [[Paragraph(text, ParagraphStyle(
            "CodeInner", fontName=MONO, fontSize=8.5, leading=12,
            textColor=SUMI,
        ))]],
        colWidths=[PAGE_W - MARGIN_L - MARGIN_R],
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LINEBEFORE", (0, 0), (0, -1), 2, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def field_table(rows, col1="FIELD", col2="TYPE", col3="WHAT TO PUT HERE",
                widths=None):
    header_s = ParagraphStyle(
        "FTH", fontName=UI, fontSize=7.5, textColor=STONE, leading=10)
    name_s = ParagraphStyle(
        "FN", fontName=UI, fontSize=9, textColor=SUMI, leading=13)
    type_s = ParagraphStyle(
        "FT", fontName=UI, fontSize=8.5, textColor=STONE, leading=13)
    desc_s = ParagraphStyle(
        "FD", fontName=UI, fontSize=9, textColor=SUMI_LIGHT, leading=14)

    data = [[
        Paragraph(f"<b>{col1}</b>", header_s),
        Paragraph(f"<b>{col2}</b>", header_s),
        Paragraph(f"<b>{col3}</b>", header_s),
    ]]
    for a, b, c in rows:
        data.append([
            Paragraph(f"<b>{a}</b>", name_s),
            Paragraph(b, type_s),
            Paragraph(c, desc_s),
        ])
    if widths is None:
        widths = [3.4 * cm, 3.0 * cm,
                  PAGE_W - MARGIN_L - MARGIN_R - 6.4 * cm]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, SUMI),
        ("LINEBELOW", (0, 1), (-1, -2), 0.25, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def kbd_table(rows):
    """Keyboard shortcut reference table."""
    header_s = ParagraphStyle(
        "KH", fontName=UI, fontSize=7.5, textColor=STONE, leading=10)
    key_s = ParagraphStyle(
        "KK", fontName=MONO_B, fontSize=9, textColor=SUMI, leading=13)
    act_s = ParagraphStyle(
        "KA", fontName=UI, fontSize=9, textColor=SUMI_LIGHT, leading=13)

    data = [[
        Paragraph("<b>SHORTCUT</b>", header_s),
        Paragraph("<b>ACTION</b>", header_s),
    ]]
    for k, a in rows:
        data.append([Paragraph(k, key_s), Paragraph(a, act_s)])
    t = Table(data,
              colWidths=[5.0 * cm, PAGE_W - MARGIN_L - MARGIN_R - 5.0 * cm])
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, SUMI),
        ("LINEBELOW", (0, 1), (-1, -2), 0.2, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def divider():
    t = Table([[""]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R], rowHeights=[1])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.3, BORDER)]))
    return t


def ma_zone(size=16):
    return Spacer(1, size)


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
        title="Japanoma Sanity Studio — Technical Reference",
        author="Craefto",
        subject="Technical reference for editing Japanoma content in Sanity Studio",
        keywords="Japanoma Sanity CMS technical reference editor",
    )

    frame_cover = Frame(
        MARGIN_L, MARGIN_B,
        PAGE_W - MARGIN_L - MARGIN_R,
        PAGE_H - MARGIN_T - MARGIN_B,
        id="cover",
    )
    frame_body = Frame(
        MARGIN_L, MARGIN_B + 0.2 * cm,
        PAGE_W - MARGIN_L - MARGIN_R,
        PAGE_H - MARGIN_T - MARGIN_B - 0.6 * cm,
        id="body",
    )
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[frame_cover], onPage=cover_page),
        PageTemplate(id="Body", frames=[frame_body], onPage=body_page),
    ])

    s = []

    # ======================================================================
    # COVER
    # ======================================================================
    s.append(Spacer(1, 5.0 * cm))
    s.append(p("TECHNICAL REFERENCE  ·  VOLUME 01", COVER_OV))
    s.append(p("Editing Japanoma<br/>in Sanity Studio.", COVER_TITLE))
    s.append(p("A precise, mechanics-only guide to the three<br/>"
               "document types, their fields, publishing, and<br/>"
               "troubleshooting.", COVER_SUB))

    s.append(ma_zone(30))
    s.append(p("STUDIO URL", COVER_META_LABEL))
    s.append(p("japanoma.sanity.studio", COVER_META))

    s.append(p("PROJECT / DATASET", COVER_META_LABEL))
    s.append(p("ljeqozrv  /  production", COVER_META))

    s.append(p("CONTENT TYPES", COVER_META_LABEL))
    s.append(p("Article · Area Guide · Page", COVER_META))

    s.append(p("TECH STACK", COVER_META_LABEL))
    s.append(p("Sanity 5.18 · next-sanity 11.6 · Next.js 15 (App Router)",
               COVER_META))

    s.append(NextPageTemplate("Body"))
    s.append(PageBreak())

    # ======================================================================
    # TOC
    # ======================================================================
    s.append(p("CONTENTS", OVERLINE))
    s.append(p("What's inside.", H1))
    s.append(p("Thirteen short chapters covering the full editor workflow. "
               "Read once, then use as a reference.", LEAD))
    s.append(ma_zone(6))

    # Page numbers updated after a first build pass — see verification note.
    toc = [
        ("01", "What you're editing", "02"),
        ("02", "Signing in to the Studio", "03"),
        ("03", "The Studio, region by region", "04"),
        ("04", "How publish actually works", "06"),
        ("05", "Article  ·  field-by-field", "08"),
        ("06", "Area Guide  ·  field-by-field", "10"),
        ("07", "Page  ·  field-by-field", "12"),
        ("08", "Portable Text editor mechanics", "13"),
        ("09", "Images, hotspot, and the asset library", "15"),
        ("10", "Tag fields and the typo trap", "17"),
        ("11", "Drafts, history, and scheduled publishing", "18"),
        ("12", "Troubleshooting", "20"),
        ("13", "When to contact the developer", "21"),
    ]
    data = []
    for num, title, page in toc:
        data.append([
            Paragraph(num, TOC_NUM),
            Paragraph(title, TOC_ITEM),
            Paragraph(page, TOC_PAGE),
        ])
    toc_table = Table(data, colWidths=[1.4 * cm, 12.6 * cm, 1.6 * cm])
    toc_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.2, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    s.append(toc_table)
    s.append(PageBreak())

    # ======================================================================
    # 01 · WHAT YOU'RE EDITING
    # ======================================================================
    s.append(p("ONE  ·  OVERVIEW", OVERLINE))
    s.append(p("What you're editing.", H1))
    s.append(p("Japanoma's Sanity dataset contains exactly three document "
               "types. Each one renders into a specific route on the Next.js "
               "site. When you publish a document, Sanity pushes an update "
               "that refreshes the relevant route.",
               LEAD))

    s.append(p("The three document types", H2))
    s.append(field_table([
        ("Article",
         "9 fields",
         "Editorial content. Renders at <b>/content/[slug]</b>. "
         "Also appears in the filterable list at <b>/content</b>."),
        ("Area Guide",
         "9 fields",
         "One document per snow region. Renders at "
         "<b>/areas/[prefectureSlug]/[slug]</b>."),
        ("Page",
         "3 fields",
         "Static pages (About, Privacy, Terms, Contact). Renders at "
         "<b>/[slug]</b>."),
    ], col2="FIELDS"))

    s.append(p("Where each route is defined in the app", H2))
    s.append(p(
        "For reference — these are the Next.js files that read from "
        "Sanity and render the content:",
    ))
    s.append(code_block(
        "/content              → src/app/content/page.tsx<br/>"
        "/content/[slug]       → src/app/content/[slug]/page.tsx<br/>"
        "/areas/[pref]/[city]  → src/app/areas/[prefecture]/[city]/page.tsx<br/>"
        "/[slug] (pages)       → wired via getPageBySlug in queries.ts"
    ))

    s.append(p("What the app does with your data", H2))
    s.append(p(
        "Queries live in <b>src/lib/sanity/queries.ts</b>. The client is "
        "built from <b>src/lib/sanity/config.ts</b> using "
        "<b>next-sanity 11.6</b>. Images are resized on the fly through "
        "Sanity's CDN via <b>@sanity/image-url</b> (helper at "
        "<b>src/lib/sanity/image.ts</b>). Rich text bodies render through "
        "<b>@portabletext/react</b>."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 02 · SIGNING IN
    # ======================================================================
    s.append(p("TWO  ·  ACCESS", OVERLINE))
    s.append(p("Signing in to the Studio.", H1))

    s.append(p("Getting an account", H2))
    s.append(p(
        "Accounts are created by invitation. The project administrator "
        "invites your email address from the Sanity management console; "
        "you receive an email from <b>sanity.io</b> with a one-click link. "
        "Accept it, then set a password or use Google SSO."
    ))

    s.append(p("Opening the Studio", H2))
    s.append(p("The Studio is hosted — not embedded in the Next.js app."))
    s.append(code_block("https://japanoma.sanity.studio"))
    s.append(p(
        "Bookmark it. There is no <b>/studio</b> route inside the main "
        "Japanoma website; this is a separate Sanity deployment that "
        "writes to the same dataset."
    ))

    s.append(p("First-login verification", H2))
    s.append(numbered([
        "Open the Studio URL above.",
        "Sign in with the email that received the invitation.",
        "Check the top-right: your avatar or name should appear.",
        "In the left pane you should see <b>Article</b>, <b>Area Guide</b>, "
        "and <b>Page</b>. If any are missing, your account is not attached "
        "to the <b>ljeqozrv / production</b> dataset.",
        "Open any document, change one character, press Publish, then "
        "reload the relevant live page to confirm the round-trip works.",
    ]))

    s.append(ma_zone(8))
    s.append(callout(
        "If sign-in fails",
        "Use the exact email the invitation was sent to. Password reset "
        "is at <b>sanity.io</b> (not at japanoma.sanity.studio). Do not "
        "create a new account — that creates an unlinked identity that "
        "cannot see the dataset."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 03 · STUDIO REGIONS
    # ======================================================================
    s.append(p("THREE  ·  STUDIO LAYOUT", OVERLINE))
    s.append(p("The Studio, region by region.", H1))
    s.append(p("Four regions. Everything you do happens in one of them.",
               LEAD))

    s.append(field_table([
        ("Top bar",
         "Chrome",
         "Project name (<i>Japanoma CMS</i>), global search, and your "
         "avatar. Rarely touched."),
        ("Left navigation",
         "Tools",
         "Icons for the loaded tools. The <b>Desk</b> icon is your only "
         "entry point to content editing."),
        ("Desk panes",
         "Browser",
         "Column-based content browser. Each click opens a new column to "
         "the right. Click <i>Article</i>, then a specific article."),
        ("Document editor",
         "Form",
         "The wide panel on the right where you edit. Contains every "
         "field defined in the schema. Autosave indicator at the top; "
         "Publish button at the bottom-right."),
    ], col2="ROLE"))

    s.append(p("Status dots — what they mean", H2))
    s.append(field_table([
        ("Green",
         "Published",
         "The current published version is live. No unpublished changes."),
        ("Orange",
         "Draft only",
         "There is a draft, but nothing has been published yet."),
        ("Green + Orange",
         "Published + draft",
         "Live version exists; newer unpublished edits are sitting on top."),
        ("No dot",
         "Never published",
         "Exists only as a draft. Not on the live site."),
    ], col2="STATE", widths=[3.4 * cm, 3.0 * cm,
                             PAGE_W - MARGIN_L - MARGIN_R - 6.4 * cm]))

    s.append(PageBreak())

    s.append(p("THREE  ·  STUDIO LAYOUT  ·  CONTINUED", OVERLINE))

    s.append(p("Search", H2))
    s.append(p(
        "The magnifying glass in the top bar searches across all document "
        "types and indexed fields (titles, slugs, body text). Results open "
        "the document in the editor when clicked."
    ))

    s.append(p("Navigating with the keyboard", H2))
    s.append(p(
        "Most column-list movement is mouse-driven, but the document "
        "editor supports rich text shortcuts (see Chapter 08). Within a "
        "document, <b>Tab</b> moves between fields and <b>Escape</b> "
        "closes any open popover (image crop, link edit, reference "
        "selector)."
    ))

    s.append(p("Recent documents", H2))
    s.append(p(
        "If a <b>Recently edited</b> view is configured in the desk "
        "structure, it appears at the top of the left pane. Use it to "
        "jump back to yesterday's work without scrolling the full list."
    ))

    s.append(p("Collaboration presence", H2))
    s.append(p(
        "When another editor is viewing or editing the same document, "
        "their avatar appears in the top-right of the editor. Changes "
        "are merged in real time; there is no locking. Coordinate on a "
        "team channel before making simultaneous edits to the same "
        "fields."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 04 · HOW PUBLISH WORKS
    # ======================================================================
    s.append(p("FOUR  ·  PUBLISH PIPELINE", OVERLINE))
    s.append(p("How publish actually works.", H1))
    s.append(p(
        "Different document types take different paths to the live site. "
        "Understanding which is which helps you know whether to expect a "
        "change to appear instantly or after a short delay.",
        LEAD,
    ))

    s.append(p("The full pipeline — step by step", H2))
    s.append(numbered([
        "You edit a field. Sanity autosaves the change as a <b>draft</b> "
        "within ~1 second. The draft is visible only to signed-in editors.",
        "You press <b>Publish</b> (bottom-right of the editor).",
        "Sanity runs validation — any required field that is empty or "
        "invalid causes the publish to fail with a red banner.",
        "The published version replaces the previous one. The old one "
        "moves into the document's history.",
        "Sanity's <b>GROQ-powered webhook</b> fires an HTTP POST to "
        "Japanoma's Next.js app at <b>/api/revalidate</b> with the "
        "document body and a secret header.",
        "The revalidate route inspects <b>_type</b> and calls "
        "Next.js's <b>revalidatePath()</b> on the routes that render "
        "that document.",
        "The next request to any affected route rebuilds it with the "
        "new Sanity data.",
    ]))

    s.append(p("Per-document-type expectations", H2))
    s.append(field_table([
        ("Article",
         "Instant",
         "The Article routes use <b>dynamic = \"force-dynamic\"</b> "
         "in their <b>page.tsx</b>, so they are server-rendered on "
         "every request. Your change is live the moment the next "
         "request hits the server — no ISR wait."),
        ("Area Guide",
         "Webhook → ISR",
         "Publishing fires the webhook, which calls "
         "<b>revalidatePath('/areas')</b> and "
         "<b>revalidatePath('/areas/[prefectureSlug]')</b>. Expect the "
         "change to be visible within a few seconds on the next request."),
        ("Page",
         "Webhook → ISR",
         "Publishing fires the webhook, which calls "
         "<b>revalidatePath('/[slug].current')</b>. Same timing as "
         "Area Guide."),
    ], col1="TYPE", col2="TIMING",
       widths=[2.8 * cm, 3.5 * cm, PAGE_W - MARGIN_L - MARGIN_R - 6.3 * cm]))

    s.append(PageBreak())

    s.append(p("FOUR  ·  PUBLISH PIPELINE  ·  CONTINUED", OVERLINE))

    s.append(p("Autosave is always on", H2))
    s.append(p(
        "You never press Save. Every keystroke is persisted as a draft "
        "within ~1 second. A small <i>Saved</i> indicator appears near "
        "the top of the editor when the draft is flushed. Closing the "
        "browser never loses work."
    ))

    s.append(p("Unpublishing", H2))
    s.append(p(
        "Open the document's three-dot menu (top-right of the editor) "
        "and choose <b>Unpublish</b>. The document becomes a draft-only "
        "state (orange dot). The webhook fires again, so the live site "
        "revalidates and the content disappears from the relevant routes. "
        "To put it back, press <b>Publish</b>."
    ))

    s.append(p("Deleting", H2))
    s.append(p(
        "Three-dot menu → <b>Delete</b>. This removes the document from "
        "the dataset. Other documents that reference it will show a "
        "<i>Missing</i> indicator. Prefer <b>Unpublish</b> unless the "
        "document was created in error (a test draft, a duplicate)."
    ))

    s.append(p("Webhook authentication", H2))
    s.append(p(
        "The <b>/api/revalidate</b> endpoint rejects any request whose "
        "<b>x-sanity-webhook-secret</b> header does not match the server's "
        "<b>SANITY_WEBHOOK_SECRET</b> env var. If publishes stop "
        "propagating after a key rotation, this is the first place to "
        "check — the Sanity webhook config and the Vercel env var must "
        "match exactly."
    ))

    s.append(ma_zone(8))
    s.append(callout(
        "If a published change does not appear within a minute",
        "Check the document's status dot first — solid green means it "
        "really is published. Then hard-reload the live page "
        "(<b>Cmd+Shift+R</b>). If the change is still missing, the "
        "revalidation webhook is probably failing — that's a developer "
        "task: check Vercel logs on the <b>/api/revalidate</b> route."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 05 · ARTICLE
    # ======================================================================
    s.append(p("FIVE  ·  DOCUMENT TYPE", OVERLINE))
    s.append(p("Article — the nine fields.", H1))
    s.append(p(
        "Defined in <b>sanity/schemas/article.ts</b>. Renders at "
        "<b>/content/[slug]</b> via <b>getArticleBySlug()</b>, and appears "
        "in the filterable list at <b>/content</b> via "
        "<b>getFilteredArticles()</b>.",
        LEAD,
    ))

    s.append(field_table([
        ("title",
         "string · required",
         "The article title. Rendered as the <b>H1</b> on the article "
         "page and as the card title on the <b>/content</b> list."),
        ("slug",
         "slug · required",
         "URL-friendly identifier. Set by clicking <b>Generate</b> — "
         "do not type manually. Once published, changing it breaks "
         "existing links to <b>/content/[slug]</b>."),
        ("excerpt",
         "text (3 rows)",
         "Short summary. Shown on article cards and used as the SEO "
         "<b>meta description</b>. Can be empty, but the card layout "
         "looks better when present."),
        ("body",
         "array · block + image",
         "Portable Text body. Contains text blocks and inline images "
         "(see Chapter 08). Rendered by "
         "<b>&lt;PortableText value={article.body} /&gt;</b>."),
        ("featuredImage",
         "image (hotspot)",
         "Hero image. Rendered on the article page at <b>1360px</b> "
         "wide via <b>urlFor(image).width(1360).auto('format').url()</b>. "
         "Set the hotspot (see Chapter 09) so responsive crops don't "
         "cut off the focal point."),
        ("areaTags",
         "array of string",
         "Free-form list. Controls the <b>area</b> filter on "
         "<b>/content?area=...</b>. Spelling matters — see Chapter 10."),
        ("propertyTypeTags",
         "array of string",
         "Free-form list. Controls the <b>type</b> filter on "
         "<b>/content?type=...</b>."),
        ("useCaseTags",
         "array of string",
         "Free-form list. Controls the <b>use</b> filter on "
         "<b>/content?use=...</b>."),
        ("publishedAt",
         "datetime",
         "Date shown on the card and the article page. Used for sorting "
         "<b>| order(publishedAt desc)</b>. Set automatically on first "
         "publish; can be overridden to backdate or schedule."),
    ], col1="FIELD (schema)", col2="TYPE",
       widths=[3.6 * cm, 3.2 * cm,
               PAGE_W - MARGIN_L - MARGIN_R - 6.8 * cm]))

    s.append(PageBreak())

    s.append(p("FIVE  ·  ARTICLE  ·  CONTINUED", OVERLINE))

    s.append(p("The GROQ query that fetches an article", H2))
    s.append(p(
        "This is the exact query in "
        "<b>src/lib/sanity/queries.ts</b> — useful to understand which "
        "fields are actually used by the rendering layer:"
    ))
    s.append(code_block(
        '*[_type == "article" &amp;&amp; slug.current == $slug][0] {<br/>'
        '&nbsp;&nbsp;_id, title, slug, excerpt, body, featuredImage, publishedAt,<br/>'
        '&nbsp;&nbsp;areaTags, propertyTypeTags, useCaseTags<br/>'
        '}'
    ))

    s.append(p("The filter query on /content", H2))
    s.append(p(
        "This is why tag spelling matters. The filter uses GROQ's "
        "<b>in</b> operator with an exact string match:"
    ))
    s.append(code_block(
        '*[_type == "article" &amp;&amp; $area in areaTags]<br/>'
        '&nbsp;&nbsp;| order(publishedAt desc) [0...12]'
    ))
    s.append(p(
        "If the user's filter URL is <b>?area=Niseko</b> but the article "
        "has <b>areaTags: [\"niseko\"]</b> (lowercase), the "
        "<b>$area in areaTags</b> check returns false and the article "
        "is hidden from the filtered list."
    ))

    s.append(p("Related articles", H2))
    s.append(p(
        "The article page also runs <b>getRelatedArticles()</b>, which "
        "finds other articles sharing at least one tag with the current "
        "one, ordered by <b>publishedAt desc</b>, limited to 3. Again — "
        "exact tag match, typos break it."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 06 · AREA GUIDE
    # ======================================================================
    s.append(p("SIX  ·  DOCUMENT TYPE", OVERLINE))
    s.append(p("Area Guide — the nine fields.", H1))
    s.append(p(
        "Defined in <b>sanity/schemas/area-guide.ts</b>. Renders at "
        "<b>/areas/[prefectureSlug]/[slug]</b>. Publishing triggers "
        "revalidation of <b>/areas</b> and "
        "<b>/areas/[prefectureSlug]</b>.",
        LEAD,
    ))

    s.append(field_table([
        ("name",
         "string · required",
         "The region's display name. Used as the page H1 and as the "
         "card title on the <b>/areas</b> listing."),
        ("slug",
         "slug · required",
         "URL-friendly identifier generated from <b>name</b>. Forms "
         "the final segment of the live URL."),
        ("prefectureSlug",
         "string",
         "Controls the <b>[prefectureSlug]</b> segment of the live "
         "URL. Must match an existing prefecture route folder. "
         "Lowercase, no spaces. Changing this after publish moves the "
         "page to a new URL — breaks existing links."),
        ("description",
         "text",
         "Plain-text overview of the region. Rendered as paragraphs on "
         "the guide page."),
        ("images",
         "array of image (hotspot)",
         "Gallery. Each item is an image with its own hotspot and "
         "caption. Order matters — drag to reorder. See Chapter 09."),
        ("climateInfo",
         "text",
         "Plain-text block about snowfall, season length, temperature."),
        ("accessInfo",
         "text",
         "Plain-text block about airports, transfers, trains, roads."),
        ("propertyOverview",
         "text",
         "Plain-text block about dominant property types and price "
         "bands."),
        ("tags",
         "array of string",
         "Free-form labels for filtering and related-content matching. "
         "Same typo warning as Article tags — see Chapter 10."),
    ], col1="FIELD (schema)", col2="TYPE",
       widths=[3.6 * cm, 3.4 * cm,
               PAGE_W - MARGIN_L - MARGIN_R - 7.0 * cm]))

    s.append(PageBreak())

    s.append(p("SIX  ·  AREA GUIDE  ·  CONTINUED", OVERLINE))

    s.append(p("URL construction", H2))
    s.append(p(
        "The final URL is built from two fields:"
    ))
    s.append(code_block(
        "/areas/ + prefectureSlug + / + slug.current<br/>"
        "<br/>"
        "e.g. prefectureSlug: \"nagano\"<br/>"
        "&nbsp;&nbsp;&nbsp;slug.current: \"hakuba\"<br/>"
        "&nbsp;&nbsp;&nbsp;URL: /areas/nagano/hakuba"
    ))

    s.append(p("The GROQ queries used", H2))
    s.append(p(
        "The two queries in <b>queries.ts</b> that power area guides:"
    ))
    s.append(code_block(
        "// listing page<br/>"
        '*[_type == "areaGuide"] | order(name asc) {<br/>'
        '&nbsp;&nbsp;_id, name, slug, prefectureSlug, description, images<br/>'
        "}<br/><br/>"
        "// single guide<br/>"
        '*[_type == "areaGuide" &amp;&amp; slug.current == $slug][0]'
    ))

    s.append(p("Why the images field is an array", H2))
    s.append(p(
        "Unlike Article's single <b>featuredImage</b>, Area Guide has "
        "a multi-image gallery. Each entry in the array is a separate "
        "image document with its own hotspot, crop, and alt text. "
        "Drag the handle on the left of each row to reorder. The order "
        "you set is the render order on the live page."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 07 · PAGE
    # ======================================================================
    s.append(p("SEVEN  ·  DOCUMENT TYPE", OVERLINE))
    s.append(p("Page — the three fields.", H1))
    s.append(p(
        "Defined in <b>sanity/schemas/page.ts</b>. The simplest type. "
        "Used for static corners of the site that don't fit Article or "
        "Area Guide (About, Privacy, Terms, Contact, etc.).",
        LEAD,
    ))

    s.append(field_table([
        ("title",
         "string · required",
         "Page title. Shown in the browser tab and as the page H1."),
        ("slug",
         "slug · required",
         "URL-friendly identifier generated from <b>title</b>. The page "
         "renders at <b>/{slug.current}</b>."),
        ("body",
         "array · block only",
         "Portable Text body — text blocks only. No inline images are "
         "allowed in Pages by the current schema. If you need images, "
         "ask the developer to add <b>image</b> to the "
         "<b>of:</b> array in the schema first."),
    ], col1="FIELD (schema)", col2="TYPE",
       widths=[3.6 * cm, 3.2 * cm,
               PAGE_W - MARGIN_L - MARGIN_R - 6.8 * cm]))

    s.append(p("The GROQ query", H2))
    s.append(code_block(
        '*[_type == "page" &amp;&amp; slug.current == $slug][0] {<br/>'
        "&nbsp;&nbsp;_id, title, slug, body<br/>"
        "}"
    ))

    s.append(p("Slug changes break things", H2))
    s.append(p(
        "The slug becomes the full public URL for the page. Changing it "
        "after publish means:"
    ))
    s.append(bullets([
        "Old bookmarks and external links 404.",
        "Search engines need to re-index the new URL.",
        "Any hardcoded internal link in the Next.js app still points "
        "to the old slug.",
    ]))
    s.append(p(
        "If a slug must change, ask the developer to add a redirect "
        "from the old path first."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 08 · PORTABLE TEXT EDITOR
    # ======================================================================
    s.append(p("EIGHT  ·  RICH TEXT", OVERLINE))
    s.append(p("Portable Text editor mechanics.", H1))
    s.append(p(
        "Portable Text is Sanity's structured rich-text format. The "
        "editor looks like a word processor but outputs JSON, which the "
        "<b>@portabletext/react</b> renderer turns into real HTML on "
        "the live site.",
        LEAD,
    ))

    s.append(p("The toolbar", H2))
    s.append(p(
        "Click into any Portable Text field and a toolbar appears above "
        "the editor. Contents from left to right:"
    ))
    s.append(bullets([
        "<b>Style dropdown</b> — controls the block type: Normal, "
        "Heading 1 through Heading 6, Quote. This is how you make "
        "headings — not by making text bold and larger.",
        "<b>Bold / Italic / Underline</b> — character-level marks "
        "applied to the selected text.",
        "<b>Link</b> — select text, click the link icon, paste a URL "
        "starting with <b>https://</b>.",
        "<b>Bullet list</b> and <b>Numbered list</b>.",
        "<b>+ Insert</b> (for Article's body field only) — inserts an "
        "inline image block.",
        "<b>Clear formatting</b> (eraser icon) — strips marks from the "
        "selection. Useful after pasting from a word processor."
    ]))

    s.append(p("Headings — use the dropdown", H2))
    s.append(p(
        "The style dropdown is the only correct way to create a heading. "
        "Making a line bold and large via <b>Cmd+B</b> produces a bold "
        "paragraph, not a heading — the rendered site has no H2 tag, "
        "no anchor, no screen-reader landmark, and the design system's "
        "typography scale does not apply."
    ))

    s.append(p("Links", H2))
    s.append(numbered([
        "Select the text that should become the link.",
        "Click the link icon in the toolbar (or press <b>Cmd+K</b>).",
        "Paste a complete URL, starting with <b>https://</b>.",
        "Press <b>Enter</b>. The text is now linked.",
        "To edit or remove the link, click anywhere on the linked text "
        "and use the popover that appears.",
    ]))

    s.append(PageBreak())

    s.append(p("EIGHT  ·  PORTABLE TEXT  ·  CONTINUED", OVERLINE))

    s.append(p("Inline images (Article body only)", H2))
    s.append(p(
        "Place the cursor on a new empty line. A small <b>+</b> appears "
        "at the left margin. Click it, choose <b>Image</b>, and upload. "
        "The image becomes its own block in the flow. Fill in the "
        "alt text in the side panel — the renderer uses it as the "
        "<b>alt</b> attribute on the output <b>&lt;img&gt;</b> tag."
    ))

    s.append(p("Pasting from Word, Google Docs, Notion", H2))
    s.append(p(
        "Word processors bring invisible formatting that the Portable "
        "Text editor tries to translate. Results are inconsistent. The "
        "safe workflow is:"
    ))
    s.append(numbered([
        "Paste the content.",
        "Select everything (<b>Cmd+A</b>).",
        "Click the <b>Clear formatting</b> eraser button in the toolbar.",
        "Re-apply headings via the style dropdown, and re-apply lists "
        "using the list buttons.",
    ]))

    s.append(p("Keyboard shortcuts", H2))
    s.append(kbd_table([
        ("Cmd / Ctrl + B", "Bold"),
        ("Cmd / Ctrl + I", "Italic"),
        ("Cmd / Ctrl + U", "Underline"),
        ("Cmd / Ctrl + K", "Insert link on selection"),
        ("Cmd / Ctrl + Z", "Undo (entire document history)"),
        ("Cmd / Ctrl + Shift + Z", "Redo"),
        ("Cmd / Ctrl + A", "Select all text in the current block"),
        ("Tab", "Move focus to next field"),
        ("Shift + Tab", "Move focus to previous field"),
        ("Escape", "Close an open popover (link, image, reference)"),
    ]))

    s.append(PageBreak())

    # ======================================================================
    # 09 · IMAGES
    # ======================================================================
    s.append(p("NINE  ·  IMAGES", OVERLINE))
    s.append(p("Images, hotspot, and the asset library.", H1))
    s.append(p(
        "Every uploaded image is stored once in Japanoma's shared "
        "<b>asset library</b> and referenced by ID from any document "
        "that uses it. Sanity's CDN handles resizing and format "
        "conversion on request.",
        LEAD,
    ))

    s.append(p("Uploading an image", H2))
    s.append(numbered([
        "Click the image field — an upload area appears.",
        "Drag a file onto it, or click <b>Select</b> to browse.",
        "Wait for the progress bar to complete.",
        "The image is now in the asset library and can be reused from "
        "any other document via <b>Select → From asset library</b>.",
    ]))

    s.append(p("Supported formats and limits", H2))
    s.append(field_table([
        ("JPEG",
         "Photos",
         "Primary format for photography. Source files up to ~10 MB "
         "upload comfortably."),
        ("PNG",
         "Graphics",
         "Use for images with transparency (logos, icons)."),
        ("WebP",
         "Either",
         "Accepted natively. Sanity also serves WebP automatically "
         "via the image URL builder's <b>.auto('format')</b> call."),
        ("SVG",
         "Icons only",
         "Accepted for logos and icons. Do not upload SVG photos."),
        ("HEIC",
         "Not supported",
         "Convert to JPEG on your Mac first (Preview → Export as "
         "JPEG). Uploading HEIC will either fail or render as a broken "
         "image on the live site."),
        ("Minimum width",
         "≥1600 px",
         "Sanity's CDN resizes down on demand, so large source files "
         "are fine. Small source files look soft when rendered at the "
         "live site's 1360 px target width."),
    ], col2="USE CASE"))

    s.append(PageBreak())

    s.append(p("NINE  ·  IMAGES  ·  CONTINUED", OVERLINE))

    s.append(p("Hotspot and crop", H2))
    s.append(p(
        "Because the site is responsive, the same image is cropped to "
        "different aspect ratios on different screens. Sanity's "
        "<b>hotspot</b> is the circular marker that tells the CDN "
        "\"always keep this point visible\". Set it to the subject's "
        "face, the main detail, or wherever the focal point sits."
    ))
    s.append(numbered([
        "Click the pencil/crop icon on the uploaded image.",
        "A modal appears with two draggable controls — a circular "
        "<b>hotspot</b> and a rectangular <b>crop</b>.",
        "Drag the hotspot over the subject.",
        "Drag the crop edges to hide any borders or irrelevant areas.",
        "Click <b>Save</b>.",
    ]))
    s.append(p(
        "The result is baked into the image reference on this document. "
        "The same image used in another document has its own separate "
        "hotspot and crop."
    ))

    s.append(p("Alt text", H2))
    s.append(p(
        "Every image field includes an <b>alt text</b> input. It is "
        "required for WCAG 2.1 AA compliance, which Japanoma is "
        "committed to. The text you write is emitted as the "
        "<b>&lt;img alt=\"...\"&gt;</b> attribute on the live site."
    ))

    s.append(p("The image URL builder", H2))
    s.append(p(
        "For reference — when the Next.js app renders an image, it uses "
        "the helper in <b>src/lib/sanity/image.ts</b> to build a "
        "responsive CDN URL:"
    ))
    s.append(code_block(
        "urlFor(article.featuredImage)<br/>"
        "&nbsp;&nbsp;.width(1360)<br/>"
        "&nbsp;&nbsp;.auto('format')  // serves WebP / AVIF when supported<br/>"
        "&nbsp;&nbsp;.url()"
    ))
    s.append(p(
        "The hotspot and crop you set in the Studio feed into this URL "
        "automatically — the CDN applies them server-side."
    ))

    s.append(p("Reusing images from the asset library", H2))
    s.append(p(
        "Click an image field, then <b>Select → From asset library</b>. "
        "Every image ever uploaded to the dataset appears. Search by "
        "filename. Reusing keeps storage lean and avoids duplicate "
        "assets for the same photograph."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 10 · TAG FIELDS
    # ======================================================================
    s.append(p("TEN  ·  TAG FIELDS", OVERLINE))
    s.append(p("Tag fields and the typo trap.", H1))
    s.append(p(
        "The four tag fields in the schema — Article's <b>areaTags</b>, "
        "<b>propertyTypeTags</b>, <b>useCaseTags</b>, and Area Guide's "
        "<b>tags</b> — are declared as <b>array of string</b>. That "
        "means Sanity accepts any value you type. The technical "
        "consequences are worth understanding.",
        LEAD,
    ))

    s.append(p("How the filter URL works", H2))
    s.append(p(
        "The <b>/content</b> page reads three search params and passes "
        "them to <b>getFilteredArticles()</b>:"
    ))
    s.append(code_block(
        "/content?area=Niseko&amp;type=Managed+Condo&amp;use=Family+Base"
    ))
    s.append(p(
        "Each param is matched against the corresponding tag field "
        "with GROQ's <b>in</b> operator:"
    ))
    s.append(code_block(
        '$area in areaTags<br/>'
        '$propertyType in propertyTypeTags<br/>'
        '$useCase in useCaseTags'
    ))

    s.append(p("Why typos are a silent failure", H2))
    s.append(p(
        "GROQ's <b>in</b> operator is an <b>exact string match</b>. "
        "Case-sensitive. Whitespace-sensitive. No fuzzy matching."
    ))
    s.append(bullets([
        "<b>Niseko</b> and <b>niseko</b> are two different tags.",
        "<b>Managed Condo</b> and <b>Managed Condo </b> (trailing "
        "space) are two different tags.",
        "<b>Family Base</b> and <b>family-base</b> are two different "
        "tags.",
    ]))
    s.append(p(
        "When an article has a typo tag, it <b>silently disappears</b> "
        "from the filtered list for that tag. No error. No warning. "
        "Just missing content that looks correct in the Studio."
    ))

    s.append(p("The editorial convention", H2))
    s.append(p(
        "Maintain a shared spreadsheet or wiki page outside this "
        "handbook with the authoritative tag list. Copy-paste tag "
        "values from that document when filling in the Studio — never "
        "retype. When a new tag is needed, add it to the shared "
        "document first, then use it in Sanity."
    ))
    s.append(p(
        "If the developer ever converts these fields from "
        "<b>array of string</b> to a list of references to a "
        "dedicated <b>Taxonomy</b> document type, this problem "
        "disappears — selection becomes a dropdown. Until then, "
        "discipline is the only safeguard."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 11 · DRAFTS, HISTORY, SCHEDULING
    # ======================================================================
    s.append(p("ELEVEN  ·  VERSIONS", OVERLINE))
    s.append(p("Drafts, history, and scheduled publishing.", H1))

    s.append(p("Draft vs published, in one paragraph", H2))
    s.append(p(
        "When you edit a document, Sanity writes a private <b>draft</b> "
        "copy. Editors see it; the live site does not. Pressing "
        "<b>Publish</b> promotes the draft to become the live version. "
        "The previous live version moves into history. Every version "
        "of every document is retained indefinitely."
    ))

    s.append(p("Revision history", H2))
    s.append(numbered([
        "Open any document.",
        "Click the <b>clock icon</b> in the top-right of the editor.",
        "A timeline appears on the right side. Each entry shows who "
        "made the change and when.",
        "Click an entry to preview that historical version in the "
        "editor.",
        "Click <b>Restore</b> to turn that historical version into "
        "the current draft.",
        "Press <b>Publish</b> to make the restored version live.",
    ]))

    s.append(p("Scheduled publishing", H2))
    s.append(p(
        "Japanoma uses Sanity's <b>publishedAt</b> field convention for "
        "simple scheduling. Setting <b>publishedAt</b> to a future "
        "datetime and then publishing the document does <b>not</b> "
        "itself defer visibility — the content is immediately available "
        "to anyone who queries it."
    ))
    s.append(p(
        "If true time-gated publishing is required (content that is "
        "genuinely hidden until the scheduled moment), the developer "
        "needs to install Sanity's <b>Scheduled Publishing</b> plugin "
        "and the Next.js queries need to filter "
        "<b>publishedAt &lt;= now()</b>. That is not currently wired. "
        "For now, only publish documents you're ready for the world "
        "to see."
    ))

    s.append(PageBreak())

    s.append(p("ELEVEN  ·  VERSIONS  ·  CONTINUED", OVERLINE))

    s.append(p("Unpublishing", H2))
    s.append(p(
        "Three-dot menu → <b>Unpublish</b>. The document becomes a "
        "draft-only state. The webhook fires and the revalidation "
        "routes remove the content from the live site. To put it back, "
        "press <b>Publish</b> again."
    ))

    s.append(p("Deleting", H2))
    s.append(p(
        "Three-dot menu → <b>Delete</b>. The document is removed from "
        "the dataset entirely. If any other document references the "
        "deleted one, those references show as <b>Missing</b> in the "
        "editor. History of the deleted document is kept for a limited "
        "recovery window but it is much harder to retrieve than an "
        "unpublish. Prefer unpublish unless the document was a genuine "
        "mistake."
    ))

    s.append(ma_zone(10))
    s.append(callout(
        "Recovering deleted work",
        "If you've just deleted something by accident, do not create a "
        "new document. Contact the developer immediately — Sanity's "
        "API supports restore from history for a limited window, but "
        "the clock is ticking."
    ))

    s.append(PageBreak())

    # ======================================================================
    # 12 · TROUBLESHOOTING
    # ======================================================================
    s.append(p("TWELVE  ·  TROUBLESHOOTING", OVERLINE))
    s.append(p("Symptoms and first fixes.", H1))
    s.append(p(
        "Work through this table before escalating. Most issues have a "
        "quick self-service fix.",
        LEAD,
    ))

    s.append(field_table([
        ("Cannot sign in",
         "Auth",
         "Verify the exact email address was used (invitations are "
         "bound to a specific address). Reset the password at "
         "<b>sanity.io</b>. Do not create a new account."),
        ("Publish button is disabled / grey",
         "Validation",
         "A required field is empty or invalid. Scroll up — Sanity "
         "highlights the offending field with a red border and a "
         "message underneath. Fix and retry."),
        ("Red validation error on save",
         "Validation",
         "Same cause. Read the message under the field — it tells you "
         "what rule was violated (min length, required, regex, etc.)."),
        ("Changes not appearing on the live site",
         "Revalidation",
         "For Article: hard-reload (<b>Cmd+Shift+R</b>) — article pages "
         "are force-dynamic, so the change should be live instantly. "
         "For Area Guide / Page: wait ~10 seconds for the revalidation "
         "webhook, then reload. Still missing → contact developer."),
        ("Reference field shows \"Missing\"",
         "Data",
         "The referenced document was deleted or unpublished. Pick a "
         "new reference or remove the broken one."),
        ("Image rendered at wrong aspect ratio",
         "Hotspot",
         "Open the image, click the crop icon, adjust the hotspot and "
         "crop, save, republish."),
        ("Image failed to upload",
         "Asset",
         "Check the format — HEIC is not supported, convert to JPEG. "
         "Check the file size — >50 MB uploads time out."),
        ("Filter shows no results for a known tag",
         "Tags",
         "Typo trap. See Chapter 10. The tag in the URL must be an "
         "exact match to the tag stored on the document."),
        ("Studio shows \"dataset not found\"",
         "Access",
         "Your account is not attached to the <b>ljeqozrv / production</b> "
         "dataset. Contact the developer."),
        ("Scheduled publish did not happen",
         "Scheduling",
         "True scheduled publishing requires a plugin that is not "
         "currently installed. The <b>publishedAt</b> field only "
         "controls display timestamp, not visibility."),
    ], col1="SYMPTOM", col2="CATEGORY",
       widths=[4.8 * cm, 2.6 * cm,
               PAGE_W - MARGIN_L - MARGIN_R - 7.4 * cm]))

    s.append(PageBreak())

    # ======================================================================
    # 13 · WHEN TO CONTACT DEVELOPER
    # ======================================================================
    s.append(p("THIRTEEN  ·  ESCALATION", OVERLINE))
    s.append(p("When to contact the developer.", H1))
    s.append(p(
        "A short checklist of tasks that require schema or code changes "
        "and cannot be solved in the Studio alone.",
        LEAD,
    ))

    s.append(p("Developer is required for", H2))
    s.append(bullets([
        "Adding a new field to Article, Area Guide, or Page. Field "
        "definitions live in <b>sanity/schemas/*.ts</b> — changes need "
        "a schema deploy and often a corresponding Next.js render "
        "update.",
        "Adding a new document type. Requires a new schema file, "
        "registration in <b>sanity/schemas/index.ts</b>, and most "
        "likely a new Next.js route.",
        "Converting <b>array of string</b> tag fields to reference-"
        "based taxonomy. Removes the typo trap (see Chapter 10) but "
        "is a schema migration.",
        "Changing a slug after publish when the document already has "
        "inbound links — the developer needs to add a Next.js "
        "redirect first.",
        "Enabling real scheduled publishing (plugin install + query "
        "changes).",
        "Custom Studio plugins (image editors, preview panes, custom "
        "input components).",
        "Webhook not firing — visible as publish-but-no-revalidation "
        "on Area Guide or Page. The developer checks Vercel logs on "
        "the <b>/api/revalidate</b> route and the Sanity webhook "
        "config.",
        "Secret / token rotation (Sanity tokens, "
        "<b>SANITY_WEBHOOK_SECRET</b>, Supabase service role key).",
        "Any 500 error visible on the live site after a publish.",
    ]))

    s.append(p("You do not need the developer for", H2))
    s.append(bullets([
        "Writing, editing, publishing, unpublishing any document of "
        "the three existing types.",
        "Uploading, replacing, or reusing images.",
        "Adjusting hotspot, crop, or alt text.",
        "Reordering items in an array (e.g. the Area Guide image "
        "gallery).",
        "Restoring a previous version from history.",
        "Changing tag values — though follow Chapter 10's guidance on "
        "maintaining a shared tag list."
    ]))

    s.append(ma_zone(16))

    s.append(divider())
    s.append(ma_zone(8))
    s.append(p("COLOPHON", OVERLINE))
    s.append(p(
        "This document is a technical reference for the Japanoma Sanity "
        "Studio. It covers exclusively the mechanics of editing — "
        "logging in, fields, publishing, images, tags, and "
        "troubleshooting. It is deliberately silent on editorial voice, "
        "tone, and copy guidelines — those belong in a separate "
        "document owned by the content team. Version 1.0 documents the "
        "schema as of the latest commit in <b>sanity/schemas/</b>: "
        "Article (9 fields), Area Guide (9 fields), Page (3 fields). "
        "When the schema changes, regenerate this document via "
        "<b>scripts/generate-sanity-editor-handbook.py</b>.",
        CAPTION,
    ))
    s.append(p("— End of reference —", ParagraphStyle(
        "End", fontName=SERIF_IT, fontSize=10, textColor=STONE,
        alignment=TA_CENTER, spaceBefore=20,
    )))

    doc.build(s)


if __name__ == "__main__":
    build(OUTPUT_PATH)
    print(f"Wrote {OUTPUT_PATH}")
