#!/usr/bin/env python3
"""
Japanoma — Lead Capture Flow Diagrams.

A 4-page visual companion to the Lead Capture Flow client doc. Shows:
  Page 1 — cover with the three-diagram index
  Page 2 — user journey flowchart
  Page 3 — data model (ER diagram)
  Page 4 — lead status state machine

Source diagrams are Mermaid files in wireframes/diagrams/ rendered to PNG
via `mmdc`. This script wraps them with Ma Space v4 chrome and a brief
explanation for each.

Output: docs/Japanoma-Lead-Capture-Flow-Diagrams.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------------------
# Ma Space v4 tokens
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
AI = HexColor("#3D5A7A")

PORTRAIT = A4
LANDSCAPE = landscape(A4)
PORTRAIT_W, PORTRAIT_H = PORTRAIT
LANDSCAPE_W, LANDSCAPE_H = LANDSCAPE

MARGIN_L = 1.8 * cm
MARGIN_R = 1.8 * cm
MARGIN_T = 2.0 * cm
MARGIN_B = 2.0 * cm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIAGRAMS_DIR = PROJECT_ROOT / "wireframes" / "diagrams"
OUTPUT_PATH = PROJECT_ROOT / "docs" / "Japanoma-Lead-Capture-Flow-Diagrams.pdf"
TOTAL_PAGES = 4

DIAGRAM_JOURNEY = DIAGRAMS_DIR / "07-lead-capture-journey.png"
DIAGRAM_DATA_MODEL = DIAGRAMS_DIR / "08-lead-capture-data-model.png"
DIAGRAM_STATE_MACHINE = DIAGRAMS_DIR / "09-lead-capture-state-machine.png"

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
# Paragraph styles
# ---------------------------------------------------------------------------

TITLE = ParagraphStyle(
    "Title", fontName=SERIF, fontSize=28, leading=32, textColor=SUMI,
    spaceAfter=6, alignment=TA_LEFT,
)
SUB = ParagraphStyle(
    "Sub", fontName=SERIF_IT, fontSize=12, leading=17, textColor=STONE,
    spaceAfter=14, alignment=TA_LEFT,
)
SECTION = ParagraphStyle(
    "Section", fontName=UI, fontSize=7.5, leading=11, textColor=SUGI,
    spaceBefore=12, spaceAfter=4, alignment=TA_LEFT,
)
H1 = ParagraphStyle(
    "H1", fontName=SERIF, fontSize=20, leading=26, textColor=SUMI,
    spaceBefore=2, spaceAfter=8, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    "Body", fontName=UI, fontSize=9, leading=14, textColor=SUMI_LIGHT,
    spaceAfter=6, alignment=TA_LEFT,
)
TINY = ParagraphStyle(
    "Tiny", fontName=UI, fontSize=7.5, leading=11, textColor=STONE,
    spaceAfter=3, alignment=TA_LEFT,
)
CAPTION = ParagraphStyle(
    "Caption", fontName=SERIF_IT, fontSize=9, leading=13, textColor=STONE,
    spaceAfter=6, alignment=TA_CENTER,
)


# ---------------------------------------------------------------------------
# Page chrome
# ---------------------------------------------------------------------------

def _hairline(c: Canvas, y: float, x1: float, x2: float,
              color=BORDER, width=0.3):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def make_chrome(page_w, page_h):
    """Return an onPage callback bound to a specific page size."""
    def every_page(c: Canvas, doc):
        c.saveState()

        # Overline top-left
        c.setFont(UI, 7)
        c.setFillColor(SUGI)
        c.drawString(
            MARGIN_L, page_h - 1.2 * cm,
            "JAPANOMA  ·  LEAD CAPTURE FLOW  ·  DIAGRAMS"
        )

        # Version top-right
        c.setFillColor(STONE)
        c.drawRightString(
            page_w - MARGIN_R, page_h - 1.2 * cm, "V1  ·  APRIL 2026"
        )
        _hairline(c, page_h - 1.4 * cm, MARGIN_L, page_w - MARGIN_R)

        # Footer
        _hairline(c, 1.4 * cm, MARGIN_L, page_w - MARGIN_R)
        c.setFont(UI, 7)
        c.setFillColor(STONE)
        c.drawString(MARGIN_L, 0.95 * cm, "For Kaz & Shiun  ·  Go&C Partners")
        c.setFillColor(SUMI)
        c.drawRightString(
            page_w - MARGIN_R, 0.95 * cm,
            f"{doc.page:02d} / {TOTAL_PAGES:02d}"
        )

        c.restoreState()

    return every_page


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def p(text, style=BODY):
    return Paragraph(text, style)


def callout(title, body_text, tone=SUGI, width=None):
    inner = [
        Paragraph(
            title.upper(),
            ParagraphStyle(
                "CT", fontName=UI, fontSize=7, textColor=tone, leading=11,
                spaceAfter=3
            ),
        ),
        Paragraph(
            body_text,
            ParagraphStyle(
                "CB", fontName=UI, fontSize=9, textColor=SUMI, leading=14
            ),
        ),
    ]
    if width is None:
        width = PORTRAIT_W - MARGIN_L - MARGIN_R
    t = Table([[inner]], colWidths=[width])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 1.5, tone),
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def scaled_image(image_path: Path, max_w: float, max_h: float) -> Image:
    """Load an image and scale it to fit max_w x max_h preserving aspect."""
    reader = ImageReader(str(image_path))
    iw, ih = reader.getSize()
    ratio_w = max_w / iw
    ratio_h = max_h / ih
    ratio = min(ratio_w, ratio_h)
    return Image(str(image_path), width=iw * ratio, height=ih * ratio)


def toc_row(num: str, title: str, description: str):
    """A single row in the cover page's table of contents."""
    num_cell = Paragraph(
        num,
        ParagraphStyle(
            "TOCN", fontName=SERIF, fontSize=26, textColor=SUGI,
            leading=30, alignment=TA_CENTER
        ),
    )
    text_cell = [
        Paragraph(
            title,
            ParagraphStyle(
                "TOCT", fontName=UI, fontSize=11, textColor=SUMI,
                leading=15, spaceAfter=3
            ),
        ),
        Paragraph(
            description,
            ParagraphStyle(
                "TOCD", fontName=UI, fontSize=9, textColor=SUMI_LIGHT,
                leading=13
            ),
        ),
    ]
    t = Table(
        [[num_cell, text_cell]],
        colWidths=[1.6 * cm, PORTRAIT_W - MARGIN_L - MARGIN_R - 1.6 * cm],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBELOW", (0, 0), (-1, -1), 0.2, BORDER),
    ]))
    return t


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

