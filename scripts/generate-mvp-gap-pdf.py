#!/usr/bin/env python3
"""Generate MVP Gap Analysis PDF for Japanoma."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Colors from Ma Space v4
SUMI = HexColor('#1A1816')
SUMI_LIGHT = HexColor('#3D3833')
STONE = HexColor('#8A8279')
ASH = HexColor('#C4BDB4')
WASHI = HexColor('#F5F0E8')
SHOJI = HexColor('#FAFAF7')
SUGI = HexColor('#9B7B4F')
SUGI_DEEP = HexColor('#7A5F3A')
BORDER = HexColor('#E5E0D8')
MATSU = HexColor('#4A6B52')
BENI = HexColor('#8B3A3A')
KINU = HexColor('#FFFFFF')

OUTPUT_PDF = '/Users/craefto/Desktop/Japanoma-MVP-Gap-Analysis.pdf'
OUTPUT_JPG = '/Users/craefto/Desktop/Japanoma-MVP-Gap-Analysis.jpg'

# Try to register fonts
try:
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    FONT = 'Satoshi'
except:
    FONT = 'Helvetica'

FONT_BOLD = FONT  # Variable font, use bold via style

# Styles
style_title = ParagraphStyle(
    'Title', fontName=FONT, fontSize=24, textColor=SUMI,
    spaceAfter=4*mm, leading=30
)
style_subtitle = ParagraphStyle(
    'Subtitle', fontName=FONT, fontSize=10, textColor=STONE,
    spaceAfter=12*mm, leading=14
)
style_section = ParagraphStyle(
    'Section', fontName=FONT, fontSize=14, textColor=SUMI,
    spaceBefore=8*mm, spaceAfter=6*mm, leading=20
)
style_body = ParagraphStyle(
    'Body', fontName=FONT, fontSize=9, textColor=SUMI_LIGHT,
    leading=14
)
style_footer = ParagraphStyle(
    'Footer', fontName=FONT, fontSize=7, textColor=STONE,
    alignment=TA_CENTER
)
style_table_header = ParagraphStyle(
    'TableHeader', fontName=FONT, fontSize=8, textColor=KINU,
    leading=12
)
style_table_cell = ParagraphStyle(
    'TableCell', fontName=FONT, fontSize=8, textColor=SUMI_LIGHT,
    leading=12
)
style_table_cell_bold = ParagraphStyle(
    'TableCellBold', fontName=FONT, fontSize=8, textColor=SUMI,
    leading=12
)

def make_header_cell(text):
    return Paragraph(f'<b>{text}</b>', style_table_header)

def make_cell(text, bold=False):
    return Paragraph(text, style_table_cell_bold if bold else style_table_cell)

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=25*mm, bottomMargin=20*mm
    )

    story = []
    page_width = A4[0] - 40*mm

    # ── Header ──
    story.append(Spacer(1, 10*mm))

    overline = ParagraphStyle('Overline', fontName=FONT, fontSize=8, textColor=SUGI,
                              spaceAfter=3*mm, leading=10, tracking=2)
    story.append(Paragraph('JAPANOMA', overline))
    story.append(Paragraph('MVP Gap Analysis', style_title))
    story.append(Paragraph('Our MVP scope vs Client Project Charter  |  2026-03-21', style_subtitle))

    # ── TABLE 1: Our MVP features NOT in Charter ──
    story.append(Paragraph('1. Features in Our MVP Not in Client Charter', style_section))
    story.append(Paragraph(
        'These are features we have defined and scoped in our v1 MVP that the client\'s '
        'project charter document does not mention. They represent significant added value.',
        style_body
    ))
    story.append(Spacer(1, 4*mm))

    t1_data = [
        [make_header_cell('#'), make_header_cell('Our MVP Feature'), make_header_cell('Charter Equivalent')],
        [make_cell('1'), make_cell('Content hub + CMS (Sanity, pagination, filtering, taxonomy nav)', bold=True), make_cell('No mention')],
        [make_cell('2'), make_cell('Area pages with real data (86 cities, access info, local areas)', bold=True), make_cell('No mention')],
        [make_cell('3'), make_cell('Compare page (side-by-side, 3 items, sticky tray)', bold=True), make_cell('No mention')],
        [make_cell('4'), make_cell('Save / bookmark system (anonymous + authenticated, migration)', bold=True), make_cell('No mention')],
        [make_cell('5'), make_cell('SEO structured data (JSON-LD, Open Graph, dynamic sitemap)', bold=True), make_cell('No mention')],
        [make_cell('6'), make_cell('Anonymous sessions (tracking before auth)', bold=True), make_cell('No mention')],
        [make_cell('7'), make_cell('Full auth system (registration, login, reset, deletion)', bold=True), make_cell('Charter says "secure database" only')],
        [make_cell('8'), make_cell('Basic admin view (leads, quiz results, area popularity)', bold=True), make_cell('No mention')],
        [make_cell('9'), make_cell('Contact form with auto-population from quiz / area context', bold=True), make_cell('No mention')],
    ]

    t1 = Table(t1_data, colWidths=[8*mm, page_width*0.58, page_width*0.35 - 8*mm])
    t1.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), SUMI),
        ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        # Alternating rows
        *[('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(1, len(t1_data))],
        # Grid
        ('LINEBELOW', (0, 0), (-1, 0), 1, SUMI),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, BORDER),
        ('LINEAFTER', (0, 0), (-2, -1), 0.25, BORDER),
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t1)

    story.append(Spacer(1, 12*mm))

    # ── TABLE 2: Charter features IN our MVP ──
    story.append(Paragraph('2. Charter Features Covered by Our MVP', style_section))
    story.append(Paragraph(
        'These client charter requirements are fully addressed (and expanded) in our MVP scope.',
        style_body
    ))
    story.append(Spacer(1, 4*mm))

    t2_data = [
        [make_header_cell('Charter Feature'), make_header_cell('Our MVP Coverage')],
        [make_cell('Quick survey', bold=True), make_cell('Lifestyle Quiz — expanded to multi-step flow covering area fit, use case, budget, and design style preference')],
        [make_cell('Post-survey', bold=True), make_cell('Post-survey — incentivized survey after lead handoff to JP agents for transaction tracking and CX insights')],
        [make_cell('Secure customer database', bold=True), make_cell('Supabase PostgreSQL (Sydney) + NextAuth v5 + Row Level Security. Exceeds charter scope significantly')],
    ]

    t2 = Table(t2_data, colWidths=[page_width*0.30, page_width*0.70])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUGI_DEEP),
        ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        *[('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(1, len(t2_data))],
        ('LINEBELOW', (0, 0), (-1, 0), 1, SUGI_DEEP),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, BORDER),
        ('LINEAFTER', (0, 0), (0, -1), 0.25, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t2)

    story.append(Spacer(1, 12*mm))

    # ── TABLE 3: Charter features NOT in our MVP ──
    story.append(Paragraph('3. Charter Features Deferred from MVP', style_section))
    story.append(Paragraph(
        'These charter items are marked "Will-Have" by the client and are intentionally '
        'deferred from v1. They align with the client\'s own prioritization.',
        style_body
    ))
    story.append(Spacer(1, 4*mm))

    t3_data = [
        [make_header_cell('Charter Feature'), make_header_cell('Our Position')],
        [make_cell('Premium services / paywall', bold=True), make_cell('Deferred — no content to gate yet. Architecture supports future addition')],
        [make_cell('AI requirement parser', bold=True), make_cell('Deferred — "Will-Have" in charter. Natural language to checklist conversion')],
        [make_cell('Community feature', bold=True), make_cell('Deferred — "Will-Have" in charter. Buyer matching, partner directory, referral fees')],
        [make_cell('Nitori virtual staging link', bold=True), make_cell('Deferred — "Will-Have" in charter. External integration to nitori-net.jp')],
    ]

    t3 = Table(t3_data, colWidths=[page_width*0.30, page_width*0.70])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), STONE),
        ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        *[('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(1, len(t3_data))],
        ('LINEBELOW', (0, 0), (-1, 0), 1, STONE),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, BORDER),
        ('LINEAFTER', (0, 0), (0, -1), 0.25, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t3)

    # Footer
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph(
        'Japanoma  ·  Craefto  ·  Confidential  ·  2026-03-21',
        style_footer
    ))

    doc.build(story)
    print(f'PDF saved: {OUTPUT_PDF}')

def pdf_to_jpg():
    """Convert PDF to high-quality JPG."""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(OUTPUT_PDF, dpi=300)
        if images:
            images[0].save(OUTPUT_JPG, 'JPEG', quality=95)
            print(f'JPG saved: {OUTPUT_JPG}')
    except ImportError:
        # Fallback: use sips on macOS
        import subprocess
        subprocess.run([
            'sips', '-s', 'format', 'jpeg',
            '-s', 'formatOptions', '95',
            '--resampleWidth', '2480',
            OUTPUT_PDF, '--out', OUTPUT_JPG
        ], capture_output=True)
        print(f'JPG saved: {OUTPUT_JPG}')

if __name__ == '__main__':
    build_pdf()
    pdf_to_jpg()
