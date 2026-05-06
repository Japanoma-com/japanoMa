#!/usr/bin/env python3
"""
Japanoma — Katitas Technical Spec.

Reference specification for Katitas engineering, via Go&C Partners.
Field tables, sync protocol, referral URL format, auth. No commercial context.

Output: docs/Japanoma-Katitas-Technical-Spec.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
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
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

# Design tokens -------------------------------------------------------------

SUMI = HexColor("#1A1816")
SUMI_LIGHT = HexColor("#3D3833")
STONE = HexColor("#8A8279")
WASHI = HexColor("#F5F0E8")
SHOJI = HexColor("#FAFAF7")
BORDER = HexColor("#E5E0D8")
SUGI = HexColor("#9B7B4F")
AI = HexColor("#3D5A7A")

PAGE_W, PAGE_H = A4
MARGIN_L = 1.8 * cm
MARGIN_R = 1.8 * cm
MARGIN_T = 2.0 * cm
MARGIN_B = 2.0 * cm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = PROJECT_ROOT / "docs" / "Japanoma-Katitas-Technical-Spec.pdf"
TOTAL_PAGES = 11  # recomputed after build; see main()
VERSION = "DRAFT V2  ·  APRIL 2026"
HEADER_OVERLINE = "JAPANOMA  ·  KATITAS TECHNICAL SPEC"
FOOTER_L = "For Katitas engineering  ·  via Go&C Partners"

SATOSHI_PATH = PROJECT_ROOT / "src" / "fonts" / "Satoshi-Variable.ttf"
try:
    pdfmetrics.registerFont(TTFont("Satoshi", str(SATOSHI_PATH)))
    UI = "Satoshi"
except Exception:
    UI = "Helvetica"

SERIF = "Times-Roman"
SERIF_IT = "Times-Italic"
MONO = "Courier"

# Styles --------------------------------------------------------------------

SECTION = ParagraphStyle("Section", fontName=UI, fontSize=7.5, leading=11,
                         textColor=SUGI, spaceBefore=2, spaceAfter=4)
H1 = ParagraphStyle("H1", fontName=SERIF, fontSize=20, leading=26, textColor=SUMI,
                    spaceBefore=0, spaceAfter=8)
H3 = ParagraphStyle("H3", fontName=UI, fontSize=9.5, leading=13, textColor=SUMI,
                    spaceBefore=6, spaceAfter=4)
BODY = ParagraphStyle("Body", fontName=UI, fontSize=9, leading=14,
                      textColor=SUMI_LIGHT, spaceAfter=6)
SUB = ParagraphStyle("Sub", fontName=SERIF_IT, fontSize=11, leading=16,
                     textColor=STONE, spaceAfter=12)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=12, bulletIndent=0,
                        spaceAfter=3)
CODE = ParagraphStyle("Code", fontName=MONO, fontSize=7.8, leading=11,
                      textColor=SUMI, spaceAfter=6)


def _hairline(c: Canvas, y: float, color=BORDER, width=0.3):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)


def every_page(c: Canvas, doc):
    c.saveState()
    c.setFont(UI, 7)
    c.setFillColor(SUGI)
    c.drawString(MARGIN_L, PAGE_H - 1.2 * cm, HEADER_OVERLINE)
    c.setFillColor(STONE)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.2 * cm, VERSION)
    _hairline(c, PAGE_H - 1.4 * cm)
    _hairline(c, 1.4 * cm)
    c.setFont(UI, 7)
    c.setFillColor(STONE)
    c.drawString(MARGIN_L, 0.95 * cm, FOOTER_L)
    c.setFillColor(SUMI)
    c.drawRightString(PAGE_W - MARGIN_R, 0.95 * cm,
                      f"{doc.page:02d} / {TOTAL_PAGES:02d}")
    c.restoreState()


def p(text, style=BODY):
    return Paragraph(text, style)


def bullets(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=10, value="disc") for t in items],
        bulletType="bullet", start="disc", bulletFontName=UI,
        bulletFontSize=5.5, leftIndent=12, bulletColor=SUGI,
    )


def code_block(text, label=None):
    inner = []
    if label:
        inner.append(Paragraph(
            label.upper(),
            ParagraphStyle("CL", fontName=UI, fontSize=6.5, textColor=STONE,
                           leading=10, spaceAfter=4),
        ))
    for line in text.splitlines():
        safe = (line.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace(" ", "&nbsp;"))
        if not safe:
            safe = "&nbsp;"
        inner.append(Paragraph(safe, CODE))
    t = Table([[inner]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SHOJI),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def callout(title, body_text, tone=SUGI):
    inner = [
        Paragraph(title.upper(),
                  ParagraphStyle("CT", fontName=UI, fontSize=7, textColor=tone,
                                 leading=11, spaceAfter=3)),
        Paragraph(body_text,
                  ParagraphStyle("CB", fontName=UI, fontSize=9, textColor=SUMI,
                                 leading=14)),
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


def fact_row(items):
    cells = []
    for label, value in items:
        cells.append([
            Paragraph(label.upper(),
                      ParagraphStyle("FL", fontName=UI, fontSize=6.5,
                                     textColor=STONE, leading=9, spaceAfter=3)),
            Paragraph(value,
                      ParagraphStyle("FV", fontName=SERIF, fontSize=11.5,
                                     textColor=SUMI, leading=15)),
        ])
    col_w = (PAGE_W - MARGIN_L - MARGIN_R) / len(items)
    t = Table([cells], colWidths=[col_w] * len(items))
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, SUMI),
        ("LINEBELOW", (0, 0), (-1, 0), 0.3, BORDER),
    ]))
    return t


def schema_table(rows, widths):
    header_style = ParagraphStyle("DTH", fontName=UI, fontSize=6.5,
                                  textColor=STONE, leading=9)
    cell_style = ParagraphStyle("DTC", fontName=UI, fontSize=8,
                                textColor=SUMI_LIGHT, leading=12)
    name_style = ParagraphStyle("DTN", fontName=MONO, fontSize=8,
                                textColor=SUMI, leading=12)
    type_style = ParagraphStyle("DTT", fontName=MONO, fontSize=7.5,
                                textColor=STONE, leading=11)
    data = [[Paragraph(h, header_style) for h in rows[0]]]
    for row in rows[1:]:
        data.append([
            Paragraph(row[0], name_style),
            Paragraph(row[1], type_style),
            Paragraph(f'<b>{row[2]}</b>', cell_style),
            Paragraph(row[3], cell_style),
        ])
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


# Content -------------------------------------------------------------------

def build_story():
    s = []

    # Page 1
    s.append(p("KATITAS TECHNICAL SPEC  ·  01", SECTION))
    s.append(p("Japanoma &harr; Katitas integration spec.", H1))
    s.append(p("Reference specification for engineering. Field tables, sync "
               "protocol, URL format, and auth. No commercial context.", SUB))
    s.append(fact_row([
        ("Model", "Read-only referral<br/>(one-way, pull)"),
        ("Direction", "Katitas &rarr; Japanoma<br/>(listing feed)"),
        ("Refresh", "Daily delta<br/>+ weekly full"),
    ]))
    s.append(fact_row([
        ("Regions", "Nagano, Niigata,<br/>Hokkaido"),
        ("Volume", "Low thousands<br/>of active listings"),
        ("User PII flow", "None<br/>(opaque IDs only)"),
    ]))
    s.append(Spacer(1, 10))
    s.append(p("SCOPE", SECTION))
    s.append(p("Japanoma pulls a filtered subset of active Katitas listings, "
               "indexes them locally, runs a matching algorithm against "
               "signed-in user profiles, and surfaces 3&ndash;5 best-fit matches "
               "per user. Each match deep-links back to the canonical Katitas "
               "listing URL. No user data is sent to Katitas; no Katitas customer "
               "data is pulled."))
    s.append(p("OUT OF SCOPE", SECTION))
    s.append(bullets([
        "Full listing re-display, including full photo sets and full descriptions.",
        "Image caching or re-hosting on Japanoma&rsquo;s CDN.",
        "Redistribution of the feed to third parties.",
        "Any user PII transfer in either direction.",
        "Real-time or sub-hourly sync.",
        "Writes back into the Katitas system.",
    ]))
    s.append(p("WHAT KATITAS MUST PROVIDE", SECTION))
    s.append(bullets([
        "One of the three data access methods on page 2.",
        "The full listing schema on pages 3&ndash;4, or the minimum viable subset.",
        "A stable <font face='%s'>listing_id</font> and a reliable "
        "<font face='%s'>updated_at</font> timestamp." % (MONO, MONO),
        "A sandbox or sample payload for build-phase testing.",
        "A named engineering contact for the implementation window and ongoing support.",
    ]))
    s.append(p("WHAT JAPANOMA COMMITS TO", SECTION))
    s.append(bullets([
        "A single technical point of contact (Craefto) for the duration of the integration.",
        "No more than the specified sync rate against the Katitas endpoint.",
        "Same-day takedown of any listing Katitas requests we remove.",
        "Attribution (&ldquo;via Katitas&rdquo;) on every match card that uses Katitas data.",
        "No storage of any listing fields beyond those on pages 3&ndash;4.",
    ]))
    s.append(PageBreak())

    # Page 2
    s.append(p("KATITAS TECHNICAL SPEC  ·  02", SECTION))
    s.append(p("Data access.", H1))
    s.append(p("OPTION A  ·  AUTHENTICATED REST API (PREFERRED)", SECTION))
    s.append(p("Read-only HTTPS endpoint returning JSON. Japanoma authenticates "
               "with a shared API key in the <font face='%s'>Authorization</font> "
               "header. Supports pagination and delta queries." % MONO))
    s.append(code_block(
        "GET https://api.katitas.jp/v1/listings\n"
        "    ?region=nagano,niigata,hokkaido\n"
        "    &status=active\n"
        "    &updated_since=2026-04-09T00:00:00Z\n"
        "    &page=1\n"
        "    &per_page=100\n"
        "\n"
        "Authorization: Bearer <API_KEY>\n"
        "Accept: application/json\n"
        "\n"
        "Response 200 OK:\n"
        "{\n"
        "    \"data\": [ { ...listing object... }, ... ],\n"
        "    \"pagination\": {\n"
        "        \"page\": 1,\n"
        "        \"per_page\": 100,\n"
        "        \"total\": 847,\n"
        "        \"next_page\": 2\n"
        "    }\n"
        "}",
        label="Example delta query (illustrative — final URL TBD by Katitas)",
    ))
    s.append(p("OPTION B  ·  STRUCTURED FEED VIA SFTP OR S3", SECTION))
    s.append(p("Katitas drops a full daily snapshot (JSON or XML) to an agreed "
               "SFTP server or private S3 bucket. Japanoma pulls on a cron, diffs "
               "against the previous snapshot, and updates the local index. Same "
               "schema as Option A."))
    s.append(code_block(
        "Path:         sftp://feeds.katitas.jp/japanoma/YYYY-MM-DD/listings.json\n"
        "Auth:         SSH key, Japanoma public key added to ~/.ssh/authorized_keys\n"
        "File format:  UTF-8 JSON, one array of listing objects\n"
        "Size est:     < 10 MB uncompressed for the full snapshot",
        label="Feed delivery",
    ))
    s.append(p("OPTION C  ·  WEEKLY CSV BY EMAIL (BRIDGE ONLY)", SECTION))
    s.append(p("Katitas emails a weekly CSV to a designated Japanoma address. "
               "Japanoma manually ingests. Acceptable only as a 90-day bridge "
               "while Option A or B is being built. Same field set as pages "
               "3&ndash;4, one row per listing, UTF-8 with a header row."))
    s.append(callout(
        "Preference order",
        "A &gt; B &gt; C. Option A is chosen whenever Katitas can support it. "
        "Option B is operationally simpler but puts delta detection on "
        "Japanoma&rsquo;s side. Option C is a fallback only.",
    ))
    s.append(PageBreak())

    # Page 3
    s.append(p("KATITAS TECHNICAL SPEC  ·  03", SECTION))
    s.append(p("Listing schema.", H1))
    s.append(p("IDENTITY  ·  LOCATION", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["listing_id", "string", "Req",
             "Stable, unique, permanent identifier. Primary key in our index. "
             "Must not change across updates or re-listings."],
            ["canonical_url", "string (URL)", "Req",
             "HTTPS URL of the Katitas listing page. Deep-link target for user "
             "jump-off."],
            ["prefecture", "string", "Req",
             "Prefecture name (Japanese or romaji) or ISO-like code. Used for "
             "region filtering."],
            ["city", "string", "Req",
             "City name (Japanese or romaji). Drives city-level matching against "
             "quiz recommendations."],
            ["address_line", "string", "Opt",
             "Full street address. Not user-facing; used only for disambiguation."],
            ["lat", "number", "Pref",
             "Latitude in decimal degrees. Enables distance-to-ski-lift scoring."],
            ["lng", "number", "Pref",
             "Longitude in decimal degrees."],
        ],
        widths=[3.0 * cm, 3.0 * cm, 1.5 * cm, 9.5 * cm],
    ))
    s.append(Spacer(1, 8))
    s.append(p("PROPERTY ATTRIBUTES", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["property_type", "enum (string)", "Req",
             "One of: detached_house | apartment | land | mixed_use | other. "
             "Katitas&rsquo;s native taxonomy is also acceptable — Japanoma will "
             "map it."],
            ["condition", "enum (string)", "Req",
             "One of: as_is | livable | light_reno | major_reno | new_build. "
             "Katitas&rsquo;s native taxonomy acceptable."],
            ["year_built", "integer", "Pref",
             "Four-digit year. Null if unknown."],
            ["land_area_sqm", "number", "Pref",
             "Land area in square metres. Null if not applicable."],
            ["building_area_sqm", "number", "Pref",
             "Total building floor area in square metres."],
            ["layout", "string", "Opt",
             "Room layout code, e.g. &ldquo;3LDK&rdquo;, &ldquo;4LDK&rdquo;."],
        ],
        widths=[3.6 * cm, 3.0 * cm, 1.5 * cm, 8.9 * cm],
    ))
    s.append(PageBreak())

    # Page 4
    s.append(p("KATITAS TECHNICAL SPEC  ·  04", SECTION))
    s.append(p("Listing schema, continued.", H1))
    s.append(p("COMMERCIAL", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["asking_price_jpy", "integer", "Req",
             "Current asking price in Japanese yen (not formatted, no commas)."],
            ["price_currency", "string", "Req",
             "Always &ldquo;JPY&rdquo; for Katitas. Explicit for schema portability."],
            ["listing_agent_name", "string", "Pref",
             "Katitas office or agent name. Internal use only, not user-facing."],
        ],
        widths=[3.6 * cm, 3.0 * cm, 1.5 * cm, 8.9 * cm],
    ))
    s.append(Spacer(1, 6))
    s.append(p("MEDIA", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["hero_image_url", "string (URL)", "Req",
             "Single primary image URL on a Katitas-controlled domain. "
             "Hot-linked on match cards with &ldquo;via Katitas&rdquo; "
             "attribution. Not cached or re-hosted."],
            ["image_alt_text", "string", "Opt",
             "Alt text for accessibility. Falls back to listing title if absent."],
        ],
        widths=[3.6 * cm, 3.0 * cm, 1.5 * cm, 8.9 * cm],
    ))
    s.append(Spacer(1, 6))
    s.append(p("STATUS  ·  TIMESTAMPS", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["status", "enum (string)", "Req",
             "One of: active | under_offer | sold | withdrawn. Only "
             "&ldquo;active&rdquo; is surfaced to users."],
            ["listed_at", "string (ISO 8601)", "Pref",
             "When the listing first appeared. Drives a &ldquo;new this "
             "week&rdquo; badge."],
            ["updated_at", "string (ISO 8601)", "Req",
             "Last modification timestamp. This is the cursor for delta queries. "
             "Must bump on any field change."],
        ],
        widths=[3.6 * cm, 3.0 * cm, 1.5 * cm, 8.9 * cm],
    ))
    s.append(Spacer(1, 8))
    s.append(code_block(
        "{\n"
        "    \"listing_id\": \"KAT-2026-001234\",\n"
        "    \"canonical_url\": \"https://katitas.jp/listings/001234\",\n"
        "    \"prefecture\": \"nagano\",\n"
        "    \"city\": \"iiyama\",\n"
        "    \"address_line\": \"1234-5 Example-cho, Iiyama-shi\",\n"
        "    \"lat\": 36.8512,\n"
        "    \"lng\": 138.3661,\n"
        "    \"property_type\": \"detached_house\",\n"
        "    \"condition\": \"livable\",\n"
        "    \"year_built\": 1988,\n"
        "    \"land_area_sqm\": 412.5,\n"
        "    \"building_area_sqm\": 128.0,\n"
        "    \"layout\": \"4LDK\",\n"
        "    \"asking_price_jpy\": 12800000,\n"
        "    \"price_currency\": \"JPY\",\n"
        "    \"listing_agent_name\": \"Katitas Iiyama Office\",\n"
        "    \"hero_image_url\": \"https://img.katitas.jp/001234/hero.jpg\",\n"
        "    \"image_alt_text\": \"4LDK detached house in Iiyama\",\n"
        "    \"status\": \"active\",\n"
        "    \"listed_at\": \"2026-03-14T09:00:00+09:00\",\n"
        "    \"updated_at\": \"2026-04-08T11:42:31+09:00\"\n"
        "}",
        label="JSON payload — one listing",
    ))
    s.append(PageBreak())

    # Page 5
    s.append(callout(
        "Minimum viable subset",
        "<font face='%s'>listing_id</font>, <font face='%s'>canonical_url</font>, "
        "<font face='%s'>prefecture</font>, <font face='%s'>city</font>, "
        "<font face='%s'>property_type</font>, <font face='%s'>condition</font>, "
        "<font face='%s'>asking_price_jpy</font>, <font face='%s'>hero_image_url</font>, "
        "<font face='%s'>status</font>, <font face='%s'>updated_at</font>. Everything "
        "else improves match quality but is not blocking." % ((MONO,) * 10),
    ))
    s.append(PageBreak())

    # Page 6
    s.append(p("KATITAS TECHNICAL SPEC  ·  05", SECTION))
    s.append(p("Sync protocol.", H1))
    s.append(p("DAILY DELTA  ·  24-HOUR CADENCE", SECTION))
    s.append(p("Japanoma pulls all listings where <font face='%s'>updated_at &gt; "
               "last_successful_sync</font>. New records are inserted, existing "
               "records are upserted by <font face='%s'>listing_id</font>, records "
               "whose status flipped off &ldquo;active&rdquo; are immediately "
               "hidden from users." % (MONO, MONO)))
    s.append(p("WEEKLY FULL RECONCILIATION  ·  SUNDAY 03:00 JST", SECTION))
    s.append(p("Japanoma pulls the complete list of active listing IDs in the "
               "covered regions and diffs against the local index. Anything in "
               "the local index that is not in Katitas&rsquo;s current set is "
               "treated as delisted and removed. This catches missed deltas, "
               "silent deletes, and race conditions."))
    s.append(p("FRESHNESS SLA", SECTION))
    s.append(p("A listing is never surfaced to users if its <font face='%s'>"
               "updated_at</font> is older than 14 days without a verified "
               "re-fetch. In practice, match cards are at most 24 hours stale, "
               "typically under 12." % MONO))
    s.append(p("ERROR HANDLING", SECTION))
    s.append(bullets([
        "<b>Transient failure.</b> Retry with exponential backoff (1m, 5m, "
        "30m), up to 3 attempts within the same sync window. Continue serving "
        "the last successful snapshot if all retries fail.",
        "<b>Schema change.</b> Unknown fields are ignored. Missing required "
        "fields cause the affected listing to be skipped and logged. The sync "
        "continues for the remaining listings.",
        "<b>Authentication failure (401/403).</b> Immediate alert to Craefto "
        "and to Katitas&rsquo;s technical contact. No further retries until "
        "the credential is rotated or confirmed.",
        "<b>Rate limit (429).</b> Honour the <font face='%s'>Retry-After</font> "
        "header if present, otherwise back off for 30 minutes." % MONO,
        "<b>Server error (5xx).</b> Same exponential backoff as transient "
        "failure; escalate after three failed windows (72 hours).",
    ]))
    s.append(callout(
        "Katitas-side obligations for delta to work",
        "(1) <font face='%s'>updated_at</font> must bump on every change to any "
        "user-visible field. (2) <font face='%s'>status</font> must flip promptly "
        "on under-offer / sold / withdrawn. (3) <font face='%s'>listing_id</font> "
        "must remain stable for the life of the listing." % ((MONO,) * 3),
    ))
    s.append(PageBreak())

    # Page 7
    s.append(p("KATITAS TECHNICAL SPEC  ·  06", SECTION))
    s.append(p("Referral URL format.", H1))
    s.append(p("Every click from a Japanoma match card to a Katitas listing "
               "appends three sets of query parameters to the canonical URL. "
               "No user PII is transmitted."))
    s.append(code_block(
        "https://katitas.jp/listings/001234\n"
        "    ?ref=japanoma\n"
        "    &utm_source=japanoma\n"
        "    &utm_medium=referral\n"
        "    &utm_campaign=account_match\n"
        "    &japanoma_match_id=m_8f3b2c9d1e4a",
        label="Jump-off URL (line-broken for clarity — emitted as single URL)",
    ))
    s.append(p("PARAMETER SEMANTICS", SECTION))
    s.append(schema_table(
        [
            ["Field", "Type", "Req.", "Description"],
            ["ref", "string (const)", "Req",
             "Always &ldquo;japanoma&rdquo;. Primary analytics-agnostic source "
             "identifier."],
            ["utm_source", "string", "Req",
             "Always &ldquo;japanoma&rdquo;. Consumed by Katitas&rsquo;s existing "
             "analytics tool (GA, Adobe, etc.) without any integration work."],
            ["utm_medium", "string", "Req",
             "Always &ldquo;referral&rdquo;."],
            ["utm_campaign", "string", "Req",
             "Identifies the surface: &ldquo;account_match&rdquo; for curated "
             "matches in /account. Future surfaces get different values."],
            ["japanoma_match_id", "string", "Req",
             "Opaque, one-way identifier for the specific match. Katitas cannot "
             "use it to look up the user on Japanoma. Safe for outcome feedback."],
        ],
        widths=[3.6 * cm, 3.0 * cm, 1.5 * cm, 8.9 * cm],
    ))
    s.append(Spacer(1, 6))
    s.append(p("OPTIONAL OUTCOME FEEDBACK WEBHOOK", SECTION))
    s.append(p("If Katitas wants to close the loop for attribution, it can POST "
               "outcome events back to Japanoma using the opaque match ID. "
               "Entirely optional — not required for launch."))
    s.append(code_block(
        "POST https://api.japanoma.com/v1/partner/katitas/outcomes\n"
        "Authorization: Bearer <KATITAS_API_KEY>\n"
        "Content-Type: application/json\n"
        "\n"
        "{\n"
        "    \"match_id\": \"m_8f3b2c9d1e4a\",\n"
        "    \"event\": \"contacted\",\n"
        "    \"occurred_at\": \"2026-04-12T14:22:00+09:00\"\n"
        "}\n"
        "\n"
        "Valid event values: clicked | contacted | viewed | offered | sold",
        label="Webhook (optional)",
    ))
    s.append(PageBreak())

    # Page 8
    s.append(p("KATITAS TECHNICAL SPEC  ·  07", SECTION))
    s.append(p("Security, auth, residency.", H1))
    s.append(p("AUTHENTICATION  ·  API OPTION", SECTION))
    s.append(p("Bearer token in the <font face='%s'>Authorization</font> header. "
               "Katitas issues the key; Japanoma stores it in production "
               "environment variables only. Never committed to source control, "
               "never logged. Key rotation supported by re-issue and redeploy." % MONO))
    s.append(p("AUTHENTICATION  ·  SFTP / S3 OPTION", SECTION))
    s.append(bullets([
        "<b>SFTP:</b> SSH key-pair auth only. Japanoma provides its public key, "
        "Katitas installs it in <font face='%s'>~/.ssh/authorized_keys</font>. "
        "No password auth." % MONO,
        "<b>S3:</b> IAM role assumption or a dedicated IAM user with "
        "<font face='%s'>s3:GetObject</font> on the feed prefix only. "
        "Credentials in Japanoma&rsquo;s production environment variables." % MONO,
    ]))
    s.append(p("TRANSPORT", SECTION))
    s.append(p("HTTPS only (TLS 1.2+) for API calls. SFTP only (no FTP). S3 with "
               "TLS enforced at the bucket policy level."))
    s.append(p("NETWORK", SECTION))
    s.append(p("Japanoma&rsquo;s outbound calls originate from Vercel&rsquo;s "
               "edge network. Static IP allowlisting is possible via a proxy if "
               "Katitas requires it; preference is bearer-token auth without "
               "allowlisting to avoid the proxy hop."))
    s.append(p("DATA RESIDENCY", SECTION))
    s.append(p("Japanoma&rsquo;s database is Supabase in the Sydney region "
               "(<font face='%s'>ap-southeast-2</font>). Listing records ingested "
               "from Katitas are stored there. Listings contain no personal "
               "information — only property descriptions, prices, and media URLs "
               "— so APPI&rsquo;s cross-border personal-data transfer provisions "
               "do not apply to the feed data." % MONO))
    s.append(p("TAKEDOWN", SECTION))
    s.append(p("Any listing whose status flips to sold, under_offer, or withdrawn "
               "in the Katitas feed is removed from user-facing surfaces within "
               "24 hours (next sync window). Emergency takedown of any specific "
               "listing within one business day by email to Craefto."))
    s.append(p("SECRET MANAGEMENT  ·  JAPANOMA SIDE", SECTION))
    s.append(bullets([
        "All Katitas credentials stored in Vercel environment variables with "
        "production scope only.",
        "Credentials never appear in logs, error reports, or Sentry breadcrumbs.",
        "Rotation supported by issuing a new credential and redeploying with the "
        "updated env var; the old credential can be revoked immediately after.",
        "Access to production env vars limited to Craefto&rsquo;s technical lead.",
    ]))
    s.append(PageBreak())

    # Page 9 — region coverage bullet removed per Kaz 2026-04-15
    s.append(p("KATITAS TECHNICAL SPEC  ·  08", SECTION))
    s.append(p("Open items for Katitas to confirm.", H1))
    s.append(p("Items Katitas must answer to unblock implementation. Grouped by "
               "urgency.", BODY))
    s.append(p("BLOCKING  ·  NEEDED BEFORE BUILD STARTS", SECTION))
    s.append(bullets([
        "<b>Data access method.</b> Which of Option A, B, or C on page 2 can "
        "Katitas commit to?",
        "<b>Schema coverage.</b> Can Katitas provide the full schema on pages "
        "3&ndash;4, or only the minimum viable subset? Any fields Katitas cannot "
        "provide at all?",
        "<b>Stable listing_id.</b> Does Katitas&rsquo;s internal catalogue "
        "already have stable, unique IDs per listing that survive updates and "
        "re-listings?",
        "<b>updated_at timestamp.</b> Does every listing record have a reliable "
        "last-modified timestamp that bumps on any field change?",
        "<b>Technical contact.</b> A named Katitas engineer as the primary "
        "technical point for the implementation window and ongoing support.",
    ]))
    s.append(p("IMPORTANT  ·  NEEDED BEFORE GO-LIVE", SECTION))
    s.append(bullets([
        "<b>Sandbox or sample payload.</b> A non-production endpoint (Option A) "
        "or a sample snapshot file (Option B/C) to build and validate against.",
        "<b>Rate limit.</b> Maximum requests per minute or per hour Japanoma is "
        "permitted against the endpoint.",
        "<b>Server maintenance window.</b> So Japanoma can schedule the weekly "
        "reconciliation outside Katitas&rsquo;s maintenance slot.",
        "<b>Excluded listing categories.</b> Any segments (restricted, "
        "off-market, agent-reserved) that should be filtered out of the feed "
        "regardless of the region filter.",
        "<b>Hot-link permission for hero images.</b> Explicit confirmation that "
        "Japanoma may hot-link the <font face='%s'>hero_image_url</font> with "
        "&ldquo;via Katitas&rdquo; attribution." % MONO,
    ]))
    s.append(p("NICE TO HAVE  ·  CAN COME LATER", SECTION))
    s.append(bullets([
        "Outcome feedback webhook (page 6) for closed-loop attribution.",
        "Higher-frequency delta sync than daily, if Katitas&rsquo;s "
        "infrastructure supports it and Japanoma&rsquo;s match volume justifies it.",
        "Additional fields beyond the schema (e.g. floor plan image, internal "
        "quality score) if Katitas considers them safe to share.",
    ]))
    s.append(callout(
        "One-line summary",
        "Confirm page 2 (access method), confirm pages 3&ndash;4 (schema), "
        "confirm page 7 (auth) and name a technical contact. Japanoma is ready "
        "to build against a sandbox within one week of that confirmation.",
    ))

    return s


def _count_pages():
    """Two-pass build: first pass to count pages, second to render footers."""
    global TOTAL_PAGES
    from reportlab.platypus import SimpleDocTemplate
    tmp = SimpleDocTemplate("/tmp/_katitas_count.pdf", pagesize=A4,
                            leftMargin=MARGIN_L, rightMargin=MARGIN_R,
                            topMargin=MARGIN_T, bottomMargin=MARGIN_B)
    tmp.build(build_story())
    TOTAL_PAGES = tmp.page


def main():
    _count_pages()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT_PATH), pagesize=A4,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B,
        title="Japanoma — Katitas Technical Spec",
        author="Craefto for Go&C Partners",
    )
    frame = Frame(MARGIN_L, MARGIN_B, PAGE_W - MARGIN_L - MARGIN_R,
                  PAGE_H - MARGIN_T - MARGIN_B, id="main",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="every", frames=[frame],
                                       onPage=every_page)])
    doc.build(build_story())
    print(f"Wrote {OUTPUT_PATH} ({TOTAL_PAGES} pages)")


if __name__ == "__main__":
    main()
