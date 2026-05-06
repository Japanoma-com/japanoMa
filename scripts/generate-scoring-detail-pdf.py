#!/usr/bin/env python3
"""Detailed Quiz Scoring PDF with sensitivity analysis."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

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
WASHI = HexColor('#F5F0E8')

OUTPUT = '/Users/craefto/Desktop/Japanoma-Scoring-Deep-Dive.pdf'

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Satoshi', '/Users/craefto/Desktop/Japa-Tak/src/fonts/Satoshi-Variable.ttf'))
    F = 'Satoshi'
except:
    F = 'Helvetica'

# Styles
ov = ParagraphStyle('ov', fontName=F, fontSize=8, textColor=SUGI, leading=10, spaceAfter=2*mm)
ti = ParagraphStyle('ti', fontName=F, fontSize=26, textColor=SUMI, leading=32, spaceAfter=3*mm)
t2 = ParagraphStyle('t2', fontName=F, fontSize=18, textColor=STONE, leading=24, spaceAfter=6*mm)
h2 = ParagraphStyle('h2', fontName=F, fontSize=16, textColor=SUMI, leading=22, spaceBefore=7*mm, spaceAfter=3*mm)
h3 = ParagraphStyle('h3', fontName=F, fontSize=12, textColor=SUMI, leading=16, spaceBefore=5*mm, spaceAfter=2.5*mm)
bo = ParagraphStyle('bo', fontName=F, fontSize=10, textColor=SUMI_LIGHT, leading=17, spaceAfter=3*mm)
bb = ParagraphStyle('bb', fontName=F, fontSize=10, textColor=SUMI, leading=17, spaceAfter=3*mm)
ca = ParagraphStyle('ca', fontName=F, fontSize=8.5, textColor=STONE, leading=13, spaceAfter=2*mm)
fo = ParagraphStyle('fo', fontName=F, fontSize=7, textColor=STONE, alignment=TA_CENTER)
th = ParagraphStyle('th', fontName=F, fontSize=8.5, textColor=KINU, leading=12)
td = ParagraphStyle('td', fontName=F, fontSize=9, textColor=SUMI_LIGHT, leading=13)
tb = ParagraphStyle('tb', fontName=F, fontSize=9, textColor=SUMI, leading=13)
bg = ParagraphStyle('bg', fontName=F, fontSize=32, textColor=SUGI, alignment=TA_CENTER, leading=36)
sc = ParagraphStyle('sc', fontName=F, fontSize=8, textColor=STONE, alignment=TA_CENTER, leading=11)
hl = ParagraphStyle('hl', fontName=F, fontSize=11, textColor=SUMI, leading=15)

TH = lambda t: Paragraph(f'<b>{t}</b>', th)
C = lambda t, b=False: Paragraph(t, tb if b else td)

def bs(hc):
    return [
        ('BACKGROUND',(0,0),(-1,0),hc),('TEXTCOLOR',(0,0),(-1,0),KINU),
        ('LINEBELOW',(0,0),(-1,0),0.75,hc),('LINEBELOW',(0,-1),(-1,-1),0.4,BORDER),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]
def ar(n):
    return [('BACKGROUND',(0,i),(-1,i),SHOJI if i%2==0 else KINU) for i in range(1,n)]

# Score bar helper
def score_bar(score, max_score=25, width=80):
    """Returns a small inline score visualization."""
    pct = score / max_score
    filled = int(pct * width)
    color = '#4A6B52' if score/max_score >= 0.75 else '#9B7B4F' if score/max_score >= 0.5 else '#8A8279'
    return f'<font color="{color}"><b>{score}</b></font>'

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=18*mm)
    W = A4[0] - 44*mm
    story = []

    # ═══ PAGE 1: COVER ═══
    story.append(Spacer(1, 20*mm))
    story.append(Paragraph('JAPANOMA', ov))
    story.append(Paragraph('Scoring Deep Dive', ti))
    story.append(Paragraph('What Moves the Numbers', t2))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        'This document breaks down exactly how quiz answers affect scores, '
        'which factors create the biggest swings, and what buyers can do '
        'to find their strongest match. Written for non-technical stakeholders.',
        bo
    ))
    story.append(Spacer(1, 6*mm))

    # Score composition visual
    comp = [
        [Paragraph('<b>25</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUGI, alignment=TA_CENTER, leading=26)),
         Paragraph('<b>25</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUGI, alignment=TA_CENTER, leading=26)),
         Paragraph('<b>15</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUGI, alignment=TA_CENTER, leading=26)),
         Paragraph('<b>15</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUGI, alignment=TA_CENTER, leading=26)),
         Paragraph('<b>20</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUGI, alignment=TA_CENTER, leading=26)),
         Paragraph('<b>= 100</b>', ParagraphStyle('', fontName=F, fontSize=22, textColor=SUMI, alignment=TA_CENTER, leading=26))],
        [Paragraph('Purpose', sc), Paragraph('Proximity', sc),
         Paragraph('Property<br/>Type', sc), Paragraph('Budget', sc),
         Paragraph('Priority', sc), Paragraph('Total', sc)],
    ]
    t = Table(comp, colWidths=[W/6]*6)
    t.setStyle(TableStyle([
        ('ALIGN',(0,0),(-1,-1),'CENTER'),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LINEAFTER',(0,0),(-2,-1),0.5,BORDER),
        ('BACKGROUND',(5,0),(5,1),SHOJI),
    ]))
    story.append(t)

    story.append(Spacer(1, 8*mm))

    # Key insight box
    insight = [
        [Paragraph(
            '<b>Key Insight:</b> Ski Season (Step 2) creates the biggest score swing at 17 points. '
            'A Weekend Warrior and a Full Season buyer looking at the same area will differ by up to 17 points. '
            'Purpose (Step 1) is the second biggest factor at 10 points.', bo
        )],
    ]
    t = Table(insight, colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),SHOJI),
        ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),
        ('BOX',(0,0),(-1,-1),0.5,SUGI),
    ]))
    story.append(t)

    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-26', fo))

    story.append(PageBreak())

    # ═══ PAGE 2: WHAT SWINGS SCORES MOST ═══
    story.append(Paragraph('SENSITIVITY ANALYSIS', ov))
    story.append(Paragraph('What Moves Scores Most', h2))
    story.append(Paragraph(
        'Each dimension has a different range of possible scores. The wider the range, '
        'the more that answer matters. Here\u2019s the impact of each, ranked by influence.',
        bo
    ))

    swing = [
        [TH('#'), TH('Factor'), TH('Min'), TH('Max'), TH('Swing'), TH('Impact'), TH('What This Means')],
        [C('1', True), C('Ski Season', True), C('8'), C('25'),
         Paragraph('<b><font color="#8B3A3A">17 pts</font></b>', tb),
         Paragraph('<b><font color="#8B3A3A">Highest</font></b>', tb),
         C('A Full Season buyer scores 17 more points than a Weekend Warrior at the same area. This is the single biggest differentiator.')],
        [C('2', True), C('Purpose', True), C('15'), C('25'),
         Paragraph('<b><font color="#A67B3D">10 pts</font></b>', tb),
         Paragraph('<b><font color="#A67B3D">High</font></b>', tb),
         C('Ski Base and Lifestyle+Income score 25 for ski resort areas. Year-Round Living only scores 15. Purpose sets the baseline.')],
        [C('3', True), C('Property Type', True), C('8'), C('15'),
         Paragraph('<b><font color="#9B7B4F">7 pts</font></b>', tb),
         Paragraph('<b><font color="#9B7B4F">Medium</font></b>', tb),
         C('Detached houses and akiya score highest (15) in ski resort areas. Apartments and land score 8\u201312. Moderate influence.')],
        [C('4', True), C('Priority', True), C('10'), C('20'),
         Paragraph('<b><font color="#9B7B4F">5\u201310 pts</font></b>', tb),
         Paragraph('<b><font color="#9B7B4F">Medium</font></b>', tb),
         C('"Closest to Slopes" scores 17\u201320 for areas with shuttle buses or short drives. Other priorities score 10\u201312. Depends on city data.')],
        [C('5', True), C('Budget', True), C('10'), C('15'),
         Paragraph('<b><font color="#8A8279">5 pts</font></b>', tb),
         Paragraph('<b><font color="#8A8279">Low</font></b>', tb),
         C('Budget has the smallest swing. Most tiers score 14\u201315. Only "Under \u00a515M" dips to 10. Budget rarely changes rankings.')],
    ]
    t = Table(swing, colWidths=[7*mm, W*0.13, 9*mm, 9*mm, 14*mm, 14*mm, W - 7*mm - W*0.13 - 9*mm - 9*mm - 14*mm - 14*mm])
    t.setStyle(TableStyle(bs(SUMI) + ar(len(swing)) + [
        ('LINEAFTER',(0,0),(-2,-1),0.2,BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 5*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>In Plain Language</b>', h3))
    plain = [
        [C('\u2022', True), C('<b>How often you ski</b> matters most. Frequent skiers are naturally better matched to our launch areas because proximity becomes critical. This is by design \u2014 our P1 areas are ski country.', False)],
        [C('\u2022', True), C('<b>Why you\u2019re buying</b> sets the foundation. Ski Base buyers start with 25 points in purpose. Year-Round Living buyers start with 15. The gap reflects genuine fit, not bias.', False)],
        [C('\u2022', True), C('<b>Budget barely matters</b> for ranking. A buyer at \u00a515M and a buyer at \u00a550M looking at the same area will score within 5 points of each other. Budget is about reality, not fit.', False)],
        [C('\u2022', True), C('<b>Property type is the tiebreaker</b>. When two areas score close on everything else, the buyer\u2019s preferred property type creates the separation.', False)],
    ]
    t = Table(plain, colWidths=[8*mm, W-8*mm])
    t.setStyle(TableStyle([
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('TEXTCOLOR',(0,0),(0,-1),SUGI),
        ('LINEBELOW',(0,0),(-1,-2),0.3,BORDER),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ═══ PAGE 3: DIMENSION DETAIL ═══
    story.append(Paragraph('DIMENSION DETAIL', ov))
    story.append(Paragraph('How Each Step Scores', h2))

    # Purpose detail
    story.append(Paragraph('<b>Step 1: Purpose (max 25 points)</b>', h3))
    story.append(Paragraph(
        'Each purpose has an affinity score for each area type. Since all 13 launch cities '
        'are ski resort areas, here are the purpose scores for ski_resort:',
        bo
    ))
    purp = [
        [TH('Answer'), TH('Score'), TH('Why')],
        [C('Ski Base', True), C('25'), C('Perfect alignment. Ski resort areas are built for this purpose.')],
        [C('Lifestyle + Income', True), C('25'), C('Strong alignment. Ski areas support personal use + rental yield.')],
        [C('Holiday Home', True), C('22'), C('High alignment. Ski areas are natural holiday destinations for Australians.')],
        [C('Investment', True), C('22'), C('Good alignment. Ski areas have rental demand and capital growth potential.')],
        [C('Year-Round Living', True), C('15'), C('Moderate. Ski resort areas are seasonal. Year-round buyers may prefer onsen or rural towns.')],
    ]
    t = Table(purp, colWidths=[W*0.22, 12*mm, W - W*0.22 - 12*mm])
    t.setStyle(TableStyle(bs(SUGI_DEEP) + ar(len(purp)) + [('LINEAFTER',(0,0),(-2,-1),0.2,BORDER)]))
    story.append(t)

    # Season detail
    story.append(Paragraph('<b>Step 2: Ski Season (max 25 points)</b>', h3))
    story.append(Paragraph(
        'Proximity matters more for frequent skiers. The season answer sets a weight, '
        'then the city\u2019s drive time determines the percentage received:',
        bo
    ))
    seas = [
        [TH('Answer'), TH('Weight'), TH('\u226415 min'), TH('\u226425 min'), TH('\u226435 min'), TH('35+ min')],
        [C('Full Season (30+)', True), C('25'), C('25 (100%)'), C('20 (80%)'), C('16 (65%)'), C('12 (50%)')],
        [C('Season Regular (15\u201330)', True), C('22'), C('22'), C('18'), C('14'), C('11')],
        [C('Annual Pilgrimage (7\u201314)', True), C('15'), C('15'), C('12'), C('10'), C('8')],
        [C('Weekend Warrior (2\u20135)', True), C('8'), C('8'), C('6'), C('5'), C('4')],
    ]
    t = Table(seas, colWidths=[W*0.26, 14*mm, (W-W*0.26-14*mm)/4]*4 + [(W-W*0.26-14*mm)/4])
    # Fix: proper column widths
    col_w = (W - W*0.26 - 14*mm) / 4
    t = Table(seas, colWidths=[W*0.26, 14*mm, col_w, col_w, col_w, col_w])
    t.setStyle(TableStyle(bs(AI) + ar(len(seas)) + [('LINEAFTER',(0,0),(-2,-1),0.2,BORDER)]))
    story.append(t)

    story.append(Paragraph(
        'Example: Myoko is 15 min to slopes. A Full Season buyer scores 25. A Weekend Warrior scores 8. '
        'That\u2019s a 17-point difference from one answer.',
        ca
    ))

    # Priority detail
    story.append(Paragraph('<b>Step 6: Priority (max 20 points)</b>', h3))
    story.append(Paragraph(
        'Priority scoring depends on the specific city\u2019s attributes:',
        bo
    ))
    prio = [
        [TH('Answer'), TH('20 pts'), TH('17 pts'), TH('14 pts'), TH('10\u201312 pts')],
        [C('Closest to Slopes', True), C('\u226415 min drive'), C('Has shuttle bus'), C('\u226430 min drive'), C('30+ min')],
        [C('Onsen Culture', True), C('Onsen town'), C('\u2014'), C('\u2014'), C('All other types')],
        [C('Affordability', True), C('Low priority area'), C('\u2014'), C('Medium priority'), C('High priority')],
        [C('Year-Round Life', True), C('Onsen or lakeside'), C('Rural or mountain'), C('\u2014'), C('Ski resort')],
    ]
    t = Table(prio, colWidths=[W*0.2, W*0.2, W*0.2, W*0.2, W*0.2])
    t.setStyle(TableStyle(bs(KOHAKU) + ar(len(prio)) + [('LINEAFTER',(0,0),(-2,-1),0.2,BORDER)]))
    story.append(t)

    story.append(Paragraph(
        'Since all P1 launch areas are ski resorts, "Closest to Slopes" is the only priority '
        'that can score 17\u201320 (via shuttle bus or short drive). Other priorities score 12 '
        'for ski resort areas. This will diversify as we add onsen and rural P2 areas.',
        ca
    ))

    story.append(PageBreak())

    # ═══ PAGE 4: SCORE RANGES + WHAT IT MEANS ═══
    story.append(Paragraph('REALISTIC OUTCOMES', ov))
    story.append(Paragraph('What Buyers Actually See', h2))
    story.append(Paragraph(
        'Based on the scoring model, here are the realistic score ranges for different buyer profiles '
        'across our 13 P1 launch cities.',
        bo
    ))

    ranges = [
        [TH('Buyer Profile'), TH('Best Area'), TH('Score Range'), TH('Label')],
        [C('Full-season ski enthusiast\nSki Base + Full Season + Slopes', True),
         C('Myoko or Minamiuonuma'),
         Paragraph('<b><font color="#4A6B52">87 \u2013 95</font></b>', tb),
         C('Strong match')],
        [C('Annual holiday family\nHoliday + Annual + Detached', True),
         C('Myoko or Minamiuonuma'),
         Paragraph('<b><font color="#4A6B52">77 \u2013 85</font></b>', tb),
         C('Strong match')],
        [C('Lifestyle + rental investor\nLifestyle+Income + Regular + Slopes', True),
         C('Myoko or Shimotakai'),
         Paragraph('<b><font color="#4A6B52">80 \u2013 90</font></b>', tb),
         C('Strong match')],
        [C('Weekend casual buyer\nHoliday + Weekend + Affordable', True),
         C('Myoko or Minamiuonuma'),
         Paragraph('<b><font color="#9B7B4F">62 \u2013 72</font></b>', tb),
         C('Good fit')],
        [C('Year-round retiree\nYear-Round + Weekend + Four Seasons', True),
         C('Myoko (closest shuttle)'),
         Paragraph('<b><font color="#9B7B4F">55 \u2013 65</font></b>', tb),
         C('Worth exploring')],
    ]
    t = Table(ranges, colWidths=[W*0.35, W*0.22, W*0.2, W*0.23])
    t.setStyle(TableStyle(bs(MATSU) + ar(len(ranges)) + [('LINEAFTER',(0,0),(-2,-1),0.2,BORDER)]))
    story.append(t)

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        'The year-round retiree scores lowest because our P1 launch areas are ski-focused. '
        'When P2 areas launch (onsen towns, rural villages), year-round buyers will see '
        'scores in the 75\u201385 range. This is intentional: the quiz is honest about fit.',
        ca
    ))

    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>Score Guarantee</b>', h3))
    guarantee = [
        [C('\u2713', True), C('The top result for any answer combination scores at least 55.')],
        [C('\u2713', True), C('Ski-focused buyers (Ski Base or Lifestyle+Income, Regular or Full Season) always see at least one 75+ Strong Match.')],
        [C('\u2713', True), C('No answer combination produces a discouraging result. Every buyer sees areas worth exploring.')],
        [C('\u2713', True), C('Scores reflect genuine fit, not artificial inflation. A 65 is honest, not a failure.')],
    ]
    t = Table(guarantee, colWidths=[8*mm, W-8*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),SHOJI),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('TEXTCOLOR',(0,0),(0,-1),MATSU),
        ('LINEBELOW',(0,0),(-1,-2),0.3,BORDER),
    ]))
    story.append(t)

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>Future: How Scores Will Evolve</b>', h3))
    story.append(Paragraph(
        'As Go&C expands from 13 P1 cities to 20 P2 and 39 P3 areas, the scoring becomes '
        'richer. P2 includes onsen towns, rural villages, and Hokkaido resorts. Buyers who '
        'currently score lower (year-round, affordable, onsen priority) will find stronger '
        'matches. The algorithm doesn\u2019t need to change \u2014 more diverse areas naturally '
        'produce more diverse scores.',
        bo
    ))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('Japanoma \u00b7 Craefto \u00b7 Confidential \u00b7 2026-03-26', fo))

    doc.build(story)
    print(f'PDF: {OUTPUT}')

if __name__ == '__main__':
    build()
