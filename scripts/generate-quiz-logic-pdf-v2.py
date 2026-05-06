#!/usr/bin/env python3
"""Generate Quiz Logic v2 PDF — 6-step optimised quiz."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

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
BENI = HexColor('#8B3A3A')
AI = HexColor('#3D5A7A')
KOHAKU = HexColor('#A67B3D')

OUTPUT = '/Users/craefto/Desktop/Japanoma-Quiz-Logic-v2.pdf'

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    FONT = 'Satoshi'
except:
    FONT = 'Helvetica'

# Styles
s_overline = ParagraphStyle('Ov', fontName=FONT, fontSize=8, textColor=SUGI, leading=10, spaceAfter=2*mm)
s_title = ParagraphStyle('Ti', fontName=FONT, fontSize=28, textColor=SUMI, leading=34, spaceAfter=3*mm)
s_title2 = ParagraphStyle('T2', fontName=FONT, fontSize=22, textColor=STONE, leading=28, spaceAfter=6*mm)
s_h2 = ParagraphStyle('H2', fontName=FONT, fontSize=18, textColor=SUMI, leading=24, spaceBefore=8*mm, spaceAfter=4*mm)
s_h3 = ParagraphStyle('H3', fontName=FONT, fontSize=13, textColor=SUMI, leading=18, spaceBefore=5*mm, spaceAfter=3*mm)
s_body = ParagraphStyle('Bo', fontName=FONT, fontSize=10, textColor=SUMI_LIGHT, leading=17, spaceAfter=3*mm)
s_body_b = ParagraphStyle('Bb', fontName=FONT, fontSize=10, textColor=SUMI, leading=17, spaceAfter=3*mm)
s_caption = ParagraphStyle('Ca', fontName=FONT, fontSize=8.5, textColor=STONE, leading=13, spaceAfter=2*mm)
s_footer = ParagraphStyle('Fo', fontName=FONT, fontSize=7, textColor=STONE, alignment=TA_CENTER)
s_th = ParagraphStyle('TH', fontName=FONT, fontSize=8.5, textColor=KINU, leading=12)
s_td = ParagraphStyle('TD', fontName=FONT, fontSize=9, textColor=SUMI_LIGHT, leading=13)
s_td_b = ParagraphStyle('TB', fontName=FONT, fontSize=9, textColor=SUMI, leading=13)
s_big = ParagraphStyle('BG', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32)
s_small_c = ParagraphStyle('SC', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12)

H = lambda t: Paragraph(f'<b>{t}</b>', s_th)
C = lambda t, b=False: Paragraph(t, s_td_b if b else s_td)

def base_style(hc):
    return [
        ('BACKGROUND', (0, 0), (-1, 0), hc), ('TEXTCOLOR', (0, 0), (-1, 0), KINU),
        ('LINEBELOW', (0, 0), (-1, 0), 0.75, hc), ('LINEBELOW', (0, -1), (-1, -1), 0.4, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]

def alt(n):
    return [('BACKGROUND', (0, i), (-1, i), SHOJI if i % 2 == 0 else KINU) for i in range(1, n)]

def qcard(num, title, options, insight, is_multi=False):
    multi_tag = '  <font color="#9B7B4F">[Multi-select]</font>' if is_multi else ''
    data = [
        [Paragraph(f'<b>{num}</b>', ParagraphStyle('', fontName=FONT, fontSize=11, textColor=SUGI, leading=14)),
         Paragraph(f'<b>{title}</b>{multi_tag}', ParagraphStyle('', fontName=FONT, fontSize=12, textColor=SUMI, leading=16))],
        [Paragraph('', s_td),
         Paragraph(options, ParagraphStyle('', fontName=FONT, fontSize=9, textColor=STONE, leading=13))],
        [Paragraph('', s_td),
         Paragraph(insight, ParagraphStyle('', fontName=FONT, fontSize=9.5, textColor=SUMI_LIGHT, leading=14))],
    ]
    t = Table(data, colWidths=[16*mm, None])
    t._argW[1] = A4[0] - 44*mm - 16*mm
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SHOJI),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (0, -1), 'TOP'), ('SPAN', (0, 0), (0, 2)),
    ]))
    return t

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=18*mm)
    W = A4[0] - 44*mm
    story = []

    # ═══ PAGE 1: COVER ═══
    story.append(Spacer(1, 25*mm))
    story.append(Paragraph('JAPANOMA', s_overline))
    story.append(Paragraph('Lifestyle Quiz v2', s_title))
    story.append(Paragraph('How It Works', s_title2))
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        'The Japanoma Lifestyle Quiz is a 6-step decision-aid that narrows the entire '
        'ecosystem \u2014 area, property type, condition, and budget \u2014 to a personalised '
        'shortlist. This document explains what it asks, how it scores, and what both '
        'the buyer and Go&C receive.',
        s_body
    ))
    story.append(Spacer(1, 6*mm))

    stats = [
        [Paragraph('<b>6</b>', s_big), Paragraph('<b>13</b>', s_big),
         Paragraph('<b>3</b>', s_big), Paragraph('<b>5</b>', s_big)],
        [Paragraph('Steps', s_small_c), Paragraph('Cities Scored', s_small_c),
         Paragraph('Results Shown', s_small_c), Paragraph('Scoring<br/>Dimensions', s_small_c)],
    ]
    t = Table(stats, colWidths=[W/4]*4)
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEAFTER', (0, 0), (-2, -1), 0.5, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    # What's new box
    new_data = [
        [H('What Changed from v1'), H('Why')],
        [C('Added Property Type step (multi-select)', True), C('Client charter requirement. Narrows ecosystem beyond just area.')],
        [C('Added Property Condition step', True), C('Client charter requirement. Maps to 5 conditions: as-is through new build.')],
        [C('Budget Reality Check (inline education)', True), C('Client charter: "economics reality check." Shows what money actually buys.')],
        [C('Purpose expanded to 5 options', True), C('Split Investment from Lifestyle+Income \u2014 the most common Australian profile.')],
        [C('Ski Season with persona labels', True), C('"Weekend Warrior" to "Full Season" \u2014 gives buyers identity, not just numbers.')],
        [C('Results: 3 sections instead of 1', True), C('Areas + Property Profile + Personalised Checklist. Full ecosystem shortlist.')],
    ]
    t = Table(new_data, colWidths=[W*0.52, W*0.48])
    t.setStyle(TableStyle(base_style(MATSU) + alt(len(new_data)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-25', s_footer))

    story.append(PageBreak())

    # ═══ PAGE 2: THE 6 QUESTIONS ═══
    story.append(Paragraph('STEP BY STEP', s_overline))
    story.append(Paragraph('The Six Questions', s_h2))
    story.append(Paragraph(
        'Each step reveals a different dimension of what the buyer needs. Together they '
        'create a complete profile that we match against area, property type, and condition.',
        s_body
    ))
    story.append(Spacer(1, 3*mm))

    story.append(qcard('Step 1', 'Why are you considering buying in Japan?',
        'Holiday Home \u00b7 Ski Base \u00b7 Year-Round Living \u00b7 Investment \u00b7 Lifestyle + Income',
        'Tells us the <b>primary purpose</b>. "Lifestyle + Income" is the most common Australian buyer profile \u2014 '
        'personal use plus rental when away. Each purpose maps to different area types.'))
    story.append(Spacer(1, 2.5*mm))

    story.append(qcard('Step 2', 'What does your ski season look like?',
        'Weekend Warrior (2\u20135 days) \u00b7 Annual Pilgrimage (7\u201314) \u00b7 Season Regular (15\u201330) \u00b7 Full Season (30+)',
        'Tells us how much <b>proximity to slopes</b> matters. Someone skiing 30+ days needs to be within 10 minutes. '
        'Persona-aligned labels help buyers self-identify.'))
    story.append(Spacer(1, 2.5*mm))

    story.append(qcard('Step 3', 'What type of property interests you?',
        'Detached House \u00b7 Apartment/Condo \u00b7 Akiya (Vacant Home) \u00b7 Land Only \u00b7 Kominka (Heritage Home)',
        'Buyers select <b>up to 3 types</b>. Each type has a one-line description and typical price context. '
        'This feeds into the scoring \u2014 some types are more available in certain areas.', is_multi=True))
    story.append(Spacer(1, 2.5*mm))

    story.append(qcard('Step 4', 'How much work are you comfortable with?',
        'As-Is \u00b7 Inspected + Warranty \u00b7 Inspected + Reform Included \u00b7 Turnkey Ready \u00b7 New Build',
        'Maps to Go&C\u2019s <b>5 property conditions</b> from the taxonomy. Each shows a trade-off: '
        '"As-Is = cheapest, most risk" vs "Turnkey = premium, move-in ready." This is the client\u2019s '
        'specific charter requirement.'))
    story.append(Spacer(1, 2.5*mm))

    story.append(qcard('Step 5', 'What\u2019s your budget range?',
        'Under \u00a515M \u00b7 \u00a515\u201330M \u00b7 \u00a530\u201350M \u00b7 \u00a550M+',
        'After selecting, a <b>Reality Check panel</b> appears inline showing what that budget actually buys: '
        '"At \u00a515\u201330M, expect detached houses near ski areas in Nagano and Niigata. '
        'Light renovation may be needed." Warnings shown for lower tiers.'))
    story.append(Spacer(1, 2.5*mm))

    story.append(qcard('Step 6', 'What matters most to you?',
        'Closest to Slopes \u00b7 Onsen + Hot Spring Culture \u00b7 Affordability + Value \u00b7 Year-Round Lifestyle',
        'The <b>tiebreaker</b>. When two areas score similarly on purpose, property type, and budget, '
        'this priority decides which ranks higher.'))

    story.append(PageBreak())

    # ═══ PAGE 3: SCORING ═══
    story.append(Paragraph('UNDER THE HOOD', s_overline))
    story.append(Paragraph('How Scoring Works', s_h2))
    story.append(Paragraph(
        'Every one of our 13 launch cities gets scored out of 100 against the buyer\u2019s '
        'answers. The score is built from five components \u2014 one more than v1.',
        s_body
    ))
    story.append(Spacer(1, 3*mm))

    scoring = [
        [H('Component'), H('Max'), H('What It Measures'), H('How It Works')],
        [C('Purpose Match', True), C('30'), C('Area type alignment'),
         C('Each purpose maps to area types. "Ski Base" strongly boosts ski resorts. "Year-Round Living" boosts onsen towns and rural villages.')],
        [C('Proximity Fit', True), C('35'), C('Slope distance vs ski frequency'),
         C('More ski days = proximity matters more. Full Season (30+): areas within 10 min get full points. Weekend Warrior: distance matters less.')],
        [C('Property Type\nCompatibility', True), C('15'), C('Type availability in area'),
         C('<b>NEW.</b> Some property types are more available in certain areas. Akiya scores higher in rural towns. Apartments score higher near resorts. Multi-select: best match used.')],
        [C('Budget Match', True), C('20'), C('Affordability alignment'),
         C('Lower budgets score higher for developing areas with lower demand. Higher budgets score for established areas with better infrastructure.')],
        [C('Priority Match', True), C('30'), C('Personal preference'),
         C('"Closest to Slopes" checks shuttle bus and drive time. "Onsen" boosts onsen towns. "Affordability" boosts lower-demand areas.')],
    ]
    t = Table(scoring, colWidths=[20*mm, 10*mm, W*0.22, W - 20*mm - 10*mm - W*0.22])
    t.setStyle(TableStyle(base_style(SUMI) + alt(len(scoring)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        '<b>Total possible: 130 points, normalised to 100.</b> Score 70+ = "Strong match." '
        '50\u201369 = "Good fit." Below 50 = "Worth considering." Top 3 cities shown.',
        s_body_b
    ))

    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('The Budget Reality Check', s_h3))
    story.append(Paragraph(
        'This is the "economics reality check" from the client charter. When a buyer selects their budget, '
        'an educational panel appears <b>before they move to the next step</b>:',
        s_body
    ))

    reality = [
        [H('Budget Tier'), H('What It Buys'), H('What to Expect')],
        [C('Under \u00a515M', True), C('Rural akiya, older detached houses'), C('Renovation \u00a53\u20138M on top. Inspection critical \u2014 hidden moisture, wiring, snow load issues.')],
        [C('\u00a515\u201330M', True), C('Detached houses or apartments near ski areas'), C('Most common entry point for Australians. Light renovation may be needed.')],
        [C('\u00a530\u201350M', True), C('Resort-area properties, reformed homes'), C('Better infrastructure, closer to lifts, higher resale potential.')],
        [C('\u00a550M+', True), C('Premium locations, new builds, large homes'), C('Widest selection. Can be selective on condition, location, and style.')],
    ]
    t = Table(reality, colWidths=[W*0.17, W*0.35, W*0.48])
    t.setStyle(TableStyle(base_style(KOHAKU) + alt(len(reality)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        'This educates the buyer before they see results. It builds trust \u2014 we\u2019re showing '
        'the hard truth, not hiding it. Buyers who understand reality convert at higher rates.',
        s_caption
    ))

    story.append(PageBreak())

    # ═══ PAGE 4: RESULTS ═══
    story.append(Paragraph('THE EXPERIENCE', s_overline))
    story.append(Paragraph('What the Buyer Sees', s_h2))
    story.append(Paragraph(
        'The results page has three sections \u2014 a complete ecosystem shortlist, '
        'not just a list of areas.',
        s_body
    ))

    story.append(Paragraph('<b>Section 1: Recommended Areas</b>', s_h3))
    s1_items = [
        [C('Fit Score', True), C('Animated number (0\u2013100). Green (70+) = strong match. Amber (40\u201369) = good fit. The core "product moment."')],
        [C('Area Name', True), C('City and prefecture with Japanese name.')],
        [C('Explanation', True), C('"Strong match. Direct ski resort access, shuttle bus to slopes, 20 min from Myoko-Kogen station."')],
        [C('Explore Area', True), C('Links to the full area detail page.')],
        [C('Get in Touch', True), C('Links to contact form <b>pre-filled</b> with the area and marked as from the quiz.')],
    ]
    for item in s1_items:
        t = Table([item], colWidths=[22*mm, W - 22*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), SHOJI),
            ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEAFTER', (0, 0), (0, -1), 0.3, BORDER),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.5*mm))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Section 2: Your Property Profile</b> <font color="#9B7B4F">[NEW]</font>', s_h3))
    story.append(Paragraph(
        'A summary card showing the buyer\u2019s complete property profile drawn from their answers:',
        s_body
    ))

    profile_data = [
        [H('Field'), H('Example Output')],
        [C('Property Type', True), C('Detached House, Akiya (Vacant Home)')],
        [C('Condition', True), C('Inspected + Warranty')],
        [C('Budget', True), C('\u00a515M \u2013 \u00a530M')],
        [C('Summary', True), C('You\u2019re looking for Detached House or Akiya in Inspected + Warranty condition. At your budget, expect detached houses near ski areas. Light renovation may be needed.')],
    ]
    t = Table(profile_data, colWidths=[W*0.22, W*0.78])
    t.setStyle(TableStyle(base_style(SUGI_DEEP) + alt(len(profile_data)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Section 3: Personalised Next Steps</b> <font color="#9B7B4F">[NEW]</font>', s_h3))
    story.append(Paragraph(
        'A checklist tailored to the buyer\u2019s specific results. Example:',
        s_body
    ))

    steps_data = [
        [C('\u2713', True), C('Explore the <b>Myoko</b> area guide \u2014 access, infrastructure, and local context')],
        [C('\u2713', True), C('Explore the <b>Iiyama</b> area guide \u2014 access, infrastructure, and local context')],
        [C('\u2713', True), C('Understand total cost of ownership for <b>Detached House</b> properties in your budget range')],
        [C('\u2713', True), C('Talk to Go&C about <b>inspected + warranty</b> properties in Niigata')],
    ]
    t = Table(steps_data, colWidths=[8*mm, W - 8*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SHOJI),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, BORDER),
        ('TEXTCOLOR', (0, 0), (0, -1), MATSU),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ═══ PAGE 5: GO&C INTELLIGENCE ═══
    story.append(Paragraph('BUSINESS INTELLIGENCE', s_overline))
    story.append(Paragraph('What Go&C Gets', s_h2))
    story.append(Paragraph(
        'Every quiz completion is saved \u2014 even if the buyer never contacts. '
        'The expanded 6-step quiz captures significantly richer data than v1.',
        s_body
    ))

    intel = [
        [H('Data Point'), H('What It Reveals'), H('New in v2')],
        [C('Purpose distribution', True), C('What % want holiday homes vs ski base vs investment vs lifestyle+income'), C('\u2713')],
        [C('Ski frequency', True), C('How serious the audience is. Full Season = most committed segment.'), C('')],
        [C('Property type demand', True), C('Which property types are most requested. Shows if buyers want akiya, apartments, etc.'), C('\u2713')],
        [C('Condition preference', True), C('How much risk/work buyers accept. High turnkey demand = opportunity for pre-reformed stock.'), C('\u2713')],
        [C('Budget ranges', True), C('Where buyer budgets cluster. Shapes pricing strategy and area recommendations.'), C('')],
        [C('Priority patterns', True), C('What buyers care about most. If 60% say "affordability," that shapes content strategy.'), C('')],
        [C('Recommended areas', True), C('Which areas the algorithm recommends most. Shows organic demand patterns.'), C('')],
        [C('Complete buyer profile', True), C('Purpose + type + condition + budget = full buyer persona per submission.'), C('\u2713')],
        [C('Quiz \u2192 Contact rate', True), C('Core conversion metric. How many quiz completers click "Get in Touch."'), C('')],
    ]
    t = Table(intel, colWidths=[W*0.22, W*0.62, W*0.16])
    t.setStyle(TableStyle(base_style(MATSU) + alt(len(intel)) + [
        ('LINEAFTER', (0, 0), (-2, -1), 0.2, BORDER),
        ('ALIGN', (2, 1), (2, -1), 'CENTER'),
    ]))
    story.append(t)

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('Charter Alignment', s_h3))
    story.append(Paragraph(
        'The client\u2019s project charter specified three requirements for the quiz. '
        'Here\u2019s how v2 addresses each:',
        s_body
    ))

    charter = [
        [H('Charter Requirement'), H('Quiz v2 Implementation')],
        [C('Primary purpose of use', True), C('Step 1: 5 purpose options including the Lifestyle + Income split that reflects the most common Australian buyer profile.')],
        [C('Economics reality check', True), C('Step 5: Budget selection with inline Reality Check panel showing what the money buys, expected additional costs, and risk warnings per tier.')],
        [C('Property type preference\n(Checked Y/N, Reformed Y/N)', True), C('Step 3: Multi-select property types (up to 3). Step 4: 5 condition levels mapping directly to the Go&C taxonomy, from As-Is through Turnkey Ready and New Build.')],
    ]
    t = Table(charter, colWidths=[W*0.30, W*0.70])
    t.setStyle(TableStyle(base_style(AI) + alt(len(charter)) + [
        ('LINEAFTER', (0, 0), (0, -1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        'Live at japanoma.vercel.app/quiz. Questions, scoring weights, and reality check '
        'content can all be adjusted without rebuilding the platform.',
        s_caption
    ))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-25', s_footer))

    doc.build(story)
    print(f'PDF: {OUTPUT}')

    try:
        from pdf2image import convert_from_path
        images = convert_from_path(OUTPUT, dpi=400)
        for i, img in enumerate(images):
            path = OUTPUT.replace('.pdf', f'-page{i+1}.jpg')
            img.save(path, 'JPEG', quality=98)
            w, h = img.size
            print(f'JPG page {i+1}: {path} ({w}x{h}px)')
    except ImportError:
        print('Install pdf2image for JPG output')

if __name__ == '__main__':
    build()
