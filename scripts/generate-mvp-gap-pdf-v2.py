#!/usr/bin/env python3
"""Generate single-page MVP Gap Analysis PDF with all 3 tables."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER

# Ma Space v4 colors
SUMI = HexColor('#1A1816')
SUMI_LIGHT = HexColor('#3D3833')
STONE = HexColor('#8A8279')
WASHI = HexColor('#F5F0E8')
SHOJI = HexColor('#FAFAF7')
SUGI = HexColor('#9B7B4F')
SUGI_DEEP = HexColor('#7A5F3A')
BORDER = HexColor('#E5E0D8')
KINU = HexColor('#FFFFFF')

OUTPUT_PDF = '/Users/craefto/Desktop/Japanoma-MVP-Gap-Analysis.pdf'

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    FONT = 'Satoshi'
except:
    FONT = 'Helvetica'

# Compact styles
s_overline = ParagraphStyle('Overline', fontName=FONT, fontSize=6.5, textColor=SUGI, leading=8, spaceAfter=1.5*mm)
s_title = ParagraphStyle('Title', fontName=FONT, fontSize=18, textColor=SUMI, spaceAfter=1.5*mm, leading=22)
s_subtitle = ParagraphStyle('Subtitle', fontName=FONT, fontSize=7.5, textColor=STONE, spaceAfter=6*mm, leading=10)
s_section = ParagraphStyle('Section', fontName=FONT, fontSize=10, textColor=SUMI, spaceBefore=5*mm, spaceAfter=2*mm, leading=13)
s_body = ParagraphStyle('Body', fontName=FONT, fontSize=7, textColor=SUMI_LIGHT, leading=10, spaceAfter=2*mm)
s_th = ParagraphStyle('TH', fontName=FONT, fontSize=6.5, textColor=KINU, leading=9)
s_td = ParagraphStyle('TD', fontName=FONT, fontSize=6.5, textColor=SUMI_LIGHT, leading=9)
s_td_b = ParagraphStyle('TDB', fontName=FONT, fontSize=6.5, textColor=SUMI, leading=9)
s_footer = ParagraphStyle('Footer', fontName=FONT, fontSize=6, textColor=STONE, alignment=TA_CENTER)

H = lambda t: Paragraph(f'<b>{t}</b>', s_th)
C = lambda t, b=False: Paragraph(t, s_td_b if b else s_td)

def base_style(header_color):
    return [
        ('BACKGROUND', (0, 0), (-1, 0), header_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        ('LINEBELOW', (0, 0), (-1, 0), 0.75, header_color),
        ('LINEBELOW', (0, -1), (-1, -1), 0.4, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]

def alt_rows(n, start=1):
    return [('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(start, n)]

def build():
    doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4,
        leftMargin=16*mm, rightMargin=16*mm, topMargin=18*mm, bottomMargin=14*mm)
    W = A4[0] - 32*mm
    story = []

    # Header
    story.append(Paragraph('JAPANOMA', s_overline))
    story.append(Paragraph('MVP Gap Analysis', s_title))
    story.append(Paragraph('Our MVP scope vs Client Project Charter  |  2026-03-21', s_subtitle))

    # ── TABLE 1 ──
    story.append(Paragraph('<b>1. Features in Our MVP Not in Client Charter</b>', s_section))
    story.append(Paragraph('Features we have scoped in our v1 MVP that the client\'s charter does not mention. Significant added value.', s_body))

    d1 = [
        [H('#'), H('Our MVP Feature'), H('Charter Equivalent')],
        [C('1'), C('Content hub + CMS (Sanity, pagination, filtering, taxonomy navigation)', True), C('No mention')],
        [C('2'), C('Area pages with real data (86 cities, access info, 22 local areas)', True), C('No mention')],
        [C('3'), C('Compare page (side-by-side, up to 3 items, sticky tray, mobile carousel)', True), C('No mention')],
        [C('4'), C('Save / bookmark system (anonymous localStorage + authenticated DB, migration)', True), C('No mention')],
        [C('5'), C('SEO structured data (JSON-LD, Open Graph, dynamic XML sitemap)', True), C('No mention')],
        [C('6'), C('Anonymous sessions (pre-auth tracking with 90-day cookies)', True), C('No mention')],
        [C('7'), C('Full auth system (registration, login, password reset, session migration, account deletion)', True), C('Charter says "secure database" only')],
        [C('8'), C('Basic admin view (leads table, quiz completions, area popularity)', True), C('No mention')],
        [C('9'), C('Contact form with auto-population from quiz results / area context', True), C('No mention')],
    ]
    t1 = Table(d1, colWidths=[7*mm, W*0.59, W*0.37 - 7*mm])
    t1.setStyle(TableStyle(base_style(SUMI) + alt_rows(len(d1)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
    ]))
    story.append(t1)

    # ── TABLE 2 ──
    story.append(Paragraph('<b>2. Charter Features Covered by Our MVP</b>', s_section))
    story.append(Paragraph('Client charter requirements fully addressed and expanded in our MVP scope.', s_body))

    d2 = [
        [H('Charter Feature'), H('Our MVP Coverage')],
        [C('Quick survey', True), C('Lifestyle Quiz \u2014 expanded to multi-step flow covering area fit, use case, budget, and design style')],
        [C('Post-survey', True), C('Post-survey \u2014 incentivized survey after lead handoff to JP agents for transaction tracking + CX insights')],
        [C('Secure customer database', True), C('Supabase PostgreSQL (Sydney) + NextAuth v5 + Row Level Security. Significantly exceeds charter scope')],
    ]
    t2 = Table(d2, colWidths=[W*0.25, W*0.75])
    t2.setStyle(TableStyle(base_style(SUGI_DEEP) + alt_rows(len(d2)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t2)

    # ── TABLE 3 ──
    story.append(Paragraph('<b>3. Charter Features Deferred from MVP</b>', s_section))
    story.append(Paragraph('Marked "Will-Have" by the client. Intentionally deferred from v1, aligned with client\'s own prioritization.', s_body))

    d3 = [
        [H('Charter Feature'), H('Our Position')],
        [C('Premium services / paywall', True), C('Deferred \u2014 no content to gate yet. Architecture supports future addition')],
        [C('AI requirement parser', True), C('Deferred \u2014 "Will-Have" in charter. Natural language input \u2192 structured checklist conversion')],
        [C('Community feature', True), C('Deferred \u2014 "Will-Have" in charter. Buyer matching, partner directory, referral fee tracking')],
        [C('Nitori virtual staging link', True), C('Deferred \u2014 "Will-Have" in charter. External integration to nitori-net.jp coordinate simulation')],
    ]
    t3 = Table(d3, colWidths=[W*0.25, W*0.75])
    t3.setStyle(TableStyle(base_style(STONE) + alt_rows(len(d3)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t3)

    # Footer
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Japanoma  \u00b7  Craefto  \u00b7  Confidential  \u00b7  2026-03-21', s_footer))

    doc.build(story)
    print(f'PDF: {OUTPUT_PDF}')

    # Convert to high-res JPG
    from pdf2image import convert_from_path
    images = convert_from_path(OUTPUT_PDF, dpi=600)
    jpg_path = OUTPUT_PDF.replace('.pdf', '.jpg')
    images[0].save(jpg_path, 'JPEG', quality=100)
    w, h = images[0].size
    print(f'JPG: {jpg_path} ({w}x{h}px, 600 DPI)')

if __name__ == '__main__':
    build()
