#!/usr/bin/env python3
"""Generate Quiz Logic PDF for client presentation."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# Ma Space colors
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
KINU = HexColor('#FFFFFF')
AI = HexColor('#3D5A7A')

OUTPUT = '/Users/craefto/Desktop/Japanoma-Quiz-Logic.pdf'

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    FONT = 'Satoshi'
except:
    FONT = 'Helvetica'

# Styles
s_overline = ParagraphStyle('Overline', fontName=FONT, fontSize=8, textColor=SUGI, leading=10,
                             spaceAfter=2*mm, letterSpacing=2)
s_title = ParagraphStyle('Title', fontName=FONT, fontSize=28, textColor=SUMI, leading=34,
                          spaceAfter=3*mm)
s_subtitle = ParagraphStyle('Subtitle', fontName=FONT, fontSize=11, textColor=STONE, leading=16,
                             spaceAfter=8*mm)
s_h2 = ParagraphStyle('H2', fontName=FONT, fontSize=18, textColor=SUMI, leading=24,
                       spaceBefore=10*mm, spaceAfter=4*mm)
s_h3 = ParagraphStyle('H3', fontName=FONT, fontSize=13, textColor=SUMI, leading=18,
                       spaceBefore=6*mm, spaceAfter=3*mm, fontWeight='bold')
s_body = ParagraphStyle('Body', fontName=FONT, fontSize=10, textColor=SUMI_LIGHT, leading=17,
                         spaceAfter=3*mm)
s_body_bold = ParagraphStyle('BodyBold', fontName=FONT, fontSize=10, textColor=SUMI, leading=17,
                              spaceAfter=3*mm)
s_caption = ParagraphStyle('Caption', fontName=FONT, fontSize=8.5, textColor=STONE, leading=13,
                            spaceAfter=2*mm)
s_footer = ParagraphStyle('Footer', fontName=FONT, fontSize=7, textColor=STONE, alignment=TA_CENTER)
s_th = ParagraphStyle('TH', fontName=FONT, fontSize=8.5, textColor=KINU, leading=12)
s_td = ParagraphStyle('TD', fontName=FONT, fontSize=9, textColor=SUMI_LIGHT, leading=13)
s_td_b = ParagraphStyle('TDB', fontName=FONT, fontSize=9, textColor=SUMI, leading=13)
s_num = ParagraphStyle('Num', fontName=FONT, fontSize=36, textColor=SUGI, leading=40,
                        alignment=TA_CENTER)
s_score_label = ParagraphStyle('ScoreLabel', fontName=FONT, fontSize=9, textColor=STONE,
                                leading=12, alignment=TA_CENTER)

H = lambda t: Paragraph(f'<b>{t}</b>', s_th)
C = lambda t, b=False: Paragraph(t, s_td_b if b else s_td)

border = {'style': 'SINGLE', 'size': 0.5, 'color': BORDER}
cell_margins = {'top': 60, 'bottom': 60, 'left': 100, 'right': 100}

def base_style(header_color):
    return [
        ('BACKGROUND', (0, 0), (-1, 0), header_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        ('LINEBELOW', (0, 0), (-1, 0), 0.75, header_color),
        ('LINEBELOW', (0, -1), (-1, -1), 0.4, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]

def alt_rows(n):
    return [('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(1, n)]

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=18*mm)
    W = A4[0] - 44*mm
    story = []

    # ── PAGE 1: COVER ──
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph('JAPANOMA', s_overline))
    story.append(Paragraph('Lifestyle Quiz', s_title))
    story.append(Paragraph('How It Works', ParagraphStyle('T2', fontName=FONT, fontSize=22,
                            textColor=STONE, leading=28, spaceAfter=6*mm)))
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 8*mm))

    story.append(Paragraph(
        'This document explains the logic behind the Japanoma Lifestyle Quiz \u2014 '
        'what it asks, how it scores, and what the user sees. Written for non-technical '
        'stakeholders.',
        s_body
    ))
    story.append(Spacer(1, 6*mm))

    # Key stats
    stats = [
        [Paragraph('<b>4</b>', ParagraphStyle('', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32)),
         Paragraph('<b>13</b>', ParagraphStyle('', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32)),
         Paragraph('<b>3</b>', ParagraphStyle('', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32)),
         Paragraph('<b>100</b>', ParagraphStyle('', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32))],
        [Paragraph('Questions', ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12)),
         Paragraph('Launch Cities<br/>Scored', ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12)),
         Paragraph('Recommendations<br/>Shown', ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12)),
         Paragraph('Max Fit<br/>Score', ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12))],
    ]
    t = Table(stats, colWidths=[W/4]*4)
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEAFTER', (0, 0), (-2, -1), 0.5, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 20*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-22', s_footer))

    story.append(PageBreak())

    # ── PAGE 2: THE 4 QUESTIONS ──
    story.append(Paragraph('STEP BY STEP', s_overline))
    story.append(Paragraph('The Four Questions', s_h2))
    story.append(Paragraph(
        'The quiz asks four simple questions. Each one reveals a different dimension '
        'of what the buyer is looking for. Together, they create a profile that we match '
        'against our 13 launch cities.',
        s_body
    ))
    story.append(Spacer(1, 4*mm))

    questions = [
        ['1', 'What\u2019s your main goal?',
         'Holiday Home \u00b7 Ski Lifestyle \u00b7 Investment \u00b7 Retirement',
         'Tells us what <b>type of area</b> suits them. A ski lifestyle buyer needs resort proximity. A retiree values onsen towns and year-round living.'],
        ['2', 'How many ski days per year?',
         '2\u20135 \u00b7 7\u201314 \u00b7 15\u201330 \u00b7 30+ days',
         'Tells us how much <b>proximity to slopes</b> matters. Someone skiing 30+ days needs to be within 10 minutes. Someone skiing 5 days can be further out.'],
        ['3', 'What\u2019s your budget range?',
         'Under \u00a515M \u00b7 \u00a515\u201330M \u00b7 \u00a530\u201350M \u00b7 \u00a550M+',
         'Matches the buyer to <b>areas they can afford</b>. Lower budgets score higher for developing areas. Higher budgets score higher for established areas with infrastructure.'],
        ['4', 'What matters most to you?',
         'Closest to slopes \u00b7 Onsen access \u00b7 Affordability \u00b7 Year-round use',
         'The <b>tiebreaker</b>. When two areas score similarly, this priority decides which one ranks higher.'],
    ]

    for q in questions:
        # Question card
        data = [
            [Paragraph(f'<b>Question {q[0]}</b>', ParagraphStyle('', fontName=FONT, fontSize=11, textColor=SUGI, leading=14)),
             Paragraph(f'<b>{q[1]}</b>', ParagraphStyle('', fontName=FONT, fontSize=12, textColor=SUMI, leading=16))],
            [Paragraph('', s_td),
             Paragraph(q[2], ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, leading=13))],
            [Paragraph('', s_td),
             Paragraph(q[3], ParagraphStyle('', fontName=FONT, fontSize=9.5, textColor=SUMI_LIGHT, leading=14))],
        ]
        t = Table(data, colWidths=[18*mm, W - 18*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), SHOJI),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (0, -1), 'TOP'),
            ('SPAN', (0, 0), (0, 2)),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ]))
        story.append(t)
        story.append(Spacer(1, 3*mm))

    story.append(PageBreak())

    # ── PAGE 3: SCORING ──
    story.append(Paragraph('UNDER THE HOOD', s_overline))
    story.append(Paragraph('How Scoring Works', s_h2))
    story.append(Paragraph(
        'Every one of our 13 launch cities gets scored out of 100 against the buyer\u2019s '
        'answers. The score is built from four components, each measuring a different '
        'dimension of fit.',
        s_body
    ))
    story.append(Spacer(1, 4*mm))

    # Scoring breakdown table
    scoring = [
        [H('Component'), H('Max Points'), H('What It Measures'), H('How It Works')],
        [C('Goal Match', True), C('30'), C('Area type alignment'),
         C('Each goal maps to area types. "Ski Lifestyle" boosts ski resorts. "Retirement" boosts onsen towns and rural villages.')],
        [C('Proximity Fit', True), C('35'), C('Distance to slopes vs frequency'),
         C('More ski days = proximity matters more. 30+ days: areas within 10 min score full points. 2\u20135 days: distance matters less.')],
        [C('Budget Match', True), C('20'), C('Affordability alignment'),
         C('Lower budgets score higher for developing areas. Higher budgets score higher for established areas with more infrastructure.')],
        [C('Priority Match', True), C('30'), C('Personal preference tiebreaker'),
         C('"Closest to slopes" checks shuttle bus and drive time. "Onsen" boosts onsen towns. "Affordability" boosts lower-demand areas.')],
    ]
    t = Table(scoring, colWidths=[22*mm, 16*mm, W*0.25, W - 22*mm - 16*mm - W*0.25])
    t.setStyle(TableStyle(base_style(SUMI) + alt_rows(len(scoring)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        '<b>Total possible: 115 points, normalised to 100.</b> A score of 70+ means '
        '"Strong match." 50\u201369 means "Good fit." Below 50 means "Worth considering." '
        'Only the top 3 cities are shown.',
        s_body_bold
    ))

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6*mm))

    # Example scoring
    story.append(Paragraph('Example: How a Buyer\u2019s Answers Score', s_h3))
    story.append(Paragraph(
        'A buyer answers: <b>Ski Lifestyle</b>, <b>15\u201330 days</b>, <b>\u00a515\u201330M</b>, '
        '<b>Closest to slopes</b>. Here\u2019s how two cities compare:',
        s_body
    ))
    story.append(Spacer(1, 3*mm))

    example = [
        [H('Component'), H('Myoko (Niigata)'), H('Iiyama (Nagano)')],
        [C('Goal Match (Ski Lifestyle)', True), C('No specific region type match = 0'), C('No specific region type match = 0')],
        [C('Proximity (15\u201330 days)', True), C('Car to slope: 20 min \u2192 15 pts'), C('Car to slope: 10 min \u2192 25 pts')],
        [C('Budget (\u00a515\u201330M)', True), C('Medium priority area \u2192 15 pts'), C('Medium priority area \u2192 15 pts')],
        [C('Priority (Slopes)', True), C('Shuttle bus: Yes \u2192 20 pts'), C('No shuttle \u2192 5 pts')],
        [C('Total', True),
         Paragraph('<b>50 / 115 = 43</b>', ParagraphStyle('', fontName=FONT, fontSize=10, textColor=SUGI, leading=14)),
         Paragraph('<b>45 / 115 = 39</b>', ParagraphStyle('', fontName=FONT, fontSize=10, textColor=SUGI, leading=14))],
    ]
    t = Table(example, colWidths=[W*0.35, W*0.325, W*0.325])
    t.setStyle(TableStyle(base_style(SUGI_DEEP) + alt_rows(len(example)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        'In this example, Myoko edges ahead because of its shuttle bus service, even though '
        'Iiyama is closer to slopes by car. The scoring captures the nuance.',
        s_caption
    ))

    story.append(PageBreak())

    # ── PAGE 4: WHAT THE USER SEES + WHAT GO&C GETS ──
    story.append(Paragraph('THE EXPERIENCE', s_overline))
    story.append(Paragraph('What the Buyer Sees', s_h2))
    story.append(Paragraph(
        'After answering all 4 questions, the buyer lands on a results page showing '
        'their top 3 recommended areas. Each result includes:',
        s_body
    ))

    results_items = [
        ['Fit Score', 'An animated number (0\u2013100) with colour coding. Green (70+) = strong match. Amber (40\u201369) = good fit. This is the core "product moment" \u2014 the number that makes the platform feel personal.'],
        ['Area Name', 'City and prefecture, with Japanese name alongside.'],
        ['Explanation', 'A plain-English sentence: "Strong match. Direct ski resort access, shuttle bus to slopes, 20 min from Myoko-Kogen station."'],
        ['Explore Area', 'Button linking to the full area detail page with access info, notes, and local areas.'],
        ['Get in Touch', 'Button linking to the contact form, <b>pre-filled</b> with the recommended area and marked as coming from the quiz. Go&C sees exactly what drove the enquiry.'],
    ]

    for item in results_items:
        data = [[C(item[0], True), Paragraph(item[1], ParagraphStyle('', fontName=FONT, fontSize=9.5, textColor=SUMI_LIGHT, leading=14))]]
        t = Table(data, colWidths=[24*mm, W - 24*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), SHOJI),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEAFTER', (0, 0), (0, -1), 0.3, BORDER),
        ]))
        story.append(t)
        story.append(Spacer(1, 2*mm))

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph('What Go&C Gets', s_h2))
    story.append(Paragraph(
        'Every quiz completion is saved to the database, even if the buyer never fills out '
        'the contact form. This gives Go&C valuable market intelligence:',
        s_body
    ))

    goc_items = [
        [H('Data Point'), H('What It Reveals')],
        [C('Goal distribution', True), C('What percentage of buyers want holiday homes vs ski lifestyle vs investment vs retirement')],
        [C('Budget ranges', True), C('Where buyer budgets cluster. Helps price positioning and area recommendations.')],
        [C('Ski frequency', True), C('How serious the audience is. 30+ day skiers are the most committed market segment.')],
        [C('Top priorities', True), C('What buyers care about most. If 60% say "affordability", that shapes content strategy.')],
        [C('Recommended areas', True), C('Which areas the algorithm recommends most. Shows organic demand patterns.')],
        [C('Completion rate', True), C('How many people start the quiz vs finish it. Low completion = questions need refinement.')],
        [C('Quiz \u2192 Contact rate', True), C('How many quiz completers click "Get in Touch." The core conversion metric.')],
    ]
    t = Table(goc_items, colWidths=[W*0.28, W*0.72])
    t.setStyle(TableStyle(base_style(MATSU) + alt_rows(len(goc_items)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        'The quiz is live at japanoma.vercel.app/quiz. Questions and scoring weights '
        'can be adjusted without rebuilding the platform.',
        s_caption
    ))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-22', s_footer))

    doc.build(story)
    print(f'PDF: {OUTPUT}')

    # Convert to high-res JPG (multi-page)
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(OUTPUT, dpi=400)
        for i, img in enumerate(images):
            path = OUTPUT.replace('.pdf', f'-page{i+1}.jpg')
            img.save(path, 'JPEG', quality=98)
            w, h = img.size
            print(f'JPG page {i+1}: {path} ({w}x{h}px)')
    except ImportError:
        print('Install pdf2image for JPG conversion')

if __name__ == '__main__':
    build()
