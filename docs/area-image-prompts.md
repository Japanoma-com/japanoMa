# Area hero images — AI generation prompts

One high-quality editorial hero image per P1 launch area. All 33 cities listed below.

**Target dimensions:** 1600 × 900 (16:9). Export as AVIF; JPG fallback.
**Save path:** `/public/areas/<slug>.avif` where `<slug>` is listed per entry.
**DB wiring:** After saving, `UPDATE cities SET hero_image_path = '/areas/<slug>.avif' WHERE slug = '<slug>';`

---

## House style — use for every prompt

These lines are identical across every area so the set reads as one cohesive editorial. Prepend or append to every per-area prompt below.

```
editorial travel photography, northern Japan snow country, winter or early spring,
muted Japandi palette — desaturated 12%, warm-shifted highlights, soft atmospheric haze,
wide cinematic composition with generous negative space, no people in foreground,
no text, no watermark, no vehicles, no modern signage, no stock-photo tropes,
shot on medium format film (Mamiya 7 or Hasselblad 500c/m), slight grain,
style reference: Rinko Kawauchi · Michael Kenna · travel essays in Kinfolk or Monocle,
aspect ratio 16:9, 1600×900
```

**Negative prompt (Flux, SDXL, Midjourney `--no`):**
`text, watermark, logo, tourists, crowds, blurry, oversaturated, cartoon, 3d render, plastic, glossy, stock photo, cliche, posed, selfie, red sunset, neon, harsh flash`

**Models that work well:** Flux 1.1 Pro Ultra (best for photoreal), Midjourney v7 (`--style raw --ar 16:9`), Imagen 4 Ultra, Ideogram 3, Nano Banana for refinements.

---

## Hokkaido — 5 areas

### 1. Asahikawa — `asahikawa`
> Wide quiet dawn across the **Kamui Ski Links** basin, snow-laden birch and cedar fringing a frozen river bend, distant snow-ridged mountains veiled in blue hour light, a single traditional Hokkaido farmhouse with tin roof catching the first pink, no figures, cold grey sky with one soft opening of warmth.

### 2. Higashikawa — `higashikawa`
> The broad **Daisetsuzan** horizon behind a rural Hokkaido hamlet at first snow, low wooden houses with deep eaves and stacked firewood, a lone cedar avenue leading toward the whitened peaks, pale amber dawn washing across powder fields, stillness.

### 3. Otaru — `otaru`
> A medium-format winter shot of the historic **Otaru canal** under heavy snow, stone warehouses reflecting gas-lamp light in the still water, soft fall of snowflakes, empty cobbled promenade, aged brick and timber palette, quiet blue evening, nobody in frame.

### 4. Sapporo — `sapporo`
> Minimal composition of a snow-blanketed **Sapporo Teine** ridgeline above a foggy valley of city lights far below, pre-dawn twilight with cool violet sky, a single pine cluster in foreground etched by rime ice, calm and monumental.

### 5. Yubari — `yubari`
> Weathered rural main street in a **Yubari** mountain town buried in fresh snowfall, closed wooden storefronts with aged kanji signage, a distant freight track running along the slope, soft snow-diffused daylight, atmosphere of beautiful decline — old coal-town bones, quietly dignified.

---

## Nagano — 7 areas

### 6. Iiyama — `iiyama`
> An overhead-mid perspective of the **Madarao Mountain** treeline at dawn, terraced rice paddies below the ski run fully snowed, traditional thatched-roof farmhouses half-buried, river fog drifting low, gentle gold on far ridges, quietly grand, Japanese alpine corridor.

### 7. Iizuna — `iizuna`
> Deep powder at the base of **Iizuna ski area** at late afternoon, old larch forest in foreground with rime-frosted branches, distant Togakushi range etched in alpenglow, a narrow unploughed country road vanishing into the pines, no tracks, no people.

### 8. Kijimadaira — `kijimadaira`
> A small Japanese rural ski village seen from an upper slope — **Kijimadaira** — dozens of low wooden houses with steep snow roofs below, terraced apple orchards asleep under white, faint blue-grey morning haze, Mount Shiga Kogen in the far distance, serene.

