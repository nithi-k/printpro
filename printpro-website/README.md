# PrintPro website

Quick static marketing site for PrintPro (Chaiyaboon Brothers Group's merchandise
production / brand OEM division). No build step, no dependencies — plain HTML/CSS/JS,
so it works as-is on GitHub Pages, Netlify, Vercel, or any static host.

## Language / localization

Site defaults to **Thai** (PrintPro's target audience), with a **TH / EN switch** in the
header — this is a real i18n setup now, not just hardcoded Thai text, so adding a third
language later is a JSON file, not a rewrite.

How it works:
- `locales/th.json` and `locales/en.json` hold every translatable string, keyed by
  section (e.g. `hero.sub`, `apparel.chip3`, `sustainability.card2Body`). Both files
  currently have the exact same set of keys — swap or add values there, nothing else
  needs to change.
- Every translatable element in `index.html` carries `data-i18n="that.key"`. The Thai
  string also sits inline in the HTML as the default/fallback (so the page still reads
  correctly even if JS or the fetch fails — same graceful-degradation approach as the
  rest of the site).
- `i18n.js` (new file, loaded before `script.js`) reads the `?lang=` URL param or a
  saved `localStorage` preference (falls back to Thai), fetches the matching
  `locales/<lang>.json`, and writes each value into its `data-i18n` element —
  `innerHTML` by default (several keys contain `<br/>`/`<strong>` markup), or a specific
  attribute when the element also has `data-i18n-attr="content"` / `"aria-label"` (used
  for the `<meta name="description">` tag and the mobile nav toggle's label).
- The `.lang-switch` TH/EN buttons in the header (`index.html`, styled in `styles.css`)
  call `i18n.js`'s switcher and persist the choice in `localStorage`.
- **Not translated on purpose:** the brand wordmark/H1 ("All in One / Merch Solution.")
  and the print-technology terms (DTG, Sublimation, Screen Print, Embroidery, Kornit,
  Brother GTX, DGI, REACH/RoHS/EN71/ZDHC/ECO TEX, rPET) stay in English in both locale
  files — those are the terms the industry and buyers actually use, in Thai conversation
  too. `alt` attributes on images were also left in English (not user-facing).

**Adding a language:** copy `locales/en.json` to e.g. `locales/id.json`, translate the
values (keep every key identical), add `'id'` to `SUPPORTED_LANGS` in `i18n.js`, and add
a `<button data-lang="id">ID</button>` to `.lang-switch` in `index.html`. Then run
`python3 scripts/embed-locales.py` once so the new language also works from a
double-clicked file (see below) — that's the whole change, no other file needs to know a
new language exists.

**Works from a plain double-click, no server needed.** Browsers block `fetch()` from
reading local files when a page is opened directly via `file://` (this is what caused the
switch to silently do nothing the first time around — clicking EN would fail to fetch
`locales/en.json` and just give up). Fixed now with a fallback: `i18n.js` tries
`fetch('locales/<lang>.json')` first (the live source of truth, always used wherever the
site is actually hosted — GitHub Pages, Netlify, a local `python3 -m http.server`, etc.,
and it always reflects the latest edits to the JSON files with zero extra steps there),
and if that fails, it falls back to a bundled snapshot of the same data sitting inline in
`index.html` (`<script type="application/json" id="i18n-embedded-th/en">`, near the
closing `</body>`) — so the language switch also works immediately when the file is just
double-clicked, with no server at all.

Those embedded blocks are a **generated snapshot**, not something to hand-edit. If you
edit `locales/th.json` or `locales/en.json`, refresh them with:

```bash
python3 scripts/embed-locales.py
```

This is optional in the sense that it only affects the file://-preview path — anywhere
the site is actually hosted over http(s), `fetch()` succeeds and reads `locales/*.json`
directly, live, so the embedded snapshot is never even used there. But it's a good habit
to run it after every translation edit anyway, so a quick local double-click check always
shows the current copy too.

Font stack leads with **Noto Sans Thai** (loaded from Google Fonts alongside Inter, see
the `<link>` in `index.html`'s `<head>`) so Thai glyphs render properly — Inter alone has
no Thai character support. `--font` in `styles.css` is
`'Noto Sans Thai', 'Inter', ...`. Screenshot-checked at desktop width in both languages:
headings, nav, and card grids hold their layout fine (Thai runs a little longer than
English in a few spots, e.g. the hero subhead, but nothing overflows or breaks).

## Files

- `index.html` — the whole site (single page, anchor-linked sections)
- `styles.css` — all styling, brand tokens defined at the top as CSS variables
- `script.js` — mobile nav, header scroll state, hero cursor spotlight, animated stat
  counters, and GSAP ScrollTrigger scroll-reveals
- `i18n.js` — localization loader (TH/EN switch); see "Language / localization" above
- `locales/th.json`, `locales/en.json` — the actual translated strings
- `scripts/embed-locales.py` — regenerates the file://-fallback snapshot embedded in
  `index.html` from `locales/*.json`; run after editing translations (optional, see above)
- `assets/` — logo exports pulled from `PRINTPRO_ALL_IN_ONE_MERCH_SOLUTION.ai`:
  - `printpro-logo-isolated.png` — background keyed transparent, for use on dark sections (nav/footer)
  - `printpro-logo-boxed.png` — original lockup with its dark backing, works on any background
  - `favicon-256.png` — favicon
- `assets/products/` — 13 real exhibition sample photos (supplied by Nic), resized/
  compressed for web (originals were 1.5–3.5MB each, ~28MB total; these are ~45–250KB
  each, ~1.35MB total). Shown in the new `#showcase` section.

## Motion / "cool factor" layer

Added after the "make it feel like insomniacshop.com" request — same no-build-step
philosophy, just with an energy layer on top:

- **GSAP + ScrollTrigger**, loaded via CDN (`cdnjs.cloudflare.com`) in `index.html`.
  Everything degrades gracefully — if the CDN fails to load (offline, ad-blocker, whatever),
  content stays fully visible (see `.reveal` in `styles.css`: it defaults to visible and
  only animates in if JS successfully adds `.js-reveal-ready` to `<body>`).
- Scrolling marquee ticker (pure CSS keyframes, no JS) under the hero.
- Hero cursor-follow spotlight glow, animated hero entrance, scroll-triggered card
  reveals, and count-up animation on the stat numbers (70+, 2024).
- Hover glow/lift on all card grids, a gradient hero headline, and a punchier
  `--glow: #7B2FFF` accent used **only** for motion/glow effects — not a change to the
  brand's primary purple (`--purple: #7452A2` is untouched). See the note in
  `styles.css` at the `:root` block.
- Scope note: this stays a showcase/lead-gen site (bold visuals, motion, energy) — not
  an e-commerce build. insomniacshop.com is a full Shopify store with cart/checkout;
  PrintPro sells production services to brands/festivals, not products direct to
  consumers, so cart/checkout was deliberately left out. Say the word if that should
  change.

## Hero photo

The hero is now a full-bleed photo (`assets/hero/artist-photoshoot.jpg`, supplied by
Nic) rather than a flat gradient — a real on-location shoot of an artist collaborator
wearing a PrintPro-printed tee, for credibility. Layered dark gradients (in
`.hero` in `styles.css`) keep the headline legible against the photo; the cursor
spotlight and grain effects from the motion-layer update still run on top.

**Placeholder:** the bottom-right credit line currently reads "On location, Bangkok ·
PrintPro print worn by our artist collaborator" — swap in the artist's actual name once
confirmed (find `.hero-credit` in `index.html`).

## Product sections (`#produce` / `#apparel` / `#headwear` / `#others`)

"What We Produce" is now four sections instead of one: a short intro with jump links,
then a dedicated section per category —

- **Apparel** (`#apparel`, dark, photo grid) — 6 real photos mapped to actual SKU names
  where they match (Washed T-Shirt, Basketball Jersey, Basketball Shorts, etc.), plus
  the remaining SKUs as chips.
- **Headwear** (`#headwear`, light, split layout) — only one real photo exists (the
  embroidered dad cap) so it gets a featured large-photo treatment beside the text
  instead of a sparse grid; remaining SKUs as chips.
- **Others** (`#others`, dark, photo grid) — absorbed what used to be a separate
  "Showcase" section. This is where the "any object that can be screened becomes merch"
  point lives (umbrella, cooler, tumbler, flip-flops, lanyards, packaging — none of
  which are in the original 17-item accessories list, which is the point), plus the
  original accessories SKUs as chips.

Swap or add photos by dropping compressed images into `assets/products/` and adding a
`.showcase-item` `<figure>` (grid sections) or updating `.headwear-photo` (headwear).

## Content source

Copy is drawn from `PrintPro_Tomorrowland_Proposal.pptx` (story, ecosystem, product
range, print methods, sustainability, why-PrintPro). The "39 SKUs" figure and category
counts (13 apparel / 9 headwear / 17 accessories) come straight from that deck.

**Placeholders to fill in before this goes fully live:**
- Contact email in the CTA is `printpro@chaiyaboon.com` (find it in the `#contact`
  section of `index.html` if it ever needs to change again)

## Brand color note

This build uses the logo's actual colors (`--purple: #7452A2`, `--ink: #231F20`) rather
than the brighter violet (`#7B2FFF`) used in the Tomorrowland proposal deck — the two
source files don't currently agree on a canonical purple. See the `brand/printpro-brand-guide.md`
doc in the Claude Project for the open decision. Swap the CSS variables at the top of
`styles.css` if the canonical color is decided differently.

## Push to GitHub

From inside your local clone of `github.com/nithi-k/printpro`:

```bash
# copy these files into the repo root (or a subfolder if you prefer), then:
git add -A
git commit -m "Add PrintPro marketing site"
git push origin main   # or your default branch name
```

## Optional: GitHub Pages

Repo → Settings → Pages → Deploy from branch → `main` / root. No build step needed.
