# PrintPro website

Quick static marketing site for PrintPro (Chaiyaboon Brothers Group's merchandise
production / brand OEM division). No build step, no dependencies — plain HTML/CSS/JS,
so it works as-is on GitHub Pages, Netlify, Vercel, or any static host.

## Language

Site copy is in **Thai** (`<html lang="th">`) — PrintPro's target audience is Thai.
Print-technology terms stay in English by design (DTG, Sublimation, Screen Print,
Embroidery, Kornit, Brother GTX, DGI, plus certification names like REACH/RoHS/EN71/
ZDHC/ECO TEX and material terms like rPET), since those are the terms buyers and the
industry actually use, even in Thai conversation. Everything else — nav, hero, section
copy, product captions, chip lists — is Thai.

Font stack now leads with **Noto Sans Thai** (loaded from Google Fonts alongside Inter,
see the `<link>` in `index.html`'s `<head>`) so Thai glyphs render properly — Inter alone
has no Thai character support. `--font` in `styles.css` was updated to
`'Noto Sans Thai', 'Inter', ...`. Screenshot-checked at desktop width: headings, nav, and
card grids all hold their layout fine with the Thai copy (Thai runs a bit longer than the
English original in a few spots, e.g. the hero subhead, but nothing overflows or breaks).

To revert a section to English or tweak a translation, just edit the visible text in
`index.html` — nothing else needs to change. `alt` attributes on images were left in
English (not user-facing, doesn't affect rendering).

## Files

- `index.html` — the whole site (single page, anchor-linked sections)
- `styles.css` — all styling, brand tokens defined at the top as CSS variables
- `script.js` — mobile nav, header scroll state, hero cursor spotlight, animated stat
  counters, and GSAP ScrollTrigger scroll-reveals
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

## Floating product cloud (`#float-cloud`)

New section right after the hero/marquee. **Redesigned in round 2** after feedback that
the first version (six white-matted cards, scattered and rotated like a pile of
polaroids) looked "not professional" and "funny." Rebuilt to match a reference
Sentry-style SaaS landing animation instead: fewer elements, a clear size hierarchy, no
rotation, edge-to-edge glass-style cards, and a soft radial glow behind everything.

Current design:
- **4 cards, not 6** — one large focal card (`.float-card--lg`, the basketball shorts),
  two medium supporting cards (`.float-card--md`), one small accent card
  (`.float-card--sm`). Mirrors the reference video's "one big shape + supporting
  elements" composition instead of a crowded scatter.
- **No rotation.** The old `--rot` custom property (tilt between -11deg/+10deg) is gone
  entirely — cards sit straight, which reads as far more premium/intentional.
- **Glass-style cards**, not white polaroid mats: `border-radius:16px`, a subtle
  `rgba(255,255,255,0.14)` border, `rgba(255,255,255,0.04)` fill, and a soft dark drop
  shadow — the photo fills the card edge-to-edge instead of sitting in a white frame.
- **`.float-glow`** — a new absolutely-positioned layer behind the cards with two purple
  radial gradients, echoing the vignette/glow background from the reference video.
- Idle bob is still pure CSS (`@keyframes floatBob`, translateY only now — no rotation
  in the keyframe either) on the inner `.float-card-bob`, so it still runs with no JS.
  Cursor-parallax still lives on the outer `.float-card` via `gsap.quickTo`, kept on a
  separate element from the bob for the same reason as before (GSAP and a CSS animation
  can't both drive one element's `transform`).
- Parallax amplitude was toned down (`relX * 32 * depth` / `relY * 22 * depth`, was
  `50`/`36`) for a subtler drift instead of an obvious swing.
- Cursor-follow only activates on hover-capable devices with GSAP loaded (checked in
  `script.js`); everywhere else the cards still bob in place.
- On narrow screens (≤900px) it switches to a horizontal-scrolling shelf of the same
  cards (see the `.float-canvas` override in the `@media (max-width: 900px)` block in
  `styles.css`), unaffected by this redesign.
- Swap which products appear by editing the four `.float-card` blocks in `index.html`
  (`top`/`left` inline styles position them; `float-card--lg/--md/--sm` sets the size).

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
- Contact email in the footer/CTA (`hello@printpro.co.th`) — replace with the real inbox
- No real product photography is used (the source deck's tiles were gradient
  placeholders, not real photos) — swap in real shots when available, the
  `.category-card` / product grid markup is ready for images

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