### 9. Nakano — `nakano`
> A single black iron **torii** gate standing in fresh snow at the edge of a Nakano cedar grove, mountain mist beyond, the **Shiga Kogen** range suggested in the gauze, cold palette with a single warm glow from a shrine lantern, deeply contemplative.

### 10. Shinano — `shinano`
> The frosted black mass of **Mt. Kurohime** rising behind a rural Shinano farmstead at golden first light, cedar forest coated in fresh snow, a frozen pond reflecting the orange-pink sky, traditional *irori* smoke curling from one chimney, cinematic stillness.

### 11. Yamanouchi — `yamanouchi`
> A hidden wooden bathhouse steaming against a wall of snow in **Yudanaka Onsen** village below **Shiga Kogen**, lantern light on stone path, soft falling snow, indigo-blue night yielding to dawn, atmosphere of warmth inside cold, no figures.

---

## Niigata — 7 areas

### 13. Agano — `agano`
> The rising steam of **Mikawa Onsen** lifting off a river bend, low rural Niigata mountains coated in heavy snow, old wooden inn with paper lanterns just glowing, overcast soft light, muted sepia and cedar palette, intimate scale.

### 14. Gosen — `gosen`
> Long shot across a frozen paddy valley toward the **Fuyudorigoe Ski Garden** slopes, a traditional minka with snow-heavy roof alone in foreground, mountain fog pulling apart at mid-morning, cold blue transitioning to amber on distant peaks.

### 15. Minamiuonuma — `minamiuonuma`
> Wide editorial of **Naeba** or **Kagura** deep-powder backcountry, layered sub-ranges in pale violet distance, snow-ghost forest of laden pines in foreground, a single curl of cloud over a ridgeline, late afternoon blue hour, monumental quiet.

### 16. Myoko — `myoko`
> The **Mt. Myoko** twin volcanic peaks reflected in a partially frozen onsen pool at dawn, black cedar silhouettes framing, a thin mist rising, soft salmon light catching snow faces of the peaks, traditional bath stones in foreground, absolute stillness.

### 17. Shibata — `shibata`
> Rural Niigata plain under early winter snow, Shibata's **Nixon Snow Park** ridgeline distant, a lone black pine on a low hill at foreground, smoke from a farmhouse chimney rising straight, overcast pearl sky, editorial calm.

### 18. Uonuma — `uonuma`
> The **Muikamachi Hakkaisan** ridgeline seen through a curtain of falling snow, foreground of sagging powder-loaded spruce, a narrow village road winding toward base lodge lights, deep blue winter twilight, pure powder country.

### 19. Yuzawa — `yuzawa`
> A high aerial-style view of **Gala Yuzawa** base village from above the gondola line, roofs and rails softened by fresh snow, the old onsen district's steam plumes catching golden hour, far mountains fading in haze, editorial, reportage quality.

---

## Gunma — 2 areas

### 20. Minakami — `minakami`
> **Tambara Ski Park** plateau at sunrise, wide corduroy meadows of untouched powder catching pink-gold light, ancient dwarf pine in foreground, the Tanigawa range etched sharply against a clear cold sky, one small wooden patroller's hut in mid-distance.

### 21. Numata — `numata`
> Aerial-feel wide of the **Numata** basin, terraced ryokan rooftops buried in snow below, the **Naeba** ridgeline as a back wall in haze, a single red vermilion shrine gate vertical in the foreground composition, muted and reverent.

---

## Tochigi — 1 area

### 22. Nasushiobara — `nasushiobara`
> The **Hunter Mountain Shiobara** peak framed by stark black branches in deep winter, dense cedar forest cascading downslope, a traditional Tochigi farmhouse with red-orange persimmons still hanging on a bare tree at foreground, surreal contrast of warm fruit against pure white ground.

---

## Fukushima — 1 area

### 23. Inawashiro — `inawashiro`
> Dawn on **Lake Inawashiro** half-frozen, **Mt. Bandai** rising white-coated in the background, a single abandoned pier jutting into the lake ice, soft mauve and warm-grey palette, moody silence, perfect Japanese travel-essay feel.