def build(output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)

    # Verify source diagrams exist
    for path in (DIAGRAM_JOURNEY, DIAGRAM_DATA_MODEL, DIAGRAM_STATE_MACHINE):
        if not path.exists():
            raise FileNotFoundError(
                f"Missing diagram PNG: {path}\n"
                f"Run: mmdc -i wireframes/diagrams/<name>.mmd -o "
                f"wireframes/diagrams/<name>.png"
            )

    doc = BaseDocTemplate(
        str(output),
        pagesize=PORTRAIT,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B,
        title="Japanoma — Lead Capture Flow Diagrams",
        author="Craefto for Go&C Partners",
        subject=(
            "Visual companion to the Lead Capture Flow client doc — "
            "user journey, data model, lead status state machine."
        ),
    )

    portrait_frame = Frame(
        MARGIN_L, MARGIN_B,
        PORTRAIT_W - MARGIN_L - MARGIN_R,
        PORTRAIT_H - MARGIN_T - MARGIN_B - 0.4 * cm,
        id="portrait",
    )
    landscape_frame = Frame(
        MARGIN_L, MARGIN_B,
        LANDSCAPE_W - MARGIN_L - MARGIN_R,
        LANDSCAPE_H - MARGIN_T - MARGIN_B - 0.4 * cm,
        id="landscape",
    )

    doc.addPageTemplates([
        PageTemplate(
            id="Portrait", pagesize=PORTRAIT,
            frames=[portrait_frame], onPage=make_chrome(PORTRAIT_W, PORTRAIT_H),
        ),
        PageTemplate(
            id="Landscape", pagesize=LANDSCAPE,
            frames=[landscape_frame], onPage=make_chrome(LANDSCAPE_W, LANDSCAPE_H),
        ),
    ])

    # Content width available inside the frames
    portrait_content_w = PORTRAIT_W - MARGIN_L - MARGIN_R
    portrait_content_h = PORTRAIT_H - MARGIN_T - MARGIN_B - 0.4 * cm
    landscape_content_w = LANDSCAPE_W - MARGIN_L - MARGIN_R
    landscape_content_h = LANDSCAPE_H - MARGIN_T - MARGIN_B - 0.4 * cm

    s = []

    # ======================================================================
    # PAGE 1 — COVER (portrait)
    # ======================================================================
    s.append(p("DIAGRAMS  ·  01", SECTION))
    s.append(p("Lead Capture Flow.", TITLE))
    s.append(p(
        "Three diagrams. What happens, what gets stored, and how leads move "
        "through their lifecycle.",
        SUB,
    ))

    s.append(Spacer(1, 0.5 * cm))

    s.append(p("THREE DIAGRAMS, THREE ANGLES", SECTION))
    s.append(Spacer(1, 0.2 * cm))

    s.append(toc_row(
        "01",
        "The buyer journey.",
        "From quiz completion to partner handoff, with every decision point "
        "and both withdraw paths. Shows how authenticated and anonymous users "
        "converge on the same lead-recording flow.",
    ))
    s.append(toc_row(
        "02",
        "The data model.",
        "Three new tables, their relationships, and which columns carry "
        "the legal audit weight. Shows the foreign-key chain that makes "
        "it impossible to have a lead without a matching consent record.",
    ))
    s.append(toc_row(
        "03",
        "The lead status state machine.",
        "Every state a lead can reach and who drives each transition. "
        "For MVP, only <i>new</i> and <i>withdrawn</i> are written by Japanoma; "
        "the other states arrive from Katitas via the v1.1 partner sync.",
    ))

    s.append(Spacer(1, 0.5 * cm))

    s.append(callout(
        "Read this alongside the text document",
        "These diagrams summarise what the full Lead Capture Flow document "
        "(<i>Japanoma-Lead-Capture-Flow.pdf</i>) describes in prose. Use them "
        "for reference when you want the shape of the system at a glance; "
        "use the text document when you want the rationale.",
        tone=SUGI,
        width=portrait_content_w,
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(p(
        "Rendered from Mermaid source files in "
        "<i>wireframes/diagrams/07–09-lead-capture-*.mmd</i>. Edit the "
        "source and re-run the generator to refresh.",
        TINY,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 2 — USER JOURNEY (portrait)
    # ======================================================================
    s.append(p("DIAGRAMS  ·  02", SECTION))
    s.append(p("The buyer journey.", H1))
    s.append(p(
        "Every step from clicking <i>Express interest</i> on the quiz "
        "results page to the brief landing in front of a Katitas contact. "
        "Diamonds are decision points; brown terminators mark the entry "
        "and exit of the flow; green boxes are confirmation states; the "
        "red dashed arrows show the two withdraw paths a buyer can take "
        "at any time.",
        BODY,
    ))

    # Allocate roughly 85% of remaining height to the image
    img_max_h = portrait_content_h - 5.5 * cm
    s.append(Spacer(1, 0.2 * cm))
    s.append(scaled_image(DIAGRAM_JOURNEY, portrait_content_w, img_max_h))
    s.append(Spacer(1, 0.2 * cm))
    s.append(p(
        "07-lead-capture-journey.mmd  ·  Mermaid flowchart",
        CAPTION,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 3 — DATA MODEL (portrait)
    # ======================================================================
    s.append(p("DIAGRAMS  ·  03", SECTION))
    s.append(p("The data model.", H1))
    s.append(p(
        "Three new tables on top of Supabase&rsquo;s managed <i>auth.users</i>. "
        "The single most important line is the one labelled <b>required by "
        "(FK NOT NULL)</b>: it&rsquo;s the database-level enforcement that "
        "prevents a lead from ever existing without a matching consent record. "
        "Denormalized columns in <i>consent_records</i> (the verbatim body "
        "and its hash) are the legal self-containment safeguard.",
        BODY,
    ))

    img_max_h = portrait_content_h - 6.0 * cm
    s.append(Spacer(1, 0.2 * cm))
    s.append(scaled_image(DIAGRAM_DATA_MODEL, portrait_content_w, img_max_h))
    s.append(Spacer(1, 0.2 * cm))
    s.append(p(
        "08-lead-capture-data-model.mmd  ·  Mermaid ER diagram",
        CAPTION,
    ))

    # Switch the next page to landscape for the wide state machine
    s.append(NextPageTemplate("Landscape"))
    s.append(PageBreak())

    # ======================================================================
    # PAGE 4 — LEAD STATUS STATE MACHINE (landscape)
    # ======================================================================
    s.append(p("DIAGRAMS  ·  04", SECTION))
    s.append(p("The lead status state machine.", H1))
    s.append(p(
        "A lead starts at <b>new</b> the moment it&rsquo;s created. At MVP, "
        "the only other state Japanoma writes is <b>withdrawn</b> — driven "
        "by the buyer clicking Withdraw. The intermediate states "
        "(<i>inquired, viewing, negotiating, contract, completed</i>) exist "
        "in the schema today so that the v1.1 Katitas partner sync can "
        "update them without a database migration.",
        BODY,
    ))

    img_max_h = landscape_content_h - 6.0 * cm
    s.append(Spacer(1, 0.2 * cm))
    s.append(scaled_image(
        DIAGRAM_STATE_MACHINE, landscape_content_w, img_max_h
    ))
    s.append(Spacer(1, 0.2 * cm))
    s.append(p(
        "09-lead-capture-state-machine.mmd  ·  Mermaid state diagram",
        CAPTION,
    ))

    # ----------------------------------------------------------------------
    doc.build(s)


if __name__ == "__main__":
    build(OUTPUT_PATH)
    print(f"Wrote: {OUTPUT_PATH}")
