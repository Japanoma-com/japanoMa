#!/usr/bin/env python3
"""
Japanoma — Lead Capture & Cross-Border Consent Flow.

A 6-page client-facing document for Kaz and Shiun at Go&C Partners.
Explains what the feature does, what the user journey looks like, what
the legal safeguards are, and what Go&C needs to do on their side.

No code, no SQL, no developer jargon. Plain English.

Output: docs/Japanoma-Lead-Capture-Flow.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------------------
# Ma Space v4 — design tokens
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
MARGIN_L = 1.8 * cm
MARGIN_R = 1.8 * cm
MARGIN_T = 2.0 * cm
MARGIN_B = 2.0 * cm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = PROJECT_ROOT / "docs" / "Japanoma-Lead-Capture-Flow.pdf"
TOTAL_PAGES = 9

# ---------------------------------------------------------------------------
# Fonts — Satoshi for UI, Times for serif
# ---------------------------------------------------------------------------

SATOSHI_PATH = PROJECT_ROOT / "src" / "fonts" / "Satoshi-Variable.ttf"
try:
    pdfmetrics.registerFont(TTFont("Satoshi", str(SATOSHI_PATH)))
    UI = "Satoshi"
except Exception:
    UI = "Helvetica"

SERIF = "Times-Roman"
SERIF_IT = "Times-Italic"
SERIF_B = "Times-Bold"

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
    spaceBefore=2, spaceAfter=10, alignment=TA_LEFT,
)
H2 = ParagraphStyle(
    "H2", fontName=SERIF, fontSize=15, leading=20, textColor=SUMI,
    spaceBefore=6, spaceAfter=6, alignment=TA_LEFT,
)
H3 = ParagraphStyle(
    "H3", fontName=UI, fontSize=9.5, leading=13, textColor=SUMI,
    spaceBefore=4, spaceAfter=3, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    "Body", fontName=UI, fontSize=9, leading=14, textColor=SUMI_LIGHT,
    spaceAfter=6, alignment=TA_LEFT,
)
BODY_LEAD = ParagraphStyle(
    "BodyLead", fontName=UI, fontSize=10.5, leading=16.5, textColor=SUMI_LIGHT,
    spaceAfter=8, alignment=TA_LEFT,
)
TINY = ParagraphStyle(
    "Tiny", fontName=UI, fontSize=7.5, leading=11, textColor=STONE,
    spaceAfter=3, alignment=TA_LEFT,
)
BULLET = ParagraphStyle(
    "Bullet", parent=BODY, leftIndent=12, bulletIndent=0, spaceAfter=3,
)
LEGAL_TEXT = ParagraphStyle(
    "LegalText", fontName=SERIF_IT, fontSize=10, leading=15,
    textColor=SUMI_LIGHT, spaceAfter=9, alignment=TA_LEFT,
    leftIndent=14, rightIndent=14,
)
STEP_NUM = ParagraphStyle(
    "StepNum", fontName=SERIF, fontSize=22, leading=22, textColor=SUGI,
    alignment=TA_CENTER,
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
    c.drawString(
        MARGIN_L, PAGE_H - 1.2 * cm,
        "JAPANOMA  ·  LEAD CAPTURE FLOW"
    )

    # Version top-right
    c.setFillColor(STONE)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.2 * cm, "V1  ·  APRIL 2026")
    _hairline(c, PAGE_H - 1.4 * cm)

    # Footer
    _hairline(c, 1.4 * cm)
    c.setFont(UI, 7)
    c.setFillColor(STONE)
    c.drawString(MARGIN_L, 0.95 * cm, "For Kaz & Shiun  ·  Go&C Partners")
    c.setFillColor(SUMI)
    c.drawRightString(
        PAGE_W - MARGIN_R, 0.95 * cm,
        f"{doc.page:02d} / {TOTAL_PAGES:02d}"
    )

    c.restoreState()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def p(text, style=BODY):
    return Paragraph(text, style)


def bullets(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=10, value="disc") for t in items],
        bulletType="bullet",
        start="disc",
        bulletFontName=UI,
        bulletFontSize=5.5,
        leftIndent=12,
        bulletColor=SUGI,
    )


def callout(title, body_text, tone=SUGI):
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
    t = Table([[inner]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 1.5, tone),
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def two_column(left_flowables, right_flowables, gap=0.8 * cm, split=0.5):
    total_w = PAGE_W - MARGIN_L - MARGIN_R - gap
    left_w = total_w * split
    right_w = total_w - left_w
    t = Table(
        [[left_flowables, right_flowables]],
        colWidths=[left_w, right_w],
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


def fact_row(items):
    """A horizontal row of pulled-out facts. items = list of (label, value)."""
    cells = []
    for label, value in items:
        cells.append([
            Paragraph(
                label.upper(),
                ParagraphStyle(
                    "FL", fontName=UI, fontSize=6.5, textColor=STONE,
                    leading=9, spaceAfter=3
                ),
            ),
            Paragraph(
                value,
                ParagraphStyle(
                    "FV", fontName=SERIF, fontSize=13, textColor=SUMI,
                    leading=17
                ),
            ),
        ])
    col_w = (PAGE_W - MARGIN_L - MARGIN_R) / len(items)
    t = Table([cells], colWidths=[col_w] * len(items))
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, SUMI),
        ("LINEBELOW", (0, 0), (-1, 0), 0.3, BORDER),
    ]))
    return t


def step_block(number, title, body_text):
    """A numbered step with a large serif number on the left."""
    num_cell = Paragraph(f"{number:02d}", STEP_NUM)
    text_cell = [
        Paragraph(
            title,
            ParagraphStyle(
                "SBT", fontName=UI, fontSize=10, textColor=SUMI,
                leading=14, spaceAfter=3
            ),
        ),
        Paragraph(
            body_text,
            ParagraphStyle(
                "SBB", fontName=UI, fontSize=8.5, textColor=SUMI_LIGHT,
                leading=12.5
            ),
        ),
    ]
    t = Table(
        [[num_cell, text_cell]],
        colWidths=[1.2 * cm, PAGE_W - MARGIN_L - MARGIN_R - 1.2 * cm],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (0, 0), "TOP"),
        ("VALIGN", (1, 0), (1, 0), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.2, BORDER),
    ]))
    return t


def data_table(rows, widths):
    """Field-style table with header row. rows = list of (col1, col2, col3...)."""
    header_style = ParagraphStyle(
        "DTH", fontName=UI, fontSize=6.5, textColor=STONE, leading=9
    )
    cell_style = ParagraphStyle(
        "DTC", fontName=UI, fontSize=8, textColor=SUMI_LIGHT, leading=12
    )
    name_style = ParagraphStyle(
        "DTN", fontName=UI, fontSize=8, textColor=SUMI, leading=12
    )
    data = [[Paragraph(h, header_style) for h in rows[0]]]
    for row in rows[1:]:
        data.append(
            [Paragraph(f"<b>{row[0]}</b>", name_style)]
            + [Paragraph(cell, cell_style) for cell in row[1:]]
        )
    t = Table(data, colWidths=widths, repeatRows=1)
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


def status_chain(states):
    """Render the lead status state machine as a horizontal chain.

    Uses asymmetric column widths: state cells are wide enough to fit
    the longest label without wrapping; arrow cells are narrow.
    """
    cells = []
    widths = []
    total_w = PAGE_W - MARGIN_L - MARGIN_R
    arrow_w = 0.5 * cm
    state_w = (total_w - arrow_w * (len(states) - 1)) / len(states)

    for i, state in enumerate(states):
        tone = SUGI if state not in ("withdrawn",) else STONE
        if state == "completed":
            tone = MATSU
        label = Paragraph(
            state.upper(),
            ParagraphStyle(
                "SC", fontName=UI, fontSize=7, textColor=tone, leading=10,
                alignment=TA_CENTER
            ),
        )
        cells.append(label)
        widths.append(state_w)
        if i < len(states) - 1:
            arrow = Paragraph(
                "&rarr;",
                ParagraphStyle(
                    "SCA", fontName=UI, fontSize=10, textColor=ASH,
                    alignment=TA_CENTER
                ),
            )
            cells.append(arrow)
            widths.append(arrow_w)

    t = Table([cells], colWidths=widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


# ---------------------------------------------------------------------------
# Document builder
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
        title="Japanoma — Lead Capture & Cross-Border Consent Flow",
        author="Craefto for Go&C Partners",
        subject=(
            "Client-facing explanation of how Japanoma captures buyer interest, "
            "handles cross-border consent, and hands leads to Japanese partners."
        ),
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
    # PAGE 1 — COVER / SUMMARY
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  01", SECTION))
    s.append(p("How Australian buyers tell us they&rsquo;re interested.", TITLE))
    s.append(p(
        "And how we protect their data, your brand, and your Japanese "
        "partners in the process.",
        SUB,
    ))

    s.append(p(
        "Japanoma is the decision-aid site that helps Australian ski-lovers "
        "work out whether to buy a home base in Northern Japan snow country. "
        "Once a buyer has done the quiz, read the area guides, and decided "
        "they&rsquo;re serious, the <b>lead capture flow</b> is the bridge "
        "between the website and a real conversation with a Japanese partner.",
        BODY_LEAD,
    ))

    s.append(p(
        "This document explains, in plain language: what the buyer sees, "
        "what we record, what the legal safeguards are, and what you need "
        "to do on your side to make it work.",
        BODY_LEAD,
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(fact_row([
        ("WHO IT'S FOR", "Signed-up<br/>quiz completers"),
        ("WHAT IT CAPTURES", "Per-area interest<br/>+ explicit consent"),
        ("HANDOFF", "Go&amp;C within<br/>48 hours"),
    ]))

    s.append(fact_row([
        ("LEGAL FRAME", "Australian<br/>Privacy Act + APPI"),
        ("DATA RESIDENCY", "Sydney<br/>(ap-southeast-2)"),
        ("STATUS", "Built, tested,<br/>awaiting text sign-off"),
    ]))

    s.append(Spacer(1, 0.4 * cm))

    s.append(callout(
        "Why this document exists",
        "Kaz asked for a feature that lets buyers express interest in a specific "
        "area and connects them to the Japanese partner network (primarily Katitas). "
        "The feature is built and tested. Before it goes live we need two "
        "things from you: (1) confirmation that the consent text on page 3 is "
        "the final wording from your lawyer, and (2) agreement on who inside "
        "Go&amp;C Partners owns the 48-hour handoff.",
        tone=SUGI,
    ))

    s.append(Spacer(1, 0.4 * cm))

    s.append(p("WHAT&rsquo;S ON THE FOLLOWING PAGES", SECTION))
    s.append(bullets([
        "<b>The buyer journey.</b> Every step from clicking Express "
        "interest to the brief landing with Katitas.",
        "<b>The exact legal text.</b> The curated v1 placeholder "
        "(7 paragraphs), pending Kaz&rsquo;s lawyer review.",
        "<b>What we record.</b> Every field on every consent record "
        "and every lead, with a plain-English gloss.",
        "<b>Safeguards.</b> The seven legal and technical defences "
        "built into the system.",
        "<b>What Go&amp;C does.</b> The manual v1 workflow for MVP, "
        "and the v1.1 Katitas sync planned for Q3 2026.",
    ]))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 2 — THE USER JOURNEY
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  02", SECTION))
    s.append(p("The buyer journey.", H1))
    s.append(p(
        "Eight steps from first click to handoff. No step requires a phone "
        "call, a form letter, or a sales follow-up until Go&amp;C chooses "
        "to reach out.",
        BODY_LEAD,
    ))

    s.append(Spacer(1, 0.2 * cm))

    s.append(step_block(
        1,
        "Buyer takes the quiz.",
        "They arrive on Japanoma, complete the 5-minute lifestyle quiz, "
        "and land on the results page. Three to five Japanese ski regions "
        "are ranked by fit score based on their answers.",
    ))

    s.append(step_block(
        2,
        "Buyer clicks &ldquo;Express interest&rdquo; on a recommended area.",
        "The button sits alongside &ldquo;Explore Area&rdquo; and &ldquo;Ask a question&rdquo; on "
        "each recommended-area card. It&rsquo;s the primary (filled) button — "
        "it&rsquo;s what we want them to do.",
    ))

    s.append(step_block(
        3,
        "If they&rsquo;re not signed in, we send them through signup.",
        "Anonymous users are redirected to /signup with a memory of the "
        "area they were interested in. Once they sign up and verify their "
        "email, they land on their account page with that specific area "
        "still selected.",
    ))

    s.append(step_block(
        4,
        "Their account page shows their recommended areas as cards.",
        "Each card shows the fit score, a short explanation, and an "
        "&ldquo;Express interest&rdquo; button. If they already expressed interest "
        "in an area, the card instead says &ldquo;Interest recorded — we&rsquo;ll "
        "be in touch.&rdquo; with a subtle withdraw link.",
    ))

    s.append(step_block(
        5,
        "First-time click: they read and agree to the consent modal.",
        "A modal opens with the verbatim cross-border consent text "
        "(see page 3). A checkbox. A Consent &amp; Submit button. The "
        "button stays disabled until the checkbox is ticked. No tricks, "
        "no dark patterns.",
    ))

    s.append(step_block(
        6,
        "Second-time click: no modal. One-click interest.",
        "Once a user has consented once, they don&rsquo;t re-read the same "
        "text every time. They click &ldquo;Express interest&rdquo; on a second "
        "area and the lead is recorded immediately, bound to the same "
        "consent record. One click.",
    ))

    s.append(step_block(
        7,
        "Go&amp;C Partners sees the lead, introduces them within 48 hours.",
        "The new lead appears in the Supabase dashboard with the buyer&rsquo;s "
        "name, email, quiz profile snapshot, and area of interest. Go&amp;C "
        "emails the buyer personally and, in parallel, passes the brief to "
        "Katitas or the appropriate local partner.",
    ))

    s.append(step_block(
        8,
        "Buyer can withdraw at any time.",
        "Per-area: a small &ldquo;Withdraw&rdquo; link on each active card. "
        "Nuclear: a &ldquo;Withdraw all cross-border consent&rdquo; link under the "
        "Session heading. Both are honoured immediately — withdrawn records "
        "are marked, never deleted, so the audit trail survives.",
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 3 — THE CONSENT TEXT
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  03", SECTION))
    s.append(p("The exact text buyers read.", H1))
    s.append(p(
        "This is the verbatim text that appears in the consent modal. "
        "It&rsquo;s stored in the database as &ldquo;version v1,&rdquo; a "
        "<b>curated placeholder</b> that combines Kaz&rsquo;s original "
        "cross-border-sharing paragraphs (1&ndash;3) with four additional "
        "protective paragraphs (4&ndash;7) drawn from standard Australian "
        "Consumer Law safeguards. If your lawyer revises it, we ship the "
        "revision as the new v1 (no records consented to this version yet) "
        "or, after launch, as v2 &mdash; without touching code and without "
        "invalidating any existing records.",
        BODY,
    ))

    s.append(Spacer(1, 0.2 * cm))
    _hairline_sep = Table(
        [[""]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R],
        style=TableStyle([("LINEABOVE", (0, 0), (-1, 0), 0.5, SUMI)]),
    )
    s.append(_hairline_sep)
    s.append(Spacer(1, 0.3 * cm))

    s.append(p("CONSENT TEXT  ·  VERSION V1  ·  CURATED PLACEHOLDER", SECTION))

    s.append(p(
        "I consent to Go&amp;C Partners Pty Ltd collecting and using my "
        "personal information for the purpose of supporting my search for "
        "property in Japan, and disclosing my personal information to "
        "selected real estate businesses and related service providers in "
        "Japan.",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I also consent to those Japanese businesses sharing back with "
        "Go&amp;C Partners Pty Ltd my inquiry status, viewing status, "
        "negotiation status, contract status, and whether my transaction "
        "completed, for service operation, lead attribution, billing "
        "verification, analytics, and service improvement purposes.",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I understand that my personal information may be disclosed to "
        "recipients located in Japan, and that the data protection laws "
        "in Japan may differ from those in Australia. This cross-border "
        "disclosure is made under the Australian Privacy Principles "
        "(APP 8) and Japan&rsquo;s Act on the Protection of Personal "
        "Information (APPI).",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I understand that Japanoma is an information-only decision-aid "
        "platform. Go&amp;C Partners Pty Ltd is not a licensed real "
        "estate agent in Japan, is not a financial advisor, and is not a "
        "legal advisor. Japanoma does not verify, warrant, or guarantee "
        "the accuracy, completeness, or fitness-for-purpose of any "
        "property listing, area information, cost model, or other content "
        "on the site. All content is provided for decision-support "
        "purposes only.",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I acknowledge that before entering into any property transaction "
        "in Japan I am strictly advised to engage an independent licensed "
        "Judicial Scrivener (<i>Shiho-shoshi</i>) to verify title; "
        "conduct an independent building inspection (<i>Kenzai</i>) before "
        "signing a contract; and consult an Australian tax professional "
        "about foreign asset ownership. By proceeding, I confirm that I am "
        "not relying on Go&amp;C Partners Pty Ltd or any Japanese partner "
        "introduced through Japanoma for professional legal, financial, "
        "or tax advice.",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I understand that my use of the Japanoma website, and any dispute "
        "arising from the information or services provided by Go&amp;C "
        "Partners Pty Ltd, is governed by the laws of New South Wales, "
        "Australia. The physical purchase and transfer of property in "
        "Japan is governed exclusively by the laws of Japan and the "
        "jurisdiction of Japanese courts.",
        LEGAL_TEXT,
    ))

    s.append(p(
        "I understand that I may withdraw this consent at any time using "
        "the Withdraw controls in my Japanoma account. Withdrawal will "
        "revoke my active expressions of interest but will not delete the "
        "record of this consent, which is retained as a legal audit trail.",
        LEGAL_TEXT,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 4 — CONSENT TEXT (continued) — plain-language + Kaz ask
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  03  (CONTINUED)", SECTION))
    s.append(p("What the buyer is agreeing to, in plain language.", H1))
    s.append(p(
        "The seven paragraphs on the previous page are the legally "
        "operative text. Here&rsquo;s the same content in the voice you&rsquo;d "
        "use to explain it to a friend.",
        BODY,
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(p("IN PLAIN LANGUAGE, THE BUYER IS AGREEING TO&hellip;", SECTION))
    s.append(bullets([
        "Go&amp;C Partners collecting and using their details to help "
        "them find a Japanese property, and sharing those details with a "
        "Japanese real estate business (Katitas, for now) and related "
        "service providers.",
        "The Japanese business sharing updates <i>back</i> about the "
        "inquiry &mdash; whether it progressed, what stage it&rsquo;s at, "
        "whether it completed &mdash; so Go&amp;C can track the journey.",
        "Their personal data leaving Australia and reaching a recipient "
        "in Japan (under APP 8 and APPI).",
        "Japanoma being an <b>information-only decision-aid</b> &mdash; "
        "not a licensed agent, not a financial advisor, not a legal "
        "advisor. Nothing on the site is verified or warranted.",
        "Getting their own independent legal (Shiho-shoshi), building "
        "(Kenzai) and tax advice before signing anything. They are <i>not</i> "
        "relying on Go&amp;C or any Japanese partner for professional advice.",
        "New South Wales law governing the website and their dealings with "
        "Go&amp;C; Japanese law and courts governing the actual property "
        "transaction.",
        "Being able to withdraw consent at any time, with the audit record "
        "preserved for legal purposes.",
    ]))

    s.append(Spacer(1, 0.3 * cm))

    s.append(callout(
        "What we need from Kaz",
        "Paragraphs 1&ndash;3 are the wording Kaz originally provided. "
        "Paragraphs 4&ndash;7 were curated by Craefto on 2026-04-09, drawing "
        "on the Domain &amp; AkiyaHub T&amp;Cs reference doc (ACL / "
        "Section 18 &ldquo;Misleading or Deceptive Conduct&rdquo; protections "
        "for Australian-targeted Japan-property platforms). <b>This is "
        "placeholder text until Kaz&rsquo;s lawyer reviews and signs off.</b> "
        "If the lawyer revises it, we update the seed in a single step and "
        "relaunch as v1 &mdash; no migration, no deployment. Until confirmed "
        "final, the feature should not be flipped live to production traffic.",
        tone=BENI,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 4 — WHAT WE RECORD (AND WHAT WE DON'T)
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  04", SECTION))
    s.append(p("What we record.", H1))
    s.append(p(
        "Two records are created the first time a buyer expresses interest: "
        "a <b>consent record</b> (the legal audit trail) and a <b>lead</b> "
        "(the commercial record). Subsequent interests create new leads "
        "bound to the same consent.",
        BODY_LEAD,
    ))

    s.append(Spacer(1, 0.2 * cm))

    s.append(p("PER CONSENT RECORD", SECTION))
    s.append(data_table(
        [
            ("FIELD", "WHAT IT IS"),
            (
                "Who",
                "The buyer&rsquo;s account ID. Not their name or email — "
                "those live in the account record that this links to.",
            ),
            (
                "When",
                "Exact timestamp of the click, to the second.",
            ),
            (
                "What text",
                "The verbatim body of the consent they saw, stored "
                "in the record itself. If we ever lose the versions "
                "table, each record still carries its own copy.",
            ),
            (
                "Version pointer",
                "The version tag (v1, v2, &hellip;) so we know which "
                "version of the text they agreed to.",
            ),
            (
                "Integrity hash",
                "A SHA-256 cryptographic fingerprint of the text. "
                "If anyone ever edits the stored copy, the hash stops "
                "matching and we detect it.",
            ),
            (
                "Where from",
                "A salted hash of their IP address — <b>not</b> the raw "
                "IP — plus the browser user-agent string. Enough to "
                "verify against replay, not enough to profile them.",
            ),
            (
                "Scope",
                "The specific purpose they consented to. For MVP, "
                "&ldquo;japanese_partner_lead_sharing.&rdquo;",
            ),
            (
                "Withdrawal",
                "If the buyer withdraws, we record the withdrawal "
                "time. The row itself is never deleted.",
            ),
        ],
        widths=[3.5 * cm, PAGE_W - MARGIN_L - MARGIN_R - 3.5 * cm],
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 5 — WHAT WE RECORD (continued) — LEADS + STATUS + NEVER-STORE
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  04  (CONTINUED)", SECTION))
    s.append(p("What we record, continued.", H1))
    s.append(p(
        "A lead is the commercial record that Go&amp;C acts on. Each lead "
        "is tied to a consent record via a database-enforced foreign key — "
        "no lead can exist without a matching consent.",
        BODY_LEAD,
    ))

    s.append(Spacer(1, 0.2 * cm))

    s.append(p("PER LEAD", SECTION))
    s.append(data_table(
        [
            ("FIELD", "WHAT IT IS"),
            ("Who", "The buyer&rsquo;s account ID."),
            (
                "Area",
                "The city slug they expressed interest in "
                "(e.g., hakuba, nozawa-onsen) and its prefecture.",
            ),
            (
                "Profile snapshot",
                "A frozen copy of their quiz profile at the moment "
                "of interest: property types, condition, budget, fit "
                "score, summary. Frozen so Go&amp;C has the exact brief.",
            ),
            (
                "Status",
                "A state-machine field. See the chain at the bottom "
                "of this page.",
            ),
            (
                "Consent link",
                "A hard foreign key to the consent record above. "
                "No lead can exist without a consent. Enforced by the "
                "database, not by code.",
            ),
            (
                "Partner reference",
                "Left blank at MVP. Will be populated in v1.1 with "
                "Katitas&rsquo; internal reference number once the "
                "partner sync lands.",
            ),
        ],
        widths=[3.5 * cm, PAGE_W - MARGIN_L - MARGIN_R - 3.5 * cm],
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(p("THE LEAD STATUS CHAIN", SECTION))
    s.append(status_chain([
        "new", "inquired", "viewing", "negotiating", "contract", "completed",
    ]))
    s.append(p(
        "Every new lead starts at <b>new</b>. The intermediate states come "
        "from Katitas in v1.1 (via the partner sync). A buyer can move to "
        "<b>withdrawn</b> at any point via the withdraw controls.",
        TINY,
    ))

    s.append(Spacer(1, 0.2 * cm))
    s.append(callout(
        "What we never store",
        "Raw IP addresses. Credit card numbers. ID documents. Passport scans. "
        "Physical signatures. Phone numbers (unless the user volunteers one "
        "in a contact form, which is separate). The consent record exists "
        "to prove agreement — nothing more.",
        tone=MATSU,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 5 — LEGAL AND TECHNICAL SAFEGUARDS
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  05", SECTION))
    s.append(p("Safeguards.", H1))
    s.append(p(
        "Seven defences built into the system. Each one exists to protect "
        "a specific thing: the buyer, the business, the legal position, "
        "or the audit trail.",
        BODY_LEAD,
    ))

    s.append(Spacer(1, 0.2 * cm))

    s.append(p("1 · Versioned consent text", H3))
    s.append(p(
        "The text can be revised over time. Old versions are never deleted. "
        "Each buyer record points to the exact version they agreed to, so "
        "a regulator or lawyer can extract a complete, dated, verbatim "
        "record in one query.",
        BODY,
    ))

    s.append(p("2 · Denormalised verbatim snapshot", H3))
    s.append(p(
        "Each consent record stores its own copy of the text body — not "
        "just a pointer to a shared version row. Even if the versions "
        "table is accidentally dropped or edited, every individual record "
        "remains self-contained and legally defensible.",
        BODY,
    ))

    s.append(p("3 · Immutable audit trail", H3))
    s.append(p(
        "Consent records cannot be edited. The only allowed change is "
        "marking them withdrawn (which adds a timestamp; the original "
        "consent data is preserved).",
        BODY,
    ))

    s.append(p("4 · Atomic consent + lead creation", H3))
    s.append(p(
        "When a buyer expresses first interest, the consent record and "
        "the lead are created in a single database transaction. If "
        "either fails, both are rolled back. There are no orphan records, "
        "ever. You cannot have a lead without a consent, or a consent "
        "record created without its matching lead.",
        BODY,
    ))

    s.append(p("5 · Duplicate prevention at the database level", H3))
    s.append(p(
        "A buyer cannot accidentally create two active leads for the same "
        "area — the database rejects the second insert. They can, however, "
        "withdraw and re-express interest cleanly.",
        BODY,
    ))

    s.append(p("6 · Fail-closed IP hashing", H3))
    s.append(p(
        "The salt used to hash IPs is stored in a secure environment "
        "variable. If the salt is ever missing or misconfigured, the "
        "system refuses to write the consent record — it does not "
        "silently fall back to writing a weakened version.",
        BODY,
    ))

    s.append(p("7 · Row-level security", H3))
    s.append(p(
        "The database enforces that buyers can only read their own "
        "consent records and leads. Administrative access happens through "
        "controlled channels (the Supabase dashboard), not through the "
        "public application. A compromised buyer account cannot read "
        "another buyer&rsquo;s records.",
        BODY,
    ))

    s.append(Spacer(1, 0.2 * cm))
    s.append(callout(
        "Two withdraw controls, one simple rule",
        "Per-area withdraw cancels one lead. Nuclear withdraw cancels the "
        "consent record AND all active leads simultaneously. After a "
        "nuclear withdraw, the next click on any card re-opens the consent "
        "modal — the buyer has to re-consent from scratch.",
        tone=AI,
    ))

    s.append(PageBreak())

    # ======================================================================
    # PAGE 6 — WHAT GO&C DOES (v1 + v1.1)
    # ======================================================================
    s.append(p("LEAD CAPTURE FLOW  ·  06", SECTION))
    s.append(p("What Go&amp;C Partners does.", H1))
    s.append(p(
        "Today, and what changes in v1.1 when Katitas is fully wired in.",
        SUB,
    ))

    s.append(p("TODAY  ·  V1 (MVP LAUNCH)", SECTION))

    s.append(p(
        "<b>Manual triage, high-touch service.</b>",
        H3,
    ))
    s.append(p(
        "New leads appear in the Supabase dashboard in real time. Kaz or "
        "Shiun checks the dashboard (or sets a scheduled reminder), reviews "
        "the buyer&rsquo;s profile snapshot and area of interest, and "
        "personally emails the buyer within the 48-hour SLA.",
        BODY,
    ))
    s.append(p(
        "In parallel, Kaz forwards a brief to Katitas: buyer&rsquo;s name, "
        "area of interest, budget range, property type preferences, and "
        "the quiz summary. From there, Katitas handles viewings and "
        "negotiations in the normal way.",
        BODY,
    ))
    s.append(p(
        "Status updates come back to Go&amp;C via whatever channel Katitas "
        "uses today (email, phone, chat). Kaz manually updates the lead&rsquo;s "
        "status in the Supabase dashboard as the journey progresses. This "
        "is low-tech but completely controlled: every transition has a "
        "human checking it.",
        BODY,
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(p("V1.1  ·  Q3 2026 (PLANNED)", SECTION))
    s.append(bullets([
        "<b>Admin UI for lead triage.</b> Filter by area, status, date. "
        "Assign to Kaz or Shiun. Add internal notes. No more Supabase "
        "dashboard for day-to-day work.",
        "<b>Katitas webhook integration.</b> Status updates flow back "
        "automatically. The lead&rsquo;s status chain is maintained "
        "without manual intervention.",
        "<b>Partner reference linking.</b> Each lead gets a "
        "<i>katitas_reference</i> field populated from their internal "
        "system, so you can trace a Japanoma lead to a Katitas case ID "
        "for billing verification.",
        "<b>Listing-level lead capture.</b> Once Katitas starts feeding "
        "real listings into Japanoma, buyers can express interest in a "
        "specific property, not just an area. The existing schema already "
        "has a nullable listing FK ready for this.",
    ]))

    s.append(Spacer(1, 0.3 * cm))

    s.append(p("FOUR THINGS TO DO BEFORE LAUNCH", SECTION))
    s.append(p(
        "<b>1  ·  Confirm the consent text.</b>",
        H3,
    ))
    s.append(p(
        "Ask your lawyer whether the three paragraphs on page 3 are the "
        "final wording for MVP. If not, tell us the revised wording and "
        "we re-seed the database in a single step.",
        BODY,
    ))

    s.append(p(
        "<b>2  ·  Agree on the 48-hour SLA internally.</b>",
        H3,
    ))
    s.append(p(
        "Between Kaz and Shiun, decide who owns first-response, who owns "
        "backup when the primary is unavailable, and what happens on "
        "weekends. The SLA only means something if there&rsquo;s a human "
        "behind it.",
        BODY,
    ))

    s.append(p(
        "<b>3  ·  Tell Katitas leads are coming.</b>",
        H3,
    ))
    s.append(p(
        "A quick call or email to your Katitas contact. Explain the flow, "
        "the format of the brief you&rsquo;ll send, and how you&rsquo;d like "
        "status updates to come back. In v1.1 this becomes a webhook; for "
        "MVP it&rsquo;s still person-to-person.",
        BODY,
    ))

    s.append(p(
        "<b>4  ·  Decide on a &ldquo;no-go&rdquo; signal.</b>",
        H3,
    ))
    s.append(p(
        "If a buyer expresses interest in an area where Katitas has no "
        "current coverage, the triage person needs a clear response "
        "template. Worth drafting one short paragraph now so the first "
        "edge case doesn&rsquo;t stall.",
        BODY,
    ))

    s.append(Spacer(1, 0.3 * cm))

    s.append(callout(
        "One-line summary",
        "The feature is built, tested against the real database, and waiting "
        "on two human actions: Kaz confirming the consent text is lawyer-final, "
        "and Kaz + Shiun agreeing who&rsquo;s on first-response duty. Both "
        "are conversations, not code.",
        tone=SUGI,
    ))

    # ----------------------------------------------------------------------
    # Build the document
    # ----------------------------------------------------------------------
    doc.build(s)


if __name__ == "__main__":
    build(OUTPUT_PATH)
    print(f"Wrote: {OUTPUT_PATH}")