---

## Miyagi — 1 area

### 24. Shiroishi — `shiroishi`
> The historic **Shiroishi Castle** wall in winter viewed from below — dark stone, white snow, black crows in flight, the distant **Miyagi Zao Shichikashuku** peak as a soft white wedge, cold dawn blue with a single copper shaft of light breaking through clouds.

---

## Yamagata — 3 areas

### 25. Yamagata — `yamagata`
> Iconic **Zao Onsen** juhyō — the snow monsters — at late afternoon, massive rime-ice trees glowing blue-white, a single wooden ski patrol hut half buried, sky shifting from deep violet to amber, otherworldly, editorial but genuine.

### 26. Nishikawa — `nishikawa`
> A wide low-angle of **Mt. Gassan** in late-spring snow with the first sprouts of green lacquer moss in foreground, empty mountain road curving toward the silent **Gassan Ski Resort** gondola, mystical pilgrimage feel, grey-green and white.

### 27. Tsuruoka — `tsuruoka`
> The cedar colonnade leading up to **Mt. Yudono Shrine** draped in heavy fresh snow, stone lantern path dusted pure white, diffuse cathedral-like light through snow-laden branches, sacred and hushed, no visitors visible.

---

## Iwate — 3 areas

### 28. Hachimantai — `hachimantai`
> Wide **Appi Kogen** ridge at blue hour, steam rising from a hidden hot spring in the middle-ground, concentric wind-etched snow waves on an open plateau, single ancient Japanese zelkova tree on the ridge in silhouette, Tohoku severity and beauty.

### 29. Hanamaki — `hanamaki`
> A small rural Iwate road passing through fields of snow, the **Namari Onsen** ryokan rooftops just visible between leafless poplars, a single red bridge railing crossing a frozen creek, warm golden-hour Tohoku light, quiet, unhurried.

### 30. Kitakami — `kitakami`
> The deep powder of **Geto Kogen Resort** in full mid-winter — known for record snowfall — towering conifers sagging under white, a single empty chairlift tower cable disappearing into fog, muted and massive, hushed.

---

## Akita — 2 areas

### 31. Kita-Akita — `kita-akita`
> **Mt. Moriyoshi** at dawn seen across silent rice fields of Kita-Akita, a traditional thatched-roof *magariya* farmhouse in foreground, deep snow piled against walls, soft warm kitchen light escaping through a single shoji window, cold pink sky, Tohoku intimacy.

### 32. Semboku — `semboku`
> A wide cinematic of **Lake Tazawa** at the **Tazawako Ski Resort** base area, the deep cobalt lake not yet frozen reflecting a snow-painted shoreline, samurai district rooftops in Kakunodate visible in far distance, layered composition.

---

## Aomori — 1 area

### 33. Aomori — `aomori`
> The famed **Hakkoda** ghost-forest at late afternoon — massive rime-encased trees in flowing organic shapes, a single patroller's wooden hut barely visible, low violet sun, intense drifting powder hazing the air, otherworldly Tohoku winter spectacle.

---

## Workflow — from prompt to prod

1. **Generate** — paste prompt into your model of choice. For each area, generate 3–4 variations and pick the strongest.
2. **Process** — downsize to 1600×900, export AVIF (quality 65) + JPG fallback (quality 80).
3. **Save** — `/public/areas/<slug>.avif` (and `.jpg` if needed).
4. **Wire to DB** — once images are in place, run:

   ```sql
   UPDATE cities SET hero_image_path = '/areas/' || slug || '.avif' WHERE launch_priority = 'P1';
   ```

   The Areas directory card auto-switches from the kanji backdrop fallback to the photography treatment as soon as `hero_image_path` is populated.

5. **Fallback** — if any image is missing or 404s, the card still renders — just with the kanji backdrop.

---

## Optional: hero image on the detail page

The detail page (`/areas/[prefecture]/[city]`) doesn't yet render `hero_image_path`. Once images land and look good on the directory, we can extend the detail page with a full-bleed hero block (`w-full h-[60vh] bg-cover` with editorial treatment). Easy follow-up; flagged here so it's not forgotten.
