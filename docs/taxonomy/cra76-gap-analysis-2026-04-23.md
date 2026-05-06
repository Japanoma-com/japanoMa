# CRA-76 Taxonomy Gap Analysis — 2026-04-23

Source of truth: **`Japanoma Taxonomy CRA76 updated version latest.xlsx`** (Kaz, Mar 2026).
Compared against: prod DB at `dfbyywvogeaxrxsriahp` as of 2026-04-23.

---

## TL;DR

| Dimension | Status | Action |
|---|---|---|
| Property Types | ✅ aligned (12 / 12) | none |
| Property Conditions | ✅ aligned (5 / 5) | none |
| Use Cases | ✅ aligned (11 / 11) | none |
| Design Styles | ✅ aligned (8 / 8) | none |
| Price Ranges | ✅ aligned (7 / 7) | none |
| Renovation Features | ✅ aligned (36 / 36) | none |
| Geographic Hierarchy | ⚠️ drift | migration 013 (5 adds + 17 priority flips + 29 enriched rows) |
| **City enrichment fields** | ❌ missing in schema | **migration 012** (5 AU flight-time columns + avg price + off-season score) |
| **Land & Building Details** | ❌ missing entirely | **migration 012** (new `land_building_details` table, 41 rows) |

**Net position:** The content taxonomies (quiz-logic dimensions) are fully aligned — no migration work there. The geographic layer has drifted: Kaz has promoted 17 cities to P1 Launch and introduced three new enrichment metrics per city that drive the Areas UI but have no home in the schema yet. Land & Building Details is a net-new dimension with 41 definitions, used on listing detail pages (not quiz logic).

---

## 1. Geographic hierarchy

### 1a. City adds (5 new cities in xlsx, not in DB)

| Prefecture | City | Priority |
|---|---|---|
| Nagano | Yamanouchi | P1 — Launch |
| Niigata | Yuzawa | P1 — Launch |
| Hokkaido | Higashikawa | P1 — Launch |
| Hokkaido | Sapporo | P1 — Launch |
| Hokkaido | Yubari | P1 — Launch |

*Note: DB currently has `nagano/yamanochi` — likely a slug typo. Kaz's xlsx uses the correct `yamanouchi`. Migration 013 renames the existing row so save/lead history is preserved.*

### 1b. Priority flips (17 cities upgraded)

Kaz has moved these from P2/P3/out_of_scope up to P1 Launch, signaling the intended MVP market is broader than the initial seed assumed.

| Prefecture | City | Old | New |
|---|---|---|---|
| Hokkaido | Furano | out_of_scope | P2 |
| Hokkaido | Asahikawa | P2 | P1 |
| Hokkaido | Otaru | P2 | P1 |
| Gunma | Minakami, Numata | P3 | P1 |
| Tochigi | Nasushiobara | P3 | P1 |
| Fukushima | Inawashiro | P3 | P1 |
| Miyagi | Shiroishi | P3 | P1 |
| Yamagata | Yamagata, Nishikawa, Tsuruoka | P2 | P1 |
| Iwate | Kitakami, Hanamaki | P3 | P1 |
| Iwate | Hachimantai | P2 | P1 |
| Akita | Semboku, Kita-Akita | P3 | P1 |
| Aomori | Aomori | P2 | P1 |

### 1c. Enrichment fields (new — 29 P1 cities have data)

Kaz added five new per-city attributes that are visible to AU buyers on Area pages but have no schema home. Adding in migration 012:

| Column | Type | Purpose |
|---|---|---|
| `time_from_sydney` | text (HH:MM) | Door-to-door travel time for AU buyer targeting |
| `time_from_melbourne` | text | ” |
| `time_from_brisbane` | text | ” |
| `time_from_perth` | text | ” |
| `time_from_adelaide` | text | ” |
| `avg_property_price_jpy` | bigint | Market anchor for area pages + compare |
| `off_season_activities_score` | int (0-10) | Year-round appeal — differentiates pure-ski from lifestyle areas |

---

## 2. Land & Building Details — new dimension

Kaz introduced a **non-quiz-logic** taxonomy (41 entries) that describes physical / legal attributes of individual listings. Unlike Property Type / Use Case / Design Style (which drive the quiz), these sit on each listing as informational chips.

| Category | Examples |
|---|---|
| Structure Type | Wooden, Steel-framed, RC, SRC, CB |
| Stories & Styles | Single-story, 2-story, 3-story, With basement, High/Mid/Low-rise, With loft |
| Land Rights | Freehold, Leasehold |
| Land Category | Residential, Farmland/Forest |
| Land-use zoning | Category 1 Low-Rise Exclusive, Commercial, Industrial |
| Urban Planning | Urbanization Area, Urbanization Control Area |
| Building Ratio | Coverage / Floor Area Ratio |
| Year Built | Year Built / Construction Date (pre-1981 flag) |
| Renovation History | Interior / Exterior renovation log |
| Road Access | Corner lot, Single-side access, Public/Private road |
| Setback | Required / Not required |
| Current status | Vacant, Occupied, Abandoned |
| Handover Date | Immediate, Future |
| Warranty | Yes / No |
| Minpaku-zoning | Short-term rental permitted |
| Sewage | Septic tank, Holding tank |

**Schema:** new `land_building_details` table with (slug, category, name_en, name_ja, description, sort_order, status). Migration 012 creates the table and seeds all 41 rows.

---

## 3. UI impact — what the new data needs on the front end

These don't have to happen in a single commit; listed here so the work can be staged.

| Surface | Change | Priority |
|---|---|---|
| `/areas/[prefecture]/[city]` | New "For Australian buyers" block showing flight time from each capital + avg price anchor + off-season score | P1 — unblocks Go&C's primary AU audience differentiator |
| `/areas` index | Sort / filter by priority level — move P1 Launch up, de-emphasize P3/P4 in the default grid | P1 |
| Quiz results | Now that budget and area mapping are complete, the scoring can weight by avg_property_price_jpy vs. user's selected bracket | P2 |
| Listing detail pages | (future, when listings ship) render `land_building_details` as structured chips grouped by category | P3 |
| Compare page | Show avg price + off-season score side by side across up to 3 areas | P2 |
| Admin | `/admin/insights` already surfaces area demand; consider adding "Average price achieved" stat per area once lead data maps to listings | P3 |

---

## 4. Recommended sequencing

1. **Migration 012 (schema)** — add the 7 city columns + create `land_building_details` table. Applied via Supabase MCP.
2. **Migration 013 (data)** — apply the 5 adds, 17 priority flips, populate enrichment columns on the 29 P1 cities, seed 41 Land & Building Detail rows.
3. **Drizzle schema update** — mirror both migrations in `src/lib/db/schema.ts`.
4. **Areas page enrichment UI** — add the "For Australian buyers" block referencing the new columns.
5. **Admin dashboard** — surface the new signal on `/admin/insights` (avg price deviation per area).

Steps 1–3 land in this commit. UI work (steps 4–5) tracked as follow-ups.
