# The Cloister NYC — Spec

A static portfolio mockup site for **The Cloister**, a fictional NYC hostel
concept by Margaux Boudreaux, BFA Interior Design '26, University of Louisiana
at Lafayette. Single-page editorial scroll-site, no build step, deployable to
GitHub Pages.

## Concept (one paragraph for designers, longer in copy)

The Cloister is a 60-bed transient hostel in Lower Manhattan that fuses three
typologies:
1. **Ace Hotel** — the lobby-as-living-room, secondhand warmth, materials with
   wear, a working bar, layered textile and wood.
2. **The Catholic Church** — load-bearing masonry, vaulted ceilings, axial
   symmetry, lime-washed walls, oak pews, brass fittings, candle-grade lighting,
   a quiet room (the "chapel") with no programmed function.
3. **The Hostel** — shared sleep, shared cooking, shared washing, communal
   tables long enough to seat twelve strangers, $55–$75 a bed.

Built from quarried limestone, mass timber, lime plaster, terrazzo, and brass —
materials that improve with patina and can be repaired by any tradesperson in
any century. Programmed for the young traveler. Designed to outlast all of us.

## Brand

- **Name:** The Cloister
- **Tagline:** "A monastic hostel for New York."
- **Designer credit:** Margaux Boudreaux · BFA Interior Design 2026 ·
  University of Louisiana at Lafayette
- **Site URL slug:** `cloister-nyc`

## Visual language

Editorial / monastic / warm. Reference: Ace Hotel print collateral, Aman
brochures, Apartamento magazine, Domino's "spreads" feel.

- **Background:** parchment / lime-washed (`#F2EBDD`)
- **Surface alt:** warm cream (`#E8DDC7`)
- **Ink:** near-black with warmth (`#1B1A17`)
- **Body text:** warm graphite (`#3B362E`)
- **Mute:** sandstone (`#8C8273`)
- **Hairline rule:** `#C9BEA8`
- **Accent — oxblood:** `#6B1F1A` (used VERY sparingly, drop-cap initials,
  active states, the hero "+")
- **Accent — brass:** `#A87A2C` (icons, secondary)
- **Accent — moss:** `#3F4A36` (rare, for the "chapel" / quiet section)

Typography (Google Fonts only — no licensed fonts):
- **Display serif:** `Cormorant Garamond` (300, 400, 500) — italic for
  blackletter-flavored headlines
- **Sans (UI / labels / nav):** `Inter` (400, 500, 600) tracked
  +0.08em uppercase for small caps
- **Body serif:** `Cardo` (400, 700, 400i) — for long reading
- **Mono (specs, dimensions):** `JetBrains Mono` (400) at 12px

Design moves to use:
- Drop caps on every section opener (oxblood, Cormorant 7rem)
- Ledger-style numbers (I., II., III.) at section headers — small caps Inter
- Hairline horizontal rules between sections — never box borders
- Marginalia: small caps notes in the left/right gutter (mono, 11px)
- A single "manuscript" red-line in the page margin at hero
- Image captions in italic Cardo with hairline rule above
- No box shadows. No rounded corners > 2px. Tight tracking. Generous leading.

## File list

```
index.html              Main scroll page
styles.css              All styling
app.js                  Tiny JS — nav scroll, lightbox, theme nothing else
data/program.json       Room types, sizes, prices, occupancy
data/materials.json     Materials matrix
data/code.json          NYC code compliance line items
images/hero.jpg         Hero atmospheric rendering
images/refectory.jpg    Long communal table rendering
images/dorm.jpg         8-bed cloister-bunk dorm
images/cell.jpg         Private 'cell' bedroom
images/chapel.jpg       Quiet room rendering
images/baths.jpg        Communal bath house
images/lobby.jpg        Lobby / Common House
images/stair.jpg        Main stair / atrium
images/exterior.jpg     Street view
images/material-*.jpg   (5-6) Material samples — limestone, oak, brass,
                                                      linen, terrazzo, lime plaster
drawings/floorplan.svg  Floor plan (typical floor)
drawings/section.svg    Building section
drawings/axon.svg       Cutaway axonometric
README.md               Repo readme
LICENSE                 MIT
```

## Page sections (top → bottom)

1. **Masthead** — site name, tagline, designer credit (small caps right-aligned)
2. **Hero** — full-bleed exterior rendering + overlaid title in Cormorant
   italic, oxblood "+" mark, manifest line in small caps below
3. **§ I. Manifesto** — three columns, one per influence (Hotel / Church /
   Hostel), drop cap each
4. **§ II. The Building** — 1000-year construction logic. 6-column grid of
   structural facts (load-bearing limestone, mass timber floors, lime mortar,
   brass plumbing, slate roof, oak everything else). Includes the section
   drawing SVG.
5. **§ III. Plan & Section** — Axonometric SVG centered, then floor plan SVG,
   then section SVG. Each with a long italic caption.
6. **§ IV. The Rooms** — programmatic gallery. 6 cards: Cloister Bunk, Cell,
   Suite, Refectory, Common House, Bath House. Each card opens a lightbox with
   image + description + size + price. Data from `program.json`.
7. **§ V. Materials** — palette grid. 6 swatches, each with material photo +
   spec block (origin, lifespan, repairability).
8. **§ VI. Code & Conscience** — NYC code compliance brief. Two-column
   editorial layout. Items from `code.json`. Mention: NYC Construction Code
   Chapter 3 occupancy classification (R-1 transient), Chapter 10 means of
   egress, Chapter 11 accessibility, Multiple Dwelling Law, Local Law 88
   (lighting/submetering), 2020 Energy Code, NYCHA fire safety. Honest about
   what would need a variance and why.
9. **§ VII. The Numbers** — pricing table + bed count breakdown. Mono.
10. **Colophon** — designer bio paragraph, university credit, set-in-type
    notice "set in Cormorant Garamond, Cardo, and Inter", year.

## Interactions (intentionally minimal)

- Smooth scroll to anchors from masthead nav
- Click any image → lightbox (full-bleed, ESC to close, click-outside to close)
- Hover state on room cards: hairline shifts from `#C9BEA8` → `#1B1A17`
- That's it. No theme toggle. No filters. No carousel. The page IS the artifact.

## Quality bar

- Zero console errors after load
- All images load (no broken refs)
- Lightbox traps focus, ESC closes
- Reads cleanly on mobile (single column < 768px)
- Prints cleanly (CSS print stylesheet — for the designer's portfolio PDF)
- Loads in < 1.5s on a fast connection (images compressed)
- Lint passes for HTML and CSS

## Tone of writing

Confident, elegiac, slightly old-fashioned. Aware of pretense without committing
it. Concrete (cite the actual NYC code section numbers). Never cute. Never
"ye olde". The brief is real — a designer would hand this to a client.
