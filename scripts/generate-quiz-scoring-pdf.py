#!/usr/bin/env python3
"""Generate Quiz Scoring System PDF for client."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER

SUMI = HexColor('#1A1816')
SUMI_LIGHT = HexColor('#3D3833')
STONE = HexColor('#8A8279')
SHOJI = HexColor('#FAFAF7')
SUGI = HexColor('#9B7B4F')
SUGI_DEEP = HexColor('#7A5F3A')
BORDER = HexColor('#E5E0D8')
MATSU = HexColor('#4A6B52')
KINU = HexColor('#FFFFFF')
BENI = HexColor('#8B3A3A')
AI = HexColor('#3D5A7A')
KOHAKU = HexColor('#A67B3D')

OUTPUT = '/Users/craefto/Desktop/Japanoma-Quiz-Scoring-System.pdf'

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    FONT = 'Satoshi'
except:
    FONT = 'Helvetica'

s_ov = ParagraphStyle('Ov', fontName=FONT, fontSize=8, textColor=SUGI, leading=10, spaceAfter=2*mm)
s_ti = ParagraphStyle('Ti', fontName=FONT, fontSize=26, textColor=SUMI, leading=32, spaceAfter=3*mm)
s_t2 = ParagraphStyle('T2', fontName=FONT, fontSize=20, textColor=STONE, leading=26, spaceAfter=6*mm)
s_h2 = ParagraphStyle('H2', fontName=FONT, fontSize=17, textColor=SUMI, leading=22, spaceBefore=8*mm, spaceAfter=4*mm)
s_h3 = ParagraphStyle('H3', fontName=FONT, fontSize=12, textColor=SUMI, leading=16, spaceBefore=5*mm, spaceAfter=3*mm)
s_bo = ParagraphStyle('Bo', fontName=FONT, fontSize=10, textColor=SUMI_LIGHT, leading=17, spaceAfter=3*mm)
s_bb = ParagraphStyle('Bb', fontName=FONT, fontSize=10, textColor=SUMI, leading=17, spaceAfter=3*mm)
s_ca = ParagraphStyle('Ca', fontName=FONT, fontSize=8.5, textColor=STONE, leading=13, spaceAfter=2*mm)
s_fo = ParagraphStyle('Fo', fontName=FONT, fontSize=7, textColor=STONE, alignment=TA_CENTER)
s_th = ParagraphStyle('TH', fontName=FONT, fontSize=8.5, textColor=KINU, leading=12)
s_td = ParagraphStyle('TD', fontName=FONT, fontSize=9, textColor=SUMI_LIGHT, leading=13)
s_tb = ParagraphStyle('TB', fontName=FONT, fontSize=9, textColor=SUMI, leading=13)
s_bg = ParagraphStyle('BG', fontName=FONT, fontSize=28, textColor=SUGI, alignment=TA_CENTER, leading=32)
s_sc = ParagraphStyle('SC', fontName=FONT, fontSize=9, textColor=STONE, alignment=TA_CENTER, leading=12)

H = lambda t: Paragraph(f'<b>{t}</b>', s_th)
C = lambda t, b=False: Paragraph(t, s_tb if b else s_td)

def bstyle(hc):
    return [
        ('BACKGROUND', (0,0),(-1,0), hc), ('TEXTCOLOR', (0,0),(-1,0), KINU),
        ('LINEBELOW', (0,0),(-1,0), 0.75, hc), ('LINEBELOW', (0,-1),(-1,-1), 0.4, BORDER),
        ('TOPPADDING', (0,0),(-1,-1), 4), ('BOTTOMPADDING', (0,0),(-1,-1), 4),
        ('LEFTPADDING', (0,0),(-1,-1), 6), ('RIGHTPADDING', (0,0),(-1,-1), 6),
        ('VALIGN', (0,0),(-1,-1), 'TOP'),
    ]

def alt(n):
    return [('BACKGROUND', (0,i),(-1,i), SHOJI if i%2==0 else KINU) for i in range(1,n)]

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=18*mm)
    W = A4[0] - 44*mm
    story = []

    # ═══ PAGE 1: COVER ═══
    story.append(Spacer(1, 25*mm))
    story.append(Paragraph('JAPANOMA', s_ov))
    story.append(Paragraph('Quiz Scoring System', s_ti))
    story.append(Paragraph('How We Match Buyers to Areas', s_t2))
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        'The Japanoma Lifestyle Quiz scores each of our 13 launch cities against '
        'the buyer\u2019s answers across five dimensions. This document explains exactly '
        'how scoring works, what each dimension measures, and how results are presented.',
        s_bo
    ))
    story.append(Spacer(1, 6*mm))

    stats = [
        [Paragraph('<b>5</b>', s_bg), Paragraph('<b>100</b>', s_bg),
         Paragraph('<b>75+</b>', s_bg), Paragraph('<b>13</b>', s_bg)],
        [Paragraph('Scoring<br/>Dimensions', s_sc), Paragraph('Max<br/>Score', s_sc),
         Paragraph('Strong<br/>Match', s_sc), Paragraph('Cities<br/>Scored', s_sc)],
    ]
    t = Table(stats, colWidths=[W/4]*4)
    t.setStyle(TableStyle([
        ('ALIGN', (0,0),(-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0),(-1,-1), 8), ('BOTTOMPADDING', (0,0),(-1,-1), 8),
        ('LINEAFTER', (0,0),(-2,-1), 0.5, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    # Design principles
    story.append(Paragraph('<b>Scoring Principles</b>', s_h3))
    principles = [
        [C('1', True), C('Every dimension contributes positively. No answer combination produces a zero in any category.')],
        [C('2', True), C('Top results always feel motivating. The best match for any answer set scores 70 to 85+.')],
        [C('3', True), C('Differentiation comes from relative scoring. Cities separate by 5 to 15 points, giving clear ranking.')],
        [C('4', True), C('Results use encouraging language. "Strong match," "Good fit," "Worth exploring." Never negative.')],
    ]
    t = Table(principles, colWidths=[8*mm, W-8*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(-1,-1), SHOJI),
        ('TOPPADDING', (0,0),(-1,-1), 5), ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING', (0,0),(-1,-1), 8), ('RIGHTPADDING', (0,0),(-1,-1), 8),
        ('LINEBELOW', (0,0),(-1,-2), 0.3, BORDER),
        ('TEXTCOLOR', (0,0),(0,-1), SUGI),
        ('VALIGN', (0,0),(-1,-1), 'TOP'),
    ]))
    story.append(t)

    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-25', s_fo))

    story.append(PageBreak())

    # ═══ PAGE 2: THE FIVE DIMENSIONS ═══
    story.append(Paragraph('THE FIVE DIMENSIONS', s_ov))
    story.append(Paragraph('How Each Answer Contributes', s_h2))
    story.append(Paragraph(
        'Each quiz answer feeds into one of five scoring dimensions. Every dimension '
        'has a maximum point value, and every answer produces a positive score.',
        s_bo
    ))

    dims = [
        [H('Dimension'), H('Max'), H('Driven By'), H('How It Works')],
        [C('Purpose Affinity', True), C('25'), C('Step 1: Why buying'),
         C('Each purpose (Holiday, Ski Base, Year-Round, Investment, Lifestyle+Income) has an affinity score for each area type. Ski Base scores highest for ski resort areas. Year-Round scores highest for onsen towns.')],
        [C('Proximity Fit', True), C('25'), C('Step 2: Ski season'),
         C('More ski days = proximity matters more. Full Season (30+ days): areas within 15 min get full points. Weekend Warrior (2\u20135 days): proximity scores lower but still positive.')],
        [C('Property Type', True), C('15'), C('Step 3: Type preference'),
         C('Each property type has natural affinity for certain area types. Detached houses score well everywhere. Akiya scores highest in rural areas. Apartments score highest near resorts and urban areas.')],
        [C('Budget Match', True), C('15'), C('Step 5: Budget range'),
         C('Generous scoring. Most budget and area combinations score 12 to 15 points. Lower budgets get slightly less for high-priority areas (premium demand). Higher budgets score consistently high.')],
        [C('Priority Match', True), C('20'), C('Step 6: What matters most'),
         C('"Closest to Slopes" checks shuttle bus availability and drive times. "Onsen" boosts onsen towns. "Affordability" boosts developing areas. Minimum 10 points even on weak matches.')],
    ]
    t = Table(dims, colWidths=[W*0.18, 10*mm, W*0.18, W*0.56 - 10*mm])
    t.setStyle(TableStyle(bstyle(SUMI) + alt(len(dims)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        '<b>Total: 100 points.</b> The five dimensions sum directly to the fit score. '
        'No normalisation needed. A score of 80 means the city earned 80 out of 100 possible points.',
        s_bb
    ))

    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>Score Thresholds</b>', s_h3))
    thresholds = [
        [H('Score'), H('Label'), H('What It Means')],
        [C('75 to 100', True), C('Strong match'),
         C('This area aligns well with the buyer\u2019s purpose, ski frequency, property preference, budget, and priorities. Worth serious consideration.')],
        [C('60 to 74', True), C('Good fit'),
         C('Solid alignment on most dimensions. May have one area where the fit is moderate rather than strong. Still a good option.')],
        [C('Below 60', True), C('Worth exploring'),
         C('The area has merit but doesn\u2019t align as tightly. Usually means the buyer\u2019s priorities point toward a different area type. Still shown if it\u2019s in the top 3.')],
    ]
    t = Table(thresholds, colWidths=[W*0.15, W*0.18, W*0.67])
    t.setStyle(TableStyle(bstyle(SUGI_DEEP) + alt(len(thresholds)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ═══ PAGE 3: WORKED EXAMPLES ═══
    story.append(Paragraph('WORKED EXAMPLES', s_ov))
    story.append(Paragraph('Real Scoring Scenarios', s_h2))

    # Example 1
    story.append(Paragraph('<b>Scenario A: Australian family, annual ski trip</b>', s_h3))
    story.append(Paragraph(
        'Answers: Holiday Home, Annual Pilgrimage (7\u201314 days), Detached House, '
        'Inspected + Warranty, \u00a515M to \u00a530M, Closest to Slopes.',
        s_bo
    ))

    ex1 = [
        [H('Dimension'), H('Myoko'), H('Minamiuonuma'), H('Iiyama')],
        [C('Purpose (Holiday \u2192 ski_resort)', True), C('22'), C('22'), C('22')],
        [C('Proximity (Annual, 15 pts max)', True), C('15 (15 min)'), C('15 (15 min)'), C('12 (25 min)')],
        [C('Property Type (Detached)', True), C('15'), C('15'), C('15')],
        [C('Budget (\u00a515\u201330M)', True), C('14'), C('14'), C('14')],
        [C('Priority (Slopes)', True), C('17 (shuttle)'), C('17 (shuttle)'), C('14 (25 min)')],
        [C('Total', True),
         Paragraph('<b><font color="#4A6B52">83</font></b>', s_tb),
         Paragraph('<b><font color="#4A6B52">83</font></b>', s_tb),
         Paragraph('<b><font color="#9B7B4F">77</font></b>', s_tb)],
    ]
    t = Table(ex1, colWidths=[W*0.38, W*0.22, W*0.22, W*0.18])
    t.setStyle(TableStyle(bstyle(MATSU) + alt(len(ex1)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)
    story.append(Paragraph(
        'All three score as Strong Match (75+). Myoko and Minamiuonuma tie on proximity '
        '(15 min to slopes with shuttle). Iiyama is close behind.',
        s_ca
    ))

    # Example 2
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('<b>Scenario B: Investor looking for rental yield</b>', s_h3))
    story.append(Paragraph(
        'Answers: Investment, Weekend Warrior (2\u20135 days), Apartment, '
        'Turnkey Ready, \u00a530M to \u00a550M, Affordability.',
        s_bo
    ))

    ex2 = [
        [H('Dimension'), H('Myoko'), H('Minamiuonuma'), H('Shimotakai')],
        [C('Purpose (Investment \u2192 ski_resort)', True), C('22'), C('22'), C('22')],
        [C('Proximity (Weekend, 8 pts max)', True), C('8 (15 min)'), C('8 (15 min)'), C('6 (25 min)')],
        [C('Property Type (Apartment)', True), C('12'), C('12'), C('12')],
        [C('Budget (\u00a530\u201350M)', True), C('15'), C('15'), C('15')],
        [C('Priority (Affordable)', True), C('12'), C('12'), C('12')],
        [C('Total', True),
         Paragraph('<b><font color="#9B7B4F">69</font></b>', s_tb),
         Paragraph('<b><font color="#9B7B4F">69</font></b>', s_tb),
         Paragraph('<b><font color="#9B7B4F">67</font></b>', s_tb)],
    ]
    t = Table(ex2, colWidths=[W*0.38, W*0.22, W*0.22, W*0.18])
    t.setStyle(TableStyle(bstyle(AI) + alt(len(ex2)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)
    story.append(Paragraph(
        'Good Fit range (60\u201374). Proximity matters less for weekend visitors, '
        'so scores are tighter. The "Affordability" priority doesn\u2019t strongly differentiate '
        'since all P1 areas are similarly priced.',
        s_ca
    ))

    # Example 3
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('<b>Scenario C: Full-season ski enthusiast</b>', s_h3))
    story.append(Paragraph(
        'Answers: Ski Base, Full Season (30+ days), Detached House + Akiya, '
        'As-Is, Under \u00a515M, Closest to Slopes.',
        s_bo
    ))

    ex3 = [
        [H('Dimension'), H('Myoko'), H('Minamiuonuma'), H('Kijimadaira')],
        [C('Purpose (Ski Base \u2192 ski_resort)', True), C('25'), C('25'), C('25')],
        [C('Proximity (Full, 25 pts max)', True), C('25 (15 min)'), C('25 (15 min)'), C('20 (20 min)')],
        [C('Property Type (Detached best)', True), C('15'), C('15'), C('15')],
        [C('Budget (Under \u00a515M)', True), C('10'), C('10'), C('10')],
        [C('Priority (Slopes)', True), C('17 (shuttle)'), C('17 (shuttle)'), C('17 (shuttle)')],
        [C('Total', True),
         Paragraph('<b><font color="#4A6B52">92</font></b>', s_tb),
         Paragraph('<b><font color="#4A6B52">92</font></b>', s_tb),
         Paragraph('<b><font color="#4A6B52">87</font></b>', s_tb)],
    ]
    t = Table(ex3, colWidths=[W*0.38, W*0.22, W*0.22, W*0.18])
    t.setStyle(TableStyle(bstyle(MATSU) + alt(len(ex3)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)
    story.append(Paragraph(
        'Strong Match across the board (87\u201392). Full-season ski base buyers are the '
        'strongest match for our P1 launch areas. Purpose and proximity both max out.',
        s_ca
    ))

    story.append(PageBreak())

    # ═══ PAGE 4: BEFORE/AFTER + DATA FIXES ═══
    story.append(Paragraph('WHAT CHANGED', s_ov))
    story.append(Paragraph('Before and After', s_h2))
    story.append(Paragraph(
        'The original scoring system had data gaps that caused artificially low scores. '
        'Here\u2019s what was fixed.',
        s_bo
    ))

    ba = [
        [H('Issue'), H('Before'), H('After')],
        [C('Region type data', True),
         C('All 13 P1 cities had NULL region type. Purpose scoring always returned 0.'),
         C('All cities now have correct region type (ski_resort) from CRA-76 taxonomy.')],
        [C('Purpose scoring', True),
         C('30 points permanently lost for every user. Max achievable: 0/30.'),
         C('15 to 25 points. Every purpose has natural affinity for ski resort areas.')],
        [C('Proximity curve', True),
         C('Only areas within 10 min got full points. No P1 city qualified.'),
         C('Softer curve: 15 min = 100%, 25 min = 80%, 35 min = 65%.')],
        [C('Budget scoring', True),
         C('10 points for most combinations. High-priority areas penalised lower budgets.'),
         C('12 to 15 for most combinations. Generous and realistic.')],
        [C('Score floor', True),
         C('Minimum fallback was 5 points. Many dimensions scored 0.'),
         C('Minimum 8 to 12 points per dimension. No zero traps.')],
        [C('Best possible score', True),
         Paragraph('<b><font color="#8B3A3A">~39 out of 100</font></b>', s_tb),
         Paragraph('<b><font color="#4A6B52">85 to 95 out of 100</font></b>', s_tb)],
        [C('Worst possible score', True),
         Paragraph('<b><font color="#8B3A3A">~15 out of 100</font></b>', s_tb),
         Paragraph('<b><font color="#4A6B52">55 to 65 out of 100</font></b>', s_tb)],
    ]
    t = Table(ba, colWidths=[W*0.22, W*0.39, W*0.39])
    t.setStyle(TableStyle(bstyle(SUMI) + alt(len(ba)) + [
        ('LINEAFTER', (0,0),(-2,-1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>Taxonomy Data Update (v3)</b>', s_h3))
    story.append(Paragraph(
        'Applied alongside the scoring fix from the latest CRA-76 taxonomy:',
        s_bo
    ))

    tax = [
        [H('Update'), H('Details')],
        [C('Region type populated', True), C('All 86 cities now have correct region type. P1 cities: ski_resort. Others: onsen_town, urban_access, rural_town, coastal, etc.')],
        [C('2 new property types', True), C('PT-11: Two-generation House / Duplex. PT-12: Multi-generational House / Dual-Occupancy.')],
        [C('2 new renovation features', True), C('RF-35: Parking space expansion. RF-36: Garden trees trimmed/cleared.')],
        [C('New sheet available', True), C('Land & Building Details: 39 items across 14 categories (structure type, stories, land rights, zoning, road access, warranty, minpaku). Ready for future property detail pages.')],
    ]
    t = Table(tax, colWidths=[W*0.28, W*0.72])
    t.setStyle(TableStyle(bstyle(SUGI_DEEP) + alt(len(tax)) + [
        ('LINEAFTER', (0,0),(0,-1), 0.2, BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        'Live at japanoma.vercel.app/quiz. Scoring weights can be adjusted without '
        'rebuilding the platform.',
        s_ca
    ))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-25', s_fo))

    doc.build(story)
    print(f'PDF: {OUTPUT}')

if __name__ == '__main__':
    build()
